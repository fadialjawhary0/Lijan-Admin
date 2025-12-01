import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { useCreatePermissionMutation, useUpdatePermissionMutation, useDeletePermissionMutation, useGetAllPermissionsQuery } from '../../queries/permissions';
import { useDebounce } from '../../hooks/useDebounce';
import usePagination from '../../hooks/usePagination';
import Pagination from '../ui/Pagination';
import AdminTable from '../ui/AdminTable';
import TableSearchBar from '../ui/TableSearchBar';
import ErrorMessage from '../ui/ErrorMessage';

const PermissionsTable = () => {
  const { page, handlePageChange } = usePagination();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetAllPermissionsQuery(page, 5, debouncedSearchTerm);
  const permissions = permissionsData?.data || [];
  const totalPages = Math.ceil((permissionsData?.totalCount || 0) / 5);

  const createPermissionMutation = useCreatePermissionMutation();
  const updatePermissionMutation = useUpdatePermissionMutation();
  const deletePermissionMutation = useDeletePermissionMutation();
  const [editingPermissionId, setEditingPermissionId] = useState(null);
  const [newRow, setNewRow] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async data => {
    try {
      if (editingPermissionId) {
        await updatePermissionMutation.mutateAsync({ ...data, id: editingPermissionId });
        setEditingPermissionId(null);
      } else {
        await createPermissionMutation.mutateAsync(data);
        setNewRow(false);
      }
      reset();
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Operation failed. Please try again.',
      });
    }
  };

  const handleEdit = permission => {
    setNewRow(false);
    setEditingPermissionId(permission.id);
    reset(permission);
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await deletePermissionMutation.mutateAsync({ id });
      } catch (error) {
        setError('root', {
          type: 'manual',
          message: 'Failed to delete permission. Please try again.',
        });
      }
    }
  };

  const handleCancel = () => {
    reset();
    setEditingPermissionId(null);
    setNewRow(false);
  };
  if (isLoadingPermissions) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>;
  }

  return (
    <div className="rounded-xl flex-1 flex flex-col pb-4 px-2">
      <div className="flex-1 flex flex-col min-h-0">
        <TableSearchBar
          searchTerm={searchTerm}
          onSearchChange={e => setSearchTerm(e.target.value)}
          searchPlaceholder="Search permissions by name..."
          onAddClick={() => {
            setEditingPermissionId(null);
            setNewRow(true);
            reset({ englishName: '', arabicName: '', code: '', description: '' });
          }}
          addButtonText="Add Permission"
        />

        <AdminTable>
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header-cell-left">English Name</th>
              <th className="table-header-cell-left">Arabic Name</th>
              <th className="table-header-cell-left">Code</th>
              <th className="table-header-cell-left">Description</th>
              <th className="table-header-cell-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {newRow && !editingPermissionId && (
              <tr className="bg-gray-50">
                <td className="px-4 py-4">
                  <input
                    type="text"
                    {...register('englishName', { required: 'English name is required' })}
                    className={`input-admin ${errors.englishName ? 'input-admin-error' : 'input-admin-default'}`}
                    placeholder="English Name"
                  />
                  {errors.englishName && <ErrorMessage message={errors.englishName.message} />}
                </td>
                <td className="px-4 py-4">
                  <input
                    type="text"
                    {...register('arabicName', { required: 'Arabic name is required' })}
                    className={`input-admin ${errors.arabicName ? 'input-admin-error' : 'input-admin-default'}`}
                    placeholder="Arabic Name"
                  />
                  {errors.arabicName && <ErrorMessage message={errors.arabicName.message} />}
                </td>
                <td className="px-4 py-4">
                  <input
                    type="text"
                    {...register('code', { required: 'Code is required' })}
                    className={`input-admin ${errors.code ? 'input-admin-error' : 'input-admin-default'}`}
                    placeholder="Code"
                  />
                  {errors.code && <ErrorMessage message={errors.code.message} />}
                </td>
                <td className="px-4 py-4">
                  <input type="text" {...register('description')} className="input-admin input-admin-default" placeholder="Description" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button onClick={handleSubmit(onSubmit)} className="action-button-save">
                      <Check size={20} />
                    </button>
                    <button onClick={handleCancel} className="action-button-cancel">
                      <X size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {permissions?.length === 0 && !newRow ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No permissions found</p>
                    <p className="text-sm">Start by adding your first permission to the system.</p>
                  </div>
                </td>
              </tr>
            ) : (
              permissions?.map(permission => (
                <tr key={permission.id} className={editingPermissionId === permission.id ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    {editingPermissionId === permission.id ? (
                      <input
                        type="text"
                        {...register('englishName', { required: 'English name is required' })}
                        className={`input-admin ${errors.englishName ? 'input-admin-error' : 'input-admin-default'}`}
                        defaultValue={permission.englishName}
                      />
                    ) : (
                      permission.englishName
                    )}
                    {editingPermissionId === permission.id && errors.englishName && <ErrorMessage message={errors.englishName.message} />}
                  </td>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    {editingPermissionId === permission.id ? (
                      <input
                        type="text"
                        {...register('arabicName', { required: 'Arabic name is required' })}
                        className={`input-admin ${errors.arabicName ? 'input-admin-error' : 'input-admin-default'}`}
                        defaultValue={permission.arabicName}
                      />
                    ) : (
                      permission.arabicName
                    )}
                    {editingPermissionId === permission.id && errors.arabicName && <ErrorMessage message={errors.arabicName.message} />}
                  </td>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    {editingPermissionId === permission.id ? (
                      <input
                        type="text"
                        {...register('code', { required: 'Code is required' })}
                        className={`input-admin ${errors.code ? 'input-admin-error' : 'input-admin-default'}`}
                        defaultValue={permission.code}
                      />
                    ) : (
                      permission.code
                    )}
                    {editingPermissionId === permission.id && errors.code && <ErrorMessage message={errors.code.message} />}
                  </td>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    {editingPermissionId === permission.id ? (
                      <input type="text" {...register('description')} className="input-admin input-admin-default" defaultValue={permission.description} />
                    ) : (
                      permission.description || '-'
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs md:text-sm">
                    <div className="flex gap-2">
                      {editingPermissionId === permission.id ? (
                        <>
                          <button onClick={handleSubmit(onSubmit)} className="action-button-save">
                            <Check size={20} />
                          </button>
                          <button onClick={handleCancel} className="action-button-cancel">
                            <X size={20} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(permission)} className="action-button-edit">
                            <Edit2 size={20} />
                          </button>
                          <button onClick={() => handleDelete(permission.id)} className="action-button-delete">
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>

        {errors.root && <div className="mt-4 text-red-500 text-sm">{errors.root.message}</div>}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} variant="gray" />
      </div>
    </div>
  );
};

export default PermissionsTable;
