import api from '../../../api/axios';

import type {
  EventInfo,
} from '../types/event-info.types';

export async function getEventByQr(
  qrToken: string,
): Promise<EventInfo> {
  const response =
    await api.get<EventInfo>(
      `/events/qr/${qrToken}`,
    );

  return response.data;
}