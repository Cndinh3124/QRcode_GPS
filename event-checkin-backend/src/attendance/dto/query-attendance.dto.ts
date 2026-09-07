import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { Type } from 'class-transformer';

import { AttendanceStatus } from '../entities/attendance.entity';

export class QueryAttendanceDto {
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  limit = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}