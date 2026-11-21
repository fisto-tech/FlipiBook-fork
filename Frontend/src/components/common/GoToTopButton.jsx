import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Floating "Go to top" button (bottom-right).
 * Pages scroll inside MainLayout's <main>, so pass that element's ref as `scrollerRef`
 * (falls back to the window when no scroller is given).
 */
export default function GoToTopButton({ scrollerRef, threshold = 400, resetKey }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef?.current || null;
    const target = scroller || window;
    const onScroll = () => {
      const top = scroller ? scroller.scrollTop : window.scrollY;
      setVisible(top > threshold);
    };
    onScroll();
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [scrollerRef, threshold, resetKey]);

  const goTop = () => {
    const scroller = scrollerRef?.current;
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={goTop}
          aria-label="Go to top"
          title="Go to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[999] w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#EC5137] hover:bg-[#d6442c] text-white shadow-lg hover:shadow-xl flex items-center justify-center cursor-pointer active:scale-95 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
