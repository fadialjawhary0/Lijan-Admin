import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';

export const useGetAllDepartmentsQuery = (page = 1, pageSize, searchTerm = '') => {
  return useQuery({
    queryKey: ['departments', page, pageSize, searchTerm],
    queryFn: () =>
      API.get('/auth-service/Department', {
        params: {
          page,
          pageSize,
          searchTerm: searchTerm || undefined,
        },
      }),
  });
};

export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: department => API.post('/auth-service/Department/create', department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: department => API.patch('/auth-service/Department/update', department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: department => API.patch('/auth-service/Department/delete', { Id: department.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
};
