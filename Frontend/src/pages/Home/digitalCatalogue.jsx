import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import HTMLFlipBook from 'react-pageflip';
import softCoverAudio from '../../assets/Audios/Soft cover page.mp3';
import trustedAvatar1 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-1.webp';
import trustedAvatar2 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-2.webp';
import trustedAvatar3 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-3.webp';
import trustedAvatar4 from '../../assets/Home/final-images/trusted-avatar/trusted-avatar-4.webp';

export default function HeroSection({ navigate, page1, page2, page3, page4, page5, page6, page7, page8 }) {
  const containerRef = useRef(null);
  const heroBookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStep, setActiveStep] = useState(1);
  const activeStepRef = useRef(1);
  const isWheelingRef = useRef(false);
  const step3ReachedTimeRef = useRef(0);
  const hasPassedHeroRef = useRef(false);
  const [isFlipAudioMuted, setIsFlipAudioMuted] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  const pagesList = [page1, page2, page3, page4, page5, page6, page7, page8];
  const heroPages = pagesList;

  const flipAudioRef = useRef(null);
  
  
  const isHeroVisibleRef = useRef(true);

  // IntersectionObserver: Only allow autoplay and sound when HeroSection is in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio > 0.15;
        setIsHeroVisible(visible);
        isHeroVisibleRef.current = visible;
        if (!visible) {
          
          if (flipAudioRef.current) {
            flipAudioRef.current.pause();
            flipAudioRef.current.currentTime = 0;
          }
        } else {
          
        }
      },
      { threshold: [0, 0.15, 0.5] }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    flipAudioRef.current = new Audio(softCoverAudio);
    return () => {
      if (flipAudioRef.current) {
        flipAudioRef.current.pause();
        flipAudioRef.current = null;
      }
    };
  }, []);

  const playFlipSound = useCallback(() => {
    if (isFlipAudioMuted || !isHeroVisibleRef.current) return;
    if (flipAudioRef.current) {
      flipAudioRef.current.currentTime = 0;
      flipAudioRef.current.play().catch(() => {});
    }
  }, [isFlipAudioMuted]);

  const [coverState, setCoverState] = useState('front'); // 'front' | 'open' | 'back'

  // Synchronize active step (1, 2, 3, 4, 5) and cover state based on page index
  const updateStepFromPage = useCallback((pageIndex) => {
    let step = 1;
    if (pageIndex >= 7) {
      step = 5;
    } else if (pageIndex >= 5) {
      step = 4;
    } else if (pageIndex >= 3) {
      step = 3;
    } else if (pageIndex >= 1) {
      step = 2;
    } else {
      step = 1;
    }
    setActiveStep(step);
    activeStepRef.current = step;

    // Front cover is on the right of the spread (needs -25% shift)
    // Back cover is on the left of the spread (needs +25% shift)
    // Open spreads (pages 1 to 6) are 2 pages (needs 0% shift)
    if (pageIndex === 0) {
      setCoverState('front');
    } else if (pageIndex >= 7) {
      setCoverState('back');
    } else {
      setCoverState('open');
    }
  }, []);

  const flipToStep = useCallback((stepNumber) => {
    if (!heroBookRef.current) return;
    const pageFlipObj = heroBookRef.current.pageFlip();
    if (!pageFlipObj) return;

    let targetPageIndex = 0;
    if (stepNumber === 1) targetPageIndex = 0;
    else if (stepNumber === 2) targetPageIndex = 1;
    else if (stepNumber === 3) targetPageIndex = 3;
    else if (stepNumber === 4) targetPageIndex = 5;
    else if (stepNumber === 5) targetPageIndex = 7;

    const currentStep = activeStepRef.current;
    if (currentStep === stepNumber) return;

    setActiveStep(stepNumber);
    activeStepRef.current = stepNumber;

    const stepDiff = stepNumber - currentStep;
    if (stepDiff === 1) {
      pageFlipObj.flipNext();
    } else if (stepDiff === -1) {
      pageFlipObj.flipPrev();
    } else {
      if (typeof pageFlipObj.turnToPage === 'function') {
        pageFlipObj.turnToPage(targetPageIndex);
      } else {
        pageFlipObj.flip(targetPageIndex);
      }
    }
  }, []);

  const onHeroBookFlip = useCallback((e) => {
    const newPageIdx = e.data;
    setCurrentPage(newPageIdx + 1);
    updateStepFromPage(newPageIdx);
    playFlipSound();
  }, [playFlipSound, updateStepFromPage]);

  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const playIntervalRef = useRef(null);

  const flipPrev = useCallback(() => {
    if (activeStepRef.current > 1) {
      flipToStep(activeStepRef.current - 1);
    }
  }, [flipToStep]);

  const flipNext = useCallback(() => {
    if (activeStepRef.current < 5) {
      flipToStep(activeStepRef.current + 1);
    }
  }, [flipToStep]);

  const jumpToFirst = useCallback(() => {
    flipToStep(1);
  }, [flipToStep]);

  const jumpToLast = useCallback(() => {
    flipToStep(5);
  }, [flipToStep]);

  // Autoplay handler: auto flip through pages, stop and return to page 1 on completion
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        const current = activeStepRef.current;
        if (current >= 5) {
          setIsPlaying(false);
          isPlayingRef.current = false;
          clearInterval(playIntervalRef.current);
          flipToStep(1);
        } else {
          flipToStep(current + 1);
        }
      }, 3000);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, flipToStep]);

  return (
    <section ref={containerRef} className="relative w-full min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-7vh)] bg-[#fdfdfd] flex flex-col justify-center pt-4 sm:pt-6 lg:pt-5 pb-6 sm:pb-8 lg:pb-6 px-4 sm:px-8 lg:px-[6vw] font-poppins overflow-hidden">
      
      {/* Top Tag: INTERACTIVE DIGITAL CATALOGUE and line */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center gap-3 mb-3 lg:mb-4 flex-shrink-0"
      >
        <span className="text-[11px] lg:text-[0.85vw] font-bold tracking-[0.24em] text-[#35363A] uppercase">
          INTERACTIVE DIGITAL CATALOGUE
        </span>
        <div className="w-10 lg:w-[2.8vw] h-[1.5px] bg-[#35363A]"></div>
      </motion.div>

      {/* Main Container: Left 8-col Rounded Panel (holding Book + controls) & Right 4-col Pitch */}
      <div className="w-full flex-1 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        {/* Left Column: Rounded Grey Stage Box (Reduced corner radius & compact stage height) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="lg:col-span-8 w-full bg-[#efefef] rounded-[16px] lg:rounded-[1.2vw] p-3 sm:p-5 lg:p-[1.2vw] flex flex-col items-center justify-center relative shadow-xs overflow-hidden min-h-[420px] sm:min-h-[460px] lg:min-h-[500px]"
        >
          {/* Flipbook inside rounded stage box (Increased book size, removed floating side circle buttons) */}
          <div className="relative mx-auto w-full max-w-[560px] xs:max-w-[620px] sm:max-w-[700px] lg:max-w-[47vw] xl:max-w-[49vw] aspect-[420/297] flex items-center justify-center my-auto px-2 sm:px-4">
            {/* Flipbook Canvas */}
            <div
              className={`w-full h-full flex items-center justify-center transition-transform duration-700 ease-in-out ${
                coverState === 'front'
                  ? '-translate-x-[25%]'
                  : coverState === 'back'
                  ? 'translate-x-[25%]'
                  : 'translate-x-0'
              }`}
            >
              <HTMLFlipBook
                width={595}
                height={842}
                size="stretch"
                minWidth={240}
                maxWidth={1400}
                minHeight={340}
                maxHeight={1980}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                clickEventForward={false}
                useMouseEvents={true}
                onFlip={onHeroBookFlip}
                flippingTime={900}
                swipeDistance={30}
                ref={heroBookRef}
                startPage={0}
                className="w-full h-full mx-auto"
              >
                {heroPages.map((pageSrc, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow-inner flex items-center justify-center">
                    <img
                      src={pageSrc}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          </div>

          {/* Clean Pill Bottom Controls (< [ ▶ | 01 / 08 ] >) with Previous and Next arrows only */}
          <div className="w-full flex items-center justify-center mt-3 sm:mt-4 relative z-20">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Previous Page Button */}
              <button
                type="button"
                onClick={flipPrev}
                disabled={activeStep <= 1}
                className={`transition-colors flex items-center justify-center p-1.5 ${
                  activeStep <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#555555] hover:text-[#EC5137] cursor-pointer'
                }`}
                title="Previous page"
                aria-label="Previous Page"
              >
                <Icon icon="lucide:chevron-left" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </button>

              {/* Pill Container: [Play | 01 / 08] */}
              <div className="flex items-center gap-2.5 sm:gap-3 px-5 sm:px-6 py-2 sm:py-2.5 bg-white rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.08)] border border-gray-100">
                {/* Play / Pause Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="transition-colors flex items-center justify-center cursor-pointer text-[#555555] hover:opacity-80"
                  aria-label={isPlaying ? "Pause autoplay" : "Play flipbook"}
                >
                  {isPlaying ? (
                    <Icon icon="lucide:pause" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#555555] text-[#555555]" />
                  ) : (
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      viewBox="0 0 24 24"
                      fill="#555555"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7 4.5v15l12-7.5-12-7.5z" />
                    </svg>
                  )}
                </button>

                {/* Orange/Red Vertical Separator */}
                <div className="w-[1.5px] h-3.5 bg-[#EC5137] rounded-full mx-0.5" />

                {/* Page Number (01 / 08 format) */}
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#555555] select-none text-center">
                  {String(currentPage).padStart(2, '0')} / {String(heroPages.length).padStart(2, '0')}
                </span>
              </div>

              {/* Next Page Button */}
              <button
                type="button"
                onClick={flipNext}
                disabled={activeStep >= 5}
                className={`transition-colors flex items-center justify-center p-1.5 ${
                  activeStep >= 5 ? 'text-gray-300 cursor-not-allowed' : 'text-[#555555] hover:text-[#EC5137] cursor-pointer'
                }`}
                title="Next page"
                aria-label="Next Page"
              >
                <Icon icon="lucide:chevron-right" className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Content Pitch & Rating Box (col-span-4) - Matching Screenshot */}
        <div
          className="lg:col-span-4 flex flex-col justify-between text-center lg:text-right items-center lg:items-end py-1 h-full lg:h-[480px] xl:h-[500px] gap-6 lg:gap-0 lg:pl-[1.5vw]"
        >
          
          {/* Top Block: Pitch Heading, Subtext, Bullets & Line (Shifted upward) */}
          <div className="flex flex-col items-center lg:items-end w-full -mt-2 lg:-mt-6 xl:-mt-8">
            {/* YOUR - Clean Solid Brand Color */}
            <motion.h2
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[5.4vw] font-black uppercase leading-none text-[#EA4335] tracking-[0.06em] select-none"
            >
              YOUR
            </motion.h2>

            {/* CONTENT. STORY. - #35363A with larger text size */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.1vw] font-bold text-[#1a1a1a] tracking-wider uppercase mt-2 sm:mt-2.5 leading-[1.2]"
            >
              CONTENT.<br />STORY.
            </motion.div>

            {/* Interactive, Imm..... - #555555 & medium (increased text size) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-[13px] xs:text-sm sm:text-lg md:text-xl lg:text-[0.92vw] font-semibold text-[#555555] tracking-wider uppercase flex items-center gap-2 sm:gap-3 lg:gap-[0.6vw] flex-wrap justify-center lg:justify-end mt-3 sm:mt-4 lg:mt-[1.1vw]"
            >
              <span className="whitespace-nowrap">• INTERACTIVE</span>
              <span className="whitespace-nowrap">• IMMERSIVE</span>
              <span className="whitespace-nowrap">• INTELLIGENT</span>
            </motion.div>

            {/* Red Accent Line aligned precisely under INTELLIGENT */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.85, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-24 sm:w-32 md:w-44 lg:w-[5.8vw] h-[2.5px] bg-[#EA4335] mt-2.5 sm:mt-3 self-center lg:self-end origin-right"
            ></motion.div>
          </div>

          {/* Bottom Block: Customer Reviews (Shifted downward) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center lg:items-end w-full mt-4 lg:mt-0 pt-2 lg:pt-4"
          >
            {/* Overlapping individual circular avatars */}
            <div className="flex items-center justify-center lg:justify-end -space-x-2.5 lg:-space-x-[0.6vw] mb-1.5">
              <img
                src={trustedAvatar1}
                alt="Customer 1"
                className="w-8 h-8 sm:w-8 sm:h-8 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full ring-2 ring-[#EA4335] object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar2}
                alt="Customer 2"
                className="w-8 h-8 sm:w-8 sm:h-8 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full ring-2 ring-[#EA4335] object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar3}
                alt="Customer 3"
                className="w-8 h-8 sm:w-8 sm:h-8 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full ring-2 ring-[#EA4335] object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar4}
                alt="Customer 4"
                className="w-8 h-8 sm:w-8 sm:h-8 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full ring-2 ring-[#EA4335] object-cover bg-gray-100 shadow-sm"
              />
            </div>

            {/* 5 Solid Yellow Stars */}
            <div className="flex text-[#FD9F0D] text-sm sm:text-base md:text-lg lg:text-[1.1vw] tracking-wider my-0.5">
              ★★★★★
            </div>

            {/* Trusted by 10,000+ Customer */}
            <span className="text-xs sm:text-sm md:text-base lg:text-[0.75vw] font-medium text-[#35363A] tracking-tight">
              Trusted by 10,000+ Customer
            </span>
          </motion.div>

        </div>

      </div>

    </section>
  );
}
