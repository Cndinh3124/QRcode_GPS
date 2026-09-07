import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  updateEventStatus,
} from '../api/events.api';

import { EventStatus } from '../constants/eventStatus';

import type {
  UpdateEventDto,
} from '../types/events.types';

const EVENTS_QUERY_KEY = ['events'] as const;

export function useEvents() {
  const queryClient = useQueryClient();

  const events = useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: getEvents,
  });

  const createEventMutation = useMutation({
    mutationFn: createEvent,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EVENTS_QUERY_KEY,
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEventDto;
    }) => updateEvent(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EVENTS_QUERY_KEY,
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EVENTS_QUERY_KEY,
      });
    },
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: EventStatus;
    }) => updateEventStatus(id, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EVENTS_QUERY_KEY,
      });
    },
  });

  return {
    events,

    createEvent: createEventMutation,

    updateEvent: updateEventMutation,

    deleteEvent: deleteEventMutation,

    updateEventStatus:
      updateEventStatusMutation,
  };
}