import React from 'react';
import { X, Receipt } from 'lucide-react';

export default function PaymentDetailsModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[680px] max-w-[95vw] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-8 space-y-7">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#ec5137] shrink-0">
                <Receipt size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  Transaction Details
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {transaction.id} · {transaction.date}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center text-sm font-semibold px-4 py-1.5 rounded-full border ${
                transaction.status === 'Success'
                  ? 'text-[#16a34a] bg-[#f0fdf4] border-[#bbf7d0]'
                  : transaction.status === 'Pending'
                  ? 'text-[#d97706] bg-[#fef3c7] border-[#fde68a]'
                  : 'text-[#ef4444] bg-[#fee2e2] border-[#fecaca]'
              }`}
            >
              {transaction.status}
            </span>
          </div>

          {/* Transaction Basic Information */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm pt-1">
            <div>
              <span className="block text-gray-400 mb-1 font-medium text-xs">Payment For</span>
              <span className="font-semibold text-gray-900 text-base">{transaction.paymentFor}</span>
            </div>
            <div>
              <span className="block text-gray-400 mb-1 font-medium text-xs">Payment Method</span>
              <span className="font-semibold text-gray-900 text-base">{transaction.method}</span>
            </div>
            <div>
              <span className="block text-gray-400 mb-1 font-medium text-xs">Payment Amount</span>
              <span className="font-semibold text-gray-900 text-base">{transaction.amount || '₹8,000'}</span>
            </div>
            <div>
              <span className="block text-gray-400 mb-1 font-medium text-xs">Payment Date</span>
              <span className="font-semibold text-gray-900 text-base">{transaction.paymentDate || '11 Nov 2026'}</span>
            </div>
          </div>

          {/* Refund Information Section (Shown for Refunded or all with details) */}
          <div className="space-y-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#ec5137] uppercase tracking-wide">
                Refund Information
              </h4>
              <span className="inline-flex items-center text-xs font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full">
                {transaction.refundStatus || 'Completed'}
              </span>
            </div>

            <div className="text-sm">
              <span className="block text-gray-400 mb-1 font-medium text-xs">Refund Amount</span>
              <span className="text-xl font-bold text-[#16a34a]">
                {transaction.refundAmount || '₹8,000'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Refund ID</span>
                <span className="font-semibold text-gray-900 text-base">{transaction.refundId || 'REF001'}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Refund Date</span>
                <span className="font-semibold text-gray-900 text-base">{transaction.refundDate || '12 Nov 2026'}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Refund Method</span>
                <span className="font-semibold text-gray-900 text-base">{transaction.refundMethod || 'Original UPI'}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Refund Type</span>
                <span className="font-semibold text-gray-900 text-base">{transaction.refundType || 'Full Refund'}</span>
              </div>
            </div>

            <div className="text-sm pt-1">
              <span className="block text-gray-400 mb-1 font-medium text-xs">Refund Reason</span>
              <span className="font-semibold text-gray-900 text-base">{transaction.refundReason || 'Project Cancelled'}</span>
            </div>
          </div>

          {/* Close Button Bottom Right */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
            >
              <X size={18} className="text-gray-500" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
