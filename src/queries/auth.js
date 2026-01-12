import { useMutation } from '@tanstack/react-query';
import { API } from '../services/API';
import { encryptPassword } from '../utils/rsaEncryption';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async credentials => {
      const encryptedPassword = await encryptPassword(credentials.password, API.get);

      return API.post('/auth-service/auth/login', {
        username: credentials.username,
        password: encryptedPassword,
      });
    },
  });
};
