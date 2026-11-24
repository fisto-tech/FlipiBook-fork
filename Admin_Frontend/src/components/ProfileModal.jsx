import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

export default function ProfileModal({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  const { logout } = useAdmin();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onClose();
      logout();
      navigate('/login');
    }
  };

  const avatarUrl =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  const name = user?.name || 'Super Administrator';
  const designation = user?.designation || user?.role || 'Super Admin';
  const userId = user?.userId || user?.id || 'ADM-89024';
  const email = user?.email || 'admin@flipibook.com';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[26vw] bg-white rounded-[1.2vw] shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Decorative Banner */}
        <div className="relative h-[6.5vw] bg-linear-to-r from-[#1e293b] via-[#334155] to-[#1e293b] p-[1.2vw] flex items-start justify-between">
          <span className="text-white/80 text-[0.72vw] font-bold tracking-wider uppercase">
            Admin Profile Overview
          </span>
          {/* Top-Right Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-[0.3vw] px-[0.65vw] py-[0.3vw] rounded-full bg-white/10 hover:bg-white/20 text-white text-[0.72vw] font-semibold cursor-pointer transition"
            title="Close"
          >
            <span className="text-[0.75vw]">✕</span>
            <span>Close</span>
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-[1.8vw] pb-[1.8vw] pt-0 relative">
          {/* Centered Avatar floating over banner */}
          <div className="flex flex-col items-center -mt-[3.2vw]">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={name}
                className="w-[6vw] h-[6vw] rounded-full object-cover border-[0.25vw] border-white shadow-xl ring-2 ring-gray-100"
              />
              <span className="absolute bottom-[0.3vw] right-[0.3vw] w-[1vw] h-[1vw] bg-emerald-500 border-2 border-white rounded-full shadow-xs"></span>
            </div>

            {/* Name & Designation */}
            <h2 className="text-[1.25vw] font-bold text-[#111827] mt-[0.8vw] leading-tight">
              {name}
            </h2>
            <div className="mt-[0.3vw] inline-flex items-center gap-[0.4vw] px-[0.85vw] py-[0.2vw] rounded-full text-[0.75vw] font-bold bg-blue-50 text-blue-600 border border-blue-200/80">
              <span className="w-[0.4vw] h-[0.4vw] rounded-full bg-blue-600"></span>
              <span>{designation}</span>
            </div>
          </div>

          {/* Details Section */}
          <div className="mt-[1.5vw] space-y-[0.8vw]">
            {/* User ID */}
            <div className="flex items-center justify-between p-[0.9vw] rounded-[0.7vw] bg-[#f8fafc] border border-gray-100 hover:border-gray-200 transition">
              <div className="flex items-center gap-[0.7vw]">
                <div className="w-[2vw] h-[2vw] rounded-[0.45vw] bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg className="w-[1vw] h-[1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="3"></rect>
                    <line x1="7" y1="8" x2="17" y2="8"></line>
                    <line x1="7" y1="12" x2="13" y2="12"></line>
                  </svg>
                </div>
                <span className="text-[0.78vw] font-semibold text-gray-500">
                  User ID
                </span>
              </div>
              <span className="text-[0.85vw] font-bold text-[#1e293b] font-mono tracking-wide">
                {userId}
              </span>
            </div>

            {/* Email / Mail-Id */}
            <div className="flex items-center justify-between p-[0.9vw] rounded-[0.7vw] bg-[#f8fafc] border border-gray-100 hover:border-gray-200 transition">
              <div className="flex items-center gap-[0.7vw]">
                <div className="w-[2vw] h-[2vw] rounded-[0.45vw] bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-[1vw] h-[1vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <span className="text-[0.78vw] font-semibold text-gray-500">
                  Mail ID
                </span>
              </div>
              <span className="text-[0.82vw] font-semibold text-[#1e293b] truncate max-w-[13vw]">
                {email}
              </span>
            </div>
          </div>

          {/* Modal Bottom Log-out Button */}
          <div className="mt-[1.6vw]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-[0.7vw] rounded-[0.6vw] bg-red-600 hover:bg-red-700 text-white text-[0.82vw] font-bold transition duration-150 cursor-pointer shadow-xs flex items-center justify-center gap-[0.5vw]"
            >
              <svg
                className="w-[1vw] h-[1vw]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log-out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
