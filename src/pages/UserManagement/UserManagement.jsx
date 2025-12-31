import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users } from 'lucide-react';
import FormHeader from '../../components/ui/FormHeader';
import UsersTable from '../../components/UserManagement/UsersTable';
import RolesTable from '../../components/UserManagement/RolesTable';
import PermissionsTable from '../../components/UserManagement/PermissionsTable';
import RolePermissionsModal from '../../components/UserManagement/RolePermissionsModal';
import usePagination from '../../hooks/usePagination';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');

  const [usersSearchTerm, setUsersSearchTerm] = useState('');

  const { page, handlePageChange } = usePagination();

  const [showRolePermissionsModal, setShowRolePermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleRolePermissionChange = (roleId, module, permission, checked) => {
    console.log('Role permission change:', { roleId, module, permission, checked });
  };

  const handleViewRolePermissions = role => {
    setSelectedRole(role);
    setShowRolePermissionsModal(true);
  };

  const handleTabChange = tabName => {
    setActiveTab(tabName);
    setUsersSearchTerm('');
  };

  return (
    <div className="space-y-6 bg-white rounded-xl">
      <FormHeader icon={<Users size={32} className="text-primary" />} title="User Management" subtitle="Manage system users, roles, and permissions" />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="ml-4 flex space-x-8">
          <button
            onClick={() => handleTabChange('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleTabChange('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Roles
          </button>
          <button
            onClick={() => handleTabChange('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Permissions
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UsersTable searchTerm={usersSearchTerm} onSearchChange={e => setUsersSearchTerm(e.target.value)} />}

      {activeTab === 'roles' && <RolesTable onViewPermissions={handleViewRolePermissions} />}

      {activeTab === 'permissions' && <PermissionsTable />}

      {/* Modals */}

      <RolePermissionsModal
        isOpen={showRolePermissionsModal}
        onClose={() => {
          setShowRolePermissionsModal(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        onPermissionChange={handleRolePermissionChange}
      />
    </div>
  );
};

export default UserManagement;
