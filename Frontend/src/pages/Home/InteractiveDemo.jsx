import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import TurnBook from '../../components/common/TurnBook';
import softCoverAudio from '../../assets/Audios/Soft cover page.mp3';
import audioTrack from '../../assets/Audios/audio.mp3';

import page1 from '../../assets/Home/InteractiveDemo/A4_1.webp';
import page2 from '../../assets/Home/InteractiveDemo/A4_2.webp';
import page3 from '../../assets/Home/InteractiveDemo/A4_3.webp';
import page4 from '../../assets/Home/InteractiveDemo/A4_4.webp';
import page5 from '../../assets/Home/InteractiveDemo/A4_5.webp';
import page6 from '../../assets/Home/InteractiveDemo/A4_6.webp';

import demoBook1 from '../../assets/Home/InteractiveDemo/demo1.webp';
import demoBook2 from '../../assets/Home/InteractiveDemo/demo2.webp';
import demoBook3 from '../../assets/Home/InteractiveDemo/demo3.webp';
import demoBook4 from '../../assets/Home/InteractiveDemo/demo4.webp';
import demoBook5 from '../../assets/Home/InteractiveDemo/demo5.webp';

// Food demo book assets & background
import foodbg from '../../assets/Home/InteractiveDemo/foodbg.webp';
import food1 from '../../assets/Home/InteractiveDemo/food1.webp';
import food2 from '../../assets/Home/InteractiveDemo/food2.webp';
import food3 from '../../assets/Home/InteractiveDemo/food3.webp';
import food4 from '../../assets/Home/InteractiveDemo/food4.webp';
import food5 from '../../assets/Home/InteractiveDemo/food5.webp';
import food6 from '../../assets/Home/InteractiveDemo/food6.webp';
import food7 from '../../assets/Home/InteractiveDemo/food7.webp';
import food8 from '../../assets/Home/InteractiveDemo/food8.webp';

// Dress demo book assets & background
import dressbg from '../../assets/Home/InteractiveDemo/dressbg.webp';
import dress1 from '../../assets/Home/InteractiveDemo/dress1.webp';
import dress2 from '../../assets/Home/InteractiveDemo/dress2.webp';
import dress3 from '../../assets/Home/InteractiveDemo/dress3.webp';
import dress4 from '../../assets/Home/InteractiveDemo/dress4.webp';
import dress5 from '../../assets/Home/InteractiveDemo/dress5.webp';
import dress6 from '../../assets/Home/InteractiveDemo/dress6.webp';

// Hospital demo book assets & background
import hospitalbg from '../../assets/Home/InteractiveDemo/hospitalbg.webp';
import hospital1 from '../../assets/Home/InteractiveDemo/hospital1.webp';
import hospital2 from '../../assets/Home/InteractiveDemo/hospital2.webp';
import hospital3 from '../../assets/Home/InteractiveDemo/hospital3.webp';
import hospital4 from '../../assets/Home/InteractiveDemo/hospital4.webp';
import hospital5 from '../../assets/Home/InteractiveDemo/hospital5.webp';
import hospital6 from '../../assets/Home/InteractiveDemo/hospital6.webp';

// Travel demo book assets & background
import travelbg from '../../assets/Home/InteractiveDemo/travelbg.webp';
import travel1 from '../../assets/Home/InteractiveDemo/travel1.webp';
import travel2 from '../../assets/Home/InteractiveDemo/travel2.webp';
import travel3 from '../../assets/Home/InteractiveDemo/travel3.webp';
import travel4 from '../../assets/Home/InteractiveDemo/travel4.webp';
import travel5 from '../../assets/Home/InteractiveDemo/travel5.webp';
import travel6 from '../../assets/Home/InteractiveDemo/travel6.webp';

// Company demo book assets & background
import companybg from '../../assets/Home/InteractiveDemo/companybg.webp';
import company1 from '../../assets/Home/InteractiveDemo/company1.webp';
import company2 from '../../assets/Home/InteractiveDemo/company2.webp';
import company3 from '../../assets/Home/InteractiveDemo/company3.webp';
import company4 from '../../assets/Home/InteractiveDemo/company4.webp';
import company5 from '../../assets/Home/InteractiveDemo/company5.webp';
import company6 from '../../assets/Home/InteractiveDemo/company6.webp';

export default function InteractiveDemo({ page1: h1, page2: h2, page3: h3, page4: h4, page5: h5, page6: h6, page7: h7, page8: h8 }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeModalBook, setActiveModalBook] = useState(null);

  // Modal Flipbook state
  const modalContainerRef = useRef(null);
  const modalBookRef = useRef(null);
  const [modalActiveStep, setModalActiveStep] = useState(1);
  // Real page number (1-based) — used for the counter in mobile single-page view
  const [modalPage, setModalPage] = useState(1);
  const [isMobileView, setIsMobileView] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const modalActiveStepRef = useRef(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const playIntervalRef = useRef(null);
  const modalAudioRef = useRef(null);
  const bgAudioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [modalCoverState, setModalCoverState] = useState('front');
  const isWheelingRef = useRef(false);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const thumbCarouselRef = useRef(null);

  const foodPages = [food1, food2, food3, food4, food5, food6, food7, food8];
  const dressPages = [dress1, dress2, dress3, dress4, dress5, dress6];
  const hospitalPages = [hospital1, hospital2, hospital3, hospital4, hospital5, hospital6];
  const travelPages = [travel1, travel2, travel3, travel4, travel5, travel6];
  const companyPages = [company1, company2, company3, company4, company5, company6];
  const defaultPages = (h1 && h2 && h3 && h4 && h5 && h6 && h7 && h8)
    ? [h1, h2, h3, h4, h5, h6, h7, h8]
    : [page1, page2, page3, page4, page5, page6];

  // Dynamic pages for active book: foodPages for Food (book 0), dressPages for Dress (book 1), hospitalPages for Hospital (book 2), travelPages for Travel (book 3), companyPages for Company (book 4), defaultPages for others
  const isCustomBook = !!(activeModalBook?.isFood || activeModalBook?.isDress || activeModalBook?.isHospital || activeModalBook?.isTravel || activeModalBook?.isCompany);
  // Light Theme styling for modal bars matching each book's background aesthetic (with a slightly deeper, richer tint)
  const themeBgColor = activeModalBook?.isDress
    ? '#DED6CE'
    : activeModalBook?.isHospital
      ? '#B8D1E2'
      : activeModalBook?.isTravel
        ? '#B8CDDC'
        : activeModalBook?.isCompany
          ? '#DDD6CC'
          : '#D4DDD4';

  const themeTextColor = activeModalBook?.isDress
    ? '#382B23'
    : activeModalBook?.isHospital
      ? '#0E283E'
      : activeModalBook?.isTravel
        ? '#0F2B42'
        : activeModalBook?.isCompany
          ? '#3C2E21'
          : '#163324';

  const themeBorderColor = 'rgba(0, 0, 0, 0.12)';
  const themeColor = themeTextColor;
  const activePages = activeModalBook?.isFood
    ? foodPages
    : activeModalBook?.isDress
      ? dressPages
      : activeModalBook?.isHospital
        ? hospitalPages
        : activeModalBook?.isTravel
          ? travelPages
          : activeModalBook?.isCompany
            ? companyPages
            : defaultPages;

  const totalSteps = activeModalBook?.isFood
    ? 5
    : (activeModalBook?.isDress || activeModalBook?.isHospital || activeModalBook?.isTravel || activeModalBook?.isCompany)
      ? 4
      : activePages.length === 8
        ? 5
        : 3;

  // Build step-based spreads for thumbnail tray (cover = single page, open spreads = two pages side-by-side in one card)
  const spreads = React.useMemo(() => {
    const list = [];
    if (activeModalBook?.isFood || activePages.length === 8) {
      // 8 pages: Step 1 (p1), Step 2 (p2-3), Step 3 (p4-5), Step 4 (p6-7), Step 5 (p8)
      list.push({ step: 1, label: 'Page 1', pages: [activePages[0]] });
      list.push({ step: 2, label: 'Page 2-3', pages: [activePages[1], activePages[2]] });
      list.push({ step: 3, label: 'Page 4-5', pages: [activePages[3], activePages[4]] });
      list.push({ step: 4, label: 'Page 6-7', pages: [activePages[5], activePages[6]] });
      list.push({ step: 5, label: 'Page 8', pages: [activePages[7]] });
    } else if (activeModalBook?.isDress || activeModalBook?.isHospital || activeModalBook?.isTravel || activeModalBook?.isCompany || activePages.length === 6) {
      // 6 pages: Step 1 (p1), Step 2 (p2-3), Step 3 (p4-5), Step 4 (p6)
      list.push({ step: 1, label: 'Page 1', pages: [activePages[0]] });
      list.push({ step: 2, label: 'Page 2-3', pages: [activePages[1], activePages[2]] });
      list.push({ step: 3, label: 'Page 4-5', pages: [activePages[3], activePages[4]] });
      list.push({ step: 4, label: 'Page 6', pages: [activePages[5]] });
    } else {
      // General fallback
      list.push({ step: 1, label: 'Page 1', pages: [activePages[0]] });
      for (let i = 1; i < activePages.length - 1; i += 2) {
        list.push({
          step: Math.floor(i / 2) + 2,
          label: `Page ${i + 1}-${i + 2}`,
          pages: [activePages[i], activePages[i + 1]],
        });
      }
      if (activePages.length % 2 === 0 && activePages.length > 2) {
        list.push({
          step: list.length + 1,
          label: `Page ${activePages.length}`,
          pages: [activePages[activePages.length - 1]],
        });
      }
    }
    return list;
  }, [activeModalBook, activePages]);

  useEffect(() => {
    modalAudioRef.current = new Audio(softCoverAudio);
    bgAudioRef.current = new Audio(audioTrack);
    bgAudioRef.current.loop = true;

    return () => {
      if (modalAudioRef.current) {
        modalAudioRef.current.pause();
        modalAudioRef.current = null;
      }
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    };
  }, []);

  // Control background music on modal open / mute toggle
  useEffect(() => {
    if (activeModalBook && !isMuted) {
      if (bgAudioRef.current) {
        bgAudioRef.current.play().catch(() => { });
      }
    } else {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
    }
  }, [activeModalBook, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (bgAudioRef.current) {
        if (next) {
          bgAudioRef.current.pause();
        } else if (activeModalBook) {
          bgAudioRef.current.play().catch(() => { });
        }
      }
      return next;
    });
  }, [activeModalBook]);

  const playFlipSound = useCallback(() => {
    if (!isMuted && modalAudioRef.current) {
      modalAudioRef.current.currentTime = 0;
      modalAudioRef.current.play().catch(() => { });
    }
  }, [isMuted]);

  const updateStepFromPage = useCallback((pageIndex) => {
    let step = 1;
    if (activeModalBook?.isFood) {
      if (pageIndex >= 7) step = 5;
      else if (pageIndex >= 5) step = 4;
      else if (pageIndex >= 3) step = 3;
      else if (pageIndex >= 1) step = 2;
      else step = 1;

      setModalActiveStep(step);
      modalActiveStepRef.current = step;

      if (pageIndex === 0) setModalCoverState('front');
      else if (pageIndex >= 7) setModalCoverState('back');
      else setModalCoverState('open');
    } else if (activeModalBook?.isDress || activeModalBook?.isHospital || activeModalBook?.isTravel || activeModalBook?.isCompany) {
      // 6 pages: 0 (front cover), 1-2 (spread 1), 3-4 (spread 2), 5 (back cover)
      if (pageIndex >= 5) step = 4;
      else if (pageIndex >= 3) step = 3;
      else if (pageIndex >= 1) step = 2;
      else step = 1;

      setModalActiveStep(step);
      modalActiveStepRef.current = step;

      if (pageIndex === 0) setModalCoverState('front');
      else if (pageIndex >= 5) setModalCoverState('back');
      else setModalCoverState('open');
    } else if (activePages.length === 8) {
      if (pageIndex >= 7) step = 5;
      else if (pageIndex >= 5) step = 4;
      else if (pageIndex >= 3) step = 3;
      else if (pageIndex >= 1) step = 2;
      else step = 1;

      setModalActiveStep(step);
      modalActiveStepRef.current = step;

      if (pageIndex === 0) setModalCoverState('front');
      else if (pageIndex >= 7) setModalCoverState('back');
      else setModalCoverState('open');
    } else {
      if (pageIndex >= 4) step = 3;
      else if (pageIndex >= 2) step = 2;
      else step = 1;
      setModalActiveStep(step);
      modalActiveStepRef.current = step;
    }
  }, [activeModalBook, activePages.length]);

  // Reset thumbnail view and state when active book changes
  useEffect(() => {
    setShowThumbnails(false);
  }, [activeModalBook]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);
      if (modalBookRef.current) {
        const pageFlipObj = modalBookRef.current.pageFlip();
        if (pageFlipObj && typeof pageFlipObj.update === 'function') {
          setTimeout(() => {
            pageFlipObj.update();
          }, 80);
          setTimeout(() => {
            pageFlipObj.update();
          }, 250);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [updateStepFromPage]);

  // When toggling thumbnails, trigger pageFlip update after layout settles so the flipbook stays perfectly centered
  useEffect(() => {
    if (modalBookRef.current) {
      const pageFlipObj = modalBookRef.current.pageFlip();
      if (pageFlipObj) {
        const sync = () => {
          if (typeof pageFlipObj.getCurrentPageIndex === 'function') {
            const cur = pageFlipObj.getCurrentPageIndex();
            updateStepFromPage(cur);
          }
          if (typeof pageFlipObj.update === 'function') {
            pageFlipObj.update();
          }
        };
        setTimeout(sync, 60);
        setTimeout(sync, 250);
      }
    }
  }, [showThumbnails, updateStepFromPage]);

  const toggleFullScreen = useCallback(() => {
    const elem = modalContainerRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => { });
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  }, []);

  const flipToStep = useCallback((stepNumber) => {
    if (!modalBookRef.current) return;
    const pageFlipObj = modalBookRef.current.pageFlip();
    if (!pageFlipObj) return;

    let targetPageIndex = 0;
    if (activeModalBook?.isFood) {
      if (stepNumber === 1) targetPageIndex = 0;
      else if (stepNumber === 2) targetPageIndex = 1;
      else if (stepNumber === 3) targetPageIndex = 3;
      else if (stepNumber === 4) targetPageIndex = 5;
      else if (stepNumber === 5) targetPageIndex = 7;
    } else if (activeModalBook?.isDress || activeModalBook?.isHospital || activeModalBook?.isTravel || activeModalBook?.isCompany) {
      if (stepNumber === 1) targetPageIndex = 0;
      else if (stepNumber === 2) targetPageIndex = 1;
      else if (stepNumber === 3) targetPageIndex = 3;
      else if (stepNumber === 4) targetPageIndex = 5;
    } else if (activePages.length === 8) {
      if (stepNumber === 1) targetPageIndex = 0;
      else if (stepNumber === 2) targetPageIndex = 1;
      else if (stepNumber === 3) targetPageIndex = 3;
      else if (stepNumber === 4) targetPageIndex = 5;
      else if (stepNumber === 5) targetPageIndex = 7;
    } else {
      if (stepNumber === 1) targetPageIndex = 0;
      else if (stepNumber === 2) targetPageIndex = 2;
      else if (stepNumber === 3) targetPageIndex = 4;
    }

    const currentStep = modalActiveStepRef.current;
    if (currentStep === stepNumber) return;

    setModalActiveStep(stepNumber);
    modalActiveStepRef.current = stepNumber;

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

    playFlipSound();
  }, [activeModalBook, playFlipSound, activePages.length, totalSteps]);

  const flipNext = useCallback(() => {
    if (modalActiveStepRef.current < totalSteps) {
      flipToStep(modalActiveStepRef.current + 1);
    }
  }, [flipToStep, totalSteps]);

  const flipPrev = useCallback(() => {
    if (modalActiveStepRef.current > 1) {
      flipToStep(modalActiveStepRef.current - 1);
    }
  }, [flipToStep]);

  // Autoplay handler: auto flip through pages, and when last page is reached, turn off play and return to page 1
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying && activeModalBook) {
      playIntervalRef.current = setInterval(() => {
        const current = modalActiveStepRef.current;
        if (current >= totalSteps) {
          // Reached the last page: stop autoplay and return to 1st page
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
  }, [isPlaying, activeModalBook, flipToStep, totalSteps]);

  // Reset autoplay and step on modal close
  useEffect(() => {
    if (!activeModalBook) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setModalActiveStep(1);
      setModalPage(1);
      modalActiveStepRef.current = 1;
      setModalCoverState('front');
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }
    } else {
      setModalActiveStep(1);
      setModalPage(1);
      modalActiveStepRef.current = 1;
      setModalCoverState('front');
    }
  }, [activeModalBook]);

  const onBookFlip = useCallback((e) => {
    const pageIndex = e.data;
    setModalPage(pageIndex + 1);
    updateStepFromPage(pageIndex);
    playFlipSound();
  }, [playFlipSound, updateStepFromPage]);

  // Handle wheel scrolling inside modal to flip pages
  const handleModalWheel = useCallback((e) => {
    if (!modalBookRef.current) return;
    const pageFlipObj = modalBookRef.current.pageFlip();
    if (!pageFlipObj) return;

    e.preventDefault();
    e.stopPropagation();

    if (isWheelingRef.current) return;

    if (e.deltaY > 0) {
      // scroll down -> flip next
      if (modalActiveStepRef.current < totalSteps) {
        isWheelingRef.current = true;
        flipToStep(modalActiveStepRef.current + 1);
        setTimeout(() => {
          isWheelingRef.current = false;
        }, 600);
      }
    } else if (e.deltaY < 0) {
      // scroll up -> flip prev
      if (modalActiveStepRef.current > 1) {
        isWheelingRef.current = true;
        flipToStep(modalActiveStepRef.current - 1);
        setTimeout(() => {
          isWheelingRef.current = false;
        }, 600);
      }
    }
  }, [flipToStep, totalSteps]);

  const books = [
    {
      id: 0,
      title: "Beyond the",
      subtitle: "Plate",
      cover: demoBook1,
      isFood: true,
      headerTitle: "BEYOND THE PLATE",
    },
    {
      id: 1,
      title: "Fashion",
      subtitle: "Collection",
      cover: demoBook2,
      isDress: true,
      headerTitle: "FASHION COLLECTION",
    },
    {
      id: 2,
      title: "Explore",
      subtitle: "Travel",
      cover: demoBook4,
      isTravel: true,
      headerTitle: "EXPLORE TRAVEL",
    },
    {
      id: 3,
      title: "Medical",
      subtitle: "Solutions",
      cover: demoBook3,
      isHospital: true,
      headerTitle: "MEDICAL SOLUTIONS",
    },
    {
      id: 4,
      title: "Beyond",
      subtitle: "Machinery",
      cover: demoBook5,
      isCompany: true,
      headerTitle: "BEYOND MACHINERY",
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
      transition={{ duration: 0.6 }}
      id="interactive-demo-section"
      className="w-full bg-[#F6F6F6] pt-5 pb-6 sm:pt-6 sm:pb-8 lg:pt-[1.5vw] lg:pb-[1.8vw] px-6 sm:px-8 md:px-10 lg:px-[4.2vw] font-poppins select-none [--book-shadow:2px_4px_7px_rgba(0,0,0,0.18)] sm:[--book-shadow:4px_7px_12px_rgba(0,0,0,0.22)] lg:[--book-shadow:8px_14px_20px_rgba(0,0,0,0.28)] [--book-shadow-hover:4px_6px_10px_rgba(0,0,0,0.24)] sm:[--book-shadow-hover:6px_10px_16px_rgba(0,0,0,0.28)] lg:[--book-shadow-hover:10px_18px_24px_rgba(0,0,0,0.36)]"
    >
      {/* Top Header Tag: Single Line like other sections */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center justify-start gap-2.5 sm:gap-3.5 lg:gap-[0.9vw] pt-2.5 sm:pt-3.5 lg:pt-[2.2vh] mb-3 sm:mb-4 lg:mb-[1.8vh] flex-shrink-0"
      >
        <span className="text-[11px] sm:text-xs lg:text-[0.85vw] font-bold tracking-[0.24em] text-[#35363A] uppercase whitespace-nowrap">
          INTERACTIVE CATALOGUE DEMO
        </span>
        <div className="w-10 sm:w-14 lg:w-[3.6vw] h-[1.5px] lg:h-[0.15vh] bg-[#35363A]"></div>
      </motion.div>

      <div className="w-full mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 lg:gap-[4.2vw]">

        {/* Left Column: Heading, Subtitle & Description */}
        <div
          className="w-full lg:w-[26%] flex flex-col text-left items-start shrink-0"
        >
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-[48px] lg:text-[3.1vw] font-bold text-[#1f2937] font-sans leading-[1.08] sm:leading-[1.05] md:leading-[1.05] lg:leading-[1.1] tracking-tight text-left"
          >
            <span>Explore</span> <br />
            <span className="text-[#E75B3E]">Demo</span> <br />
            <span>Books</span>
          </motion.h2>

          {/* Thin Divider Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-32 sm:w-full max-w-[220px] lg:max-w-[15.5vw] h-[1px] bg-[#d2d4d8] mt-3 sm:mt-5 lg:mt-[1.4vw] mb-3 sm:mb-4 lg:mb-[1.2vw] origin-left self-start"
          ></motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.85, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="text-[12px] sm:text-[13px] md:text-[13.5px] lg:text-[0.8vw] text-[#6d7178] font-normal leading-[165%] text-left w-full max-w-full sm:max-w-[480px] lg:max-w-[18vw]"
          >
            Explore interactive demo catalogues featuring realistic page flips, videos, and 3D experiences. Discover how FlipiBook brings digital content to life.
          </motion.p>
        </div>

        {/* Right Column: 5 Standing Books with Staggered Entrance */}
        <div className="w-full lg:flex-1 flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6 md:gap-3 lg:gap-[1.2vw] xl:gap-[1.4vw] overflow-visible pb-2 sm:pb-3 lg:pb-0 px-2 sm:px-4 lg:px-2 -mt-2 sm:-mt-3 md:-mt-4 lg:-mt-[1.2vw] xl:-mt-[1.5vw]">
          {/* Top Row on Mobile: 3 Books */}
          <div className="w-full flex items-start justify-center gap-4 sm:gap-6 md:contents">
            {books.slice(0, 3).map((book, idx) => {
              const isHovered = selectedBook === idx;
              const isFirstBook = idx === 0;
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setSelectedBook(idx)}
                  onMouseLeave={() => setSelectedBook(null)}
                  onClick={() => setActiveModalBook(book)}
                  className="flex flex-col items-center flex-1 max-w-[85px] xs:max-w-[100px] sm:max-w-[115px] md:max-w-[135px] lg:max-w-[145px] xl:max-w-[155px] cursor-pointer group transition-all duration-300"
                >
                  <div className="relative w-full flex flex-col items-center">
                    <div
                      className={`relative z-10 w-full flex items-center justify-center transition-transform duration-300 transform ${isHovered ? '-translate-y-1.5 sm:-translate-y-2 scale-[1.025]' : 'hover:-translate-y-1'
                        }`}
                    >
                      <img
                        src={book.cover}
                        alt={`${book.title} ${book.subtitle}`}
                        className="w-full max-w-[80px] xs:max-w-[95px] sm:max-w-[110px] md:max-w-[130px] lg:max-w-[140px] xl:max-w-[150px] h-auto aspect-[595/842] object-contain select-none pointer-events-none rounded-[3px] border border-black/[0.08] transition-all duration-300"
                        style={{
                          filter: isHovered
                            ? 'drop-shadow(var(--book-shadow-hover, 5px 8px 12px rgba(0, 0, 0, 0.28)))'
                            : 'drop-shadow(var(--book-shadow, 3px 5px 9px rgba(0, 0, 0, 0.20)))',
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-2.5 md:mt-3 lg:mt-[0.7vw] text-center select-none flex flex-col items-center w-full px-0.5">
                    <h4 className="text-[10.5px] sm:text-[11.5px] md:text-[12.5px] lg:text-[0.82vw] font-semibold text-[#2c2f35] tracking-tight sm:tracking-wide leading-tight sm:leading-snug truncate max-w-full">
                      {book.title}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[0.72vw] font-normal text-[#5a5e65] tracking-tight sm:tracking-wide leading-tight sm:leading-snug mt-0.5 truncate max-w-full">
                      {book.subtitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Row on Mobile: 2 Books centered */}
          <div className="w-full flex items-start justify-center gap-4 sm:gap-6 md:contents">
            {books.slice(3, 5).map((book, sliceIdx) => {
              const idx = sliceIdx + 3;
              const isHovered = selectedBook === idx;
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setSelectedBook(idx)}
                  onMouseLeave={() => setSelectedBook(null)}
                  onClick={() => setActiveModalBook(book)}
                  className="flex flex-col items-center flex-1 max-w-[85px] xs:max-w-[100px] sm:max-w-[115px] md:max-w-[135px] lg:max-w-[145px] xl:max-w-[155px] cursor-pointer group transition-all duration-300"
                >
                  <div className="relative w-full flex flex-col items-center">
                    <div
                      className={`relative z-10 w-full flex items-center justify-center transition-transform duration-300 transform ${isHovered ? '-translate-y-1.5 sm:-translate-y-2 scale-[1.025]' : 'hover:-translate-y-1'
                        }`}
                    >
                      <img
                        src={book.cover}
                        alt={`${book.title} ${book.subtitle}`}
                        className="w-full max-w-[80px] xs:max-w-[95px] sm:max-w-[110px] md:max-w-[130px] lg:max-w-[140px] xl:max-w-[150px] h-auto aspect-[595/842] object-contain select-none pointer-events-none rounded-[3px] border border-black/[0.08] transition-all duration-300"
                        style={{
                          filter: isHovered
                            ? 'drop-shadow(var(--book-shadow-hover, 5px 8px 12px rgba(0, 0, 0, 0.28)))'
                            : 'drop-shadow(var(--book-shadow, 3px 5px 9px rgba(0, 0, 0, 0.20)))',
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-2.5 md:mt-3 lg:mt-[0.7vw] text-center select-none flex flex-col items-center w-full px-0.5">
                    <h4 className="text-[10.5px] sm:text-[11.5px] md:text-[12.5px] lg:text-[0.82vw] font-semibold text-[#2c2f35] tracking-tight sm:tracking-wide leading-tight sm:leading-snug truncate max-w-full">
                      {book.title}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[0.72vw] font-normal text-[#5a5e65] tracking-tight sm:tracking-wide leading-tight sm:leading-snug mt-0.5 truncate max-w-full">
                      {book.subtitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal with Augmented Reality / Interactive Digital Catalogue Flipbook */}
      <AnimatePresence>
        {activeModalBook && (
          <div
            className={`fixed inset-0 z-[1000] flex items-center justify-center ${isFullScreen ? 'p-0' : 'p-3 pt-[6vh] sm:p-[2vw] sm:pt-[7vh]'} bg-black/60 backdrop-blur-sm`}
          >
            <motion.div
              ref={modalContainerRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              style={
                activeModalBook?.isFood
                  ? {
                    backgroundImage: `url(${foodbg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                  : activeModalBook?.isDress
                    ? {
                      backgroundImage: `url(${dressbg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                    : activeModalBook?.isHospital
                      ? {
                        backgroundImage: `url(${hospitalbg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                      : activeModalBook?.isTravel
                        ? {
                          backgroundImage: `url(${travelbg})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                        : activeModalBook?.isCompany
                          ? {
                            backgroundImage: `url(${companybg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                          : {}
              }
              className={`relative w-full ${isFullScreen
                  ? 'max-w-none w-screen h-screen max-h-none rounded-none p-0'
                  : 'max-w-[96vw] sm:max-w-[90vw] lg:max-w-[74vw] xl:max-w-[70vw] rounded-2xl shadow-2xl p-0 h-[82dvh] sm:h-[84vh] max-h-[86vh]'
                } bg-white flex flex-col items-center justify-between overflow-hidden`}
              onClick={(e) => {
                e.stopPropagation();
                // Close thumbnails when clicking background area of modal
                if (showThumbnails) setShowThumbnails(false);
              }}
              onWheel={handleModalWheel}
            >
              {/* Modal Top Header Bar */}
              {isCustomBook ? (
                <div
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 z-30"
                  style={{
                    backgroundColor: themeBgColor,
                    color: themeTextColor,
                    borderBottom: `1px solid ${themeBorderColor}`
                  }}
                >
                  <h3
                    className="text-xs sm:text-sm font-bold tracking-wider uppercase select-none"
                    style={{ color: themeTextColor }}
                  >
                    {activeModalBook?.headerTitle || (activeModalBook?.isFood ? "FOOD PRODUCTS" : "FASHION PRODUCTS")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveModalBook(null)}
                    className="hover:opacity-70 transition-opacity p-1 cursor-pointer"
                    style={{ color: themeTextColor }}
                    aria-label="Close modal"
                  >
                    <Icon icon="lucide:x" className={isFullScreen ? "w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" : "w-5 h-5 stroke-[2.5]"} />
                  </button>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between border-b border-gray-100 pb-2 mb-2 pr-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#EC5137] uppercase">
                      Interactive Catalogue Demo
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {activeModalBook.title} {activeModalBook.subtitle}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-400 hidden sm:inline-block">
                    Scroll or click page to flip
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveModalBook(null)}
                    className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Icon icon="lucide:x" className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Flipbook Container with Left & Right Floating Arrows */}
              <div className="relative w-full flex-1 flex items-center justify-center px-8 sm:px-14 py-2 sm:py-4 overflow-hidden">
                {/* Left Navigation Arrow */}
                <button
                  type="button"
                  onClick={flipPrev}
                  disabled={modalActiveStep <= 1}
                  className={`absolute left-1 sm:left-3 z-20 flex items-center justify-center transition-all cursor-pointer ${isCustomBook
                      ? modalActiveStep <= 1
                        ? 'cursor-not-allowed opacity-30'
                        : 'hover:scale-110 active:scale-95'
                      : modalActiveStep <= 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full'
                        : 'bg-white hover:bg-gray-50 text-gray-800 hover:text-[#EC5137] hover:scale-105 active:scale-95 w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-md'
                    }`}
                  style={isCustomBook ? { color: themeColor } : undefined}
                  aria-label="Previous Page"
                >
                  <Icon
                    icon="lucide:chevron-left"
                    className={
                      isFullScreen
                        ? 'w-9 h-9 sm:w-10 sm:h-10 stroke-[2.5]'
                        : 'w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]'
                    }
                  />
                </button>

                {/* Flipbook Canvas */}
                <div
                  className={`relative mx-auto aspect-[595/842] sm:aspect-[420/297] flex items-center justify-center ${isFullScreen
                      ? 'w-[min(80vw,62vh)] sm:w-[min(95vw,116vh)] h-auto'
                      : 'w-[min(76vw,52dvh)] sm:w-[min(80vw,87vh)] h-auto'
                    }`}
                >
                  <div
                    key={`${activeModalBook?.id || 'modal-book'}-${isFullScreen ? 'fullscreen' : 'modal'}`}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <TurnBook
                      ref={modalBookRef}
                      pages={activePages}
                      width={595}
                      height={842}
                      duration={900}
                      startPage={
                        isMobileView
                        ? modalPage - 1
                        : activeModalBook?.isFood
                        ? modalActiveStep === 1 ? 0 : modalActiveStep === 2 ? 1 : modalActiveStep === 3 ? 3 : modalActiveStep === 4 ? 5 : 7
                        : activeModalBook?.isDress || activeModalBook?.isHospital || activeModalBook?.isTravel || activeModalBook?.isCompany
                        ? modalActiveStep === 1 ? 0 : modalActiveStep === 2 ? 1 : modalActiveStep === 3 ? 3 : 5
                        : 0
                      }
                      onFlip={onBookFlip}
                      className="mx-auto"
                    />
                  </div>
                </div>

                {/* Right Navigation Arrow */}
                <button
                  type="button"
                  onClick={flipNext}
                  disabled={modalActiveStep >= totalSteps}
                  className={`absolute right-1 sm:right-3 z-20 flex items-center justify-center transition-all cursor-pointer ${isCustomBook
                      ? modalActiveStep >= totalSteps
                        ? 'cursor-not-allowed opacity-30'
                        : 'hover:scale-110 active:scale-95'
                      : modalActiveStep >= totalSteps
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full'
                        : 'bg-white hover:bg-gray-50 text-gray-800 hover:text-[#EC5137] hover:scale-105 active:scale-95 w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-md'
                    }`}
                  style={isCustomBook ? { color: themeColor } : undefined}
                  aria-label="Next Page"
                >
                  <Icon
                    icon="lucide:chevron-right"
                    className={
                      isFullScreen
                        ? 'w-9 h-9 sm:w-10 sm:h-10 stroke-[2.5]'
                        : 'w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]'
                    }
                  />
                </button>
              </div>

              {/* Bottom Controls Bar */}
              {isCustomBook ? (
                <div className="w-full relative z-30">
                  {/* Dress & Travel Collections: Vertical 2-Column Sidebar Drawer (Grid6 style matching Screenshot 2) */}
                  {(activeModalBook?.isDress || activeModalBook?.isTravel) ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute bottom-full left-3 sm:left-6 pb-2 transition-all duration-300 ease-in-out z-50 ${
                        showThumbnails
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 translate-y-3 pointer-events-none'
                      }`}
                    >
                      <div className="w-64 sm:w-72 bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-white/60 p-3 flex flex-col max-h-[65vh]">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10">
                          <span className="text-xs sm:text-sm font-bold text-gray-800 tracking-tight">Thumbnails</span>
                          <button
                            type="button"
                            onClick={() => setShowThumbnails(false)}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="Close thumbnails"
                          >
                            <Icon icon="lucide:x" className="w-4 h-4" />
                          </button>
                        </div>

                        {/* 2-Column Staggered Grid Spreads */}
                        <div className="flex-1 overflow-y-auto pr-1 flex gap-2 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
                          {/* Left Column (Page 1, Page 4-5) */}
                          <div className="flex-1 flex flex-col gap-2">
                            {spreads.filter((_, i) => i % 2 === 0).map((spread, idx) => {
                              const isActive = modalActiveStep === spread.step;
                              const isDouble = spread.pages.length === 2;
                              return (
                                <button
                                  key={`l-${idx}`}
                                  type="button"
                                  onClick={() => flipToStep(spread.step)}
                                  className={`w-full bg-white rounded-lg p-1.5 flex flex-col items-center border transition-all duration-200 cursor-pointer text-left ${
                                    isActive
                                      ? 'shadow-md ring-2 scale-[1.02]'
                                      : 'border-gray-200 hover:border-gray-300 hover:shadow-xs hover:scale-[1.01]'
                                  }`}
                                  style={isActive ? { borderColor: themeColor, outlineColor: themeColor } : undefined}
                                >
                                  <div className="w-full aspect-[420/297] rounded bg-gray-50 overflow-hidden flex items-center justify-center border border-black/5">
                                    {isDouble ? (
                                      <div className="w-full h-full flex">
                                        <img src={spread.pages[0]} alt="left" className="w-1/2 h-full object-cover select-none pointer-events-none" />
                                        <img src={spread.pages[1]} alt="right" className="w-1/2 h-full object-cover select-none pointer-events-none border-l border-black/10" />
                                      </div>
                                    ) : (
                                      <img src={spread.pages[0]} alt="cover" className="h-full aspect-[595/842] object-contain select-none pointer-events-none shadow-2xs" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-[10px] font-medium mt-1.5 leading-none ${isActive ? 'font-bold' : 'text-gray-600'}`}
                                    style={isActive ? { color: themeColor } : undefined}
                                  >
                                    {spread.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Column (Page 2-3, Page 6) */}
                          <div className="flex-1 flex flex-col gap-2 pt-4">
                            {spreads.filter((_, i) => i % 2 !== 0).map((spread, idx) => {
                              const isActive = modalActiveStep === spread.step;
                              const isDouble = spread.pages.length === 2;
                              return (
                                <button
                                  key={`r-${idx}`}
                                  type="button"
                                  onClick={() => flipToStep(spread.step)}
                                  className={`w-full bg-white rounded-lg p-1.5 flex flex-col items-center border transition-all duration-200 cursor-pointer text-left ${
                                    isActive
                                      ? 'shadow-md ring-2 scale-[1.02]'
                                      : 'border-gray-200 hover:border-gray-300 hover:shadow-xs hover:scale-[1.01]'
                                  }`}
                                  style={isActive ? { borderColor: themeColor, outlineColor: themeColor } : undefined}
                                >
                                  <div className="w-full aspect-[420/297] rounded bg-gray-50 overflow-hidden flex items-center justify-center border border-black/5">
                                    {isDouble ? (
                                      <div className="w-full h-full flex">
                                        <img src={spread.pages[0]} alt="left" className="w-1/2 h-full object-cover select-none pointer-events-none" />
                                        <img src={spread.pages[1]} alt="right" className="w-1/2 h-full object-cover select-none pointer-events-none border-l border-black/10" />
                                      </div>
                                    ) : (
                                      <img src={spread.pages[0]} alt="cover" className="h-full aspect-[595/842] object-contain select-none pointer-events-none shadow-2xs" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-[10px] font-medium mt-1.5 leading-none ${isActive ? 'font-bold' : 'text-gray-600'}`}
                                    style={isActive ? { color: themeColor } : undefined}
                                  >
                                    {spread.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Floating Page Thumbnails Carousel for other books */
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute bottom-full left-0 w-full flex justify-center px-4 pb-2 transition-all duration-300 ease-in-out ${showThumbnails ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
                        }`}
                    >
                      <div className="bg-[#5c5c5c]/90 backdrop-blur-md rounded-2xl shadow-2xl p-2 sm:p-2.5 flex items-center gap-2 max-w-full border border-white/10">
                        {/* Left scroll chevron */}
                        <button
                          type="button"
                          onClick={() => {
                            if (thumbCarouselRef.current) {
                              thumbCarouselRef.current.scrollBy({ left: -140, behavior: 'smooth' });
                            }
                          }}
                          className="p-1 rounded-full bg-white/15 hover:bg-white/30 text-white shadow-xs transition-all cursor-pointer shrink-0"
                          title="Scroll thumbnails left"
                        >
                          <Icon icon="lucide:chevron-left" className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Thumbnails list */}
                        <div
                          ref={thumbCarouselRef}
                          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-0.5 px-1 scroll-smooth max-w-[80vw] sm:max-w-[700px]"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {spreads.map((spread, idx) => {
                            const isActive = modalActiveStep === spread.step;
                            const isDouble = spread.pages.length === 2;

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  flipToStep(spread.step);
                                }}
                                className={`relative flex-shrink-0 group flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all duration-200 cursor-pointer ${isActive
                                    ? 'bg-white shadow-md ring-2 ring-white scale-102'
                                    : 'bg-white/40 hover:bg-white/70 hover:scale-101 opacity-75 hover:opacity-100'
                                  }`}
                                title={`Jump to ${spread.label}`}
                              >
                                <div className="w-20 sm:w-24 h-14 sm:h-16 rounded-md overflow-hidden bg-white shadow-xs border border-black/10 flex items-center justify-center">
                                  {isDouble ? (
                                    <div className="w-full h-full flex items-center">
                                      <div className="w-1/2 h-full border-r border-black/10 overflow-hidden">
                                        <img
                                          src={spread.pages[0]}
                                          alt={`${spread.label} left`}
                                          className="w-full h-full object-cover select-none pointer-events-none"
                                        />
                                      </div>
                                      <div className="w-1/2 h-full overflow-hidden">
                                        <img
                                          src={spread.pages[1]}
                                          alt={`${spread.label} right`}
                                          className="w-full h-full object-cover select-none pointer-events-none"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100/60">
                                      <img
                                        src={spread.pages[0]}
                                        alt={spread.label}
                                        className="h-full aspect-[595/842] object-contain shadow-xs border border-black/10 select-none pointer-events-none"
                                      />
                                    </div>
                                  )}
                                </div>
                                <span
                                  className={`text-[9px] sm:text-[10px] font-semibold leading-none pt-0.5 ${isActive ? 'text-gray-900 font-bold' : 'text-white'
                                    }`}
                                >
                                  {spread.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Right scroll chevron */}
                        <button
                          type="button"
                          onClick={() => {
                            if (thumbCarouselRef.current) {
                              thumbCarouselRef.current.scrollBy({ left: 140, behavior: 'smooth' });
                            }
                          }}
                          className="p-1 rounded-full bg-white/15 hover:bg-white/30 text-white shadow-xs transition-all cursor-pointer shrink-0"
                          title="Scroll thumbnails right"
                        >
                          <Icon icon="lucide:chevron-right" className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Light Bottom Bar */}
                  <div
                    className="w-full px-2 sm:px-5 py-2.5 flex items-center justify-between"
                    style={{
                      backgroundColor: themeBgColor,
                      color: themeTextColor,
                      borderTop: `1px solid ${themeBorderColor}`
                    }}
                  >
                    {/* Left: Table of contents & Thumbnail Grid Icons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setShowThumbnails((prev) => !prev)}
                        className={`p-1.5 rounded-md hover:bg-black/5 transition-all cursor-pointer ${showThumbnails ? 'bg-black/10' : ''
                          }`}
                        style={{ color: themeTextColor }}
                        title={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
                      >
                        <Icon icon="lucide:layout-grid" className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {/* Center: Play/Pause, Step controls & Progress */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl mx-2 sm:mx-4">
                      {/* Backward / First Page Button */}
                      <button
                        type="button"
                        onClick={() => flipToStep(1)}
                        disabled={modalActiveStep <= 1}
                        className="hover:opacity-75 transition-opacity hidden sm:flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ color: themeTextColor }}
                        title="First Page (Backward)"
                      >
                        <Icon icon="lucide:skip-back" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </button>

                      {/* Play / Pause Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setIsPlaying((prev) => !prev)}
                        className="hover:opacity-75 transition-opacity flex items-center justify-center cursor-pointer shrink-0"
                        style={{ color: themeTextColor }}
                        title={isPlaying ? "Pause autoplay" : "Play flipbook"}
                      >
                        {isPlaying ? (
                          <Icon icon="lucide:pause" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        ) : (
                          <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
                            <path d="M7 4.5v15l12-7.5-12-7.5z" />
                          </svg>
                        )}
                      </button>

                      {/* Forward / Last Page Button */}
                      <button
                        type="button"
                        onClick={() => flipToStep(totalSteps)}
                        disabled={modalActiveStep >= totalSteps}
                        className="hover:opacity-75 transition-opacity hidden sm:flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ color: themeTextColor }}
                        title="Last Page (Forward)"
                      >
                        <Icon icon="lucide:skip-forward" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </button>

                      {/* Progress Bar */}
                      <div
                        className="flex-1 min-w-[60px] h-1.5 bg-black/10 hover:bg-black/15 rounded-full cursor-pointer relative flex items-center transition-colors"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const pct = clickX / rect.width;
                          const targetStep = Math.min(totalSteps, Math.max(1, Math.round(pct * (totalSteps - 1)) + 1));
                          flipToStep(targetStep);
                        }}
                        title="Click to seek"
                      >
                        <div
                          className="h-full relative rounded-full"
                          style={{
                            backgroundColor: themeTextColor,
                            width: isMobileView
                              ? `${((modalPage - 1) / Math.max(1, activePages.length - 1)) * 100}%`
                              : `${((modalActiveStep - 1) / Math.max(1, totalSteps - 1)) * 100}%`,
                          }}
                        >
                          <div
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full shadow-sm pointer-events-none"
                            style={{ backgroundColor: themeTextColor }}
                          />
                        </div>
                      </div>

                      {/* Page Counter */}
                      <span
                        className="text-[11px] sm:text-xs font-semibold tracking-wider shrink-0 select-none"
                        style={{ color: themeTextColor }}
                      >
                        {isMobileView ? (
                          `${String(Math.min(modalPage, activePages.length)).padStart(2, '0')} / ${String(activePages.length).padStart(2, '0')}`
                        ) : activeModalBook?.isDress || activeModalBook?.isHospital || activeModalBook?.isTravel || activeModalBook?.isCompany ? (
                          modalActiveStep === 1
                            ? "01 / 06"
                            : modalActiveStep === 2
                              ? "02 / 06"
                              : modalActiveStep === 3
                                ? "04 / 06"
                                : "06 / 06"
                        ) : activePages.length === 8 ? (
                          modalActiveStep === 1
                            ? "01 / 08"
                            : modalActiveStep === 2
                              ? "02 / 08"
                              : modalActiveStep === 3
                                ? "04 / 08"
                                : modalActiveStep === 4
                                  ? "06 / 08"
                                  : "08 / 08"
                        ) : (
                          `0${modalActiveStep} / 0${totalSteps}`
                        )}
                      </span>
                    </div>

                    {/* Right: Sound & Fullscreen */}
                    <div className="flex items-center gap-0.5 sm:gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-1.5 rounded-md hover:bg-black/5 transition-all cursor-pointer"
                        style={{ color: themeTextColor }}
                        title={isMuted ? "Unmute audio" : "Mute audio"}
                      >
                        <Icon icon={isMuted ? "lucide:volume-x" : "lucide:volume-2"} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={toggleFullScreen}
                        className="p-1.5 rounded-md hover:bg-black/5 transition-all cursor-pointer"
                        style={{ color: themeTextColor }}
                        title="Toggle fullscreen"
                      >
                        <Icon icon="lucide:maximize" className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full max-w-2xl flex items-center justify-center gap-3.5 mt-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EC5137] hover:bg-[#d84e37] text-white flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer shrink-0"
                    title={isPlaying ? "Pause autoplay" : "Play flipbook"}
                  >
                    <Icon icon={isPlaying ? "lucide:pause" : "lucide:play"} className="w-4 h-4 ml-0.5" />
                  </button>

                  <div
                    className="flex-1 h-1.5 bg-gray-200 hover:bg-gray-300 rounded-full cursor-pointer relative overflow-hidden transition-colors"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = clickX / rect.width;
                      const targetStep = Math.min(totalSteps, Math.max(1, Math.ceil(pct * totalSteps)));
                      flipToStep(targetStep);
                    }}
                    title="Click to jump to section"
                  >
                    <motion.div
                      className="h-full bg-[#EC5137] rounded-full"
                      animate={{ width: `${(modalActiveStep / totalSteps) * 100}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>

                  <span className="text-xs sm:text-[13px] font-semibold text-gray-700 tracking-wider shrink-0 min-w-[3rem] text-right">
                    {modalActiveStep} / {totalSteps}
                  </span>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="absolute -right-10 sm:-right-16 md:-right-24 bottom-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center shadow-sm transition-all active:scale-90 cursor-pointer"
                    title={isMuted ? "Unmute audio" : "Mute audio"}
                  >
                    <Icon icon={isMuted ? "lucide:volume-x" : "lucide:volume-2"} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

