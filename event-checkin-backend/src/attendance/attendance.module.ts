import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Attendance } from './entities/attendance.entity';

import { AttendanceController } from './attendance.controller';

import { AttendanceService } from './attendance.service';

import { Event } from '../events/entities/event.entity';

import { User } from '../users/entities/user.entity';

import { GpsModule } from '../gps/gps.module';

import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      Event,
      User,
    ]),

    EventsModule,

    GpsModule,
  ],

  controllers: [
    AttendanceController,
  ],

  providers: [
    AttendanceService,
  ],

  exports: [
    AttendanceService,
  ],
})
export class AttendanceModule {}