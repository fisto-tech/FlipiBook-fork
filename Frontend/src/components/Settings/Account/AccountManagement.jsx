import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { useConfirm } from '../../../context/ConfirmationContext';

const DELETION_REASONS = [
  { value: '', label: 'Select a reason (optional)' },
  { value: 'NO_LONGER_NEEDED', label: 'I no longer need this account' },
  { value: 'FOUND_ALTERNATIVE', label: 'Found another platform' },
  { value: 'PRIVACY_CONCERNS', label: 'Privacy or data concerns' },
  { value: 'PRICING', label: 'Pricing / subscription cost' },
  { value: 'OTHER', label: 'Other' }
];

const AccountManagement = ({ userEmail, hasPassword, onBack, showToast }) => {
  const confirm = useConfirm();
  const [mode, setMode] = useState('deactivate'); // 'deactivate' | 'delete'
  const [reasonCategory, setReasonCategory] = useState('');
  const [feedback, setFeedback] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const expectedKeyword = mode === 'deactivate' ? 'DEACTIVATE' : 'DELETE';

  const canSubmit = hasPassword
    ? password.trim().length > 0
    : confirmText.trim().toUpperCase() === expectedKeyword;

  const clearClientAndRedirect = (msg) => {
    localStorage.removeItem('user');
    localStorage.removeItem('last_active_folder');
    localStorage.removeItem('hide_upgrade_card');
    sessionStorage.removeItem('hide_upgrade_card');
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (_) {}
    }
    showToast?.(msg, 'success');
    window.location.href = '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const confirmed = await confirm({
      title: mode === 'deactivate' ? 'Deactivate Account?' : 'Permanently Delete Account?',
      message:
        mode === 'deactivate'
          ? `Your account (${userEmail}) will be temporarily deactivated. Your flipbooks and data will remain safe, and you can reactivate anytime by signing in with an email OTP.`
          : `Are you sure you want to permanently delete ${userEmail}? All live flipbooks and data will be removed from the platform, and signing in again will show account not found.`,
      confirmText: mode === 'deactivate' ? 'Yes, Deactivate' : 'Yes, Delete Permanently',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        emailId: userEmail,
        password: hasPassword ? password : '',
        confirmText: !hasPassword ? confirmText.trim() : '',
        reasonCategory,
        feedback: feedback.trim()
      };

      const res =
        mode === 'deactivate'
          ? await axios.post(`${backendUrl}/api/user/account/deactivate`, payload, { withCredentials: true })
          : await axios.delete(`${backendUrl}/api/user/account`, { withCredentials: true, data: payload });

      if (res.data?.success) {
        clearClientAndRedirect(
          mode === 'deactivate'
            ? 'Account deactivated. Sign in anytime with OTP to reactivate.'
            : 'Your account has been permanently deleted.'
        );
      } else {
        setErrorMessage(res.data?.message || 'Action failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Verification failed. Please check your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans">
      {/* Top Navigation: Back to Account Page */}
      <div className="mb-[0.6vw] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[0.7vw]">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-[0.4vw] text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 px-[0.9vw] py-[0.45vw] rounded-[0.5vw] shadow-xs text-[0.78vw] font-medium transition-colors cursor-pointer group active:scale-[0.98]"
          >
            <Icon
              icon="lucide:arrow-left"
              className="w-[0.9vw] h-[0.9vw] text-gray-500 group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Account</span>
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-[0.76vw] text-gray-400 font-normal">
            Account Management &gt; Deactivate or Delete Account
          </span>
        </div>
      </div>

      {/* Main Container Card - Centered */}
      <div className="w-full flex-1 flex items-center justify-center py-[0.3vw]">
        <div className="w-full max-w-[40vw] bg-white border border-gray-200/80 rounded-[0.8vw] p-[1.35vw] shadow-xs">
          {/* Header */}
          <div className="pb-[0.8vw] border-b border-gray-100">
            <h1 className="text-[1.15vw] font-bold text-gray-900 leading-tight">
              Account Management
            </h1>
            <p className="text-[0.73vw] text-gray-400 mt-[0.2vw] font-normal leading-snug">
              Choose whether to temporarily deactivate your account (recoverable via OTP) or permanently delete it.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mt-[0.8vw] p-[0.65vw] bg-[#FEF2F2] border border-[#FCA5A5] rounded-[0.55vw] flex items-center gap-[0.5vw] text-[#DC2626] text-[0.73vw]">
              <Icon icon="solar:danger-circle-bold" className="w-[0.95vw] h-[0.95vw] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-[0.9vw] flex flex-col gap-[0.75vw]">
            {/* Target Email Address */}
            <div className="bg-[#f8f9fa] border border-[#f0f2f5] rounded-[0.65vw] px-[0.9vw] py-[0.65vw] flex flex-col gap-[0.25vw]">
              <span className="text-[0.65vw] text-gray-400 font-semibold uppercase tracking-wider">
                Target Email Address
              </span>
              <div className="flex items-center gap-[0.55vw]">
                <Icon icon="solar:letter-bold" className="w-[1vw] h-[1vw] text-gray-500" />
                <span className="text-[0.82vw] font-semibold text-gray-800">{userEmail}</span>
                <span className="ml-auto inline-flex items-center gap-[0.25vw] bg-[#DCFCE7] text-[#16A34A] text-[0.65vw] font-medium px-[0.6vw] py-[0.15vw] rounded-full">
                  {hasPassword ? 'Verified Account' : 'Verified Google Account'}
                </span>
              </div>
            </div>

            {/* Action Mode Selection */}
            <div className="grid grid-cols-2 gap-[0.65vw]">
              <button
                type="button"
                onClick={() => {
                  setMode('deactivate');
                  setConfirmText('');
                  setErrorMessage('');
                }}
                className={`text-left p-[0.75vw] rounded-[0.65vw] border transition-all cursor-pointer flex flex-col gap-[0.25vw] ${
                  mode === 'deactivate'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/15'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[0.4vw]">
                    <Icon icon="lucide:pause-circle" className="w-[0.95vw] h-[0.95vw] text-amber-600" />
                    <span className="text-[0.78vw] font-bold text-gray-900">Deactivate Account</span>
                  </div>
                  <div className={`w-[0.85vw] h-[0.85vw] rounded-full border-2 flex items-center justify-center ${mode === 'deactivate' ? 'border-amber-600' : 'border-gray-300'}`}>
                    {mode === 'deactivate' && <div className="w-[0.4vw] h-[0.4vw] rounded-full bg-amber-600" />}
                  </div>
                </div>
                <p className="text-[0.68vw] text-gray-500 leading-snug">
                  Temporary. Your flipbooks & data stay safe. Re-enter anytime by verifying an email OTP on login.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('delete');
                  setConfirmText('');
                  setErrorMessage('');
                }}
                className={`text-left p-[0.75vw] rounded-[0.65vw] border transition-all cursor-pointer flex flex-col gap-[0.25vw] ${
                  mode === 'delete'
                    ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/15'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[0.4vw]">
                    <Icon icon="lucide:trash-2" className="w-[0.95vw] h-[0.95vw] text-red-600" />
                    <span className="text-[0.78vw] font-bold text-gray-900">Delete Account</span>
                  </div>
                  <div className={`w-[0.85vw] h-[0.85vw] rounded-full border-2 flex items-center justify-center ${mode === 'delete' ? 'border-red-600' : 'border-gray-300'}`}>
                    {mode === 'delete' && <div className="w-[0.4vw] h-[0.4vw] rounded-full bg-red-600" />}
                  </div>
                </div>
                <p className="text-[0.68vw] text-gray-500 leading-snug">
                  Permanent. Removes all live flipbooks & data (archived safely in backup). Login will show user not found.
                </p>
              </button>
            </div>

            {/* Reason & Feedback */}
            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.73vw] font-semibold text-gray-700">Why are you leaving?</label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full h-[2.2vw] px-[0.65vw] rounded-[0.45vw] border border-gray-200 text-[0.75vw] text-gray-800 bg-white outline-none focus:border-gray-400"
              >
                {DELETION_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.73vw] font-semibold text-gray-700">Feedback (optional)</label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share any feedback to help us improve..."
                className="w-full px-[0.65vw] py-[0.45vw] rounded-[0.45vw] border border-gray-200 text-[0.74vw] text-gray-800 outline-none focus:border-gray-400 resize-none"
              />
            </div>

            {/* Verification */}
            {hasPassword ? (
              <div className="flex flex-col gap-[0.25vw]">
                <label className="text-[0.73vw] font-semibold text-gray-700">
                  Enter your password to confirm <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter current password"
                    className="w-full h-[2.2vw] pl-[0.75vw] pr-[2.4vw] rounded-[0.45vw] border border-gray-200 text-[0.78vw] text-gray-800 outline-none focus:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-[0.65vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <Icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} className="w-[0.9vw] h-[0.9vw]" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-[0.25vw]">
                <label className="text-[0.73vw] font-semibold text-gray-700">
                  Type <span className="font-mono text-red-600">{expectedKeyword}</span> to confirm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={expectedKeyword}
                  className="w-full h-[2.2vw] px-[0.75vw] rounded-[0.45vw] border border-gray-200 text-[0.78vw] font-mono text-gray-800 outline-none focus:border-gray-400"
                />
              </div>
            )}

            {/* Action Buttons matching AddPassword */}
            <div className="flex items-center gap-[0.7vw] pt-[0.2vw]">
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className={`flex items-center gap-[0.45vw] px-[1.1vw] py-[0.5vw] rounded-[0.5vw] text-[0.78vw] font-semibold text-white transition-all shadow-xs ${
                  !canSubmit || isSubmitting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : mode === 'deactivate'
                      ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer active:scale-[0.98]'
                      : 'bg-[#E8503A] hover:bg-[#d6422c] cursor-pointer active:scale-[0.98]'
                }`}
              >
                <Icon
                  icon={isSubmitting ? 'lucide:loader-2' : (mode === 'deactivate' ? 'lucide:pause-circle' : 'lucide:trash-2')}
                  className={`w-[0.9vw] h-[0.9vw] ${isSubmitting ? 'animate-spin' : ''}`}
                />
                <span>
                  {isSubmitting
                    ? (mode === 'deactivate' ? 'Deactivating...' : 'Deleting...')
                    : (mode === 'deactivate' ? 'Deactivate Account' : 'Permanently Delete Account')}
                </span>
              </button>

              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="px-[1vw] py-[0.5vw] rounded-[0.5vw] bg-white hover:bg-gray-50 border border-gray-200 text-[0.78vw] font-medium text-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
