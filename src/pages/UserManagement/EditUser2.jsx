import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Shield } from 'lucide-react';
import { useGetAllRolesQuery } from '../../queries/roles';
import { useGetRolePermissionsQuery, useGetAllPermissionsQuery } from '../../queries/rolePermissions';
import { useUpdateUserRolePermissionMutation, useGetUserByIdQuery, useUpdateUserMutation } from '../../queries/users';
import { PERMISSION_MODULES, PERMISSION_TYPES } from '../../constants/permissions.const';
import FormHeader from '../../components/ui/FormHeader';
import { useGetUserRolePermissionsQuery } from '../../queries/userRolePermissions';

const EditUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery(1, 1000, '', true);
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } = useGetRolePermissionsQuery(selectedRoleId, !!selectedRoleId);
  const { data: permissionsData, isLoading: permissionsLoading } = useGetAllPermissionsQuery(1, 1000, '', !!selectedRoleId);
  const { data: detailedUserData, isLoading: userLoading } = useGetUserByIdQuery(user?.id, !!user?.id);

  // Get the user's original role ID to fetch their current permissions
  const originalRoleId = user?.roleId || detailedUserData?.data?.roleId;
  const { data: userRolePermissionData } = useGetUserRolePermissionsQuery(user?.id, originalRoleId);

  // Get the user's current role permissions (this is what we need to delete)
  const currentUserRolePermissions = useMemo(() => {
    return userRolePermissionData?.data?.[0]?.permissions?.map(p => p.id) || [];
  }, [userRolePermissionData]);

  const updateUserRolePermissionMutation = useUpdateUserRolePermissionMutation();

  const roles = rolesData?.data || [];
  const rolePermissions = rolePermissionsData?.data || [];

  useEffect(() => {
    if (user?.permissions && permissionsData?.data) {
      const currentPermissions = {};

      Object.keys(PERMISSION_MODULES).forEach(moduleName => {
        currentPermissions[moduleName] = [];

        Object.values(PERMISSION_TYPES).forEach(permissionType => {
          const permissionTypeLower = permissionType.toLowerCase();

          let moduleKey = '';
          switch (moduleName) {
            case 'Strategy Management':
              moduleKey = 'Strategy';
              break;
            case 'Pillar Management':
              moduleKey = 'Pillers';
              break;
            case 'Perspective Management':
              moduleKey = 'Perspective';
              break;
            case 'Goal Management':
              moduleKey = 'Goals';
              break;
            case 'Initiative Management':
              moduleKey = 'Initiatives';
              break;
            case 'Project Management':
              moduleKey = 'Projects';
              break;
            case 'Milestone Management':
              moduleKey = 'Milestones';
              break;
            case 'Deliverable Management':
              moduleKey = 'Deliverables';
              break;
            case 'Budget Management':
              moduleKey = 'Budget';
              break;
            case 'Benefit Management':
              moduleKey = 'Benefit';
              break;
            case 'Benefit KPI Management':
              moduleKey = 'Benefit KPI';
              break;
            case 'Benefit Report Frequency Management':
              moduleKey = 'Benefit Report';
              break;
            case 'Concern Item Management':
              moduleKey = 'Concern';
              break;
            case 'Conversation Management':
              moduleKey = 'Conversations';
              break;
            case 'Indicator Management':
              moduleKey = 'Indicator';
              break;
            case 'Variable Management':
              moduleKey = 'Variable';
              break;
            default:
              moduleKey = moduleName.replace(' Management', '');
          }

          const actualPermissionName = `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1).toLowerCase()} ${moduleKey}`;

          const permission = permissionsData.data.find(p => p.englishName === actualPermissionName);

          if (permission && user.permissions.some(up => up.id === permission.id)) {
            currentPermissions[moduleName].push(permissionTypeLower);
          }
        });
      });

      setUserPermissions(currentPermissions);
    }
  }, [user?.permissions, permissionsData]);

  useEffect(() => {
    if (selectedRoleId && rolePermissions.length > 0 && permissionsData?.data) {
      const initialRoleId = user?.roleId || detailedUserData?.data?.roleId;

      // If same role, use current user permissions; otherwise use default role permissions
      if (selectedRoleId === initialRoleId && currentUserRolePermissions.length > 0) {
        // Same role: Show current user permissions
        const currentPermissions = {};

        Object.keys(PERMISSION_MODULES).forEach(moduleName => {
          currentPermissions[moduleName] = [];

          Object.values(PERMISSION_TYPES).forEach(permissionType => {
            const permissionTypeLower = permissionType.toLowerCase();

            let moduleKey = '';
            switch (moduleName) {
              case 'Strategy Management':
                moduleKey = 'Strategy';
                break;
              case 'Pillar Management':
                moduleKey = 'Pillers';
                break;
              case 'Perspective Management':
                moduleKey = 'Perspective';
                break;
              case 'Goal Management':
                moduleKey = 'Goals';
                break;
              case 'Initiative Management':
                moduleKey = 'Initiatives';
                break;
              case 'Project Management':
                moduleKey = 'Projects';
                break;
              case 'Milestone Management':
                moduleKey = 'Milestones';
                break;
              case 'Deliverable Management':
                moduleKey = 'Deliverables';
                break;
              case 'Budget Management':
                moduleKey = 'Budget';
                break;
              case 'Benefit Management':
                moduleKey = 'Benefit';
                break;
              case 'Benefit KPI Management':
                moduleKey = 'Benefit KPI';
                break;
              case 'Benefit Report Frequency Management':
                moduleKey = 'Benefit Report';
                break;
              case 'Concern Item Management':
                moduleKey = 'Concern';
                break;
              case 'Conversation Management':
                moduleKey = 'Conversations';
                break;
              case 'Indicator Management':
                moduleKey = 'Indicator';
                break;
              case 'Variable Management':
                moduleKey = 'Variable';
                break;
              default:
                moduleKey = moduleName.replace(' Management', '');
            }

            const actualPermissionName = `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1).toLowerCase()} ${moduleKey}`;

            const permission = permissionsData.data.find(p => p.englishName === actualPermissionName);

            if (permission && currentUserRolePermissions.includes(permission.id)) {
              currentPermissions[moduleName].push(permissionTypeLower);
            }
          });
        });

        setUserPermissions(currentPermissions);
        return; // Exit early
      }

      // Different role: Show default role permissions
      const defaultPermissions = {};

      const assignedPermissionIds = rolePermissions.flatMap(rp => rp.permissions || []).map(p => p.id) || [];

      Object.keys(PERMISSION_MODULES).forEach(moduleName => {
        defaultPermissions[moduleName] = [];

        Object.values(PERMISSION_TYPES).forEach(permissionType => {
          const permissionTypeLower = permissionType.toLowerCase();

          let moduleKey = '';
          switch (moduleName) {
            case 'Strategy Management':
              moduleKey = 'Strategy';
              break;
            case 'Pillar Management':
              moduleKey = 'Pillers';
              break;
            case 'Perspective Management':
              moduleKey = 'Perspective';
              break;
            case 'Goal Management':
              moduleKey = 'Goals';
              break;
            case 'Initiative Management':
              moduleKey = 'Initiatives';
              break;
            case 'Project Management':
              moduleKey = 'Projects';
              break;
            case 'Milestone Management':
              moduleKey = 'Milestones';
              break;
            case 'Deliverable Management':
              moduleKey = 'Deliverables';
              break;
            case 'Budget Management':
              moduleKey = 'Budget';
              break;
            case 'Benefit Management':
              moduleKey = 'Benefit';
              break;
            case 'Benefit KPI Management':
              moduleKey = 'Benefit KPI';
              break;
            case 'Benefit Report Frequency Management':
              moduleKey = 'Benefit Report';
              break;
            case 'Concern Item Management':
              moduleKey = 'Concern';
              break;
            case 'Conversation Management':
              moduleKey = 'Conversations';
              break;
            case 'Indicator Management':
              moduleKey = 'Indicator';
              break;
            case 'Variable Management':
              moduleKey = 'Variable';
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
  }, [selectedRoleId, rolePermissions, permissionsData, currentUserRolePermissions, user?.roleId, detailedUserData?.data?.roleId]);

  useEffect(() => {
    // Only clear permissions if role actually changed from the initial role
    const initialRoleId = user?.roleId || detailedUserData?.data?.roleId;
    if (selectedRoleId && selectedRoleId !== initialRoleId) {
      setUserPermissions({});
    }
  }, [selectedRoleId, user?.roleId, detailedUserData?.data?.roleId]);

  useEffect(() => {
    const roleId = user?.roleId || detailedUserData?.data?.roleId;

    if (roleId && !selectedRoleId) {
      setSelectedRoleId(roleId);
    }
  }, [user?.roleId, detailedUserData?.data?.roleId, selectedRoleId]);

  const handlePermissionChange = (module, permissionType, checked) => {
    setUserPermissions(prev => ({
      ...prev,
      [module]: checked ? [...(prev[module] || []), permissionType] : (prev[module] || []).filter(p => p !== permissionType),
    }));
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      // Step 2: Update role and permissions
      const currentPermissionIds = [];
      Object.entries(userPermissions).forEach(([module, permissions]) => {
        permissions.forEach(permissionType => {
          let moduleKey = '';
          switch (module) {
            case 'Strategy Management':
              moduleKey = 'Strategy';
              break;
            case 'Pillar Management':
              moduleKey = 'Pillers';
              break;
            case 'Perspective Management':
              moduleKey = 'Perspective';
              break;
            case 'Goal Management':
              moduleKey = 'Goals';
              break;
            case 'Initiative Management':
              moduleKey = 'Initiatives';
              break;
            case 'Project Management':
              moduleKey = 'Projects';
              break;
            case 'Milestone Management':
              moduleKey = 'Milestones';
              break;
            case 'Deliverable Management':
              moduleKey = 'Deliverables';
              break;
            case 'Budget Management':
              moduleKey = 'Budget';
              break;
            case 'Benefit Management':
              moduleKey = 'Benefit';
              break;
            case 'Benefit KPI Management':
              moduleKey = 'Benefit KPI';
              break;
            case 'Benefit Report Frequency Management':
              moduleKey = 'Benefit Report';
              break;
            case 'Concern Item Management':
              moduleKey = 'Concern';
              break;
            case 'Conversation Management':
              moduleKey = 'Conversations';
              break;
            case 'Indicator Management':
              moduleKey = 'Indicator';
              break;
            case 'Variable Management':
              moduleKey = 'Variable';
              break;
            default:
              moduleKey = module.replace(' Management', '');
          }

          const actualPermissionName = `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1).toLowerCase()} ${moduleKey}`;

          const permission = permissionsData?.data?.find(p => p.englishName === actualPermissionName);
          if (permission) {
            currentPermissionIds.push(permission.id);
          }
        });
      });

      const initialRoleId = user?.roleId || detailedUserData?.data?.roleId;

      // Calculate what permissions to add and delete
      let added = [];
      let deleted = [];

      if (selectedRoleId !== initialRoleId) {
        // ROLE CHANGED: Delete ALL old permissions, Add ALL new permissions
        deleted = [...currentUserRolePermissions]; // Delete ALL old permissions
        added = [...currentPermissionIds]; // Add ALL new permissions (including any modifications)
      } else {
        // SAME ROLE: Only handle permission differences
        added = currentPermissionIds.filter(id => !currentUserRolePermissions.includes(id));
        deleted = currentUserRolePermissions.filter(id => !currentPermissionIds.includes(id));
      }

      // Only update role/permissions if there are actual changes
      if (added.length > 0 || deleted.length > 0 || selectedRoleId !== initialRoleId) {
        const roleUpdateData = {
          UserId: user.id,
          RoleId: selectedRoleId,
          Added: added.length > 0 ? added : null,
          Deleted: deleted.length > 0 ? deleted : null,
        };


        const roleResult = await updateUserRolePermissionMutation.mutateAsync(roleUpdateData);

        if (!roleResult.succeeded) {
          console.error('Failed to update user role and permissions:', roleResult.errors);
          return;
        }
      }

      // Success - navigate back
      navigate('user-management');
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 bg-white rounded-xl pb-6">
        <div className="text-center py-8">
          <p className="text-gray-600">No user data found. Please go back and try again.</p>
          <button onClick={() => navigate('user-management')} className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Back to User Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-xl pb-6">
      <FormHeader
        icon={<Edit size={32} className="text-primary" />}
        title="Edit User"
        subtitle={`Editing ${userLoading ? 'Loading...' : detailedUserData?.data?.fullName || user?.fullName || user?.email}`}
      />

      <button
        onClick={() => navigate('user-management')}
        className="flex items-center space-x-2 w-full px-6 justify-end text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to User Management</span>
      </button>

      {/* User Information Display */}
      <div className="border border-gray-200 rounded-lg p-6 mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{userLoading ? 'Loading...' : detailedUserData?.data?.fullName || user?.fullName || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{userLoading ? 'Loading...' : detailedUserData?.data?.email || user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <p
              className={`font-medium ${
                userLoading ? 'text-gray-500' : detailedUserData?.data?.isActive || user?.isActive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {userLoading ? 'Loading...' : detailedUserData?.data?.isActive || user?.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Select Role */}
      <div className="border border-gray-200 rounded-lg p-6 mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select Role</h3>

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

      {/* Step 2: Edit Organizational Structure */}
      {selectedRoleId && (
        <div className="border border-gray-200 rounded-lg p-6 mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Edit Organizational Structure</h3>
          <p className="text-sm text-gray-600 mb-4">
            Update the user's organizational structure assignments. Level determines which additional fields are required:
            <br />• <strong>Strategic Level:</strong> No sector or department required
            <br />• <strong>Executive Level:</strong> Sector required, department optional
            <br />• <strong>Operational Level:</strong> Both sector and department required
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={userLoading}
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector 
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={userLoading}
              />
            </div>
              </div>
            </div>
          )}

          {/* Step 3: Customize Permissions */}
      {selectedRoleId && (
        <div className="border border-gray-200 rounded-lg p-6 mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Customize Permissions</h3>
          <p className="text-sm text-gray-600 mb-4">Review and customize permissions for this user. Current permissions are pre-selected.</p>

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
      {selectedRoleId && (
        <div className="flex justify-between items-center mx-4">
          <button
            onClick={() => navigate('user-management')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating User...</span>
              </>
            ) : (
              <>
                <Edit size={16} />
                <span>Update User</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default EditUser;
