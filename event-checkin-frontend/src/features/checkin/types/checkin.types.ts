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
  id: string;
  eventId: string;
  eventTitle: string;
  participantCode: string;
  fullName: string;
  email: string | null;
  checkInTime: string;
  distance: number;
  status: 'PRESENT' | 'LATE';
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  data: CheckInData;
}
