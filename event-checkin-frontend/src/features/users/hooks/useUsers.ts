import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../api/users.api';

import type { UpdateUserDto } from '../types/user.types';

const USERS_QUERY_KEY = ['users'] as const;

export function useUsers() {
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: getUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserDto;
    }) => updateUser(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
      });
    },
  });

  return {
    users,
    createUser: createUserMutation,
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,
  };
}