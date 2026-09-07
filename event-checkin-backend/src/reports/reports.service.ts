import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ExcelJS from 'exceljs';

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
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * GET /reports/summary
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
          status:
            AttendanceStatus.PRESENT,
        },
      }),

      this.attendanceRepository.count({
        where: {
          status:
            AttendanceStatus.LATE,
        },
      }),

      this.attendanceRepository.count({
        where: {
          status:
            AttendanceStatus.REJECTED,
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
   * GET /reports/attendance-by-event
   */
  async getAttendanceByEvent() {
    const events =
      await this.eventRepository.find({
        order: {
          startTime: 'DESC',
        },
      });

    const attendance =
      await this.attendanceRepository.find();

    return events.map((event) => {
      const eventAttendance =
        attendance.filter(
          (item) =>
            item.event?.id === event.id,
        );

      const totalAttendance =
        eventAttendance.length;

      const present =
        eventAttendance.filter(
          (item) =>
            item.status ===
            AttendanceStatus.PRESENT,
        ).length;

      const late =
        eventAttendance.filter(
          (item) =>
            item.status ===
            AttendanceStatus.LATE,
        ).length;

      const rejected =
        eventAttendance.filter(
          (item) =>
            item.status ===
            AttendanceStatus.REJECTED,
        ).length;

      const attendanceRate =
        totalAttendance > 0
          ? Number(
              (
                (present /
                  totalAttendance) *
                100
              ).toFixed(2),
            )
          : 0;

      return {
        eventId: event.id,
        eventTitle: event.title,
        startTime: event.startTime,
        endTime: event.endTime,

        totalAttendance,
        present,
        late,
        rejected,
        attendanceRate,
      };
    });
  }

  /**
   * GET /reports/attendance-by-day
   */
  async getAttendanceByDay(
    from?: string,
    to?: string,
    eventId?: string,
  ) {
    const attendance =
      await this.attendanceRepository.find();

    let filtered = attendance;

    if (eventId) {
      filtered =
        filtered.filter(
          (item) =>
            item.event?.id === eventId,
        );
    }

    if (from) {
      const fromDate =
        new Date(
          `${from}T00:00:00`,
        );

      filtered =
        filtered.filter(
          (item) =>
            item.checkInTime >=
            fromDate,
        );
    }

    if (to) {
      const toDate =
        new Date(
          `${to}T23:59:59.999`,
        );

      filtered =
        filtered.filter(
          (item) =>
            item.checkInTime <=
            toDate,
        );
    }

    const grouped =
      new Map<string, number>();

    for (const item of filtered) {
      const date =
        this.formatDate(
          item.checkInTime,
        );

      grouped.set(
        date,
        (grouped.get(date) ?? 0) + 1,
      );
    }

    return Array.from(
      grouped.entries(),
    )
      .sort(([a], [b]) =>
        a.localeCompare(b),
      )
      .map(
        ([
          date,
          totalAttendance,
        ]) => ({
          date,
          totalAttendance,
        }),
      );
  }

  /**
   * GET /reports/events/:eventId
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

    const attendance =
      await this.attendanceRepository.find({
        where: {
          event: {
            id: eventId,
          },
        },
      });

    const present =
      attendance.filter(
        (item) =>
          item.status ===
          AttendanceStatus.PRESENT,
      ).length;

    const late =
      attendance.filter(
        (item) =>
          item.status ===
          AttendanceStatus.LATE,
      ).length;

    const rejected =
      attendance.filter(
        (item) =>
          item.status ===
          AttendanceStatus.REJECTED,
      ).length;

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

      totalAttendance:
        attendance.length,

      attendanceByStatus: {
        present,
        late,
        rejected,
      },
    };
  }

  /**
   * GET /reports/export
   *
   * Export attendance report to Excel.
   *
   * Supported filters:
   *
   * eventId
   * from
   * to
   */
  async exportExcel(
    eventId?: string,
    from?: string,
    to?: string,
  ): Promise<Buffer> {
    const attendance =
      await this.attendanceRepository.find();

    let filtered = attendance;

    /**
     * Filter Event
     */
    if (eventId) {
      filtered =
        filtered.filter(
          (item) =>
            item.event?.id === eventId,
        );
    }

    /**
     * Filter From
     */
    if (from) {
      const fromDate =
        new Date(
          `${from}T00:00:00`,
        );

      filtered =
        filtered.filter(
          (item) =>
            item.checkInTime >=
            fromDate,
        );
    }

    /**
     * Filter To
     */
    if (to) {
      const toDate =
        new Date(
          `${to}T23:59:59.999`,
        );

      filtered =
        filtered.filter(
          (item) =>
            item.checkInTime <=
            toDate,
        );
    }

    /**
     * Create workbook
     */
    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      'QR Event Check-in System';

    workbook.created =
      new Date();

    const worksheet =
      workbook.addWorksheet(
        'Attendance',
      );

    /**
     * Report title
     */
    worksheet.mergeCells(
      'A1:J1',
    );

    worksheet.getCell(
      'A1',
    ).value =
      'QR Event Check-in - Attendance Report';

    worksheet.getCell(
      'A1',
    ).font = {
      bold: true,
      size: 16,
    };

    worksheet.getCell(
      'A1',
    ).alignment = {
      horizontal: 'center',
    };

    /**
     * Filter information
     */
    worksheet.getCell(
      'A2',
    ).value = 'Event ID';

    worksheet.getCell(
      'B2',
    ).value =
      eventId ?? 'All Events';

    worksheet.getCell(
      'A3',
    ).value = 'From';

    worksheet.getCell(
      'B3',
    ).value =
      from ?? 'All';

    worksheet.getCell(
      'A4',
    ).value = 'To';

    worksheet.getCell(
      'B4',
    ).value =
      to ?? 'All';

    /**
     * Header
     */
    const headerRow =
      worksheet.addRow([
        'Participant Code',
        'Full Name',
        'Email',
        'Event',
        'Check-in Time',
        'Distance (m)',
        'Status',
        'Latitude',
        'Longitude',
        'Device',
      ]);

    headerRow.font = {
      bold: true,
    };

    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    /**
     * Data
     */
    for (const item of filtered) {
      worksheet.addRow([
        item.participantCode,
        item.fullName,
        item.email ?? '',
        item.event?.title ?? '',
        item.checkInTime,
        Number(item.distance),
        item.status,
        Number(item.latitude),
        Number(item.longitude),
        item.device ?? '',
      ]);
    }

    /**
     * Column widths
     */
    worksheet.columns = [
      {
        width: 20,
      },
      {
        width: 25,
      },
      {
        width: 30,
      },
      {
        width: 30,
      },
      {
        width: 22,
      },
      {
        width: 16,
      },
      {
        width: 15,
      },
      {
        width: 15,
      },
      {
        width: 15,
      },
      {
        width: 30,
      },
    ];

    /**
     * Format date column
     */
    worksheet
      .getColumn(5)
      .numFmt =
      'dd/mm/yyyy hh:mm:ss';

    /**
     * Format distance
     */
    worksheet
      .getColumn(6)
      .numFmt =
      '0.00';

    /**
     * Freeze header
     */
    worksheet.views = [
      {
        state: 'frozen',
        ySplit: 5,
      },
    ];

    /**
     * Return Excel buffer
     */
    const buffer =
      await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }

  private formatDate(
    date: Date,
  ): string {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        date.getDate(),
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}