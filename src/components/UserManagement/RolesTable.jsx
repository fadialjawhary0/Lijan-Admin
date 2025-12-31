import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit2, Trash2, Shield, Check, X } from 'lucide-react';
import { useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation, useGetAllRolesQuery } from '../../queries/roles';
import { useDebounce } from '../../hooks/useDebounce';
import usePagination from '../../hooks/usePagination';
import Pagination from '../ui/Pagination';
import AdminTable from '../ui/AdminTable';
import TableSearchBar from '../ui/TableSearchBar';
import ErrorMessage from '../ui/ErrorMessage';

const RolesTable = ({ onViewPermissions }) => {
  const { page, handlePageChange } = usePagination();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: rolesData, isLoading: isLoadingRoles } = useGetAllRolesQuery(page, 5, debouncedSearchTerm);
  const roles = rolesData?.data || [];
  const totalPages = Math.ceil((rolesData?.totalCount || 0) / 5);

  const createRoleMutation = useCreateRoleMutation();
  const updateRoleMutation = useUpdateRoleMutation();
  const deleteRoleMutation = useDeleteRoleMutation();
  const [editingRoleId, setEditingRoleId] = useState(null);
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
      if (editingRoleId) {
        await updateRoleMutation.mutateAsync({ ...data, id: editingRoleId });
        setEditingRoleId(null);
      } else {
        await createRoleMutation.mutateAsync(data);
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

  const handleEdit = role => {
    setNewRow(false);
    setEditingRoleId(role.id);
    reset(role);
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRoleMutation.mutateAsync({ id });
      } catch (error) {
        setError('root', {
          type: 'manual',
          message: 'Failed to delete role. Please try again.',
        });
      }
    }
  };

  const handleCancel = () => {
    reset();
    setEditingRoleId(null);
    setNewRow(false);
  };
  if (isLoadingRoles) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>;
  }

  return (
    <div className="rounded-xl flex-1 flex flex-col pb-4 px-2">
      <div className="flex-1 flex flex-col min-h-0">
        <TableSearchBar
          searchTerm={searchTerm}
          onSearchChange={e => setSearchTerm(e.target.value)}
          searchPlaceholder="Search roles by name..."
          onAddClick={() => {
            setEditingRoleId(null);
            setNewRow(true);
            reset({ englishName: '', arabicName: '', code: '', color: '#000000', description: '' });
          }}
          addButtonText="Add Role"
        />

        <AdminTable>
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header-cell-left">English Name</th>
              <th className="table-header-cell-left">Arabic Name</th>
              <th className="table-header-cell-left">Code</th>
              <th className="table-header-cell-left">Color</th>
              <th className="table-header-cell-left">Description</th>
              <th className="table-header-cell-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {newRow && !editingRoleId && (
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
                  <input type="color" {...register('color', { required: 'Color is required' })} className="input-color-admin" />
                  {errors.color && <ErrorMessage message={errors.color.message} />}
                </td>
                <td className="px-4 py-4">
                  <input
                    type="text"
                    {...register('description', { required: 'Description is required' })}
                    className={`input-admin ${errors.description ? 'input-admin-error' : 'input-admin-default'}`}
                    placeholder="Description"
                  />
                  {errors.description && <ErrorMessage message={errors.description.message} />}
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
            {roles?.length === 0 && !newRow ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No roles found</p>
                    <p className="text-sm">Start by adding your first role to the system.</p>
                  </div>
                </td>
              </tr>
            ) : (
              roles?.map(role => (
                <tr key={role.id} className={editingRoleId === role.id ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    {editingRoleId === role.id ? (
                      <input
                        type="text"
                        {...register('englishName', { required: 'English name is required' })}
                        className={`input-admin ${errors.englishName ? 'input-admin-error' : 'input-admin-default'}`}
                        defaultValue={role.englishName}
                      />
                    ) : (
                      role.englishName
                    )}
                    {editingRoleId === role.id && errors.englishName && <ErrorMessage message={errors.englishName.message} />}
                  </td>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    {editingRoleId === role.id ? (
                      <input
                        type="text"
                        {...register('arabicName', { required: 'Arabic name is required' })}
                        className={`input-admin ${errors.arabicName ? 'input-admin-error' : 'input-admin-default'}`}
                        defaultValue={role.arabicName}
                      />
                    ) : (
                      role.arabicName
                    )}
                    {editingRoleId === role.id && errors.arabicName && <ErrorMessage message={errors.arabicName.message} />}
                  </td>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    {editingRoleId === role.id ? (
                      <input
                        type="text"
                        {...register('code', { required: 'Code is required' })}
                        className={`input-admin ${errors.code ? 'input-admin-error' : 'input-admin-default'}`}
                        defaultValue={role.code}
                      />
                    ) : (
                      role.code
                    )}
                    {editingRoleId === role.id && errors.code && <ErrorMessage message={errors.code.message} />}
                  </td>
                  <td className="px-4 py-3 w-1/12 min-w-[80px] text-xs md:text-sm">
                    {editingRoleId === role.id ? (
                      <input type="color" {...register('color', { required: 'Color is required' })} className="input-color-admin" defaultValue={role.color} />
                    ) : (
                      <div className="color-display-admin" style={{ backgroundColor: role.color }}></div>
                    )}
                    {editingRoleId === role.id && errors.color && <ErrorMessage message={errors.color.message} />}
                  </td>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    {editingRoleId === role.id ? (
                      <input
                        type="text"
                        {...register('description', { required: 'Description is required' })}
                        className={`input-admin ${errors.description ? 'input-admin-error' : 'input-admin-default'}`}
                        defaultValue={role.description}
                      />
                    ) : (
                      role.description
                    )}
                    {editingRoleId === role.id && errors.description && <ErrorMessage message={errors.description.message} />}
                  </td>
                  <td className="px-4 py-3 text-xs md:text-sm">
                    <div className="flex gap-2">
                      {editingRoleId === role.id ? (
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
                          <button onClick={() => handleEdit(role)} className="action-button-edit">
                            <Edit2 size={20} />
                          </button>
                          <button onClick={() => onViewPermissions(role)} className="action-button" title="View Permissions">
                            <Shield size={20} />
                          </button>
                          <button onClick={() => handleDelete(role.id)} className="action-button-delete">
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

export default RolesTable;
