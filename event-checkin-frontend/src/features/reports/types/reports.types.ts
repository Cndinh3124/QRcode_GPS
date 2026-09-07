export interface ReportSummary {
  totalUsers: number;
  totalEvents: number;
  totalAttendance: number;

  attendanceByStatus: {
    present: number;
    late: number;
    rejected: number;
  };
}

export interface AttendanceByEvent {
  eventId: string;
  eventTitle: string;
  startTime: string;
  endTime: string;

  totalAttendance: number;
  present: number;
  late: number;
  rejected: number;
  attendanceRate: number;
}

export interface AttendanceByDay {
  date: string;
  totalAttendance: number;
}

export interface EventReport {
  event: {
    id: string;
    title: string;
    description?: string;
    locationName: string;
    startTime: string;
    endTime: string;
    status: string;
  };

  totalAttendance: number;

  attendanceByStatus: {
    present: number;
    late: number;
    rejected: number;
  };
}