import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';

export const useGetRolePermissionsQuery = (roleId, enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['rolePermissions', 'permissions', roleId],
    queryFn: () => API.get(`/committee-service/RolePermission`, { params: { RoleId: roleId } }),
    enabled: enabled && !!roleId,
    onSuccess: () => {
      queryClient.invalidateQueries(['permissions']);
      queryClient.invalidateQueries(['rolePermissions']);
    },
  });
};

export const useGetAllPermissionsQuery = (page = 1, pageSize = 1000, searchTerm = '', enabled = true) => {
  return useQuery({
    queryKey: ['permissions', page, pageSize, searchTerm],
    queryFn: () => API.get('/committee-service/Permission', { params: { page, pageSize, searchTerm } }),
    enabled,
    refetchOnMount: 'always',
  });
};

export const useCreateRolePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/RolePermission/create', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['rolePermissions', variables.roleId]);
    },
  });
};

export const useUpdateRolePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/RolePermission/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['rolePermissions', variables.roleId]);
    },
  });
};
