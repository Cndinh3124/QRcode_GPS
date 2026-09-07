import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) { }

    @Get('summary')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ORGANIZER')
    @ApiBearerAuth()
    summary() {
        return this.dashboardService.summary();
    }

    @Get('checkin-by-event')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ORGANIZER')
    @ApiBearerAuth()
    checkInByEvent() {
        return this.dashboardService.checkInByEvent();
    }

    @Get('checkin-by-day')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ORGANIZER')
    @ApiBearerAuth()
    checkInByDay() {
        return this.dashboardService.checkInByDay();
    }

    @Get('recent-attendance')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'ORGANIZER')
    @ApiBearerAuth()
    recentAttendance() {
        return this.dashboardService.recentAttendance();
    }
}