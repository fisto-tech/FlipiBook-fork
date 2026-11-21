import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ComingSoon from '../../pages/ComingSoon';
import { COMING_SOON_FORCE_KEY } from '../../config/launchLock';

/**
 * Coming Soon popup for the Home page. Render once inside Home:
 *   <ComingSoonModal />
 * Opens on every Home load and whenever the launch lock requests it ('show-coming-soon').
 */
// "Coming Soon" popup shown every time the home page opens

export default function ComingSoonModal({ openOnMount = true }) {
  // Opens on mount when asked (Home load / refresh); otherwise only when requested by the lock
  const [open, setOpen] = useState(openOnMount);

  const close = () => {
    setOpen(false);
    try { sessionStorage.removeItem(COMING_SOON_FORCE_KEY); } catch { /* storage unavailable */ }
  };

  // Re-open whenever something asks for it (nav click / blocked route while Home is mounted)
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('show-coming-soon', show);
    return () => window.removeEventListener('show-coming-soon', show);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="coming-soon-modal"
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Coming soon"
        >
          <motion.div
            className="relative w-full max-w-[960px] max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              title="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
            <ComingSoon embedded />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
