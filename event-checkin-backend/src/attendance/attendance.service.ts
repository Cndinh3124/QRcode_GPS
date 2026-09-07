import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  QueryFailedError,
  Repository,
} from 'typeorm';

import * as ExcelJS from 'exceljs';

import {
  Attendance,
  AttendanceStatus,
} from './entities/attendance.entity';

import { CheckInDto } from './dto/check-in.dto';

import {
  QueryAttendanceDto,
} from './dto/query-attendance.dto';

import {
  Event,
  EventStatus,
} from '../events/entities/event.entity';

import { EventsService } from '../events/events.service';
import { GpsService } from '../gps/gps.service';

import type { Response } from 'express';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    private readonly eventsService: EventsService,

    private readonly gpsService: GpsService,
  ) {}

  // =========================================================
  // CHECK-IN
  // =========================================================

  async checkIn(dto: CheckInDto) {
    const participantCode =
      dto.participantCode.trim();

    const fullName =
      dto.fullName.trim();

    const email =
      dto.email?.trim() || null;

    const device =
      dto.device.trim();

    // -------------------------------------------------------
    // Validate basic data
    // -------------------------------------------------------

    if (!participantCode) {
      throw new BadRequestException(
        'Participant code is required.',
      );
    }

    if (!fullName) {
      throw new BadRequestException(
        'Full name is required.',
      );
    }

    if (!device) {
      throw new BadRequestException(
        'Device information is required.',
      );
    }

    // -------------------------------------------------------
    // Validate coordinates
    // -------------------------------------------------------

    if (
      !Number.isFinite(dto.latitude) ||
      !Number.isFinite(dto.longitude)
    ) {
      throw new BadRequestException(
        'Invalid GPS coordinates.',
      );
    }

    if (
      dto.latitude < -90 ||
      dto.latitude > 90
    ) {
      throw new BadRequestException(
        'Invalid latitude.',
      );
    }

    if (
      dto.longitude < -180 ||
      dto.longitude > 180
    ) {
      throw new BadRequestException(
        'Invalid longitude.',
      );
    }

    // -------------------------------------------------------
    // Find event from QR token
    // -------------------------------------------------------

    let event: Event;

    try {
      event =
        await this.eventsService.findByQrToken(
          dto.qrToken.trim(),
        );
    } catch (error) {
      if (
        error instanceof NotFoundException
      ) {
        throw new NotFoundException(
          'Invalid QR code.',
        );
      }

      throw error;
    }

    // -------------------------------------------------------
    // Validate event status
    // -------------------------------------------------------

    if (
      event.status !==
      EventStatus.CHECKING_IN
    ) {
      throw new BadRequestException(
        'This event is not accepting check-ins.',
      );
    }

    // -------------------------------------------------------
    // Validate event time
    // -------------------------------------------------------

    const now = new Date();

    if (now > event.endTime) {
      throw new BadRequestException(
        'The check-in period has ended.',
      );
    }

    // -------------------------------------------------------
    // Calculate GPS distance
    // -------------------------------------------------------

    const distance =
      this.gpsService.calculateDistance(
        Number(event.latitude),
        Number(event.longitude),
        Number(dto.latitude),
        Number(dto.longitude),
      );

    if (!Number.isFinite(distance)) {
      throw new BadRequestException(
        'Unable to calculate GPS distance.',
      );
    }

    // -------------------------------------------------------
    // Validate geofence
    // -------------------------------------------------------

    if (
      distance >
      Number(event.radius)
    ) {
      throw new BadRequestException(
        `You are outside the check-in area. Distance: ${distance.toFixed(
          2,
        )} m.`,
      );
    }

    // -------------------------------------------------------
    // Pre-check duplicate
    //
    // This is only an optimization.
    //
    // The UNIQUE database index remains the
    // final protection against race conditions.
    // -------------------------------------------------------

    const existingAttendance =
      await this.attendanceRepository.findOne({
        where: {
          event: {
            id: event.id,
          },
          participantCode,
        },
      });

    if (existingAttendance) {
      throw new ConflictException(
        'This participant has already checked in for this event.',
      );
    }

    // -------------------------------------------------------
    // Determine attendance status
    // -------------------------------------------------------

    const checkInTime = now;

    const status =
      checkInTime <= event.startTime
        ? AttendanceStatus.PRESENT
        : AttendanceStatus.LATE;

    // -------------------------------------------------------
    // Create attendance
    // -------------------------------------------------------

    const attendance =
      this.attendanceRepository.create({
        event,

        participantCode,

        fullName,

        email,

        latitude:
          dto.latitude,

        longitude:
          dto.longitude,

        distance,

        checkInTime,

        device,

        status,
      });

    // -------------------------------------------------------
    // Save attendance
    //
    // Save as an array and destructure the first item.
    // This avoids TypeORM overload ambiguity between
    // Attendance and Attendance[].
    //
    // The database UNIQUE index remains the final
    // protection against concurrent duplicate requests.
    // -------------------------------------------------------

    let savedAttendance: Attendance;

    try {
      const savedAttendances =
        await this.attendanceRepository.save([
          attendance,
        ]);

      savedAttendance =
        savedAttendances[0];
    } catch (error) {
      // -----------------------------------------------------
      // MySQL duplicate entry
      //
      // ER_DUP_ENTRY = 1062
      // -----------------------------------------------------

      if (
        error instanceof QueryFailedError
      ) {
        const driverError =
          error.driverError as {
            code?: string | number;
            errno?: number;
            sqlMessage?: string;
          };

        const isDuplicate =
          driverError.code ===
            'ER_DUP_ENTRY' ||
          driverError.errno === 1062;

        if (isDuplicate) {
          throw new ConflictException(
            'This participant has already checked in for this event.',
          );
        }
      }

      throw error;
    }

    // -------------------------------------------------------
    // Safety check
    // -------------------------------------------------------

    if (!savedAttendance) {
      throw new BadRequestException(
        'Unable to save attendance.',
      );
    }

    // -------------------------------------------------------
    // Response
    // -------------------------------------------------------

    return {
      success: true,

      message:
        status ===
        AttendanceStatus.PRESENT
          ? 'Check-in successful.'
          : 'Check-in successful. You are late.',

      data: {
        id:
          savedAttendance.id,

        eventId:
          event.id,

        eventTitle:
          event.title,

        participantCode:
          savedAttendance.participantCode,

        fullName:
          savedAttendance.fullName,

        email:
          savedAttendance.email,

        checkInTime:
          savedAttendance.checkInTime,

        distance:
          Number(
            savedAttendance.distance,
          ),

        status:
          savedAttendance.status,
      },
    };
  }

  // =========================================================
  // FIND ATTENDANCE BY EVENT
  // =========================================================

  async findByEvent(
    eventId: string,
  ) {
    const event =
      await this.eventRepository.findOne({
        where: {
          id: eventId,
        },
      });

    if (!event) {
      throw new NotFoundException(
        'Event not found.',
      );
    }

    const attendances =
      await this.attendanceRepository.find({
        where: {
          event: {
            id: eventId,
          },
        },

        order: {
          checkInTime: 'DESC',
        },
      });

    return attendances.map(
      (attendance) => ({
        id:
          attendance.id,

        eventId:
          event.id,

        eventTitle:
          event.title,

        participantCode:
          attendance.participantCode,

        fullName:
          attendance.fullName,

        email:
          attendance.email,

        latitude:
          Number(
            attendance.latitude,
          ),

        longitude:
          Number(
            attendance.longitude,
          ),

        distance:
          Number(
            attendance.distance,
          ),

        checkInTime:
          attendance.checkInTime,

        device:
          attendance.device,

        ipAddress:
          attendance.ipAddress,

        status:
          attendance.status,

        createdAt:
          attendance.createdAt,

        updatedAt:
          attendance.updatedAt,
      }),
    );
  }

  // =========================================================
  // FIND ALL ATTENDANCE
  // =========================================================

  async findAll(
    query: QueryAttendanceDto,
  ) {
    const page =
      Math.max(
        Number(query.page) || 1,
        1,
      );

    const limit =
      Math.min(
        Math.max(
          Number(query.limit) || 20,
          1,
        ),
        100,
      );

    const search =
      query.search?.trim();

    const eventId =
      query.eventId?.trim();

    const status =
      query.status?.trim();

    const queryBuilder =
      this.attendanceRepository
        .createQueryBuilder(
          'attendance',
        )
        .leftJoinAndSelect(
          'attendance.event',
          'event',
        );

    // -------------------------------------------------------
    // Search
    // -------------------------------------------------------

    if (search) {
      queryBuilder.andWhere(
        `(
          attendance.participantCode LIKE :search
          OR attendance.fullName LIKE :search
          OR attendance.email LIKE :search
        )`,
        {
          search: `%${search}%`,
        },
      );
    }

    // -------------------------------------------------------
    // Event filter
    // -------------------------------------------------------

    if (eventId) {
      queryBuilder.andWhere(
        'event.id = :eventId',
        {
          eventId,
        },
      );
    }

    // -------------------------------------------------------
    // Status filter
    // -------------------------------------------------------

    if (status) {
      queryBuilder.andWhere(
        'attendance.status = :status',
        {
          status,
        },
      );
    }

    // -------------------------------------------------------
    // Pagination
    // -------------------------------------------------------

    queryBuilder
      .orderBy(
        'attendance.checkInTime',
        'DESC',
      )
      .skip(
        (page - 1) *
          limit,
      )
      .take(limit);

    const [
      items,
      total,
    ] =
      await queryBuilder.getManyAndCount();

    return {
      items: items.map(
        (attendance) => ({
          id:
            attendance.id,

          event:
            attendance.event
              ? {
                  id:
                    attendance.event.id,

                  title:
                    attendance.event.title,

                  locationName:
                    attendance.event
                      .locationName,
                }
              : null,

          participantCode:
            attendance.participantCode,

          fullName:
            attendance.fullName,

          email:
            attendance.email,

          latitude:
            Number(
              attendance.latitude,
            ),

          longitude:
            Number(
              attendance.longitude,
            ),

          distance:
            Number(
              attendance.distance,
            ),

          checkInTime:
            attendance.checkInTime,

          device:
            attendance.device,

          ipAddress:
            attendance.ipAddress,

          status:
            attendance.status,

          createdAt:
            attendance.createdAt,

          updatedAt:
            attendance.updatedAt,
        }),
      ),

      total,

      page,

      limit,

      totalPages:
        Math.ceil(
          total / limit,
        ),
    };
  }

  // =========================================================
  // EXPORT EXCEL
  // =========================================================

  async exportExcel(
    res: Response,
    eventId?: string,
  ) {
    const queryBuilder =
      this.attendanceRepository
        .createQueryBuilder(
          'attendance',
        )
        .leftJoinAndSelect(
          'attendance.event',
          'event',
        )
        .orderBy(
          'attendance.checkInTime',
          'DESC',
        );

    if (eventId) {
      queryBuilder.andWhere(
        'event.id = :eventId',
        {
          eventId,
        },
      );
    }

    const attendances =
      await queryBuilder.getMany();

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        'Attendance',
      );

    worksheet.columns = [
      {
        header: 'STT',
        key: 'index',
        width: 8,
      },

      {
        header: 'Participant Code',
        key: 'participantCode',
        width: 20,
      },

      {
        header: 'Full Name',
        key: 'fullName',
        width: 25,
      },

      {
        header: 'Email',
        key: 'email',
        width: 30,
      },

      {
        header: 'Event',
        key: 'event',
        width: 30,
      },

      {
        header: 'Check-in Time',
        key: 'checkInTime',
        width: 22,
      },

      {
        header: 'Distance (m)',
        key: 'distance',
        width: 15,
      },

      {
        header: 'Status',
        key: 'status',
        width: 15,
      },

      {
        header: 'Latitude',
        key: 'latitude',
        width: 15,
      },

      {
        header: 'Longitude',
        key: 'longitude',
        width: 15,
      },

      {
        header: 'Device',
        key: 'device',
        width: 30,
      },

      {
        header: 'IP Address',
        key: 'ipAddress',
        width: 20,
      },
    ];

    attendances.forEach(
      (
        attendance,
        index,
      ) => {
        worksheet.addRow({
          index:
            index + 1,

          participantCode:
            attendance.participantCode,

          fullName:
            attendance.fullName,

          email:
            attendance.email ??
            '',

          event:
            attendance.event
              ?.title ?? '',

          checkInTime:
            attendance.checkInTime,

          distance:
            Number(
              attendance.distance,
            ),

          status:
            attendance.status,

          latitude:
            Number(
              attendance.latitude,
            ),

          longitude:
            Number(
              attendance.longitude,
            ),

          device:
            attendance.device ??
            '',

          ipAddress:
            attendance.ipAddress ??
            '',
        });
      },
    );

    // -------------------------------------------------------
    // Header formatting
    // -------------------------------------------------------

    const headerRow =
      worksheet.getRow(1);

    headerRow.font = {
      bold: true,
    };

    headerRow.alignment = {
      vertical:
        'middle',

      horizontal:
        'center',
    };

    // -------------------------------------------------------
    // Date formatting
    // -------------------------------------------------------

    worksheet
      .getColumn(
        'checkInTime',
      )
      .numFmt =
      'dd/mm/yyyy hh:mm:ss';

    // -------------------------------------------------------
    // Distance formatting
    // -------------------------------------------------------

    worksheet
      .getColumn(
        'distance',
      )
      .numFmt =
      '0.00';

    // -------------------------------------------------------
    // Generate Excel
    // -------------------------------------------------------

    const buffer =
      await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="attendance.xlsx"',
    );

    res.setHeader(
      'Content-Length',
      buffer.byteLength.toString(),
    );

    res.end(buffer);
  }
}