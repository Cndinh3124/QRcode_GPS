import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsUUID, Max, Min } from 'class-validator';
import {
  AnalysisStatus,
  ReviewDecision,
  RiskLevel,
} from '../entities/attendance-risk-assessment.entity';

export class ListRiskAssessmentsDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsEnum(AnalysisStatus)
  analysisStatus?: AnalysisStatus;

  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @IsOptional()
  @IsEnum(ReviewDecision)
  reviewDecision?: ReviewDecision;

  @IsOptional()
  @IsUUID()
  eventId?: string;
}
