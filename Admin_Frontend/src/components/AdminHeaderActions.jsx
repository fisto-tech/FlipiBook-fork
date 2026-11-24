import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import ProfileModal from './ProfileModal';

export default function AdminHeaderActions() {
  const { adminUser } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);

  const avatarUrl =
    adminUser?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const userName = adminUser?.name || 'Super Administrator';

  return (
    <div className="flex items-center gap-[0.9vw] relative select-none">
      {/* Profile Avatar trigger */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center cursor-pointer focus:outline-none transition transform active:scale-95"
        title="View Profile Details"
      >
        <img
          src={avatarUrl}
          alt={userName}
          className="w-[2.2vw] h-[2.2vw] rounded-full object-cover border border-gray-200 shadow-2xs hover:ring-2 hover:ring-blue-300 transition"
        />
      </button>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={adminUser}
      />
    </div>
  );
}
