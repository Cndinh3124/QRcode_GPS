import { useQuery } from '@tanstack/react-query';

import { getEventByQr } from '../api/event.api';

export function useEventInfo(
  qrToken?: string,
) {
  return useQuery({
    queryKey: ['event-info', qrToken],

    queryFn: () => {
      if (!qrToken) {
        throw new Error(
          'QR token is required.',
        );
      }

      return getEventByQr(qrToken);
    },

    enabled: Boolean(qrToken),

    staleTime: 0,

    refetchOnWindowFocus: true,
  });
}