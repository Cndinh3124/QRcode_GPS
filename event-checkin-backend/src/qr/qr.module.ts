import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Event } from '../events/entities/event.entity';

import { QrController } from './qr.controller';
import { QrService } from './qr.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
  ],
  controllers: [QrController],
  providers: [QrService],
})
export class QrModule {}