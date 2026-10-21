import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { randomUUID } from 'crypto';

import {
  Event,
  EventStatus,
} from './entities/event.entity';

import { Attendance } from '../attendance/entities/attendance.entity';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { PublicEventResponseDto } from './dto/public-event-response.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  // =========================================================
  // CREATE EVENT
  // =========================================================

  async create(
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    this.validateEventWindow(
      createEventDto.startTime,
      createEventDto.endTime,
    );

    const event =
      this.eventRepository.create({
        ...createEventDto,

        qrToken: randomUUID(),

        status: EventStatus.PUBLISHED,
      });

    return this.eventRepository.save(
      event,
    );
  }

  // =========================================================
  // GET ALL EVENTS
  // =========================================================

  async findAll(): Promise<Event[]> {
    const events =
      await this.eventRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });

    for (const event of events) {
      await this.refreshStatus(event);
    }

    return events;
  }

  // =========================================================
  // GET EVENT BY ID
  // =========================================================

  async findOne(
    id: string,
  ): Promise<Event> {
    const event =
      await this.eventRepository.findOne({
        where: {
          id,
        },
      });

    if (!event) {
      throw new NotFoundException(
        'Event not found.',
      );
    }

    await this.refreshStatus(
      event,
    );

    return event;
  }

  // =========================================================
  // UPDATE EVENT
  // =========================================================

  async update(
    id: string,
    dto: UpdateEventDto,
  ): Promise<Event> {
    const event =
      await this.findOne(id);

    Object.assign(
      event,
      dto,
    );

    this.validateEventWindow(event.startTime, event.endTime);

    return this.eventRepository.save(
      event,
    );
  }

  // =========================================================
  // DELETE EVENT
  //
  // Event can be deleted even when it has attendance.
  //
  // Attendance records belonging to the event are deleted
  // first, then the event itself is deleted.
  //
  // This is useful for:
  // - test events
  // - demo events
  // - test attendance records
  // - cleaning development data
  // =========================================================

  async remove(
    id: string,
  ) {
    // -------------------------------------------------------
    // Validate event
    // -------------------------------------------------------

    const event =
      await this.eventRepository.findOne({
        where: {
          id,
        },
      });

    if (!event) {
      throw new NotFoundException(
        'Event not found.',
      );
    }

    // -------------------------------------------------------
    // Delete attendance records
    //
    // We delete them explicitly instead of depending only
    // on database ON DELETE CASCADE.
    // -------------------------------------------------------

    await this.attendanceRepository
      .createQueryBuilder()
      .delete()
      .from(Attendance)
      .where(
        'event_id = :eventId',
        {
          eventId: event.id,
        },
      )
      .execute();

    // -------------------------------------------------------
    // Delete event
    // -------------------------------------------------------

    await this.eventRepository.delete(
      event.id,
    );

    // -------------------------------------------------------
    // Response
    // -------------------------------------------------------

    return {
      success: true,

      message:
        'Event and attendance records deleted successfully.',
    };
  }

  // =========================================================
  // UPDATE STATUS MANUALLY
  // =========================================================

  async updateStatus(
    id: string,
    dto: UpdateEventStatusDto,
  ): Promise<Event> {
    const event =
      await this.findOne(id);

    event.status =
      dto.status;

    return this.eventRepository.save(
      event,
    );
  }

  // Kiem tra thoi gian truoc khi luu su kien.
  private validateEventWindow(startTime: Date | string, endTime: Date | string) {
    const start =
      startTime instanceof Date
        ? startTime.getTime()
        : new Date(startTime).getTime();
    const end =
      endTime instanceof Date
        ? endTime.getTime()
        : new Date(endTime).getTime();

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      throw new BadRequestException(
        'Thoi gian ket thuc phai sau thoi gian bat dau.',
      );
    }
  }

  // =========================================================
  // FIND EVENT BY QR TOKEN
  //
  // Internal use:
  // - AttendanceService
  // - QrService
  // =========================================================

  async findByQrToken(
    qrToken: string,
  ): Promise<Event> {
    const token =
      qrToken.trim();

    if (!token) {
      throw new NotFoundException(
        'Event not found.',
      );
    }

    const event =
      await this.eventRepository.findOne({
        where: {
          qrToken: token,
        },
      });

    if (!event) {
      throw new NotFoundException(
        'Event not found.',
      );
    }

    await this.refreshStatus(
      event,
    );

    return event;
  }

  // =========================================================
  // FIND PUBLIC EVENT BY QR TOKEN
  //
  // Public API:
  // GET /events/qr/:qrToken
  //
  // Do NOT expose:
  // - qrToken
  // - createdBy
  // - createdAt
  // - updatedAt
  // =========================================================

  async findPublicByQrToken(
    qrToken: string,
  ): Promise<PublicEventResponseDto> {
    const event =
      await this.findByQrToken(
        qrToken,
      );

    return {
      id: event.id,

      title: event.title,

      description:
        event.description ?? null,

      locationName:
        event.locationName,

      latitude:
        Number(event.latitude),

      longitude:
        Number(event.longitude),

      radius:
        Number(event.radius),

      startTime:
        event.startTime,

      endTime:
        event.endTime,

      status:
        event.status,
    };
  }

  // =========================================================
  // AUTO REFRESH EVENT STATUS
  // =========================================================

  public async refreshStatus(
    event: Event,
  ): Promise<Event> {
    const now =
      new Date();

    // -------------------------------------------------------
    // CANCELLED
    //
    // Do not automatically change a cancelled event.
    // -------------------------------------------------------

    if (
      event.status ===
      EventStatus.CANCELLED
    ) {
      return event;
    }

    // -------------------------------------------------------
    // FINISHED
    //
    // Do not automatically change a manually finished event.
    // -------------------------------------------------------

    if (
      event.status ===
      EventStatus.FINISHED
    ) {
      return event;
    }

    // -------------------------------------------------------
    // DRAFT
    //
    // Draft events must remain draft until manually published.
    // -------------------------------------------------------

    if (
      event.status ===
      EventStatus.DRAFT
    ) {
      return event;
    }

    // -------------------------------------------------------
    // AUTOMATIC EVENT LIFECYCLE
    //
    // PUBLISHED
    //     ↓ startTime
    //
    // CHECKING_IN
    //     ↓ endTime
    //
    // FINISHED
    // -------------------------------------------------------

    let newStatus: EventStatus;

    if (
      now < event.startTime
    ) {
      newStatus =
        EventStatus.PUBLISHED;
    } else if (
      now >= event.startTime &&
      now <= event.endTime
    ) {
      newStatus =
        EventStatus.CHECKING_IN;
    } else {
      newStatus =
        EventStatus.FINISHED;
    }

    // -------------------------------------------------------
    // Save only when status changes
    // -------------------------------------------------------

    if (
      newStatus !==
      event.status
    ) {
      event.status =
        newStatus;

      await this.eventRepository.save(
        event,
      );
    }

    return event;
  }
}