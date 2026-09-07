import { useMutation } from '@tanstack/react-query';

import { message } from 'antd';

import type { AxiosError } from 'axios';

import { checkIn } from '../api/checkin.api';

interface CheckInErrorResponse {
  message: string;
}

export function useCheckIn() {
  return useMutation({
    mutationFn: checkIn,

    onError: (
      error: AxiosError<CheckInErrorResponse>,
    ) => {
      const errorMessage =
        error.response?.data?.message ??
        'Check-in failed.';

      message.error(
        errorMessage,
      );
    },
  });
}