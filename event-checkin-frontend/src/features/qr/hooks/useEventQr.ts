import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { message } from 'antd';

import {
  getEventQr,
  regenerateEventQr,
} from '../api/qr.api';

const EVENT_QR_QUERY_KEY =
  'event-qr';

export function useEventQr(
  eventId?: string,
) {
  const queryClient =
    useQueryClient();

  const query = useQuery({
    queryKey: [
      EVENT_QR_QUERY_KEY,
      eventId,
    ],

    queryFn: () => {
      if (!eventId) {
        throw new Error(
          'Event ID is required.',
        );
      }

      return getEventQr(
        eventId,
      );
    },

    enabled:
      Boolean(eventId),
  });

  const regenerateMutation =
    useMutation({
      mutationFn: () => {
        if (!eventId) {
          throw new Error(
            'Event ID is required.',
          );
        }

        return regenerateEventQr(
          eventId,
        );
      },

      onSuccess: (data) => {
        queryClient.setQueryData(
          [
            EVENT_QR_QUERY_KEY,
            eventId,
          ],
          data,
        );

        message.success(
          'QR code regenerated successfully.',
        );
      },

      onError: (error: any) => {
        message.error(
          error.response?.data?.message ??
            'Unable to regenerate QR code.',
        );
      },
    });

  return {
    ...query,

    regenerate:
      regenerateMutation.mutate,

    regenerateAsync:
      regenerateMutation.mutateAsync,

    isRegenerating:
      regenerateMutation.isPending,
  };
}