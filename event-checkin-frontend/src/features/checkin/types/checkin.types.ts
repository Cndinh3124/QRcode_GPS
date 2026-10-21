export interface CheckInRequest {
  qrToken: string;

  fullName: string;
  email: string | null;

  email?: string;

  latitude: number;

  longitude: number;

  device: string;
}

export interface CheckInData {
  id: string;
  eventId: string;
  eventTitle: string;
  participantCode: string;

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