import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Shield } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { usePostAdMutation } from '../../queries/ad';
import { useGetAllRolesQuery } from '../../queries/roles';
import { useGetRolePermissionsQuery } from '../../queries/rolePermissions';
import { useGetAllPermissionsQuery } from '../../queries/permissions';
import { useCreateUserMutation } from '../../queries/users';
import { PERMISSION_MODULES, PERMISSION_TYPES } from '../../constants/permissions.const';
import FormHeader from '../../components/ui/FormHeader';

const AddUser = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: adData, isLoading: isAdLoading } = usePostAdMutation(debouncedSearchTerm, debouncedSearchTerm.trim() !== '');
  const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery(true);
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } = useGetRolePermissionsQuery(selectedRoleId, !!selectedRoleId);
  const { data: permissionsData, isLoading: permissionsLoading } = useGetAllPermissionsQuery(1, 1000, '', !!selectedRoleId);
  const createUserMutation = useCreateUserMutation();

  const roles = rolesData?.data || [];
  const rolePermissions = rolePermissionsData?.data || [];

  useEffect(() => {
    if (selectedRoleId && rolePermissions.length > 0 && permissionsData?.data) {
      const defaultPermissions = {};

      const assignedPermissionIds = rolePermissions.flatMap(rp => rp.permissions || []).map(p => p.id) || [];

      Object.keys(PERMISSION_MODULES).forEach(moduleName => {
        defaultPermissions[moduleName] = [];

        Object.values(PERMISSION_TYPES).forEach(permissionType => {
          const permissionTypeLower = permissionType.toLowerCase();

          let moduleKey = '';
          switch (moduleName) {
            case 'Committee Management': 
              moduleKey = 'Committee';
              break;
            case 'Document Management':
              moduleKey = 'Document';
              break;
            case 'Meeting Management':
              moduleKey = 'Meeting';
              break;
            case 'Decision Management':
              moduleKey = 'Decision';
              break;
            case 'Member Management':
              moduleKey = 'Member';
              break;
            case 'Voting Management':
              moduleKey = 'Voting';
              break;
            case 'Task Management':
              moduleKey = 'Task';
              break;
            case 'Calendar Management':
              moduleKey = 'Calendar';
              break;
            default:
              moduleKey = moduleName.replace(' Management', '');
          }

          const actualPermissionName = `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1).toLowerCase()} ${moduleKey}`;

          const permission = permissionsData.data.find(p => p.englishName === actualPermissionName);

          if (permission && assignedPermissionIds.includes(permission.id)) {
            defaultPermissions[moduleName].push(permissionTypeLower);
          }
        });
      });

      setUserPermissions(defaultPermissions);
    }
  }, [selectedRoleId, rolePermissions, permissionsData]);

  const handleUserSelect = user => {
    setSelectedUser(user);
  };

  const handlePermissionChange = (module, permissionType, checked) => {
    setUserPermissions(prev => ({
      ...prev,
      [module]: checked ? [...(prev[module] || []), permissionType] : (prev[module] || []).filter(p => p !== permissionType),
    }));
  };

  const handleCreateUser = async () => {
    if (!selectedUser || !selectedRoleId) return;

    setIsCreating(true);
    try {
      const permissionIds = [];
      Object.entries(userPermissions).forEach(([module, permissions]) => {
        permissions.forEach(permissionType => {
          let moduleKey = '';
          switch (module) {
            case 'Committee Management':
              moduleKey = 'Committee';
              break;
            case 'Document Management':
              moduleKey = 'Document';
              break;
            case 'Meeting Management':
              moduleKey = 'Meeting';
              break;
            case 'Decision Management':
              moduleKey = 'Decision';
              break;
            case 'Member Management':
              moduleKey = 'Member';
              break;
            case 'Voting Management':
              moduleKey = 'Voting';
              break;
            case 'Task Management':
              moduleKey = 'Task';
              break;
            case 'Calendar Management':
              moduleKey = 'Calendar';
              break;
            default:
              moduleKey = module.replace(' Management', '');
          }

          const actualPermissionName = `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1).toLowerCase()} ${moduleKey}`;

          const permission = permissionsData?.data?.find(p => p.englishName === actualPermissionName);
          if (permission) {
            permissionIds.push(permission.id);
          }
        });
      });

      if (permissionIds.length === 0) {
        console.error('No permissions selected!');
        return;
      }

      if (!selectedUser?.adguid) {
        console.error('No AD GUID found!');
        return;
      }

      const userData = {
        UserId: selectedUser.adguid,
        RoleId: selectedRoleId,
        PermissionIds: permissionIds,
        SystemId: 2,
      };

      const result = await createUserMutation.mutateAsync(userData);

      if (result.succeeded) {
        navigate('user-management');
      } else {
        console.error('Failed to create user:', result.errors);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-xl pb-6">
      <FormHeader
        icon={<UserPlus size={32} className="text-primary" />}
        title="Add New User"
        subtitle="Search Active Directory and assign role & permissions"
      />

      <button
        onClick={() => navigate('user-management')}
        className="flex items-center space-x-2 w-full px-6 justify-end text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to User Management</span>
      </button>

      {/* Step 1: Search Active Directory */}
      <div className="border border-gray-200 rounded-lg p-6 mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Search Active Directory</h3>

        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {isAdLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Searching Active Directory...</p>
          </div>
        )}

        {!isAdLoading && adData?.data && adData.data.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {adData.data.map(user => (
              <div
                key={user.adguid}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.adguid === user.adguid ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.displayName
                        ?.split(' ')
                        ?.map(n => n[0])
                        ?.join('')
                        ?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{user?.displayName}</h4>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <p className="text-xs text-gray-500">@{user?.samAccountName}</p>
                  </div>
                </div>
                {selectedUser?.adguid === user.adguid && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isAdLoading && adData?.data && adData.data.length === 0 && searchTerm.trim() !== '' && (
          <div className="text-center py-8">
            <p className="text-gray-600">No users found matching "{searchTerm}"</p>
          </div>
        )}

        {!isAdLoading && !adData?.data && searchTerm.trim() === '' && (
          <div className="text-center py-8">
            <p className="text-gray-600">Start typing to search for users in Active Directory</p>
          </div>
        )}
      </div>

      {/* Step 2: Select Role */}
      {selectedUser && (
        <div className="border border-gray-200 rounded-lg p-6 mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Select Role</h3>

          {rolesLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading roles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roles.map(role => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRoleId === role.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Shield className={`w-5 h-5 ${selectedRoleId === role.id ? 'text-primary' : 'text-gray-400'}`} />
                    <div>
                      <h5 className="font-medium text-gray-900">{role.englishName}</h5>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    

      {/* Step 4: Customize Permissions */}
      {selectedUser && selectedRoleId && (
        <div className="border border-gray-200 rounded-lg p-6 mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 4: Customize Permissions</h3>
          <p className="text-sm text-gray-600 mb-4">
            Review and customize permissions for this user. Default permissions from the selected role are pre-selected.
          </p>

          {rolePermissionsLoading || permissionsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading permissions...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(PERMISSION_MODULES).map(([moduleName, permissions]) => (
                <div key={moduleName} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">{moduleName}</h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.values(PERMISSION_TYPES).map(permissionType => {
                      const permissionTypeLower = permissionType.toLowerCase();
                      const isChecked = userPermissions[moduleName]?.includes(permissionTypeLower) || false;

                      return (
                        <label key={permissionType} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => handlePermissionChange(moduleName, permissionTypeLower, e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 capitalize">{permissionType}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {selectedUser && selectedRoleId && (
        <div className="flex justify-end space-x-3 mx-4">
          <button
            onClick={() => navigate('user-management')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateUser}
            disabled={isCreating}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating User...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create User</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
