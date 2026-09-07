import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { randomUUID } from 'crypto';

import * as QRCode from 'qrcode';

import { Event } from '../events/entities/event.entity';

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    private readonly configService: ConfigService,
  ) {}

  // =========================================================
  // GENERATE EVENT QR
  // =========================================================

  async generateEventQr(
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
        'Event not found',
      );
    }

    return this.buildQrResponse(
      event,
    );
  }

  // =========================================================
  // REGENERATE EVENT QR
  // =========================================================

  async regenerateEventQr(
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
        'Event not found',
      );
    }

    // -------------------------------------------------------
    // Generate a completely new token
    // -------------------------------------------------------

    event.qrToken =
      randomUUID();

    await this.eventRepository.save(
      event,
    );

    // -------------------------------------------------------
    // Generate QR using the new token
    // -------------------------------------------------------

    return this.buildQrResponse(
      event,
    );
  }

  // =========================================================
  // BUILD QR RESPONSE
  // =========================================================

  private async buildQrResponse(
    event: Event,
  ) {
    const frontendUrl =
      this.configService.get<string>(
        'FRONTEND_URL',
      ) ??
      'http://localhost:5173';

    const checkInUrl =
      `${frontendUrl}/check-in/${event.qrToken}`;

    const qrImage =
      await QRCode.toDataURL(
        checkInUrl,
      );

    return {
      eventId: event.id,

      title: event.title,

      qrToken: event.qrToken,

      checkInUrl,

      qrImage,
    };
  }
}