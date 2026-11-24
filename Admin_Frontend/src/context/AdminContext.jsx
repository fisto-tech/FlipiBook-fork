import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('flipibook_admin_user');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    window.__CURRENT_ADMIN__ = adminUser;
  }, [adminUser]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = async (userIdOrEmail, password) => {
    const cleanId = String(userIdOrEmail || '').trim();
    const cleanIdLower = cleanId.toLowerCase();

    // Check for Super Admin credentials
    const isSuperAdmin =
      (cleanIdLower === 'admin' || cleanIdLower === 'super admin' || cleanIdLower === 'admin@flipibook.com') &&
      password === 'Admin@123';

    try {
      const res = await axios.post(
        '/api/auth/login',
        {
          userId: cleanId,
          emailId: cleanId,
          password
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        const userData = res.data.user || {};
        const newAdmin = {
          name: userData.name || 'Super Administrator',
          email: userData.emailId || userData.email || 'admin@flipibook.com',
          userId: userData.userID || userData.userId || cleanId,
          role: 'Super Admin',
          avatar: userData.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          initials: (userData.name || 'Super Admin').slice(0, 2).toUpperCase()
        };
        localStorage.setItem('flipibook_admin_user', JSON.stringify(newAdmin));
        setAdminUser(newAdmin);
        return { success: true, user: newAdmin };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      // Direct handling for Super Admin credentials
      if (isSuperAdmin) {
        const superAdminUser = {
          name: 'Super Administrator',
          email: 'admin@flipibook.com',
          userId: 'Admin',
          role: 'Super Admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          initials: 'SA'
        };
        localStorage.setItem('flipibook_admin_user', JSON.stringify(superAdminUser));
        setAdminUser(superAdminUser);
        return { success: true, user: superAdminUser };
      }

      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('flipibook_admin_user');
    setAdminUser(null);
    try {
      axios.post('/api/auth/logout', {}, { withCredentials: true }).catch(() => {});
    } catch (_) {}
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        setAdminUser,
        login,
        logout,
        showToast
      }}
    >
      {children}

      {/* Global Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/40 text-red-200'
                : 'bg-stone-900/90 border-stone-700 text-stone-200'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white cursor-pointer ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AdminContext.Provider>
  );
};
