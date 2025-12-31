import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';

export const usePostAdMutation = (searchTerm = '', enabled = true) => {
  return useQuery({
    queryKey: ['postAd', searchTerm],
    queryFn: () =>
      API.post('/auth-service/Ad', {
        searchTerm: searchTerm || undefined,
      }),
    enabled: enabled && searchTerm.trim() !== '',
  });
};
