import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';

// Get all users
export const useGetAllUsersQuery = (searchTerm = '', page, pageSize, enabled = true, systemId) => {
  return useQuery({
    queryKey: ['users', searchTerm, page, pageSize],
    queryFn: () =>
      API.get('/auth-service/User', {
        params: {
          page,
          pageSize,
          searchTerm: searchTerm || undefined,
          systemId: systemId || undefined,
        },
      }),
    enabled: enabled,
  });
};

// Get user by ID
export const useGetUserByIdQuery = (userId, enabled = true) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => API.get('/auth-service/User/details', { params: { id: userId } }),
    enabled: enabled && !!userId,
  });
};

// Create user
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/auth-service/User/create', { ...data, systemId: 2 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

// Update user role and permissions
export const useUpdateUserRolePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/auth-service/UserRolePermission/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

// Activate user
export const useActivateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserId => API.patch('/auth-service/User/active', { UserId: UserId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

// Deactivate user
export const useDeactivateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserId => API.patch('/auth-service/User/deactivate', { UserId: UserId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useGetUsersQuery = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => API.get('/auth-service/User'),
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/auth-service/User/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user']);
    },
  });
};

export const useCreateExternalUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/auth-service/User/create-external', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};
