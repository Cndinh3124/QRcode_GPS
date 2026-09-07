import { useMutation } from '@tanstack/react-query';

import { message } from 'antd';

import type { AxiosError } from 'axios';

import { changePassword } from '../api/settings.api';

import type {
  ChangePasswordRequest,
} from '../types/settings.types';

interface ErrorResponse {
  message?: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (
      data: ChangePasswordRequest,
    ) => changePassword(data),

    onSuccess: () => {
      message.success(
        'Password changed successfully.',
      );
    },

    onError: (
      error: AxiosError<ErrorResponse>,
    ) => {
      message.error(
        error.response?.data?.message ??
          'Failed to change password.',
      );
    },
  });
}