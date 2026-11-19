import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PdfProcessingLoader from '../components/PdfProcessingLoader';

const DocumentUploadContext = createContext(null);

export function DocumentUploadProvider({ children }) {
    const [processingProgress, setProcessingProgress] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [completedBook, setCompletedBook] = useState(null);
    const abortControllerRef = useRef(null);
    const onCancelCustomRef = useRef(null);
    const isMinimizedRef = useRef(isMinimized);
    isMinimizedRef.current = isMinimized;

    const navigate = useNavigate();

    // Register active abort controller or custom cancel handler
    const registerUploadSession = useCallback(({ abortController, onCancel }) => {
        abortControllerRef.current = abortController || null;
        onCancelCustomRef.current = onCancel || null;
        setCompletedBook(null);
        setIsMinimized(false);
    }, []);

    // Handle cancel upload
    const cancelUpload = useCallback(() => {
        if (abortControllerRef.current) {
            try {
                abortControllerRef.current.abort();
            } catch (_) {}
            abortControllerRef.current = null;
        }
        if (onCancelCustomRef.current) {
            try {
                onCancelCustomRef.current();
            } catch (_) {}
            onCancelCustomRef.current = null;
        }
        setProcessingProgress(null);
        setCompletedBook(null);
        setIsMinimized(false);
    }, []);

    // Handle completion of upload
    const notifyUploadComplete = useCallback(({ targetFolderVId, v_id, state }) => {
        setCompletedBook({ targetFolderVId, v_id, state });
        // If the loader was NOT minimized (user was watching fullscreen),
        // we automatically transition directly to the editor after brief complete animation!
        if (!isMinimizedRef.current) {
            setTimeout(() => {
                setProcessingProgress(null);
                setCompletedBook(null);
                navigate(`/editor/customized_editor/${encodeURIComponent(targetFolderVId)}/${v_id}`, { state });
            }, 750);
        }
    }, [navigate]);

    // Open editor from minimized completed dock
    const handleOpenCompletedEditor = useCallback(() => {
        if (!completedBook) return;
        const { targetFolderVId, v_id, state } = completedBook;
        setProcessingProgress(null);
        setCompletedBook(null);
        setIsMinimized(false);
        navigate(`/editor/customized_editor/${encodeURIComponent(targetFolderVId)}/${v_id}`, { state });
    }, [completedBook, navigate]);

    // Dismiss dock
    const handleDismiss = useCallback(() => {
        cancelUpload();
    }, [cancelUpload]);

    const value = {
        processingProgress,
        setProcessingProgress,
        isMinimized,
        setIsMinimized,
        registerUploadSession,
        cancelUpload,
        notifyUploadComplete,
        completedBook
    };

    return (
        <DocumentUploadContext.Provider value={value}>
            {children}
            {/* Global Persistent Loader & Floating Minimized Dock (never unmounts on page/editor navigation) */}
            <PdfProcessingLoader
                progress={processingProgress}
                onCancel={handleDismiss}
                isMinimized={isMinimized}
                setIsMinimized={setIsMinimized}
                onOpenEditor={completedBook ? handleOpenCompletedEditor : null}
            />
        </DocumentUploadContext.Provider>
    );
}

export function useDocumentUpload() {
    const context = useContext(DocumentUploadContext);
    if (!context) {
        throw new Error('useDocumentUpload must be used within a DocumentUploadProvider');
    }
    return context;
}
