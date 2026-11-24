import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { getUserDetails, getUsers } from '../../../services/adminApi';
import { useAdmin } from '../../../context/AdminContext';
import AdminHeaderActions from '../../../components/AdminHeaderActions';

// Import Tab Components
import OverviewTab from './Overview/OverviewTab';
import ProfileDetailsTab from './ProfileDetails/ProfileDetailsTab';
import FlipbooksTab from './Flipbooks/FlipbooksTab';
import ThreeDRequestsTab from './3DRequests/ThreeDRequestsTab';
import SubscriptionsTab from './Subscriptions/SubscriptionsTab';
import PaymentsTab from './Payments/PaymentsTab';
import ActivityTab from './Activity/ActivityTab';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAdmin();

  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedFlipbookId, setSelectedFlipbookId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [flipbooks, setFlipbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Try fetching user details by ID
        const res = await getUserDetails(id);
        if (res?.user) {
          setUserData(res.user);
          setProfileData(res.profile || null);
          setFlipbooks(res.flipbooks || []);
        } else {
          // If not found by mongo ID, query user list by string ID
          const listRes = await getUsers({ search: id });
          if (listRes?.users?.length > 0) {
            const found = listRes.users[0];
            setUserData(found);
            setProfileData(found.profile || null);
          }
        }
      } catch (err) {
        // Fallback: search by query
        try {
          const listRes = await getUsers({ search: id });
          if (listRes?.users?.length > 0) {
            const found = listRes.users[0];
            setUserData(found);
            setProfileData(found.profile || null);
          } else {
            showToast(err.message || 'Failed to load user', 'error');
          }
        } catch (_) {
          showToast('Failed to load user details', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const tabs = [
    { name: 'Overview', label: 'Over View' },
    { name: 'ProfileDetails', label: 'Profile Details' },
    { name: 'Flipbooks', label: 'Flipbooks' },
    { name: '3DRequests', label: '3D Requests' },
    { name: 'Subscriptions', label: 'Subscriptions' },
    { name: 'Payments', label: 'Payments' },
    { name: 'Activity', label: 'Activity' }
  ];

  const displayName = userData?.displayName || userData?.username || 'Tech Builders';
  const name = userData?.name || 'Arjun Kumar';
  const email = userData?.emailId || userData?.email || 'example@gmail.com';
  const userIdDisplay = userData?.userID || id || 'FB001';
  const accType = userData?.accountType || 'Individual';
  const joinDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : '28 SEP 2026';
  const plan = userData?.plan || 'Pro Plan';
  const status = userData?.status || 'Active';

  // Resolve user picture URL
  const rawPicture = userData?.picture || userData?.avatar || userData?.profilePic || profileData?.picture || null;
  const avatarSrc = rawPicture && rawPicture !== 'color_only' && rawPicture !== 'null'
    ? (rawPicture.startsWith('http://') || rawPicture.startsWith('https://') || rawPicture.startsWith('blob:') || rawPicture.startsWith('data:')
      ? rawPicture
      : (rawPicture.startsWith('/uploads') ? rawPicture.replace(/^\/?uploads\//, '/storage/') : (rawPicture.startsWith('/storage') || rawPicture.startsWith('storage/') ? (rawPicture.startsWith('/') ? rawPicture : `/${rawPicture}`) : `/storage/${rawPicture}`)))
    : null;

  // Initial letter for fallback avatar (like main app)
  const initialLetter = (name || displayName || email || 'U').trim().charAt(0).toUpperCase();

  const getAvatarColor = (identifier, customColor) => {
    if (customColor && customColor !== '#E8D4C8' && customColor !== '#ffffff' && customColor !== 'transparent') {
      return customColor;
    }
    const defaultColors = ['#4c5add', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#8a4419', '#597810'];
    if (!identifier) return defaultColors[0];
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    return defaultColors[Math.abs(hash) % defaultColors.length];
  };

  const avatarBgColor = getAvatarColor(name || email || userIdDisplay, userData?.avatarBgColor || profileData?.avatarBgColor);

  return (
    <div className="space-y-[1.2vw] max-w-[98%] mx-auto pb-[2.5vw] font-sans">
      {/* Top Back Navigation Bar & Right Profile Actions */}
      <div className="flex items-center justify-between pt-[0.2vw]">
        <div className="flex items-center gap-[0.7vw]">
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-[0.45vw] text-[0.8vw] font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-200/90 px-[0.7vw] py-[0.35vw] rounded-[0.4vw] shadow-xs transition cursor-pointer"
          >
            <ArrowLeft size="0.9vw" className="text-gray-600" />
            <span>Back to User Management</span>
          </button>

          <span className="text-gray-300 text-[0.8vw]">|</span>

          <span className="text-[0.8vw] font-semibold text-gray-600">
            {userIdDisplay} - {name}
          </span>
        </div>

        <AdminHeaderActions />
      </div>

      {loading ? (
        <div className="py-[6vw] text-center bg-white rounded-[0.85vw] border border-gray-100 shadow-xs">
          <Loader2 className="animate-spin text-[#ec5137] mx-auto mb-[0.6vw]" size="2vw" />
          <p className="text-[0.8vw] font-semibold text-gray-600">Loading user profile details...</p>
        </div>
      ) : (
        <>
          {/* User Header Profile Card */}
          <div className="bg-[#f8f8f8] rounded-[0.85vw] border border-gray-100/90 px-[1.2vw] py-[0.7vw] shadow-xs flex items-center justify-between">
            <div className="flex items-start gap-[1.2vw]">
              {/* Profile Avatar */}
              <div
                className="w-[3.6vw] h-[3.6vw] rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-xs mt-[0.1vw]"
                style={{ backgroundColor: avatarSrc ? 'transparent' : avatarBgColor }}
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center text-white ${avatarSrc ? 'hidden' : 'flex'}`}
                  style={{ backgroundColor: avatarBgColor }}
                >
                  <span className="text-white text-[1.5vw] font-bold select-none">
                    {initialLetter}
                  </span>
                </div>
              </div>

              {/* User Identity Details */}
              <div className="space-y-[0.25vw] text-[0.8vw]">
                <div className="flex items-center gap-[0.4vw]">
                  <span className="text-gray-400 font-semibold">User ID :</span>
                  <span className="font-semibold text-[#ec5137]">{userIdDisplay}</span>
                </div>
                <div className="flex items-center gap-[0.4vw]">
                  <span className="text-gray-400 font-semibold">User Name :</span>
                  <span className="font-semibold text-gray-900">{displayName}</span>
                </div>
                <div className="flex items-center gap-[0.4vw]">
                  <span className="text-gray-400 font-semibold">Disp Name :</span>
                  <span className="font-semibold text-gray-900">{name}</span>
                </div>
                <div className="flex items-center gap-[0.4vw]">
                  <span className="text-gray-400 font-semibold">Email Address :</span>
                  <span className="font-semibold text-gray-900">{email}</span>
                </div>
              </div>
            </div>

            {/* Quick Meta Stats / Status on Right */}
            <div className="flex items-start gap-[2.4vw] pt-[0.2vw]">
              <div className="text-left">
                <span className="text-[0.7vw] text-gray-400 block font-semibold">Acc Type</span>
                <span className="text-[0.8vw] font-semibold text-gray-900">{accType}</span>
              </div>

              <div className="h-[2vw] w-[1px] bg-gray-200" />

              <div className="text-left">
                <span className="text-[0.7vw] text-gray-400 block font-semibold">Join Date</span>
                <span className="text-[0.8vw] font-semibold text-gray-900">{joinDate}</span>
              </div>

              <div className="h-[2vw] w-[1px] bg-gray-200" />

              <div className="text-left">
                <span className="text-[0.7vw] text-gray-400 block font-semibold">Plan</span>
                <span className="text-[0.8vw] font-semibold text-gray-900">{plan}</span>
              </div>

              <div className="h-[2vw] w-[1px] bg-gray-200" />

              <div className="text-left">
                <span className="text-[0.7vw] text-gray-400 block font-semibold">Status</span>
                <span className="text-[0.8vw] font-semibold text-gray-900">{status}</span>
              </div>

              {/* Three dots action */}
              <button className="text-gray-400 hover:text-gray-600 p-[0.3vw] rounded-full hover:bg-gray-100 transition cursor-pointer ml-[0.5vw]">
                <MoreVertical size="1.1vw" />
              </button>
            </div>
          </div>

          {/* Navigation Pill Capsule (matching UserManagement filter style) */}
          <div className="flex items-center pt-[0.2vw]">
            <div className="inline-flex items-center bg-[#FAFAFA] rounded-full p-[0.25vw] border border-gray-200/60">
              {tabs.map((tab) => {
                const isSelected = activeTab === tab.name;

                // If this is Flipbooks and a specific book is selected, render nested breadcrumb pill: Flipbooks > FB-BK-001
                if (tab.name === 'Flipbooks' && isSelected && selectedFlipbookId) {
                  return (
                    <div
                      key={tab.name}
                      className="inline-flex items-center gap-[0.35vw] px-[0.7vw] py-[0.2vw] text-[0.8vw] font-semibold text-gray-500"
                    >
                      <button
                        onClick={() => setSelectedFlipbookId(null)}
                        className="hover:text-gray-800 transition cursor-pointer"
                      >
                        Flipbooks
                      </button>
                      <ChevronRight size="0.75vw" className="text-[#ec5137] stroke-[2.5]" />
                      <span className="bg-[#ec5137] text-white px-[0.6vw] py-[0.2vw] rounded-full text-[0.7vw] font-semibold">
                        {selectedFlipbookId}
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={tab.name}
                    onClick={() => {
                      setActiveTab(tab.name);
                      if (tab.name !== 'Flipbooks') {
                        setSelectedFlipbookId(null);
                      }
                    }}
                    className={`px-[1.2vw] py-[0.4vw] rounded-full text-[0.8vw] font-semibold transition duration-150 cursor-pointer ${isSelected
                      ? 'bg-[#ec5137] text-white font-semibold'
                      : 'text-[#8c95a0] hover:text-[#374151]'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="mt-[0.6vw]">
            {activeTab === 'Overview' && (
              <OverviewTab user={userData} profile={profileData} flipbooks={flipbooks} />
            )}
            {activeTab === 'ProfileDetails' && (
              <ProfileDetailsTab user={userData} profile={profileData} />
            )}
            {activeTab === 'Flipbooks' && (
              <FlipbooksTab
                flipbooks={flipbooks}
                user={userData}
                selectedBookId={selectedFlipbookId}
                setSelectedBookId={setSelectedFlipbookId}
              />
            )}
            {activeTab === '3DRequests' && (
              <ThreeDRequestsTab user={userData} />
            )}
            {activeTab === 'Subscriptions' && (
              <SubscriptionsTab user={userData} />
            )}
            {activeTab === 'Payments' && (
              <PaymentsTab user={userData} />
            )}
            {activeTab === 'Activity' && (
              <ActivityTab user={userData} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
