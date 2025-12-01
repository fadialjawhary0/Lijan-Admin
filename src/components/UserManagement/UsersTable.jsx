import React, { useState } from 'react';
import { Trash2, Shield, Edit, UserPlus, ChevronDown, Users, Mail } from 'lucide-react';
import AdminTable from '../ui/AdminTable';
import TableSearchBar from '../ui/TableSearchBar';
import Pagination from '../ui/Pagination';
import usePagination from '../../hooks/usePagination';
import { formatDateDMY } from '../../utils';
// import UserPermissionsModal from './UserPermissionsModal';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useActivateUserMutation, useDeactivateUserMutation } from '../../queries/users';
import { useDebounce } from '../../hooks/useDebounce';

const UsersTable = ({ searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const { page, handlePageChange } = usePagination();
  const debouncedUsersSearchTerm = useDebounce(searchTerm, 500);

  const pageSize = 5;
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery(debouncedUsersSearchTerm, page, pageSize, true, 2);
  const users = usersData?.data || [];
  const totalPages = Math.ceil(usersData?.totalCount / pageSize);

  // const [showUserPermissionsModal, setShowUserPermissionsModal] = useState(false);
  // const [selectedUser, setSelectedUser] = useState(null);

  const activateUserMutation = useActivateUserMutation();
  const deactivateUserMutation = useDeactivateUserMutation();

  // const handleUserPermissionChange = (userId, module, permission, checked) => {
  //   console.log('User permission change:', { userId, module, permission, checked });
  // };

  // const handleViewUserPermissions = user => {
  //   setSelectedUser(user);
  //   setShowUserPermissionsModal(true);
  // };

  const [showAddUserMenu, setShowAddUserMenu] = useState(false);

  const handleAddUser = () => navigate('add-user');

  const handleAddExternalUser = () => navigate('add-external-user');

  const handleEditUser = user => {
    navigate(`edit-user/${user.id}`, { state: { user } });
  };

  const handleStatusChange = (userId, newStatus) => {
    if (newStatus === 'Active') {
      activateUserMutation.mutate(userId);
    } else {
      deactivateUserMutation.mutate(userId);
    }
  };

  const handleDeleteUser = id => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log('Delete user:', id);
    }
  };


  return (
    <div className="rounded-xl flex-1 flex flex-col pb-4 px-2">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <TableSearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search users by name, email, or role..."
            hideAddButton={true}
          />

          {/* Add User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddUserMenu(!showAddUserMenu)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} />
              <span>Add User</span>
              <ChevronDown size={16} className={`transition-transform ${showAddUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAddUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => {
                    setShowAddUserMenu(false);
                    handleAddUser();
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <Users size={16} className="text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">AD User</p>
                    <p className="text-xs text-gray-500">From Active Directory</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowAddUserMenu(false);
                    handleAddExternalUser();
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <Mail size={16} className="text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">External User</p>
                    <p className="text-xs text-gray-500">Outside Active Directory</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <AdminTable>
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header-cell-left">Name</th>
              <th className="table-header-cell-left">Email</th>
              <th className="table-header-cell-left">Status</th>
              <th className="table-header-cell-left">Last Login</th>
              <th className="table-header-cell-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usersLoading ? (
              <>
              </>
              ) : !users?.length ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Start by adding your first user to the system.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users?.map(user => (
                <tr key={user?.id}>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      {user?.fullName || '-'}
                      {user?.isExternal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Mail size={12} />
                          External
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      {user?.email}
                      {user?.isExternal && !user?.isEmailVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Not Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs md:text-sm">
                    <select
                      value={user?.isActive === true ? 'Active' : 'Inactive'}
                      onChange={e => handleStatusChange(user?.id, e.target.value)}
                      className="input-admin input-admin-default w-28"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 truncate text-xs md:text-sm">{formatDateDMY(user?.lastLogin)}</td>
                  <td className="px-4 py-3 text-xs md:text-sm">
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleEditUser(user)} className="action-button" title="Edit User">
                        <Edit size={20} />
                      </button>
                      {/* <button onClick={() => handleViewUserPermissions(user)} className="action-button" title="View Permissions">
                        <Shield size={20} />
                      </button> */}
                      <button onClick={() => handleDeleteUser(user?.id)} className="action-button-delete" title="Delete User">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>

        {<Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} variant="gray" />}
      </div>
      {/* 
      <UserPermissionsModal
        isOpen={showUserPermissionsModal}
        onClose={() => {
          setShowUserPermissionsModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onPermissionChange={handleUserPermissionChange}
      /> */}
    </div>
  );
};

export default UsersTable;
