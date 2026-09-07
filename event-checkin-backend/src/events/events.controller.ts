import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { EventsService } from './events.service';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  // =========================================================
  // ADMIN / ORGANIZER
  // =========================================================

  @Post()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'ADMIN',
    'ORGANIZER',
  )
  @ApiBearerAuth()
  create(
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(
      dto,
    );
  }

  @Get()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'ADMIN',
    'ORGANIZER',
  )
  @ApiBearerAuth()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'ADMIN',
    'ORGANIZER',
  )
  @ApiBearerAuth()
  findOne(
    @Param('id') id: string,
  ) {
    return this.eventsService.findOne(
      id,
    );
  }

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'ADMIN',
    'ORGANIZER',
  )
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(
      id,
      dto,
    );
  }

  @Patch(':id/status')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  @ApiBearerAuth()
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEventStatusDto,
  ) {
    return this.eventsService.updateStatus(
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  @ApiBearerAuth()
  remove(
    @Param('id') id: string,
  ) {
    return this.eventsService.remove(
      id,
    );
  }

  // =========================================================
  // PUBLIC QR EVENT
  // =========================================================

  @Get('qr/:qrToken')
  getByQrToken(
    @Param('qrToken') qrToken: string,
  ) {
    return this.eventsService.findPublicByQrToken(
      qrToken,
    );
  }
}