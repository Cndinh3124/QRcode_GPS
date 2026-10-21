import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReviewDecision } from '../entities/attendance-risk-assessment.entity';

export class ReviewRiskAssessmentDto {
  @IsEnum(ReviewDecision)
  decision: ReviewDecision;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
