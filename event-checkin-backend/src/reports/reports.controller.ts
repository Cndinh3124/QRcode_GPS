import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import type { Response } from 'express';

import { ReportsService } from './reports.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  // =========================================================
  // REPORT SUMMARY
  // GET /reports/summary
  // =========================================================

  @Get('summary')
  @Roles('ADMIN', 'ORGANIZER')
  async getSummary() {
    return this.reportsService.getSummary();
  }

  // =========================================================
  // ATTENDANCE BY EVENT
  // GET /reports/attendance-by-event
  // =========================================================

  @Get('attendance-by-event')
  @Roles('ADMIN', 'ORGANIZER')
  async getAttendanceByEvent() {
    return this.reportsService.getAttendanceByEvent();
  }

  // =========================================================
  // ATTENDANCE BY DAY
  // GET /reports/attendance-by-day
  // =========================================================

  @Get('attendance-by-day')
  @Roles('ADMIN', 'ORGANIZER')
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    example: '2026-08-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    example: '2026-08-19',
  })
  @ApiQuery({
    name: 'eventId',
    required: false,
    type: String,
  })
  async getAttendanceByDay(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.reportsService.getAttendanceByDay(
      from,
      to,
      eventId,
    );
  }

  // =========================================================
  // EXPORT EXCEL
  // GET /reports/export
  // =========================================================

  @Get('export')
  @Roles('ADMIN', 'ORGANIZER')
  @ApiQuery({
    name: 'eventId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    example: '2026-08-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    example: '2026-08-19',
  })
  async exportExcel(
    @Query('eventId')
    eventId: string | undefined,

    @Query('from')
    from: string | undefined,

    @Query('to')
    to: string | undefined,

    @Res() response: Response,
  ) {
    const buffer =
      await this.reportsService.exportExcel(
        eventId,
        from,
        to,
      );

    response.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      'Content-Disposition':
        'attachment; filename="attendance-report.xlsx"',

      'Content-Length':
        buffer.length.toString(),
    });

    response.end(buffer);
  }

  // =========================================================
  // EVENT REPORT
  // GET /reports/events/:eventId
  // =========================================================

  @Get('events/:eventId')
  @Roles('ADMIN', 'ORGANIZER')
  async getEventReport(
    @Param('eventId') eventId: string,
  ) {
    const report =
      await this.reportsService.getEventReport(
        eventId,
      );

    if (!report) {
      throw new NotFoundException(
        'Event not found.',
      );
    }

    return report;
  }
}