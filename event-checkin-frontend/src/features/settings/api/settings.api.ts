import api from '../../../api/axios';

import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types/settings.types';

export async function getMyProfile(): Promise<UserProfile> {
  const response = await api.get<UserProfile>(
    '/users/me',
  );

  return response.data;
}

export async function updateMyProfile(
  data: UpdateProfileRequest,
): Promise<UserProfile> {
  const response = await api.patch<UserProfile>(
    '/users/me',
    data,
  );

  return response.data;
}

export async function changePassword(
  data: ChangePasswordRequest,
) {
  const response = await api.patch(
    '/users/me/password',
    data,
  );

  return response.data;
}