import api from '../../../api/axios';

import type {
  DashboardSummary,
  CheckInByDay,
  CheckInByEvent,
  RecentAttendance,
} from '../types/dashboard.types';

export const getDashboardSummary =
  async (): Promise<DashboardSummary> => {
    const response =
      await api.get<DashboardSummary>(
        '/dashboard/summary',
      );

    return response.data;
  };

export const getCheckInByDay =
  async (): Promise<CheckInByDay[]> => {
    const response =
      await api.get<CheckInByDay[]>(
        '/dashboard/checkin-by-day',
      );

    return response.data;
  };

export const getCheckInByEvent =
  async (): Promise<CheckInByEvent[]> => {
    const response =
      await api.get<CheckInByEvent[]>(
        '/dashboard/checkin-by-event',
      );

    return response.data;
  };

export const getRecentAttendance =
  async (): Promise<RecentAttendance[]> => {
    const response =
      await api.get<RecentAttendance[]>(
        '/dashboard/recent-attendance',
      );

    return response.data;
  };