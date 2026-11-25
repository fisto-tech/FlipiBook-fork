import React from 'react';
import { Box, Sparkles, Clock } from 'lucide-react';

export default function ThreeDRequestsTab({ user }) {
  return (
    <div className="bg-white rounded-[0.85vw] border border-gray-100 p-[2.5vw] shadow-xs text-center space-y-[1.2vw]">
      {/* Icon Badge */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-[4.5vw] h-[4.5vw] rounded-[1vw] bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 shadow-xs">
          <Box size="2.4vw" className="stroke-[1.6]" />
        </div>
        <div className="absolute -top-[0.3vw] -right-[0.3vw] w-[1.6vw] h-[1.6vw] rounded-full bg-[#ec5137] text-white flex items-center justify-center shadow-xs">
          <Sparkles size="0.85vw" />
        </div>
      </div>

      {/* Heading & Description */}
      <div className="space-y-[0.4vw] max-w-[28vw] mx-auto">
        <div className="inline-flex items-center gap-[0.3vw] text-[0.7vw] font-semibold text-amber-600 bg-amber-100/70 px-[0.7vw] py-[0.2vw] rounded-full uppercase tracking-wider">
          <Clock size="0.7vw" />
          <span>Under Development</span>
        </div>

        <h3 className="text-[1vw] font-semibold text-gray-900 tracking-tight pt-[0.2vw]">
          3D Requests Feature is Coming Soon
        </h3>
        
        <p className="text-[0.8vw] text-gray-500 leading-relaxed">
          Custom 3D model asset generation, 3D interactive viewer customization, and request tracking for users will be available here soon.
        </p>
      </div>

      {/* Decorative Status Card */}
      <div className="inline-block bg-gray-50 border border-dashed border-gray-200 rounded-[0.6vw] px-[1.5vw] py-[0.7vw]">
        <span className="text-[0.7vw] text-gray-400 font-semibold">
          Stay tuned! 3D model requests module will launch in an upcoming release.
        </span>
      </div>
    </div>
  );
}
