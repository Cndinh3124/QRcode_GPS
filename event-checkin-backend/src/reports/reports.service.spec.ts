import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import {
  Attendance,
  AttendanceStatus,
} from '../attendance/entities/attendance.entity';

import {
  Event,
} from '../events/entities/event.entity';

import {
  User,
} from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository:
      Repository<Attendance>,

    @InjectRepository(Event)
    private readonly eventRepository:
      Repository<Event>,

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,
  ) {}

  /**
   * Tổng quan hệ thống
   */
  async getSummary() {
    const [
      totalUsers,
      totalEvents,
      totalAttendance,
      present,
      late,
      rejected,
    ] = await Promise.all([
      this.userRepository.count(),

      this.eventRepository.count(),

      this.attendanceRepository.count(),

      this.attendanceRepository.count({
        where: {
          status: AttendanceStatus.PRESENT,
        },
      }),

      this.attendanceRepository.count({
        where: {
          status: AttendanceStatus.LATE,
        },
      }),

      this.attendanceRepository.count({
        where: {
          status: AttendanceStatus.REJECTED,
        },
      }),
    ]);

    return {
      totalUsers,
      totalEvents,
      totalAttendance,

      attendanceByStatus: {
        present,
        late,
        rejected,
      },
    };
  }

  /**
   * Thống kê attendance theo Event
   */
  async getAttendanceByEvent() {
    const rows =
      await this.createAttendanceByEventQuery()
        .getRawMany();

    return rows.map((row) => ({
      eventId: row.eventId,

      eventTitle: row.eventTitle,

      startTime: row.startTime,

      endTime: row.endTime,

      totalAttendance:
        Number(row.totalAttendance) || 0,

      present:
        Number(row.present) || 0,

      late:
        Number(row.late) || 0,

      rejected:
        Number(row.rejected) || 0,

      attendanceRate:
        Number(row.attendanceRate) || 0,
    }));
  }

  /**
   * Thống kê attendance theo ngày
   */
  async getAttendanceByDay(
    from?: string,
    to?: string,
  ) {
    const query =
      this.attendanceRepository
        .createQueryBuilder('attendance')
        .select(
          'DATE(attendance.checkInTime)',
          'date',
        )
        .addSelect(
          'COUNT(attendance.id)',
          'totalAttendance',
        )
        .groupBy(
          'DATE(attendance.checkInTime)',
        )
        .orderBy(
          'DATE(attendance.checkInTime)',
          'ASC',
        );

    if (from) {
      query.andWhere(
        'attendance.checkInTime >= :from',
        {
          from: `${from} 00:00:00`,
        },
      );
    }

    if (to) {
      query.andWhere(
        'attendance.checkInTime <= :to',
        {
          to: `${to} 23:59:59`,
        },
      );
    }

    const rows =
      await query.getRawMany();

    return rows.map((row) => ({
      date: row.date,

      totalAttendance:
        Number(row.totalAttendance) || 0,
    }));
  }

  /**
   * Báo cáo chi tiết của một Event
   */
  async getEventReport(
    eventId: string,
  ) {
    const event =
      await this.eventRepository.findOne({
        where: {
          id: eventId,
        },
      });

    if (!event) {
      return null;
    }

    const [
      totalAttendance,
      present,
      late,
      rejected,
    ] = await Promise.all([
      this.attendanceRepository.count({
        where: {
          event: {
            id: eventId,
          },
        },
      }),

      this.attendanceRepository.count({
        where: {
          event: {
            id: eventId,
          },
          status:
            AttendanceStatus.PRESENT,
        },
      }),

      this.attendanceRepository.count({
        where: {
          event: {
            id: eventId,
          },
          status:
            AttendanceStatus.LATE,
        },
      }),

      this.attendanceRepository.count({
        where: {
          event: {
            id: eventId,
          },
          status:
            AttendanceStatus.REJECTED,
        },
      }),
    ]);

    return {
      event: {
        id: event.id,

        title: event.title,

        description:
          event.description,

        locationName:
          event.locationName,

        startTime:
          event.startTime,

        endTime:
          event.endTime,

        status:
          event.status,
      },

      totalAttendance,

      attendanceByStatus: {
        present,
        late,
        rejected,
      },
    };
  }

  /**
   * Query thống kê theo Event.
   *
   * Dùng LEFT JOIN để Event không có
   * attendance vẫn xuất hiện trong report.
   */
  private createAttendanceByEventQuery():
    SelectQueryBuilder<Event> {
    return this.eventRepository
      .createQueryBuilder('event')

      .leftJoin(
        Attendance,
        'attendance',
        'attendance.event_id = event.id',
      )

      .select(
        'event.id',
        'eventId',
      )

      .addSelect(
        'event.title',
        'eventTitle',
      )

      .addSelect(
        'event.startTime',
        'startTime',
      )

      .addSelect(
        'event.endTime',
        'endTime',
      )

      .addSelect(
        'COUNT(attendance.id)',
        'totalAttendance',
      )

      .addSelect(
        `SUM(
          CASE
            WHEN attendance.status = :present
            THEN 1
            ELSE 0
          END
        )`,
        'present',
      )

      .addSelect(
        `SUM(
          CASE
            WHEN attendance.status = :late
            THEN 1
            ELSE 0
          END
        )`,
        'late',
      )

      .addSelect(
        `SUM(
          CASE
            WHEN attendance.status = :rejected
            THEN 1
            ELSE 0
          END
        )`,
        'rejected',
      )

      .addSelect(
        `
        CASE
          WHEN COUNT(attendance.id) = 0
          THEN 0
          ELSE ROUND(
            (
              SUM(
                CASE
                  WHEN attendance.status = :present
                  THEN 1
                  ELSE 0
                END
              ) /
              COUNT(attendance.id)
            ) * 100,
            2
          )
        END
        `,
        'attendanceRate',
      )

      .setParameters({
        present:
          AttendanceStatus.PRESENT,

        late:
          AttendanceStatus.LATE,

        rejected:
          AttendanceStatus.REJECTED,
      })

      .groupBy(
        'event.id',
      )

      .addGroupBy(
        'event.title',
      )

      .addGroupBy(
        'event.startTime',
      )

      .addGroupBy(
        'event.endTime',
      )

      .orderBy(
        'event.startTime',
        'DESC',
      );
  }
}