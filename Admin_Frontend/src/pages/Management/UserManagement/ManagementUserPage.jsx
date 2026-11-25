import React, { useState, useEffect } from 'react';
import AdminHeaderActions from '../../../components/AdminHeaderActions';
import AdminDropdown from '../../../components/AdminDropdown';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { getStoredRoles, getStoredUsers, saveStoredUsers } from '../../../services/adminStorage';
import {
  getAdminRoles,
  getManagementStaffUsers,
  createManagementStaffUser,
  updateManagementStaffUser,
  updateManagementStaffPassword,
  deleteManagementStaffUser
} from '../../../services/adminApi';

const generateUserId = (num) => `FLIP_AD${String(num).padStart(4, '0')}`;

export default function ManagementUserPage() {
  const [users, setUsers] = useState(() => getStoredUsers());
  const [roles, setRoles] = useState(() => getStoredRoles());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = Add mode, object = Edit mode
  const [sortAsc, setSortAsc] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [inlinePasswordVal, setInlinePasswordVal] = useState('');

  const handleSaveInlinePassword = async (userId) => {
    if (!inlinePasswordVal.trim()) {
      setEditingUserId(null);
      return;
    }
    const pass = inlinePasswordVal.trim();
    const updated = users.map((u) =>
      u.userId === userId ? { ...u, password: pass } : u
    );
    setUsers(updated);
    saveStoredUsers(updated);

    try {
      await updateManagementStaffPassword(userId, pass);
    } catch (err) {
      console.error('Inline password update backend error:', err);
    }
    setEditingUserId(null);
    setInlinePasswordVal('');
  };

  // Fetch from MongoDB backend on mount
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
              designation: r.designation || roleName
            };
          });
          setRoles(mappedRoles);
        }

        if (usersRes?.success && usersRes.users && usersRes.users.length > 0) {
          const mappedUsers = usersRes.users.map((u, i) => ({
            sNo: i + 1,
            id: u._id,
            name: u.name,
            userId: u.userid || u.userId,
            password: u.rawPassword || u.password || u.userid || u.userId,
            designation: u.designation,
            roleId: u.roleId || '',
            teamHead: Boolean(u.teamHead),
            createdDate: u.createddate
              ? new Date(u.createddate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : (u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 23, 2026'),
            email: u.e_mailid || u.email,
            status: u.status || 'Active',
            Access: u.Access || []
          }));
          setUsers(mappedUsers);
          saveStoredUsers(mappedUsers);
        } else {
          setUsers(getStoredUsers());
        }
      } catch (err) {
        console.error('Failed to load users from backend:', err);
      }
    };

    fetchBackendData();

    const handleRolesSync = () => setRoles(getStoredRoles());
    const handleUsersSync = () => setUsers(getStoredUsers());

    window.addEventListener('flipibook_roles_updated', handleRolesSync);
    window.addEventListener('flipibook_users_updated', handleUsersSync);

    return () => {
      window.removeEventListener('flipibook_roles_updated', handleRolesSync);
      window.removeEventListener('flipibook_users_updated', handleUsersSync);
    };
  }, []);

  // Deduplicate and filter available roles for selection
  const availableRoles = React.useMemo(() => {
    const seen = new Set();
    const result = [];

    // Filter out duplicate role names, individual person custom roles (e.g., "Role - PersonName"),
    // and standardize Admin / Super Administrator into a single clear option
    for (const r of roles) {
      const cleanName = (r.name || r.roleName || '').trim();
      if (!cleanName) continue;

      // Skip internal personal custom permission roles if present
      if (cleanName.includes(' - FLIP_') || (cleanName.includes(' - ') && !cleanName.toLowerCase().includes('admin'))) {
        continue;
      }

      const key = cleanName.toLowerCase();
      // Group any duplicate Admin/Super Administrator entries into one
      const isSuperAdmin = key === 'admin' || key === 'super admin' || key === 'super administrator';
      const dedupeKey = isSuperAdmin ? 'admin' : key;

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        result.push({
          id: isSuperAdmin ? 'Admin' : (r.id || r.roleId || r.name),
          name: isSuperAdmin ? 'Admin' : cleanName,
          designation: r.designation || cleanName
        });
      }
    }

    return result;
  }, [roles]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    designation: '',
    createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Active'
  });
  const [showPassword, setShowPassword] = useState(true);

  const nextUserId = generateUserId(users.length + 1);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updated = users.filter((u) => u.userId !== id);
      setUsers(updated);
      saveStoredUsers(updated);
      try {
        await deleteManagementStaffUser(id);
      } catch (e) {
        console.error('Delete user backend error:', e);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      password: nextUserId,
      roleId: '',
      designation: '',
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active'
    });
    setShowPassword(true);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    const isSuperAdmin =
      String(userToEdit.userId || '').toLowerCase() === 'admin' ||
      String(userToEdit.name || '').toLowerCase().includes('super administrator') ||
      String(userToEdit.designation || '').toLowerCase() === 'admin';

    setNewUser({
      name: userToEdit.name || '',
      email: userToEdit.email || '',
      password: userToEdit.password || '',
      roleId: isSuperAdmin ? 'Admin' : (userToEdit.roleId || userToEdit.designation || ''),
      designation: userToEdit.designation || '',
      createdDate: userToEdit.createdDate || '',
      status: userToEdit.status || 'Active'
    });
    setShowPassword(true);
    setShowAddModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!newUser.name) return;

    if (editingUser) {
      // Edit / Update existing user
      const effectivePassword = newUser.password && newUser.password.trim() ? newUser.password.trim() : (editingUser.password || editingUser.userId);
      const updatedUser = {
        ...editingUser,
        ...newUser,
        password: effectivePassword
      };

      try {
        await updateManagementStaffUser(editingUser.userId, {
          name: newUser.name,
          email: newUser.email,
          password: effectivePassword,
          designation: newUser.designation,
          roleId: newUser.roleId
        });
      } catch (err) {
        console.error('Update user backend error:', err);
      }

      const updatedList = users.map((u) => (u.userId === editingUser.userId ? updatedUser : u));
      setUsers(updatedList);
      saveStoredUsers(updatedList);
      setShowAddModal(false);
      setEditingUser(null);
      return;
    }

    // Default password to auto-assigned User ID if left blank
    const effectivePassword = newUser.password && newUser.password.trim() ? newUser.password.trim() : nextUserId;

    try {
      // 1. Save directly to MongoDB via Backend Service
      const res = await createManagementStaffUser({
        name: newUser.name,
        email: newUser.email,
        password: effectivePassword,
        designation: newUser.designation,
        roleId: newUser.roleId
      });

      const assignedId = res?.user?.userId || nextUserId;

      const newRecord = {
        ...newUser,
        password: effectivePassword,
        sNo: users.length + 1,
        userId: assignedId,
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      const updated = [...users, newRecord];
      setUsers(updated);
      saveStoredUsers(updated);
    } catch (err) {
      console.error('Save user backend error:', err);
      // Fallback local save
      const newRecord = {
        ...newUser,
        password: effectivePassword,
        sNo: users.length + 1,
        userId: nextUserId
      };
      const updated = [...users, newRecord];
      setUsers(updated);
      saveStoredUsers(updated);
    }

    setShowAddModal(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      roleId: '',
      designation: '',
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active'
    });
    setShowPassword(true);
  };

  const filteredUsers = users
    .filter((u) => {
      const q = searchTerm.toLowerCase();
      const roleObj = roles.find((r) => r.id === u.roleId);
      const roleName = roleObj ? roleObj.name.toLowerCase() : '';
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.userId || '').toLowerCase().includes(q) ||
        (u.designation || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        roleName.includes(q)
      );
    })
    .sort((a, b) => {
      return sortAsc
        ? new Date(a.createdDate) - new Date(b.createdDate)
        : new Date(b.createdDate) - new Date(a.createdDate);
    });

  return (
    <div className="w-full space-y-[0.9vw] font-sans select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-[0.3vw] border-b border-gray-100">
        <div>
          <h1 className="text-[1.6vw] font-bold text-[#111827] tracking-tight leading-tight">
            User Details
          </h1>
          <p className="text-[0.72vw] text-[#9ca3af] font-medium mt-[0.15vw]">
            Manage system users, roles, and administrative access.
          </p>
        </div>
        <AdminHeaderActions />
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-[0.85vw] border border-gray-100/90 p-[1vw] shadow-xs">
        {/* Title bar + Search Controls */}
        <div className="flex flex-wrap items-center justify-between gap-[0.8vw] mb-[0.7vw]">
          {/* Active Users Heading */}
          <div className="flex items-center gap-[0.5vw]">
            <h2 className="text-[0.95vw] font-bold text-[#111827]">
              Active Users <span className="text-gray-400 font-normal">({filteredUsers.length})</span>
            </h2>
          </div>

          {/* Right Search Bar + Add Users Button */}
          <div className="flex items-center gap-[0.8vw]">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-[0.85vw] h-[0.85vw] absolute left-[0.8vw] top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-[2.2vw] pr-[0.8vw] py-[0.42vw] bg-gray-50/80 hover:bg-gray-100/60 focus:bg-white text-[0.78vw] border border-gray-200/90 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-300 w-[18vw] transition shadow-xs"
              />
            </div>

            {/* +Add Users Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-[0.4vw] px-[1vw] py-[0.42vw] bg-[#0f172a] hover:bg-slate-800 text-white text-[0.78vw] font-semibold rounded-full shadow-xs transition cursor-pointer"
            >
              <Plus className="w-[0.8vw] h-[0.8vw]" />
              <span>Add Users</span>
            </button>
          </div>
        </div>

        {/* The Exact Table Layout matching UI styling */}
        <div className="rounded-[0.7vw] border border-[#f0f0f0] overflow-hidden">
          <table className="w-full text-left border-collapse table-auto">
            {/* Table Head */}
            <thead>
              <tr className="bg-[#f8f8f8] text-[#111827] font-semibold border-b border-[#f0f0f0] text-[0.78vw]">
                <th className="py-[0.55vw] px-[1vw] w-12 text-center font-semibold">S.NO</th>
                <th className="py-[0.55vw] px-[1vw] font-semibold">User ID</th>
                <th className="py-[0.55vw] px-[1vw] font-semibold">Name</th>
                <th className="py-[0.55vw] px-[1vw] font-semibold">Designation</th>
                <th className="py-[0.55vw] px-[1vw] font-semibold">Email</th>
                <th className="py-[0.55vw] px-[1vw] font-semibold">Password</th>
                <th
                  onClick={() => setSortAsc(!sortAsc)}
                  className="py-[0.55vw] px-[1vw] cursor-pointer hover:text-gray-900 transition select-none font-semibold"
                >
                  <div className="flex items-center gap-1">
                    <span>Created Date</span>
                    <span className="text-blue-600 font-bold">↑</span>
                  </div>
                </th>
                <th className="py-[0.55vw] px-[1vw] text-center font-semibold">Status</th>
                <th className="py-[0.55vw] px-[1vw] text-center font-semibold">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#f5f5f5] bg-white text-[0.78vw] font-normal">
              {filteredUsers.map((u) => (
                <tr
                  key={u.userId}
                  className="group hover:bg-[#fafafa] transition-colors duration-150 text-[#4b5563]"
                >
                  {/* S.NO */}
                  <td className="py-[0.55vw] px-[1vw] text-center text-[#6b7280] font-medium">
                    {u.sNo}
                  </td>

                  {/* User ID in FLIP_AD0001 format */}
                  <td className="py-[0.55vw] px-[1vw] font-mono text-[#4b5563] font-medium whitespace-nowrap">
                    {u.userId}
                  </td>

                  {/* Name */}
                  <td className="py-[0.55vw] px-[1vw]">
                    <span className="font-semibold text-[#111827] group-hover:text-black transition-colors whitespace-nowrap">
                      {u.name}
                    </span>
                  </td>

                  {/* Designation */}
                  <td className="py-[0.55vw] px-[1vw]">
                    <div>
                      <span className="text-[#374151] font-medium whitespace-nowrap">
                        {u.designation || '-'}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-[0.55vw] px-[1vw] text-[#4b5563]">
                    {u.email ? (
                      <span className="truncate block max-w-[200px]" title={u.email}>
                        {u.email}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  {/* Password Column */}
                  <td className="py-[0.55vw] px-[1vw] text-[#4b5563] whitespace-nowrap">
                    {u.password || u.userId}
                  </td>

                  {/* Created Date */}
                  <td className="py-[0.55vw] px-[1vw] text-[#4b5563] whitespace-nowrap">
                    {u.createdDate}
                  </td>

                  {/* Status Badge */}
                  <td className="py-[0.55vw] px-[1vw] text-center">
                    <span className="inline-block px-[0.9vw] py-[0.2vw] rounded-full text-[0.68vw] font-medium bg-[#ebf7ee] text-[#34a853]">
                      {u.status || 'Active'}
                    </span>
                  </td>

                  {/* Actions: Edit & Delete */}
                  <td className="py-[0.55vw] px-[1vw] text-center">
                    <div className="flex items-center justify-center gap-[0.7vw]">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(u)}
                        className="p-[0.2vw] rounded hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 className="w-[0.85vw] h-[0.85vw]" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(u.userId)}
                        className="p-[0.2vw] rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-[0.85vw] h-[0.85vw]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="flex items-center justify-between pt-[0.6vw] text-[0.75vw] text-gray-500 font-medium">
          <div>
            Showing 1 to {Math.min(10, filteredUsers.length)} of {users.length} entries
          </div>

          <div className="flex items-center gap-[0.8vw]">
            <button
              type="button"
              disabled
              className="flex items-center gap-[0.3vw] text-gray-300 cursor-not-allowed text-[0.75vw]"
            >
              <ChevronLeft className="w-[0.75vw] h-[0.75vw]" />
              <span>Previous</span>
            </button>
            <span className="text-gray-700 font-semibold text-[0.75vw]">Page 1 of 1</span>
            <button
              type="button"
              disabled
              className="flex items-center gap-[0.3vw] text-gray-300 cursor-not-allowed text-[0.75vw]"
            >
              <span>Next</span>
              <ChevronRight className="w-[0.75vw] h-[0.75vw]" />
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[1vw] shadow-2xl w-full max-w-[28vw] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-[1.5vw] py-[1.1vw] border-b border-gray-100 bg-[#f8fafc]">
              <div>
                <h3 className="text-[1.05vw] font-bold text-[#111827]">
                  {editingUser ? 'Update User' : 'Add New User'}
                </h3>
                <p className="text-[0.72vw] text-gray-400 mt-[0.1vw]">
                  {editingUser ? 'Update administrative credentials and assigned role' : 'Create administrative credentials and assign roles'}
                </p>
              </div>
              <span className="text-[0.72vw] font-mono font-semibold px-[0.7vw] py-[0.25vw] rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {editingUser ? editingUser.userId : nextUserId}
              </span>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="p-[1.5vw] space-y-[1.1vw] text-[0.8vw]">
              {/* 1. Full Name */}
              <div className="space-y-[0.35vw]">
                <label className="block text-[#334155] font-bold text-[0.8vw]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#f8fafc] border border-gray-200 text-[#1e293b] text-[0.82vw] rounded-[0.55vw] px-[1vw] py-[0.55vw] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {/* 2. Email ID */}
              <div className="space-y-[0.35vw]">
                <label className="block text-[#334155] font-bold text-[0.8vw]">
                  Email ID
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. user@flipibook.com"
                  className="w-full bg-[#f8fafc] border border-gray-200 text-[#1e293b] text-[0.82vw] rounded-[0.55vw] px-[1vw] py-[0.55vw] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {/* 3. Password */}
              <div className="space-y-[0.35vw]">
                <label className="block text-[#334155] font-bold text-[0.8vw]">
                  Password <span className="text-gray-400 font-normal">({editingUser ? `Current: ${editingUser.password || editingUser.userId}` : `Default: ${nextUserId}`})</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder={editingUser ? 'Enter new password' : `e.g. ${nextUserId}`}
                    className="w-full bg-[#f8fafc] border border-gray-200 text-[#1e293b] text-[0.82vw] rounded-[0.55vw] pl-[1vw] pr-[2.5vw] py-[0.55vw] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[0.8vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[0.9vw] h-[0.9vw]" />
                    ) : (
                      <Eye className="w-[0.9vw] h-[0.9vw]" />
                    )}
                  </button>
                </div>
              </div>

              {/* 4. Select Designation */}
              <div className="space-y-[0.35vw]">
                <label className="block text-[#334155] font-bold text-[0.8vw]">
                  Select Designation <span className="text-gray-400 font-normal">({availableRoles.length} available)</span>
                </label>
                {availableRoles.length > 0 ? (
                  <AdminDropdown
                    options={availableRoles.map((r) => ({
                      label: r.name,
                      value: r.id || r.roleId || r.name
                    }))}
                    value={newUser.roleId}
                    placeholder="Select Designation"
                    onChange={(selId) => {
                      const matched = availableRoles.find((r) => (r.id || r.roleId || r.name) === selId);
                      setNewUser({
                        ...newUser,
                        roleId: selId,
                        designation: matched?.name || matched?.designation || newUser.designation
                      });
                    }}
                    width="100%"
                  />
                ) : (
                  <div className="p-[0.7vw] rounded-[0.55vw] bg-amber-50/70 border border-amber-200/60 text-amber-800 text-[0.75vw] flex items-center gap-[0.5vw]">
                    <ShieldAlert className="w-[0.9vw] h-[0.9vw] text-amber-600 shrink-0" />
                    <span>No roles created yet. You can create roles under <b>Role Access</b>.</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-[0.7vw] pt-[1vw] border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-[0.8vw] font-semibold text-[#475569] hover:bg-gray-100 px-[1.1vw] py-[0.5vw] rounded-[0.5vw] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0f172a] hover:bg-slate-800 text-white text-[0.8vw] font-semibold px-[1.3vw] py-[0.5vw] rounded-[0.5vw] shadow-xs hover:shadow transition cursor-pointer"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
