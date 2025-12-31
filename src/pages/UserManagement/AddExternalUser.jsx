import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, Mail, User, Phone } from 'lucide-react';
import { useGetAllRolesQuery } from '../../queries/roles';
import { useGetRolePermissionsQuery } from '../../queries/rolePermissions';
import { useGetAllPermissionsQuery } from '../../queries/permissions';
import { useCreateExternalUserMutation } from '../../queries/users';
import { PERMISSION_MODULES, PERMISSION_TYPES } from '../../constants/permissions.const';
import FormHeader from '../../components/ui/FormHeader';

const AddExternalUser = () => {
  const navigate = useNavigate();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [thirdName, setThirdName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery(true);
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } = useGetRolePermissionsQuery(selectedRoleId, !!selectedRoleId);
  const { data: permissionsData, isLoading: permissionsLoading } = useGetAllPermissionsQuery(1, 1000, '', !!selectedRoleId);
  const createExternalUserMutation = useCreateExternalUserMutation();

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
          let moduleKey = getModuleKey(moduleName);
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

  const getModuleKey = moduleName => {
    const moduleMap = {
      'Strategy Management': 'Strategy',
      'Pillar Management': 'Pillers',
      'Perspective Management': 'Perspective',
      'Goal Management': 'Goals',
      'Initiative Management': 'Initiatives',
      'Project Management': 'Projects',
      'Milestone Management': 'Milestones',
      'Deliverable Management': 'Deliverables',
      'Budget Management': 'Budget',
      'Benefit Management': 'Benefit',
      'Benefit KPI Management': 'Benefit KPI',
      'Benefit Report Frequency Management': 'Benefit Report',
      'Concern Item Management': 'Concern',
      'Conversation Management': 'Conversations',
      'Indicator Management': 'Indicator',
      'Variable Management': 'Variable',
    };
    return moduleMap[moduleName] || moduleName.replace(' Management', '');
  };

  const handlePermissionChange = (module, permissionType, checked) => {
    setUserPermissions(prev => ({
      ...prev,
      [module]: checked ? [...(prev[module] || []), permissionType] : (prev[module] || []).filter(p => p !== permissionType),
    }));
  };

  const handleCreateUser = async () => {
    if (!firstName || !lastName || !email || !selectedRoleId) {
      alert('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsCreating(true);
    try {
      const permissionIds = [];
      Object.entries(userPermissions).forEach(([module, permissions]) => {
        permissions.forEach(permissionType => {
          const moduleKey = getModuleKey(module);
          const actualPermissionName = `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1).toLowerCase()} ${moduleKey}`;
          const permission = permissionsData?.data?.find(p => p.englishName === actualPermissionName);
          if (permission) {
            permissionIds.push(permission.id);
          }
        });
      });

      if (permissionIds.length === 0) {
        alert('Please select at least one permission');
        return;
      }

      const userData = {
        FirstName: firstName,
        SecondName: secondName || null,
        ThirdName: thirdName || null,
        LastName: lastName,
        Email: email,
        PhoneNumber: phoneNumber || null,
        RoleId: selectedRoleId,
        PermissionIds: permissionIds,
        SystemId: 2,
      };

      const result = await createExternalUserMutation.mutateAsync(userData);

      if (result.succeeded) {
        alert('External user created successfully! An email has been sent to the user with login credentials.');
        navigate('user-management');
      } else {
        alert(`Failed to create user: ${result.errors?.join(', ') || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error creating user: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-xl pb-6">
      <FormHeader
        icon={<UserPlus size={32} className="text-primary" />}
        title="Add External User"
        subtitle="Create a new user account outside Active Directory"
      />

      <button
        onClick={() => navigate('user-management')}
        className="flex items-center space-x-2 w-full px-6 justify-end text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to User Management</span>
      </button>

      {/* Step 1: User Information */}
      <div className="border border-gray-200 rounded-lg p-6 mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: User Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Second Name</label>
            <input
              type="text"
              value={secondName}
              onChange={e => setSecondName(e.target.value)}
              placeholder="Enter second name (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Third Name</label>
            <input
              type="text"
              value={thirdName}
              onChange={e => setThirdName(e.target.value)}
              placeholder="Enter third name (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+966 XX XXX XXXX (optional)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> A temporary password will be automatically generated and sent to the user's email. The user will be required to change it
            upon first login.
          </p>
        </div>
      </div>

      {/* Step 2: Select Role */}
      {firstName && lastName && email && (
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

      {/* Step 3: Select Organizational Structure */}
      {selectedRoleId && (
        <div className="border border-gray-200 rounded-lg p-6 mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Select Organizational Structure</h3>
          <p className="text-sm text-gray-600 mb-4">
            Organization is auto-selected. Level determines which additional fields are required:
            <br />• <strong>Strategic Level:</strong> No sector or department required
            <br />• <strong>Executive Level:</strong> Sector required, department optional
            <br />• <strong>Operational Level:</strong> Both sector and department required
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization *</label>
              {organizationsLoading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <select
                  value={selectedOrganizationId || ''}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 cursor-not-allowed"
                >
                  {organizations.map(org => (
                    <option key={org.idInt} value={org.idInt}>
                      {org.englishName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
              {levelsLoading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <select
                  value={selectedLevelId || ''}
                  onChange={e => {
                    const newLevelId = e.target.value ? parseInt(e.target.value) : null;
                    setSelectedLevelId(newLevelId);
                    setSelectedSectorId(null);
                    setSelectedDepartmentId(null);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Level</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.englishName} {level.code ? `(${level.code})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
              {positionsLoading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <select
                  value={selectedPositionId || ''}
                  onChange={e => setSelectedPositionId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Position</option>
                  {positions.map(position => (
                    <option key={position.id} value={position.id}>
                      {position.englishName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector {(isExecutiveLevel(selectedLevelId) || isOperationalLevel(selectedLevelId)) && <span className="text-red-500">*</span>}
              </label>
              {sectorsLoading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <select
                  value={selectedSectorId || ''}
                  onChange={e => {
                    setSelectedSectorId(e.target.value ? parseInt(e.target.value) : null);
                    setSelectedDepartmentId(null);
                  }}
                  disabled={isStrategicLevel(selectedLevelId)}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    isStrategicLevel(selectedLevelId) ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">{isStrategicLevel(selectedLevelId) ? 'Not required for Strategic Level' : 'Select Sector'}</option>
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id}>
                      {sector.englishName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department {isOperationalLevel(selectedLevelId) && <span className="text-red-500">*</span>}
              </label>
              {departmentsLoading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <select
                  value={selectedDepartmentId || ''}
                  onChange={e => {
                    setSelectedDepartmentId(e.target.value ? parseInt(e.target.value) : null);
                  }}
                  disabled={isStrategicLevel(selectedLevelId) || isExecutiveLevel(selectedLevelId)}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    isStrategicLevel(selectedLevelId) || isExecutiveLevel(selectedLevelId) ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">
                    {isStrategicLevel(selectedLevelId) || isExecutiveLevel(selectedLevelId) ? 'Not required for this level' : 'Select Department'}
                  </option>
                  {departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.englishName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Customize Permissions */}
      {selectedRoleId && selectedOrganizationId && selectedLevelId && selectedPositionId && (
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
      {selectedRoleId && selectedOrganizationId && selectedLevelId && selectedPositionId && (
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
                <span>Create External User</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddExternalUser;
