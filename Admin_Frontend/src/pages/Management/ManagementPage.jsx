import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeaderActions from '../../components/AdminHeaderActions';

export default function ManagementPage() {
  const navigate = useNavigate();

  const managementOptions = [
    {
      title: 'Role Access',
      description: 'Manage permissions, designation matrix, and role access controls.',
      path: '/management/role-access',
      icon: (
        <svg className="w-[1.8vw] h-[1.8vw] text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
      badge: 'Security & Access',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'User Management',
      description: 'Internal administration users, staff accounts, and credentials.',
      path: '/management/users',
      icon: (
        <svg className="w-[1.8vw] h-[1.8vw] text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      badge: 'Accounts & Staff',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="w-full space-y-[1.8vw] font-sans pb-[2vw]">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[1.8vw] font-bold text-[#111827] tracking-tight leading-tight">
            Management
          </h1>
          <p className="text-[0.78vw] text-[#9ca3af] font-medium mt-[0.2vw]">
            Administration settings, role definitions, and system controls.
          </p>
        </div>

        <AdminHeaderActions />
      </div>

      {/* Grid of Management Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw] mt-[1vw]">
        {managementOptions.map((opt) => (
          <div
            key={opt.title}
            onClick={() => navigate(opt.path)}
            className="group bg-white rounded-[0.8vw] border border-gray-100 hover:border-blue-300 p-[1.8vw] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-[1.2vw]">
                <div className="w-[3.2vw] h-[3.2vw] rounded-[0.6vw] bg-gray-50 group-hover:bg-blue-50/70 flex items-center justify-center transition">
                  {opt.icon}
                </div>
                <span className={`text-[0.72vw] font-bold px-[0.7vw] py-[0.2vw] rounded-full border ${opt.badgeColor}`}>
                  {opt.badge}
                </span>
              </div>
              <h2 className="text-[1.2vw] font-bold text-gray-900 group-hover:text-blue-600 transition">
                {opt.title}
              </h2>
              <p className="text-[0.82vw] text-gray-500 mt-[0.4vw] leading-relaxed">
                {opt.description}
              </p>
            </div>

            <div className="mt-[1.6vw] pt-[1vw] border-t border-gray-100 flex items-center justify-between text-[0.82vw] font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Configure Settings</span>
              <svg className="w-[1vw] h-[1vw]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
