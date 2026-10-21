import api from '../../../api/axios';

import type {
  User,
  CreateUserDto,
  UpdateUserDto,
} from '../types/user.types';

export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users');

  return response.data;
}

export async function getUserById(
  id: string,
): Promise<User> {
  const response = await api.get<User>(
    `/users/${id}`,
  );

  return response.data;
}

export async function createUser(
  data: CreateUserDto,
): Promise<User> {
  const response = await api.post<User>(
    '/users',
    data,
  );

  return response.data;
}

export async function updateUser(
  id: string,
  data: UpdateUserDto,
): Promise<User> {
  const response = await api.patch<User>(
    `/users/${id}`,
    data,
  );

  return response.data;
}

export async function deleteUser(
  id: string,
): Promise<{ message: string }> {
  const response = await api.delete<{
    message: string;
  }>(`/users/${id}`);

  return response.data;
}