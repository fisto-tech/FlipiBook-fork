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
  DEFAULT_MODULE_PERMISSIONS,
  mergeWithDefaultPermissions
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
          const mappedRoles = rolesRes.roles.map((r) => {
            const roleName = r.Role || r.roleName || r.name || '';
            return {
              id: r.roleId || r._id,
              name: roleName,
              designation: r.designation || roleName,
              permissions: r.permissions || []
            };
          });
          setRolesList(mappedRoles);
          saveStoredRoles(mappedRoles);

          // Populate permissions map from DB roles
          const permMap = getStoredPermissionsMap();
          // Ensure default for super_admin only if not yet set
          if (!permMap['super_admin']) {
            const allAdminEnabled = DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p, enabled: true }));
            permMap['super_admin'] = allAdminEnabled;
          }

          rolesRes.roles.forEach((r) => {
            const roleName = r.Role || r.roleName || r.name || '';
            const designation = r.designation || roleName;
            if (r.permissions && r.permissions.length > 0) {
              const fullPerms = mergeWithDefaultPermissions(r.permissions);
              if (roleName) permMap[roleName] = fullPerms;
              if (designation) permMap[`All ${designation}`] = fullPerms;
              if (r.appliedPersonId) {
                permMap[r.appliedPersonId] = fullPerms;
              }
              if (r.appliedPersonName) {
                permMap[`${r.appliedPersonName} (${r.appliedPersonId})`] = fullPerms;
              }
            }
          });
          saveStoredPermissionsMap(permMap);
        }

        if (usersRes?.success && usersRes.users && usersRes.users.length > 0) {
          const permMap = getStoredPermissionsMap();
          const mappedUsers = usersRes.users.map((u, i) => {
            const uid = u.userid || u.userId;
            // If user has Access array from DB, populate/sync into permMap for this user
            if (Array.isArray(u.Access) && u.Access.length > 0) {
              const accessMap = {};
              u.Access.forEach((item) => {
                const [k, v] = Object.entries(item)[0] || [];
                if (k) accessMap[k.toLowerCase()] = Boolean(v);
              });
              const convertedPerms = DEFAULT_MODULE_PERMISSIONS.map((p) => {
                const key = p.name.toLowerCase();
                const idKey = p.id.toLowerCase();
                const isEnabled = accessMap[key] !== undefined ? accessMap[key] : Boolean(accessMap[idKey]);
                return { ...p, enabled: isEnabled };
              });
              if (!permMap[uid]) {
                permMap[uid] = convertedPerms;
              }
            }

            return {
              sNo: i + 1,
              id: u._id,
              name: u.name,
              userId: uid,
              designation: u.designation,
              roleId: u.roleId || '',
              teamHead: Boolean(u.teamHead),
              createdDate: u.createddate
                ? new Date(u.createddate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : (u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 23, 2026'),
              email: u.e_mailid || u.email,
              status: u.status || 'Active',
              Access: u.Access || []
            };
          });
          saveStoredPermissionsMap(permMap);
          setUsersList(mappedUsers);
          saveStoredUsers(mappedUsers);
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

  // Designations list populated strictly by user-added roles AND designations typed in User Management
  // Excludes super_admin because super_admin permissions are permanent and cannot be restricted
  const designationsList = React.useMemo(() => {
    const list = [];
    const isSuperAdminRole = (name) => {
      const lower = String(name || '').trim().toLowerCase();
      return lower === 'super_admin' || lower === 'super admin' || lower === 'admin' || lower === 'super administrator';
    };

    // 1. Roles added via + Add Roles (exclude super_admin)
    rolesList.forEach((r) => {
      const name = (r.name || r.roleName || '').trim();
      if (name && !isSuperAdminRole(name) && !list.some((item) => item.toLowerCase() === name.toLowerCase())) {
        list.push(name);
      }
    });

    // 2. Custom designations entered on users (exclude super_admin)
    usersList.forEach((u) => {
      const desig = (u.designation || '').trim();
      if (desig && !isSuperAdminRole(desig) && !list.some((item) => item.toLowerCase() === desig.toLowerCase())) {
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
    if (!designation) return options;

    const desigClean = designation.trim().toLowerCase();
    const isSuperAdminDesig =
      desigClean === 'super_admin' ||
      desigClean === 'admin' ||
      desigClean === 'super admin' ||
      desigClean === 'super administrator';

    // 1. If super_admin is selected, Apply To should show super_admin
    if (isSuperAdminDesig) {
      return [{ label: 'super_admin', value: 'super_admin' }];
    }

    // Filter users assigned to this role or designation
    const assignedUsers = usersList.filter((u) => {
      const matchedRole = rolesList.find((r) => r.id === u.roleId);
      const userRoleName = (matchedRole?.name || u.roleId || '').trim().toLowerCase();
      const userDesig = (u.designation || '').trim().toLowerCase();
      const userName = (u.name || '').trim().toLowerCase();
      const isUserAdmin =
        String(u.userId || '').toLowerCase() === 'admin' ||
        String(u.role || '').toLowerCase() === 'super_admin' ||
        userName.includes('super administrator') ||
        userName.includes('super_admin');

      // If viewing any other designation: NEVER include the super_admin user
      if (isUserAdmin) {
        return false;
      }

      return (
        userRoleName === desigClean ||
        userDesig === desigClean ||
        // Also match variations like "software developer" vs "software development"
        (desigClean.length >= 5 && userDesig.startsWith(desigClean.slice(0, 8))) ||
        (userDesig.length >= 5 && desigClean.startsWith(userDesig.slice(0, 8)))
      );
    });

    // Check if any user in this designation is assigned as a Team Head (excluding Admin)
    const hasTeamLeads = assignedUsers.some((u) => Boolean(u.teamHead));

    // 2. Only show "All <Designation>" if there are at least 2 users under this designation
    if (assignedUsers.length >= 2) {
      options.push({ label: `All ${designation}`, value: `All ${designation}` });
    }

    // 3. Only show "Team Leads" if there is actually a user marked as Team Head in this designation
    if (hasTeamLeads) {
      options.push({ label: 'Team Leads', value: 'Team Leads' });
    }

    // 4. Add individual user options
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
    if (!designation || !applyTo) {
      setPermissions(DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p, enabled: false })));
      return;
    }

    const permMap = getStoredPermissionsMap();
    const targetKey = applyTo;
    const isSuperAdminTarget =
      String(designation || '').toLowerCase() === 'super_admin' ||
      String(designation || '').toLowerCase() === 'admin' ||
      String(designation || '').toLowerCase() === 'super admin' ||
      String(designation || '').toLowerCase() === 'super administrator' ||
      String(applyTo || '').toLowerCase() === 'super_admin' ||
      String(applyTo || '').toLowerCase() === 'admin' ||
      String(applyTo || '').toLowerCase().includes('super administrator') ||
      String(applyTo || '').toLowerCase().includes('super_admin');

    // 1. Direct custom permissions for this specific user/group
    if (targetKey && permMap[targetKey]) {
      setPermissions(mergeWithDefaultPermissions(permMap[targetKey]));
    } else if (isSuperAdminTarget && permMap['super_admin']) {
      setPermissions(mergeWithDefaultPermissions(permMap['super_admin']));
    } else if (isSuperAdminTarget) {
      setPermissions(DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p, enabled: true })));
    } else if (permMap[`All ${designation}`]) {
      // 2. Fall back to group permissions set on "All <Designation>"
      setPermissions(mergeWithDefaultPermissions(permMap[`All ${designation}`]));
    } else if (permMap[designation]) {
      // 3. Fall back to designation permissions
      setPermissions(mergeWithDefaultPermissions(permMap[designation]));
    } else {
      // By default, set all modules unselected
      setPermissions(DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p, enabled: false })));
    }
  }, [applyTo, designation]);

  // Persist permission updates directly into storage & MongoDB backend
  const updateAndSavePermissions = async (newPermissions) => {
    if (!designation || !applyTo) return;
    setPermissions(newPermissions);
    const targetKey = applyTo;
    if (targetKey) {
      const permMap = getStoredPermissionsMap();
      permMap[targetKey] = newPermissions;
      if (applyTo === 'super_admin' || designation === 'super_admin' || applyTo === 'Super Administrator' || designation === 'Admin') {
        permMap['super_admin'] = newPermissions;
      }
      if (applyTo === `All ${designation}`) {
        permMap[designation] = newPermissions;
        // When setting permissions on "All <Designation>", also update all users under this designation
        // who do not already have individual overrides
        const assignedUsers = usersList.filter((u) => {
          const userDesig = (u.designation || '').trim().toLowerCase();
          return userDesig === designation.trim().toLowerCase();
        });
        assignedUsers.forEach((u) => {
          permMap[u.userId] = newPermissions;
        });
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

  // Permissions Card is editable only when both a designation and a target (person/group) are selected
  // When Admin is selected, applyTo is automatically "Admin" / "Fist-O"
  const isAdminSelected = String(designation || '').trim().toLowerCase() === 'admin';
  const isEditable = Boolean(designation && (isAdminSelected || applyTo));

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
                const desigClean = (val || '').trim().toLowerCase();
                const isSuperAdminDesig =
                  desigClean === 'super_admin' ||
                  desigClean === 'admin' ||
                  desigClean === 'super admin' ||
                  desigClean === 'super administrator';

                const assigned = usersList.filter((u) => {
                  const matchedRole = rolesList.find((r) => r.id === u.roleId);
                  const userRoleName = (matchedRole?.name || u.roleId || '').trim().toLowerCase();
                  const userDesig = (u.designation || '').trim().toLowerCase();
                  const userName = (u.name || '').trim().toLowerCase();
                  const isUserAdmin =
                    String(u.userId || '').toLowerCase() === 'admin' ||
                    String(u.role || '').toLowerCase() === 'super_admin' ||
                    userName.includes('super administrator') ||
                    userName.includes('super_admin');

                  if (isSuperAdminDesig) {
                    return isUserAdmin || userDesig === 'admin' || userRoleName === 'admin' || userDesig === 'super_admin';
                  }

                  if (isUserAdmin) {
                    return false;
                  }

                  return (
                    userRoleName === desigClean ||
                    userDesig === desigClean ||
                    (desigClean.length >= 5 && userDesig.startsWith(desigClean.slice(0, 8))) ||
                    (userDesig.length >= 5 && desigClean.startsWith(userDesig.slice(0, 8)))
                  );
                });
                if (isSuperAdminDesig) {
                  setApplyTo('super_admin');
                } else if (assigned.length >= 2) {
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
            {isAdminSelected ? (
              <div className="flex items-center px-[0.9vw] py-[0.55vw] bg-[#f8fafc] border border-gray-200 rounded-[0.55vw] text-[0.85vw] font-medium text-gray-700 min-w-[12vw] select-none shadow-2xs">
                <span>Fist-O</span>
              </div>
            ) : (
              <AdminDropdown
                options={applyToOptions}
                value={applyTo}
                placeholder="Select Target"
                onChange={(val) => setApplyTo(val)}
                width="14vw"
              />
            )}
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
      <div className={`w-full bg-white rounded-[0.8vw] border border-gray-100 shadow-xs p-[1.6vw] space-y-[1.4vw] transition-opacity duration-200 ${!isEditable ? 'opacity-60' : 'opacity-100'
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
            {!designation ? (
              <span className="text-[0.72vw] text-amber-600 bg-amber-50 border border-amber-200 px-[0.6vw] py-[0.15vw] rounded-full font-medium">
                Please select a Designation above to configure access
              </span>
            ) : (!isAdminSelected && !applyTo) ? (
              <span className="text-[0.72vw] text-blue-600 bg-blue-50 border border-blue-200 px-[0.6vw] py-[0.15vw] rounded-full font-medium">
                Please select an Apply To target/person to configure permissions
              </span>
            ) : null}
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-[0.6vw]">
            <button
              type="button"
              disabled={!isEditable}
              onClick={handleEnableAll}
              className="text-[#2563eb] hover:bg-blue-50/70 border border-[#bfdbfe] disabled:opacity-40 disabled:cursor-not-allowed text-[0.75vw] font-semibold px-[0.9vw] py-[0.35vw] rounded-[0.45vw] transition cursor-pointer"
            >
              Enable All
            </button>
            <button
              type="button"
              disabled={!isEditable}
              onClick={handleDisableAll}
              className="text-[#475569] hover:bg-gray-100/70 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-[0.75vw] font-semibold px-[0.9vw] py-[0.35vw] rounded-[0.45vw] transition cursor-pointer"
            >
              Disable All
            </button>
            <button
              type="button"
              disabled={!isEditable || isSaving}
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
                if (isEditable) {
                  handleToggle(perm.id);
                }
              }}
              className={`group border border-gray-100 rounded-[0.7vw] p-[1.1vw] flex items-center justify-between transition shadow-2xs ${isEditable
                ? 'hover:border-gray-200 bg-[#fafafa]/50 hover:bg-white cursor-pointer'
                : 'bg-gray-50/60 cursor-not-allowed'
                }`}
            >
              <div className="space-y-[0.2vw] pr-[0.8vw]">
                <h3 className={`text-[0.88vw] font-bold transition ${isEditable ? 'text-[#334155] group-hover:text-black' : 'text-gray-400'
                  }`}>
                  {perm.name}
                </h3>
                <p className="text-[0.72vw] text-[#94a3b8] leading-tight">
                  {perm.description}
                </p>
              </div>

              {/* iOS style toggle switch */}
              <div
                className={`w-[2.6vw] h-[1.45vw] flex items-center rounded-full p-[0.18vw] transition-colors duration-200 ease-in-out shrink-0 ${perm.enabled && isEditable ? 'bg-[#2563eb]' : 'bg-[#e2e8f0]'
                  }`}
              >
                <div
                  className={`bg-white w-[1.1vw] h-[1.1vw] rounded-full shadow-xs transform transition-transform duration-200 ease-in-out ${perm.enabled && isEditable ? 'translate-x-[1.15vw]' : 'translate-x-0'
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
                        roleId: nextRoleId,
                        roleName: roleTitle,
                        Role: roleTitle,
                        designation: roleTitle
                      });
                      if (!res?.success) {
                        alert(`Failed to create role: ${res?.message || 'Server error'}`);
                        return;
                      }
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
                      console.error('Backend role create failed:', e);
                      const errorMsg = e.response?.data?.message || e.message || 'Server error';
                      alert(`Error creating role in database: ${errorMsg}`);
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
