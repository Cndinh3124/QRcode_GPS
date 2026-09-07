import { useQuery } from '@tanstack/react-query';

import { getParticipants } from '../api/attendance.api';

const PARTICIPANTS_QUERY_KEY = 'participants';

export function useParticipants(
  eventId: string,
) {
  return useQuery({
    queryKey: [
      PARTICIPANTS_QUERY_KEY,
      eventId,
    ],

    queryFn: () =>
      getParticipants(eventId),

    enabled: Boolean(eventId),
  });
}