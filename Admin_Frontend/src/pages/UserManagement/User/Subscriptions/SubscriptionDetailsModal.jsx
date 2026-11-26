import React from 'react';
import { X, FileText, Repeat } from 'lucide-react';

export default function SubscriptionDetailsModal({ subscription, onClose }) {
  if (!subscription) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[680px] max-w-[95vw] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-8 space-y-7">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#ec5137] shrink-0">
                <Repeat size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  Subscription Details
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {subscription.id} · {subscription.planDisplay || subscription.plan}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center text-sm font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-1.5 rounded-full">
              {subscription.status}
            </span>
          </div>

          {/* Plan Information Section */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-[#ec5137] uppercase tracking-wide">
              Plan Information
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Plan Name</span>
                <span className="font-semibold text-gray-900 text-base">{subscription.plan}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Billing Cycle</span>
                <span className="font-semibold text-gray-900 text-base">{subscription.duration}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Payment Amount</span>
                <span className="font-semibold text-gray-900 text-base">{subscription.paymentAmount}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Subscription Status</span>
                <span className="inline-flex items-center text-xs font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full mt-0.5">
                  {subscription.status}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Period Section */}
          <div className="space-y-4 pt-1">
            <h4 className="text-base font-bold text-[#ec5137] uppercase tracking-wide">
              Subscription Period
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Start Date</span>
                <span className="font-semibold text-gray-900 text-base">{subscription.startDate}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">End Date</span>
                <span className="font-semibold text-gray-900 text-base">{subscription.endDate}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Next Renewal Date</span>
                <span className="font-semibold text-gray-900 text-base">{subscription.nextRenewalDate}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Auto Renewal</span>
                <span className="font-semibold text-gray-900 text-base">{subscription.autoRenewal}</span>
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="space-y-4 pt-1">
            <h4 className="text-base font-bold text-[#ec5137] uppercase tracking-wide">
              Payment Information
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Transaction ID</span>
                <span className="font-semibold text-gray-900 text-base">{subscription.transactionId}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Payment Method</span>
                <span className="font-semibold text-gray-900 text-base">{subscription.paymentMethod}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Payment Status</span>
                <span className="inline-flex items-center text-xs font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full mt-0.5">
                  {subscription.paymentStatus}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1 font-medium text-xs">Invoice</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold text-sm">
                    <FileText size={18} />
                    <span>Invoice</span>
                  </span>
                  <button className="text-sm text-[#2563eb] hover:underline font-semibold cursor-pointer">
                    View
                  </button>
                </div>
              </div>
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
