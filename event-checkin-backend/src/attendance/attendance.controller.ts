import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import type { Response } from 'express';

import { AttendanceService } from './attendance.service';

import { CheckInDto } from './dto/check-in.dto';

import { QueryAttendanceDto } from './dto/query-attendance.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
  ) {}

  // ==========================================
  // Public Check-in
  // ==========================================

  @Post('check-in')
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  async checkIn(
    @Body() dto: CheckInDto,
  ) {
    return this.attendanceService.checkIn(
      dto,
    );
  }

  // ==========================================
  // Participants By Event
  // ==========================================

  @Get('event/:eventId')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'ORGANIZER')
  @ApiBearerAuth()
  async findByEvent(
    @Param('eventId') eventId: string,
  ) {
    return this.attendanceService.findByEvent(
      eventId,
    );
  }

  // ==========================================
  // Attendance Management
  // ==========================================

  @Get()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'ORGANIZER')
  @ApiBearerAuth()
  async findAll(
    @Query() query: QueryAttendanceDto,
  ) {
    return this.attendanceService.findAll(
      query,
    );
  }

  // ==========================================
  // Export Excel
  // ==========================================

  @Get('export')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'ORGANIZER')
  @ApiBearerAuth()
  async exportExcel(
    @Res() res: Response,
    @Query('eventId') eventId?: string,
  ) {
    return this.attendanceService.exportExcel(
      res,
      eventId,
    );
  }
}