import React from 'react';
import AdminHeaderActions from '../components/AdminHeaderActions';

export default function DashboardPage() {
  return (
    <div className="w-full space-y-[1.8vw] font-sans pb-[2vw]">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[1.8vw] font-bold text-[#111827] tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-[0.78vw] text-[#9ca3af] font-medium mt-[0.2vw]">
            Overview of platform activity, statistics, and system health.
          </p>
        </div>

        <AdminHeaderActions />
      </div>

      <div className="w-full min-h-[40vh] flex flex-col items-center justify-center text-center p-[2vw]">
        <div className="w-[3.2vw] h-[3.2vw] rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-[1vw]">
          <svg className="w-[1.6vw] h-[1.6vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        <h2 className="text-[1.2vw] font-bold text-gray-800">Dashboard</h2>
        <p className="text-[0.8vw] text-gray-400 mt-[0.2vw]">
          This section is currently empty.
        </p>
      </div>
    </div>
  );
}
