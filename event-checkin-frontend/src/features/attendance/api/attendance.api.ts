import api from '../../../api/axios';

import type {
  Attendance,
  AttendanceResponse,
  CheckInDto,
} from '../types/attendance.types';

export interface AttendanceQuery {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  status?: string;
}

export async function getAttendance(
  params: AttendanceQuery,
): Promise<AttendanceResponse> {
  const response =
    await api.get<AttendanceResponse>(
      '/attendance',
      {
        params,
      },
    );

  return response.data;
}

export async function checkIn(
  data: CheckInDto,
) {
  const response =
    await api.post(
      '/attendance/check-in',
      data,
    );

  return response.data;
}

export async function getParticipants(
  eventId: string,
): Promise<Attendance[]> {
  const response =
    await api.get<Attendance[]>(
      `/attendance/event/${eventId}`,
    );

  return response.data;
}

export async function exportAttendance(
  eventId: string,
): Promise<Blob> {
  const response =
    await api.get<Blob>(
      '/attendance/export',
      {
        params: {
          eventId,
        },
        responseType: 'blob',
      },
    );

  return response.data;
}