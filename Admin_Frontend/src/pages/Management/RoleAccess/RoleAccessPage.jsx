import React, { useState, useEffect } from 'react';
import { Plus, Shield, X, Trash2, Save, Check } from 'lucide-react';
import AdminHeaderActions from '../../../components/AdminHeaderActions';
import AdminDropdown from '../../../components/AdminDropdown';
import {
  getStoredRoles,
  getStoredUsers,
  saveStoredRoles,
  saveStoredUsers,
  getStoredPermissionsMap,
  saveStoredPermissionsMap,
  DEFAULT_MODULE_PERMISSIONS
} from '../../../services/adminStorage';
import {
  getAdminRoles,
  createAdminRole,
  updateAdminRolePermissions,
  getManagementStaffUsers
} from '../../../services/adminApi';

// Helper to format Role ID
const formatRoleId = (num) => `R_ID${String(num).padStart(2, '0')}`;

export default function RoleAccessPage() {
  const [rolesList, setRolesList] = useState(() => getStoredRoles());
  const [usersList, setUsersList] = useState(() => getStoredUsers());

  // Fetch roles and users from MongoDB backend on mount
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [rolesRes, usersRes] = await Promise.all([
          getAdminRoles().catch(() => null),
          getManagementStaffUsers().catch(() => null)
        ]);

        if (rolesRes?.success && rolesRes.roles) {
          const mappedRoles = rolesRes.roles.map((r) => ({
            id: r.roleId || r._id,
            name: r.roleName,
            designation: r.designation,
            permissions: r.permissions || []
          }));
          setRolesList(mappedRoles);
          saveStoredRoles(mappedRoles);

          // Populate permissions map from DB roles
          const permMap = getStoredPermissionsMap();
          // Always ensure Admin has full access by default
          const allAdminEnabled = DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p, enabled: true }));
          permMap['Admin'] = allAdminEnabled;
          permMap['All Admin'] = allAdminEnabled;
          permMap['Super Administrator (Admin)'] = allAdminEnabled;

          rolesRes.roles.forEach((r) => {
            if (r.permissions && r.permissions.length > 0) {
              permMap[r.roleName] = r.permissions;
              permMap[`All ${r.designation || r.roleName}`] = r.permissions;
              if (r.appliedPersonId) {
                permMap[r.appliedPersonId] = r.permissions;
              }
              if (r.appliedPersonName) {
                permMap[`${r.appliedPersonName} (${r.appliedPersonId})`] = r.permissions;
              }
            }
          });
          saveStoredPermissionsMap(permMap);
        }

        if (usersRes?.success && usersRes.users && usersRes.users.length > 0) {
          const mappedUsers = usersRes.users.map((u, i) => ({
            sNo: i + 1,
            name: u.name,
            userId: u.userId,
            designation: u.designation,
            roleId: u.roleId,
            teamHead: Boolean(u.teamHead),
            createdDate: new Date(u.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            email: u.email,
            status: u.status || 'Active'
          }));
          const hasAdmin = mappedUsers.some((u) => String(u.userId || '').toLowerCase() === 'admin');
          const finalUsers = hasAdmin
            ? mappedUsers
            : [
              {
                sNo: 1,
                name: 'Super Administrator',
                userId: 'Admin',
                designation: 'Admin',
                roleId: 'R_ID01',
                teamHead: true,
                createdDate: 'Jan 1, 2026',
                email: 'admin@flipibook.com',
                status: 'Active'
              },
              ...mappedUsers.map((u, idx) => ({ ...u, sNo: idx + 2 }))
            ];
          setUsersList(finalUsers);
          saveStoredUsers(finalUsers);
        } else {
          setUsersList(getStoredUsers());
        }
      } catch (err) {
        console.error('Error fetching role access from backend:', err);
      }
    };

    fetchBackendData();

    const handleSyncRoles = () => setRolesList(getStoredRoles());
    const handleSyncUsers = () => setUsersList(getStoredUsers());

    window.addEventListener('flipibook_roles_updated', handleSyncRoles);
    window.addEventListener('flipibook_users_updated', handleSyncUsers);

    return () => {
      window.removeEventListener('flipibook_roles_updated', handleSyncRoles);
      window.removeEventListener('flipibook_users_updated', handleSyncUsers);
    };
  }, []);

  // Designations list populated by user-added roles AND any designations typed in User Management
  const designationsList = React.useMemo(() => {
    const list = [];
    // 1. Roles added via + Add Roles
    rolesList.forEach((r) => {
      const name = (r.name || r.roleName || '').trim();
      if (name && !list.some((item) => item.toLowerCase() === name.toLowerCase())) {
        list.push(name);
      }
    });
    // 2. Custom designations entered on users
    usersList.forEach((u) => {
      const desig = (u.designation || '').trim();
      if (desig && !list.some((item) => item.toLowerCase() === desig.toLowerCase())) {
        list.push(desig);
      }
    });
    return list;
  }, [rolesList, usersList]);

  const [designation, setDesignation] = useState('');
  const [applyTo, setApplyTo] = useState('');

  // Compute dynamic "Apply To" options based on the chosen designation/role
  const applyToOptions = React.useMemo(() => {
    const options = [];

    // Filter users assigned to this role or designation
    const assignedUsers = usersList.filter((u) => {
      if (!designation) return false;
      const desigClean = designation.trim().toLowerCase();
      const matchedRole = rolesList.find((r) => r.id === u.roleId);
      const userRoleName = (matchedRole?.name || u.roleId || '').trim().toLowerCase();
      const userDesig = (u.designation || '').trim().toLowerCase();

      return (
        userRoleName === desigClean ||
        userDesig === desigClean ||
        // Also match variations like "software developer" vs "software development"
        userDesig.startsWith(desigClean.slice(0, 8)) ||
        desigClean.startsWith(userDesig.slice(0, 8))
      );
    });

    // Check if any user in this designation is assigned as a Team Head
    const hasTeamLeads = assignedUsers.some((u) => u.teamHead);

    // 1. Only show "All <Designation>" if there are at least 2 users under this designation
    if (designation && assignedUsers.length >= 2) {
      options.push({ label: `All ${designation}`, value: `All ${designation}` });
    }

    // 2. Only show "Team Leads" if there is actually a user marked as Team Head in this designation
    if (hasTeamLeads) {
      options.push({ label: 'Team Leads', value: 'Team Leads' });
    }

    // 3. Add individual user options
    assignedUsers.forEach((u) => {
      const label = `${u.name} (${u.userId})`;
      options.push({ label, value: u.userId });
    });

    return options;
  }, [designation, usersList, rolesList]);

  // Add Role Modal State
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Next auto-generated Role ID
  const nextRoleId = formatRoleId(rolesList.length + 1);

  // Permissions containers: "Dashboard", "User Management", "Template Management", and "Management"
  const [permissions, setPermissions] = useState(DEFAULT_MODULE_PERMISSIONS);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Synchronize permissions state whenever "Apply To" or "Designation" changes
  useEffect(() => {
    // If Admin / Super Administrator is selected, always show all 4 enabled
    const isSuperAdminTarget =
      String(designation || '').toLowerCase() === 'admin' ||
      String(applyTo || '').toLowerCase() === 'admin' ||
      String(applyTo || '').toLowerCase().includes('super administrator');

    if (isSuperAdminTarget) {
      setPermissions(DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p, enabled: true })));
      return;
    }

    const permMap = getStoredPermissionsMap();
    const targetKey = applyTo || (designation ? `All ${designation}` : null);
    if (targetKey && permMap[targetKey]) {
      setPermissions(permMap[targetKey]);
    } else if (designation && permMap[designation]) {
      setPermissions(permMap[designation]);
    } else {
      setPermissions(DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p, enabled: false })));
    }
  }, [applyTo, designation]);

  // Persist permission updates directly into storage & MongoDB backend
  const updateAndSavePermissions = async (newPermissions) => {
    setPermissions(newPermissions);
    const targetKey = applyTo || (designation ? `All ${designation}` : null);
    if (targetKey) {
      const permMap = getStoredPermissionsMap();
      permMap[targetKey] = newPermissions;
      if (designation) {
        permMap[designation] = newPermissions;
        permMap[`All ${designation}`] = newPermissions;
      }
      saveStoredPermissionsMap(permMap);

      // Save to MongoDB collection 'adminroles' and user record
      try {
        // Find applied person details if an individual user was chosen
        const matchedUser = usersList.find((u) => u.userId === applyTo);
        const personName = matchedUser?.name || '';
        const personId = matchedUser?.userId || '';
        const applyToLabel = matchedUser ? `${personName} (${personId})` : applyTo;

        await updateAdminRolePermissions(designation || targetKey, newPermissions, {
          applyTo: applyToLabel,
          appliedPersonName: personName,
          appliedPersonId: personId
        });

        if (applyTo && applyTo !== `All ${designation}` && applyTo !== 'Team Leads') {
          await updateAdminRolePermissions(applyTo, newPermissions, {
            applyTo: applyToLabel,
            appliedPersonName: personName,
            appliedPersonId: personId
          });
        }
      } catch (err) {
        console.error('Failed to sync permissions to backend DB:', err);
      }
    }
  };

  // Toggle single permission card
  const handleToggle = (id) => {
    const updated = permissions.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    updateAndSavePermissions(updated);
  };

  // Enable all cards
  const handleEnableAll = () => {
    const updated = permissions.map((item) => ({ ...item, enabled: true }));
    updateAndSavePermissions(updated);
  };

  // Disable all cards
  const handleDisableAll = () => {
    const updated = permissions.map((item) => ({ ...item, enabled: false }));
    updateAndSavePermissions(updated);
  };

  // Explicit Save Changes button handler for the selected person/designation
  const handleExplicitSave = async () => {
    if (!designation) return;
    setIsSaving(true);
    await updateAndSavePermissions(permissions);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const enabledCount = permissions.filter((item) => item.enabled).length;
  const totalCount = permissions.length;
  const enabledPercentage = Math.round((enabledCount / totalCount) * 100);

  return (
    <div className="w-full space-y-[1.4vw] font-sans pb-[2vw] text-gray-800">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[1.8vw] font-bold text-[#111827] tracking-tight leading-tight">
            Role Access
          </h1>
          <p className="text-[0.78vw] text-[#9ca3af] font-medium mt-[0.2vw]">
            Manage permissions, feature matrix, and designation-level access.
          </p>
        </div>

        <AdminHeaderActions />
      </div>

      {/* Action Bar Card */}
      <div className="w-full bg-white rounded-[0.8vw] border border-gray-100 shadow-xs px-[1.5vw] py-[1.1vw] flex items-center justify-between">
        {/* Left Filters */}
        <div className="flex items-center gap-[1.8vw]">
          {/* Select Designation(s) */}
          <div className="flex items-center gap-[0.7vw]">
            <span className="text-[0.85vw] font-bold text-[#1e293b]">
              Select Designation(s):
            </span>
            <AdminDropdown
              options={designationsList.map((d) => ({ label: d, value: d }))}
              value={designation}
              placeholder={designationsList.length === 0 ? 'No Designations (Add Role first)' : 'Select Designation'}
              onChange={(val) => {
                setDesignation(val);
                // Dynamically pick initial default:
                const assigned = usersList.filter((u) => {
                  const matchedRole = rolesList.find((r) => r.id === u.roleId);
                  const userRoleName = matchedRole?.name || u.roleId || '';
                  return (
                    userRoleName.toLowerCase() === val.toLowerCase() ||
                    (u.designation || '').toLowerCase() === val.toLowerCase()
                  );
                });
                if (assigned.length >= 2) {
                  setApplyTo(`All ${val}`);
                } else if (assigned.length === 1) {
                  setApplyTo(assigned[0].userId);
                } else {
                  setApplyTo('');
                }
              }}
              width="13vw"
            />
          </div>

          {/* Apply To */}
          <div className="flex items-center gap-[0.7vw]">
            <span className="text-[0.85vw] font-bold text-[#1e293b]">
              Apply To:
            </span>
            <AdminDropdown
              options={applyToOptions}
              value={applyTo}
              placeholder="Select Target"
              onChange={(val) => setApplyTo(val)}
              width="14vw"
            />
          </div>
        </div>

        {/* Right Add Roles Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowAddRoleModal(true)}
            className="flex items-center gap-[0.45vw] px-[1.2vw] py-[0.55vw] bg-[#0f172a] hover:bg-slate-800 text-white text-[0.82vw] font-semibold rounded-[0.55vw] shadow-xs hover:shadow transition duration-150 cursor-pointer"
          >
            <Plus className="w-[0.95vw] h-[0.95vw]" />
            <span>Add Roles</span>
          </button>
        </div>
      </div>

      {/* Permissions Card */}
      <div className={`w-full bg-white rounded-[0.8vw] border border-gray-100 shadow-xs p-[1.6vw] space-y-[1.4vw] transition-opacity duration-200 ${!designation ? 'opacity-60' : 'opacity-100'
        }`}>
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.8vw]">
            {/* Blue pill accent */}
            <span className="w-[0.32vw] h-[1.3vw] bg-[#2563eb] rounded-full inline-block"></span>
            <h2 className="text-[1.05vw] font-bold text-[#1e293b]">
              Modules & Access
            </h2>
            <span className="bg-[#f1f5f9] text-[#475569] text-[0.72vw] font-semibold px-[0.6vw] py-[0.2vw] rounded-full border border-gray-200">
              {enabledCount} / {totalCount} Enabled ({enabledPercentage}%)
            </span>
            {!designation && (
              <span className="text-[0.72vw] text-amber-600 bg-amber-50 border border-amber-200 px-[0.6vw] py-[0.15vw] rounded-full font-medium">
                Please select a Designation above to configure access
              </span>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-[0.6vw]">
            <button
              type="button"
              disabled={!designation}
              onClick={handleEnableAll}
              className="text-[#2563eb] hover:bg-blue-50/70 border border-[#bfdbfe] disabled:opacity-40 disabled:cursor-not-allowed text-[0.75vw] font-semibold px-[0.9vw] py-[0.35vw] rounded-[0.45vw] transition cursor-pointer"
            >
              Enable All
            </button>
            <button
              type="button"
              disabled={!designation}
              onClick={handleDisableAll}
              className="text-[#475569] hover:bg-gray-100/70 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-[0.75vw] font-semibold px-[0.9vw] py-[0.35vw] rounded-[0.45vw] transition cursor-pointer"
            >
              Disable All
            </button>
            <button
              type="button"
              disabled={!designation || isSaving}
              onClick={handleExplicitSave}
              className={`flex items-center gap-[0.35vw] text-[0.75vw] font-semibold px-[1.1vw] py-[0.35vw] rounded-[0.45vw] shadow-xs transition cursor-pointer ${savedSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-[#2563eb] hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-[0.85vw] h-[0.85vw]" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-[0.85vw] h-[0.85vw]" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3-Column Grid for Permissions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1vw]">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              onClick={() => {
                if (designation) {
                  handleToggle(perm.id);
                }
              }}
              className={`group border border-gray-100 rounded-[0.7vw] p-[1.1vw] flex items-center justify-between transition shadow-2xs ${designation
                ? 'hover:border-gray-200 bg-[#fafafa]/50 hover:bg-white cursor-pointer'
                : 'bg-gray-50/60 cursor-not-allowed'
                }`}
            >
              <div className="space-y-[0.2vw] pr-[0.8vw]">
                <h3 className={`text-[0.88vw] font-bold transition ${designation ? 'text-[#334155] group-hover:text-black' : 'text-gray-400'
                  }`}>
                  {perm.name}
                </h3>
                <p className="text-[0.72vw] text-[#94a3b8] leading-tight">
                  {perm.description}
                </p>
              </div>

              {/* iOS style toggle switch */}
              <div
                className={`w-[2.6vw] h-[1.45vw] flex items-center rounded-full p-[0.18vw] transition-colors duration-200 ease-in-out shrink-0 ${perm.enabled && designation ? 'bg-[#2563eb]' : 'bg-[#e2e8f0]'
                  }`}
              >
                <div
                  className={`bg-white w-[1.1vw] h-[1.1vw] rounded-full shadow-xs transform transition-transform duration-200 ease-in-out ${perm.enabled && designation ? 'translate-x-[1.15vw]' : 'translate-x-0'
                    }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[1vw] border border-gray-100 shadow-xl w-full max-w-[28vw] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-[1.5vw] py-[1.1vw] border-b border-gray-100 bg-[#f8fafc]">
              <div className="flex items-center gap-[0.6vw]">
                <div className="w-[1.8vw] h-[1.8vw] rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Shield className="w-[1vw] h-[1vw]" />
                </div>
                <div>
                  <h3 className="text-[1vw] font-bold text-[#1e293b]">
                    Add New Role
                  </h3>
                  <p className="text-[0.72vw] text-gray-400">
                    Create a new system role for access control
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoleModal(false)}
                className="text-gray-400 hover:text-gray-600 p-[0.3vw] rounded-[0.4vw] hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-[1.1vw] h-[1.1vw]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-[1.5vw] space-y-[1.1vw]">
              <div className="space-y-[0.4vw]">
                <label className="text-[0.8vw] font-bold text-[#334155]">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Content Manager, Finance Lead..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-gray-200 text-[#1e293b] text-[0.82vw] rounded-[0.55vw] px-[1vw] py-[0.55vw] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[0.7vw] text-gray-400">
                  This role will automatically be added into the Designation list.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-[0.7vw] px-[1.5vw] py-[1vw] border-t border-gray-100 bg-[#f8fafc]">
              <button
                type="button"
                onClick={() => {
                  setShowAddRoleModal(false);
                  setNewRoleName('');
                }}
                className="text-[0.8vw] font-semibold text-[#475569] hover:bg-gray-100 px-[1.1vw] py-[0.5vw] rounded-[0.5vw] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newRoleName.trim()}
                onClick={async () => {
                  if (newRoleName.trim()) {
                    const roleTitle = newRoleName.trim();

                    // 1. Save directly to MongoDB 'adminroles' collection
                    try {
                      const res = await createAdminRole({
                        roleName: roleTitle,
                        designation: roleTitle
                      });
                      const createdId = res?.role?.roleId || nextRoleId;
                      const newRoleObj = {
                        id: createdId,
                        name: roleTitle,
                        designation: roleTitle,
                      };
                      const updated = [...rolesList, newRoleObj];
                      setRolesList(updated);
                      saveStoredRoles(updated);
                    } catch (e) {
                      console.error('Backend role create failed, using local:', e);
                      const newRoleObj = {
                        id: nextRoleId,
                        name: roleTitle,
                        designation: roleTitle,
                      };
                      const updated = [...rolesList, newRoleObj];
                      setRolesList(updated);
                      saveStoredRoles(updated);
                    }

                    setDesignation(roleTitle);
                    setApplyTo('');
                    setShowAddRoleModal(false);
                    setNewRoleName('');
                  }
                }}
                className="bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[0.8vw] font-semibold px-[1.2vw] py-[0.5vw] rounded-[0.5vw] shadow-xs transition cursor-pointer"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
