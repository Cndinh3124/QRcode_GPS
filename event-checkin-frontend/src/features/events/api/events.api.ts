import api from '../../../api/axios';

import { EventStatus } from '../constants/eventStatus';

import type {
  Event,
  CreateEventDto,
  UpdateEventDto,
} from '../types/events.types';

export async function getEvents(): Promise<Event[]> {
  const response = await api.get<Event[]>('/events');

  return response.data;
}

export async function getEventById(
  id: string,
): Promise<Event> {
  const response = await api.get<Event>(
    `/events/${id}`,
  );

  return response.data;
}

export async function createEvent(
  data: CreateEventDto,
): Promise<Event> {
  const response = await api.post<Event>(
    '/events',
    data,
  );

  return response.data;
}

export async function updateEvent(
  id: string,
  data: UpdateEventDto,
): Promise<Event> {
  const response = await api.patch<Event>(
    `/events/${id}`,
    data,
  );

  return response.data;
}

export async function deleteEvent(
  id: string,
): Promise<{ message: string }> {
  const response = await api.delete<{
    message: string;
  }>(`/events/${id}`);

  return response.data;
}

export async function updateEventStatus(
  id: string,
  status: EventStatus,
): Promise<Event> {
  const response = await api.patch<Event>(
    `/events/${id}/status`,
    {
      status,
    },
  );

  return response.data;
}