export interface DashboardSummary {
  totalUsers: number;
  totalEvents: number;
  totalAttendance: number;

  todayAttendance: number;

  presentCount: number;
  lateCount: number;

  publishedEvents: number;
  checkingInEvents: number;
  finishedEvents: number;
  cancelledEvents: number;
  draftEvents: number;
}

export interface CheckInByDay {
  date: string;
  total: number;
}

export interface CheckInByEvent {
  eventId: string;
  title: string;
  totalCheckIn: number;
}

export interface RecentAttendance {
  participantCode: string;
  fullName: string;
  email?: string;
  event: string;
  checkInTime: string;
  distance: number;
  status: string;
}