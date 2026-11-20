import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import topmenuImg from '../../assets/Home/Hero/topmenu.webp';
import leftmenuImg from '../../assets/Home/Hero/leftmenu.webp';
import bottommenuImg from '../../assets/Home/Hero/bottommenu.webp';
import rightpropertiesImg from '../../assets/Home/Hero/rightproperties.webp';
import scanImg from '../../assets/Home/Hero/scan_img.webp';
import mobileImg from '../../assets/Home/Hero/mobile.webp';
import motorImg from '../../assets/Home/Hero/motor.webp';

export default function HeroSection({ navigate }) {
  const canvasRef = useRef(null);

  // Ultra-smooth physics-based mouse trace float with responsive lerp
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId;

    const onMouseMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      targetX = (e.clientX / w) * 2 - 1;
      targetY = (e.clientY / h) * 2 - 1;
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      if (canvasRef.current) {
        canvasRef.current.style.setProperty('--mx', currentX.toFixed(4));
        canvasRef.current.style.setProperty('--my', currentY.toFixed(4));
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <section className="relative w-full bg-[#fdfdfd] min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-7vh)] lg:h-[calc(100vh-7vh)] flex flex-col justify-start pt-3 sm:pt-4 lg:pt-[1.5vh] pb-6 sm:pb-8 lg:pb-[2vh] px-5 sm:px-8 lg:px-[5.5vw] font-poppins overflow-hidden">
      
      {/* Top Tag: IDC FOR ALL INDUSTRY and line */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center gap-2.5 sm:gap-3.5 lg:gap-[0.9vw] pt-2.5 sm:pt-3.5 lg:pt-[2.2vh] mb-2 sm:mb-3 lg:mb-[1.2vh] flex-shrink-0"
      >
        <span className="text-[11px] sm:text-xs lg:text-[0.85vw] font-bold tracking-[0.24em] text-[#35363A] uppercase">
          IDC FOR ALL INDUSTRY
        </span>
        <div className="w-10 sm:w-14 lg:w-[3.6vw] h-[1.5px] lg:h-[0.15vh] bg-[#35363A]"></div>
      </motion.div>

      {/* Main 2-Column Grid - Viewport Responsive on desktop, clean vertical stack on mobile */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[1.5vw] xl:gap-[2vw] items-start">
        
        {/* Left Column: Headings, description & buttons */}
        <div className="lg:col-span-5 flex flex-col justify-start text-left items-start z-10 pt-1 sm:pt-2 lg:pt-[3.8vh]">
          
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[28px] xs:text-[32px] sm:text-[40px] md:text-[44px] lg:text-[3.2vw] xl:text-[3.4vw] font-bold text-[#1a1a1a] leading-[1.15] sm:leading-[1.12] tracking-tight uppercase"
          >
            INTERACTIVE DIGITAL <br />
            <span className="text-[#EC5137] tracking-tight">CATALOGUE</span>
          </motion.h1>

          {/* Subheading: Single Line WITH IMMERSIVE EXPERIENCE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full mt-2.5 sm:mt-3 lg:mt-[1.2vh] flex flex-col items-start"
          >
            {/* Extended red line with WITH positioned at the right under CATALOGUE */}
            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-[0.8vw] w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[18vw] xl:max-w-[19vw]">
              <div className="flex-1 h-[1.5px] lg:h-[0.15vh] bg-[#EC5137]"></div>
              <span className="text-[12.5px] sm:text-sm lg:text-[0.92vw] font-bold text-[#555555] uppercase tracking-wider flex-shrink-0">
                WITH
              </span>
            </div>

            {/* IMMERSIVE EXPERIENCE */}
            <h2 className="text-[26px] xs:text-[29px] sm:text-[36px] md:text-[40px] lg:text-[2.85vw] xl:text-[3.05vw] font-bold text-[#555555] leading-[1.15] sm:leading-[1.12] tracking-tight uppercase mt-4 sm:mt-5 lg:mt-[3.8vh]">
              IMMERSIVE EXPERIENCE
            </h2>
          </motion.div>

          {/* Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs sm:text-sm lg:text-[0.82vw] xl:text-[0.86vw] font-normal text-[#666666] leading-[165%] max-w-[480px] lg:max-w-[25vw] text-left mt-8 sm:mt-9 lg:mt-[6.2vh]"
          >
            Turn your PDF into an interactive digital catalogue with FlipiBook. Add product videos, 3D models, and clickable links so customers can see how your products work, explore the details, and contact your team. Share your catalogue through a single link.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-start gap-2.5 sm:gap-3.5 lg:gap-[1vw] mt-8 sm:mt-9 lg:mt-[9.2vh] flex-wrap"
          >
            {/* View Live Demo Button */}
            <button
              onClick={() => {
                const el = document.getElementById('interactive-demo-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ borderRadius: '12px' }}
              className="group flex items-center gap-2 sm:gap-2.5 lg:gap-[0.6vw] px-4 py-2 sm:px-5 sm:py-2.5 lg:px-[1.4vw] lg:py-[0.62vw] lg:!rounded-[0.8vw] bg-white hover:bg-[#141b24] border border-gray-200 hover:border-[#141b24] text-[#35363A] hover:text-white font-medium text-xs sm:text-sm lg:text-[0.82vw] shadow-[0_0.4vw_1.2vw_rgba(0,0,0,0.06)] hover:shadow-[0_0.6vw_1.5vw_rgba(20,27,36,0.22)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <div className="w-5 h-5 lg:w-[1.25vw] lg:h-[1.25vw] rounded-full bg-[#35363A] group-hover:bg-[#EC5137] text-white flex items-center justify-center transition-colors duration-300 flex-shrink-0">
                <Icon icon="ic:round-play-arrow" className="w-3.5 h-3.5 lg:w-[0.85vw] lg:h-[0.85vw] fill-current ml-0.5" />
              </div>
              <span className="font-semibold whitespace-nowrap">View Live Demo</span>
            </button>

            {/* My Flipbook Button */}
            <button
              onClick={() => navigate && navigate('/my-flipbooks')}
              style={{ borderRadius: '12px' }}
              className="group flex items-center gap-2 sm:gap-2.5 lg:gap-[0.6vw] px-4 py-2 sm:px-5 sm:py-2.5 lg:px-[1.4vw] lg:py-[0.62vw] lg:!rounded-[0.8vw] bg-[#141b24] hover:bg-[#EC5137] text-white font-medium text-xs sm:text-sm lg:text-[0.82vw] shadow-[0_0.4vw_1.4vw_rgba(20,27,36,0.25)] hover:shadow-[0_0.6vw_1.6vw_rgba(236,81,55,0.35)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span className="font-semibold whitespace-nowrap">My Flipbook</span>
              <Icon icon="lucide:arrow-right" className="w-4 h-4 lg:w-[0.95vw] lg:h-[0.95vw] group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
            </button>
          </motion.div>

        </div>

        {/* Right Column: 3D Studio Showcase Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 30 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 flex flex-col items-center lg:items-end justify-center relative w-full mt-4 lg:mt-0"
        >
          <div
            ref={canvasRef}
            className="hero-canvas w-full max-w-[540px] sm:max-w-[680px] lg:max-w-[52vw] xl:max-w-[54vw] aspect-[7680/5852] relative flex items-center justify-center select-none cursor-default"
          >
              {/* 1. Center Motor 3D Studio Canvas Window (Base Layer - deep background anchor) */}
              <div
                className="hero-layer hero-layer-motor absolute left-[11.1%] top-[9.9%] w-[55.0%] h-auto z-10 pointer-events-none"
                style={{ '--sx': '-4px', '--sy': '-4px', '--ex': '-2px', '--ey': '4px', '--rot': '0.7deg', '--tz': '0px' }}
              >
                <div className="hero-parallax">
                  <div className="hero-float hero-float-1">
                    <img
                      src={motorImg}
                      alt="3D Studio Canvas Motor"
                      className="w-full h-auto object-contain pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Top Menu Strip (Content, 3D Editor, Settings) */}
              <div
                className="hero-layer hero-layer-topmenu absolute left-[26.8%] top-[0.6%] w-[33.2%] h-auto z-20 pointer-events-none"
                style={{ '--sx': '-8px', '--sy': '-10px', '--ex': '0px', '--ey': '-14px', '--rot': '1.2deg', '--tz': '25px' }}
              >
                <div className="hero-parallax">
                  <div className="hero-float hero-float-2">
                    <img
                      src={topmenuImg}
                      alt="3D Editor Top Menu"
                      className="w-full h-auto object-contain pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Left Menu Strip (Tools Toolbar) */}
              <div
                className="hero-layer absolute left-[1.6%] top-[13.7%] w-[13.4%] h-auto z-20 pointer-events-none"
                style={{ '--sx': '-10px', '--sy': '-7px', '--ex': '-10px', '--ey': '0px', '--rot': '-1.1deg', '--tz': '28px' }}
              >
                <div className="hero-parallax">
                  <div className="hero-float hero-float-3">
                    <img
                      src={leftmenuImg}
                      alt="Left Tools Menu"
                      className="w-full h-auto object-contain pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Right Properties Inspector Panel */}
              <div
                className="hero-layer absolute left-[64.2%] top-[7.2%] w-[29.6%] h-auto z-20 pointer-events-none"
                style={{ '--sx': '10px', '--sy': '-7px', '--ex': '12px', '--ey': '-4px', '--rot': '1.3deg', '--tz': '35px' }}
              >
                <div className="hero-parallax">
                  <div className="hero-float hero-float-4">
                    <img
                      src={rightpropertiesImg}
                      alt="Inspector Properties Panel"
                      className="w-full h-auto object-contain pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Bottom Menu Strip (Orbit, Hand, Zoom, Reset) */}
              <div
                className="hero-layer absolute left-[17.0%] top-[69.5%] w-[43.4%] h-auto z-25 pointer-events-none"
                style={{ '--sx': '-8px', '--sy': '8px', '--ex': '-3px', '--ey': '10px', '--rot': '-1.0deg', '--tz': '30px' }}
              >
                <div className="hero-parallax">
                  <div className="hero-float hero-float-2">
                    <img
                      src={bottommenuImg}
                      alt="Bottom Navigation Controls"
                      className="w-full h-auto object-contain pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Scan QR Code Badge */}
              <div
                className="hero-layer absolute left-[9.8%] top-[65.5%] w-[10.8%] h-auto z-30 pointer-events-none"
                style={{ '--sx': '-12px', '--sy': '10px', '--ex': '-12px', '--ey': '8px', '--rot': '-1.5deg', '--tz': '45px' }}
              >
                <div className="hero-parallax">
                  <div className="hero-float hero-float-1">
                    <img
                      src={scanImg}
                      alt="Scan me to view in AR"
                      className="w-full h-auto object-contain pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Mobile AR Smartphone Preview (Foreground hero element) */}
              <div
                className="hero-layer hero-layer-mobile absolute left-[47.6%] top-[45.0%] w-[21.6%] h-auto z-40 pointer-events-none"
                style={{ '--sx': '15px', '--sy': '13px', '--ex': '10px', '--ey': '10px', '--rot': '1.8deg', '--tz': '70px' }}
              >
                <div className="hero-parallax">
                  <div className="hero-float hero-float-4">
                    <img
                      src={mobileImg}
                      alt="Mobile AR View"
                      className="w-full h-auto object-contain pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Three Feature Taglines directly under image */}
          <div className="w-full flex justify-center lg:justify-end mt-[1vh] lg:mt-[1.5vh] pr-[0.8vw]">
            <span className="text-[10px] sm:text-xs lg:text-[0.72vw] font-semibold text-[#555555] tracking-[0.16em] uppercase">
              • INTERACTIVE &nbsp; • IMMERSIVE &nbsp; • INTELLIGENT
            </span>
          </div>
        </motion.div>

      </div>

      {/* Floating, Parallax and Hover Lift CSS */}
      <style>{`
        /* Master Container 3D Tilt: Tilts the entire 3D showcase as one cohesive unified 3D space */
        .hero-canvas {
          --mx: 0;
          --my: 0;
          perspective: 1100px;
          perspective-origin: 50% 50%;
          transform-style: preserve-3d;
          transform: rotateY(calc(var(--mx) * 17deg)) rotateX(calc(var(--my) * -13deg)) translate3d(calc(var(--mx) * 22px), calc(var(--my) * 13px), 0);
          will-change: transform;
        }

        /* Mouse Movement Parallax with realistic 3D perspective tilt and multi-depth z-translation */
        .hero-parallax {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transform: translate3d(
            calc(var(--mx) * var(--sx, 0px) * 3.4),
            calc(var(--my) * var(--sy, 0px) * 2.8),
            var(--tz, 0px)
          )
          rotateX(calc(var(--my) * -6 * var(--rot, 1deg)))
          rotateY(calc(var(--mx) * 8.5 * var(--rot, 1deg)));
          will-change: transform;
        }

        /* Ultra-smooth Continuous Ambient Floating Animations */
        .hero-float-1 {
          animation: heroWaterFloat1 10s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        .hero-float-2 {
          animation: heroWaterFloat2 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        .hero-float-3 {
          animation: heroWaterFloat3 9.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        .hero-float-4 {
          animation: heroWaterFloat4 13s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        @keyframes heroWaterFloat1 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(-3px, -5px, 0) rotate(0.2deg); }
        }

        @keyframes heroWaterFloat2 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(3px, -4px, 0) rotate(-0.25deg); }
        }

        @keyframes heroWaterFloat3 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(-3px, -5px, 0) rotate(0.2deg); }
        }

        @keyframes heroWaterFloat4 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(2.5px, -5px, 0) rotate(-0.2deg); }
        }

        /* Hover stability: Keep stable rendering without layout explosion or z-index flash */
        .hero-layer {
          will-change: transform;
        }

        .hero-layer-mobile {
          z-index: 45 !important;
        }

        .hero-float {
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-float {
            animation: none !important;
            transition: none !important;
          }
          .hero-parallax {
            transform: none !important;
          }
        }
      `}</style>

    </section>
  );
}
