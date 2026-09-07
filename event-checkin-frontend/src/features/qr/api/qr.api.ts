import api from '../../../api/axios';

import type {
  EventQr,
} from '../types/qr.types';

export async function getEventQr(
  eventId: string,
): Promise<EventQr> {
  const response =
    await api.get<EventQr>(
      `/qr/event/${eventId}`,
    );

  return response.data;
}

export async function regenerateEventQr(
  eventId: string,
): Promise<EventQr> {
  const response =
    await api.post<EventQr>(
      `/qr/event/${eventId}/regenerate`,
    );

  return response.data;
}