export const CHECKIN_MESSAGES = {
  SUCCESS: 'Check-in successful.',

  FAILED: 'Check-in failed.',

  INVALID_QR: 'Invalid QR Code.',

  INVALID_QR_DESCRIPTION:
    'This event does not exist or the QR Code is invalid.',

  MISSING_QR: 'Missing QR Token.',

  GPS_REQUIRED:
    'Location permission is required for attendance verification.',

  GEOLOCATION_NOT_SUPPORTED:
    'Your browser does not support geolocation.',

  LOCATION_DENIED:
    'Location permission denied.',

  LOCATION_UNAVAILABLE:
    'Location information is unavailable.',

  LOCATION_TIMEOUT:
    'Location request timed out.',

  LOCATION_UNKNOWN:
    'Unable to determine your location.',
} as const;