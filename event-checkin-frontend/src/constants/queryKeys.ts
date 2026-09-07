export const QUERY_KEYS = {
  USERS: ['users'] as const,

  EVENTS: ['events'] as const,

  ATTENDANCE: ['attendance'] as const,

  EVENT_INFO: (qrToken: string) =>
    ['event-info', qrToken] as const,

  PARTICIPANTS: (eventId: string) =>
    ['participants', eventId] as const,
};