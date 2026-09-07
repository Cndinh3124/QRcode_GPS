import api from '../../../api/axios';

import type {
  CheckInRequest,
  CheckInResponse,
} from '../types/checkin.types';

export async function checkIn(
  payload: CheckInRequest,
): Promise<CheckInResponse> {
  const response =
    await api.post<CheckInResponse>(
      '/attendance/check-in',
      payload,
    );

  return response.data;
}