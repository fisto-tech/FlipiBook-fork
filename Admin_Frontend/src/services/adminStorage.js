// Key constants for local storage synchronization across admin tabs/pages
export const STORAGE_KEYS = {
  ADMIN_ROLES: 'flipibook_admin_roles',
  ADMIN_USERS: 'flipibook_admin_users',
  ADMIN_PERMISSIONS: 'flipibook_admin_permissions'
};

// Default permissions state
export const DEFAULT_MODULE_PERMISSIONS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Analytics, statistics, and system overview',
    enabled: false,
  },
  {
    id: 'threed_editor_assets',
    name: '3D Editor Assets',
    description: 'Manage 3D assets, models, materials, and canvas editor files',
    enabled: false,
  },
  {
    id: 'user_management',
    name: 'User Management',
    description: 'User accounts, credential controls, and access',
    enabled: false,
  },
  {
    id: 'template_management',
    name: 'Template Management',
    description: 'Document templates and design presets',
    enabled: false,
  },
  {
    id: 'management',
    name: 'Management',
    description: 'Operational tracking, followups, budgets, leads & reports',
    enabled: false,
  },
];

// Merge stored/fetched permissions with DEFAULT_MODULE_PERMISSIONS to ensure all modules are always present
export const mergeWithDefaultPermissions = (permissionsList) => {
  if (!Array.isArray(permissionsList)) {
    return DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p }));
  }
  return DEFAULT_MODULE_PERMISSIONS.map((defaultMod) => {
    const matched = permissionsList.find((p) => p && (p.id === defaultMod.id || p.name === defaultMod.name));
    return {
      ...defaultMod,
      enabled: matched ? Boolean(matched.enabled) : false
    };
  });
};

// Permissions map storage: { [targetKey]: [ { id, name, description, enabled } ] }
// targetKey can be a userId (e.g. 'FLIP_AD0002') or a role group (e.g. 'All 3D Artist', 'Team Leads')
export const getStoredPermissionsMap = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_PERMISSIONS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to parse permissions from localStorage', e);
    return {};
  }
};

export const saveStoredPermissionsMap = (permMap) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PERMISSIONS, JSON.stringify(permMap));
    window.dispatchEvent(new Event('flipibook_permissions_updated'));
  } catch (e) {
    console.error('Failed to save permissions to localStorage', e);
  }
};

// Determine permissions for a specific logged-in admin user
export const getUserEffectivePermissions = (currentAdmin) => {
  if (!currentAdmin) return null;
  const roleName = String(currentAdmin.role || '').toLowerCase();
  const userId = String(currentAdmin.userId || '').toLowerCase();
  const isSuperAdminAccount = roleName === 'super admin' || userId === 'admin' || currentAdmin.email === 'admin@flipibook.com';

  const permMap = getStoredPermissionsMap();

  // 1. Direct user assignment check in permMap (e.g. 'Admin' or 'Super Administrator' or specific userId)
  const directPerms =
    permMap[currentAdmin.userId] ||
    (isSuperAdminAccount ? (permMap['Super Administrator'] || permMap['Admin']) : null);

  if (directPerms && Array.isArray(directPerms)) {
    return directPerms.reduce((acc, p) => ({ ...acc, [p.id]: Boolean(p.enabled) }), { isSuperAdmin: false });
  }

  // 2. Check user.permissions returned from DB on login
  if (Array.isArray(currentAdmin.permissions) && currentAdmin.permissions.length > 0) {
    return currentAdmin.permissions.reduce((acc, p) => ({ ...acc, [p.id]: Boolean(p.enabled) }), { isSuperAdmin: false });
  }

  // 3. Team Leads check
  if (currentAdmin.teamHead && permMap['Team Leads']) {
    return permMap['Team Leads'].reduce((acc, p) => ({ ...acc, [p.id]: p.enabled }), { isSuperAdmin: false });
  }

  // 4. Designation group check (e.g. 'Software Developer' or 'All Software Developer' or 'All Admin')
  const userDesig = currentAdmin.designation || currentAdmin.role || (isSuperAdminAccount ? 'Admin' : '');
  if (permMap[userDesig]) {
    return permMap[userDesig].reduce((acc, p) => ({ ...acc, [p.id]: p.enabled }), { isSuperAdmin: false });
  }
  const roleKey = `All ${userDesig}`;
  if (permMap[roleKey]) {
    return permMap[roleKey].reduce((acc, p) => ({ ...acc, [p.id]: p.enabled }), { isSuperAdmin: false });
  }

  // Default for Super Admin if not customized yet: all true
  if (isSuperAdminAccount) {
    return {
      dashboard: true,
      threed_editor_assets: true,
      user_management: true,
      template_management: true,
      management: true,
      isSuperAdmin: false
    };
  }

  // Fallback: disabled
  return {
    dashboard: false,
    threed_editor_assets: false,
    user_management: false,
    template_management: false,
    management: false,
    isSuperAdmin: false
  };
};

// Default empty roles and users list (cleared as requested)
export const getStoredRoles = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_ROLES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse roles from localStorage', e);
    return [];
  }
};

export const saveStoredRoles = (roles) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_ROLES, JSON.stringify(roles));
    window.dispatchEvent(new Event('flipibook_roles_updated'));
  } catch (e) {
    console.error('Failed to save roles to localStorage', e);
  }
};

export const DEFAULT_ADMIN_USER = {
  sNo: 1,
  name: 'Fist-O',
  userId: 'ADMIN',
  password: 'Admin@123',
  designation: 'Admin',
  roleId: 'R_ID01',
  teamHead: false,
  createdDate: 'Nov 23, 2026',
  email: 'admin@flipibook.com',
  status: 'Active'
};

export const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    const parsed = data ? JSON.parse(data) : [];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [DEFAULT_ADMIN_USER];
    }
    const hasAdmin = parsed.some((u) => String(u.userId || '').toLowerCase() === 'admin');
    if (!hasAdmin) {
      return [DEFAULT_ADMIN_USER, ...parsed];
    }
    return parsed.map((u) => {
      if (String(u.userId || '').toLowerCase() === 'admin') {
        return {
          ...u,
          name: 'Fist-O',
          userId: 'ADMIN'
        };
      }
      return u;
    });
  } catch (e) {
    console.error('Failed to parse users from localStorage', e);
    return [DEFAULT_ADMIN_USER];
  }
};

export const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
    window.dispatchEvent(new Event('flipibook_users_updated'));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};
