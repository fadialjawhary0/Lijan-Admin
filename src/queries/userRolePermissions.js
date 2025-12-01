import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';

// Get all user role permissions by user ID and role ID
export const useGetUserRolePermissionsQuery = (userId, roleId, enabled = true) => {
  return useQuery({
    queryKey: ['userRolePermissions', userId, roleId],
    queryFn: () => API.get(`/committee-service/MemberRolePermission?UserId=${userId}&RoleId=${roleId}`),
    enabled: enabled && !!userId && !!roleId,
  });
};

// Create user role permission
export const useCreateUserRolePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/MemberRolePermission/create', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['userRolePermissions', variables.roleId]);
    },
  });
};

// Update user role permission
export const useUpdateUserRolePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/MemberRolePermission/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userRolePermissions']);
    },
  });
};
