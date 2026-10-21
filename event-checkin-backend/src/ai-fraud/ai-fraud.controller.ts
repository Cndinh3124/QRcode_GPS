import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AiFraudService } from './ai-fraud.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ListRiskAssessmentsDto } from './dto/list-risk-assessments.dto';
import { ReviewRiskAssessmentDto } from './dto/review-risk-assessment.dto';

@ApiTags('AI Fraud Detection')
@ApiBearerAuth()
@Controller('ai-fraud')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AiFraudController {
  constructor(private readonly aiFraudService: AiFraudService) {}

  @Get('assessments')
  list(@Query() query: ListRiskAssessmentsDto) {
    return this.aiFraudService.list(query);
  }

  @Get('model-status')
  modelStatus() {
    return this.aiFraudService.modelStatus();
  }

  @Post('train')
  trainBaseline() {
    return this.aiFraudService.trainBaseline();
  }

  @Post('assessments/:id/review')
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewRiskAssessmentDto,
    @GetUser() user: { id: string },
  ) {
    return this.aiFraudService.review(id, user.id, dto.decision, dto.note);
  }
}
