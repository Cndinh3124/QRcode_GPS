import type { EventStatus } from '../constants/eventStatus';

export interface Event {
  id: string;
  title: string;
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radius: number;
  startTime: string;
  endTime: string;
  status: EventStatus;
  qrToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radius: number;
  startTime: string;
  endTime: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  startTime?: string;
  endTime?: string;
}