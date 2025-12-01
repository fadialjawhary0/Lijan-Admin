import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import ContainerHeader from '../ui/ContainerHeader';
import { PERMISSION_MODULES, PERMISSIONS } from '../../constants/permissions.const';
import { useUpdateUserRolePermissionMutation } from '../../queries/userRolePermissions';
import { useGetAllPermissionsQuery } from '../../queries/permissions';

const UserPermissionsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const [localUserPermissions, setLocalUserPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const userPermissionCodes = user?.userRolePermission?.flatMap(urp => urp?.codes || []) || [];
  const originalCodesRef = React.useRef([]);

  const updateUserRolePermissionMutation = useUpdateUserRolePermissionMutation();
  const { data: allPermissionsData } = useGetAllPermissionsQuery(1, 1000, '', true);

  useEffect(() => {
    setLocalUserPermissions(userPermissionCodes);
    originalCodesRef.current = userPermissionCodes;
    setError(null);
  }, [user]);

  const getPermissionCode = (moduleName, permissionType) => {
    const modulePermissions = PERMISSION_MODULES[moduleName];
    if (!modulePermissions) return null;

    const result = modulePermissions.find(perm => perm.endsWith(`_${permissionType.toUpperCase()}`));
    return result || null;
  };

  const isPermissionGranted = (moduleName, permissionType) => {
    const apiCode = getPermissionCode(moduleName, permissionType);
    return apiCode && Array.isArray(localUserPermissions) && localUserPermissions.includes(apiCode);
  };

  const handleSave = async () => {
    if (!allPermissionsData?.data) {
      setError('Permissions data not loaded. Please try again.');
      return;
    }

    const current = Array.isArray(localUserPermissions) ? localUserPermissions : [];
    const original = Array.isArray(originalCodesRef.current) ? originalCodesRef.current : [];

    const originalSet = new Set(original);
    const currentSet = new Set(current);

    const addedCodes = current.filter(code => !originalSet.has(code));
    const deletedCodes = original.filter(code => !currentSet.has(code));

    const codeToIdMap = {};
    const allPermissions = allPermissionsData?.data || [];

    allPermissions.forEach(permission => {
      if (permission.code && permission.id) {
        codeToIdMap[permission.code] = permission.id;
      }
    });

    const addedIds = addedCodes?.map(code => codeToIdMap[code])?.filter(id => id != null);
    const deletedIds = deletedCodes?.map(code => codeToIdMap[code])?.filter(id => id != null);

    if (!addedIds.length && !deletedIds.length) {
      onClose();
      return;
    }

    const roleId = user?.userRolePermission?.[0]?.roleId;

    setIsSaving(true);
    setError(null);

    try {
      await updateUserRolePermissionMutation.mutateAsync({
        userId: user.id,
        roleId: roleId,
        added: addedIds,
        deleted: deletedIds,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update permissions:', error);
      setError('Failed to update permissions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const onPermissionChange = (moduleName, permissionType, checked) => {
    const apiCode = getPermissionCode(moduleName, permissionType);
    if (!apiCode) return;

    setLocalUserPermissions(prev => {
      const current = Array.isArray(prev) ? prev : [];
      if (checked) {
        return current.includes(apiCode) ? current : [...current, apiCode];
      }
      return current.filter(code => code !== apiCode);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <ContainerHeader title={`User Permissions: ${user.fullName}`} />

        <div className="mt-4">
          <div className="px-4">
            <div className="text-sm text-gray-600 mb-2">
              Role: {user.englishRoleName || '-'} | Email: {user.email}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Customize individual permissions for this user. These permissions override the default role permissions.
            </p>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
          </div>

          <div className="space-y-4 px-4">
            {Object.entries(PERMISSION_MODULES).map(([moduleName]) => (
              <div key={moduleName} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">{moduleName}</h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Array.from(new Set((PERMISSION_MODULES[moduleName] || []).map(permConst => permConst.split('_').pop().toLowerCase()))).map(
                    permissionTypeLower => {
                      const isChecked = isPermissionGranted(moduleName, permissionTypeLower);
                      const label = permissionTypeLower.charAt(0).toUpperCase() + permissionTypeLower.slice(1);

                      return (
                        <label key={permissionTypeLower} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => onPermissionChange(moduleName, permissionTypeLower, e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 px-4 pb-4">
          <button onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors" disabled={isSaving}>
            Cancel
          </button>
          <button
            onClick={handleSave}
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
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsModal;
