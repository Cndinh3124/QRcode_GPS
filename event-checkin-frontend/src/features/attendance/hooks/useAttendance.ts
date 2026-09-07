import { useQuery } from '@tanstack/react-query';

import {
  getAttendance,
} from '../api/attendance.api';

import type {
  AttendanceQuery,
} from '../api/attendance.api';

const ATTENDANCE_QUERY_KEY =
  'attendance';

export function useAttendance(
  query: AttendanceQuery,
) {
  return useQuery({
    queryKey: [
      ATTENDANCE_QUERY_KEY,
      query,
    ],

    queryFn: () =>
      getAttendance(query),

    refetchInterval: 10000,

    refetchOnWindowFocus: true,
  });
}