import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import HTMLFlipBook from 'react-pageflip';
import { 
  ChevronLeft, ChevronRight, Check, X, FileText, 
  ChevronDown, BookOpen, Layers
} from 'lucide-react';

// Flipbook Page Component with forwardRef for HTMLFlipBook
const FlipBookPage = React.forwardRef(({ src, pageNum }, ref) => {
  return (
    <div ref={ref} className="w-full h-full bg-white overflow-hidden flex items-center justify-center relative shadow-sm select-none">
      {src ? (
        <img
          src={src}
          alt={`Page ${pageNum || ''}`}
          className="w-full h-full object-contain pointer-events-none"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-[#fcfcfc] flex items-center justify-center text-gray-300 text-[0.8vw]">
          Page {pageNum}
        </div>
      )}
      {/* Subtle paper spine gradient shadow */}
      <div className="absolute inset-y-0 right-0 w-[1.2vw] pointer-events-none bg-gradient-to-l from-black/[0.05] to-transparent" />
      <div className="absolute inset-y-0 left-0 w-[1.2vw] pointer-events-none bg-gradient-to-r from-black/[0.05] to-transparent" />
    </div>
  );
});
FlipBookPage.displayName = 'FlipBookPage';

const PREVIEW_PAPER_SIZES = [
  { id: 'corporate', label: 'A4 (210 × 297 mm)', width: 210, height: 297 },
  { id: 'large_catalogue', label: 'A3 (297 × 420 mm)', width: 297, height: 420 },
  { id: 'mini', label: 'A5 (148 × 210 mm)', width: 148, height: 210 },
  { id: 'letter', label: 'Letter (216 × 279 mm)', width: 216, height: 279 },
  { id: 'legal', label: 'Legal (216 × 356 mm)', width: 216, height: 356 },
  { id: 'dl', label: 'DL Flyer (99 × 210 mm)', width: 99, height: 210 },
  { id: 'square', label: 'Square (210 × 210 mm)', width: 210, height: 210 }
];

export default function TemplateModal({
  isOpen,
  onClose,
  template,
  onUseTemplate,
  existingPageCount = 12,
  isApplying = false
}) {
  const flipBookRef = useRef(null);
  const sizeDropdownRef = useRef(null);
  const orientDropdownRef = useRef(null);
  const placementDropdownRef = useRef(null);
  const targetPageDropdownRef = useRef(null);

  // Flipbook state
  const [currentFlipPage, setCurrentFlipPage] = useState(0);
  const [bookTranslateX, setBookTranslateX] = useState('-25%');

  // Selected pages for flipbook
  const [selectedPages, setSelectedPages] = useState(new Set());

  // Dropdown states
  const [selectedPaperSize, setSelectedPaperSize] = useState('A4 (210 × 297 mm)');
  const [selectedOrientation, setSelectedOrientation] = useState('Portrait');
  const [placement, setPlacement] = useState('after');
  const [targetPageIndex, setTargetPageIndex] = useState(3); // 0-indexed (Page 4)

  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isOrientOpen, setIsOrientOpen] = useState(false);
  const [isPlacementOpen, setIsPlacementOpen] = useState(false);
  const [isTargetPageOpen, setIsTargetPageOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target)) setIsSizeOpen(false);
      if (orientDropdownRef.current && !orientDropdownRef.current.contains(e.target)) setIsOrientOpen(false);
      if (placementDropdownRef.current && !placementDropdownRef.current.contains(e.target)) setIsPlacementOpen(false);
      if (targetPageDropdownRef.current && !targetPageDropdownRef.current.contains(e.target)) setIsTargetPageOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute pages list from template
  const templatePages = useMemo(() => {
    if (!template) return [];
    if (Array.isArray(template.pageUrls) && template.pageUrls.length > 0) {
      return template.pageUrls;
    }
    if (Array.isArray(template.pages) && typeof template.pages[0] === 'string') {
      return template.pages;
    }
    if (template.preview) {
      return [template.preview];
    }
    return [];
  }, [template]);

  // Flat list of pages for HTMLFlipBook
  const bookPages = useMemo(() => {
    let urls = templatePages.length > 0 ? [...templatePages] : [template?.preview].filter(Boolean);
    if (urls.length > 1 && urls.length % 2 !== 0) {
      urls.push(null);
    }
    return urls;
  }, [templatePages, template]);

  // Initialize selected pages on template load
  useEffect(() => {
    if (templatePages.length > 0) {
      setSelectedPages(new Set(Array.from({ length: templatePages.length }, (_, i) => i)));
    } else {
      setSelectedPages(new Set([0]));
    }
    setCurrentFlipPage(0);
    setBookTranslateX('-25%');
    if (flipBookRef.current?.pageFlip()) {
      try {
        flipBookRef.current.pageFlip().turnToPage(0);
      } catch {}
    }
  }, [template, templatePages.length]);

  // Compute translation to center single page cover vs. double page spread
  const getTranslationForPage = useCallback((pageIndex) => {
    if (pageIndex === 0) return '-25%';
    if (bookPages.length > 1 && pageIndex >= bookPages.length - 1) return '25%';
    return '0%';
  }, [bookPages.length]);

  const handleFlipChange = useCallback((e) => {
    const page = e.data;
    setCurrentFlipPage(page);
    setBookTranslateX(getTranslationForPage(page));
  }, [getTranslationForPage]);

  const handleFlipStateChange = useCallback((e) => {
    const state = e.data;
    const pageFlip = flipBookRef.current?.pageFlip();
    if (!pageFlip) return;

    if (state === 'flipping' || state === 'user_fold') {
      const currPage = pageFlip.getCurrentPageIndex();
      if (currPage === 0) {
        setBookTranslateX('0%');
      } else if (currPage <= 2) {
        const calc = pageFlip.getFlipController()?.getCalculation();
        if (calc?.getDirection?.() === 1) {
          setBookTranslateX('-25%');
        }
      } else if (bookPages.length > 1 && currPage >= bookPages.length - 1) {
        setBookTranslateX('0%');
      } else if (bookPages.length > 1 && currPage >= bookPages.length - 3) {
        const calc = pageFlip.getFlipController()?.getCalculation();
        if (calc?.getDirection?.() === 0) {
          setBookTranslateX('25%');
        }
      }
    } else if (state === 'read') {
      const currPage = pageFlip.getCurrentPageIndex();
      setBookTranslateX(getTranslationForPage(currPage));
    }
  }, [bookPages.length, getTranslationForPage]);

  const togglePageSelection = (idx, e) => {
    if (e) e.stopPropagation();
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        if (next.size > 1) next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleTurnToPage = (idx) => {
    if (flipBookRef.current?.pageFlip()) {
      try {
        setBookTranslateX(getTranslationForPage(idx));
        flipBookRef.current.pageFlip().turnToPage(idx);
        setCurrentFlipPage(idx);
      } catch {}
    }
  };

  const handleConfirm = () => {
    if (onUseTemplate) {
      onUseTemplate({
        template,
        selectedPageIndices: Array.from(selectedPages).sort((a, b) => a - b),
        paperSize: selectedPaperSize,
        orientation: selectedOrientation.toLowerCase(),
        placement,
        targetPageIndex
      });
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div
      className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-[2vw] select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[1.2vw] shadow-2xl w-full max-w-[80vw] h-[86vh] max-h-[86vh] flex overflow-hidden relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT COLUMN: Title, Description, 3D FlipBook, Spread Page Counter */}
        <div className="flex-1 flex flex-col justify-between p-[2vw] border-r border-gray-100/90 overflow-hidden bg-white">
          {/* Header Title + Category Pill + Description */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-[0.75vw]">
              <h1 className="text-[1.8vw] font-bold text-gray-900 tracking-tight leading-tight">
                {template.title}
              </h1>
              <span className="px-[0.6vw] py-[0.18vw] bg-[#FFF5F3] text-[#ea543a] text-[0.75vw] font-semibold rounded-[0.35vw] leading-none">
                {template.badge || template.category}
              </span>
            </div>
            <p className="text-[0.8vw] text-gray-400 font-normal mt-[0.35vw] leading-relaxed max-w-[48vw]">
              {template.desc || 'A clean and professional template perfect for company profiles, business presentations and corporate brochures.'}
            </p>
          </div>

          {/* Center 3D TurnJS / HTMLFlipBook Area */}
          <div className="relative flex-1 flex items-center justify-center min-h-[35vh] max-h-[52vh] my-[0.5vw]">
            {/* Left Nav Arrow */}
            <button
              type="button"
              onClick={() => {
                const pageFlip = flipBookRef.current?.pageFlip();
                const curr = pageFlip?.getCurrentPageIndex() ?? currentFlipPage;
                if (curr <= 2) {
                  setBookTranslateX('-25%');
                } else if (bookPages.length > 1 && curr >= bookPages.length - 1) {
                  setBookTranslateX('0%');
                }
                pageFlip?.flipPrev();
              }}
              disabled={currentFlipPage <= 0}
              className="absolute left-[0.2vw] top-1/2 -translate-y-1/2 z-30 w-[2vw] h-[2vw] rounded-full bg-white/95 hover:bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-[1.1vw] h-[1.1vw]" />
            </button>

            {/* Right Nav Arrow */}
            <button
              type="button"
              onClick={() => {
                const pageFlip = flipBookRef.current?.pageFlip();
                const curr = pageFlip?.getCurrentPageIndex() ?? currentFlipPage;
                if (curr === 0) {
                  setBookTranslateX('0%');
                } else if (bookPages.length > 1 && curr >= bookPages.length - 3) {
                  setBookTranslateX('25%');
                }
                pageFlip?.flipNext();
              }}
              disabled={currentFlipPage >= bookPages.length - 1}
              className="absolute right-[0.2vw] top-1/2 -translate-y-1/2 z-30 w-[2vw] h-[2vw] rounded-full bg-white/95 hover:bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-[1.1vw] h-[1.1vw]" />
            </button>

            {/* 3D FlipBook Animated Container */}
            <div 
              className="relative h-full aspect-[2/1.36] max-h-[46vh] flex items-center justify-center drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
              style={{
                transform: `translateX(${bookTranslateX})`,
              }}
            >
              <HTMLFlipBook
                key={`${template.id}-${bookPages.length}`}
                ref={flipBookRef}
                width={420}
                height={580}
                size="stretch"
                minWidth={160}
                maxWidth={620}
                minHeight={180}
                maxHeight={520}
                maxShadowOpacity={0.45}
                showCover={true}
                mobileScrollSupport={true}
                useMouseEvents={true}
                clickEventForward={true}
                flippingTime={600}
                usePortrait={false}
                onChangeState={handleFlipStateChange}
                onFlip={handleFlipChange}
                style={{ background: 'transparent' }}
                className="cursor-grab active:cursor-grabbing"
              >
                {bookPages.map((url, idx) => (
                  <FlipBookPage key={idx} src={url} pageNum={idx + 1} />
                ))}
              </HTMLFlipBook>
            </div>
          </div>

          {/* Bottom Spread Page Indicator (e.g. 4 / 12) */}
          <div className="text-[0.85vw] font-semibold text-gray-600 text-center flex-shrink-0">
            {currentFlipPage === 0
              ? `1 / ${templatePages.length || template.pages}`
              : currentFlipPage >= (templatePages.length || template.pages) - 1
                ? `${templatePages.length || template.pages} / ${templatePages.length || template.pages}`
                : `${currentFlipPage + 1}-${Math.min(currentFlipPage + 2, templatePages.length || template.pages)} / ${templatePages.length || template.pages}`
            }
          </div>
        </div>

        {/* RIGHT COLUMN: Pages Grid Thumbnails + Dropdowns Form + USE THIS TEMPLATE Button */}
        <div className="w-[28vw] flex flex-col justify-between p-[1.8vw] bg-white overflow-y-auto custom-scrollbar">
          {/* Top Header: "Pages" title & Close button */}
          <div className="flex items-center justify-between pb-[0.8vw] flex-shrink-0">
            <h2 className="text-[1.2vw] font-bold text-gray-900 tracking-tight">Pages</h2>
            <button
              onClick={onClose}
              className="p-[0.35vw] rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-[1.2vw] h-[1.2vw]" />
            </button>
          </div>

          {/* 3-Column Pages Thumbnail Grid matching the screenshot */}
          <div className="flex-1 overflow-y-auto custom-scrollbar my-[0.5vw] pr-[0.3vw] max-h-[46vh]">
            <div className="grid grid-cols-3 gap-[0.6vw]">
              {templatePages.map((url, idx) => {
                const isSelected = selectedPages.has(idx);
                const isCurrentPage = currentFlipPage === idx || (currentFlipPage > 0 && (currentFlipPage === idx || currentFlipPage + 1 === idx));

                return (
                  <div
                    key={idx}
                    onClick={() => handleTurnToPage(idx)}
                    className={`relative aspect-[1/1.3] bg-white rounded-[0.45vw] border overflow-hidden cursor-pointer transition-all duration-150 flex flex-col items-center justify-between p-[0.3vw] shadow-2xs group ${
                      isCurrentPage
                        ? 'border-[#ea543a] ring-2 ring-[#ea543a]/25 shadow-xs'
                        : isSelected
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Top-Right Round Selection Checkbox Button */}
                    <button
                      type="button"
                      onClick={(e) => togglePageSelection(idx, e)}
                      className="absolute top-[0.25vw] right-[0.25vw] z-10 cursor-pointer"
                      title={isSelected ? `Deselect Page ${idx + 1}` : `Select Page ${idx + 1}`}
                    >
                      {isSelected ? (
                        <div className="w-[1vw] h-[1vw] rounded-full bg-[#ea543a] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                          <Check size="0.65vw" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-[1vw] h-[1vw] rounded-full border-[1.5px] border-[#ea543a] bg-white hover:bg-orange-50 transition-colors" />
                      )}
                    </button>

                    {/* Thumbnail Image */}
                    <div className="w-full flex-1 flex items-center justify-center overflow-hidden rounded-[0.25vw] bg-[#fdfdfd]">
                      <img
                        src={url}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-contain pointer-events-none"
                        loading="lazy"
                      />
                    </div>

                    {/* Page Number */}
                    <div className="text-[0.68vw] font-medium text-gray-500 leading-none pt-[0.2vw]">
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Settings & Controls Form matching screenshot */}
          <div className="flex flex-col gap-[0.6vw] pt-[0.8vw] border-t border-gray-100 flex-shrink-0">
            {/* Row 1: Document Page Count */}
            <div className="flex items-center gap-[0.5vw] text-[0.8vw] text-gray-600 font-medium">
              <FileText className="w-[0.95vw] h-[0.95vw] text-gray-400 flex-shrink-0" />
              <span>
                {selectedPages.size} {selectedPages.size === 1 ? 'page' : 'pages'}
              </span>
            </div>

            {/* Row 2: Paper Size & Orientation 50/50 Grid */}
            <div className="flex items-center gap-[0.5vw]">
              <BookOpen className="w-[0.95vw] h-[0.95vw] text-gray-400 flex-shrink-0" />
              <div className="grid grid-cols-2 gap-[0.5vw] flex-1 min-w-0">
                {/* Paper Size Selector */}
                <div ref={sizeDropdownRef} className="relative w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSizeOpen(prev => !prev);
                      setIsOrientOpen(false);
                      setIsPlacementOpen(false);
                      setIsTargetPageOpen(false);
                    }}
                    className={`w-full flex items-center justify-between bg-white border rounded-[0.4vw] pl-[0.7vw] pr-[0.5vw] py-[0.38vw] text-[0.75vw] font-medium transition-all shadow-2xs cursor-pointer ${
                      isSizeOpen ? 'border-[#ea543a] ring-1 ring-[#ea543a]/20 text-[#ea543a]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate">{selectedPaperSize}</span>
                    <ChevronDown className={`w-[0.75vw] h-[0.75vw] flex-shrink-0 ml-[0.2vw] transition-transform ${isSizeOpen ? 'rotate-180 text-[#ea543a]' : 'text-gray-400'}`} />
                  </button>

                  {isSizeOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-[0.3vw] bg-white border border-gray-200 rounded-[0.5vw] shadow-xl py-[0.3vw] z-50 max-h-[12vw] overflow-y-auto custom-scrollbar">
                      {PREVIEW_PAPER_SIZES.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedPaperSize(opt.label);
                            setIsSizeOpen(false);
                          }}
                          className={`w-full px-[0.7vw] py-[0.35vw] text-left text-[0.75vw] flex items-center justify-between cursor-pointer ${
                            selectedPaperSize === opt.label ? 'bg-orange-50 text-[#ea543a] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {selectedPaperSize === opt.label && <Check className="w-[0.7vw] h-[0.7vw] text-[#ea543a]" strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orientation Selector */}
                <div ref={orientDropdownRef} className="relative w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrientOpen(prev => !prev);
                      setIsSizeOpen(false);
                      setIsPlacementOpen(false);
                      setIsTargetPageOpen(false);
                    }}
                    className={`w-full flex items-center justify-between bg-white border rounded-[0.4vw] pl-[0.7vw] pr-[0.5vw] py-[0.38vw] text-[0.75vw] font-medium transition-all shadow-2xs cursor-pointer ${
                      isOrientOpen ? 'border-[#ea543a] ring-1 ring-[#ea543a]/20 text-[#ea543a]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate">{selectedOrientation}</span>
                    <ChevronDown className={`w-[0.75vw] h-[0.75vw] flex-shrink-0 ml-[0.2vw] transition-transform ${isOrientOpen ? 'rotate-180 text-[#ea543a]' : 'text-gray-400'}`} />
                  </button>

                  {isOrientOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-[0.3vw] bg-white border border-gray-200 rounded-[0.5vw] shadow-xl py-[0.3vw] z-50">
                      {['Portrait', 'Landscape'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedOrientation(opt);
                            setIsOrientOpen(false);
                          }}
                          className={`w-full px-[0.7vw] py-[0.35vw] text-left text-[0.75vw] flex items-center justify-between cursor-pointer ${
                            selectedOrientation === opt ? 'bg-orange-50 text-[#ea543a] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{opt}</span>
                          {selectedOrientation === opt && <Check className="w-[0.7vw] h-[0.7vw] text-[#ea543a]" strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Add Pages To Placement & Target Page Grid */}
            <div className="flex items-center gap-[0.5vw]">
              <Layers className="w-[0.95vw] h-[0.95vw] text-gray-400 flex-shrink-0" />
              <div className="grid grid-cols-2 gap-[0.5vw] flex-1 min-w-0">
                {/* Placement Selector (e.g. After Current Page) */}
                <div ref={placementDropdownRef} className="relative w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlacementOpen(prev => !prev);
                      setIsSizeOpen(false);
                      setIsOrientOpen(false);
                      setIsTargetPageOpen(false);
                    }}
                    className={`w-full flex items-center justify-between bg-white border rounded-[0.4vw] pl-[0.7vw] pr-[0.5vw] py-[0.38vw] text-[0.75vw] font-medium transition-all shadow-2xs cursor-pointer ${
                      isPlacementOpen ? 'border-[#ea543a] ring-1 ring-[#ea543a]/20 text-[#ea543a]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate">
                      {placement === 'after' ? 'After Current Page' : placement === 'before' ? 'Before Current Page' : placement === 'replace' ? 'Replace Current Page' : 'At The End'}
                    </span>
                    <ChevronDown className={`w-[0.75vw] h-[0.75vw] flex-shrink-0 ml-[0.2vw] transition-transform ${isPlacementOpen ? 'rotate-180 text-[#ea543a]' : 'text-gray-400'}`} />
                  </button>

                  {isPlacementOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-[0.3vw] bg-white border border-gray-200 rounded-[0.5vw] shadow-xl py-[0.3vw] z-50">
                      {[
                        { id: 'after', label: 'After Current Page' },
                        { id: 'before', label: 'Before Current Page' },
                        { id: 'replace', label: 'Replace Current Page' },
                        { id: 'end', label: 'At The End' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setPlacement(opt.id);
                            setIsPlacementOpen(false);
                          }}
                          className={`w-full px-[0.7vw] py-[0.35vw] text-left text-[0.75vw] flex items-center justify-between cursor-pointer ${
                            placement === opt.id ? 'bg-orange-50 text-[#ea543a] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {placement === opt.id && <Check className="w-[0.7vw] h-[0.7vw] text-[#ea543a]" strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Page Selector (e.g. Page 4) */}
                <div ref={targetPageDropdownRef} className="relative w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTargetPageOpen(prev => !prev);
                      setIsSizeOpen(false);
                      setIsOrientOpen(false);
                      setIsPlacementOpen(false);
                    }}
                    className={`w-full flex items-center justify-between bg-white border rounded-[0.4vw] pl-[0.7vw] pr-[0.5vw] py-[0.38vw] text-[0.75vw] font-medium transition-all shadow-2xs cursor-pointer ${
                      isTargetPageOpen ? 'border-[#ea543a] ring-1 ring-[#ea543a]/20 text-[#ea543a]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate">Page {targetPageIndex + 1}</span>
                    <ChevronDown className={`w-[0.75vw] h-[0.75vw] flex-shrink-0 ml-[0.2vw] transition-transform ${isTargetPageOpen ? 'rotate-180 text-[#ea543a]' : 'text-gray-400'}`} />
                  </button>

                  {isTargetPageOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-[0.3vw] bg-white border border-gray-200 rounded-[0.5vw] shadow-xl py-[0.3vw] z-50 max-h-[10vw] overflow-y-auto custom-scrollbar">
                      {Array.from({ length: Math.max(existingPageCount, 12) }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setTargetPageIndex(i);
                            setIsTargetPageOpen(false);
                          }}
                          className={`w-full px-[0.7vw] py-[0.35vw] text-left text-[0.75vw] flex items-center justify-between cursor-pointer ${
                            targetPageIndex === i ? 'bg-orange-50 text-[#ea543a] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Page {i + 1}</span>
                          {targetPageIndex === i && <Check className="w-[0.7vw] h-[0.7vw] text-[#ea543a]" strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 4: Big CTA Button "USE THIS TEMPLATE ->" */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isApplying || selectedPages.size === 0}
              className="w-full mt-[0.3vw] py-[0.75vw] bg-[#ea543a] hover:bg-[#d9482f] active:scale-[0.99] text-white font-bold text-[0.85vw] rounded-[0.5vw] flex items-center justify-center gap-[0.5vw] shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isApplying ? (
                <>
                  <div className="w-[1vw] h-[1vw] border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Applying ({selectedPages.size} pages)...</span>
                </>
              ) : (
                <>
                  <span>USE THIS TEMPLATE</span>
                  <ChevronRight className="w-[1vw] h-[1vw]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
