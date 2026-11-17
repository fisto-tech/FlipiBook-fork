import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import topmenuImg from '../../assets/Home/topmenu.png';
import leftmenuImg from '../../assets/Home/leftmenu.png';
import bottommenuImg from '../../assets/Home/bottommenu.png';
import rightpropertiesImg from '../../assets/Home/rightproperties.png';
import scanImg from '../../assets/Home/scan_img.png';
import mobileImg from '../../assets/Home/mobile.png';
import motorImg from '../../assets/Home/motor.png';

export default function HeroSection({ navigate }) {
  const canvasRef = useRef(null);

  // Ultra-smooth physics-based mouse trace float with damped spring lerp
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId;

    // Track mouse over entire window or hero container for continuous, seamless tracing
    const onMouseMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Normalized coordinates from center (-1 to +1)
      targetX = (e.clientX / w) * 2 - 1;
      targetY = (e.clientY / h) * 2 - 1;
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    // Smooth physics lerp loop with 0.045 easing for buttery gliding trace
    const animate = () => {
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;

      if (canvasRef.current) {
        canvasRef.current.style.setProperty('--mx', currentX.toFixed(5));
        canvasRef.current.style.setProperty('--my', currentY.toFixed(5));
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
    <section className="relative w-full bg-[#fdfdfd] min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-7vh)] lg:h-[calc(100vh-7vh)] flex flex-col justify-between pt-3 sm:pt-4 lg:pt-3 pb-6 sm:pb-8 lg:pb-4 px-4 sm:px-8 lg:px-[5.5vw] font-poppins overflow-hidden">
      
      {/* Top Tag: IDC FOR ALL INDUSTRY and line */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex items-center gap-3.5 pt-2 sm:pt-3 lg:pt-2 mb-3 sm:mb-4 lg:mb-2 flex-shrink-0"
      >
        <span className="text-xs sm:text-[13px] lg:text-[0.85vw] font-bold tracking-[0.24em] text-[#35363A] uppercase">
          IDC FOR ALL INDUSTRY
        </span>
        <div className="w-12 sm:w-16 lg:w-[3.6vw] h-[1.5px] bg-[#35363A]"></div>
      </motion.div>

      {/* Main 2-Column Grid - Viewport Responsive */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 xl:gap-8 items-center lg:-mt-6">
        
        {/* Left Column: Headings, description & buttons */}
        <div className="lg:col-span-5 flex flex-col justify-start text-left items-start z-10 pt-0 sm:pt-1 -mt-1 sm:-mt-2 lg:-mt-14 xl:-mt-16">
          
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative -top-2.5 sm:-top-3.5 lg:-top-[0.8vw] text-[34px] xs:text-[36px] sm:text-[45px] lg:text-[3.2vw] xl:text-[3.4vw] font-bold text-[#1a1a1a] leading-[1.12] sm:leading-[1.1] tracking-tight uppercase"
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
            className="w-full mt-2.5 sm:mt-3.5 lg:mt-3 flex flex-col items-start"
          >
            {/* Extended red line with WITH positioned at the right under CATALOGUE */}
            <div className="flex items-center gap-3 w-full max-w-[220px] sm:max-w-[300px] lg:max-w-[18vw] xl:max-w-[19vw]">
              <div className="flex-1 h-[1.5px] bg-[#EC5137]"></div>
              <span className="text-[11px] sm:text-xs lg:text-[0.78vw] font-semibold text-[#555555] uppercase tracking-wider flex-shrink-0">
                WITH
              </span>
            </div>

            {/* IMMERSIVE EXPERIENCE */}
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[1.85vw] xl:text-[2.1vw] font-bold text-[#555555] tracking-tight uppercase mt-3.5 sm:mt-4 lg:mt-3.5">
              IMMERSIVE EXPERIENCE
            </h2>
          </motion.div>

          {/* Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs sm:text-sm md:text-[14.5px] lg:text-[0.82vw] xl:text-[0.86vw] font-normal text-[#666666] leading-[165%] max-w-[480px] lg:max-w-[25vw] text-left mt-6 sm:mt-8 lg:mt-7 xl:mt-8"
          >
            Turn your PDF into an interactive digital catalogue with FlipiBook. Add product videos, 3D models, and clickable links so customers can see how your products work, explore the details, and contact your team. Share your catalogue through a single link.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-start gap-3 sm:gap-4 mt-6 sm:mt-8 lg:mt-14 xl:mt-16 flex-wrap"
          >
            {/* View Live Demo Button */}
            <button
              onClick={() => {
                const el = document.getElementById('interactive-demo-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ borderRadius: '15px' }}
              className="group flex items-center gap-2 sm:gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 lg:px-[1.4vw] lg:py-[0.62vw] bg-white hover:bg-[#141b24] border border-gray-200 hover:border-[#141b24] text-[#35363A] hover:text-white font-medium text-xs sm:text-sm lg:text-[0.82vw] shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(20,27,36,0.22)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#35363A] group-hover:bg-[#EC5137] text-white flex items-center justify-center transition-colors duration-300">
                <Icon icon="ic:round-play-arrow" className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
              </div>
              <span className="font-semibold">View Live Demo</span>
            </button>

            {/* My Flipbook Button */}
            <button
              onClick={() => navigate && navigate('/my-flipbooks')}
              style={{ borderRadius: '15px' }}
              className="group flex items-center gap-2 sm:gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 lg:px-[1.4vw] lg:py-[0.62vw] bg-[#141b24] hover:bg-[#EC5137] text-white font-medium text-xs sm:text-sm lg:text-[0.82vw] shadow-[0_6px_18px_rgba(20,27,36,0.25)] hover:shadow-[0_8px_22px_rgba(236,81,55,0.35)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span className="font-semibold">My Flipbook</span>
              <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
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
            className="hero-canvas w-full max-w-[540px] sm:max-w-[680px] lg:max-w-[52vw] xl:max-w-[54vw] aspect-[7680/5852] relative flex items-center justify-center select-none drop-shadow-[0_16px_36px_rgba(0,0,0,0.06)]"
          >
            {/* 1. Center Motor 3D Studio Canvas Window (Base Layer - deep background anchor) */}
            <div
              className="hero-layer absolute left-[11.1%] top-[9.9%] w-[55.0%] h-auto z-10"
              style={{ '--sx': '-3px', '--sy': '-3px', '--ex': '-2px', '--ey': '-2px', '--rot': '0.35deg' }}
            >
              <div className="hero-parallax">
                <div className="hero-float hero-float-1">
                  <img
                    src={motorImg}
                    alt="3D Studio Canvas Motor"
                    className="w-full h-auto object-contain pointer-events-auto cursor-pointer drop-shadow-[0_12px_24px_rgba(0,0,0,0.10)]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Top Menu Strip (Content, 3D Editor, Settings) */}
            <div
              className="hero-layer absolute left-[26.8%] top-[1.1%] w-[33.2%] h-auto z-20"
              style={{ '--sx': '-5px', '--sy': '-7px', '--ex': '0px', '--ey': '-7px', '--rot': '0.7deg' }}
            >
              <div className="hero-parallax">
                <div className="hero-float hero-float-2">
                  <img
                    src={topmenuImg}
                    alt="3D Editor Top Menu"
                    className="w-full h-auto object-contain pointer-events-auto cursor-pointer drop-shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Left Menu Strip (Tools Toolbar) */}
            <div
              className="hero-layer absolute left-[1.6%] top-[13.7%] w-[13.4%] h-auto z-20"
              style={{ '--sx': '-6px', '--sy': '-5px', '--ex': '-7px', '--ey': '0px', '--rot': '-0.6deg' }}
            >
              <div className="hero-parallax">
                <div className="hero-float hero-float-3">
                  <img
                    src={leftmenuImg}
                    alt="Left Tools Menu"
                    className="w-full h-auto object-contain pointer-events-auto cursor-pointer drop-shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
                  />
                </div>
              </div>
            </div>

            {/* 4. Right Properties Inspector Panel */}
            <div
              className="hero-layer absolute left-[64.2%] top-[7.2%] w-[29.6%] h-auto z-20"
              style={{ '--sx': '6px', '--sy': '-5px', '--ex': '8px', '--ey': '-3px', '--rot': '0.8deg' }}
            >
              <div className="hero-parallax">
                <div className="hero-float hero-float-4">
                  <img
                    src={rightpropertiesImg}
                    alt="Inspector Properties Panel"
                    className="w-full h-auto object-contain pointer-events-auto cursor-pointer drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)]"
                  />
                </div>
              </div>
            </div>

            {/* 5. Bottom Menu Strip (Orbit, Hand, Zoom, Reset) */}
            <div
              className="hero-layer absolute left-[17.0%] top-[69.5%] w-[43.4%] h-auto z-25"
              style={{ '--sx': '-5px', '--sy': '5px', '--ex': '-2px', '--ey': '7px', '--rot': '-0.6deg' }}
            >
              <div className="hero-parallax">
                <div className="hero-float hero-float-2">
                  <img
                    src={bottommenuImg}
                    alt="Bottom Navigation Controls"
                    className="w-full h-auto object-contain pointer-events-auto cursor-pointer drop-shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
                  />
                </div>
              </div>
            </div>

            {/* 6. Scan QR Code Badge */}
            <div
              className="hero-layer absolute left-[9.8%] top-[65.5%] w-[10.8%] h-auto z-30"
              style={{ '--sx': '-7px', '--sy': '6px', '--ex': '-8px', '--ey': '6px', '--rot': '-1deg' }}
            >
              <div className="hero-parallax">
                <div className="hero-float hero-float-1">
                  <img
                    src={scanImg}
                    alt="Scan me to view in AR"
                    className="w-full h-auto object-contain pointer-events-auto cursor-pointer drop-shadow-[0_10px_20px_rgba(0,0,0,0.14)]"
                  />
                </div>
              </div>
            </div>

            {/* 7. Mobile AR Smartphone Preview (Foreground hero element) */}
            <div
              className="hero-layer hero-layer-mobile absolute left-[47.6%] top-[45.0%] w-[21.6%] h-auto z-40"
              style={{ '--sx': '9px', '--sy': '8px', '--ex': '7px', '--ey': '7px', '--rot': '1.2deg' }}
            >
              <div className="hero-parallax">
                <div className="hero-float hero-float-4">
                  <img
                    src={mobileImg}
                    alt="Mobile AR View"
                    className="w-full h-auto object-contain pointer-events-auto cursor-pointer drop-shadow-[0_18px_32px_rgba(0,0,0,0.20)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Three Feature Taglines directly under image */}
          <div className="w-full flex justify-center lg:justify-end mt-2 lg:mt-3 pr-2">
            <span className="text-[10px] sm:text-xs lg:text-[0.72vw] font-semibold text-[#555555] tracking-[0.16em] uppercase">
              • INTERACTIVE &nbsp; • IMMERSIVE &nbsp; • INTELLIGENT
            </span>
          </div>
        </motion.div>

      </div>

      {/* Floating, Parallax and Hover Lift CSS */}
      <style>{`
        .hero-canvas {
          --mx: 0;
          --my: 0;
          perspective: 1200px;
          perspective-origin: center center;
        }

        /* Mouse Movement Parallax with subtle 3D perspective tilt and multi-depth trace */
        .hero-parallax {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transform: translate3d(
            calc(var(--mx) * var(--sx, 0px)),
            calc(var(--my) * var(--sy, 0px)),
            0
          )
          rotateX(calc(var(--my) * -1 * var(--rot, 0deg)))
          rotateY(calc(var(--mx) * var(--rot, 0deg)));
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

        /* Hover: Mild Explode outward & gentle float lift */
        .hero-layer {
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), z-index 0.3s;
        }

        /* When hovering the entire 3D canvas area, elements subtly explode outward along their --ex / --ey */
        .hero-canvas:hover .hero-layer {
          transform: translate3d(var(--ex, 0px), var(--ey, 0px), 0);
        }

        /* When hovering any layer, elevate its z-index, but keep mobile smartphone always on top */
        .hero-layer:hover {
          z-index: 38 !important;
        }

        .hero-layer-mobile {
          z-index: 45 !important;
        }

        .hero-layer-mobile:hover {
          z-index: 55 !important;
        }

        /* Rich, tactile individual hover interaction */
        .hero-layer:hover .hero-float {
          transform: scale(1.045) translateY(-8px) !important;
          filter: drop-shadow(0 24px 38px rgba(0, 0, 0, 0.22)) brightness(1.03) !important;
        }

        /* Active click tactile feedback (gentle press) */
        .hero-layer:active .hero-float {
          transform: scale(0.985) translateY(-2px) !important;
          filter: drop-shadow(0 14px 20px rgba(0, 0, 0, 0.16)) !important;
          transition: transform 0.15s ease, filter 0.15s ease !important;
        }

        .hero-float {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
          will-change: transform, filter;
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
