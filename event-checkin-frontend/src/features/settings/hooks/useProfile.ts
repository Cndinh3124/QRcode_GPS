import { useQuery } from '@tanstack/react-query';

import { getMyProfile } from '../api/settings.api';

export function useProfile() {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    staleTime: 1000 * 60 * 5,
  });
}