import React from 'react';
import { motion } from 'framer-motion';
import workImg1 from '../../assets/Home/work-img-1.png';
import workImg2 from '../../assets/Home/work-img-2.png';
import workImg3 from '../../assets/Home/work-img-3.png';
import workImg4 from '../../assets/Home/work-img-4.png';

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Content",
      desc: "Upload your PDF or choose a ready-made template to start building your digital catalogue.",
      image: workImg1,
      textPosition: "bottom",
      imgClass: "w-[94%] sm:w-[93%] lg:w-[94%] h-auto max-h-[85%] object-contain drop-shadow-md translate-y-3.5 sm:translate-y-5"
    },
    {
      number: "02",
      title: "Make It Interactive",
      desc: "Customize your pages with product videos, 3D models, and clickable links that help customers explore.",
      image: workImg2,
      textPosition: "top",
      imgClass: "w-[108%] sm:w-[106%] lg:w-[108%] max-w-none h-auto max-h-[88%] object-contain drop-shadow-md scale-105"
    },
    {
      number: "03",
      title: "Publish & Share",
      desc: "Publish your catalogue and share it through a link, QR code, or website embed.",
      image: workImg3,
      textPosition: "bottom",
      imgClass: "w-[102%] sm:w-[100%] lg:w-[102%] max-w-none h-auto max-h-[95%] object-contain drop-shadow-md translate-y-7 sm:translate-y-9"
    },
    {
      number: "04",
      title: "Track & Improve",
      desc: "Review catalogue views and viewer activity to understand engagement and refine your content.",
      image: workImg4,
      textPosition: "top",
      imgClass: "w-[96%] sm:w-[94%] lg:w-[96%] h-auto max-h-[89%] object-contain drop-shadow-md translate-y-3.5 sm:translate-y-5"
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
      transition={{ duration: 0.8 }}
      className="relative w-full bg-white font-poppins pt-2 sm:pt-3 lg:pt-[1.2vw] pb-10 lg:pb-[3vw] px-6 sm:px-10 lg:px-[6vw] flex flex-col items-center justify-between border-t border-gray-100"
    >
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
        transition={{ duration: 0.6 }}
        className="w-full text-left pt-4 sm:pt-5 lg:pt-[3.4vh] mb-2 sm:mb-3 lg:mb-[1.2vh]"
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 lg:gap-[0.9vw]">
          <span className="text-[11px] sm:text-xs lg:text-[0.85vw] font-bold tracking-[0.24em] text-[#35363A] uppercase">
            HOW IT WORKS
          </span>
          <div className="w-10 sm:w-14 lg:w-[3.6vw] h-[1.5px] lg:h-[0.15vh] bg-[#35363A]"></div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="text-center w-full mb-7 sm:mb-9 md:mb-11 lg:mb-[3.2vw] space-y-2 sm:space-y-2.5 lg:space-y-[0.7vw]"
      >
        <h2 className="text-2xl sm:text-4xl lg:text-[3vw] font-semibold text-[#1b222c] tracking-tight leading-tight">
          Create Your Interactive Digital Catalogue <br />
          <span className="text-[#ea543a]">in 4 Simple Steps</span>
        </h2>
        <p className="text-xs sm:text-base lg:text-[0.9vw] text-gray-500 font-normal leading-relaxed max-w-2xl mx-auto">
          Turn your PDF into a product experience customers can explore. Create, customize, share, and track your catalogue with FlipiBook.
        </p>
      </motion.div>

      {/* 
        Cards Grid:
        - Mobile & Tablet (< lg): Uniform layout with card on top and text below card for all steps
        - Desktop (lg+): Alternating wave layout preserved
      */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-y-12 md:gap-y-14 lg:gap-[2vw] items-start lg:items-end">
        {steps.map((step, idx) => {
          const isTopText = step.textPosition === "top";

          // Header/Footer Text Block: order-2 on mobile/tab (always below card), alternating on desktop
          const textBlock = (
            <div
              className={`text-center flex flex-col items-center w-full px-2 mt-3 sm:mt-4 ${
                isTopText ? 'order-2 lg:order-1 lg:mt-0 lg:mb-[1vw]' : 'order-2 lg:order-2 lg:mt-[1vw]'
              }`}
            >
              <div className="flex items-center justify-center gap-2.5 lg:gap-[0.5vw] w-full mb-1.5 lg:mb-[0.4vw]">
                <span className="inline-block w-4 sm:w-6 lg:w-[1.2vw] h-[1.5px] lg:h-[0.1vw] bg-[#9ca3af]"></span>
                <h3 className="text-base sm:text-lg lg:text-[1.1vw] font-semibold text-[#1b222c] leading-snug">
                  {step.title}
                </h3>
                <span className="inline-block w-4 sm:w-6 lg:w-[1.2vw] h-[1.5px] lg:h-[0.1vw] bg-[#9ca3af]"></span>
              </div>
              <p className="text-xs sm:text-[13px] lg:text-[0.8vw] text-gray-500 font-normal leading-relaxed lg:leading-[1.4] max-w-[280px] lg:max-w-[17vw]">
                {step.desc}
              </p>
            </div>
          );

          // Card Box: order-1 on mobile/tab (always on top of text), alternating on desktop, slightly reduced width
          const cardBox = (
            <div
              className={`w-full lg:w-[94%] mx-auto bg-[#e2e4e7] rounded-[26px] lg:rounded-[1.6vw] p-2.5 sm:p-3 lg:p-[0.7vw] aspect-[1/1.12] relative shadow-xs hover:shadow-xl hover:-translate-y-2 hover:bg-[#d8dade] transition-all duration-300 ease-out overflow-hidden cursor-pointer ${
                isTopText ? 'order-1 lg:order-2' : 'order-1 lg:order-1'
              }`}
            >
              {/* Giant Step Number in top left matching screenshot (absolute to avoid pushing image down) */}
              <span className="absolute top-2.5 left-3 sm:top-3 sm:left-4 lg:top-[0.8vw] lg:left-[0.9vw] text-6xl sm:text-7xl lg:text-[4.6vw] font-normal text-white leading-none tracking-tight select-none z-0">
                {step.number}
              </span>
              
              {/* Image Centered and Sized right up to the number border */}
              <div className="relative z-10 w-full h-full flex items-end justify-center pb-1">
                <img
                  src={step.image}
                  alt={step.title}
                  className={`${step.imgClass}`}
                />
              </div>
            </div>
          );

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.85, delay: 0.15 + idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center group w-full justify-start lg:justify-end max-w-[340px] sm:max-w-none mx-auto sm:mx-0"
            >
              {cardBox}
              {textBlock}
            </motion.div>
          );
        })}
      </div>

    </motion.section>
  );
}
