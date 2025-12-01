import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';

// Get all departments
export const useGetAllDepartmentsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => API.get('/auth-service/Department'),
    enabled: enabled,
  });
};

// Get departments by sector ID
export const useGetDepartmentsBySectorQuery = (sectorId, enabled = true) => {
  return useQuery({
    queryKey: ['departments', sectorId],
    queryFn: () => API.get(`/auth-service/Department?SectorId=${sectorId}`),
    enabled: enabled && !!sectorId,
  });
};

// Get department by ID
export const useGetDepartmentByIdQuery = (departmentId, enabled = true) => {
  return useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => API.get(`/auth-service/Department/details?Id=${departmentId}`),
    enabled: enabled && !!departmentId,
  });
};

// Create department
export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/auth-service/Department/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
    },
  });
};

// Update department
export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/auth-service/Department/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
    },
  });
};

// Delete department
export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/auth-service/Department/delete', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
    },
  });
};
