import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  Attendance,
  AttendanceStatus,
} from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';
import { AttendanceRiskReview } from './entities/attendance-risk-review.entity';
import {
  AnalysisStatus,
  AttendanceRiskAssessment,
  ReviewDecision,
  RiskLevel,
} from './entities/attendance-risk-assessment.entity';
import { ListRiskAssessmentsDto } from './dto/list-risk-assessments.dto';

const FEATURE_VERSION = 'v1';
const MAX_TRAINING_ROWS = 2000;
const MAX_ATTEMPTS = 8;

export interface FraudFeatures extends Record<string, number> {
  seconds_from_event_start: number;
  distance_ratio: number;
  participant_checkins_24h: number;
  shared_device_accounts_30m: number;
}

interface ModelScore {
  anomaly_score: number;
  risk_level: RiskLevel;
  reasons: string[];
  model_version: string;
  feature_version: string;
  score_semantics: string;
}

@Injectable()
export class AiFraudService {
  constructor(
    @InjectRepository(AttendanceRiskAssessment)
    private readonly assessmentRepository: Repository<AttendanceRiskAssessment>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async list(dto: ListRiskAssessmentsDto) {
    const page = Math.max(Number(dto.page) || 1, 1);
    const limit = Math.min(Math.max(Number(dto.limit) || 20, 1), 100);
    const query = this.assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.attendance', 'attendance')
      .leftJoinAndSelect('attendance.event', 'event');

    if (dto.analysisStatus) {
      query.andWhere('assessment.analysisStatus = :analysisStatus', {
        analysisStatus: dto.analysisStatus,
      });
    }
    if (dto.riskLevel) {
      query.andWhere('assessment.riskLevel = :riskLevel', {
        riskLevel: dto.riskLevel,
      });
    }
    if (dto.reviewDecision) {
      query.andWhere('assessment.reviewDecision = :reviewDecision', {
        reviewDecision: dto.reviewDecision,
      });
    }
    if (dto.eventId) {
      query.andWhere('event.id = :eventId', { eventId: dto.eventId });
    }

    const [rows, total] = await query
      .orderBy('assessment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: rows.map((row) => ({
        id: row.id,
        analysisStatus: row.analysisStatus,
        anomalyScore: row.anomalyScore === null ? null : Number(row.anomalyScore),
        riskLevel: row.riskLevel,
        reasonCodes: row.reasonCodes ?? [],
        featureSnapshot: row.featureSnapshot,
        featureVersion: row.featureVersion,
        modelVersion: row.modelVersion,
        reviewDecision: row.reviewDecision,
        reviewNote: row.reviewNote,
        reviewedAt: row.reviewedAt,
        lastErrorCode: row.lastErrorCode,
        createdAt: row.createdAt,
        attendance: row.attendance
          ? {
              id: row.attendance.id,
              participantCode: row.attendance.participantCode,
              fullName: row.attendance.fullName,
              eventId: row.attendance.event?.id,
              eventTitle: row.attendance.event?.title,
              checkInTime: row.attendance.checkInTime,
              distance: Number(row.attendance.distance),
              status: row.attendance.status,
            }
          : null,
      })),
      total,
      page,
      limit,
    };
  }

  async review(
    assessmentId: string,
    reviewerId: string,
    decision: ReviewDecision,
    note?: string,
  ) {
    const [assessment, reviewer] = await Promise.all([
      this.assessmentRepository.findOne({ where: { id: assessmentId } }),
      this.userRepository.findOne({ where: { id: reviewerId } }),
    ]);
    if (!assessment) throw new NotFoundException('Risk assessment not found.');
    if (!reviewer) throw new NotFoundException('Reviewer not found.');

    await this.assessmentRepository.manager.transaction(async (manager) => {
      assessment.reviewDecision = decision;
      assessment.reviewNote = note?.trim() || null;
      assessment.reviewedBy = reviewer;
      assessment.reviewedAt = new Date();
      await manager.save(AttendanceRiskAssessment, assessment);
      await manager.save(
        AttendanceRiskReview,
        manager.create(AttendanceRiskReview, {
          assessment,
          reviewer,
          decision,
          note: note?.trim() || null,
        }),
      );
    });
    return {
      id: assessment.id,
      reviewDecision: assessment.reviewDecision,
      reviewNote: assessment.reviewNote,
      reviewedAt: assessment.reviewedAt,
    };
  }

  async modelStatus() {
    try {
      return await this.requestAi<{ status: string; model_ready: boolean }>(
        '/health',
        { method: 'GET' },
        false,
      );
    } catch {
      return { status: 'unavailable', model_ready: false };
    }
  }

  async trainBaseline() {
    const history = await this.attendanceRepository.find({
      relations: { event: true },
      where: [{ status: AttendanceStatus.PRESENT }, { status: AttendanceStatus.LATE }],
      order: { checkInTime: 'DESC' },
      take: MAX_TRAINING_ROWS,
    });
    if (history.length < 30) {
      throw new BadRequestException(
        'At least 30 accepted check-ins are needed to train the initial anomaly baseline.',
      );
    }

    const rows = this.buildTrainingFeatures(history);
    const trained = await this.requestAi<{
      model_version: string;
      training_rows: number;
      feature_version: string;
    }>(
      '/internal/v1/train',
      {
        method: 'POST',
        body: JSON.stringify({ rows, feature_version: FEATURE_VERSION }),
      },
    );
    await this.assessmentRepository
      .createQueryBuilder()
      .update(AttendanceRiskAssessment)
      .set({
        analysisStatus: AnalysisStatus.PENDING,
        attemptCount: 0,
        nextAttemptAt: null,
        lockedUntil: null,
        lastErrorCode: null,
      })
      .where('analysisStatus = :failed', { failed: AnalysisStatus.FAILED })
      .execute();
    return trained;
  }

  async claimNext(): Promise<AttendanceRiskAssessment | null> {
    const now = new Date();
    const candidate = await this.assessmentRepository
      .createQueryBuilder('assessment')
      .where('assessment.analysisStatus = :pending', {
        pending: AnalysisStatus.PENDING,
      })
      .orWhere(
        new Brackets((qb) => {
          qb.where('assessment.analysisStatus = :retry', {
            retry: AnalysisStatus.RETRY,
          }).andWhere('assessment.nextAttemptAt <= :now', { now });
        }),
      )
      .orWhere(
        new Brackets((qb) => {
          qb.where('assessment.analysisStatus = :processing', {
            processing: AnalysisStatus.PROCESSING,
          }).andWhere('assessment.lockedUntil <= :now', { now });
        }),
      )
      .orderBy('assessment.createdAt', 'ASC')
      .getOne();

    if (!candidate) return null;

    const claim = await this.assessmentRepository
      .createQueryBuilder()
      .update(AttendanceRiskAssessment)
      .set({
        analysisStatus: AnalysisStatus.PROCESSING,
        lockedUntil: new Date(now.getTime() + 60_000),
        attemptCount: () => '`attemptCount` + 1',
      })
      .where('id = :id', { id: candidate.id })
      .andWhere(
        new Brackets((qb) => {
          qb.where('analysisStatus = :pending', {
            pending: AnalysisStatus.PENDING,
          }).orWhere(
            new Brackets((retry) => {
              retry
                .where('analysisStatus = :retry', {
                  retry: AnalysisStatus.RETRY,
                })
                .andWhere('nextAttemptAt <= :now', { now });
            }),
          ).orWhere(
            new Brackets((processing) => {
              processing
                .where('analysisStatus = :processing', {
                  processing: AnalysisStatus.PROCESSING,
                })
                .andWhere('lockedUntil <= :now', { now });
            }),
          );
        }),
      )
      .execute();

    if (!claim.affected) return null;
    return this.assessmentRepository.findOne({
      where: { id: candidate.id },
      relations: { attendance: true },
    });
  }

  async scoreClaimed(assessment: AttendanceRiskAssessment) {
    const item = await this.attendanceRepository.findOne({
      where: { id: assessment.attendance?.id },
      relations: { event: true },
    });

    if (!item?.event) {
      await this.assessmentRepository.update(assessment.id, {
        analysisStatus: AnalysisStatus.FAILED,
        lastErrorCode: 'ATTENDANCE_NOT_FOUND',
        lockedUntil: null,
      });
      return;
    }

    const features = await this.buildCurrentFeatures(item);
    try {
      const result = await this.requestAi<ModelScore>('/internal/v1/score', {
        method: 'POST',
        body: JSON.stringify({ features, feature_version: FEATURE_VERSION }),
      });

      await this.assessmentRepository.update(assessment.id, {
        analysisStatus: AnalysisStatus.SCORED,
        anomalyScore: result.anomaly_score,
        riskLevel: result.risk_level,
        reasonCodes: result.reasons,
        featureSnapshot: features,
        featureVersion: result.feature_version,
        modelVersion: result.model_version,
        lastErrorCode: null,
        nextAttemptAt: null,
        lockedUntil: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI_SERVICE_ERROR';
      const attemptCount = assessment.attemptCount ?? 1;
      const terminal = attemptCount >= MAX_ATTEMPTS;
      const backoffSeconds = Math.min(60 * 2 ** Math.max(attemptCount - 1, 0), 3600);
      await this.assessmentRepository.update(assessment.id, {
        analysisStatus: terminal ? AnalysisStatus.FAILED : AnalysisStatus.RETRY,
        featureSnapshot: features,
        lastErrorCode: message.slice(0, 64),
        nextAttemptAt: terminal ? null : new Date(Date.now() + backoffSeconds * 1000),
        lockedUntil: null,
      });
    }
  }

  private async buildCurrentFeatures(attendance: Attendance): Promise<FraudFeatures> {
    const event = attendance.event;
    const checkedAt = new Date(attendance.checkInTime);
    const participantWindow = new Date(checkedAt.getTime() - 24 * 60 * 60 * 1000);
    const deviceWindow = new Date(checkedAt.getTime() - 30 * 60 * 1000);

    const participantCountPromise = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.participantCode = :participantCode', {
        participantCode: attendance.participantCode,
      })
      .andWhere('attendance.checkInTime >= :since', { since: participantWindow })
      .andWhere('attendance.checkInTime <= :until', { until: checkedAt })
      .getCount();

    const deviceAccountsPromise = attendance.device
      ? this.attendanceRepository
          .createQueryBuilder('attendance')
          .select('COUNT(DISTINCT attendance.participantCode)', 'count')
          .where('attendance.event_id = :eventId', { eventId: event.id })
          .andWhere('attendance.device = :device', { device: attendance.device })
          .andWhere('attendance.checkInTime >= :since', { since: deviceWindow })
          .andWhere('attendance.checkInTime <= :until', { until: checkedAt })
          .getRawOne<{ count: string }>()
      : Promise.resolve({ count: '1' });

    const [participantCheckins, deviceAccounts] = await Promise.all([
      participantCountPromise,
      deviceAccountsPromise,
    ]);

    const eventStart = new Date(event.startTime).getTime();
    const distance = Number(attendance.distance);
    const radius = Math.max(Number(event.radius), 1);

    return {
      seconds_from_event_start: Math.round((checkedAt.getTime() - eventStart) / 1000),
      distance_ratio: Number((distance / radius).toFixed(5)),
      participant_checkins_24h: participantCheckins,
      shared_device_accounts_30m: Number(deviceAccounts?.count ?? 1),
    };
  }

  private buildTrainingFeatures(history: Attendance[]): FraudFeatures[] {
    const ordered = [...history].sort(
      (a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime(),
    );
    return ordered.map((item, index) => {
      const checkedAt = new Date(item.checkInTime);
      const participantWindow = checkedAt.getTime() - 24 * 60 * 60 * 1000;
      const deviceWindow = checkedAt.getTime() - 30 * 60 * 1000;
      const prior = ordered.slice(0, index);
      const participantCount =
        1 +
        prior.filter(
          (previous) =>
            previous.participantCode === item.participantCode &&
            new Date(previous.checkInTime).getTime() >= participantWindow,
        ).length;
      const deviceAccounts = new Set(
        prior
          .filter(
            (previous) =>
              previous.event?.id === item.event?.id &&
              previous.device === item.device &&
              previous.device &&
              new Date(previous.checkInTime).getTime() >= deviceWindow,
          )
          .map((previous) => previous.participantCode),
      );
      deviceAccounts.add(item.participantCode);
      const start = new Date(item.event.startTime).getTime();
      const radius = Math.max(Number(item.event.radius), 1);
      return {
        seconds_from_event_start: Math.round((checkedAt.getTime() - start) / 1000),
        distance_ratio: Number((Number(item.distance) / radius).toFixed(5)),
        participant_checkins_24h: participantCount,
        shared_device_accounts_30m: deviceAccounts.size,
      };
    });
  }

  private async requestAi<T>(
    path: string,
    init: RequestInit,
    authenticated = true,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>('AI_FRAUD_SERVICE_URL');
    const token = this.configService.get<string>('AI_SERVICE_TOKEN');
    if (!baseUrl || (authenticated && !token)) {
      throw new ServiceUnavailableException('AI fraud service is not configured.');
    }

    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    if (authenticated && token) headers.set('Authorization', `Bearer ${token}`);

    let response: Response;
    try {
      response = await fetch(new URL(path, baseUrl), {
        ...init,
        headers,
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ServiceUnavailableException('AI fraud service is unavailable.');
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      if (response.status === 409 && body.includes('MODEL_NOT_READY')) {
        throw new ServiceUnavailableException('MODEL_NOT_READY');
      }
      if (response.status >= 500) {
        throw new ServiceUnavailableException('AI_SERVICE_UNAVAILABLE');
      }
      throw new BadGatewayException('AI service rejected the request.');
    }
    return (await response.json()) as T;
  }
}
