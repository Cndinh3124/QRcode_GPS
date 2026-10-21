import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';
import { AttendanceRiskAssessment } from './entities/attendance-risk-assessment.entity';
import { AttendanceRiskReview } from './entities/attendance-risk-review.entity';
import { AiFraudController } from './ai-fraud.controller';
import { AiFraudService } from './ai-fraud.service';
import { AiFraudWorker } from './ai-fraud.worker';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      AttendanceRiskAssessment,
      AttendanceRiskReview,
      User,
    ]),
  ],
  controllers: [AiFraudController],
  providers: [AiFraudService, AiFraudWorker, JwtAuthGuard, RolesGuard],
})
export class AiFraudModule {}
