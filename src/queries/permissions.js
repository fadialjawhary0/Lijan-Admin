import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';

// Get all permissions
export const useGetAllPermissionsQuery = (page = 1, pageSize = 1000, searchTerm = '', enabled = true) => {
  return useQuery({
    queryKey: ['permissions', page, pageSize, searchTerm],
    queryFn: () => API.get('/committee-service/Permission', { params: { page, pageSize, searchTerm } }),
    enabled,
  });
};

// Get permission by ID
export const useGetPermissionByIdQuery = (permissionId, enabled = true) => {
  return useQuery({
    queryKey: ['permission', permissionId],
    queryFn: () => API.get(`/committee-service/Permission/details?Id=${permissionId}`),
    enabled: enabled && !!permissionId,
  });
};

// Create permission
export const useCreatePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Permission/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['permissions']);
    },
  });
};

// Update permission
export const useUpdatePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Permission/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['permissions']);
    },
  });
};

// Delete permission
export const useDeletePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Permission/delete', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['permissions']);
    },
  });
};
