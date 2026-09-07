import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { User } from '../users/entities/user.entity';

import {
  Attendance,
  AttendanceStatus,
} from '../attendance/entities/attendance.entity';

import {
  Event,
  EventStatus,
} from '../events/entities/event.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  // =========================================================
  // SUMMARY
  // =========================================================

  async summary() {
    const totalUsers =
      await this.userRepository.count();

    const totalEvents =
      await this.eventRepository.count();

    const totalAttendance =
      await this.attendanceRepository.count();

    // -------------------------------------------------------
    // Event status
    // -------------------------------------------------------

    const publishedEvents =
      await this.eventRepository.count({
        where: {
          status:
            EventStatus.PUBLISHED,
        },
      });

    const checkingInEvents =
      await this.eventRepository.count({
        where: {
          status:
            EventStatus.CHECKING_IN,
        },
      });

    const finishedEvents =
      await this.eventRepository.count({
        where: {
          status:
            EventStatus.FINISHED,
        },
      });

    const cancelledEvents =
      await this.eventRepository.count({
        where: {
          status:
            EventStatus.CANCELLED,
        },
      });

    const draftEvents =
      await this.eventRepository.count({
        where: {
          status:
            EventStatus.DRAFT,
        },
      });

    // -------------------------------------------------------
    // Today's attendance
    // -------------------------------------------------------

    const todayAttendance =
      await this.attendanceRepository
        .createQueryBuilder(
          'attendance',
        )
        .where(
          'DATE(attendance.checkInTime) = CURDATE()',
        )
        .getCount();

    // -------------------------------------------------------
    // Present / Late
    // -------------------------------------------------------

    const presentCount =
      await this.attendanceRepository.count({
        where: {
          status:
            AttendanceStatus.PRESENT,
        },
      });

    const lateCount =
      await this.attendanceRepository.count({
        where: {
          status:
            AttendanceStatus.LATE,
        },
      });

    // -------------------------------------------------------
    // Return dashboard summary
    // -------------------------------------------------------

    return {
      totalUsers,

      totalEvents,

      totalAttendance,

      todayAttendance,

      presentCount,

      lateCount,

      activeEvents:
        checkingInEvents,

      publishedEvents,

      checkingInEvents,

      finishedEvents,

      cancelledEvents,

      draftEvents,
    };
  }

  // =========================================================
  // CHECK-IN BY EVENT
  // =========================================================

  async checkInByEvent() {
    const result =
      await this.attendanceRepository
        .createQueryBuilder(
          'attendance',
        )
        .leftJoin(
          'attendance.event',
          'event',
        )
        .select(
          'event.id',
          'eventId',
        )
        .addSelect(
          'event.title',
          'title',
        )
        .addSelect(
          'COUNT(attendance.id)',
          'totalCheckIn',
        )
        .groupBy(
          'event.id',
        )
        .addGroupBy(
          'event.title',
        )
        .orderBy(
          'totalCheckIn',
          'DESC',
        )
        .getRawMany();

    return result.map(
      (item) => ({
        eventId:
          item.eventId,

        title:
          item.title,

        totalCheckIn:
          Number(
            item.totalCheckIn,
          ),
      }),
    );
  }

  // =========================================================
  // CHECK-IN BY DAY
  // =========================================================

  async checkInByDay() {
    const result =
      await this.attendanceRepository
        .createQueryBuilder(
          'attendance',
        )
        .select(
          'DATE(attendance.checkInTime)',
          'date',
        )
        .addSelect(
          'COUNT(attendance.id)',
          'total',
        )
        .groupBy(
          'DATE(attendance.checkInTime)',
        )
        .orderBy(
          'DATE(attendance.checkInTime)',
          'ASC',
        )
        .getRawMany();

    return result.map(
      (item) => ({
        date:
          item.date,

        total:
          Number(
            item.total,
          ),
      }),
    );
  }

  // =========================================================
  // RECENT ATTENDANCE
  // =========================================================

  async recentAttendance() {
    const attendances =
      await this.attendanceRepository.find({
        relations: {
          event: true,
        },

        order: {
          checkInTime:
            'DESC',
        },

        take: 10,
      });

    return attendances.map(
      (attendance) => ({
        participantCode:
          attendance.participantCode,

        fullName:
          attendance.fullName,

        email:
          attendance.email,

        event:
          attendance.event?.title ??
          '-',

        checkInTime:
          attendance.checkInTime,

        distance:
          Number(
            attendance.distance,
          ),

        status:
          attendance.status,
      }),
    );
  }
}