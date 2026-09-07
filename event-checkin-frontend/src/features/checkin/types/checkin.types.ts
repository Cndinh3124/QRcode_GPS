export interface CheckInRequest {
  qrToken: string;

  participantCode: string;

  fullName: string;

  email?: string;

  latitude: number;

  longitude: number;

  device: string;
}

export interface CheckInData {
  attendanceId: string;

  participantCode: string;

  fullName: string;

  distance: number;

  checkInTime: string;

  eventTitle?: string;

  status: 'PRESENT' | 'LATE' | 'REJECTED' | string;
}

export interface CheckInResponse {
  success: boolean;

  message: string;

  data: CheckInData;
}