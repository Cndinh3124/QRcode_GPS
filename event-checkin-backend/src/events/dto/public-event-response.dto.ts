import { EventStatus } from '../entities/event.entity';

export class PublicEventResponseDto {
  id: string;

  title: string;

  description: string | null;

  locationName: string;

  latitude: number;

  longitude: number;

  radius: number;

  startTime: Date;

  endTime: Date;

  status: EventStatus;
}