export interface Attendance {
  id: string;

  event?: {
    id: string;
    title: string;
    locationName?: string;
  };

  participantCode: string;

  fullName: string;

  email?: string;

  latitude: number;

  longitude: number;

  distance: number;

  checkInTime: string;

  device?: string;

  ipAddress?: string;

  status: string;

  createdAt?: string;

  updatedAt?: string;
}

export interface AttendanceResponse {
  items: Attendance[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

export interface CheckInDto {
  qrToken: string;

  participantCode: string;

  fullName: string;

  email?: string;

  latitude: number;

  longitude: number;

  device: string;
}