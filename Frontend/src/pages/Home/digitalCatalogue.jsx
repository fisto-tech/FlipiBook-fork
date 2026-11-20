import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import TurnBook from '../../components/common/TurnBook';
import softCoverAudio from '../../assets/Audios/Soft cover page.mp3';
import trustedAvatar1 from '../../assets/Home/TrustedAvatar/trusted-avatar-1.webp';
import trustedAvatar2 from '../../assets/Home/TrustedAvatar/trusted-avatar-2.webp';
import trustedAvatar3 from '../../assets/Home/TrustedAvatar/trusted-avatar-3.webp';
import trustedAvatar4 from '../../assets/Home/TrustedAvatar/trusted-avatar-4.webp';

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
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));

  // Direct standard original images (Home1 to home8) for all devices
  const heroPages = [page1, page2, page3, page4, page5, page6, page7, page8];

  const flipAudioRef = useRef(null);
  const isHeroVisibleRef = useRef(true);

  useEffect(() => {
    const checkMobile = () => {
      // Treat viewport width <= 768px (including iPhone/device devtools emulation) as mobile single-page
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      flipAudioRef.current.play().catch(() => { });
    }
  }, [isFlipAudioMuted]);

  const [coverState, setCoverState] = useState('front'); // 'front' | 'open' | 'back'

  // Helper function to format page numbers for double-page spreads
  const getPageDisplay = () => {
    if (currentPage <= 1) {
      return `01 / ${String(heroPages.length).padStart(2, '0')}`;
    }
    if (currentPage >= heroPages.length) {
      return `${String(heroPages.length).padStart(2, '0')} / ${String(heroPages.length).padStart(2, '0')}`;
    }
    const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const rightPage = leftPage + 1;
    return `${String(leftPage).padStart(2, '0')}-${String(rightPage).padStart(2, '0')} / ${String(heroPages.length).padStart(2, '0')}`;
  };

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

    if (window.innerWidth < 640) {
      setCoverState('open');
    } else {
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
    <section ref={containerRef} className="relative w-full h-[calc(100vh-56px)] md:h-[calc(100vh-7vh)] max-h-[100vh] bg-[#fdfdfd] flex flex-col justify-between py-2 sm:py-3 lg:py-[1.2vh] px-4 sm:px-8 lg:px-[5vw] font-poppins overflow-hidden">

      {/* Top Tag: INTERACTIVE DIGITAL CATALOGUE and line */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center gap-2.5 sm:gap-3.5 lg:gap-[0.9vw] pt-2.5 sm:pt-3.5 lg:pt-[2.2vh] mb-2 sm:mb-3 lg:mb-[1.2vh] flex-shrink-0"
      >
        <span className="text-[11px] sm:text-xs lg:text-[0.85vw] font-bold tracking-[0.24em] text-[#35363A] uppercase">
          INTERACTIVE DIGITAL CATALOGUE
        </span>
        <div className="w-10 sm:w-14 lg:w-[3.6vw] h-[1.5px] lg:h-[0.15vh] bg-[#35363A]"></div>
      </motion.div>

      {/* Main Container: Left Rounded Panel & Right Pitch */}
      <div className="w-full flex-1 min-h-0 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-[1.5vw] items-center">

        {/* Left Column: Rounded Grey Stage Box (Expanded modal width, book centered) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="lg:col-span-8 xl:col-span-8 lg:w-[106%] xl:w-[108%] bg-[#efefef] rounded-[16px] lg:rounded-[1.2vw] pt-4 sm:pt-6 lg:pt-[2.5vh] pb-3 sm:pb-4 lg:pb-[1.8vh] px-3 sm:px-6 lg:px-[2vw] flex flex-col justify-between items-center relative shadow-xs overflow-hidden h-full max-h-[76vh]"
        >
          {/* Flipbook inside rounded stage box (Clean and perfectly centered like Modal Book) */}
          <div className="relative mx-auto aspect-[420/297] flex items-center justify-center w-full max-w-[570px] sm:max-w-[650px] lg:max-w-[47vw] xl:max-w-[49vw] max-h-[63vh] flex-1 translate-y-1 sm:translate-y-2 lg:translate-y-[1.2vh]">
            {/* Left Previous Arrow */}
            <button
              type="button"
              onClick={flipPrev}
              disabled={activeStep <= 1}
              className={`absolute -left-6 sm:-left-9 md:-left-12 lg:-left-[3vw] top-1/2 -translate-y-1/2 z-30 transition-all p-1.5 sm:p-2 rounded-full hover:bg-black/5 ${
                activeStep <= 1 ? 'text-gray-300 opacity-40 cursor-not-allowed' : 'text-[#555555] hover:text-[#EC5137] cursor-pointer'
              }`}
              title="Previous page"
              aria-label="Previous Page"
            >
              <Icon icon="lucide:chevron-left" className="w-6 h-6 sm:w-8 sm:h-8 lg:w-[1.8vw] lg:h-[1.8vw] stroke-[2.5]" />
            </button>

            {/* Flipbook Canvas */}
            <div
              key="hero-digital-catalogue-book"
              className="w-full h-full flex items-center justify-center"
            >
              <TurnBook
                ref={heroBookRef}
                pages={heroPages}
                width={595}
                height={842}
                duration={900}
                startPage={0}
                onFlip={onHeroBookFlip}
                className="mx-auto"
              />
            </div>

            {/* Right Next Arrow */}
            <button
              type="button"
              onClick={flipNext}
              disabled={activeStep >= 5}
              className={`absolute -right-6 sm:-right-9 md:-right-12 lg:-right-[3vw] top-1/2 -translate-y-1/2 z-30 transition-all p-1.5 sm:p-2 rounded-full hover:bg-black/5 ${
                activeStep >= 5 ? 'text-gray-300 opacity-40 cursor-not-allowed' : 'text-[#555555] hover:text-[#EC5137] cursor-pointer'
              }`}
              title="Next page"
              aria-label="Next Page"
            >
              <Icon icon="lucide:chevron-right" className="w-6 h-6 sm:w-8 sm:h-8 lg:w-[1.8vw] lg:h-[1.8vw] stroke-[2.5]" />
            </button>
          </div>

          {/* Bottom Bar Controls matching book double page width - positioned at the bottom of the modal */}
          <div className="w-full max-w-[570px] sm:max-w-[650px] lg:max-w-[47vw] xl:max-w-[49vw] px-2 sm:px-4 mt-2 mb-1 sm:mb-1.5 lg:mb-[0.5vh] relative z-20">
            <div className="flex items-center gap-3 sm:gap-4 w-full">
              {/* Controls Group: First, Play/Pause, Last */}
              <div className="flex items-center gap-2 sm:gap-2.5 text-[#555555]">
                {/* First Page (Backward |<) */}
                <button
                  type="button"
                  onClick={jumpToFirst}
                  disabled={activeStep <= 1}
                  className={`p-1 transition-colors flex items-center justify-center ${
                    activeStep <= 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-[#EC5137] cursor-pointer'
                  }`}
                  title="First page"
                  aria-label="First page"
                >
                  <Icon icon="lucide:skip-back" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>

                {/* Play / Pause Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="p-1 transition-colors flex items-center justify-center cursor-pointer hover:text-[#EC5137]"
                  title={isPlaying ? "Pause autoplay" : "Play flipbook"}
                  aria-label={isPlaying ? "Pause autoplay" : "Play flipbook"}
                >
                  {isPlaying ? (
                    <Icon icon="lucide:pause" className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-current" />
                  ) : (
                    <svg
                      className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7 4.5v15l12-7.5-12-7.5z" />
                    </svg>
                  )}
                </button>

                {/* Last Page (Forward >|) */}
                <button
                  type="button"
                  onClick={jumpToLast}
                  disabled={activeStep >= 5}
                  className={`p-1 transition-colors flex items-center justify-center ${
                    activeStep >= 5 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-[#EC5137] cursor-pointer'
                  }`}
                  title="Last page"
                  aria-label="Last page"
                >
                  <Icon icon="lucide:skip-forward" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
              </div>

              {/* Progress Slider Track (#555555) */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={activeStep}
                  onChange={(e) => flipToStep(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#dcdfe4] rounded-full appearance-none cursor-pointer outline-none focus:outline-none accent-[#555555]"
                  style={{
                    background: `linear-gradient(to right, #555555 0%, #555555 ${((activeStep - 1) / 4) * 100}%, #dcdfe4 ${((activeStep - 1) / 4) * 100}%, #dcdfe4 100%)`
                  }}
                  aria-label="Book page progress slider"
                />
              </div>

              {/* Page Number (e.g. 02-03 / 08 or 04-05 / 08 for double page) */}
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#555555] select-none text-right min-w-[75px]">
                {getPageDisplay()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Content Pitch & Rating Box - shifted right */}
        <div
          className="lg:col-span-4 flex flex-col justify-between text-left items-start py-1 h-full max-h-[72vh] gap-4 lg:gap-0 lg:pl-[6.5vw] xl:pl-[7.8vw] 2xl:pl-[8.5vw]"
        >
          {/* Top Block: Headings, Subtitle, Divider, Description, Bullets */}
          <div className="flex flex-col items-start w-full">
            {/* INTERACTIVE */}
            <motion.h2
              initial={{ opacity: 0, x: 45 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-[48px] lg:text-[3.1vw] font-bold uppercase leading-[1.12] tracking-tight select-none text-[#1f2937] font-sans"
            >
              INTERACTIVE
            </motion.h2>

            {/* DIGITAL */}
            <motion.h2
              initial={{ opacity: 0, x: 45 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-[48px] lg:text-[3.1vw] font-bold uppercase leading-[1.12] tracking-tight select-none text-[#1f2937] font-sans mt-0.5"
            >
              DIGITAL
            </motion.h2>

            {/* CATALOGUE */}
            <motion.h2
              initial={{ opacity: 0, x: 45 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-[48px] lg:text-[3.1vw] font-bold uppercase leading-[1.12] tracking-tight select-none text-[#E75B3E] font-sans mt-0.5"
            >
              CATALOGUE
            </motion.h2>

            {/* THAT BRINGS YOUR PRODUCTS TO LIFE. */}
            <motion.p
              initial={{ opacity: 0, x: 35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] sm:text-[11px] lg:text-[0.68vw] font-bold text-[#555555] tracking-widest uppercase mt-2 lg:mt-[0.8vh]"
            >
              THAT BRINGS YOUR PRODUCTS TO LIFE.
            </motion.p>

            {/* Subtle Horizontal Divider Line */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-[1px] bg-[#e5e5e5] my-3.5 sm:my-4 lg:my-[1.8vh] origin-left"
            />

            {/* Description Paragraph */}
            <motion.p
              initial={{ opacity: 0, x: 35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-[13.5px] lg:text-[0.82vw] font-medium text-[#555555] leading-[1.65] max-w-[260px] sm:max-w-[310px] lg:max-w-[15.5vw]"
            >
              Transform your PDFs into engaging digital catalogues with FlipiBook. Add videos, interactive 3D models, clickable links, and rich product details to create an immersive browsing experience. Showcase your products, connect with customers, and share everything through a single link.
            </motion.p>

            {/* Bullets: • INTERACTIVE • IMMERSIVE • INTELLIGENT */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] sm:text-[11px] lg:text-[0.65vw] font-semibold text-[#555555] tracking-wider uppercase flex items-center gap-2 mt-2.5 lg:mt-[1vh]"
            >
              <span>• INTERACTIVE</span>
              <span>• IMMERSIVE</span>
              <span>• INTELLIGENT</span>
            </motion.div>

            {/* Red Accent Line under bullets */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-16 sm:w-20 lg:w-[4vw] h-[2px] bg-[#EA4335] mt-1.5 origin-left"
            />
          </div>

          {/* Bottom Block: Customer Reviews (Left-aligned) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 sm:gap-4 w-full mt-3 lg:mt-0 pt-1 lg:pt-[0.8vh]"
          >
            {/* Overlapping individual circular avatars */}
            <div className="flex items-center -space-x-2 sm:-space-x-2.5">
              <img
                src={trustedAvatar1}
                alt="Customer 1"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full ring-2 ring-white object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar2}
                alt="Customer 2"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full ring-2 ring-white object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar3}
                alt="Customer 3"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full ring-2 ring-white object-cover bg-gray-100 shadow-sm"
              />
              <img
                src={trustedAvatar4}
                alt="Customer 4"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full ring-2 ring-white object-cover bg-gray-100 shadow-sm"
              />
            </div>

            {/* Stars & Text Side-by-Side/Stacked */}
            <div className="flex flex-col items-start">
              <div className="flex text-[#FD9F0D] text-xs sm:text-sm lg:text-[0.9vw] tracking-wider">
                ★★★★★
              </div>
              <span className="text-[10px] sm:text-xs lg:text-[0.68vw] font-medium text-[#555555] tracking-tight">
                Trusted by 10,000+ Customer
              </span>
            </div>
          </motion.div>

        </div>

      </div>

      {/* Mobile-only pageflip shadow cleanup to keep book spine clean and consistent */}
      <style>{`
        @media (max-width: 768px) {
          .stf__shadow,
          .stf__shadowTop,
          .stf__shadowBottom,
          .stf__outerShadow,
          .stf__innerShadow,
          .stf__hardShadow,
          .stf__hardInnerShadow {
            display: none !important;
            opacity: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </section>
  );
}
