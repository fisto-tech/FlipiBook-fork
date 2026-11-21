import React from 'react';
import { X, Receipt } from 'lucide-react';

export default function PaymentDetailsModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-[1vw]">
      <div className="bg-white rounded-[1vw] shadow-2xl border border-gray-100 w-[38vw] max-w-[95vw] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-[1.6vw] space-y-[1.4vw]">
          {/* Modal Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-[0.9vw]">
              <div className="w-[2.4vw] h-[2.4vw] rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#ef4444] shrink-0">
                <Receipt size="1.2vw" />
              </div>
              <div>
                <h3 className="text-[1vw] font-semibold text-gray-900 leading-tight">
                  Transaction Details
                </h3>
                <p className="text-[0.7vw] text-gray-400 mt-[0.1vw]">
                  {transaction.id} · {transaction.date}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center text-[0.7vw] font-semibold px-[0.7vw] py-[0.2vw] rounded-full ${
                transaction.status === 'Success'
                  ? 'text-[#16a34a] bg-[#f0fdf4]'
                  : transaction.status === 'Pending'
                  ? 'text-[#d97706] bg-[#fef3c7]'
                  : 'text-[#ef4444] bg-[#fee2e2]'
              }`}
            >
              {transaction.status}
            </span>
          </div>

          {/* Transaction Basic Information */}
          <div className="grid grid-cols-2 gap-x-[1.5vw] gap-y-[0.8vw] text-[0.7vw] pt-[0.2vw]">
            <div>
              <span className="block text-[0.7vw] text-gray-400">Payment For</span>
              <span className="font-semibold text-gray-900">{transaction.paymentFor}</span>
            </div>
            <div>
              <span className="block text-[0.7vw] text-gray-400">Payment Method</span>
              <span className="font-semibold text-gray-900">{transaction.method}</span>
            </div>
            <div>
              <span className="block text-[0.7vw] text-gray-400">Payment Amount</span>
              <span className="font-semibold text-gray-900">{transaction.amount || '₹8,000'}</span>
            </div>
            <div>
              <span className="block text-[0.7vw] text-gray-400">Payment Date</span>
              <span className="font-semibold text-gray-900">{transaction.paymentDate || '11 Nov 2026'}</span>
            </div>
          </div>

          {/* Refund Information Section (Shown for Refunded or all with details) */}
          <div className="space-y-[0.8vw] pt-[0.4vw]">
            <div className="flex items-center justify-between">
              <h4 className="text-[0.8vw] font-semibold text-[#ef4444]">
                Refund Information
              </h4>
              <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#16a34a] bg-[#f0fdf4] px-[0.6vw] py-[0.15vw] rounded-full">
                {transaction.refundStatus || 'Completed'}
              </span>
            </div>

            <div className="text-[0.7vw]">
              <span className="block text-[0.7vw] text-gray-400">Refund Amount</span>
              <span className="text-[1vw] font-semibold text-[#16a34a]">
                {transaction.refundAmount || '₹8,000'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-[1.5vw] gap-y-[0.8vw] text-[0.7vw]">
              <div>
                <span className="block text-[0.7vw] text-gray-400">Refund ID</span>
                <span className="font-semibold text-gray-900">{transaction.refundId || 'REF001'}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Refund Date</span>
                <span className="font-semibold text-gray-900">{transaction.refundDate || '12 Nov 2026'}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Refund Method</span>
                <span className="font-semibold text-gray-900">{transaction.refundMethod || 'Original UPI'}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Refund Type</span>
                <span className="font-semibold text-gray-900">{transaction.refundType || 'Full Refund'}</span>
              </div>
            </div>

            <div className="text-[0.7vw] pt-[0.2vw]">
              <span className="block text-[0.7vw] text-gray-400">Refund Reason</span>
              <span className="font-semibold text-gray-900">{transaction.refundReason || 'Project Cancelled'}</span>
            </div>
          </div>

          {/* Close Button Bottom Right */}
          <div className="flex justify-end pt-[0.4vw]">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-[0.35vw] text-[0.8vw] font-semibold text-gray-700 bg-white border border-gray-200/90 hover:bg-gray-50 px-[1.1vw] py-[0.45vw] rounded-[0.4vw] shadow-xs transition cursor-pointer"
            >
              <X size="0.8vw" className="text-gray-500" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
