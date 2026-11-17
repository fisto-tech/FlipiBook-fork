import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import SmartOrbitVisual from './SmartOrbitVisual';
import CotImage from '../../assets/Home/cot.png';
import HeartImage from '../../assets/Home/heart.png';
import HouseImage from '../../assets/Home/house.png';
import FurnitureImage from '../../assets/Home/furniture.png';
import MachineImage from '../../assets/Home/machine.png';

// 3D Model items in slider sequence starting with Cot
const MODEL_SLIDES = [
  { id: 'cot', src: CotImage, alt: 'Medical Hospital Bed Cot 3D Model' },
  { id: 'heart', src: HeartImage, alt: 'Interactive 3D Heart Model' },
  { id: 'house', src: HouseImage, alt: 'Architectural 3D House Model' },
  { id: 'furniture', src: FurnitureImage, alt: 'Modern Furniture 3D Model' },
  { id: 'machine', src: MachineImage, alt: 'Industrial Machine 3D Model' },
];

// Smart Solutions for Modern Industries Section Component
const SmartSolutionsSection = () => {
  const sectionRef = useRef(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Automatically switch models every 2 seconds (faster, instant cycle)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % MODEL_SLIDES.length);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full min-h-fit sm:min-h-0 sm:h-auto lg:h-[100vh] bg-[#FAFAFA] font-sans py-8 sm:py-6 lg:py-[1.2vw] px-4 sm:px-8 lg:px-[6vw] flex flex-col justify-between items-center overflow-hidden">

      {/* Top FEATURES Tag */}
      <div className="w-full flex items-center justify-between pointer-events-none select-none z-10 pt-1 lg:pt-[0.4vw]">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-[0.6vw] mt-5 sm:mt-7 lg:mt-[1.6vw]">
          <span className="text-[10px] sm:text-xs lg:text-[0.68vw] font-bold tracking-[0.16em] sm:tracking-[0.25em] text-[#35363A] uppercase">
            INTERACTIVE 3D PRODUCT VIEWER
          </span>
          <div className="w-6 sm:w-8 lg:w-[2.4vw] h-[1.5px] lg:h-[0.1vw] bg-[#35363A]/40"></div>
        </div>
      </div>

      {/* 1. BACKGROUND HEADING WITH TEXT SMOKE GRADIENT FADE + 3D MODEL VIEWER */}
      <div className="relative w-full flex justify-center pointer-events-none select-none z-0 lg:-mt-[1.2vw]">
        <div className="relative w-full flex flex-col sm:flex-row items-center justify-center">
          <motion.h2
            initial={{ opacity: 0, y: -25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="text-[34px] mt-2 sm:mt-0 xs:text-[34px] sm:text-6xl md:text-7xl lg:text-[6.2vw] font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-b from-[#cbd5e1] via-[#e2e8f0]/90 to-white/10 text-center leading-[1.15] sm:leading-tight w-full "
          >
            EXPLORE EVERY ANGLE
          </motion.h2>

          {/* 3D Model Viewer in Rage Italic / #EC5137 */}
          <motion.span
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="sm:absolute static -mt-1 sm:mt-2 md:mt-3 lg:mt-0 left-[62%] sm:left-[61%] lg:left-[61vw] lg:top-[5.5vw] sm:-bottom-3 md:-bottom-4 lg:bottom-auto italic text-2xl xs:text-3xl sm:text-4xl lg:text-[2.2vw] text-[#EC5137] tracking-wide pointer-events-none select-none z-20 whitespace-nowrap"
            style={{ fontFamily: "'Rage Italic', 'Rage', cursive" }}
          >
            3D Model Viewer
          </motion.span>
        </div>
      </div>

      {/* 2. CENTER & RIGHT MAIN CONTENT CONTAINER (Flex Row for Desktop) */}
      <div
        className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center justify-between lg:gap-[3vw] my-2 sm:my-2 lg:my-0"
      >

        {/* CENTER 3D MODEL & CIRCULAR ORBIT NAVIGATION */}
        <div className="relative w-full lg:w-[50vw] flex items-center justify-center min-h-[190px] sm:min-h-[260px] lg:h-[26vw] py-1 sm:py-2 lg:py-0">

          {/* Center 3D Model Sliding Images (Instant swap feel, no sliding) */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-[74vw] sm:w-[46vw] md:w-[42vw] lg:w-[35.5vw] xl:w-[37vw] flex flex-col items-center justify-center -mt-6 sm:-mt-8 md:-mt-10 lg:-mt-[11vw] xl:-mt-[11.5vw]"
          >
            <img
              key={MODEL_SLIDES[currentSlideIndex].id}
              src={MODEL_SLIDES[currentSlideIndex].src}
              alt={MODEL_SLIDES[currentSlideIndex].alt}
              className="w-full h-auto lg:w-[35.5vw] xl:w-[37vw] object-contain pointer-events-none select-none transition-none"
            />
          </motion.div>

          {/* Whole Orange Arch & Badges - Layered ABOVE the cot image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-[88vw] sm:w-[72vw] md:w-[68vw] lg:w-[37.5vw] h-auto lg:top-[6.1vw] pointer-events-none top-[-3vw] sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-[52%] z-30 select-none drop-shadow-[0_10px_20px_rgba(236,81,55,0.18)]"
          >
            <SmartOrbitVisual />
          </motion.div>
        </div>

        {/* RIGHT SIDE TEXT CONTENT */}
        <div
          className="w-full lg:w-[33vw] flex flex-col justify-center space-y-2.5 sm:space-y-2.5 lg:space-y-[0.8vw] text-center lg:text-left items-center lg:items-start z-10 px-4 lg:px-0 mt-4 sm:-mt-2 lg:-mt-[14.5vw] xl:-mt-[15vw] mb-6 sm:mb-4 lg:mb-0"
        >
          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-[45px] lg:text-[2.7vw] font-bold text-[#1f2937] leading-[1.12] tracking-tight font-sans text-center lg:text-left"
          >
            Let Customers <br className="block" />
            <span className="text-[#E75B3E]">Explore Every</span> <br className="block" />
            <span className="text-[#E75B3E]">Angle</span>
          </motion.h2>

          {/* Thin Black Accent Line under heading */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-12 lg:w-[2.8vw] h-[2px] lg:h-[0.16vw] bg-[#374151] rounded-full my-1.5 lg:my-[0.4vw] origin-left"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11.5px] sm:text-[14px] lg:text-[0.84vw] text-[#6b7280] font-normal leading-[1.6] w-full max-w-md lg:w-[24vw] text-left"
          >
            Bring your products into focus with FlipiBook’s <br className="hidden sm:block" />
            interactive 3D digital catalogues. Let customers <br className="hidden sm:block" />
            rotate models, zoom in on details, and click hotspots <br className="hidden sm:block" />
            to understand product features before making an inquiry.
          </motion.p>
        </div>
      </div>

      {/* 3. BOTTOM FEATURE CARDS (4 Boxes in Line) */}
      <div
        className="relative z-10 w-full max-w-xl lg:max-w-none lg:w-[84vw] xl:w-[82vw] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-2.5 lg:gap-[1vw] mt-2 sm:-mt-6 lg:-mt-[6vw] xl:-mt-[6.5vw] mb-4 sm:mb-4 lg:mb-[0.5vw] px-2 lg:px-0"
      >
        {/* CARD 1: Immersive 3D */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#E9EBEF] p-2.5 sm:p-3.5 lg:p-[0.7vw] rounded-xl lg:rounded-[0.75vw] border border-gray-300/60 shadow-sm flex items-center gap-2.5 sm:gap-3 lg:gap-[0.7vw]"
        >
          <div className="w-8.5 h-8.5 sm:w-11 sm:h-11 lg:w-[2.35vw] lg:h-[2.35vw] bg-white text-[#111827] rounded-lg sm:rounded-xl lg:rounded-[0.45vw] flex items-center justify-center shadow-xs shrink-0">
            <Icon icon="lucide:box" className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 lg:w-[1.25vw] lg:h-[1.25vw]" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className="text-[13px] sm:text-[16px] lg:text-[0.92vw] font-bold text-[#111827] mb-0.5 leading-snug">
              Immersive 3D
            </h3>
            <p className="text-[11px] sm:text-[13px] lg:text-[0.72vw] text-[#6B7280] leading-[1.3] truncate sm:whitespace-normal">
              Add depth with realistic models and smooth page-turn effects.
            </p>
          </div>
        </motion.div>

        {/* CARD 2: Augmented Reality (New 2nd Box) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#E9EBEF] p-2.5 sm:p-3.5 lg:p-[0.7vw] rounded-xl lg:rounded-[0.75vw] border border-gray-300/60 shadow-sm flex items-center gap-2.5 sm:gap-3 lg:gap-[0.7vw]"
        >
          <div className="w-8.5 h-8.5 sm:w-11 sm:h-11 lg:w-[2.35vw] lg:h-[2.35vw] bg-white text-[#111827] rounded-lg sm:rounded-xl lg:rounded-[0.45vw] flex items-center justify-center shadow-xs shrink-0">
            <Icon icon="lucide:scan" className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 lg:w-[1.25vw] lg:h-[1.25vw]" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className="text-[13px] sm:text-[16px] lg:text-[0.92vw] font-bold text-[#111827] mb-0.5 leading-snug">
              Augmented Reality
            </h3>
            <p className="text-[11px] sm:text-[13px] lg:text-[0.72vw] text-[#6B7280] leading-[1.3] truncate sm:whitespace-normal">
              Let readers place products into their space from any mobile browser.
            </p>
          </div>
        </motion.div>

        {/* CARD 3: Interactive Elements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#E9EBEF] p-2.5 sm:p-3.5 lg:p-[0.7vw] rounded-xl lg:rounded-[0.75vw] border border-gray-300/60 shadow-sm flex items-center gap-2.5 sm:gap-3 lg:gap-[0.7vw]"
        >
          <div className="w-8.5 h-8.5 sm:w-11 sm:h-11 lg:w-[2.35vw] lg:h-[2.35vw] bg-white text-[#111827] rounded-lg sm:rounded-xl lg:rounded-[0.45vw] flex items-center justify-center shadow-xs shrink-0">
            <Icon icon="mdi:cursor-default-click-outline" className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 lg:w-[1.25vw] lg:h-[1.25vw]" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className="text-[13px] sm:text-[16px] lg:text-[0.92vw] font-bold text-[#111827] mb-0.5 leading-snug">
              Interactive Elements
            </h3>
            <p className="text-[11px] sm:text-[13px] lg:text-[0.72vw] text-[#6B7280] leading-[1.3] truncate sm:whitespace-normal">
              Engage your users with rich interactive content.
            </p>
          </div>
        </motion.div>

        {/* CARD 4: Publish Anywhere */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#E9EBEF] p-2.5 sm:p-3.5 lg:p-[0.7vw] rounded-xl lg:rounded-[0.75vw] border border-gray-300/60 shadow-sm flex items-center gap-2.5 sm:gap-3 lg:gap-[0.7vw]"
        >
          <div className="w-8.5 h-8.5 sm:w-11 sm:h-11 lg:w-[2.35vw] lg:h-[2.35vw] bg-white text-[#111827] rounded-lg sm:rounded-xl lg:rounded-[0.45vw] flex items-center justify-center shadow-xs shrink-0">
            <Icon icon="lucide:globe" className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 lg:w-[1.25vw] lg:h-[1.25vw]" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className="text-[13px] sm:text-[16px] lg:text-[0.92vw] font-bold text-[#111827] mb-0.5 leading-snug">
              Publish Anywhere
            </h3>
            <p className="text-[11px] sm:text-[13px] lg:text-[0.72vw] text-[#6B7280] leading-[1.3] truncate sm:whitespace-normal">
              Share and publish across all platforms and devices.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SmartSolutionsSection;
