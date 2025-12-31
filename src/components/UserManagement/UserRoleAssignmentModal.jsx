import React, { useState, useEffect } from 'react';
import { X, Shield, UserPlus } from 'lucide-react';
import ContainerHeader from '../ui/ContainerHeader';
import { PERMISSION_MODULES, PERMISSION_TYPES, getPermissionDisplayName } from '../../constants/permissions.const';
import { useGetAllRolesQuery } from '../../queries/roles';
import { useGetRolePermissionsQuery } from '../../queries/rolePermissions';
import { useCreateUserMutation } from '../../queries/users';
import { useCreateUserRolePermissionMutation } from '../../queries/userRolePermissions';

const UserRoleAssignmentModal = ({ isOpen, onClose, user, onUserCreated }) => {
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  // API queries
  const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery(isOpen);
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } = useGetRolePermissionsQuery(selectedRoleId, isOpen && !!selectedRoleId);
  const createUserMutation = useCreateUserMutation();
  const createUserRolePermissionMutation = useCreateUserRolePermissionMutation();

  const roles = rolesData?.data || [];
  const rolePermissions = rolePermissionsData?.data || [];

  // Initialize permissions when role is selected
  useEffect(() => {
    if (selectedRoleId && rolePermissions.length > 0) {
      const defaultPermissions = {};

      // Group permissions by module
      Object.keys(PERMISSION_MODULES).forEach(moduleName => {
        defaultPermissions[moduleName] = [];

        // Get role permissions for this module
        const modulePermissions = rolePermissions.filter(rp => PERMISSION_MODULES[moduleName].includes(rp.permissionName));

        // Add permissions that the role has
        modulePermissions.forEach(rp => {
          if (rp.isGranted) {
            const permissionType = rp.permissionName.split('_').pop();
            defaultPermissions[moduleName].push(permissionType.toLowerCase());
          }
        });
      });

      setUserPermissions(defaultPermissions);
    }
  }, [selectedRoleId, rolePermissions]);

  const handlePermissionChange = (module, permissionType, checked) => {
    setUserPermissions(prev => ({
      ...prev,
      [module]: checked ? [...(prev[module] || []), permissionType] : (prev[module] || []).filter(p => p !== permissionType),
    }));
  };

  const handleCreateUser = async () => {
    if (!selectedRoleId || !user) return;

    setIsCreating(true);
    try {
      // Create user
      const userData = {
        displayName: user.displayName,
        email: user.email,
        samAccountName: user.samAccountName,
        adguid: user.adguid,
        adsid: user.adsid,
        isActive: true,
        systemId: 2,
      };

      const userResult = await createUserMutation.mutateAsync(userData);

      if (userResult.succeeded && userResult.data) {
        const userId = userResult.data.id;

        // Create user role permission
        const userRolePermissionData = {
          userId: userId,
          roleId: selectedRoleId,
          isActive: true,
        };

        await createUserRolePermissionMutation.mutateAsync(userRolePermissionData);

        // Create individual user permissions
        const permissionPromises = [];

        Object.entries(userPermissions).forEach(([module, permissions]) => {
          permissions.forEach(permissionType => {
            const permissionName = PERMISSION_MODULES[module].find(p => p.endsWith(`_${permissionType.toUpperCase()}`));

            if (permissionName) {
              permissionPromises.push(
                createUserRolePermissionMutation.mutateAsync({
                  userId: userId,
                  roleId: selectedRoleId,
                  permissionName: permissionName,
                  isGranted: true,
                  isActive: true,
                })
              );
            }
          });
        });

        await Promise.all(permissionPromises);

        onUserCreated({
          idInt: userId,
          displayName: user.displayName,
          name: user.displayName,
          email: user.email,
          samAccountName: user.samAccountName,
          adguid: user.adguid,
          adsid: user.adsid,
          role: roles.find(r => r.id === selectedRoleId)?.englishName || 'Unknown Role',
          status: 'Active',
          lastLogin: 'Never',
          userPermissions: userPermissions,
        });

        onClose();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <ContainerHeader title={`Assign Role & Permissions: ${user.displayName}`} />

        <div className="mt-4">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.displayName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{user.displayName}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">@{user.samAccountName}</p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Select Role</h4>
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

          {/* Permissions Section */}
          {selectedRoleId && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Customize Permissions</h4>
              <p className="text-sm text-gray-600 mb-4">
                Review and customize permissions for this user. Default permissions from the selected role are pre-selected.
              </p>

              {rolePermissionsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading role permissions...</p>
                </div>
              ) : (
                <div className="space-y-4">
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
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors" disabled={isCreating}>
            Cancel
          </button>
          <button
            onClick={handleCreateUser}
            disabled={!selectedRoleId || isCreating}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create User</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRoleAssignmentModal;
