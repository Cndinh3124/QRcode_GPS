import { useQuery } from '@tanstack/react-query';

import {
  getDashboardSummary,
  getCheckInByDay,
  getCheckInByEvent,
  getRecentAttendance,
} from '../api/dashboard.api';

export function useDashboard() {
  const summary = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const byDay = useQuery({
    queryKey: ['dashboard-day'],
    queryFn: getCheckInByDay,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const byEvent = useQuery({
    queryKey: ['dashboard-event'],
    queryFn: getCheckInByEvent,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const recentAttendance = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: getRecentAttendance,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  return {
    summary,
    byDay,
    byEvent,
    recentAttendance,
  };
}