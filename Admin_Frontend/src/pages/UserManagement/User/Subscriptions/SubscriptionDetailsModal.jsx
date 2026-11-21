import React from 'react';
import { X, FileText, Repeat } from 'lucide-react';

export default function SubscriptionDetailsModal({ subscription, onClose }) {
  if (!subscription) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-[1vw]">
      <div className="bg-white rounded-[1vw] shadow-2xl border border-gray-100 w-[38vw] max-w-[95vw] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-[1.6vw] space-y-[1.4vw]">
          {/* Modal Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-[0.9vw]">
              <div className="w-[2.4vw] h-[2.4vw] rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#ef4444] shrink-0">
                <Repeat size="1.2vw" />
              </div>
              <div>
                <h3 className="text-[1vw] font-semibold text-gray-900 leading-tight">
                  Subscription Details
                </h3>
                <p className="text-[0.7vw] text-gray-400 mt-[0.1vw]">
                  {subscription.id} · {subscription.planDisplay}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#16a34a] bg-[#f0fdf4] px-[0.7vw] py-[0.2vw] rounded-full">
              {subscription.status}
            </span>
          </div>

          {/* Plan Information Section */}
          <div className="space-y-[0.8vw]">
            <h4 className="text-[0.8vw] font-semibold text-[#ef4444]">
              Plan Information
            </h4>
            <div className="grid grid-cols-2 gap-x-[1.5vw] gap-y-[0.8vw] text-[0.7vw]">
              <div>
                <span className="block text-[0.7vw] text-gray-400">Plan Name</span>
                <span className="font-semibold text-gray-900">{subscription.plan}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Billing Cycle</span>
                <span className="font-semibold text-gray-900">{subscription.duration}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Payment Amount</span>
                <span className="font-semibold text-gray-900">{subscription.paymentAmount}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Subscription Status</span>
                <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#16a34a] bg-[#f0fdf4] px-[0.6vw] py-[0.15vw] rounded-full mt-[0.1vw]">
                  {subscription.status}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Period Section */}
          <div className="space-y-[0.8vw]">
            <h4 className="text-[0.8vw] font-semibold text-[#ef4444]">
              Subscription Period
            </h4>
            <div className="grid grid-cols-2 gap-x-[1.5vw] gap-y-[0.8vw] text-[0.7vw]">
              <div>
                <span className="block text-[0.7vw] text-gray-400">Start Date</span>
                <span className="font-semibold text-gray-900">{subscription.startDate}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">End Date</span>
                <span className="font-semibold text-gray-900">{subscription.endDate}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Next Renewal Date</span>
                <span className="font-semibold text-gray-900">{subscription.nextRenewalDate}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Auto Renewal</span>
                <span className="font-semibold text-gray-900">{subscription.autoRenewal}</span>
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="space-y-[0.8vw]">
            <h4 className="text-[0.8vw] font-semibold text-[#ef4444]">
              Payment Information
            </h4>
            <div className="grid grid-cols-2 gap-x-[1.5vw] gap-y-[0.8vw] text-[0.7vw]">
              <div>
                <span className="block text-[0.7vw] text-gray-400">Transaction ID</span>
                <span className="font-semibold text-gray-900">{subscription.transactionId}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Payment Method</span>
                <span className="font-semibold text-gray-900">{subscription.paymentMethod}</span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Payment Status</span>
                <span className="inline-flex items-center text-[0.7vw] font-semibold text-[#16a34a] bg-[#f0fdf4] px-[0.6vw] py-[0.15vw] rounded-full mt-[0.1vw]">
                  {subscription.paymentStatus}
                </span>
              </div>
              <div>
                <span className="block text-[0.7vw] text-gray-400">Invoice</span>
                <div className="flex items-center gap-[0.4vw] mt-[0.1vw]">
                  <span className="inline-flex items-center gap-[0.2vw] text-red-500 font-semibold">
                    <FileText size="0.75vw" />
                    <span className="text-[0.7vw]">Invoice</span>
                  </span>
                  <button className="text-[0.7vw] text-[#2563eb] hover:underline font-semibold cursor-pointer">
                    View
                  </button>
                </div>
              </div>
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
