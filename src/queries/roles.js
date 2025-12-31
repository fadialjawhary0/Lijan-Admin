import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';

// Get all roles
export const useGetAllRolesQuery = (page = 1, pageSize = 1000, searchTerm = '') => {
  return useQuery({
    queryKey: ['roles', page, pageSize, searchTerm],
    queryFn: () => API.get('/committee-service/Role', { params: { page, pageSize, searchTerm } }),
  });
};

// Get role by ID
export const useGetRoleByIdQuery = (roleId, enabled = true) => {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: () => API.get(`/committee-service/Role/details?Id=${roleId}`),
    enabled: enabled && !!roleId,
  });
};

// Create role
export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Role/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
    },
  });
};

// Update role
export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Role/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
    },
  });
};

// Delete role
export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Role/delete', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
    },
  });
};
