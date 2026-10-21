import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { User } from '../../users/entities/user.entity';

export enum AnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SCORED = 'SCORED',
  RETRY = 'RETRY',
  FAILED = 'FAILED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum ReviewDecision {
  LEGITIMATE = 'LEGITIMATE',
  CONFIRMED_FRAUD = 'CONFIRMED_FRAUD',
  NEEDS_FOLLOW_UP = 'NEEDS_FOLLOW_UP',
}

@Entity('attendance_risk_assessments')
@Index('IDX_RISK_QUEUE', ['analysisStatus', 'nextAttemptAt'])
@Index('IDX_RISK_REVIEW', ['riskLevel', 'reviewDecision', 'createdAt'])
export class AttendanceRiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Attendance, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'attendance_id' })
  attendance: Attendance;

  @Column({ type: 'enum', enum: AnalysisStatus, default: AnalysisStatus.PENDING })
  analysisStatus: AnalysisStatus;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  anomalyScore: number | null;

  @Column({ type: 'enum', enum: RiskLevel, nullable: true })
  riskLevel: RiskLevel | null;

  @Column({ type: 'json', nullable: true })
  reasonCodes: string[] | null;

  @Column({ type: 'json', nullable: true })
  featureSnapshot: Record<string, number> | null;

  @Column({ type: 'varchar', length: 64, default: 'v1' })
  featureVersion: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  modelVersion: string | null;

  @Column({ type: 'smallint', unsigned: true, default: 0 })
  attemptCount: number;

  @Column({ type: 'datetime', nullable: true })
  nextAttemptAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  lastErrorCode: string | null;

  @Column({ type: 'enum', enum: ReviewDecision, nullable: true })
  reviewDecision: ReviewDecision | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: User | null;

  @Column({ type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  reviewNote: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
