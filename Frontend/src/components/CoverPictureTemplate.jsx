import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM, { createPortal } from 'react-dom';
import TypographyPanel from './TypographyPanel';
import { X, ChevronDown, ChevronUp, Info, Check, Plus, Upload, Edit2, Sliders, MoreVertical, Trash2, Download, Loader } from 'lucide-react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { useToast } from './CustomToast';
import { useAuth } from '../context/AuthContext';
import { Icon } from '@iconify/react';
import PremiumDropdown from './CustomizedEditor/components/PremiumDropdown';
import { ImageCropOverlay } from './CustomizedEditor/AppearanceShared';
import ColorPicker from './Color';
import Switch from './CustomizedEditor/components/Switch';

export const scrollbarStyles = `
  .custom-popup-scrollbar::-webkit-scrollbar {
    width: 0.35vw;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-thumb {
    background: #292a2bff;
    border-radius: 10px;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-button {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-button:vertical:decrement,
  .custom-popup-scrollbar::-webkit-scrollbar-button:vertical:increment,
  .custom-popup-scrollbar::-webkit-scrollbar-button:horizontal:decrement,
  .custom-popup-scrollbar::-webkit-scrollbar-button:horizontal:increment {
    display: none !important;
  }
  ::-webkit-scrollbar-button {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
  }
  .custom-popup-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #475569 transparent;
  }
`;

export const COVER_TEMPLATES = [
  // Portrait (3 templates per page category)
  // 1 Page
  { id: 2, label: 'Single Booklet', orientation: 'portrait', maxPages: 1, defaultBgColor: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', defaultText1: 'Premium Edition', defaultText2: 'Classic Minimal Design' },
  { id: 4, label: 'Modern Magazine', orientation: 'portrait', maxPages: 1, defaultBgColor: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', defaultText1: 'Magazine Lookbook', defaultText2: 'Vol. 24 / Summer Edition' },
  { id: 13, label: 'Editorial Minimalist', orientation: 'portrait', maxPages: 1, defaultBgColor: 'linear-gradient(135deg, #FEF08A 0%, #FDE047 100%)', defaultText1: 'Editorial Digest', defaultText2: 'Modern Minimalist Journal' },

  // 2 Pages
  { id: 1, label: 'Dual Brochure', orientation: 'portrait', maxPages: 2, defaultBgColor: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)', defaultText1: 'Design Book', defaultText2: 'Free .psd Mockup' },
  { id: 5, label: 'Dual Layer Spread', orientation: 'portrait', maxPages: 2, defaultBgColor: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)', defaultText1: 'Master Collection', defaultText2: 'Series Edition Vol. 1' },
  { id: 6, label: 'Isometric Portfolio', orientation: 'portrait', maxPages: 2, defaultBgColor: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)', defaultText1: 'Minimalist Journal', defaultText2: 'Special Edition Portfolio' },

  // 3 Pages
  { id: 14, label: 'Triple Portrait Cascade', orientation: 'portrait', maxPages: 3, defaultBgColor: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', defaultText1: 'Triple Showcase', defaultText2: '3-Page Portrait Collection' },
  { id: 15, label: 'Portrait Fan Spread', orientation: 'portrait', maxPages: 3, defaultBgColor: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', defaultText1: 'Curated Series', defaultText2: '3-Layer Exhibition' },
  { id: 16, label: 'Stepped Portfolio Trio', orientation: 'portrait', maxPages: 3, defaultBgColor: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)', defaultText1: 'Portfolio Stacks', defaultText2: 'Annual Creative Trio' },

  // Landscape (3 templates per page category)
  // 1 Page
  { id: 3, label: 'Landscape Catalog', orientation: 'landscape', maxPages: 1, defaultBgColor: 'linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 100%)', defaultText1: 'Corporate Showcase', defaultText2: 'Annual Brochure & Catalog' },
  { id: 17, label: 'Wide Horizon Lookbook', orientation: 'landscape', maxPages: 1, defaultBgColor: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', defaultText1: 'Panorama Vision', defaultText2: 'Wide Format Annual Review' },
  { id: 18, label: 'Landscape Presentation', orientation: 'landscape', maxPages: 1, defaultBgColor: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)', defaultText1: 'Executive Deck', defaultText2: 'Quarterly Strategic Deck' },

  // 2 Pages
  { id: 7, label: 'Landscape Dual Spread', orientation: 'landscape', maxPages: 2, defaultBgColor: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', defaultText1: 'Landscape Spread', defaultText2: '2-Page Open Lookbook' },
  { id: 19, label: 'Landscape Overlap Duo', orientation: 'landscape', maxPages: 2, defaultBgColor: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)', defaultText1: 'Bifold Horizon', defaultText2: 'Two-Tier Horizon Display' },
  { id: 20, label: 'Dual Horizon Gallery', orientation: 'landscape', maxPages: 2, defaultBgColor: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)', defaultText1: 'Lookbook Duo', defaultText2: 'Double Landscape Display' },

  // 3 Pages
  { id: 8, label: 'Landscape Trio Fan', orientation: 'landscape', maxPages: 3, defaultBgColor: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', defaultText1: 'Tri-Page Showcase', defaultText2: '3-Layer Cascading Pages' },
  { id: 9, label: 'Landscape Triple Cascade', orientation: 'landscape', maxPages: 3, defaultBgColor: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)', defaultText1: 'Portfolio Triple Spread', defaultText2: '3-Tier Landscape Preview' },
  { id: 21, label: 'Landscape Staggered Trio', orientation: 'landscape', maxPages: 3, defaultBgColor: 'linear-gradient(135deg, #D5F5E3 0%, #A9DFBF 100%)', defaultText1: 'Wide Spectrum', defaultText2: '3-Fold Panoramic Collection' },

  // Square (3 templates per page category)
  // 1 Page
  { id: 10, label: 'Square Booklet', orientation: 'square', maxPages: 1, defaultBgColor: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', defaultText1: 'Square Lookbook', defaultText2: 'Clean Minimal Square' },
  { id: 22, label: 'Modern Square Tile', orientation: 'square', maxPages: 1, defaultBgColor: 'linear-gradient(135deg, #FFEDD5 0%, #FED7D7 100%)', defaultText1: 'Square Focus', defaultText2: 'Contemporary Square Mockup' },
  { id: 23, label: 'Artisan Square Stand', orientation: 'square', maxPages: 1, defaultBgColor: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', defaultText1: 'Square Artbook', defaultText2: 'Single Gallery Edition' },

  // 2 Pages
  { id: 11, label: 'Dual Square Showcase', orientation: 'square', maxPages: 2, defaultBgColor: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', defaultText1: 'Artisan Square', defaultText2: 'Creative Square Spread' },
  { id: 24, label: 'Square Wing Duo', orientation: 'square', maxPages: 2, defaultBgColor: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)', defaultText1: 'Bifold Square', defaultText2: 'Twin Square Exhibit' },
  { id: 25, label: 'Square Diagonal Pair', orientation: 'square', maxPages: 2, defaultBgColor: 'linear-gradient(135deg, #FDF2E9 0%, #FADBD8 100%)', defaultText1: 'Studio Square Pair', defaultText2: 'Double Square Showcase' },

  // 3 Pages
  { id: 12, label: 'Triple Square Cascade', orientation: 'square', maxPages: 3, defaultBgColor: 'linear-gradient(135deg, #FAE8FF 0%, #F5D0FE 100%)', defaultText1: 'Square Gallery', defaultText2: 'Multi-Square Collection' },
  { id: 26, label: 'Square Trio Fan', orientation: 'square', maxPages: 3, defaultBgColor: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', defaultText1: 'Square Mosaic Trio', defaultText2: '3-Layer Square Fan' },
  { id: 27, label: 'Square Isometric Stacks', orientation: 'square', maxPages: 3, defaultBgColor: 'linear-gradient(135deg, #F5EEF8 0%, #D7BDE2 100%)', defaultText1: 'Square Deck', defaultText2: '3-Piece Square Collection' },
];

export const extractPageBgColor = (page) => {
  if (!page) return null;
  if (page.backgroundColor && page.backgroundColor !== 'transparent') return page.backgroundColor;
  if (page.bg && page.bg !== 'transparent') return page.bg;
  if (typeof page.html === 'string') {
    const bgMatch = page.html.match(/data-type=["']background["'][^>]*fill=["']([^"']+)["']/i) ||
      page.html.match(/data-name=["']Overlay["'][^>]*fill=["']([^"']+)["']/i) ||
      page.html.match(/<rect[^>]*fill=["'](#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))["']/i);
    if (bgMatch && bgMatch[1] && bgMatch[1] !== 'none' && bgMatch[1] !== 'transparent') {
      return bgMatch[1];
    }
  }
  return null;
};

export const detectFlipbookOrientation = (bookOrSettings, pages = []) => {
  // 1. Explicit orientation property
  const explicitOrient = (
    bookOrSettings?.orientation ||
    bookOrSettings?.rawBook?.orientation ||
    bookOrSettings?.Customized_Settings?.FlipbookInfo?.orientation ||
    bookOrSettings?.settings?.orientation ||
    ''
  ).toLowerCase();

  if (explicitOrient.includes('landscape') || explicitOrient.includes('horizontal') || bookOrSettings?.isLandscape) return 'landscape';
  if (explicitOrient.includes('square')) return 'square';
  if (explicitOrient.includes('portrait') || explicitOrient.includes('vertical')) return 'portrait';

  // 2. Width and height on book/settings
  const w = Number(bookOrSettings?.Customized_Settings?.FlipbookInfo?.width || bookOrSettings?.width || bookOrSettings?.rawBook?.width || bookOrSettings?.pageWidth || 0);
  const h = Number(bookOrSettings?.Customized_Settings?.FlipbookInfo?.height || bookOrSettings?.height || bookOrSettings?.rawBook?.height || bookOrSettings?.pageHeight || 0);
  if (w > 0 && h > 0) {
    if (Math.abs(w - h) < 2) return 'square';
    return w > h ? 'landscape' : 'portrait';
  }

  // 3. Inspect first available page dimensions / viewBox / SVG
  const pageList = Array.isArray(pages) && pages.length > 0
    ? pages
    : Array.isArray(bookOrSettings?.pages) && bookOrSettings.pages.length > 0
      ? bookOrSettings.pages
      : [];

  if (pageList.length > 0) {
    const firstPage = pageList[0];
    const aspect = getPageAspectRatio(firstPage);
    if (aspect) {
      if (Math.abs(aspect - 1) < 0.05) return 'square';
      return aspect > 1.05 ? 'landscape' : 'portrait';
    }
  }

  return 'portrait';
};

export const getPageAspectRatio = (page) => {
  if (!page) return null;
  if (page.width && page.height && Number(page.width) > 0 && Number(page.height) > 0) {
    return Number(page.width) / Number(page.height);
  }
  const htmlStr = page.html || page.content || page.svgString || '';
  if (typeof htmlStr === 'string' && htmlStr) {
    const vbMatch = htmlStr.match(/viewBox=["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*["']/i);
    if (vbMatch && parseFloat(vbMatch[3]) > 0 && parseFloat(vbMatch[4]) > 0) {
      return parseFloat(vbMatch[3]) / parseFloat(vbMatch[4]);
    }
    const wMatch = htmlStr.match(/<svg[^>]*\bwidth=["']([0-9.]+)(?:px|mm)?["']/i);
    const hMatch = htmlStr.match(/<svg[^>]*\bheight=["']([0-9.]+)(?:px|mm)?["']/i);
    if (wMatch && hMatch && parseFloat(wMatch[1]) > 0 && parseFloat(hMatch[1]) > 0) {
      return parseFloat(wMatch[1]) / parseFloat(hMatch[1]);
    }
  }
  return null;
};

export const normalizePageHtml = (htmlStr, fit = 'Fit') => {
  if (!htmlStr) return '';
  const trimmed = htmlStr.trim();
  // If it's an image tag, ensure it fits properly
  if (trimmed.startsWith('<img') || trimmed.startsWith('<picture')) {
    const objectFit = (fit || 'Fit').toLowerCase() === 'stretch' ? 'fill' : ((fit || 'Fit').toLowerCase() === 'fill' ? 'cover' : 'contain');
    return `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;"><img style="width: 100%; height: 100%; object-fit: ${objectFit}; display: block;" src="${trimmed.match(/src=["']([^"']+)["']/i)?.[1] || ''}" alt="Cover Page" /></div>`;
  }
  try {
    return htmlStr.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      let newAttrs = attrs;
      const widthMatch = attrs.match(/\bwidth=["']([^"']*)["']/i);
      const heightMatch = attrs.match(/\bheight=["']([^"']*)["']/i);
      const viewBoxMatch = attrs.match(/\bviewBox=["']([^"']*)["']/i);

      const wVal = widthMatch ? widthMatch[1] : null;
      const hVal = heightMatch ? heightMatch[1] : null;

      if (!viewBoxMatch && wVal && hVal && !wVal.includes('%') && !hVal.includes('%')) {
        const numW = parseFloat(wVal);
        const numH = parseFloat(hVal);
        if (!isNaN(numW) && !isNaN(numH)) {
          newAttrs += ` viewBox="0 0 ${numW} ${numH}"`;
        }
      }

      if (/\bwidth=["'][^"']*["']/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/\bwidth=["'][^"']*["']/i, 'width="100%"');
      } else {
        newAttrs += ' width="100%"';
      }
      if (/\bheight=["'][^"']*["']/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/\bheight=["'][^"']*["']/i, 'height="100%"');
      } else {
        newAttrs += ' height="100%"';
      }

      if (/\bstyle=["'][^"']*["']/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/\bstyle=["']([^"']*)["']/i, (sMatch, sVal) => {
          const cleanStyle = sVal
            .replace(/\bwidth\s*:\s*[^;]+;?/gi, '')
            .replace(/\bheight\s*:\s*[^;]+;?/gi, '')
            .trim();
          return `style="${cleanStyle ? cleanStyle + '; ' : ''}width: 100%; height: 100%; display: block;"`;
        });
      } else {
        newAttrs += ' style="width: 100%; height: 100%; display: block;"';
      }

      const fitLower = String(fit || 'Fit').toLowerCase();
      const resolvedPreserve = (fitLower === 'fit' || fitLower === 'contain')
        ? 'preserveAspectRatio="xMidYMid meet"'
        : (fitLower === 'stretch')
          ? 'preserveAspectRatio="none"'
          : 'preserveAspectRatio="xMidYMid slice"';

      if (/\bpreserveAspectRatio=["'][^"']*["']/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(/\bpreserveAspectRatio=["'][^"']*["']/i, resolvedPreserve);
      } else {
        newAttrs += ` ${resolvedPreserve}`;
      }
      return `<svg${newAttrs}>`;
    });
  } catch (e) {
    return htmlStr;
  }
};

export const renderTemplateBooks = (templateId, selectedPages = [], pages = [], scaleClass = "scale-[1.05]", customTitle = null, customSubtitle = null, fit = 'Fit') => {
  // Respect individual slot selection: if a slot is explicitly set to a page number, use that page;
  // if selectedPages is empty/not provided, default to [1, 2, 3] so pages are shown by default;
  // if a slot is explicitly set to null (or "None"), it remains null so that the slot displays its default template design.
  const hasPages = Array.isArray(pages) && pages.length > 0;
  const effectiveSelected = (Array.isArray(selectedPages) && selectedPages.length > 0)
    ? selectedPages
    : [1, 2, 3];

  const page1 = (effectiveSelected && effectiveSelected[0] && hasPages && pages[Number(effectiveSelected[0]) - 1])
    ? pages[Number(effectiveSelected[0]) - 1]
    : null;

  const page2 = (effectiveSelected && effectiveSelected[1] && hasPages && pages[Number(effectiveSelected[1]) - 1])
    ? pages[Number(effectiveSelected[1]) - 1]
    : null;

  const page3 = (effectiveSelected && effectiveSelected[2] && hasPages && pages[Number(effectiveSelected[2]) - 1])
    ? pages[Number(effectiveSelected[2]) - 1]
    : null;

  const getPageContent = (page) => {
    if (!page) return '';
    if (page.html) return page.html;
    if (page.content) return page.content;
    if (page.svgString) return page.svgString;
    const imgUrl = page.imageUrl || page.url || page.src || page.image || page.thumbnail;
    if (imgUrl && typeof imgUrl === 'string') {
      return `<img src="${imgUrl}" alt="page" />`;
    }
    return '';
  };

  const page1Html = page1 ? normalizePageHtml(getPageContent(page1), fit) : '';
  const page2Html = page2 ? normalizePageHtml(getPageContent(page2), fit) : '';
  const page3Html = page3 ? normalizePageHtml(getPageContent(page3), fit) : '';

  const page1Color = page1 ? (extractPageBgColor(page1) || '#334155') : null;

  // Calculate dynamic card style based on page aspect ratio to prevent letterboxing/padding
  const p1Ratio = getPageAspectRatio(page1);
  const p2Ratio = getPageAspectRatio(page2);
  const p3Ratio = getPageAspectRatio(page3);

  // Helper function to get snug card style matching natural page aspect ratio
  const getDynamicCardStyle = (defaultWidthVw, defaultHeightVw, pageObj, ratioVal) => {
    if (!pageObj || !ratioVal || isNaN(ratioVal) || ratioVal <= 0) {
      return { width: `${defaultWidthVw}vw`, height: `${defaultHeightVw}vw` };
    }
    // Calculate new width & height keeping the card within optimal bounds while matching ratioVal exactly
    const baseW = defaultWidthVw;
    const computedH = baseW / ratioVal;
    if (computedH > defaultHeightVw * 1.35) {
      // Too tall, clamp by height
      const clampedH = defaultHeightVw * 1.15;
      const computedW = clampedH * ratioVal;
      return { width: `${computedW.toFixed(2)}vw`, height: `${clampedH.toFixed(2)}vw` };
    } else if (computedH < defaultHeightVw * 0.7) {
      // Too wide/short, clamp by width
      const clampedW = defaultWidthVw * 1.15;
      const computedH2 = clampedW / ratioVal;
      return { width: `${clampedW.toFixed(2)}vw`, height: `${computedH2.toFixed(2)}vw` };
    }
    return { width: `${baseW}vw`, height: `${computedH.toFixed(2)}vw` };
  };

  const landscapeCard1Style = getDynamicCardStyle(15.5, 10.2, page1, p1Ratio || p2Ratio || p3Ratio);
  const landscapeCard2Style = getDynamicCardStyle(15.5, 10.2, page2, p2Ratio || p1Ratio || p3Ratio);
  const landscapeCard3Style = getDynamicCardStyle(15.5, 10.2, page3, p3Ratio || p1Ratio || p2Ratio);

  const portraitCard1Style = getDynamicCardStyle(10, 13.5, page1, p1Ratio || p2Ratio || p3Ratio);
  const portraitCard2Style = getDynamicCardStyle(10, 13.5, page2, p2Ratio || p1Ratio || p3Ratio);
  const portraitCard3Style = getDynamicCardStyle(10, 13.5, page3, p3Ratio || p1Ratio || p2Ratio);

  const squareCard1Style = getDynamicCardStyle(11.5, 11.5, page1, p1Ratio || p2Ratio || p3Ratio);
  const squareCard2Style = getDynamicCardStyle(11.5, 11.5, page2, p2Ratio || p1Ratio || p3Ratio);
  const squareCard3Style = getDynamicCardStyle(11.5, 11.5, page3, p3Ratio || p1Ratio || p2Ratio);

  switch (templateId) {
    case 1:
      // Dual Brochure Mockup - Clean Flat Paper Spreads (No dark side edge gradients)
      return (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transform ${scaleClass}`}>
          {/* Back book (Page 2 / Back Cover) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FDFBF7] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] transform -rotate-6 flex flex-col justify-between text-[#2C2825] overflow-hidden shadow-lg`}
            style={portraitCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E2DDD3] pb-[0.3vw] z-10">
                  <span className="text-[0.5vw] font-mono tracking-widest text-[#7C7267] uppercase">EDITION 02</span>
                  <div className="w-[1.1vw] h-[1.1vw] bg-[#3E3A36] rounded-[0.2vw] flex items-center justify-center text-white text-[0.55vw] font-bold">M</div>
                </div>
                <div className="my-auto py-[0.4vw] z-10 flex flex-col items-start text-left">
                  <div className="w-[1.5vw] h-[0.18vw] bg-[#8C8275] mb-[0.4vw] rounded-full" />
                  <h3 className="text-[0.85vw] font-black tracking-tight leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Design Book"}</h3>
                  <p className="text-[0.55vw] text-[#6B6359] font-medium mt-[0.2vw] leading-relaxed break-words">{customSubtitle || "Free .psd Mockup"}</p>
                  <div className="space-y-[0.18vw] mt-[0.5vw] opacity-40 w-full">
                    <div className="w-full h-[0.15vw] bg-[#D6D0C4] rounded-full" />
                    <div className="w-4/5 h-[0.15vw] bg-[#D6D0C4] rounded-full" />
                  </div>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">
                  PAGE 02
                </div>
              </>
            )}
            <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
          </div>

          {/* Front book (Page 1 / Front Cover) */}
          <div
            className={`absolute ${page1 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-xl transform rotate-6 flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={portraitCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E2DDD3] pb-[0.3vw] z-10">
                  <span className="text-[0.5vw] font-mono tracking-widest text-[#7C7267] uppercase">EDITION 01</span>
                  <div className="w-[1.1vw] h-[1.1vw] bg-[#E84E1B] rounded-[0.2vw] flex items-center justify-center text-white text-[0.55vw] font-bold">V</div>
                </div>
                <div className="my-auto py-[0.4vw] z-10 flex flex-col items-start text-left">
                  <div className="w-[1.5vw] h-[0.18vw] bg-[#E84E1B] mb-[0.4vw] rounded-full" />
                  <h3 className="text-[0.85vw] font-black tracking-tight leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Design Book"}</h3>
                  <p className="text-[0.55vw] text-[#6B6359] font-medium mt-[0.2vw] leading-relaxed break-words">{customSubtitle || "Free .psd Mockup"}</p>
                  <div className="space-y-[0.18vw] mt-[0.5vw] opacity-40 w-full">
                    <div className="w-full h-[0.15vw] bg-[#D6D0C4] rounded-full" />
                    <div className="w-4/5 h-[0.15vw] bg-[#D6D0C4] rounded-full" />
                  </div>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">
                  PAGE 01
                </div>
              </>
            )}
            <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
          </div>
        </div>
      );

    case 2:
      // Single Minimalist Standing Booklet - Pure Flat Clean Page (Pushed Left to leave right side clear for text)
      return (
        <div className={`absolute inset-0 flex items-center justify-start pl-[2.2vw] pointer-events-none transform ${scaleClass}`}>
          <div
            className={`relative rounded-[0.35vw] overflow-hidden bg-[#FAF8F5] border border-[#E7E3D8] shadow-2xl flex ${page1 ? '' : 'p-[0.7vw]'}`}
            style={portraitCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-[#FAF8F5] text-[#2C2825] flex flex-col justify-between">
                <div className="relative z-10 flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw]">
                  <div className="flex items-center gap-[0.3vw]">
                    <div className="w-[1.2vw] h-[0.15vw] bg-[#3E3A36] rounded-full" />
                    <span className="text-[0.55vw] tracking-wider uppercase font-bold text-[#3E3A36]">EDITION</span>
                  </div>
                  <span className="text-[0.45vw] font-mono text-[#8C8275]">VOL. 01</span>
                </div>
                <div className="relative z-10 my-auto py-[0.5vw]">
                  <h3 className="text-[1.05vw] font-black uppercase font-serif tracking-tight leading-snug text-[#1C1917] break-words">{customTitle || 'Premium Edition'}</h3>
                  <p className="text-[0.6vw] text-[#6B6359] font-medium mt-[0.2vw] break-words">{customSubtitle || 'Classic Minimal Design'}</p>
                  <div className="space-y-[0.2vw] mt-[0.6vw] opacity-50">
                    <div className="w-full h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                    <div className="w-3/4 h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                  </div>
                </div>
                <div className="relative z-10 flex justify-between items-center text-[0.45vw] text-[#8C8275] font-mono">
                  <span>ANNUAL REVIEW</span>
                  <span>PAGE 01</span>
                </div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </div>
            )}
          </div>
        </div>
      );

    case 3: {
      // Landscape Catalog / Wide Brochure Mockup - Dynamic snug card matching natural ratio
      return (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transform ${scaleClass}`}>
          <div
            className={`relative bg-[#FAF8F5] border border-[#E7E3D8] rounded-[0.35vw] flex overflow-hidden shadow-2xl transition-all duration-200 ${page1 ? '' : 'p-[0.7vw]'}`}
            style={landscapeCard1Style}
          >
            {/* Front Cover / Page Area */}
            <div className="w-full h-full relative overflow-hidden bg-[#FAF8F5] text-[#2C2825] flex flex-col justify-between">
              {page1 ? (
                <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                  <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
                </div>
              ) : (
                <>
                  <div className="relative z-10 flex items-center justify-between border-b border-[#E7E3D8] pb-[0.4vw]">
                    <span className="text-[0.55vw] font-black uppercase tracking-widest text-[#2C2825]">LANDSCAPE CATALOG</span>
                    <span className="text-[0.5vw] text-[#8C8275] font-mono">2026 EDITION</span>
                  </div>
                  <div className="relative z-10 my-auto py-[0.5vw]">
                    <div className="w-[2vw] h-[0.2vw] bg-[#3E3A36] mb-[0.4vw] rounded-full" />
                    <h3 className="text-[1.15vw] font-black tracking-tight leading-snug font-serif text-[#1C1917] break-words">{customTitle || "Corporate Showcase"}</h3>
                    <p className="text-[0.65vw] text-[#6B6359] mt-[0.2vw] break-words">{customSubtitle || "Annual Brochure & Catalog"}</p>
                    <div className="grid grid-cols-3 gap-[0.5vw] mt-[0.6vw] opacity-40">
                      <div className="h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                      <div className="h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                      <div className="h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                    </div>
                  </div>
                  <div className="relative z-10 flex justify-between items-center text-[0.45vw] text-[#8C8275] font-mono">
                    <span>OVERVIEW</span>
                    <span>PAGE 01</span>
                  </div>
                  <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 4:
      // Modern Magazine Mockup - Clean Flat Paper (Tilted slightly to left, pushed fully left)
      return (
        <div className={`absolute inset-0 flex items-center justify-start pl-[1.2vw] pointer-events-none transform ${scaleClass}`}>
          <div
            className={`relative rounded-[0.35vw] transform -rotate-3 overflow-hidden bg-[#FAF9F5] border border-[#E7E3D8] shadow-2xl ${page1 ? '' : 'p-[0.7vw]'}`}
            style={portraitCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <div className="w-full h-full bg-[#FAF9F5] text-[#2C2825] flex flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                  <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw]">
                    <span className="text-[0.55vw] font-black tracking-widest uppercase bg-[#2C2825] text-white px-[0.3vw] py-[0.1vw] rounded-[0.15vw]">MAGAZINE</span>
                    <span className="text-[0.48vw] font-mono text-[#8C8275]">VOL. 24</span>
                  </div>
                  <h3 className="text-[1.1vw] font-black leading-tight mt-[0.6vw] font-serif uppercase tracking-tight text-[#1C1917] break-words">{customTitle || "Magazine Lookbook"}</h3>
                  <div className="w-[1.6vw] h-[0.18vw] bg-[#8C8275] mt-[0.3vw] rounded-full" />
                </div>
                <div className="space-y-[0.2vw] opacity-40 z-10">
                  <div className="w-full h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                  <div className="w-4/5 h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                  <div className="w-3/5 h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                </div>
                <div className="z-10">
                  <p className="text-[0.6vw] text-[#6B6359] font-medium break-words">{customSubtitle || "Vol. 24 / Summer Edition"}</p>
                </div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </div>
            )}
          </div>
        </div>
      );

    case 5:
      // Dual Layer Spread Mockup - 2 Layered Clean Pages (Pushed Right so text on the left doesn't overlay)
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2.5vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Page / Book (Subtle Warm Paper) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8]'} rounded-[0.4vw] shadow-lg transform -rotate-6 -translate-x-[0.8vw] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={portraitCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <div className="p-[0.8vw] w-full h-full flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw]">
                  <span className="text-[0.5vw] font-mono font-bold text-[#7C7267]">VOL. 02</span>
                  <div className="w-[1vw] h-[1vw] bg-[#3E3A36] rounded-[0.2vw] flex items-center justify-center text-white text-[0.55vw] font-black">2</div>
                </div>
                <div className="space-y-[0.2vw] opacity-40">
                  <div className="w-full h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                  <div className="w-3/4 h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                </div>
                <div className="text-[0.42vw] text-[#8C8275] font-mono tracking-wider">PAGE 02</div>
              </div>
            )}
            <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
          </div>

          {/* Top Front Page / Book (Warm Crisp Clean Book Paper) */}
          <div
            className={`absolute ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD]'} rounded-[0.4vw] shadow-2xl transform rotate-6 translate-x-[0.8vw] flex flex-col justify-between text-[#2C2825] ${page1 ? '' : 'p-[0.8vw]'} overflow-hidden`}
            style={portraitCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw] z-10">
                  <span className="text-[0.5vw] font-bold tracking-widest uppercase font-mono text-[#7C7267]">SERIES VOL. 1</span>
                  <div className="w-[1vw] h-[1vw] bg-[#E84E1B] rounded-[0.2vw] flex items-center justify-center text-white text-[0.55vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.4vw] z-10">
                  <div className="w-[1.2vw] h-[0.18vw] bg-[#8C8275] mb-[0.3vw] rounded-full" />
                  <h3 className="text-[0.85vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Master Collection"}</h3>
                  <p className="text-[0.55vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Series Edition Vol. 1"}</p>
                </div>
                <div className="text-[0.42vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );

    case 6:
      // Isometric Floating Portfolio Mockup - 2 Layered Pages (Softcover / Pure Clean Flat Pages)
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Page / Book (Tilted Isometric) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8]'} rounded-[0.35vw] transform rotate-[-8deg] skew-y-[3deg] -translate-x-[1.4vw] -translate-y-[0.8vw] shadow-lg flex overflow-hidden text-[#3E3A36]`}
            style={portraitCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <div className="w-full h-full p-[0.8vw] flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw]">
                  <span className="text-[0.45vw] font-bold uppercase tracking-widest bg-[#3E3A36] text-white px-[0.3vw] py-[0.1vw] rounded-[0.15vw]">PORTFOLIO</span>
                  <span className="text-[0.42vw] font-mono text-[#8C8275]">VOL. 02</span>
                </div>
                <div className="space-y-[0.2vw] opacity-40">
                  <div className="w-full h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                  <div className="w-3/4 h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 02</div>
              </div>
            )}
            <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
          </div>

          {/* Front Page / Book (Isometric Perspective) */}
          <div
            className={`relative rounded-[0.35vw] transform rotate-[-3deg] skew-y-[1.5deg] overflow-hidden bg-[#FAF8F5] border border-[#E7E3D8] shadow-2xl flex ${page1 ? '' : 'p-[1vw]'}`}
            style={portraitCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-[#FAF8F5] text-[#2C2825] flex flex-col justify-between">
                <div className="relative z-10 flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw]">
                  <span className="text-[0.5vw] font-bold uppercase tracking-widest bg-[#2C2825] text-white px-[0.3vw] py-[0.1vw] rounded-[0.15vw]">LIMITED EDITION</span>
                  <span className="text-[0.45vw] font-mono text-[#8C8275]">2026</span>
                </div>
                <div className="relative z-10 my-auto py-[0.5vw]">
                  <div className="w-[1.5vw] h-[0.18vw] bg-[#8C8275] mb-[0.3vw] rounded-full" />
                  <h3 className="text-[1.05vw] font-black tracking-tight leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Minimalist Journal"}</h3>
                  <p className="text-[0.6vw] text-[#6B6359] mt-[0.2vw] break-words">{customSubtitle || "Special Edition Portfolio"}</p>
                  <div className="space-y-[0.2vw] mt-[0.5vw] opacity-40">
                    <div className="w-full h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                    <div className="w-3/4 h-[0.18vw] bg-[#D6D0C4] rounded-full" />
                  </div>
                </div>
                <div className="relative z-10 flex justify-between items-center text-[0.42vw] text-[#8C8275] font-mono">
                  <span>SPECIAL EDITION</span>
                  <span>PAGE 01</span>
                </div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </div>
            )}
          </div>
        </div>
      );

    case 7: {
      // Landscape Dual Spread - 2 Landscape Pages (Spread mockup with overlapping angle)
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back / Left Page (Landscape Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-lg transform -rotate-5 -translate-x-[2.2vw] -translate-y-[0.8vw] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={landscapeCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw] z-10">
                  <span className="text-[0.5vw] font-mono font-bold text-[#7C7267] uppercase">SPREAD 02</span>
                  <div className="w-[1vw] h-[1vw] bg-[#3E3A36] rounded-[0.2vw] flex items-center justify-center text-white text-[0.55vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.3vw] z-10">
                  <div className="w-[1.4vw] h-[0.18vw] bg-[#8C8275] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.85vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Landscape Spread"}</h3>
                  <p className="text-[0.52vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "2-Page Open Lookbook"}</p>
                </div>
                <div className="text-[0.42vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front / Right Page (Landscape Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.35vw] shadow-2xl transform rotate-3 translate-x-[1vw] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={landscapeCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw] z-10">
                  <span className="text-[0.5vw] font-mono font-bold text-[#7C7267] uppercase">SPREAD 01</span>
                  <div className="w-[1vw] h-[1vw] bg-[#10B981] rounded-[0.2vw] flex items-center justify-center text-white text-[0.55vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.3vw] z-10">
                  <div className="w-[1.4vw] h-[0.18vw] bg-[#10B981] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.85vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Landscape Spread"}</h3>
                  <p className="text-[0.52vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "2-Page Open Lookbook"}</p>
                </div>
                <div className="text-[0.42vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 8: {
      // Landscape Trio Fan - 3 Landscape Pages layered in a fan arrangement
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Page (Page 3) */}
          <div
            className={`absolute ${page3 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-md transform -rotate-10 -translate-x-[3.2vw] -translate-y-[1.2vw] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={landscapeCard3Style}
          >
            {page3 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page3Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">PAGE 03</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#4B5563] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">3</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#8C8275] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.78vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Tri-Page Showcase"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Layer Cascading Pages"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 03</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Middle Page (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-lg transform -rotate-3 -translate-x-[1.2vw] -translate-y-[0.3vw] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={landscapeCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">PAGE 02</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#3B82F6] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#3B82F6] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.78vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Tri-Page Showcase"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Layer Cascading Pages"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Page (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.35vw] shadow-2xl transform rotate-5 translate-x-[0.8vw] translate-y-[0.6vw] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={landscapeCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">PAGE 01</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#1D4ED8] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#1D4ED8] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.78vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Tri-Page Showcase"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Layer Cascading Pages"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 9: {
      // Landscape Triple Cascade - 3 Isometric / Staggered Landscape Pages
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Top-back Page (Page 3) */}
          <div
            className={`absolute ${page3 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-md transform -translate-x-[3.4vw] -translate-y-[2.2vw] rotate-[-4deg] skew-x-[-2deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={landscapeCard3Style}
          >
            {page3 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page3Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">SECTION 03</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#78350F] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">3</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#8C8275] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.78vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Portfolio Triple Spread"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Tier Landscape Preview"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 03</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Middle Page (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-lg transform -translate-x-[1.7vw] -translate-y-[0.8vw] rotate-[-2deg] skew-x-[-1deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={landscapeCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">SECTION 02</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#D97706] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#D97706] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.78vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Portfolio Triple Spread"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Tier Landscape Preview"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front / Bottom Page (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.35vw] shadow-2xl transform translate-x-[0vw] translate-y-[0.6vw] rotate-[0deg] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={landscapeCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">SECTION 01</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#F59E0B] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#F59E0B] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.78vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Portfolio Triple Spread"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Tier Landscape Preview"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 10: {
      // Square Booklet - Single Square Card Mockup
      return (
        <div className={`absolute inset-0 flex items-center justify-start pl-[2.2vw] pointer-events-none transform ${scaleClass}`}>
          <div
            className={`relative rounded-[0.4vw] overflow-hidden bg-[#FAF8F5] border border-[#E7E3D8] shadow-2xl flex ${page1 ? '' : 'p-[1vw]'}`}
            style={squareCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-[#FAF8F5] text-[#2C2825] flex flex-col justify-between">
                <div className="relative z-10 flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw]">
                  <span className="text-[0.52vw] tracking-wider uppercase font-bold text-[#3E3A36]">SQUARE EDITION</span>
                  <span className="text-[0.45vw] font-mono text-[#8C8275]">VOL. 01</span>
                </div>
                <div className="relative z-10 my-auto py-[0.4vw]">
                  <div className="w-[1.4vw] h-[0.16vw] bg-[#DC2626] mb-[0.3vw] rounded-full" />
                  <h3 className="text-[1vw] font-black uppercase font-serif tracking-tight leading-snug text-[#1C1917] break-words">{customTitle || 'Square Lookbook'}</h3>
                  <p className="text-[0.55vw] text-[#6B6359] font-medium mt-[0.2vw] break-words">{customSubtitle || 'Clean Minimal Square'}</p>
                </div>
                <div className="relative z-10 flex justify-between items-center text-[0.42vw] text-[#8C8275] font-mono">
                  <span>SQUARE 210 × 210</span>
                  <span>PAGE 01</span>
                </div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </div>
            )}
          </div>
        </div>
      );
    }

    case 11: {
      // Dual Square Showcase - 2 Layered Square Pages
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Square Page */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.8vw]'} rounded-[0.4vw] shadow-lg transform -rotate-6 -translate-x-[1.6vw] -translate-y-[0.6vw] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={squareCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw] z-10">
                  <span className="text-[0.5vw] font-mono font-bold text-[#7C7267] uppercase">SQUARE 02</span>
                  <div className="w-[1vw] h-[1vw] bg-[#059669] rounded-[0.2vw] flex items-center justify-center text-white text-[0.55vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.3vw] z-10">
                  <h3 className="text-[0.85vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Artisan Square"}</h3>
                  <p className="text-[0.5vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Creative Square Spread"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Square Page */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.8vw]'} rounded-[0.4vw] shadow-2xl transform rotate-4 translate-x-[0.8vw] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={squareCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw] z-10">
                  <span className="text-[0.5vw] font-mono font-bold text-[#7C7267] uppercase">SQUARE 01</span>
                  <div className="w-[1vw] h-[1vw] bg-[#059669] rounded-[0.2vw] flex items-center justify-center text-white text-[0.55vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.3vw] z-10">
                  <div className="w-[1.2vw] h-[0.16vw] bg-[#059669] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.85vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Artisan Square"}</h3>
                  <p className="text-[0.5vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Creative Square Spread"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 12: {
      // Triple Square Cascade - 3 Staggered Square Pages
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Page (Page 3) */}
          <div
            className={`absolute ${page3 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-md transform -translate-x-[2.8vw] -translate-y-[1.4vw] rotate-[-8deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={squareCard3Style}
          >
            {page3 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page3Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#7C7267] uppercase">SQUARE 03</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#7C3AED] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">3</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <h3 className="text-[0.75vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Square Gallery"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Multi-Square Collection"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 03</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Middle Page (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-lg transform -translate-x-[1.4vw] -translate-y-[0.5vw] rotate-[-2deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={squareCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#7C7267] uppercase">SQUARE 02</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#9333EA] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <h3 className="text-[0.75vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Square Gallery"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Multi-Square Collection"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Page (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.4vw] shadow-2xl transform translate-x-[0.2vw] translate-y-[0.5vw] rotate-[3deg] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={squareCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#7C7267] uppercase">SQUARE 01</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#A855F7] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#A855F7] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.75vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Square Gallery"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Multi-Square Collection"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 13: {
      // Editorial Minimalist (Portrait, 1 Page) - Center/Left framed with elegant border & serif header
      return (
        <div className={`absolute inset-0 flex items-center justify-start pl-[2vw] pointer-events-none transform ${scaleClass}`}>
          <div
            className={`relative rounded-[0.4vw] overflow-hidden bg-[#FFFDF9] border-2 border-[#D4AF37]/40 shadow-2xl flex ${page1 ? '' : 'p-[0.7vw]'}`}
            style={portraitCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-[#FAF8F5] text-[#1E1B18] flex flex-col justify-between">
                <div className="relative z-10 flex items-center justify-between border-b border-[#D4AF37]/30 pb-[0.3vw]">
                  <span className="text-[0.52vw] font-serif tracking-[0.2em] uppercase font-bold text-[#854D0E]">EDITORIAL</span>
                  <span className="text-[0.45vw] font-mono text-[#A16207]">NO. 03</span>
                </div>
                <div className="relative z-10 my-auto py-[0.4vw]">
                  <div className="w-[1.8vw] h-[0.18vw] bg-[#D4AF37] mb-[0.4vw] rounded-full" />
                  <h3 className="text-[1.1vw] font-bold uppercase font-serif tracking-tight leading-snug text-[#1E1B18] break-words">{customTitle || 'Editorial Digest'}</h3>
                  <p className="text-[0.58vw] text-[#713F12] font-normal mt-[0.2vw] break-words">{customSubtitle || 'Modern Minimalist Journal'}</p>
                </div>
                <div className="relative z-10 flex justify-between items-center text-[0.42vw] text-[#A16207] font-mono border-t border-[#D4AF37]/20 pt-[0.25vw]">
                  <span>ARCHIVE COLLECTION</span>
                  <span>PAGE 01</span>
                </div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </div>
            )}
          </div>
        </div>
      );
    }

    case 14: {
      // Triple Portrait Cascade (Portrait, 3 Pages) - 3 Layered Portrait Pages cascading right
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[1.8vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Page (Page 3) */}
          <div
            className={`absolute ${page3 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-md transform -translate-x-[2.8vw] -translate-y-[1.2vw] -rotate-8 flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={portraitCard3Style}
          >
            {page3 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page3Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">PAGE 03</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#3B82F6] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">3</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <h3 className="text-[0.8vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Triple Showcase"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Page Portrait Collection"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 03</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Middle Page (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-lg transform -translate-x-[1.4vw] -translate-y-[0.4vw] -rotate-2 flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={portraitCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">PAGE 02</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#2563EB] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <h3 className="text-[0.8vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Triple Showcase"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Page Portrait Collection"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Page (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.4vw] shadow-2xl transform translate-x-[0.2vw] translate-y-[0.4vw] rotate-4 flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={portraitCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">PAGE 01</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#1D4ED8] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.16vw] bg-[#1D4ED8] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.8vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Triple Showcase"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Page Portrait Collection"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 15: {
      // Portrait Fan Spread (Portrait, 3 Pages) - Left fanned out arrangement
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[1.5vw] pointer-events-none transform ${scaleClass}`}>
          {/* Left / Back Fan (Page 3) */}
          <div
            className={`absolute ${page3 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-md transform -translate-x-[3.6vw] -rotate-12 flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={portraitCard3Style}
          >
            {page3 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page3Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267]">VOL. 03</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#059669] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">3</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <h3 className="text-[0.8vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Curated Series"}</h3>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 03</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Center / Middle Fan (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-lg transform -translate-x-[1.8vw] -rotate-4 flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={portraitCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267]">VOL. 02</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#10B981] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <h3 className="text-[0.8vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Curated Series"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Layer Exhibition"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Right / Front Fan (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.4vw] shadow-2xl transform rotate-6 translate-x-[0.2vw] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={portraitCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267]">VOL. 01</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#047857] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.16vw] bg-[#047857] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.8vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Curated Series"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "3-Layer Exhibition"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 16: {
      // Stepped Portfolio Trio (Portrait, 3 Pages) - Staggered isometric steps
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Step (Page 3) */}
          <div
            className={`absolute ${page3 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-md transform -translate-x-[3.2vw] -translate-y-[1.8vw] rotate-[-5deg] skew-y-[2deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={portraitCard3Style}
          >
            {page3 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page3Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#E11D48]">STACK 03</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#BE123C] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">3</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <h3 className="text-[0.78vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Portfolio Stacks"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Annual Creative Trio"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 03</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Middle Step (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-lg transform -translate-x-[1.6vw] -translate-y-[0.7vw] rotate-[-2deg] skew-y-[1deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={portraitCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#E11D48]">STACK 02</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#E11D48] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <h3 className="text-[0.78vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Portfolio Stacks"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Annual Creative Trio"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Step (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.35vw] shadow-2xl transform translate-x-[0vw] translate-y-[0.4vw] rotate-[2deg] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={portraitCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#E11D48]">STACK 01</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#F43F5E] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.2vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#F43F5E] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.78vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Portfolio Stacks"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Annual Creative Trio"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 17: {
      // Wide Horizon Lookbook (Landscape, 1 Page) - Dynamic snug card matching natural ratio
      return (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transform ${scaleClass}`}>
          <div
            className={`relative bg-[#FAF8F5] border border-[#E7E3D8] rounded-[0.35vw] flex overflow-hidden shadow-2xl transition-all duration-200 ${page1 ? '' : 'p-[0.7vw]'}`}
            style={landscapeCard1Style}
          >
            <div className="w-full h-full relative overflow-hidden bg-[#FAF8F5] text-[#2C2825] flex flex-col justify-between">
              {page1 ? (
                <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                  <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
                </div>
              ) : (
                <>
                  <div className="relative z-10 flex items-center justify-between border-b border-[#E7E3D8] pb-[0.35vw]">
                    <span className="text-[0.55vw] font-mono tracking-widest uppercase font-bold text-[#B45309]">WIDE HORIZON</span>
                    <span className="text-[0.48vw] font-mono text-[#D97706]">EDITION 2026</span>
                  </div>
                  <div className="relative z-10 my-auto py-[0.4vw]">
                    <div className="w-[2vw] h-[0.2vw] bg-[#D97706] mb-[0.3vw] rounded-full" />
                    <h3 className="text-[1.15vw] font-black uppercase font-serif tracking-tight leading-snug text-[#1C1917] break-words">{customTitle || 'Panorama Vision'}</h3>
                    <p className="text-[0.62vw] text-[#78350F] font-medium mt-[0.2vw] break-words">{customSubtitle || 'Wide Format Annual Review'}</p>
                  </div>
                  <div className="relative z-10 flex justify-between items-center text-[0.45vw] text-[#92400E] font-mono">
                    <span>PANORAMIC BROCHURE</span>
                    <span>PAGE 01</span>
                  </div>
                  <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 18: {
      // Landscape Presentation (Landscape, 1 Page) - Dynamic snug card matching natural ratio
      return (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transform ${scaleClass}`}>
          <div
            className={`relative bg-[#FAF8F5] border-2 border-[#7C3AED]/30 rounded-[0.4vw] flex overflow-hidden shadow-2xl transition-all duration-200 ${page1 ? '' : 'p-[0.7vw]'}`}
            style={landscapeCard1Style}
          >
            <div className="w-full h-full relative overflow-hidden bg-[#FAF8F5] text-[#2C2825] flex flex-col justify-between">
              {page1 ? (
                <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                  <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
                </div>
              ) : (
                <>
                  <div className="relative z-10 flex items-center justify-between border-b border-purple-200 pb-[0.35vw]">
                    <span className="text-[0.52vw] font-mono tracking-widest uppercase font-bold text-[#6D28D9]">DECK BRIEF</span>
                    <span className="text-[0.45vw] font-mono text-[#8B5CF6]">Q4 REVIEW</span>
                  </div>
                  <div className="relative z-10 my-auto py-[0.4vw]">
                    <div className="w-[1.8vw] h-[0.18vw] bg-[#7C3AED] mb-[0.3vw] rounded-full" />
                    <h3 className="text-[1.1vw] font-black uppercase font-serif tracking-tight leading-snug text-[#1C1917] break-words">{customTitle || 'Executive Deck'}</h3>
                    <p className="text-[0.6vw] text-[#5B21B6] font-medium mt-[0.2vw] break-words">{customSubtitle || 'Quarterly Strategic Deck'}</p>
                  </div>
                  <div className="relative z-10 flex justify-between items-center text-[0.42vw] text-[#7C3AED] font-mono">
                    <span>KEYNOTE PRESENTATION</span>
                    <span>PAGE 01</span>
                  </div>
                  <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 19: {
      // Landscape Overlap Duo (Landscape, 2 Pages) - Matching dimensions with Case 7
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Landscape Page (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-lg transform -translate-x-[2.2vw] -translate-y-[0.8vw] -rotate-4 flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={landscapeCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">PANEL 02</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#2563EB] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.25vw] z-10">
                  <h3 className="text-[0.82vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Bifold Horizon"}</h3>
                  <p className="text-[0.5vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Two-Tier Horizon Display"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Landscape Page (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.35vw] shadow-2xl transform translate-x-[1vw] translate-y-[0.6vw] rotate-3 flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={landscapeCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#7C7267] uppercase">PANEL 01</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#1D4ED8] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.25vw] z-10">
                  <div className="w-[1.4vw] h-[0.16vw] bg-[#1D4ED8] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.82vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Bifold Horizon"}</h3>
                  <p className="text-[0.5vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Two-Tier Horizon Display"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono tracking-wider z-10">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 20: {
      // Dual Horizon Gallery (Landscape, 2 Pages) - Symmetric angle display
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Landscape (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-lg transform -translate-x-[2vw] -translate-y-[0.6vw] rotate-[-6deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={landscapeCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#EA580C] uppercase">VOL. 02</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#C2410C] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.25vw] z-10">
                  <h3 className="text-[0.82vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Lookbook Duo"}</h3>
                  <p className="text-[0.5vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Double Landscape Display"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Landscape (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.35vw] shadow-2xl transform translate-x-[0.6vw] translate-y-[0.6vw] rotate-[2deg] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={landscapeCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#EA580C] uppercase">VOL. 01</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#EA580C] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.25vw] z-10">
                  <div className="w-[1.4vw] h-[0.16vw] bg-[#EA580C] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.82vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Lookbook Duo"}</h3>
                  <p className="text-[0.5vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Double Landscape Display"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 21: {
      // Landscape Staggered Trio (Landscape, 3 Pages) - Staggered horizontal cascade
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Step (Page 3) */}
          <div
            className={`absolute ${page3 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-md transform -translate-x-[3.8vw] -translate-y-[1.8vw] rotate-[-5deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={landscapeCard3Style}
          >
            {page3 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page3Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.2vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#059669]">TIER 03</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#047857] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">3</div>
                </div>
                <div className="my-auto py-[0.15vw] z-10">
                  <h3 className="text-[0.76vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Wide Spectrum"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.05vw] break-words">{customSubtitle || "3-Fold Panoramic Collection"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 03</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Middle Step (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.35vw] shadow-lg transform -translate-x-[1.9vw] -translate-y-[0.6vw] rotate-[-1deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={landscapeCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.2vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#059669]">TIER 02</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#059669] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.15vw] z-10">
                  <h3 className="text-[0.76vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Wide Spectrum"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.05vw] break-words">{customSubtitle || "3-Fold Panoramic Collection"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Step (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.35vw] shadow-2xl transform translate-x-[0vw] translate-y-[0.5vw] rotate-[3deg] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={landscapeCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.2vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#059669]">TIER 01</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#10B981] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.15vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#10B981] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.76vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Wide Spectrum"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.05vw] break-words">{customSubtitle || "3-Fold Panoramic Collection"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 22: {
      // Modern Square Tile (Square, 1 Page) - Rotated square tile with subtle shadow
      return (
        <div className={`absolute inset-0 flex items-center justify-start pl-[2.2vw] pointer-events-none transform ${scaleClass}`}>
          <div
            className="relative rounded-[0.4vw] transform rotate-[-3deg] overflow-hidden bg-[#FAF8F5] border border-[#E7E3D8] shadow-2xl flex"
            style={squareCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-[#FAF8F5] text-[#2C2825] flex flex-col justify-between p-[0.7vw]">
                <div className="relative z-10 flex items-center justify-between border-b border-[#E7E3D8] pb-[0.3vw]">
                  <span className="text-[0.52vw] tracking-wider uppercase font-bold text-[#EA580C]">MODERN SQUARE</span>
                  <span className="text-[0.45vw] font-mono text-[#F97316]">VOL. 02</span>
                </div>
                <div className="relative z-10 my-auto py-[0.4vw]">
                  <div className="w-[1.4vw] h-[0.16vw] bg-[#EA580C] mb-[0.3vw] rounded-full" />
                  <h3 className="text-[1vw] font-black uppercase font-serif tracking-tight leading-snug text-[#1C1917] break-words">{customTitle || 'Square Focus'}</h3>
                  <p className="text-[0.55vw] text-[#C2410C] font-medium mt-[0.2vw] break-words">{customSubtitle || 'Contemporary Square Mockup'}</p>
                </div>
                <div className="relative z-10 flex justify-between items-center text-[0.42vw] text-[#9A3412] font-mono">
                  <span>SQUARE TILE</span>
                  <span>PAGE 01</span>
                </div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </div>
            )}
          </div>
        </div>
      );
    }

    case 23: {
      // Artisan Square Stand (Square, 1 Page) - Clean standing square frame with border
      return (
        <div className={`absolute inset-0 flex items-center justify-start pl-[2.2vw] pointer-events-none transform ${scaleClass}`}>
          <div
            className="relative rounded-[0.4vw] overflow-hidden bg-[#FAF8F5] border-2 border-[#059669]/30 shadow-2xl flex"
            style={squareCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-[#FAF8F5] text-[#2C2825] flex flex-col justify-between p-[0.7vw]">
                <div className="relative z-10 flex items-center justify-between border-b border-emerald-200 pb-[0.3vw]">
                  <span className="text-[0.52vw] tracking-wider uppercase font-bold text-[#059669]">ARTBOOK</span>
                  <span className="text-[0.45vw] font-mono text-[#047857]">EDITION</span>
                </div>
                <div className="relative z-10 my-auto py-[0.4vw]">
                  <div className="w-[1.4vw] h-[0.16vw] bg-[#059669] mb-[0.3vw] rounded-full" />
                  <h3 className="text-[1vw] font-black uppercase font-serif tracking-tight leading-snug text-[#1C1917] break-words">{customTitle || 'Square Artbook'}</h3>
                  <p className="text-[0.55vw] text-[#065F46] font-medium mt-[0.2vw] break-words">{customSubtitle || 'Single Gallery Edition'}</p>
                </div>
                <div className="relative z-10 flex justify-between items-center text-[0.42vw] text-[#047857] font-mono">
                  <span>ARTISAN SERIES</span>
                  <span>PAGE 01</span>
                </div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </div>
            )}
          </div>
        </div>
      );
    }

    case 24: {
      // Square Wing Duo (Square, 2 Pages) - Winged dual square arrangement
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[1.8vw] pointer-events-none transform ${scaleClass}`}>
          {/* Left Wing (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-lg transform -translate-x-[2.2vw] -translate-y-[0.8vw] -rotate-8 flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={squareCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#2563EB] uppercase">WING 02</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#1D4ED8] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.25vw] z-10">
                  <h3 className="text-[0.82vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Bifold Square"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Twin Square Exhibit"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Right Wing (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.4vw] shadow-2xl transform translate-x-[0.6vw] translate-y-[0.6vw] rotate-4 flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={squareCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#2563EB] uppercase">WING 01</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#2563EB] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.25vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#2563EB] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.82vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Bifold Square"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Twin Square Exhibit"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 25: {
      // Square Diagonal Pair (Square, 2 Pages) - Diagonal cascading squares
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Top-back Square (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-lg transform -translate-x-[2vw] -translate-y-[1.4vw] rotate-[-2deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={squareCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#D97706] uppercase">PAIR 02</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#B45309] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.25vw] z-10">
                  <h3 className="text-[0.82vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Studio Square Pair"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Double Square Showcase"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Bottom-front Square (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.4vw] shadow-2xl transform translate-x-[0.4vw] translate-y-[0.8vw] rotate-[2deg] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={squareCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.25vw] z-10">
                  <span className="text-[0.48vw] font-mono font-bold text-[#D97706] uppercase">PAIR 01</span>
                  <div className="w-[0.9vw] h-[0.9vw] bg-[#D97706] rounded-[0.18vw] flex items-center justify-center text-white text-[0.5vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.25vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#D97706] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.82vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Studio Square Pair"}</h3>
                  <p className="text-[0.48vw] text-[#6B6359] mt-[0.1vw] break-words">{customSubtitle || "Double Square Showcase"}</p>
                </div>
                <div className="text-[0.4vw] text-[#8C8275] font-mono">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 26: {
      // Square Trio Fan (Square, 3 Pages) - 3 Square Pages fanned symmetrically
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[1.8vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Fan (Page 3) */}
          <div
            className={`absolute ${page3 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-md transform -translate-x-[3.2vw] -translate-y-[0.8vw] rotate-[-10deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={squareCard3Style}
          >
            {page3 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page3Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.2vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#059669]">MOSAIC 03</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#047857] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">3</div>
                </div>
                <div className="my-auto py-[0.15vw] z-10">
                  <h3 className="text-[0.75vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Square Mosaic Trio"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.05vw] break-words">{customSubtitle || "3-Layer Square Fan"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 03</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Middle Fan (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-lg transform -translate-x-[1.6vw] -translate-y-[0.2vw] rotate-[-2deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={squareCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.2vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#059669]">MOSAIC 02</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#059669] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.15vw] z-10">
                  <h3 className="text-[0.75vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Square Mosaic Trio"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.05vw] break-words">{customSubtitle || "3-Layer Square Fan"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Fan (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.4vw] shadow-2xl transform translate-x-[0vw] translate-y-[0.5vw] rotate-[6deg] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={squareCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.2vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#059669]">MOSAIC 01</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#10B981] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.15vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#10B981] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.75vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Square Mosaic Trio"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.05vw] break-words">{customSubtitle || "3-Layer Square Fan"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    case 27: {
      // Square Isometric Stacks (Square, 3 Pages) - Staggered isometric steps for square cards
      return (
        <div className={`absolute inset-0 flex items-center justify-end pr-[2vw] pointer-events-none transform ${scaleClass}`}>
          {/* Back Step (Page 3) */}
          <div
            className={`absolute ${page3 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-md transform -translate-x-[3.2vw] -translate-y-[2vw] rotate-[-4deg] skew-y-[1.5deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={squareCard3Style}
          >
            {page3 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page3Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.2vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#2563EB]">DECK 03</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#1D4ED8] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">3</div>
                </div>
                <div className="my-auto py-[0.15vw] z-10">
                  <h3 className="text-[0.75vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Square Deck"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.05vw] break-words">{customSubtitle || "3-Piece Square Collection"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 03</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Middle Step (Page 2) */}
          <div
            className={`absolute ${page2 ? 'bg-white' : 'bg-[#FAF8F5] border border-[#E7E3D8] p-[0.7vw]'} rounded-[0.4vw] shadow-lg transform -translate-x-[1.6vw] -translate-y-[0.8vw] rotate-[-2deg] skew-y-[1deg] flex flex-col justify-between text-[#3E3A36] overflow-hidden`}
            style={squareCard2Style}
          >
            {page2 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page2Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.2vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#2563EB]">DECK 02</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#2563EB] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">2</div>
                </div>
                <div className="my-auto py-[0.15vw] z-10">
                  <h3 className="text-[0.75vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Square Deck"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.05vw] break-words">{customSubtitle || "3-Piece Square Collection"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 02</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>

          {/* Front Step (Page 1) */}
          <div
            className={`relative ${page1 ? 'bg-white' : 'bg-[#FCFBF8] border border-[#EAE6DD] p-[0.7vw]'} rounded-[0.4vw] shadow-2xl transform translate-x-[0vw] translate-y-[0.5vw] rotate-[1deg] flex flex-col justify-between text-[#2C2825] overflow-hidden`}
            style={squareCard1Style}
          >
            {page1 ? (
              <div className="absolute inset-0 pointer-events-none bg-white flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block">
                <div className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block" dangerouslySetInnerHTML={{ __html: page1Html }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-[0.2vw] z-10">
                  <span className="text-[0.45vw] font-mono font-bold text-[#2563EB]">DECK 01</span>
                  <div className="w-[0.85vw] h-[0.85vw] bg-[#3B82F6] rounded-[0.18vw] flex items-center justify-center text-white text-[0.48vw] font-black">1</div>
                </div>
                <div className="my-auto py-[0.15vw] z-10">
                  <div className="w-[1.2vw] h-[0.15vw] bg-[#3B82F6] mb-[0.2vw] rounded-full" />
                  <h3 className="text-[0.75vw] font-black leading-tight uppercase font-serif text-[#1C1917] break-words">{customTitle || "Square Deck"}</h3>
                  <p className="text-[0.45vw] text-[#6B6359] mt-[0.05vw] break-words">{customSubtitle || "3-Piece Square Collection"}</p>
                </div>
                <div className="text-[0.38vw] text-[#8C8275] font-mono">PAGE 01</div>
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transform rotate-45 z-20" />
              </>
            )}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};


export const getShadowRgba = (hex = '#000000', opacity = 80) => {
  if (!hex) return `rgba(0, 0, 0, ${(opacity !== undefined ? opacity : 80) / 100})`;
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2) || '0', 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4) || '0', 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6) || '0', 16) || 0;
  const a = (opacity !== undefined ? opacity : 80) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const TemplatePreview = ({
  selectedTemplate,
  bgColor, bgOpacity,
  shadowX, shadowY, shadowBlur, shadowColor, shadowOpacity,
  logoUrl,
  text1, text1FontFamily, text1FontSize, text1FontWeight, text1LetterSpacing, text1LineHeight, text1Align, text1Color, text1ColorOpacity, text1Italic, text1Underline, text1Linethrough,
  text2, text2FontFamily, text2FontSize, text2FontWeight, text2LetterSpacing, text2LineHeight, text2Align, text2Color, text2ColorOpacity, text2Italic, text2Underline, text2Linethrough,
  selectedPages = [], pages = [],
  fit = 'Fit'
}) => {
  const shadowRgba = getShadowRgba(shadowColor, shadowOpacity);
  const dropShadowFilter = `drop-shadow(${shadowX || 0}px ${shadowY || 0}px ${(shadowBlur !== undefined ? shadowBlur : 35) / 10}px ${shadowRgba})`;

  const tplId = selectedTemplate?.id || 1;
  const isTemplate2 = tplId === 2;

  let textContainerStyle = {
    left: '4%',
    bottom: '4%',
    width: '42%',
    maxWidth: '45%',
    textAlign: text1Align || 'left',
    alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
  };

  let logoContainerStyle = {
    top: '1.2vw',
    left: '1.2vw',
    maxWidth: '4.5vw',
    maxHeight: '4.5vw'
  };

  if (tplId === 1) {
    // Dual Hardcover: Books occupy the center rotated. Top-left is clear for logo. Bottom-left or bottom-center is clear for text.
    logoContainerStyle = {
      top: '1.2vw',
      left: '1.2vw',
      maxWidth: '4vw',
      maxHeight: '3.5vw'
    };
    textContainerStyle = {
      left: '4%',
      bottom: '4%',
      width: '44%',
      maxWidth: '45%',
      textAlign: text1Align || 'left',
      alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
    };
  } else if (tplId === 2) {
    // Single Standing Booklet: Book is on left side. Right area has empty negative space for logo and title.
    logoContainerStyle = {
      top: '1.2vw',
      right: '1.2vw',
      left: 'auto',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      right: '3%',
      bottom: '6%',
      width: '42%',
      maxWidth: '42%',
      textAlign: text1Align || 'right',
      alignItems: (text1Align === 'left') ? 'flex-start' : (text1Align === 'center') ? 'center' : 'flex-end'
    };
  } else if (tplId === 3) {
    // Landscape Catalog: Wide book in center. Logo top-left or top-right. Bottom header text banner.
    logoContainerStyle = {
      top: '0.8vw',
      left: '1.2vw',
      maxWidth: '3.8vw',
      maxHeight: '3.2vw'
    };
    textContainerStyle = {
      left: '5%',
      right: '5%',
      bottom: '2.5%',
      width: '90%',
      maxWidth: '90%',
      margin: '0 auto',
      textAlign: text1Align || 'center',
      alignItems: (text1Align === 'left') ? 'flex-start' : (text1Align === 'right') ? 'flex-end' : 'center'
    };
  } else if (tplId === 4) {
    // Modern Magazine: Magazine stands on left side. Right side is open for logo & editorial title without overlapping.
    logoContainerStyle = {
      top: '1.2vw',
      right: '1.2vw',
      left: 'auto',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      right: '3%',
      bottom: '6%',
      width: '40%',
      maxWidth: '40%',
      textAlign: text1Align || 'right',
      alignItems: (text1Align === 'left') ? 'flex-start' : (text1Align === 'center') ? 'center' : 'flex-end'
    };
  } else if (tplId === 5) {
    // Dual Layer Spread: Pages fan out to the right. Clean open negative space is strictly at the bottom-left.
    logoContainerStyle = {
      top: '1.2vw',
      left: '1.2vw',
      maxWidth: '4.2vw',
      maxHeight: '3.5vw'
    };
    textContainerStyle = {
      left: '3%',
      bottom: '6%',
      width: '40%',
      maxWidth: '40%',
      textAlign: text1Align || 'left',
      alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
    };
  } else if (tplId === 6) {
    // Isometric Floating Hardcover: Floating book tilted towards center-right. Left side and bottom-left have clean space.
    logoContainerStyle = {
      top: '1.5vw',
      left: '1.5vw',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      left: '5%',
      bottom: '5%',
      width: '42%',
      maxWidth: '42%',
      textAlign: text1Align || 'left',
      alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
    };
  } else if (tplId === 7) {
    // Landscape Dual Spread: 2 landscape spreads placed towards right. Left side is open for branding & title.
    logoContainerStyle = {
      top: '1.2vw',
      left: '1.5vw',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      left: '4%',
      bottom: '5%',
      width: '38%',
      maxWidth: '40%',
      textAlign: text1Align || 'left',
      alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
    };
  } else if (tplId === 8) {
    // Landscape Trio Fan: 3 layered landscape pages fanned towards right. Left side is open.
    logoContainerStyle = {
      top: '1.2vw',
      left: '1.5vw',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      left: '4%',
      bottom: '5%',
      width: '38%',
      maxWidth: '40%',
      textAlign: text1Align || 'left',
      alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
    };
  } else if (tplId === 9) {
    // Landscape Triple Cascade: 3 stepped landscape cards fanned on right. Left side is open.
    logoContainerStyle = {
      top: '1.2vw',
      left: '1.5vw',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      left: '4%',
      bottom: '5%',
      width: '38%',
      maxWidth: '40%',
      textAlign: text1Align || 'left',
      alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
    };
  } else if (tplId === 10 || tplId === 22 || tplId === 23) {
    // Square 1-Page Templates: Square card on left. Right area clear for text.
    logoContainerStyle = {
      top: '1.2vw',
      right: '1.2vw',
      left: 'auto',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      right: '3%',
      bottom: '6%',
      width: '42%',
      maxWidth: '42%',
      textAlign: text1Align || 'right',
      alignItems: (text1Align === 'left') ? 'flex-start' : (text1Align === 'center') ? 'center' : 'flex-end'
    };
  } else if (tplId === 11 || tplId === 12 || tplId === 24 || tplId === 25 || tplId === 26 || tplId === 27) {
    // Square 2-Page & 3-Page: Square cards arranged towards right. Left side open for branding & text.
    logoContainerStyle = {
      top: '1.2vw',
      left: '1.5vw',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      left: '4%',
      bottom: '5%',
      width: '38%',
      maxWidth: '40%',
      textAlign: text1Align || 'left',
      alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
    };
  } else if (tplId === 13) {
    // Editorial Minimalist (Portrait 1-Page): Card on left, right area clear for text
    logoContainerStyle = {
      top: '1.2vw',
      right: '1.2vw',
      left: 'auto',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      right: '3%',
      bottom: '6%',
      width: '42%',
      maxWidth: '42%',
      textAlign: text1Align || 'right',
      alignItems: (text1Align === 'left') ? 'flex-start' : (text1Align === 'center') ? 'center' : 'flex-end'
    };
  } else if (tplId === 14 || tplId === 15 || tplId === 16) {
    // Portrait 3-Page Templates: Cards arranged towards right, left side open for branding & text
    logoContainerStyle = {
      top: '1.2vw',
      left: '1.5vw',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      left: '4%',
      bottom: '5%',
      width: '38%',
      maxWidth: '40%',
      textAlign: text1Align || 'left',
      alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
    };
  } else if (tplId === 17 || tplId === 18) {
    // Landscape 1-Page: Wide book in center, bottom text banner
    logoContainerStyle = {
      top: '0.8vw',
      left: '1.2vw',
      maxWidth: '3.8vw',
      maxHeight: '3.2vw'
    };
    textContainerStyle = {
      left: '5%',
      right: '5%',
      bottom: '2.5%',
      width: '90%',
      maxWidth: '90%',
      margin: '0 auto',
      textAlign: text1Align || 'center',
      alignItems: (text1Align === 'left') ? 'flex-start' : (text1Align === 'right') ? 'flex-end' : 'center'
    };
  } else if (tplId === 19 || tplId === 20 || tplId === 21) {
    // Landscape 2-Page & 3-Page: Cards fanned towards right, left side open for branding & text
    logoContainerStyle = {
      top: '1.2vw',
      left: '1.5vw',
      maxWidth: '4.5vw',
      maxHeight: '4vw'
    };
    textContainerStyle = {
      left: '4%',
      bottom: '5%',
      width: '38%',
      maxWidth: '40%',
      textAlign: text1Align || 'left',
      alignItems: (text1Align === 'center') ? 'center' : (text1Align === 'right') ? 'flex-end' : 'flex-start'
    };
  }

  const bgStyle = bgColor && (bgColor.includes('gradient') || bgColor.startsWith('linear-') || bgColor.startsWith('radial-'))
    ? { backgroundImage: bgColor }
    : { backgroundColor: bgColor || '#F8FAFC' };

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden" style={bgStyle}>
      {selectedTemplate?.id ? (
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none transition-all duration-150"
          style={{
            opacity: (bgOpacity !== undefined ? bgOpacity : 100) / 100,
            filter: dropShadowFilter
          }}
        >
          {renderTemplateBooks(selectedTemplate.id, selectedPages, pages, "scale-[0.95]", text1, text2, fit)}
        </div>
      ) : (
        <img
          src={selectedTemplate?.src}
          className="absolute inset-0 pointer-events-none transition-all duration-300 z-0 w-full h-full object-cover"
          style={{ opacity: (bgOpacity !== undefined ? bgOpacity : 100) / 100, filter: dropShadowFilter }}
          alt={selectedTemplate?.label || 'Template'}
        />
      )}

      {logoUrl && (
        <div
          className="absolute z-[20] flex items-center justify-center pointer-events-none transition-all duration-150"
          style={logoContainerStyle}
        >
          <img
            src={logoUrl}
            alt="Logo"
            className="w-full h-full object-contain rounded-[0.3vw]"
          />
        </div>
      )}

      <div className="absolute z-10 flex flex-col pointer-events-none transition-all duration-150" style={textContainerStyle}>
        <h4 className="leading-tight break-words w-full" style={{
          fontFamily: text1FontFamily,
          fontSize: typeof text1FontSize === 'number' ? `${(text1FontSize / 15) * 1.1}vw` : '0.85vw',
          fontWeight: text1FontWeight === 'Regular' ? '400' : text1FontWeight === 'Medium' ? '500' : text1FontWeight === 'Semi Bold' ? '600' : text1FontWeight === 'Bold' ? '700' : '900',
          letterSpacing: text1LetterSpacing === 'Auto' ? 'normal' : `${(text1LetterSpacing || 0) / 10}em`,
          lineHeight: text1LineHeight === 'Auto' ? '1.1' : String(text1LineHeight || 1.1),
          textAlign: text1Align || 'inherit',
          color: text1Color || '#000000',
          opacity: (text1ColorOpacity !== undefined ? text1ColorOpacity : 100) / 100,
          fontStyle: text1Italic ? 'italic' : 'normal',
          textDecoration: [text1Underline ? 'underline' : '', text1Linethrough ? 'line-through' : ''].filter(Boolean).join(' ') || 'none'
        }}>{text1 || 'Hard.Cover Book'}</h4>
        <p className="whitespace-pre-wrap break-words w-full" style={{
          marginTop: '0.15vw',
          fontFamily: text2FontFamily,
          fontSize: typeof text2FontSize === 'number' ? `${(text2FontSize / 15) * 1.1}vw` : '0.55vw',
          fontWeight: text2FontWeight === 'Regular' ? '400' : text2FontWeight === 'Medium' ? '500' : text2FontWeight === 'Semi Bold' ? '600' : text2FontWeight === 'Bold' ? '700' : '900',
          letterSpacing: text2LetterSpacing === 'Auto' ? 'normal' : `${(text2LetterSpacing || 0) / 10}em`,
          lineHeight: text2LineHeight === 'Auto' ? 'normal' : String(text2LineHeight || 'normal'),
          textAlign: text2Align || 'inherit',
          color: text2Color || '#000000',
          opacity: (text2ColorOpacity !== undefined ? text2ColorOpacity : 100) / 100,
          fontStyle: text2Italic ? 'italic' : 'normal',
          textDecoration: [text2Underline ? 'underline' : '', text2Linethrough ? 'line-through' : ''].filter(Boolean).join(' ') || 'none'
        }}>{text2 || 'Free .psd Mockup'}</p>
      </div>
    </div>
  );
};



export const CoverPicturePopup = ({ onClose, onSave, onPreview, settings, pages = [], currentBook = null, zIndex = 'z-[200]', inline = false }) => {
  // Automatically detect flipbook orientation from currentBook, settings, or pages
  const detectedBookOrientation = useMemo(() => {
    return detectFlipbookOrientation(currentBook || settings, pages);
  }, [currentBook, settings, pages]);

  const incomingTplId = typeof settings?.coverPicture?.selectedTemplate === 'object' && settings?.coverPicture?.selectedTemplate
    ? settings.coverPicture.selectedTemplate.id
    : Number(settings?.coverPicture?.selectedTemplate || settings?.coverPicture?.templateId || 0);

  // If incoming template matches orientation, use it; otherwise fallback to first template matching detected orientation
  const resolvedInitialTpl = useMemo(() => {
    const found = COVER_TEMPLATES.find(t => t.id === incomingTplId);
    if (found && (found.orientation || 'portrait').toLowerCase() === detectedBookOrientation.toLowerCase()) {
      return found;
    }
    const matchingOrientTpl = COVER_TEMPLATES.find(t => (t.orientation || 'portrait').toLowerCase() === detectedBookOrientation.toLowerCase());
    return matchingOrientTpl || COVER_TEMPLATES[0];
  }, [incomingTplId, detectedBookOrientation]);

  const [option, setOption] = useState(settings?.coverPicture?.type || 'template');
  const [activeTab, setActiveTab] = useState(settings?.coverPicture?.activeTab || 'cover');
  const [coverCategory, setCoverCategory] = useState(
    detectedBookOrientation === 'landscape' ? 'Landscape' : detectedBookOrientation === 'square' ? 'Square' : 'Portrait'
  );
  const [selectedTemplate, setSelectedTemplate] = useState(resolvedInitialTpl);

  const [uploadedImage, setUploadedImage] = useState(settings.coverPicture?.type === 'upload' ? settings.coverPicture.url : null);
  const [originalImage, setOriginalImage] = useState(settings.coverPicture?.type === 'upload' ? settings.coverPicture.url : null);
  const [isCropping, setIsCropping] = useState(false);
  const previewImgRef = React.useRef(null);
  const templatePreviewContainerRef = React.useRef(null);
  const [isDownloadingCover, setIsDownloadingCover] = useState(false);
  const [rawFile, setRawFile] = useState(null);
  const [imageFixType, setImageFixType] = useState(settings.coverPicture?.fit || 'Fit');
  const [templateFit, setTemplateFit] = useState(settings.coverPicture?.templateFit || settings.coverPicture?.fit || 'Fit');
  const [showMenu, setShowMenu] = useState(false);

  const initialTpl = resolvedInitialTpl;
  const initialText1 = settings.coverPicture?.text1 || initialTpl?.defaultText1 || 'Name of the Book';
  const initialText2 = settings.coverPicture?.text2 || initialTpl?.defaultText2 || '“Turn every page into an experience,\nA flipbook that brings your stories to life.”';
  const [text1, setText1] = useState(initialText1);
  const [text2, setText2] = useState(initialText2);
  const [bgColor, setBgColor] = useState(settings.coverPicture?.bgColor || initialTpl?.defaultBgColor || '#F8FAFC');
  const [bgOpacity, setBgOpacity] = useState(settings.coverPicture?.bgOpacity || 100);
  const [shadowColor, setShadowColor] = useState(settings.coverPicture?.shadowColor || '#000000');
  const [shadowOpacity, setShadowOpacity] = useState(settings.coverPicture?.shadowOpacity !== undefined ? settings.coverPicture.shadowOpacity : 0);
  const [shadowX, setShadowX] = useState(settings.coverPicture?.shadowX || 0);
  const [shadowY, setShadowY] = useState(settings.coverPicture?.shadowY || 0);
  const [shadowBlur, setShadowBlur] = useState(settings.coverPicture?.shadowBlur !== undefined ? settings.coverPicture.shadowBlur : 0);
  const [logoUrl, setLogoUrl] = useState(settings.coverPicture?.logoUrl || null);
  const [rawLogoFile, setRawLogoFile] = useState(null);
  const logoInputRef = React.useRef(null);
  const scrollContainerRef = React.useRef(null);
  const middleDropdownRef = React.useRef(null);

  // Typography states for Text 1
  const [text1FontFamily, setText1FontFamily] = useState(settings.coverPicture?.text1FontFamily || 'Poppins');
  const [text1FontSize, setText1FontSize] = useState(settings.coverPicture?.text1FontSize || 10);
  const [text1FontWeight, setText1FontWeight] = useState(settings.coverPicture?.text1FontWeight || 'Semi Bold');
  const [text1LetterSpacing, setText1LetterSpacing] = useState(settings.coverPicture?.text1LetterSpacing || 'Auto');
  const [text1LineHeight, setText1LineHeight] = useState(settings.coverPicture?.text1LineHeight || 'Auto');
  const [text1Align, setText1Align] = useState(settings.coverPicture?.text1Align || 'left');
  const [text1Bold, setText1Bold] = useState(settings.coverPicture?.text1Bold || false);
  const [text1Italic, setText1Italic] = useState(settings.coverPicture?.text1Italic || false);
  const [text1Underline, setText1Underline] = useState(settings.coverPicture?.text1Underline || false);
  const [text1Linethrough, setText1Linethrough] = useState(settings.coverPicture?.text1Linethrough || false);
  const [text1Color, setText1Color] = useState(settings.coverPicture?.text1Color || '#000000');
  const [text1ColorOpacity, setText1ColorOpacity] = useState(settings.coverPicture?.text1ColorOpacity || 100);

  // Typography states for Text 2
  const [text2FontFamily, setText2FontFamily] = useState(settings.coverPicture?.text2FontFamily || 'Outfit');
  const [text2FontSize, setText2FontSize] = useState(settings.coverPicture?.text2FontSize || 7);
  const [text2FontWeight, setText2FontWeight] = useState(settings.coverPicture?.text2FontWeight || 'Regular');
  const [text2LetterSpacing, setText2LetterSpacing] = useState(settings.coverPicture?.text2LetterSpacing || 'Auto');
  const [text2LineHeight, setText2LineHeight] = useState(settings.coverPicture?.text2LineHeight || 'Auto');
  const [text2Align, setText2Align] = useState(settings.coverPicture?.text2Align || 'left');
  const [text2Bold, setText2Bold] = useState(settings.coverPicture?.text2Bold || false);
  const [text2Italic, setText2Italic] = useState(settings.coverPicture?.text2Italic || false);
  const [text2Underline, setText2Underline] = useState(settings.coverPicture?.text2Underline || false);
  const [text2Linethrough, setText2Linethrough] = useState(settings.coverPicture?.text2Linethrough || false);
  const [text2Color, setText2Color] = useState(settings.coverPicture?.text2Color || '#000000');
  const [text2ColorOpacity, setText2ColorOpacity] = useState(settings.coverPicture?.text2ColorOpacity || 100);

  // Typography UI states
  const [activeTextEditor, setActiveTextEditor] = useState(null);
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showFontWeightDropdown, setShowFontWeightDropdown] = useState(false);
  const [showLetterSpacingSlider, setShowLetterSpacingSlider] = useState(false);
  const [showLineHeightSlider, setShowLineHeightSlider] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false);

  const [openSlotDropdown, setOpenSlotDropdown] = useState(null); // index of currently open slot dropdown (0, 1, or 2)

  // Direct download cover image at standard 4:3 high-resolution (1200x900)
  const handleDownloadCoverImage = async () => {
    if (isDownloadingCover) return;
    setIsDownloadingCover(true);
    try {
      const bookName = (currentBook?.flipbookName || currentBook?.title || 'flipbook')
        .replace(/[^a-z0-9_-]/gi, '_');

      if (option === 'upload' && uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width = 1200;
          cvs.height = 900;
          const ctx = cvs.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 1200, 900);

          const srcW = img.naturalWidth || img.width || 1200;
          const srcH = img.naturalHeight || img.height || 900;
          let renderW = 1200;
          let renderH = 900;
          let offsetX = 0;
          let offsetY = 0;

          if (imageFixType === 'Stretch') {
            renderW = 1200;
            renderH = 900;
          } else if (imageFixType === 'Fill') {
            const scale = Math.max(1200 / srcW, 900 / srcH);
            renderW = Math.round(srcW * scale);
            renderH = Math.round(srcH * scale);
            offsetX = Math.round((1200 - renderW) / 2);
            offsetY = Math.round((900 - renderH) / 2);
          } else {
            // Fit / Contain
            const scale = Math.min(1200 / srcW, 900 / srcH);
            renderW = Math.round(srcW * scale);
            renderH = Math.round(srcH * scale);
            offsetX = Math.round((1200 - renderW) / 2);
            offsetY = Math.round((900 - renderH) / 2);
          }

          ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
          cvs.toBlob((blob) => {
            if (blob) saveAs(blob, `${bookName}_Cover_Picture.png`);
            setIsDownloadingCover(false);
          }, 'image/png');
        };
        img.onerror = () => {
          setIsDownloadingCover(false);
          alert('Could not download image. Please try again.');
        };
        img.src = uploadedImage;
        return;
      }

      if (option === 'template') {
        const el = templatePreviewContainerRef.current;
        if (!el) {
          setIsDownloadingCover(false);
          return;
        }

        const rect = el.getBoundingClientRect();
        const longestSide = Math.max(rect.width, rect.height) || 800;
        const scale = Math.max(1.5, 1200 / longestSide);

        const rawCanvas = await html2canvas(el, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: null
        });

        if (rawCanvas) {
          const out = document.createElement('canvas');
          out.width = 1200;
          out.height = 900;
          const ctx = out.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 1200, 900);

          const srcW = rawCanvas.width;
          const srcH = rawCanvas.height;
          const scaleFactor = Math.min(1200 / srcW, 900 / srcH);
          const rW = Math.round(srcW * scaleFactor);
          const rH = Math.round(srcH * scaleFactor);
          const offX = Math.round((1200 - rW) / 2);
          const offY = Math.round((900 - rH) / 2);

          ctx.drawImage(rawCanvas, 0, 0, srcW, srcH, offX, offY, rW, rH);
          out.toBlob((blob) => {
            if (blob) saveAs(blob, `${bookName}_Cover_Picture.png`);
            setIsDownloadingCover(false);
          }, 'image/png');
        } else {
          setIsDownloadingCover(false);
        }
      }
    } catch (err) {
      console.error('Error downloading cover:', err);
      setIsDownloadingCover(false);
      alert('Failed to generate cover download.');
    }
  };

  // Automatically scroll container when slot dropdown opens
  useEffect(() => {
    if (openSlotDropdown !== null) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, [openSlotDropdown]);

  // Current template's maximum pages capacity (1, 2, or 3)
  const templateMaxPages = selectedTemplate?.maxPages || 2;

  // Selected pages array (indices or page numbers 1-based)
  const [selectedPages, setSelectedPages] = useState(() => {
    const raw = settings.coverPicture?.selectedPages;
    if (Array.isArray(raw)) {
      return raw.slice(0, templateMaxPages);
    }
    return [1];
  });

  // Keep selectedPages trimmed or adjusted whenever template changes its maxPages
  useEffect(() => {
    setSelectedPages(prev => {
      const filtered = (prev || []).filter(p => p !== null && p !== undefined);
      if (filtered.length === 0) {
        return [1];
      }
      return filtered.slice(0, templateMaxPages);
    });
  }, [templateMaxPages]);

  // Track the most recently selected/interacted page for thumbnail preview display
  const [lastInteractedPage, setLastInteractedPage] = useState(() => {
    if (settings.coverPicture?.selectedPages?.length > 0) {
      return settings.coverPicture.selectedPages[0];
    }
    return 1;
  });

  // Extract colors present on the flipbook pages or template
  const colorsOnPageList = useMemo(() => {
    const set = new Set();
    // 1. Extract from template/current colors
    if (bgColor && typeof bgColor === 'string') {
      const hexMatches = bgColor.match(/#[0-9A-Fa-f]{6}\b/g) || [];
      hexMatches.forEach(c => set.add(c.toUpperCase()));
    }
    if (shadowColor && typeof shadowColor === 'string' && shadowColor.startsWith('#')) {
      set.add(shadowColor.toUpperCase());
    }
    if (text1Color && typeof text1Color === 'string' && text1Color.startsWith('#')) {
      set.add(text1Color.toUpperCase());
    }
    if (text2Color && typeof text2Color === 'string' && text2Color.startsWith('#')) {
      set.add(text2Color.toUpperCase());
    }

    // 2. Extract colors from flipbook page HTMLs
    if (Array.isArray(pages) && pages.length > 0) {
      pages.forEach(p => {
        if (p?.backgroundColor && p.backgroundColor.startsWith('#')) {
          set.add(p.backgroundColor.toUpperCase());
        }
        if (typeof p?.html === 'string') {
          const hexMatches = p.html.match(/#[0-9A-Fa-f]{6}\b/g) || [];
          hexMatches.slice(0, 10).forEach(c => set.add(c.toUpperCase()));
        }
      });
    }

    return Array.from(set).slice(0, 12);
  }, [bgColor, shadowColor, text1Color, text2Color, pages]);

  // Notify parent of changes for real-time preview
  React.useEffect(() => {
    if (onPreview) {
      onPreview({
        type: option,
        activeTab,
        selectedTemplate,
        url: option === 'upload' ? uploadedImage : (selectedTemplate?.src || ''),
        fit: option === 'upload' ? imageFixType : templateFit,
        templateFit,
        text1,
        text2,
        bgColor,
        bgOpacity,
        shadowColor,
        shadowOpacity,
        shadowX,
        shadowY,
        shadowBlur,
        logoUrl,
        text1FontFamily,
        text1FontSize,
        text1FontWeight,
        text1LetterSpacing,
        text1LineHeight,
        text1Align,
        text1Bold,
        text1Italic,
        text1Underline,
        text1Linethrough,
        text1Color,
        text1ColorOpacity,
        text2FontFamily,
        text2FontSize,
        text2FontWeight,
        text2LetterSpacing,
        text2LineHeight,
        text2Align,
        text2Bold,
        text2Italic,
        text2Underline,
        text2Linethrough,
        text2Color,
        text2ColorOpacity,
        selectedPages
      });
    }
  }, [option, activeTab, selectedTemplate, uploadedImage, imageFixType, templateFit, text1, text2, bgColor, bgOpacity, shadowColor, shadowOpacity, shadowX, shadowY, shadowBlur, logoUrl, text1FontFamily, text1FontSize, text1FontWeight, text1LetterSpacing, text1LineHeight, text1Align, text1Bold, text1Italic, text1Underline, text1Linethrough, text1Color, text1ColorOpacity, text2FontFamily, text2FontSize, text2FontWeight, text2LetterSpacing, text2LineHeight, text2Align, text2Bold, text2Italic, text2Underline, text2Linethrough, text2Color, text2ColorOpacity, selectedPages, onPreview]);

  const handleCoverUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRawFile(file);
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setOriginalImage(url);
      setShowMenu(false);
    }
  };

  const handleLogoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRawLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };
  const togglePageSelection = (pageNum) => {
    setSelectedPages(prev =>
      prev.includes(pageNum)
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum]
    );
  };
  const innerContent = (
    <div className={`${inline ? 'px-[0.2vw] pt-[0.2vw]' : 'px-[1.5vw]'} pb-[1vw] flex flex-col h-[32.2vw] overflow-hidden`}>
      {/* Options */}
      <div className="flex items-center gap-[0.8vw] mb-[0.8vw] shrink-0">
        <button
          onClick={() => setOption('template')}
          className={`px-[1.2vw] py-[0.5vw] rounded-[0.5vw] font-semibold text-[0.75vw] transition-all cursor-pointer ${option === 'template' ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Add from Templates
        </button>
        <button
          onClick={() => setOption('upload')}
          className={`px-[1.2vw] py-[0.5vw] rounded-[0.5vw] font-semibold text-[0.75vw] transition-all cursor-pointer ${option === 'upload' ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Upload cover picture
        </button>

        {option === 'upload' && (
          <div className="flex items-center gap-[0.8vw] ml-[2vw]">
            <label className="text-[0.75vw] font-semibold text-gray-700">Image fix type : </label>
            <PremiumDropdown
              options={['Fit', 'Fill', 'Stretch', 'Crop']}
              value={imageFixType || 'Fit'}
              onChange={(val) => {
                setImageFixType(val);
                if (val === 'Crop' && uploadedImage) {
                  setIsCropping(true);
                }
              }}
              width="6vw"
              align="right"
            />
          </div>
        )}
      </div>

      {option === 'upload' ? (
        <div className="flex gap-[2vw] flex-1 min-h-0">
          {/* Left Upload/Preview Area */}
          <div className="w-[50%] flex items-start justify-center pt-[0.5vw] relative">
            {!uploadedImage ? (
              <div className="w-full aspect-[4/3] max-w-[24vw] border-[0.15vw] border-dashed border-gray-300 rounded-[0.9vw] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleCoverUpload} />
                <span className="text-[0.75vw] text-gray-400 font-semibold mb-[1vw]">Drag & Drop or <span className="text-[#4A3AFF] font-bold">Upload</span></span>
                <Upload size="1.8vw" className="text-gray-400 mb-[1vw]" strokeWidth={1.5} />
                <span className="text-[0.6vw] text-gray-400 mb-[0.3vw]">Dimensions 1200 X 900 px (4:3)</span>
                <span className="text-[0.6vw] text-gray-400">Supported File Format : JPG, PNG</span>
              </div>
            ) : (
              <div className="w-full aspect-[4/3] max-w-[24vw] bg-[#edd8cd] rounded-[0.9vw] overflow-hidden relative group shadow-inner flex items-center justify-center border border-amber-100/40">
                <img
                  ref={previewImgRef}
                  src={uploadedImage}
                  className="w-full h-full object-cover"
                  alt="Uploaded Cover"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="absolute top-[0.8vw] right-[0.8vw] w-[2.2vw] h-[2.2vw] bg-white rounded-full flex items-center justify-center text-gray-600 shadow-lg hover:bg-gray-100 transition-all z-30"
                  title="More Options"
                >
                  <MoreVertical size="1.2vw" />
                </button>

                {showMenu && (
                  <div className="absolute top-[2vw] right-[0.8vw] bg-white rounded-[0.4vw] shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center py-[0.5vw] border border-gray-100 z-20 overflow-hidden">
                    <button
                      className="px-[1.2vw] py-[0.5vw] hover:bg-gray-50 text-[0.75vw] font-semibold text-gray-700 w-full text-center border-b border-gray-100 whitespace-nowrap"
                      onClick={() => {
                        document.getElementById('replace-cover-input').click();
                        setShowMenu(false);
                      }}
                    >
                      Replace Image
                    </button>
                    <button
                      className="px-[1.2vw] py-[0.5vw] hover:bg-gray-50 text-[0.75vw] font-semibold text-red-500 w-full text-center whitespace-nowrap"
                      onClick={() => {
                        setUploadedImage(null);
                        setOriginalImage(null);
                        setRawFile(null);
                        setShowMenu(false);
                      }}
                    >
                      Delete Image
                    </button>
                  </div>
                )}
                <input type="file" id="replace-cover-input" className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </div>
            )}
          </div>

          {/* Right Area */}
          <div className="w-[50%] flex flex-col justify-end mb-[2.5vw] pl-[1vw]">
            <p className="text-[0.65vw] text-gray-500 font-medium mb-[1vw] pr-[0.5vw]">
              <span className="text-red-500">*</span> Your selected or uploaded image will be saved as the flipbook cover after clicking <strong>"Change Cover"</strong>
            </p>
            <div className="flex gap-[0.8vw] ">
              <button
                onClick={onClose}
                className="flex-1 py-[0.6vw] border border-gray-900 rounded-[0.5vw] text-[0.8vw] font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-[0.4vw] shadow-sm"
              >
                <X size="1vw" strokeWidth={2.5} /> Cancel
              </button>
              {uploadedImage && (
                <button
                  onClick={handleDownloadCoverImage}
                  disabled={isDownloadingCover}
                  className="px-[1.2vw] py-[0.6vw] border border-gray-300 bg-white rounded-[0.5vw] text-[0.8vw] font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-[0.4vw] shadow-sm disabled:opacity-50"
                  title="Download Cover Image (1200x900)"
                >
                  {isDownloadingCover ? <Loader size="1vw" className="animate-spin" /> : <Download size="1vw" />}
                  Download Cover
                </button>
              )}
              <button
                onClick={() => {
                  onSave({
                    type: 'upload',
                    url: uploadedImage,
                    fit: imageFixType,
                    rawFile: rawFile
                  });
                  onClose();
                }}
                className="flex-1 py-[0.6vw] bg-black text-white rounded-[0.5vw] text-[0.8vw] font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-[0.4vw] shadow-sm"
              >
                <Check size="1vw" strokeWidth={3} /> Change Cover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex gap-[1vw] flex-1 min-h-0">
            {/* Left Preview */}
            <div className="w-[45%] flex items-start justify-center pt-[0.5vw] relative">
              <div className="relative group rounded-[0.9vw] bg-[#F8FAFC] w-full aspect-[4/3] max-w-[24vw] flex items-center justify-center shadow-inner overflow-hidden border border-gray-200/50">
                {option === 'template' && selectedTemplate ? (
                  <div ref={templatePreviewContainerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gray-100 rounded-[0.5vw]">
                    <TemplatePreview
                      selectedTemplate={selectedTemplate}
                      bgColor={bgColor} bgOpacity={bgOpacity}
                      shadowX={shadowX} shadowY={shadowY} shadowBlur={shadowBlur} shadowColor={shadowColor} shadowOpacity={shadowOpacity}
                      logoUrl={logoUrl}
                      text1={text1} text1FontFamily={text1FontFamily} text1FontSize={text1FontSize} text1FontWeight={text1FontWeight} text1LetterSpacing={text1LetterSpacing} text1LineHeight={text1LineHeight} text1Align={text1Align} text1Color={text1Color} text1ColorOpacity={text1ColorOpacity} text1Italic={text1Italic} text1Underline={text1Underline} text1Linethrough={text1Linethrough}
                      text2={text2} text2FontFamily={text2FontFamily} text2FontSize={text2FontSize} text2FontWeight={text2FontWeight} text2LetterSpacing={text2LetterSpacing} text2LineHeight={text2LineHeight} text2Align={text2Align} text2Color={text2Color} text2ColorOpacity={text2ColorOpacity} text2Italic={text2Italic} text2Underline={text2Underline} text2Linethrough={text2Linethrough}
                      selectedPages={selectedPages} pages={pages}
                      fit={templateFit}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-[0.75vw] font-medium">
                    No preview
                  </div>
                )}
              </div>
            </div>

            {/* Right Controls */}
            <div className="w-[55%] flex flex-col bg-gray-200/60 rounded-[1.2vw] border-[0.12vw] border-gray-300 overflow-hidden relative">
              {/* Tabs Header */}
              <div className="flex bg-gray-200/90 border-b border-gray-300 shrink-0">
                <button
                  onClick={() => setActiveTab('cover')}
                  className={`flex-1 py-[0.5vw] text-[0.75vw] font-semibold transition-all relative ${activeTab === 'cover' ? 'text-gray-900 bg-white/20' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Cover Template
                  {activeTab === 'cover' && <div className="absolute bottom-0 left-0 right-0 h-[0.1vw] bg-black rounded-full" />}
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`flex-1 py-[0.5vw] text-[0.75vw] font-semibold transition-all relative ${activeTab === 'edit' ? 'text-gray-900 bg-white/20' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Edit Template
                  {activeTab === 'edit' && <div className="absolute bottom-0 left-0 right-0 h-[0.1vw] bg-black rounded-full" />}
                </button>
              </div>

              {/* White Content Container */}
              <div className="flex-1 bg-white overflow-hidden m-[0.1vw] rounded-b-[1.1vw] relative shadow-inner flex flex-col">
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-[1vw] py-[1.2vw] pr-[1.2vw] custom-popup-scrollbar">
                  {activeTab === 'cover' ? (
                    <div className="flex flex-col gap-[0.8vw]">
                      {/* Sub-tabs / Filter pills: Hide categories that don't match the flipbook's page orientation */}
                      {(!detectedBookOrientation || detectedBookOrientation === 'all') && (
                        <div className="flex items-center gap-[0.35vw] bg-gray-100 p-[0.2vw] rounded-[0.45vw] w-fit">
                          {[
                            { id: 'Portrait', label: 'Portrait' },
                            { id: 'Landscape', label: 'Landscape' },
                            { id: 'Square', label: 'Square' }
                          ].map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCoverCategory(cat.id)}
                              className={`px-[0.7vw] py-[0.25vw] text-[0.65vw] font-bold rounded-[0.35vw] transition-all cursor-pointer ${coverCategory === cat.id
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Templates Grid filtered by detected book orientation / category */}
                      <div className="grid grid-cols-3 gap-[0.5vw]">
                        {COVER_TEMPLATES.filter(tpl => {
                          const orient = (tpl.orientation || 'portrait').toLowerCase();
                          const targetOrient = (detectedBookOrientation || coverCategory || 'portrait').toLowerCase();
                          return orient === targetOrient;
                        }).map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => {
                              setSelectedTemplate(tpl);
                              if (tpl.defaultText1) setText1(tpl.defaultText1);
                              if (tpl.defaultText2) setText2(tpl.defaultText2);
                              if (tpl.defaultBgColor) setBgColor(tpl.defaultBgColor);
                            }}
                            className={`aspect-[4/3] rounded-[0.4vw] cursor-pointer overflow-hidden border-[0.15vw] transition-all hover:scale-[1.03] hover:shadow-md relative group ${selectedTemplate?.id === tpl.id
                              ? 'border-[#4A3AFF] shadow-[0_0_0_0.15vw_rgba(74,58,255,0.3)]'
                              : 'border-transparent hover:border-gray-400'
                              }`}
                            title={tpl.label}
                          >
                            {tpl.id ? (
                              <div
                                className="w-full h-full relative overflow-hidden pointer-events-none"
                                style={tpl.defaultBgColor?.includes('gradient')
                                  ? { backgroundImage: tpl.defaultBgColor }
                                  : { backgroundColor: tpl.defaultBgColor || '#F8FAFC' }
                                }
                              >
                                <div className="absolute inset-0 w-[400%] h-[400%] origin-top-left transform scale-[0.25]">
                                  <TemplatePreview
                                    selectedTemplate={tpl}
                                    bgColor={tpl.defaultBgColor || '#F8FAFC'}
                                    bgOpacity={100}
                                    text1={tpl.defaultText1}
                                    text2={tpl.defaultText2}
                                    selectedPages={[]}
                                    pages={pages}
                                  />
                                </div>
                              </div>
                            ) : (
                              <img src={tpl.src} alt={tpl.label} className="w-full h-full object-cover" />
                            )}
                            {selectedTemplate?.id === tpl.id && (
                              <div className="absolute inset-0 bg-[#4A3AFF]/15 flex items-start justify-end p-[0.3vw]">
                                <div className="w-[1vw] h-[1vw] bg-[#4A3AFF] rounded-full flex items-center justify-center shadow-md">
                                  <svg viewBox="0 0 10 10" className="w-[0.6vw] h-[0.6vw]" fill="none">
                                    <polyline points="2,5 4.5,7.5 8,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[0.5vw] font-semibold text-center py-[0.2vw] opacity-0 group-hover:opacity-100 transition-opacity">
                              {tpl.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-[1.2vw]">
                      {/* Text 1 Row */}
                      <div className="flex items-center gap-[0.5vw] min-w-0">
                        <span className="text-[0.7vw] font-semibold text-gray-700 w-[6vw] shrink-0">Enter Text 1 :</span>
                        <div className="flex-1 flex gap-[0.5vw] items-center relative">
                          <div className="flex-1 bg-white border border-gray-400 rounded-[0.6vw] flex items-center px-[0.8vw] h-[2.2vw] relative">
                            <input type="text" value={text1} onChange={e => setText1(e.target.value)} className="flex-1 bg-transparent text-[0.8vw] outline-none text-gray-700 font-medium focus:border-black transition-colors pr-[1.8vw]" placeholder="Title" />
                            <Edit2 size="0.8vw" className="text-gray-400 absolute right-[0.6vw]" />
                          </div>
                          <button
                            onClick={() => setActiveTextEditor(activeTextEditor === 'text1' ? null : 'text1')}
                            className={`p-[0.4vw] rounded-[0.4vw] transition-colors cursor-pointer ${activeTextEditor === 'text1' ? 'bg-[#4A3AFF] text-white hover:bg-blue-700 shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
                          >
                            <Sliders size="1vw" />
                          </button>
                          {activeTextEditor === 'text1' && (
                            <TypographyPanel
                              isT1={true}
                              fontFamily={text1FontFamily} setFontFamily={setText1FontFamily}
                              fontSize={text1FontSize} setFontSize={setText1FontSize}
                              fontWeight={text1FontWeight} setFontWeight={setText1FontWeight}
                              letterSpacing={text1LetterSpacing} setLetterSpacing={setText1LetterSpacing}
                              lineHeight={text1LineHeight} setLineHeight={setText1LineHeight}
                              align={text1Align} setAlign={setText1Align}
                              italic={text1Italic} setItalic={setText1Italic}
                              underline={text1Underline} setUnderline={setText1Underline}
                              linethrough={text1Linethrough} setLinethrough={setText1Linethrough}
                              color={text1Color} setColor={setText1Color}
                              opacity={text1ColorOpacity} setOpacity={setText1ColorOpacity}
                              onClose={() => setActiveTextEditor(null)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Text 2 Row */}
                      <div className="flex items-start gap-[0.5vw] min-w-0">
                        <span className="text-[0.7vw] font-semibold text-gray-700 w-[6vw] shrink-0 mt-[0.5vw]">Enter Text 2 :</span>
                        <div className="flex-1 flex gap-[0.5vw] items-start relative">
                          <div className="flex-1 bg-white border border-gray-400 rounded-[0.6vw] flex flex-col p-[0.7vw] min-h-[5.5vw] relative">
                            <textarea value={text2} onChange={e => setText2(e.target.value)} className="flex-1 bg-transparent text-[0.8vw] outline-none text-gray-700 resize-none h-full font-medium pr-[1.8vw]" placeholder="Supporting Text" />
                            <Edit2 size="0.8vw" className="text-gray-400 absolute bottom-[0.7vw] right-[0.7vw]" />
                          </div>
                          <button
                            onClick={() => setActiveTextEditor(activeTextEditor === 'text2' ? null : 'text2')}
                            className={`p-[0.4vw] rounded-[0.4vw] transition-colors cursor-pointer ${activeTextEditor === 'text2' ? 'bg-[#4A3AFF] text-white hover:bg-blue-700 shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
                          >
                            <Sliders size="1vw" />
                          </button>
                          {activeTextEditor === 'text2' && (
                            <TypographyPanel
                              isT1={false}
                              fontFamily={text2FontFamily} setFontFamily={setText2FontFamily}
                              fontSize={text2FontSize} setFontSize={setText2FontSize}
                              fontWeight={text2FontWeight} setFontWeight={setText2FontWeight}
                              letterSpacing={text2LetterSpacing} setLetterSpacing={setText2LetterSpacing}
                              lineHeight={text2LineHeight} setLineHeight={setText2LineHeight}
                              align={text2Align} setAlign={setText2Align}
                              italic={text2Italic} setItalic={setText2Italic}
                              underline={text2Underline} setUnderline={setText2Underline}
                              linethrough={text2Linethrough} setLinethrough={setText2Linethrough}
                              color={text2Color} setColor={setText2Color}
                              opacity={text2ColorOpacity} setOpacity={setText2ColorOpacity}
                              onClose={() => setActiveTextEditor(null)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Background Color Row */}
                      <div className="flex items-center gap-[0.5vw] min-w-0">
                        <span className="text-[0.7vw] font-semibold text-gray-700 w-[6vw] shrink-0">Background :</span>
                        <div className="flex gap-[0.5vw] items-center flex-1">
                          <div className="relative">
                            <div
                              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                              className="w-[2vw] h-[2vw] border border-gray-200 rounded-[0.5vw] shadow-[0_2px_4px_rgba(0,0,0,0.06)] cursor-pointer hover:border-indigo-400 transition-colors shrink-0 overflow-hidden"
                              style={bgColor && (bgColor.includes('gradient') || bgColor.startsWith('linear-')) ? { backgroundImage: bgColor } : { backgroundColor: bgColor || '#F8FAFC' }}
                            ></div>
                            {showBgColorPicker && createPortal(
                              <>
                                <div className="fixed inset-0 z-[999990]" onClick={() => setShowBgColorPicker(false)} />
                                <div className="fixed top-1/2 -translate-y-1/2 left-[calc(50%+16.5vw)] z-[999999]">
                                  <ColorPicker
                                    color={bgColor || '#F8FAFC'}
                                    onChange={(newCol) => setBgColor(newCol)}
                                    opacity={bgOpacity}
                                    onOpacityChange={(newOp) => setBgOpacity(newOp)}
                                    onClose={() => setShowBgColorPicker(false)}
                                    colorsOnPage={colorsOnPageList}
                                  />
                                </div>
                              </>, document.body
                            )}
                          </div>
                          <div className="flex-1 h-[2vw] border border-gray-200 rounded-[0.5vw] flex items-center px-[0.75vw] justify-between bg-white hover:border-indigo-400 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden">
                            <span className="text-[0.75vw] font-medium text-[#2563EB] font-mono truncate mr-[0.5vw]" title={bgColor}>
                              {bgColor?.includes('gradient') ? 'Gradient' : bgColor}
                            </span>
                            <span className="text-[0.85vw] font-medium text-gray-400 font-mono shrink-0">{bgOpacity}%</span>
                          </div>
                          {window.EyeDropper && (
                            <button
                              onClick={async () => {
                                try {
                                  const eyeDropper = new window.EyeDropper();
                                  const result = await eyeDropper.open();
                                  setBgColor(result.sRGBHex.toUpperCase());
                                } catch (e) {
                                  console.log(e);
                                }
                              }}
                              className="w-[2vw] h-[2vw] border border-gray-200 rounded-[0.5vw] flex items-center justify-center bg-white shadow-sm hover:border-indigo-400 hover:bg-gray-50 transition-all cursor-pointer shrink-0"
                              title="Eye Dropper"
                            >
                              <Icon icon="lucide:pipette" className="w-[1vw] h-[1vw] text-gray-500 hover:text-gray-800" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Shadow Color & Sliders */}
                      <div className="space-y-[1.2vw]">
                        <div className="flex items-center gap-[0.5vw] min-w-0">
                          <span className="text-[0.7vw] font-semibold text-gray-700 w-[6vw] shrink-0">Shadow :</span>
                          <div className="flex gap-[0.5vw] items-center flex-1">
                            <div className="relative">
                              <div
                                onClick={() => setShowShadowColorPicker(!showShadowColorPicker)}
                                className="w-[2vw] h-[2vw] border border-gray-200 rounded-[0.5vw] shadow-[0_2px_4px_rgba(0,0,0,0.06)] cursor-pointer hover:border-indigo-400 transition-colors shrink-0"
                                style={{ backgroundColor: shadowColor }}
                              ></div>
                              {showShadowColorPicker && createPortal(
                                <>
                                  <div className="fixed inset-0 z-[999990]" onClick={() => setShowShadowColorPicker(false)} />
                                  <div className="fixed top-1/2 -translate-y-1/2 left-[calc(50%+16.5vw)] z-[999999]">
                                    <ColorPicker
                                      color={shadowColor}
                                      onChange={(newCol) => setShadowColor(newCol)}
                                      opacity={shadowOpacity}
                                      onOpacityChange={(newOp) => setShadowOpacity(newOp)}
                                      onClose={() => setShowShadowColorPicker(false)}
                                      colorsOnPage={colorsOnPageList}
                                    />
                                  </div>
                                </>, document.body
                              )}
                            </div>
                            <div className="flex-1 h-[2vw] border border-gray-200 rounded-[0.5vw] flex items-center px-[0.75vw] justify-between bg-white hover:border-indigo-400 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                              <span className="text-[0.85vw] font-medium text-[#2563EB] font-mono uppercase">{shadowColor}</span>
                              <span className="text-[0.85vw] font-medium text-gray-400 font-mono">{shadowOpacity}%</span>
                            </div>
                            {window.EyeDropper && (
                              <button
                                onClick={async () => {
                                  try {
                                    const eyeDropper = new window.EyeDropper();
                                    const result = await eyeDropper.open();
                                    setShadowColor(result.sRGBHex.toUpperCase());
                                  } catch (e) {
                                    console.log(e);
                                  }
                                }}
                                className="w-[2vw] h-[2vw] border border-gray-200 rounded-[0.5vw] flex items-center justify-center bg-white shadow-sm hover:border-indigo-400 hover:bg-gray-50 transition-all cursor-pointer shrink-0"
                                title="Eye Dropper"
                              >
                                <Icon icon="lucide:pipette" className="w-[1vw] h-[1vw] text-gray-500 hover:text-gray-800" />
                              </button>
                            )}
                          </div>
                        </div>

                        <style>{`
                           .custom-range-slider { -webkit-appearance: none; width: 100%; background: transparent; position: relative; }
                           .custom-range-slider::before { content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1; }
                           .custom-range-slider::-webkit-slider-runnable-track { height: 0.2vw; border-radius: 0.1vw; background: inherit; }
                           .custom-range-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 1vw; width: 1vw; border-radius: 50%; background: #4D47FF; border: 0.02vw solid #ffffff; box-shadow: 0 0.15vw 0.5vw rgba(77,71,255,0.4); margin-top: -0.4vw; cursor: pointer; transition: box-shadow 0.15s ease; position: relative; z-index: 2; }
                           .custom-range-slider::-webkit-slider-thumb:hover { box-shadow: 0 0.15vw 0.75vw rgba(77,71,255,0.6); }
                           .custom-range-slider::-moz-range-track { height: 0.2vw; border-radius: 0.1vw; background: inherit; }
                           .custom-range-slider::-moz-range-thumb { height: 1vw; width: 1vw; border-radius: 50%; background: #4D47FF; border: 0.02vw solid #ffffff; box-shadow: 0 0.15vw 0.5vw rgba(77,71,255,0.4); cursor: pointer; }
                           .custom-range-slider::-moz-range-thumb:hover { box-shadow: 0 0.15vw 0.75vw rgba(77,71,255,0.6); }
                        `}</style>
                        <div className="space-y-[0.8vw] pl-[6.5vw] pr-[0.5vw]">
                          <div className="flex items-center gap-[0.8vw]">
                            <span className="text-[0.7vw] font-semibold text-gray-700 w-[2vw] shrink-0 text-left">X Axis </span>
                            <div className="flex-1 flex items-center h-[1.5vw] gap-[0.8vw]">
                              <input
                                type="range"
                                min="-50"
                                max="50"
                                value={shadowX}
                                onChange={(e) => setShadowX(parseInt(e.target.value))}
                                className="flex-1 cursor-pointer custom-range-slider"
                                style={{
                                  backgroundImage: `linear-gradient(to right, #4D47FF 0%, #4D47FF ${shadowX + 50}%, #E2E8F0 ${shadowX + 50}%, #E2E8F0 100%)`
                                }}
                              />
                              <span className="text-[0.7vw] font-bold text-gray-500 w-[1vw] text-right">{shadowX}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-[0.8vw]">
                            <span className="text-[0.7vw] font-semibold text-gray-700 w-[2vw] shrink-0 text-left">Y Axis </span>
                            <div className="flex-1 flex items-center h-[1.5vw] gap-[0.8vw]">
                              <input
                                type="range"
                                min="-50"
                                max="50"
                                value={shadowY}
                                onChange={(e) => setShadowY(parseInt(e.target.value))}
                                className="flex-1 cursor-pointer custom-range-slider"
                                style={{
                                  backgroundImage: `linear-gradient(to right, #4D47FF 0%, #4D47FF ${shadowY + 50}%, #E2E8F0 ${shadowY + 50}%, #E2E8F0 100%)`
                                }}
                              />
                              <span className="text-[0.7vw] font-bold text-gray-500 w-[1vw] text-right">{shadowY}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-[0.8vw]">
                            <span className="text-[0.7vw] font-semibold text-gray-700 w-[2vw] shrink-0 text-left">Blur </span>
                            <div className="flex-1 flex items-center h-[1.5vw] gap-[0.8vw]">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={shadowBlur}
                                onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                                className="flex-1 cursor-pointer custom-range-slider"
                                style={{
                                  backgroundImage: `linear-gradient(to right, #4D47FF 0%, #4D47FF ${shadowBlur}%, #E2E8F0 ${shadowBlur}%, #E2E8F0 100%)`
                                }}
                              />
                              <span className="text-[0.7vw] font-bold text-gray-500 w-[1vw] text-right">{shadowBlur}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upload Logo Box */}
                      <div className="flex items-start gap-[0.5vw]">
                        <div className="w-[6.5vw] flex items-start justify-between shrink-0 pt-[0.5vw]">
                          <span className="text-[0.75vw] font-semibold text-gray-900">Upload Logo : </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <input
                            type="file"
                            ref={logoInputRef}
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                          {logoUrl ? (
                            <div className="w-full border-[0.15vw] border-solid border-gray-300 rounded-[1vw] flex items-center justify-between p-[1vw] bg-white">
                              <img src={logoUrl} alt="Logo" className="h-[2vw] object-contain" />
                              <button onClick={() => setLogoUrl(null)} className="p-[0.4vw] bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
                                <Trash2 size="1vw" />
                              </button>
                            </div>
                          ) : (
                            <div onClick={() => logoInputRef.current?.click()} className="w-full border-[0.15vw] border-dashed border-gray-400 rounded-[1vw] flex flex-col items-center justify-center py-[1.5vw] bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                              <p className="text-[0.75vw] text-gray-500 font-medium whitespace-nowrap">
                                + Add Logo
                              </p>
                            </div>
                          )}
                        </div>
                      </div>


                      {/* Selected Pages Section (Option A: Dynamic Slots based on template page count) */}
                      <div className="flex items-start gap-[0.7vw]">
                        <div className="w-[6vw] shrink-0 pt-[0.4vw]">
                          <span className="text-[0.72vw] font-bold text-gray-800 block">Selected Pages :</span>
                          <span className="text-[0.55vw] text-gray-400 font-medium block mt-[0.1vw]">
                            {templateMaxPages === 1 ? '1 Page Template' : `${templateMaxPages} Pages Template`}
                          </span>
                        </div>

                        {/* Single Unified Container */}
                        <div className="flex-1 border border-gray-200/90 rounded-[0.7vw] p-[1.1vw] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col items-center gap-[1.1vw] transition-all">
                          {/* Live Thumbnail Preview Centered at Top */}
                          {pages.length > 0 && (
                            <div className="flex flex-col items-center gap-[0.35vw]">
                              <span className="text-[0.55vw] font-bold text-gray-400 uppercase tracking-wider">PREVIEW:</span>
                              {(() => {
                                const activeNum = lastInteractedPage && (selectedPages.includes(lastInteractedPage) ? lastInteractedPage : selectedPages[0]);
                                const pageObj = activeNum && pages[activeNum - 1] ? pages[activeNum - 1] : null;
                                const pageHtml = pageObj ? normalizePageHtml(pageObj.html || pageObj.content || pageObj.svgString || '', templateFit) : '';

                                return (
                                  <>
                                    <div className="w-[5.4vw] h-[7vw] bg-white border border-gray-300 rounded-[0.45vw] overflow-hidden shadow-xs flex items-center justify-center relative p-[0.2vw]">
                                      {pageHtml ? (
                                        <div
                                          className="w-full h-full flex items-center justify-center pointer-events-none overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_svg]:block"
                                          dangerouslySetInnerHTML={{ __html: pageHtml }}
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[0.55vw] text-gray-400 font-semibold text-center px-[0.2vw]">
                                          {activeNum ? `Page ${activeNum}` : 'No page selected'}
                                        </div>
                                      )}
                                    </div>
                                    <span className={`text-[0.62vw] font-semibold text-center mt-[0.1vw] ${activeNum ? 'text-[#5551FF]' : 'text-gray-400'}`}>
                                      {activeNum ? `Page ${activeNum}` : 'None'}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          {/* Page Selection Slots Directly on Bottom of Preview */}
                          <div className="w-full flex flex-col space-y-[0.9vw] pt-[0.9vw] border-t border-gray-100">
                            {Array.from({ length: templateMaxPages }).map((_, slotIdx) => {
                              let slotLabel = `Page ${slotIdx + 1}`;
                              if (templateMaxPages === 1) {
                                slotLabel = 'Book Page';
                              } else if (templateMaxPages === 2) {
                                slotLabel = slotIdx === 0 ? 'Front Cover Page' : 'Back Cover Page';
                              } else if (templateMaxPages === 3) {
                                slotLabel = slotIdx === 0 ? 'Front Page' : slotIdx === 1 ? 'Middle Page' : 'Back Page';
                              }

                              const currentVal = selectedPages[slotIdx] || null;
                              const isDropdownOpen = openSlotDropdown === slotIdx;

                              return (
                                <div key={slotIdx} className="space-y-[0.35vw] w-full">
                                  <div className="flex items-center justify-between px-[0.1vw]">
                                    <span className="text-[0.62vw] font-bold text-gray-500 uppercase tracking-wider">
                                      {slotLabel}
                                    </span>
                                    {currentVal && (
                                      <span className="text-[0.55vw] text-indigo-600 font-semibold bg-indigo-50 px-[0.4vw] py-[0.1vw] rounded-[0.25vw]">
                                        Page {currentVal}
                                      </span>
                                    )}
                                  </div>

                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() => setOpenSlotDropdown(isDropdownOpen ? null : slotIdx)}
                                      className={`w-full h-[2.2vw] px-[0.85vw] border rounded-[0.5vw] flex items-center justify-between bg-white text-[0.78vw] font-medium transition-all cursor-pointer shadow-2xs ${isDropdownOpen ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                      <span className={currentVal ? 'text-gray-900 font-semibold' : 'text-gray-400 font-normal'}>
                                        {currentVal ? `Page ${currentVal}` : 'None'}
                                      </span>
                                      <ChevronDown
                                        size="0.75vw"
                                        className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-indigo-500' : ''}`}
                                      />
                                    </button>

                                    {isDropdownOpen && (
                                      <div className="mt-[0.25vw] bg-white border border-gray-200 rounded-[0.45vw] shadow-sm py-1 max-h-[8.5vw] overflow-y-auto custom-popup-scrollbar">
                                        <div
                                          onClick={() => {
                                            setSelectedPages(prev => {
                                              const updated = [...prev];
                                              updated[slotIdx] = null;
                                              return updated;
                                            });
                                            setOpenSlotDropdown(null);
                                          }}
                                          className={`px-[0.85vw] py-[0.4vw] text-[0.75vw] font-medium cursor-pointer transition-colors ${!currentVal ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                            }`}
                                        >
                                          None
                                        </div>

                                        {pages.map((_, pIdx) => {
                                          const pageNumber = pIdx + 1;
                                          const isSelected = currentVal === pageNumber;
                                          return (
                                            <div
                                              key={pageNumber}
                                              onClick={() => {
                                                setSelectedPages(prev => {
                                                  const updated = [...prev];
                                                  while (updated.length <= slotIdx) updated.push(null);
                                                  updated[slotIdx] = pageNumber;
                                                  return updated;
                                                });
                                                setLastInteractedPage(pageNumber);
                                                setOpenSlotDropdown(null);
                                              }}
                                              className={`px-[0.85vw] py-[0.4vw] text-[0.75vw] font-medium cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                                }`}
                                            >
                                              <span>Page {pageNumber}</span>
                                              {pageNumber === 1 && <span className="text-[0.55vw] text-gray-400 font-normal">Cover</span>}
                                              {pageNumber === pages.length && pages.length > 1 && (
                                                <span className="text-[0.55vw] text-gray-400 font-normal">Last</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Template Footer */}
          <div className="pt-[1vw] mb-[-1vw] flex items-center justify-between mt-[0.5vw] border-t border-gray-200 shrink-0">
            <p className="text-[0.65vw] text-gray-500 font-medium">
              <span className="text-red-500">*</span> Choose and customize a template, then click "Change Cover" to save as your flipbook cover
            </p>
            <div className="flex gap-[0.8vw]">
              <button
                onClick={onClose}
                className="px-[2vw] py-[0.6vw] border border-gray-400 rounded-[0.5vw] text-[0.8vw] font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-[0.4vw] shadow-sm"
              >
                <X size="1vw" strokeWidth={2.5} /> Cancel
              </button>
              <button
                onClick={handleDownloadCoverImage}
                disabled={isDownloadingCover}
                className="px-[1.5vw] py-[0.6vw] border border-gray-300 bg-white rounded-[0.5vw] text-[0.8vw] font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-[0.4vw] shadow-sm disabled:opacity-50"
                title="Download Cover Image (1200x900)"
              >
                {isDownloadingCover ? <Loader size="1vw" className="animate-spin" /> : <Download size="1vw" />}
                Download Cover
              </button>
              <button
                onClick={() => {
                  onSave({
                    type: 'template',
                    activeTab,
                    selectedTemplate,
                    url: selectedTemplate?.src || '',
                    text1,
                    text2,
                    bgColor,
                    bgOpacity,
                    shadowColor,
                    shadowOpacity,
                    shadowX,
                    shadowY,
                    shadowBlur,
                    logoUrl,
                    rawLogoFile,
                    text1FontFamily,
                    text1FontSize,
                    text1FontWeight,
                    text1LetterSpacing,
                    text1LineHeight,
                    text1Align,
                    text1Bold,
                    text1Italic,
                    text1Underline,
                    text1Linethrough,
                    text1Color,
                    text1ColorOpacity,
                    text2FontFamily,
                    text2FontSize,
                    text2FontWeight,
                    text2LetterSpacing,
                    text2LineHeight,
                    text2Align,
                    text2Bold,
                    text2Italic,
                    text2Underline,
                    text2Linethrough,
                    text2Color,
                    text2ColorOpacity,
                    selectedPages,
                    fit: templateFit,
                    templateFit
                  });
                  onClose();
                }}
                className="px-[3vw] py-[0.6vw] bg-black text-white rounded-[0.5vw] text-[0.8vw] font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-[0.4vw] shadow-sm"
              >
                <Check size="1vw" strokeWidth={3} /> Save Changes
              </button>
            </div>
          </div>



        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="w-full flex flex-col overflow-hidden relative mt-[1vw]" style={{ height: '32.2vw' }}>
        {innerContent}
        {isCropping && (
          <ImageCropOverlay
            imageSrc={originalImage || uploadedImage}
            element={previewImgRef.current}
            onSave={({ crop }) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const sw = (crop.width / 100) * img.naturalWidth;
                const sh = (crop.height / 100) * img.naturalHeight;
                const sx = (crop.left / 100) * img.naturalWidth;
                const sy = (crop.top / 100) * img.naturalHeight;
                canvas.width = sw;
                canvas.height = sh;
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
                const croppedSrc = canvas.toDataURL('image/png');
                setUploadedImage(croppedSrc);
                canvas.toBlob((blob) => {
                  const file = new File([blob], "cover_cropped.png", { type: "image/png" });
                  setRawFile(file);
                }, 'image/png');
                setIsCropping(false);
              };
              img.src = originalImage || uploadedImage;
            }}
            onCancel={() => {
              setIsCropping(false);
              setImageFixType('Fit');
            }}
          />
        )}
      </div>
    );
  }

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 ${zIndex} bg-black/40 flex items-center justify-center animate-in fade-in duration-200`}>
      <div className="bg-white rounded-[1vw] shadow-2xl max-h-[94vh] w-[65vw] max-w-[700px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-[1.5vw] py-[1.2vw]">
          <div className="flex items-center gap-[1vw] flex-1">
            <h2 className="text-[1vw] font-semibold text-gray-900 whitespace-nowrap pb-[0.5vw]">Cover Picture Customization</h2>
            <div className="h-[0.0925vw] bg-gray-200 w-full"> </div>
          </div>
          <button onClick={onClose} className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 ml-[1vw] shrink-0 transition-colors">
            <X size="1.2vw" />
          </button>
        </div>

        {/* Content */}
        {innerContent}
      </div>
    </div>,
    document.body
  );
};


export const CoverPicturePopupWithStyles = (props) => (
  <>
    <style>{scrollbarStyles}</style>
    <CoverPicturePopup {...props} />
  </>
);

export default TemplatePreview;
