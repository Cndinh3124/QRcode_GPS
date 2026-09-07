import { useQuery } from '@tanstack/react-query';

import {
  getReportSummary,
  getAttendanceByEvent,
  getAttendanceByDay,
  getEventReport,
} from '../api/reports.api';

export function useReportSummary() {
  return useQuery({
    queryKey: [
      'reports',
      'summary',
    ],
    queryFn:
      getReportSummary,
  });
}

export function useAttendanceByEvent() {
  return useQuery({
    queryKey: [
      'reports',
      'attendance-by-event',
    ],
    queryFn:
      getAttendanceByEvent,
  });
}

export function useAttendanceByDay(
  from?: string,
  to?: string,
  eventId?: string,
) {
  return useQuery({
    queryKey: [
      'reports',
      'attendance-by-day',
      from,
      to,
      eventId,
    ],
    queryFn: () =>
      getAttendanceByDay(
        from,
        to,
        eventId,
      ),
  });
}

export function useEventReport(
  eventId?: string,
) {
  return useQuery({
    queryKey: [
      'reports',
      'event',
      eventId,
    ],

    queryFn: () => {
      if (!eventId) {
        throw new Error(
          'Event ID is required.',
        );
      }

      return getEventReport(
        eventId,
      );
    },

    enabled: Boolean(
      eventId,
    ),
  });
}