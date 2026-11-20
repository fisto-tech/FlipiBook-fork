import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import SmartOrbitVisual from './SmartOrbitVisual';
import CotImage from '../../assets/Home/SmartSolutions/cot.webp';
import HeartImage from '../../assets/Home/SmartSolutions/heart.webp';
import HouseImage from '../../assets/Home/SmartSolutions/house.webp';
import FurnitureImage from '../../assets/Home/SmartSolutions/furniture.webp';
import MachineImage from '../../assets/Home/SmartSolutions/machine.webp';

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

  // Automatically switch models every 2.6 seconds (crossfaded)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % MODEL_SLIDES.length);
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full min-h-fit sm:min-h-0 sm:h-auto lg:h-[100vh] bg-[#FAFAFA] font-sans pt-4 sm:pt-4 lg:pt-[0.6vw] pb-8 sm:pb-6 lg:pb-[1.2vw] px-4 sm:px-8 lg:px-[6vw] flex flex-col justify-between items-center overflow-hidden">

      {/* Top FEATURES Tag */}
      <div className="w-full flex items-center justify-between pointer-events-none select-none z-10 pt-2.5 sm:pt-3.5 lg:pt-[2.2vh] mb-2 sm:mb-3 lg:mb-[1.2vh] flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3.5 lg:gap-[0.9vw]">
          <span className="text-[11px] sm:text-xs lg:text-[0.85vw] font-bold tracking-[0.24em] text-[#35363A] uppercase">
            INTERACTIVE 3D PRODUCT VIEWER
          </span>
          <div className="w-10 sm:w-14 lg:w-[3.6vw] h-[1.5px] lg:h-[0.15vh] bg-[#35363A]"></div>
        </div>
      </div>

      {/* 1. BACKGROUND HEADING WITH TEXT SMOKE GRADIENT FADE + 3D MODEL VIEWER */}
      <div className="relative w-full flex justify-center pointer-events-none select-none z-0 mt-0 lg:-mt-[2.8vw]">
        <div className="relative w-full flex flex-col sm:flex-row items-center justify-center">
          <motion.h2
            initial={{ opacity: 0, y: -25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="text-[34px] mt-0 sm:mt-0 xs:text-[34px] sm:text-6xl md:text-7xl lg:text-[6.2vw] font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-b from-[#cbd5e1] via-[#e2e8f0]/90 to-white/10 text-center leading-[1.15] sm:leading-tight w-full "
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

          {/* Center 3D Model images — smooth crossfade between models */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-[78vw] sm:w-[49vw] md:w-[45vw] lg:w-[38vw] xl:w-[39.5vw] flex flex-col items-center justify-center -mt-2 sm:-mt-4 md:-mt-5 lg:-mt-[7.6vw] xl:-mt-[8vw]"
          >
            {/* All models stacked in one grid cell and cross-faded (no layout jump, preloaded) */}
            <div className="grid w-full place-items-center">
              {MODEL_SLIDES.map((slide, i) => {
                const isActive = i === currentSlideIndex;
                return (
                  <motion.img
                    key={slide.id}
                    src={slide.src}
                    alt={isActive ? slide.alt : ''}
                    aria-hidden={!isActive}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.96,
                      filter: isActive ? 'blur(0px)' : 'blur(4px)',
                    }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ gridArea: '1 / 1' }}
                    className="w-full h-auto lg:w-[38vw] xl:w-[39.5vw] object-contain pointer-events-none select-none"
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Whole Orange Arch & Badges - Layered ABOVE the cot image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-[93vw] sm:w-[76vw] md:w-[72vw] lg:w-[40vw] xl:w-[41.5vw] h-auto lg:top-[6.1vw] pointer-events-none top-[-2.5vw] sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-[52%] z-30 select-none drop-shadow-[0_10px_20px_rgba(236,81,55,0.18)]"
          >
            <SmartOrbitVisual />
          </motion.div>
        </div>

        {/* RIGHT SIDE TEXT CONTENT */}
        <div
          className="w-full lg:w-[33vw] flex flex-col justify-center space-y-2.5 sm:space-y-2.5 lg:space-y-[0.8vw] text-center lg:text-left items-center lg:items-start z-10 px-4 lg:px-0 lg:pl-[2.2vw] xl:pl-[2.8vw] mt-4 sm:mt-0 lg:-mt-[11.5vw] xl:-mt-[12vw] mb-6 sm:mb-4 lg:mb-0"
        >
          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-[48px] lg:text-[3.1vw] font-bold text-[#1f2937] leading-[1.12] tracking-tight font-sans text-center lg:text-left"
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

      {/* 3. BOTTOM FEATURE ITEMS (Clean Minimal Row with Red Dividers - matching Screenshot 2) */}
      <div
        className="relative z-10 w-full max-w-xl md:max-w-3xl lg:max-w-none lg:w-[86vw] xl:w-[84vw] mx-auto grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row items-center justify-between gap-6 md:gap-x-8 md:gap-y-6 lg:gap-2 mt-4 sm:-mt-4 lg:-mt-[5.5vw] xl:-mt-[6vw] mb-4 sm:mb-4 lg:mb-[1vw] px-4 lg:px-2"
      >
        {/* ITEM 1: Immersive 3D */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center gap-3 sm:gap-3.5 lg:gap-[0.9vw] text-left w-full"
        >
          <Icon
            icon="lucide:box"
            className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] text-[#b0b8c4] stroke-[1.5] shrink-0"
          />
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base lg:text-[0.92vw] font-bold text-[#1f2937] leading-tight">
              Immersive 3D
            </h3>
            <p className="text-xs sm:text-[13px] lg:text-[0.74vw] text-[#6b7280] leading-[1.35] mt-1 max-w-[220px] sm:max-w-[250px] lg:max-w-[17vw]">
              Add depth with realistic models and smooth page-turn effects.
            </p>
          </div>
        </motion.div>

        {/* Vertical Divider 1 */}
        <div className="hidden lg:block w-[1.5px] h-10 lg:h-[2.6vw] bg-[#EC5137] mx-2 lg:mx-[1.2vw] shrink-0" />

        {/* ITEM 2: Interactive Elements */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center gap-3 sm:gap-3.5 lg:gap-[0.9vw] text-left w-full"
        >
          <Icon
            icon="mdi:cursor-default-click-outline"
            className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] text-[#b0b8c4] shrink-0"
          />
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base lg:text-[0.92vw] font-bold text-[#1f2937] leading-tight">
              Interactive Elements
            </h3>
            <p className="text-xs sm:text-[13px] lg:text-[0.74vw] text-[#6b7280] leading-[1.35] mt-1 max-w-[220px] sm:max-w-[250px] lg:max-w-[17vw]">
              Engage your users with rich interactive content.
            </p>
          </div>
        </motion.div>

        {/* Vertical Divider 2 */}
        <div className="hidden lg:block w-[1.5px] h-10 lg:h-[2.6vw] bg-[#EC5137] mx-2 lg:mx-[1.2vw] shrink-0" />

        {/* ITEM 3: Publish Anywhere */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center gap-3 sm:gap-3.5 lg:gap-[0.9vw] text-left w-full"
        >
          <Icon
            icon="lucide:globe"
            className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] text-[#b0b8c4] stroke-[1.5] shrink-0"
          />
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base lg:text-[0.92vw] font-bold text-[#1f2937] leading-tight">
              Publish Anywhere
            </h3>
            <p className="text-xs sm:text-[13px] lg:text-[0.74vw] text-[#6b7280] leading-[1.35] mt-1 max-w-[220px] sm:max-w-[250px] lg:max-w-[17vw]">
              Share and publish across all platforms and devices.
            </p>
          </div>
        </motion.div>

        {/* Vertical Divider 3 */}
        <div className="hidden lg:block w-[1.5px] h-10 lg:h-[2.6vw] bg-[#EC5137] mx-2 lg:mx-[1.2vw] shrink-0" />

        {/* ITEM 4: Augmented Reality */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center gap-3 sm:gap-3.5 lg:gap-[0.9vw] text-left w-full"
        >
          <Icon
            icon="lucide:scan"
            className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[2.2vw] lg:h-[2.2vw] text-[#b0b8c4] stroke-[1.5] shrink-0"
          />
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base lg:text-[0.92vw] font-bold text-[#1f2937] leading-tight">
              Augmented Reality
            </h3>
            <p className="text-xs sm:text-[13px] lg:text-[0.74vw] text-[#6b7280] leading-[1.35] mt-1 max-w-[220px] sm:max-w-[250px] lg:max-w-[17vw]">
              Let readers place products into their space from any mobile browser.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SmartSolutionsSection;
