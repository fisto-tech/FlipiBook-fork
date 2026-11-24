import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [managementOpen, setManagementOpen] = useState(
    location.pathname.startsWith('/management')
  );

  return (
    <aside className="w-[16.5vw] bg-[#161c28] h-screen flex flex-col justify-between py-[1.8vw] px-[1.1vw] select-none text-white flex-shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-[0.7vw] px-[0.6vw] pb-[1.8vw] border-b border-[#212a3b]">
          <div className="w-[1.9vw] h-[1.9vw] rounded-[0.4vw] flex items-center justify-center text-white">
            <svg className="w-[1.6vw] h-[1.6vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <span className="text-[1.2vw] font-bold text-white tracking-wide">
            Super Admin
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="mt-[1.6vw] space-y-[0.4vw]">
          {/* Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `w-full flex items-center gap-[0.85vw] px-[0.95vw] py-[0.7vw] rounded-[0.55vw] text-[0.88vw] font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-[#374151]/70 text-white shadow-xs'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2636]'
              }`
            }
          >
            <span className="text-gray-400 group-hover:text-white">
              <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </span>
            <span>Dashboard</span>
          </NavLink>

          {/* Existing User Management (Undisturbed) */}
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `w-full flex items-center gap-[0.85vw] px-[0.95vw] py-[0.7vw] rounded-[0.55vw] text-[0.88vw] font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-[#374151]/70 text-white shadow-xs'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2636]'
              }`
            }
          >
            <span className="text-gray-400 group-hover:text-white">
              <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span>User Management</span>
          </NavLink>

          {/* Template Management */}
          <NavLink
            to="/templates"
            className={({ isActive }) =>
              `w-full flex items-center gap-[0.85vw] px-[0.95vw] py-[0.7vw] rounded-[0.55vw] text-[0.88vw] font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-[#374151]/70 text-white shadow-xs'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2636]'
              }`
            }
          >
            <span className="text-gray-400 group-hover:text-white">
              <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </span>
            <span>Template Management</span>
          </NavLink>

          {/* Management with Sub-menu */}
          <div>
            <div
              onClick={() => setManagementOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-[0.95vw] py-[0.7vw] rounded-[0.55vw] text-[0.88vw] font-medium transition cursor-pointer select-none ${
                location.pathname.startsWith('/management')
                  ? 'bg-[#374151]/40 text-white'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2636]'
              }`}
            >
              <div className="flex items-center gap-[0.85vw]">
                <span className="text-gray-400 group-hover:text-white">
                  <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </span>
                <span>Management</span>
              </div>
              <svg
                className={`w-[0.9vw] h-[0.9vw] transition-transform duration-200 text-gray-400 ${
                  managementOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Sub-items */}
            {managementOpen && (
              <div className="pl-[2.1vw] pr-[0.4vw] py-[0.2vw] space-y-[0.3vw] mt-[0.2vw]">
                <NavLink
                  to="/management/role-access"
                  className={({ isActive }) =>
                    `flex items-center gap-[0.6vw] px-[0.75vw] py-[0.55vw] rounded-[0.45vw] text-[0.82vw] font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-[#374151]/80 text-white font-semibold'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2636]'
                    }`
                  }
                >
                  <span className="w-[0.4vw] h-[0.4vw] rounded-full bg-gray-400"></span>
                  <span>Role Access</span>
                </NavLink>

                <NavLink
                  to="/management/users"
                  className={({ isActive }) =>
                    `flex items-center gap-[0.6vw] px-[0.75vw] py-[0.55vw] rounded-[0.45vw] text-[0.82vw] font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-[#374151]/80 text-white font-semibold'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#1e2636]'
                    }`
                  }
                >
                  <span className="w-[0.4vw] h-[0.4vw] rounded-full bg-gray-400"></span>
                  <span>User Management</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Logout Action at Bottom */}
      <div className="pt-[1vw] border-t border-[#212a3b]">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to log out?')) {
              logout();
              navigate('/login');
            }
          }}
          className="w-full flex items-center gap-[0.85vw] px-[0.95vw] py-[0.7vw] rounded-[0.55vw] text-[0.85vw] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer"
        >
          <svg className="w-[1.1vw] h-[1.1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
