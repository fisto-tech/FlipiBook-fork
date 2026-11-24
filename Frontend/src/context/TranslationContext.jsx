import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import TranslateBookModal from '../components/Translation/TranslateBookModal';
import TranslationTaskWidget from '../components/Translation/TranslationTaskWidget';
import { useModernToast } from '../components/ModernToast';

const TranslationContext = createContext(null);

export function TranslationProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const pollIntervalRef = useRef(null);
  const toast = useModernToast();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

  const openTranslateModal = useCallback((book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  }, []);

  const closeTranslateModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBook(null);
  }, []);

  const dismissTask = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setActiveTask(null);
    setIsMinimized(false);
  }, []);

  const startTranslation = useCallback(async ({
    v_id,
    src_lang,
    tgt_lang,
    tgt_name,
    newBookName
  }) => {
    if (!v_id) return;

    try {
      const response = await fetch(`${backendUrl}/api/myflipibook/translate-clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          v_id,
          src_lang,
          tgt_lang,
          tgt_name,
          newBookName
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        toast.error(data.message || data.error || 'Failed to start translation');
        return;
      }

      const { jobId, newBookId } = data;
      const initialTask = {
        jobId,
        newBookId,
        sourceBookName: selectedBook?.flipbookName || selectedBook?.title,
        newBookName,
        tgtName: tgt_name,
        status: 'in_progress',
        current: 0,
        total: selectedBook?.pages?.length || 0,
        percent: 0,
        error: null
      };

      setActiveTask(initialTask);
      setIsMinimized(false);
      toast.success(`Translation started into ${tgt_name}`);

      // Start polling status
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`${backendUrl}/api/myflipibook/translation-status/${jobId}`, {
            credentials: 'include'
          });
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            if (pollData.success && pollData.job) {
              const updatedJob = pollData.job;
              setActiveTask(prev => ({
                ...(prev || {}),
                ...updatedJob
              }));

              if (updatedJob.status === 'completed') {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
                toast.success(`✓ "${newBookName}" is ready!`);
              } else if (updatedJob.status === 'failed') {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
                toast.error(updatedJob.error || 'Translation failed');
              }
            }
          }
        } catch (pollErr) {
          console.warn('[TranslationContext] Polling warning:', pollErr);
        }
      }, 2000);
    } catch (err) {
      console.error('[TranslationContext] Error starting translation:', err);
      toast.error('Network error starting translation');
    }
  }, [backendUrl, selectedBook, toast]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const value = {
    openTranslateModal,
    closeTranslateModal,
    startTranslation,
    activeTask,
    isMinimized,
    setIsMinimized,
    dismissTask
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}

      {/* Global Translate Modal */}
      <TranslateBookModal
        isOpen={isModalOpen}
        onClose={closeTranslateModal}
        book={selectedBook}
        onStartTranslation={startTranslation}
      />

      {/* Global Minimized/Floating Progress Dock */}
      <TranslationTaskWidget
        task={activeTask}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        onDismiss={dismissTask}
      />
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
