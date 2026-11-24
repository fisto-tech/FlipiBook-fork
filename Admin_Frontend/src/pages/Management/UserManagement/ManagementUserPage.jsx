import React, { useState } from 'react';
import AdminHeaderActions from '../../../components/AdminHeaderActions';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const generateUserId = (num) => `FLIP_AD${String(num).padStart(4, '0')}`;

const INITIAL_USERS = [
  {
    sNo: 1,
    name: 'NIJAM',
    userId: generateUserId(1),
    designation: 'Admin',
    teamHead: false,
    createdDate: 'Apr 1, 2019',
    email: '',
    status: 'Active'
  },
  {
    sNo: 2,
    name: 'Agasthiya',
    userId: generateUserId(2),
    designation: 'SBU',
    teamHead: false,
    createdDate: 'May 31, 2019',
    email: 'info@fist-o.com',
    status: 'Active'
  },
  {
    sNo: 3,
    name: 'Atchaya',
    userId: generateUserId(3),
    designation: 'Project Head',
    teamHead: false,
    createdDate: 'Feb 26, 2021',
    email: 'fistotechnical@gmail.com/tsu...',
    status: 'Active'
  },
  {
    sNo: 4,
    name: 'Sham R',
    userId: generateUserId(4),
    designation: 'Software Developer',
    teamHead: true,
    createdDate: 'Nov 4, 2023',
    email: 'fistotechnical02@gmail.com',
    status: 'Active'
  },
  {
    sNo: 5,
    name: 'Murugan S',
    userId: generateUserId(5),
    designation: 'Software Developer',
    teamHead: false,
    createdDate: 'Mar 1, 2025',
    email: 'fistotech03@gmail.com',
    status: 'Active'
  },
  {
    sNo: 6,
    name: 'Praveenkumar K',
    userId: generateUserId(6),
    designation: 'Software Developer',
    teamHead: true,
    createdDate: 'Nov 1, 2025',
    email: 'fistotech04@gmail.com',
    status: 'Active'
  },
  {
    sNo: 7,
    name: 'Pradeepa S',
    userId: generateUserId(7),
    designation: 'UI/UX',
    teamHead: false,
    createdDate: 'Nov 1, 2025',
    email: 'fistodesign03@gmail.com',
    status: 'Active'
  },
  {
    sNo: 8,
    name: 'Priya K',
    userId: generateUserId(8),
    designation: 'Software Developer',
    teamHead: false,
    createdDate: 'Nov 1, 2025',
    email: 'fistotech01@gmail.com',
    status: 'Active'
  },
  {
    sNo: 9,
    name: 'Mohana Naveen S',
    userId: generateUserId(9),
    designation: 'UI/UX',
    teamHead: false,
    createdDate: 'Jan 9, 2026',
    email: 'fistodesign04@gmail.com',
    status: 'Active'
  },
  {
    sNo: 10,
    name: 'Kavitha R',
    userId: generateUserId(10),
    designation: 'QA Engineer',
    teamHead: false,
    createdDate: 'Feb 15, 2026',
    email: 'fistotech05@gmail.com',
    status: 'Active'
  }
];

export default function ManagementUserPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    designation: '',
    teamHead: false,
    createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    email: '',
    status: 'Active'
  });

  const nextUserId = generateUserId(users.length + 1);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers((prev) => prev.filter((u) => u.userId !== id));
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name) return;

    const newRecord = {
      ...newUser,
      sNo: users.length + 1,
      userId: nextUserId
    };
    setUsers((prev) => [...prev, newRecord]);
    setShowAddModal(false);
    setNewUser({
      name: '',
      designation: '',
      teamHead: false,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      email: '',
      status: 'Active'
    });
  };

  const filteredUsers = users
    .filter((u) => {
      return (
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      return sortAsc
        ? new Date(a.createdDate) - new Date(b.createdDate)
        : new Date(b.createdDate) - new Date(a.createdDate);
    });

  return (
    <div className="w-full space-y-4 font-sans pb-6 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            User Details
          </h1>
        </div>
        <AdminHeaderActions />
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-5">
        {/* Title bar + Search Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Active Users Heading */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              Active Users <span className="text-gray-400 font-normal">({filteredUsers.length})</span>
            </h2>
          </div>

          {/* Right Search Bar + Add Users Button */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50/80 hover:bg-gray-100/60 focus:bg-white text-sm border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-500 w-64 transition"
              />
            </div>

            {/* +Add Users Button */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+Add Users</span>
            </button>
          </div>
        </div>

        {/* The Exact Table Layout without large gap & balanced font */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left border-collapse table-auto">
            {/* Table Head */}
            <thead>
              <tr className="bg-[#f1f5f9] text-gray-700 font-bold border-b border-gray-200 text-sm">
                <th className="py-2.5 px-4 w-14 text-center">S.NO</th>
                <th className="py-2.5 px-4 min-w-[150px]">User</th>
                <th className="py-2.5 px-4 min-w-[140px]">User ID</th>
                <th className="py-2.5 px-4 min-w-[160px]">Designation</th>
                <th
                  onClick={() => setSortAsc(!sortAsc)}
                  className="py-2.5 px-4 min-w-[140px] cursor-pointer hover:text-gray-900 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Created Date</span>
                    <span className="text-blue-600 font-bold">↑</span>
                  </div>
                </th>
                <th className="py-2.5 px-4 min-w-[210px]">Email</th>
                <th className="py-2.5 px-4 min-w-[100px] text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.map((u) => (
                <tr
                  key={u.userId}
                  className="hover:bg-gray-50/80 transition duration-150 text-gray-800"
                >
                  {/* S.NO */}
                  <td className="py-2.5 px-4 text-center text-gray-500 font-medium text-sm">
                    {u.sNo}
                  </td>

                  {/* User Name */}
                  <td className="py-2.5 px-4">
                    <span className="font-bold text-gray-900 text-[14.5px]">
                      {u.name}
                    </span>
                  </td>

                  {/* User ID in FLIP_AD0001 format */}
                  <td className="py-2.5 px-4 font-mono text-gray-700 font-semibold text-[13.5px] tracking-wide">
                    {u.userId}
                  </td>

                  {/* Designation */}
                  <td className="py-2.5 px-4">
                    <div>
                      <span className="text-gray-800 font-medium text-[14px]">
                        {u.designation}
                      </span>
                      {u.teamHead && (
                        <div className="text-[11px] text-purple-600 font-semibold leading-tight mt-0.5">
                          Team Head
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="py-2.5 px-4 text-gray-700 text-sm font-medium">
                    {u.createdDate}
                  </td>

                  {/* Email */}
                  <td className="py-2.5 px-4 text-gray-700 font-medium text-[14px]">
                    {u.email ? (
                      <span className="truncate block max-w-[260px]" title={u.email}>
                        {u.email}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  {/* Actions: Edit, Delete */}
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      {/* Edit */}
                      <button
                        type="button"
                        className="p-1 rounded-md hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(u.userId)}
                        className="p-1 rounded-md hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="flex items-center justify-between pt-3 text-sm text-gray-600 font-medium">
          <div>
            Showing 1 to {Math.min(10, filteredUsers.length)} of {users.length} entries
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled
              className="flex items-center gap-1 text-gray-300 cursor-not-allowed text-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-gray-700 font-semibold text-sm">Page 1 of 1</span>
            <button
              type="button"
              disabled
              className="flex items-center gap-1 text-gray-300 cursor-not-allowed text-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">
                Add New User
              </h3>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                Auto-assigned: {nextUserId}
              </span>
            </div>
            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={newUser.designation}
                  onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                  placeholder="e.g. Software Developer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. user@flipibook.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 cursor-pointer"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
