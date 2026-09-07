import api from '../../../api/axios';

import type {
  ReportSummary,
  AttendanceByEvent,
  AttendanceByDay,
  EventReport,
} from '../types/reports.types';

export async function getReportSummary(): Promise<ReportSummary> {
  const response =
    await api.get<ReportSummary>(
      '/reports/summary',
    );

  return response.data;
}

export async function getAttendanceByEvent(): Promise<
  AttendanceByEvent[]
> {
  const response =
    await api.get<AttendanceByEvent[]>(
      '/reports/attendance-by-event',
    );

  return response.data;
}

export async function getAttendanceByDay(
  from?: string,
  to?: string,
  eventId?: string,
): Promise<AttendanceByDay[]> {
  const response =
    await api.get<AttendanceByDay[]>(
      '/reports/attendance-by-day',
      {
        params: {
          from,
          to,
          eventId,
        },
      },
    );

  return response.data;
}

export async function getEventReport(
  eventId: string,
): Promise<EventReport> {
  const response =
    await api.get<EventReport>(
      `/reports/events/${eventId}`,
    );

  return response.data;
}

export async function exportReport(
  eventId?: string,
  from?: string,
  to?: string,
): Promise<Blob> {
  const response =
    await api.get<Blob>(
      '/reports/export',
      {
        params: {
          eventId,
          from,
          to,
        },
        responseType: 'blob',
      },
    );

  return response.data;
}