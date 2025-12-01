import React, { useState, useEffect } from 'react';
import { X, Shield, Save } from 'lucide-react';
import ContainerHeader from '../ui/ContainerHeader';
import { PERMISSION_MODULES, PERMISSION_TYPES } from '../../constants/permissions.const';
import { useGetAllPermissionsQuery } from '../../queries/permissions';
import { useGetRolePermissionsQuery } from '../../queries/rolePermissions';
import { useUpdateRolePermissionMutation } from '../../queries/rolePermissions';

const RolePermissionsModal = ({ isOpen, onClose, role, onPermissionChange }) => {
  const [rolePermissions, setRolePermissions] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // API queries
  const { data: permissionsData, isLoading: permissionsLoading } = useGetAllPermissionsQuery(1, 1000, '', isOpen);
  console.log('🚀 ~ RolePermissionsModal ~ permissionsData:', permissionsData);
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } = useGetRolePermissionsQuery(role?.id, isOpen && !!role?.id);
  const updateRolePermissionMutation = useUpdateRolePermissionMutation();

  // Initialize permissions when role permissions data is loaded
  useEffect(() => {
    if (permissionsData?.data) {
      const permissions = {};

      // Get all permission IDs that are assigned to this role (empty array if no role permissions)
      const assignedPermissionIds = rolePermissionsData?.data?.flatMap(rp => rp.permissions || []).map(p => p.id) || [];

      // Group permissions by module
      Object.keys(PERMISSION_MODULES).forEach(moduleName => {
        permissions[moduleName] = [];

        // For each permission type (View, Create, Update, Delete, Export)
        Object.values(PERMISSION_TYPES).forEach(permissionType => {
          const permissionTypeLower = permissionType.toLowerCase();

          // Map module name to the actual permission name format
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
            case 'KPI Management':
              moduleKey = 'KPI';
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

          // Construct the actual permission name
          const actualPermissionName = `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1).toLowerCase()} ${moduleKey}`;

          // Find this permission in the permissions data
          const permission = permissionsData.data.find(p => p.englishName === actualPermissionName);

          // If this permission exists and is assigned to the role, mark it as checked
          if (permission && assignedPermissionIds.includes(permission.id)) {
            permissions[moduleName].push(permissionTypeLower);
          }
        });
      });

      setRolePermissions(permissions);
    }
  }, [rolePermissionsData, permissionsData]);

  const handlePermissionChange = (module, permissionType, checked) => {
    setRolePermissions(prev => ({
      ...prev,
      [module]: checked ? [...(prev[module] || []), permissionType] : (prev[module] || []).filter(p => p !== permissionType),
    }));
  };

  const handleSavePermissions = async () => {
    if (!role?.id) return;

    setIsSaving(true);
    try {
      const permissionIds = [];
      Object.entries(rolePermissions).forEach(([module, permissions]) => {
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
            case 'KPI Management':
              moduleKey = 'KPI';
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

          // Construct the actual permission name
          const actualPermissionName = `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1).toLowerCase()} ${moduleKey}`;

          // Find the permission ID from permissions data
          const permission = permissionsData?.data?.find(p => p.englishName === actualPermissionName);
          if (permission) {
            permissionIds.push(permission.id);
          }
        });
      });

      // Get current role permission IDs
      const currentRolePermissionIds = rolePermissionsData?.data?.flatMap(rp => rp.permissions || []).map(p => p.id) || [];

      // Calculate added and deleted permissions
      const addedPermissionIds = permissionIds.filter(id => !currentRolePermissionIds.includes(id));
      const deletedPermissionIds = currentRolePermissionIds.filter(id => !permissionIds.includes(id));

      const updateData = {
        roleId: role.id,
        added: addedPermissionIds.length > 0 ? addedPermissionIds : null,
        deleted: deletedPermissionIds.length > 0 ? deletedPermissionIds : null,
      };

      await updateRolePermissionMutation.mutateAsync(updateData);
      onClose();
    } catch (error) {
      console.error('Error updating role permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <ContainerHeader title={`Role Permissions: ${role.englishName || role.name || 'Unknown Role'}`} />

        <div className="mt-4">
          <p className="text-gray-600 mb-4 px-4">{role.description || 'No description available'}</p>
          <p className="text-sm text-gray-600 mb-4 px-4">
            Manage default permissions for this role. These permissions will be automatically assigned to users with this role.
          </p>

          {permissionsLoading || rolePermissionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading permissions...</p>
            </div>
          ) : (
            <div className="space-y-4 px-4">
              {Object.entries(PERMISSION_MODULES).map(([moduleName, permissions]) => (
                <div key={moduleName} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">{moduleName}</h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.values(PERMISSION_TYPES).map(permissionType => {
                      const permissionTypeLower = permissionType.toLowerCase();
                      const isChecked = rolePermissions[moduleName]?.includes(permissionTypeLower) || false;

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

        <div className="flex justify-end space-x-3 mt-6 px-4 pb-4">
          <button onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors" disabled={isSaving}>
            Cancel
          </button>
          <button
            onClick={handleSavePermissions}
            disabled={isSaving}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Permissions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsModal;
