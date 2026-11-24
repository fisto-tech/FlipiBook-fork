import React, { useState } from 'react';
import { Plus, Shield, X } from 'lucide-react';
import AdminHeaderActions from '../../../components/AdminHeaderActions';

// Helper to format Role ID
const formatRoleId = (num) => `R_ID${String(num).padStart(2, '0')}`;

export default function RoleAccessPage() {
  const [rolesList, setRolesList] = useState([]);

  const designationsList = [
    '3D',
    'Admin',
    'Digital Marketing',
    'Digital Marketing & HR',
    'HR',
    'Project Head',
    'SBU',
    'Software Developer',
    'UI/UX',
  ];

  const [selectedRole, setSelectedRole] = useState('');
  const [designation, setDesignation] = useState('');
  const [applyTo, setApplyTo] = useState('');

  // Add Role Modal State
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Next auto-generated Role ID
  const nextRoleId = formatRoleId(rolesList.length + 1);

  // Management section permissions
  const [managementPermissions, setManagementPermissions] = useState([
    {
      id: 'followups',
      name: 'Followups & Meetings',
      description: 'Project-wise Followups & Meetings',
      enabled: false,
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'System Analytics & Overview',
      enabled: false,
    },
    {
      id: 'budgets',
      name: "Budget's",
      description: 'Budgets & Financial Overview',
      enabled: false,
    },
    {
      id: 'marketing_leads',
      name: 'Marketing Leads',
      description: 'Marketing Leads Tracker',
      enabled: false,
    },
    {
      id: 'role_access',
      name: 'Role Access',
      description: 'Role & Permission Settings',
      enabled: false,
    },
    {
      id: 'clients_data',
      name: "Client's Data",
      description: 'Client Master & First Level Followups',
      enabled: false,
    },
    {
      id: 'generate_pdf',
      name: 'Generate PDF',
      description: 'Generate Official HR & Finance PDF Documents',
      enabled: false,
    },
  ]);

  // Toggle single permission
  const handleToggle = (id) => {
    setManagementPermissions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  // Enable all in section
  const handleEnableAll = () => {
    setManagementPermissions((prev) =>
      prev.map((item) => ({ ...item, enabled: true }))
    );
  };

  // Disable all in section
  const handleDisableAll = () => {
    setManagementPermissions((prev) =>
      prev.map((item) => ({ ...item, enabled: false }))
    );
  };

  const enabledCount = managementPermissions.filter((item) => item.enabled).length;
  const totalCount = managementPermissions.length;
  const enabledPercentage = Math.round((enabledCount / totalCount) * 100);

  // Overall active count placeholder
  const totalMatrixActive = 10;
  const totalMatrixCount = 30;

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
            <div className="relative">
              <select
                value={designation}
                onChange={(e) => {
                  setDesignation(e.target.value);
                  setApplyTo(e.target.value ? `All ${e.target.value}` : '');
                }}
                className="appearance-none bg-[#f8fafc] hover:bg-gray-50 border border-gray-200 text-[#1e293b] text-[0.82vw] font-semibold rounded-[0.55vw] pl-[1vw] pr-[2.2vw] py-[0.55vw] min-w-[10vw] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="" disabled hidden>
                  Select Designation
                </option>
                {designationsList.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-[0.7vw] text-gray-400">
                <svg className="w-[0.8vw] h-[0.8vw]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Apply To */}
          <div className="flex items-center gap-[0.7vw]">
            <span className="text-[0.85vw] font-bold text-[#1e293b]">
              Apply To:
            </span>
            <div className="relative">
              <select
                value={applyTo}
                onChange={(e) => setApplyTo(e.target.value)}
                className="appearance-none bg-[#f8fafc] hover:bg-gray-50 border border-gray-200 text-[#1e293b] text-[0.82vw] font-semibold rounded-[0.55vw] pl-[1vw] pr-[2.2vw] py-[0.55vw] min-w-[10vw] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="" disabled hidden>
                  Select Target
                </option>
                {designation && <option value={`All ${designation}`}>All {designation}</option>}
                <option value="Specific User">Specific User</option>
                <option value="Team Leads">Team Leads</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-[0.7vw] text-gray-400">
                <svg className="w-[0.8vw] h-[0.8vw]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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

      {/* Management Permissions Card */}
      <div className="w-full bg-white rounded-[0.8vw] border border-gray-100 shadow-xs p-[1.6vw] space-y-[1.4vw]">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.8vw]">
            {/* Blue pill accent */}
            <span className="w-[0.32vw] h-[1.3vw] bg-[#2563eb] rounded-full inline-block"></span>
            <h2 className="text-[1.05vw] font-bold text-[#1e293b]">
              Management
            </h2>
            <span className="bg-[#f1f5f9] text-[#475569] text-[0.72vw] font-semibold px-[0.6vw] py-[0.2vw] rounded-full border border-gray-200">
              {enabledCount} / {totalCount} Enabled ({enabledPercentage}%)
            </span>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-[0.6vw]">
            <button
              type="button"
              onClick={handleEnableAll}
              className="text-[#2563eb] hover:bg-blue-50/70 border border-[#bfdbfe] text-[0.75vw] font-semibold px-[0.9vw] py-[0.35vw] rounded-[0.45vw] transition cursor-pointer"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={handleDisableAll}
              className="text-[#475569] hover:bg-gray-100/70 border border-gray-200 text-[0.75vw] font-semibold px-[0.9vw] py-[0.35vw] rounded-[0.45vw] transition cursor-pointer"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* 3-Column Grid for Permissions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1vw]">
          {managementPermissions.map((perm) => (
            <div
              key={perm.id}
              onClick={() => handleToggle(perm.id)}
              className="group border border-gray-100 hover:border-gray-200 bg-[#fafafa]/50 hover:bg-white rounded-[0.7vw] p-[1.1vw] flex items-center justify-between transition cursor-pointer shadow-2xs"
            >
              <div className="space-y-[0.2vw] pr-[0.8vw]">
                <h3 className="text-[0.88vw] font-bold text-[#334155] group-hover:text-black transition">
                  {perm.name}
                </h3>
                <p className="text-[0.72vw] text-[#94a3b8] leading-tight">
                  {perm.description}
                </p>
              </div>

              {/* iOS style toggle switch */}
              <div
                className={`w-[2.6vw] h-[1.45vw] flex items-center rounded-full p-[0.18vw] transition-colors duration-200 ease-in-out shrink-0 ${
                  perm.enabled ? 'bg-[#2563eb]' : 'bg-[#e2e8f0]'
                }`}
              >
                <div
                  className={`bg-white w-[1.1vw] h-[1.1vw] rounded-full shadow-xs transform transition-transform duration-200 ease-in-out ${
                    perm.enabled ? 'translate-x-[1.15vw]' : 'translate-x-0'
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
              {/* Role ID Display */}
              <div className="space-y-[0.4vw]">
                <label className="text-[0.8vw] font-bold text-[#334155]">
                  Role ID
                </label>
                <div className="w-full bg-[#f1f5f9] border border-gray-200 text-[#2563eb] font-semibold text-[0.82vw] rounded-[0.55vw] px-[1vw] py-[0.55vw] cursor-not-allowed select-none flex items-center justify-between">
                  <span>{nextRoleId}</span>
                  <span className="text-[0.68vw] text-gray-400 font-normal">Auto Generated</span>
                </div>
              </div>

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
                onClick={() => {
                  if (newRoleName.trim()) {
                    const newRoleObj = {
                      id: nextRoleId,
                      name: newRoleName.trim(),
                    };
                    setRolesList((prev) => [...prev, newRoleObj]);
                    setSelectedRole(newRoleName.trim());
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
