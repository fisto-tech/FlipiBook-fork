import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';

export default function ActivityTab({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('Public');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [dateRange, setDateRange] = useState('Oct 16, 2026 – Oct 22, 2026');

  // Activity list matching the exact screenshot
  const activities = [
    {
      id: 'ACT-001',
      dateTime: '13 Nov, 10:30 AM',
      activityType: 'Login',
      description: 'What action was performed',
      performedBy: 'User',
      status: 'Success',
      statusType: 'success'
    },
    {
      id: 'ACT-002',
      dateTime: '12 Nov, 02:20 PM',
      activityType: 'Account Update',
      description: 'What action was performed',
      performedBy: 'Admin',
      status: 'Updated',
      statusType: 'updated'
    },
    {
      id: 'ACT-003',
      dateTime: '12 Nov, 11:45 AM',
      activityType: 'Flipbook',
      description: 'What action was performed',
      performedBy: 'Admin',
      status: 'Success',
      statusType: 'success'
    },
    {
      id: 'ACT-004',
      dateTime: '11 Nov, 11:30 AM',
      activityType: 'Subscription',
      description: 'What action was performed',
      performedBy: 'System',
      status: 'Failed',
      statusType: 'failed'
    },
    {
      id: 'ACT-005',
      dateTime: '10 Nov, 11:30 AM',
      activityType: 'Subscription',
      description: 'What action was performed',
      performedBy: 'System',
      status: 'Success',
      statusType: 'success'
    }
  ];

  const renderStatusBadge = (status, type) => {
    switch (type) {
      case 'success':
        return (
          <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#16a34a] bg-[#f0fdf4] px-[0.75vw] py-[0.2vw] rounded-full">
            {status}
          </span>
        );
      case 'updated':
        return (
          <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#d97706] bg-[#fef3c7] px-[0.75vw] py-[0.2vw] rounded-full">
            {status}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#ef4444] bg-[#fee2e2] px-[0.75vw] py-[0.2vw] rounded-full">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[0.7vw] font-semibold text-gray-600 bg-gray-100 px-[0.75vw] py-[0.2vw] rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-[1.2vw] font-sans">
      {/* Top Header Card */}
      <div className="bg-white rounded-[0.85vw] border border-gray-100/90 p-[1.2vw] shadow-xs space-y-[1vw]">
        {/* Title */}
        <div>
          <h2 className="text-[1vw] font-semibold text-gray-900">All Activities</h2>
          <p className="text-[0.7vw] text-gray-400 mt-[0.1vw]">
            All Payment transactions by this user.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-[0.8vw] pt-[0.2vw]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-[20vw]">
            <Search
              size="0.85vw"
              className="absolute left-[0.8vw] top-1/2 -translate-y-1/2 text-[#ef4444]"
            />
            <input
              type="text"
              placeholder="Search Activity ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[2.2vw] pr-[0.8vw] py-[0.48vw] rounded-full border border-gray-200/90 text-[0.8vw] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-300 shadow-xs"
            />
          </div>

          {/* Filter by - Public */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-[0.45vw] text-[0.8vw] font-semibold text-gray-600 bg-white border border-gray-200/90 rounded-full px-[0.9vw] py-[0.48vw] shadow-xs hover:border-gray-300 cursor-pointer"
            >
              <Filter size="0.75vw" className="text-[#ef4444]" />
              <span>Filter by - Public</span>
              <ChevronDown size="0.7vw" className="text-gray-400 ml-[0.3vw]" />
            </button>
          </div>

          {/* Sort by - Newest First */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-[0.45vw] text-[0.8vw] font-semibold text-gray-600 bg-white border border-gray-200/90 rounded-full px-[0.9vw] py-[0.48vw] shadow-xs hover:border-gray-300 cursor-pointer"
            >
              <ArrowUpDown size="0.75vw" className="text-[#ef4444]" />
              <span>Sort by - Newest First</span>
              <ChevronDown size="0.7vw" className="text-gray-400 ml-[0.3vw]" />
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-[0.45vw] text-[0.8vw] font-semibold text-gray-600 bg-white border border-gray-200/90 rounded-full px-[0.9vw] py-[0.48vw] shadow-xs hover:border-gray-300 cursor-pointer"
            >
              <Calendar size="0.75vw" className="text-[#ef4444]" />
              <span>{dateRange}</span>
              <ChevronDown size="0.7vw" className="text-gray-400 ml-[0.3vw]" />
            </button>
          </div>
        </div>
      </div>

      {/* Activities Data Table */}
      <div className="bg-white rounded-[0.85vw] border border-gray-100 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f8f8] text-[0.8vw] font-semibold text-[#111827] border-b border-[#f0f0f0]">
              <th className="py-[0.95vw] px-[1.4vw] font-semibold">Date & Time</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Activity Type</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Performed By</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f5] text-[0.8vw] font-normal">
            {activities
              .filter(
                (act) =>
                  act.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  act.performedBy.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((act) => (
                <tr key={act.id} className="group hover:bg-[#fafafa] transition-colors duration-150">
                  <td className="py-[0.95vw] px-[1.4vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {act.dateTime}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {act.activityType}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {act.performedBy}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-center">
                    {act.statusType === 'success' ? (
                      <span className="inline-block px-[1.1vw] py-[0.35vw] rounded-full text-[0.7vw] font-medium bg-[#ebf7ee] text-[#34a853]">
                        {act.status}
                      </span>
                    ) : act.statusType === 'updated' ? (
                      <span className="inline-block px-[1.1vw] py-[0.35vw] rounded-full text-[0.7vw] font-medium bg-[#fef3e6] text-[#f58e1e]">
                        {act.status}
                      </span>
                    ) : (
                      <span className="inline-block px-[1.1vw] py-[0.35vw] rounded-full text-[0.7vw] font-medium bg-[#fee2e2] text-[#ef4444]">
                        {act.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
