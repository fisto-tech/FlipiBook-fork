import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';
import SubscriptionDetailsModal from './SubscriptionDetailsModal';

export default function SubscriptionsTab({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('Public');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [selectedSub, setSelectedSub] = useState(null);

  // Default subscriptions matching Image 1
  const subscriptions = [
    {
      id: 'SUB-001',
      plan: 'Premium',
      planDisplay: 'Premium Plan',
      duration: 'Yearly',
      startDate: '14 Oct 2026',
      endDate: '14 Oct 2027',
      amount: '₹4,999',
      paymentAmount: 'Subscription Amount',
      status: 'Active',
      nextRenewalDate: '14 Oct 2027',
      autoRenewal: 'Enabled',
      transactionId: '14 Oct 2027', // Matching Image 2
      paymentMethod: 'UPI',
      paymentStatus: 'Successful',
      invoiceAvailable: true
    },
    {
      id: 'SUB-002',
      plan: 'Premium',
      planDisplay: 'Premium Plan',
      duration: 'Yearly',
      startDate: '14 Oct 2025',
      endDate: '14 Oct 2026',
      amount: '₹4,999',
      paymentAmount: 'Subscription Amount',
      status: 'Expired',
      nextRenewalDate: '14 Oct 2026',
      autoRenewal: 'Disabled',
      transactionId: 'TXN-884210',
      paymentMethod: 'UPI',
      paymentStatus: 'Successful',
      invoiceAvailable: true
    },
    {
      id: 'SUB-003',
      plan: 'Basic',
      planDisplay: 'Basic Plan',
      duration: 'Monthly',
      startDate: '14 Sep 2025',
      endDate: '14 Oct 2025',
      amount: '₹499',
      paymentAmount: 'Subscription Amount',
      status: 'Expired',
      nextRenewalDate: '14 Oct 2025',
      autoRenewal: 'Disabled',
      transactionId: 'TXN-761298',
      paymentMethod: 'Card',
      paymentStatus: 'Successful',
      invoiceAvailable: true
    },
    {
      id: 'SUB-004',
      plan: 'FB004',
      planDisplay: 'Lifetime Plan',
      duration: 'Lifetime',
      startDate: '10 Aug 2025',
      endDate: '-',
      amount: '₹0',
      paymentAmount: 'Subscription Amount',
      status: 'Expired',
      nextRenewalDate: '-',
      autoRenewal: 'Disabled',
      transactionId: 'TXN-554190',
      paymentMethod: 'Promotional',
      paymentStatus: 'Successful',
      invoiceAvailable: true
    }
  ];

  return (
    <div className="space-y-[1.2vw] font-sans">
      {/* Top Header Card */}
      <div className="bg-white rounded-[0.85vw] border border-gray-100/90 p-[1.2vw] shadow-xs space-y-[1vw]">
        {/* Title & Counters */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[1vw] font-semibold text-gray-900">Subscription History</h2>
            <p className="text-[0.7vw] text-gray-400 mt-[0.1vw]">All subscription history by this user.</p>
          </div>

          <div className="flex items-center gap-[0.6vw]">
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#16a34a] bg-[#dcfce7] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Total Spend : ₹14,997
            </span>
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#4f46e5] bg-[#e0e7ff] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Active Plans : 01
            </span>
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#ef4444] bg-[#fee2e2] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Total Subscriptions : 08
            </span>
          </div>
        </div>

        {/* Search, Filter by, Sort by Controls */}
        <div className="flex items-center gap-[0.8vw] pt-[0.2vw]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-[20vw]">
            <Search
              size="0.85vw"
              className="absolute left-[0.8vw] top-1/2 -translate-y-1/2 text-[#ef4444]"
            />
            <input
              type="text"
              placeholder="Search 3D Requests ..."
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
        </div>
      </div>

      {/* Subscription Table */}
      <div className="bg-white rounded-[0.85vw] border border-gray-100 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f8f8] text-[0.8vw] font-semibold text-[#111827] border-b border-[#f0f0f0]">
              <th className="py-[0.95vw] px-[1.4vw] font-semibold">Plan</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Duration</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Start Date</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">End Date</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Amount</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold text-center">Status</th>
              <th className="py-[0.95vw] px-[1.4vw] font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f5] text-[0.8vw] font-normal">
            {subscriptions
              .filter(
                (s) =>
                  s.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.duration.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.id.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((sub, index) => (
                <tr key={sub.id || index} className="group hover:bg-[#fafafa] transition-colors duration-150">
                  <td className="py-[0.95vw] px-[1.4vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {sub.plan}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {sub.duration}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {sub.startDate}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {sub.endDate}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {sub.amount}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-center">
                    {sub.status === 'Active' ? (
                      <span className="inline-block px-[1.1vw] py-[0.35vw] rounded-full text-[0.7vw] font-medium bg-[#ebf7ee] text-[#34a853]">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-[1.1vw] py-[0.35vw] rounded-full text-[0.7vw] font-medium bg-[#fef3e6] text-[#f58e1e]">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="py-[0.95vw] px-[1.4vw] text-center">
                    <button
                      onClick={() => setSelectedSub(sub)}
                      className="inline-flex items-center gap-[0.35vw] px-[1vw] py-[0.38vw] rounded-[0.55vw] bg-[#feeeeb] text-[#ec5137] hover:bg-[#fedbd5] transition text-[0.7vw] font-medium cursor-pointer"
                    >
                      <span>View</span>
                      <svg
                        className="w-[0.78vw] h-[0.78vw] text-[#ec5137] stroke-[2.2]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Subscription Details Modal */}
      {selectedSub && (
        <SubscriptionDetailsModal
          subscription={selectedSub}
          onClose={() => setSelectedSub(null)}
        />
      )}
    </div>
  );
}
