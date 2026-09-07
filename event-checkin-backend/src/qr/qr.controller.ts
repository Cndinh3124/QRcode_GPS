import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { QrService } from './qr.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('QR')
@Controller('qr')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QrController {
  constructor(
    private readonly qrService: QrService,
  ) {}

  // =========================================================
  // GET EVENT QR
  // ADMIN / ORGANIZER
  // =========================================================

  @Get('event/:id')
  @Roles(
    'ADMIN',
    'ORGANIZER',
  )
  generate(
    @Param('id') id: string,
  ) {
    return this.qrService.generateEventQr(
      id,
    );
  }

  // =========================================================
  // REGENERATE EVENT QR
  // ADMIN / ORGANIZER
  // =========================================================

  @Post('event/:id/regenerate')
  @Roles(
    'ADMIN',
    'ORGANIZER',
  )
  regenerate(
    @Param('id') id: string,
  ) {
    return this.qrService.regenerateEventQr(
      id,
    );
  }
}