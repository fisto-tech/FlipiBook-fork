import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import PaymentDetailsModal from './PaymentDetailsModal';

export default function PaymentsTab({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('Public');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Transactions list matching Image 1
  const transactions = [
    {
      id: 'TXN-001',
      paymentFor: 'Premium Plan',
      date: '14 Oct 2026',
      method: 'UPI',
      status: 'Success',
      invoiceNo: 'INV-2026-001',
      amount: '₹4,999',
      paymentDate: '14 Oct 2026',
      refundStatus: 'None',
      refundAmount: '₹0',
      refundId: '-',
      refundDate: '-',
      refundMethod: '-',
      refundType: '-',
      refundReason: '-'
    },
    {
      id: 'TXN-002',
      paymentFor: '3D Project',
      date: '14 Oct 2025',
      method: 'Bank',
      status: 'Pending',
      invoiceNo: 'INV-2026-002',
      amount: '₹8,000',
      paymentDate: '14 Oct 2025',
      refundStatus: 'Pending',
      refundAmount: '₹8,000',
      refundId: 'REF002',
      refundDate: '15 Oct 2025',
      refundMethod: 'Bank Transfer',
      refundType: 'Full Refund',
      refundReason: 'Processing Verification'
    },
    {
      id: 'TXN-003',
      paymentFor: 'Premium Plan',
      date: '14 Sep 2025',
      method: 'UPI',
      status: 'Success',
      invoiceNo: 'INV-2026-003',
      amount: '₹4,999',
      paymentDate: '14 Sep 2025',
      refundStatus: 'None',
      refundAmount: '₹0',
      refundId: '-',
      refundDate: '-',
      refundMethod: '-',
      refundType: '-',
      refundReason: '-'
    },
    {
      id: 'TXN-004',
      paymentFor: '3D Project',
      date: '16 Sep 2025',
      method: 'UPI',
      status: 'Refunded',
      invoiceNo: 'INV-2026-003',
      amount: '₹8,000',
      paymentDate: '11 Nov 2026',
      refundStatus: 'Completed',
      refundAmount: '₹8,000',
      refundId: 'REF001',
      refundDate: '12 Nov 2026',
      refundMethod: 'Original UPI',
      refundType: 'Full Refund',
      refundReason: 'Project Cancelled'
    },
    {
      id: 'TXN-005',
      paymentFor: 'Pro Plan',
      date: '10 Aug 2025',
      method: 'UPI',
      status: 'Success',
      invoiceNo: 'INV-2026-004',
      amount: '₹2,499',
      paymentDate: '10 Aug 2025',
      refundStatus: 'None',
      refundAmount: '₹0',
      refundId: '-',
      refundDate: '-',
      refundMethod: '-',
      refundType: '-',
      refundReason: '-'
    }
  ];

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#16a34a] bg-[#f0fdf4] px-[0.75vw] py-[0.2vw] rounded-full">
            Success
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#d97706] bg-[#fef3c7] px-[0.75vw] py-[0.2vw] rounded-full">
            Pending
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#ef4444] bg-[#fee2e2] px-[0.75vw] py-[0.2vw] rounded-full">
            Refunded
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
        {/* Title & Counters */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[1vw] font-semibold text-gray-900">Payment Transaction History</h2>
            <p className="text-[0.7vw] text-gray-400 mt-[0.1vw]">All Payment transactions by this user.</p>
          </div>

          <div className="flex items-center gap-[0.6vw]">
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#16a34a] bg-[#dcfce7] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Total Amt Paid : ₹24,999
            </span>
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#4f46e5] bg-[#e0e7ff] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Transactions : 04
            </span>
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#d97706] bg-[#fef3c7] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Pending : 01
            </span>
            <span className="inline-flex items-center text-[0.8vw] font-semibold text-[#ef4444] bg-[#fee2e2] px-[0.9vw] py-[0.35vw] rounded-[0.4vw]">
              Refunded : ₹1,999
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

      {/* Payment Transactions Table */}
      <div className="bg-white rounded-[0.85vw] border border-gray-100 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f8f8] text-[0.8vw] font-semibold text-[#111827] border-b border-[#f0f0f0]">
              <th className="py-[0.95vw] px-[1.4vw] font-semibold">Transaction ID</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Payment For</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Date</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Method</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold text-center">Status</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Invoice No</th>
              <th className="py-[0.95vw] px-[1.1vw] font-semibold">Invoice</th>
              <th className="py-[0.95vw] px-[1.4vw] font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f5] text-[0.8vw] font-normal">
            {transactions
              .filter(
                (txn) =>
                  txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  txn.paymentFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  txn.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  txn.method.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((txn) => (
                <tr key={txn.id} className="group hover:bg-[#fafafa] transition-colors duration-150">
                  <td className="py-[0.95vw] px-[1.4vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {txn.id}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {txn.paymentFor}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {txn.date}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {txn.method}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-center">
                    {txn.status === 'Success' ? (
                      <span className="inline-block px-[1.1vw] py-[0.35vw] rounded-full text-[0.7vw] font-medium bg-[#ebf7ee] text-[#34a853]">
                        Success
                      </span>
                    ) : txn.status === 'Pending' ? (
                      <span className="inline-block px-[1.1vw] py-[0.35vw] rounded-full text-[0.7vw] font-medium bg-[#fef3e6] text-[#f58e1e]">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-block px-[1.1vw] py-[0.35vw] rounded-full text-[0.7vw] font-medium bg-[#fee2e2] text-[#ef4444]">
                        {txn.status}
                      </span>
                    )}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw] text-[#4b5563] group-hover:text-black transition-colors">
                    {txn.invoiceNo}
                  </td>
                  <td className="py-[0.95vw] px-[1.1vw]">
                    <button className="inline-flex items-center gap-[0.3vw] text-[#ec5137] hover:underline font-medium cursor-pointer">
                      <FileText size="0.75vw" className="text-[#ec5137]" />
                      <span className="text-[0.7vw]">Download PDF</span>
                    </button>
                  </td>
                  <td className="py-[0.95vw] px-[1.4vw] text-center">
                    <button
                      onClick={() => setSelectedTxn(txn)}
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

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <PaymentDetailsModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
}
