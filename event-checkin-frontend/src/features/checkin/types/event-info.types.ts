import type { EventStatus } from '../../events/constants/eventStatus';

export interface EventInfo {
  id: string;

  title: string;

  description: string | null;

  locationName: string;

  latitude: number;

  longitude: number;

  radius: number;

  startTime: string;

  endTime: string;

  status: EventStatus;
}