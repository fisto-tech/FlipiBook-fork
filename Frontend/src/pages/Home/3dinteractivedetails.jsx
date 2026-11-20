import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import homes2Img from '../../assets/Home/homes2.png';

export default function ThreeDInteractiveDetails({ navigate }) {
  const containerRef = useRef(null);
  const houseImgRef = useRef(null);
  const iconRefs = useRef([]);

  // Store coordinates of start dots (from floorplan image) and end points (at icon centers)
  const [lines, setLines] = useState([]);
  const [arrowsVisible, setArrowsVisible] = useState(false);

  // The 5 anchor points on the homes2 image (percentages [xPct, yPct] where the red dots are)
  // Arrow 1: Kitchen area (top center-left) -> Feature 0
  // Arrow 2: Top-right room -> Feature 1
  // Arrow 3: Middle-right stairs / landing -> Feature 2
  // Arrow 4: Lower-right bedroom/brick room -> Feature 3
  // Arrow 5: Bottom living room sofa -> Feature 4
  const dotAnchors = [
    { x: 0.385, y: 0.285 }, // Feature 1: 3D Product Models (extended further left)
    { x: 0.650, y: 0.388 }, // Feature 2: 360° Product View
    { x: 0.745, y: 0.582 }, // Feature 3: Materials & Textures
    { x: 0.635, y: 0.725 }, // Feature 4: Lighting & Shadows
    { x: 0.465, y: 0.755 }, // Feature 5: Background Colors
  ];

  const updateConnectorLines = () => {
    if (!containerRef.current || !houseImgRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const houseRect = houseImgRef.current.getBoundingClientRect();

    // Account for CSS scale transform (scale-103 on mobile, scale-108 on desktop) and origin-bottom
    const scale = window.innerWidth >= 1024 ? 1.08 : 1.03;
    const unscaledW = houseRect.width / scale;
    const unscaledH = houseRect.height / scale;

    const newLines = dotAnchors.map((anchor, index) => {
      // Natural pixel coordinate inside image before transform
      const naturalX = unscaledW * anchor.x;
      const naturalY = unscaledH * anchor.y;

      // With transform origin: bottom center (x: 50%, y: 100%)
      const scaledX = unscaledW * 0.5 + (naturalX - unscaledW * 0.5) * scale;
      const scaledY = unscaledH + (naturalY - unscaledH) * scale;

      const startX = houseRect.left - containerRect.left + scaledX;
      const startY = houseRect.top - containerRect.top + scaledY;

      const iconEl = iconRefs.current[index];
      let endX = startX + 100;
      let endY = startY;

      if (iconEl) {
        const iconRect = iconEl.getBoundingClientRect();
        // Point right to the left edge of the circular icon
        endX = iconRect.left - containerRect.left - 8;
        endY = iconRect.top - containerRect.top + iconRect.height / 2;
      }

      return { startX, startY, endX, endY };
    });

    setLines(newLines);
  };

  useEffect(() => {
    updateConnectorLines();
    window.addEventListener('resize', updateConnectorLines);
    window.addEventListener('scroll', updateConnectorLines, true);

    // ResizeObserver watches both container and houseImg for dynamic dimension changes in devtools/inspect
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateConnectorLines();
      });
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      if (houseImgRef.current) resizeObserver.observe(houseImgRef.current);
    }

    // Smoothly reveal arrows once positions and animations have settled
    const timer = setTimeout(() => {
      updateConnectorLines();
      setArrowsVisible(true);
    }, 400);
    const timer2 = setTimeout(updateConnectorLines, 800);
    const timer3 = setTimeout(updateConnectorLines, 1200);

    return () => {
      window.removeEventListener('resize', updateConnectorLines);
      window.removeEventListener('scroll', updateConnectorLines, true);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);
  const features = [
    {
      id: 1,
      title: '3D Product Models',
      desc: (
        <>
          Add your 3D models to catalogue <br />
          pages so customers can explore <br />
          product shapes and details.
        </>
      ),
      icon: 'lets-icons:3d-box-light',
    },
    {
      id: 2,
      title: '360° Product View',
      desc: (
        <>
          Let customers rotate and zoom in on <br />
          models to examine them from <br />
          different angles.
        </>
      ),
      icon: 'teenyicons:360-outline',
    },
    {
      id: 3,
      title: 'Materials & Textures',
      desc: (
        <>
          Customize model surfaces to <br />
          showcase product colors, materials, <br />
          and finishes.
        </>
      ),
      icon: 'streamline-flex:texture',
    },
    {
      id: 4,
      title: 'Lighting & Shadows',
      desc: (
        <>
          Adjust lighting to highlight <br />
          product details and give models <br />
          a realistic appearance.
        </>
      ),
      icon: 'entypo:light-up',
    },
    {
      id: 5,
      title: 'Background Colors',
      desc: (
        <>
          Choose 3D viewer background <br />
          colors that complement your <br />
          products and brand.
        </>
      ),
      icon: 'arcticons:removebg',
    },
  ];

  return (
    <section className="relative w-full bg-[#030303] text-white min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-7vh)] flex flex-col justify-start pt-6 sm:pt-8 lg:pt-[1.5vh] pb-8 sm:pb-10 lg:pb-0 px-5 sm:px-8 lg:px-[5vw] xl:px-[5.5vw] font-poppins overflow-hidden">

      {/* Top Tag: INTERACTIVE 3D CATALOGUES */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="w-full flex items-center gap-2.5 sm:gap-3.5 lg:gap-[0.9vw] pt-2.5 sm:pt-3.5 lg:pt-[2.2vh] mb-2 sm:mb-3 lg:mb-[1.2vh] flex-shrink-0"
      >
        <span className="text-[11px] sm:text-xs lg:text-[0.85vw] font-bold tracking-[0.24em] text-white uppercase">
          INTERACTIVE 3D CATALOGUES
        </span>
        <div className="w-10 sm:w-14 lg:w-[3.6vw] min-w-[35px] h-[1.5px] lg:h-[0.15vh] bg-[#3a3a40]"></div>
      </motion.div>

      {/* Main 3-Column Layout: items-start on desktop, stacked on mobile */}
      <div
        ref={containerRef}
        className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-[1.5vw] items-start relative"
      >
        {/* SVG Connector Lines Overlay (Desktop only) */}
        <svg
          className={`hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible transition-opacity duration-500 ${arrowsVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <defs>
            <marker
              id="red-arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#EC5137" />
            </marker>
          </defs>

          {lines.map((line, idx) => {
            let pathData = '';

            if (idx === 2) {
              const dx = Math.max(35, (line.endX - line.startX) * 0.45);
              const straightLead = 28;
              pathData = `M ${line.startX} ${line.startY} C ${line.startX + dx} ${line.startY + 15}, ${line.endX - straightLead - dx * 0.6} ${line.endY}, ${line.endX - straightLead} ${line.endY} L ${line.endX} ${line.endY}`;
            } else if (idx === 3) {
              const dx = Math.max(40, (line.endX - line.startX) * 0.5);
              const straightLead = 28;
              pathData = `M ${line.startX} ${line.startY} C ${line.startX + dx} ${line.startY + 12}, ${line.endX - straightLead - dx * 0.6} ${line.endY}, ${line.endX - straightLead} ${line.endY} L ${line.endX} ${line.endY}`;
            } else {
              pathData = `M ${line.startX} ${line.endY} L ${line.endX} ${line.endY}`;
            }

            const dotY = (idx === 2 || idx === 3) ? line.startY : line.endY;

            return (
              <g key={idx}>
                {/* Red source dot on the 3D model */}
                <circle
                  cx={line.startX}
                  cy={dotY}
                  r="5"
                  fill="#EC5137"
                  className="animate-pulse"
                />
                <circle
                  cx={line.startX}
                  cy={dotY}
                  r="8"
                  fill="none"
                  stroke="#EC5137"
                  strokeWidth="1.5"
                  opacity="0.4"
                />

                {/* Dashed connector path with arrowhead */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#EC5137"
                  strokeWidth="1.6"
                  strokeDasharray="4 4"
                  markerEnd="url(#red-arrowhead)"
                />
              </g>
            );
          })}
        </svg>

        {/* Left Column (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col justify-start text-left items-start z-20 pt-1 sm:pt-2 lg:pt-[4.2vh]">
          {/* Headline with slide-in & fade */}
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-[48px] lg:text-[3.1vw] font-bold text-white leading-[1.12] tracking-tight text-left"
          >
            Give Customers <br />
            a <span className="text-[#EC5137]">Closer Look</span> <br />
            at Your <br />
            Products
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-base lg:text-[0.88vw] font-normal text-[#9ca3af] leading-[170%] mt-4 sm:mt-5 lg:mt-[2.5vh]"
          >
            Bring 3D product models <br />
            into your FlipiBook <br />
            catalogue. Let customers <br />
            rotate products, inspect <br />
            details, and discover <br />
            features through <br />
            clickable hotspots, <br />
            videos, and audio.
          </motion.p>

          {/* Explore Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => {
              if (navigate) navigate('/explore');
            }}
            style={{ borderRadius: '12px' }}
            className="group flex items-center gap-2 sm:gap-2.5 lg:gap-[0.5vw] px-5 py-2.5 sm:px-6 sm:py-3 lg:px-[1.2vw] lg:py-[0.65vw] lg:!rounded-[0.5vw] bg-[#EA7233] hover:bg-[#d86224] text-white font-medium text-xs sm:text-sm lg:text-[0.82vw] shadow-[0_6px_18px_rgba(234,114,51,0.35)] lg:shadow-[0_0.4vw_1.2vw_rgba(234,114,51,0.35)] transition-all duration-300 active:scale-95 cursor-pointer mt-5 sm:mt-6 lg:mt-[4vh] relative z-30 min-w-max"
          >
            <span>Explore a 3D Catalogue</span>
            <Icon icon="lucide:arrow-right" className="w-4 h-4 lg:w-[1vw] lg:h-[1vw] group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </div>

        {/* Center 3D Floor Plan - Viewport Responsive Height (col-span-6) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lg:col-span-6 relative flex items-end justify-center w-full z-10 self-end -mb-1 translate-x-0 my-3 sm:my-4 lg:my-0 h-auto sm:h-full max-h-[50vh] sm:max-h-[60vh] lg:max-h-[76vh] xl:max-h-[79vh]"
        >
          <div className="relative w-full max-w-[420px] sm:max-w-[520px] lg:max-w-none lg:w-auto h-full flex items-end justify-center aspect-[1920/1440]">

            {/* The Image itself - finely scaled */}
            <img
              ref={houseImgRef}
              onLoad={updateConnectorLines}
              src={homes2Img}
              alt="Interactive 3D Catalogue Floor Plan"
              className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_1.5vw_3vw_rgba(0,0,0,0.9)] scale-100 sm:scale-103 lg:scale-108 origin-bottom"
            />
          </div>
        </motion.div>

        {/* Right Column (col-span-3): 5 Features List */}
        <div
          className="lg:col-span-3 flex flex-col justify-start lg:justify-between h-auto lg:h-full max-h-none lg:max-h-[76vh] xl:max-h-[80vh] z-20 pt-2 lg:pt-[2vh] pb-4 lg:pb-[2vh] gap-4 sm:gap-5 lg:gap-[0.9vh] translate-x-0 w-full lg:w-auto lg:ml-auto"
        >
          {features.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              onAnimationComplete={updateConnectorLines}
              transition={{
                duration: 0.6,
                delay: 0.15 + index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-start gap-3 sm:gap-3.5 lg:gap-[0.8vw]"
            >
              {/* Circular Bordered Icon */}
              <div
                ref={(el) => (iconRefs.current[index] = el)}
                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-[2.2vw] lg:h-[2.2vw] rounded-full border border-white/90 bg-transparent flex items-center justify-center flex-shrink-0 text-white mt-0.5"
              >
                <Icon icon={item.icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[1.05vw] lg:h-[1.05vw]" />
              </div>

              {/* Text: Title & Description */}
              <div className="flex flex-col text-left pl-1 sm:pl-2 lg:pl-[0.8vw]">
                <h3 className="text-sm sm:text-base lg:text-[0.82vw] font-semibold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] lg:text-[0.68vw] font-normal text-[#9ca3af] leading-[145%] mt-1 lg:mt-[0.3vh]">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

    </section>
  );
}
