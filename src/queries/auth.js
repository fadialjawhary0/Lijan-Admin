import { useMutation } from '@tanstack/react-query';
import { API } from '../services/API';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: credentials => API.post('/auth-service/auth/login', credentials),
  });
};
