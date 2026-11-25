import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { Icon } from '@iconify/react';
import PixabayImagesPanel, { FILTER_OPTIONS } from './PixabayImagesPanel';

export const ImagesModal = ({
  isOpen = false,
  onClose,
  isRulerEnabled = true,
  activePageIndex = 0,
  dragConstraintsRef,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orientation, setOrientation] = useState('all');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [rulerActive, setRulerActive] = useState(isRulerEnabled);

  const modalRef = useRef(null);
  const dragControls = useDragControls();

  useEffect(() => {
    setRulerActive(isRulerEnabled);
  }, [isRulerEnabled]);

  // Sync with global ruler toggle
  useEffect(() => {
    const handleToggleRuler = (e) => {
      if (e.detail !== undefined) {
        const val = typeof e.detail === 'object' && e.detail !== null
          ? (e.detail.isRulerEnabled !== undefined ? e.detail.isRulerEnabled : e.detail)
          : e.detail;
        setRulerActive(Boolean(val));
      } else {
        setRulerActive(prev => !prev);
      }
    };
    window.addEventListener('editor_toggleRuler', handleToggleRuler);
    return () => window.removeEventListener('editor_toggleRuler', handleToggleRuler);
  }, []);

  // Listen for image dragging to fade modal slightly
  useEffect(() => {
    const handleDragStart = () => setIsDraggingImage(true);
    const handleDragEnd = () => setIsDraggingImage(false);

    window.addEventListener('image-drag-start', handleDragStart);
    window.addEventListener('image-drag-end', handleDragEnd);
    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('drop', handleDragEnd);
    window.addEventListener('upload-image-to-editor', handleDragEnd);

    return () => {
      window.removeEventListener('image-drag-start', handleDragStart);
      window.removeEventListener('image-drag-end', handleDragEnd);
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('drop', handleDragEnd);
      window.removeEventListener('upload-image-to-editor', handleDragEnd);
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (e) => {
      if (modalRef.current && modalRef.current.contains(e.target)) {
        return;
      }
      const imagesBtn = document.querySelector('button[title="Images"], [data-tool="images"]');
      if (imagesBtn && imagesBtn.contains(e.target)) {
        return;
      }
      if (isDraggingImage || window.__isDraggingImageFromModal) {
        return;
      }
      if (typeof onClose === 'function') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true);
    };
  }, [isOpen, onClose, isDraggingImage]);

  const handleHeaderPointerDown = (e) => {
    if (e.target.closest('button, input, textarea, select, a, [role="button"]')) {
      return;
    }
    dragControls.start(e);
  };

  if (!isOpen) return null;

  const defaultPosition = {
    left: rulerActive ? '6.2vw' : '5vw',
    top: rulerActive ? '2.2vw' : '1vw',
    right: 'auto',
  };

  const defaultClasses = 'absolute z-50 bg-white rounded-[0.75vw] border border-gray-300 shadow-[0_12px_45px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden select-none transition-[left,top] duration-300 ease-in-out';

  return (
    <AnimatePresence>
      <motion.div
        key="images-modal"
        ref={modalRef}
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={dragConstraintsRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: isDraggingImage ? 0 : 1,
          scale: isDraggingImage ? 0.96 : 1,
        }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{
          duration: isDraggingImage ? 0.28 : 0.18,
          ease: 'easeOut',
        }}
        data-modal="true"
        className={defaultClasses}
        style={{
          width: '24vw',
          minWidth: '340px',
          height: '68vh',
          maxHeight: '640px',
          ...defaultPosition,
          pointerEvents: isDraggingImage ? 'none' : 'auto',
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Sleek Gray Drag Bar */}
        <div
          onPointerDown={handleHeaderPointerDown}
          className="w-full h-[3vh] min-h-[22px] bg-gradient-to-r from-[#E5E7EB] via-[#F3F4F6] to-[#E5E7EB] border-b border-gray-200/80 rounded-t-[0.75vw] flex items-center justify-center cursor-grab active:cursor-grabbing select-none shadow-xs transition-colors hover:brightness-95 flex-shrink-0"
          style={{ touchAction: 'none' }}
          title="Drag to move panel"
        >
          <div className="w-[3.5vw] min-w-[36px] h-[0.45vh] min-h-[3px] rounded-full bg-gray-400/80 shadow-xs pointer-events-none" />
        </div>

        {/* Top Header Area */}
        <div
          onPointerDown={handleHeaderPointerDown}
          className="px-[1vw] pt-[0.8vh] pb-[0.8vh] cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: 'none' }}
        >
          {/* Title & Close Row */}
          <div className="flex items-start justify-between">
            <div className="pointer-events-none">
              <div className="flex items-center gap-[0.45vw]">
                <Icon icon="lucide:image" className="w-[1.15vw] h-[1.15vw] text-gray-900" />
                <h2 className="text-[1.1vw] font-bold text-gray-900 leading-tight">Images</h2>
              </div>
              <p className="text-[0.68vw] text-gray-400 mt-[0.2vh]">Free stock photos from Pixabay</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-[1.6vw] h-[1.6vw] flex items-center justify-center rounded-[0.4vw] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X size="1vw" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-[0.9vh] pointer-events-auto">
            <div className="relative flex items-center">
              <Search size="0.9vw" className="absolute left-[0.75vw] text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search free images (Pixabay)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full pl-[2.2vw] pr-[2vw] py-[0.7vh] text-[0.78vw] bg-[#F4F5F6] rounded-[0.45vw] border border-transparent hover:border-gray-200 focus:border-gray-400 focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-400 cursor-text"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-[0.6vw] text-gray-400 hover:text-gray-600 text-[0.7vw] cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Orientation Filter Tabs (Permanently pinned in header above scroll) */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-[0.25vw] mt-[0.8vh] p-[0.15vw] bg-gray-100 rounded-[0.45vw] pointer-events-auto"
          >
            {FILTER_OPTIONS.map((opt) => {
              const isActive = orientation === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOrientation(opt.id)}
                  className={`flex-1 flex items-center justify-center gap-[0.2vw] py-[0.4vh] px-[0.3vw] rounded-[0.35vw] text-[0.66vw] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon icon={opt.icon} className="w-[0.72vw] h-[0.72vw]" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div
          data-scrollable="true"
          onWheel={(e) => e.stopPropagation()}
          className="flex-1 min-h-0 overflow-y-auto px-[0.9vw] py-[0.6vh] border-t border-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden hover:[scrollbar-width:thin] hover:[&::-webkit-scrollbar]:block custom-scrollbar transition-all duration-200"
        >
          <PixabayImagesPanel query={searchQuery} orientation={orientation} pageIndex={activePageIndex} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImagesModal;
