/**
 * Typography presets — poster-style text compositions built from installed fonts
 * (see utils/typographyPresetBuilder.js for the spec format).
 * Fonts used: Highrise, Moldin, Chillink, Norveza (local) · Poppins, Montserrat, Satisfy.
 */

export const TYPOGRAPHY_PRESET_SPECS = [
  {
    id: 'typo-generate-design',
    name: 'Highlight Statement',
    w: 400, h: 290, bg: '#1F2A24',
    lines: [
      { y: 24, size: 60, font: 'Highrise', weight: 700, color: '#FFFFFF', ls: 1, effects: { drop: { x: 0, y: 4, blur: 6, color: '#000000', opacity: 40 } }, segs: [{ text: 'ANYONE CAN' }] },
      { y: 86, size: 60, font: 'Highrise', weight: 700, ls: 1, segs: [{ text: 'GENERATE.', color: '#1F2A24', bg: '#C8F542', padX: 8, bgEffects: { inner: { x: 0, y: -4, blur: 3, color: '#000000', opacity: 25 } } }] },
      { y: 150, size: 60, font: 'Highrise', weight: 700, color: '#FFFFFF', ls: 1, effects: { drop: { x: 0, y: 4, blur: 6, color: '#000000', opacity: 40 } }, segs: [{ text: 'NOT EVERYONE' }] },
      { y: 212, size: 60, font: 'Highrise', weight: 700, ls: 1, gap: 10, segs: [
        { text: 'CAN', color: '#FFFFFF' },
        { text: 'DESIGN.', color: '#1F2A24', bg: '#C8F542', padX: 8, bgEffects: { inner: { x: 0, y: -4, blur: 3, color: '#000000', opacity: 25 } } },
      ] },
    ],
  },
  {
    id: 'typo-speech-labels',
    name: 'Speech Labels',
    w: 360, h: 360, bg: '#E8572A',
    lines: [
      { y: 40, size: 46, font: 'Poppins', weight: 800, rotate: -4, segs: [{ text: '“We make', color: '#E8572A', bg: '#FFFFFF', padX: 14, padY: 6, bgEffects: { drop: { x: 4, y: 6, blur: 6, color: '#7A1F05', opacity: 35 } } }] },
      { y: 112, x: 196, size: 54, font: 'Poppins', weight: 800, rotate: 3, segs: [{ text: 'ideas', color: '#E8572A', bg: '#FFFFFF', padX: 14, padY: 6, bgEffects: { drop: { x: 4, y: 6, blur: 6, color: '#7A1F05', opacity: 35 } } }] },
      { y: 190, x: 130, size: 36, font: 'Poppins', weight: 800, rotate: -3, segs: [{ text: 'come', color: '#E8572A', bg: '#FFFFFF', padX: 12, padY: 5, bgEffects: { drop: { x: 4, y: 6, blur: 6, color: '#7A1F05', opacity: 35 } } }] },
      { y: 250, x: 196, size: 54, font: 'Poppins', weight: 800, rotate: -2, segs: [{ text: 'alive”', color: '#E8572A', bg: '#FFFFFF', padX: 14, padY: 6, bgEffects: { drop: { x: 4, y: 6, blur: 6, color: '#7A1F05', opacity: 35 } } }] },
    ],
  },
  {
    id: 'typo-great-marketing',
    name: 'Bold Message',
    w: 420, h: 250, bg: '#ECECEC',
    lines: [
      { y: 26, x: 28, align: 'left', size: 40, font: 'Montserrat', weight: 800, color: '#C8602E', segs: [{ text: 'GREAT' }] },
      { y: 72, x: 26, align: 'left', size: 54, font: 'Montserrat', weight: 900, color: '#111111', effects: { drop: { x: 0, y: 6, blur: 8, color: '#000000', opacity: 20 } }, segs: [{ text: 'MARKETING' }] },
      { y: 138, x: 28, align: 'left', size: 34, font: 'Montserrat', weight: 800, color: '#C8602E', segs: [{ text: 'IS NOT A COST' }] },
      { y: 184, x: 28, align: 'left', size: 28, font: 'Montserrat', weight: 700, color: '#111111', segs: [{ text: 'IT’S AN INVESTMENT' }] },
    ],
  },
  {
    id: 'typo-one-click',
    name: 'Tilted Impact',
    w: 420, h: 260, bg: '#BFF3E4',
    lines: [
      { y: 34, x: 196, size: 30, font: 'Montserrat', weight: 900, color: '#333333', rotate: -8, effects: { blur: 1.2 }, segs: [{ text: 'ONE' }] },
      { y: 66, x: 214, size: 78, font: 'Montserrat', weight: 900, color: '#333333', rotate: -8, gap: 8, effects: { drop: { x: 0, y: 10, blur: 10, color: '#0B5D4A', opacity: 30 } }, segs: [
        { text: 'CLICK' },
        { text: 'IS ALL', size: 28 },
      ] },
      { y: 140, x: 208, size: 84, font: 'Montserrat', weight: 900, color: '#333333', rotate: -8, gap: 8, effects: { drop: { x: 0, y: 10, blur: 10, color: '#0B5D4A', opacity: 30 } }, segs: [
        { text: 'YOU', size: 28 },
        { text: 'NEED' },
      ] },
    ],
  },
  {
    id: 'typo-time-to-create',
    name: 'Sticker Stack',
    w: 300, h: 360, bg: '#4A3A30',
    shapes: [{ x: 34, y: 26, w: 232, h: 308, fill: '#F1E6D2', rx: 34, name: 'Sticker', effects: { drop: { x: 0, y: 10, blur: 14, color: '#000000', opacity: 45 } } }],
    lines: [
      { y: 44, size: 54, font: 'Moldin', color: '#D93A33', effects: { inner: { x: 0, y: 2, blur: 1, color: '#5A0F0B', opacity: 55 } }, segs: [{ text: 'YOU’VE' }] },
      { y: 96, size: 54, font: 'Moldin', color: '#D93A33', effects: { inner: { x: 0, y: 2, blur: 1, color: '#5A0F0B', opacity: 55 } }, segs: [{ text: 'CONSUMED' }] },
      { y: 148, size: 54, font: 'Moldin', color: '#D93A33', effects: { inner: { x: 0, y: 2, blur: 1, color: '#5A0F0B', opacity: 55 } }, segs: [{ text: 'ENOUGH.' }] },
      { y: 200, size: 54, font: 'Moldin', color: '#D93A33', effects: { inner: { x: 0, y: 2, blur: 1, color: '#5A0F0B', opacity: 55 } }, segs: [{ text: 'IT’S TIME TO' }] },
      { y: 252, size: 54, font: 'Moldin', color: '#D93A33', effects: { inner: { x: 0, y: 2, blur: 1, color: '#5A0F0B', opacity: 55 } }, segs: [{ text: 'CREATE.' }] },
    ],
  },
  {
    id: 'typo-mindset',
    name: 'Gold Bar',
    w: 420, h: 250, bg: '#1E1E1E',
    lines: [
      { y: 28, size: 118, font: 'Highrise', weight: 700, color: '#FFFFFF', ls: 2, effects: { drop: { x: 0, y: 6, blur: 10, color: '#000000', opacity: 60 } }, segs: [{ text: 'MINDSET' }] },
      { y: 160, size: 52, font: 'Highrise', weight: 700, gap: 12, segs: [
        { text: 'IS', color: '#C9A04A' },
        { text: 'EVERYTHING', color: '#1E1E1E', bg: '#C9A04A', font: 'Norveza', weight: 400, size: 34, ls: 9, padX: 16, padY: 9, bgEffects: { inner: { x: 0, y: 3, blur: 4, color: '#5C4416', opacity: 45 } } },
      ] },
    ],
  },
  {
    id: 'typo-eyes-first',
    name: 'Visual Hierarchy',
    w: 420, h: 250, bg: '#BDBDBD',
    lines: [
      { y: 30, x: 30, align: 'left', size: 76, font: 'Highrise', weight: 700, color: '#111111', segs: [{ text: 'EYES WILL' }] },
      { y: 104, x: 30, align: 'left', size: 76, font: 'Highrise', weight: 700, color: '#111111', effects: { drop: { x: 0, y: 6, blur: 8, color: '#000000', opacity: 25 } }, segs: [{ text: 'FIRST GO HERE.' }] },
      { y: 198, x: 32, align: 'left', size: 18, font: 'Highrise', weight: 700, color: '#111111', ls: 1, gap: 18, segs: [
        { text: 'AND THEN HERE' },
        { text: '|', color: '#555555' },
        { text: 'VISUAL HIERARCHY IS KEY', color: '#444444', font: 'Norveza', weight: 400, size: 14, ls: 2, effects: { blur: 0.6 } },
      ] },
    ],
  },
  {
    id: 'typo-stand-out',
    name: 'Stand Out',
    w: 300, h: 380, bg: '#000000',
    lines: [
      { y: 26, size: 92, font: 'Moldin', color: '#FFFFFF', ls: 2, effects: { blur: 0.8, drop: { x: 0, y: 0, blur: 8, color: '#FFFFFF', opacity: 35 } }, segs: [{ text: 'MADE' }] },
      { y: 112, size: 92, font: 'Moldin', color: '#FFFFFF', ls: 2, effects: { blur: 0.8, drop: { x: 0, y: 0, blur: 8, color: '#FFFFFF', opacity: 35 } }, segs: [{ text: 'TO' }] },
      { y: 198, size: 92, font: 'Moldin', color: '#FFFFFF', ls: 2, effects: { blur: 0.8, drop: { x: 0, y: 0, blur: 8, color: '#FFFFFF', opacity: 35 } }, segs: [{ text: 'STAND' }] },
      { y: 284, size: 92, font: 'Moldin', color: '#FFFFFF', ls: 2, effects: { blur: 0.8, drop: { x: 0, y: 0, blur: 8, color: '#FFFFFF', opacity: 35 } }, segs: [{ text: 'OUT.' }] },
    ],
  },
  {
    id: 'typo-title-feed',
    name: 'Soft Shadow Title',
    w: 380, h: 380, bg: '#1C1C1C',
    lines: [
      { y: 36, size: 100, font: 'Montserrat', weight: 900, color: '#FFFFFF', effects: { drop: { x: 0, y: 8, blur: 12, color: '#000000', opacity: 75 } }, segs: [{ text: 'TITLE' }] },
      { y: 140, size: 100, font: 'Montserrat', weight: 900, color: '#F2F2F2', effects: { drop: { x: 0, y: 8, blur: 12, color: '#000000', opacity: 75 }, blur: 1.5 }, segs: [{ text: 'FEED' }] },
      { y: 244, size: 100, font: 'Montserrat', weight: 900, color: '#E2E2E2', effects: { drop: { x: 0, y: 8, blur: 12, color: '#000000', opacity: 75 }, blur: 3.5 }, segs: [{ text: 'POST' }] },
    ],
  },
  {
    id: 'typo-success-grows',
    name: 'Script Mix',
    w: 340, h: 420, bg: '#0B0B0B',
    lines: [
      { y: 26, size: 86, font: 'Highrise', weight: 700, color: '#F5C13B', ls: 1, segs: [{ text: 'SUCCESS' }] },
      { y: 104, size: 84, font: 'Satisfy', color: '#FFFFFF', rotate: -6, lineHeight: 1.15, effects: { drop: { x: 3, y: 5, blur: 4, color: '#000000', opacity: 70 }, inner: { x: 0, y: -3, blur: 2, color: '#9A9A9A', opacity: 60 } }, segs: [{ text: 'Grows' }] },
      { y: 204, size: 40, font: 'Highrise', weight: 700, ls: 2, segs: [{ text: 'WHERE', color: '#0B0B0B', bg: '#F5C13B', padX: 12, padY: 4 }] },
      { y: 240, size: 84, font: 'Satisfy', color: '#FFFFFF', rotate: -6, lineHeight: 1.15, effects: { drop: { x: 3, y: 5, blur: 4, color: '#000000', opacity: 70 }, inner: { x: 0, y: -3, blur: 2, color: '#9A9A9A', opacity: 60 } }, segs: [{ text: 'Excuses' }] },
      { y: 330, size: 80, font: 'Highrise', weight: 700, color: '#F5C13B', ls: 2, segs: [{ text: 'END' }] },
    ],
  },
  {
    id: 'typo-risk-regret',
    name: 'Brush Quote',
    w: 320, h: 420, bg: '#ECEAE4',
    lines: [
      { y: 40, size: 92, font: 'Chillink', color: '#111111', effects: { drop: { x: 2, y: 3, blur: 2, color: '#000000', opacity: 20 } }, segs: [{ text: 'RISK' }] },
      { y: 140, size: 46, font: 'Chillink', color: '#111111', effects: { drop: { x: 2, y: 3, blur: 2, color: '#000000', opacity: 20 } }, segs: [{ text: 'IS ALWAYS' }] },
      { y: 196, size: 64, font: 'Chillink', color: '#111111', effects: { drop: { x: 2, y: 3, blur: 2, color: '#000000', opacity: 20 } }, segs: [{ text: 'BETTER' }] },
      { y: 266, size: 64, font: 'Chillink', color: '#111111', effects: { drop: { x: 2, y: 3, blur: 2, color: '#000000', opacity: 20 } }, segs: [{ text: 'THAN' }] },
      { y: 336, size: 68, font: 'Chillink', color: '#111111', effects: { drop: { x: 2, y: 3, blur: 2, color: '#000000', opacity: 20 } }, segs: [{ text: 'REGRET' }] },
    ],
  },
  {
    id: 'typo-big-sale',
    name: 'Big Sale',
    w: 400, h: 300, bg: '#D7263D',
    shapes: [{ x: 70, y: 198, w: 260, h: 48, fill: '#FFFFFF', rotate: -3, name: 'Banner', effects: { drop: { x: 0, y: 6, blur: 8, color: '#5E0B16', opacity: 45 } } }],
    lines: [
      { y: 34, size: 46, font: 'Atop', color: '#FFD23F', ls: 2, segs: [{ text: 'MEGA' }] },
      { y: 86, size: 96, font: 'Atop', color: '#FFFFFF', effects: { drop: { x: 6, y: 6, blur: 0, color: '#8E1424', opacity: 100 }, inner: { x: 0, y: -4, blur: 2, color: '#F2B8C0', opacity: 70 } }, segs: [{ text: 'SALE' }] },
      { y: 206, size: 32, font: 'Highrise', weight: 700, color: '#D7263D', ls: 3, rotate: -3, segs: [{ text: 'UP TO HALF OFF' }] },
    ],
  },
  {
    id: 'typo-forever',
    name: 'Elegant Script',
    w: 380, h: 300, bg: '#F6EFE6',
    shapes: [
      { x: 110, y: 72, w: 160, h: 1.5, fill: '#B08D57', name: 'Line' },
      { x: 110, y: 236, w: 160, h: 1.5, fill: '#B08D57', name: 'Line' },
    ],
    lines: [
      { y: 36, size: 22, font: 'Rilvan', color: '#7A5C3A', ls: 6, segs: [{ text: 'TOGETHER' }] },
      { y: 86, size: 86, font: 'Allura', color: '#3E2C1C', lineHeight: 1.2, effects: { drop: { x: 0, y: 4, blur: 4, color: '#7A5C3A', opacity: 30 } }, segs: [{ text: 'Forever' }] },
      { y: 186, size: 34, font: 'Rilvan', color: '#3E2C1C', ls: 3, segs: [{ text: 'STARTS TODAY' }] },
      { y: 250, size: 16, font: 'Norveza', color: '#7A5C3A', ls: 5, segs: [{ text: 'SAVE THE DATE' }] },
    ],
  },
  {
    id: 'typo-good-vibes',
    name: 'Retro Groovy',
    w: 380, h: 300, bg: '#FFF1D6',
    lines: [
      { y: 30, size: 74, font: 'Gleeful Bubble', color: '#FF7A1A', effects: { drop: { x: 6, y: 6, blur: 0, color: '#7B2CBF', opacity: 100 }, inner: { x: 0, y: -4, blur: 2, color: '#FFD08A', opacity: 90 } }, segs: [{ text: 'GOOD' }] },
      { y: 112, size: 74, font: 'Gleeful Bubble', color: '#FF7A1A', effects: { drop: { x: 6, y: 6, blur: 0, color: '#7B2CBF', opacity: 100 }, inner: { x: 0, y: -4, blur: 2, color: '#FFD08A', opacity: 90 } }, segs: [{ text: 'VIBES' }] },
      { y: 210, size: 40, font: 'Yang Bagus', color: '#7B2CBF', rotate: -4, segs: [{ text: 'ONLY', color: '#FFF1D6', bg: '#7B2CBF', padX: 18, padY: 4, bgRadius: 26, bgEffects: { drop: { x: 5, y: 5, blur: 0, color: '#2EC4B6', opacity: 100 } } }] },
    ],
  },
  {
    id: 'typo-open-late',
    name: 'Neon Glow',
    w: 380, h: 280, bg: '#0D0B1F',
    lines: [
      { y: 40, size: 84, font: 'Gendy', color: '#FFE3F6', ls: 4, effects: { drop: { x: 0, y: 0, blur: 12, color: '#FF2BD6', opacity: 100 } }, segs: [{ text: 'OPEN' }] },
      { y: 138, size: 84, font: 'Gendy', color: '#DFFBFF', ls: 4, effects: { drop: { x: 0, y: 0, blur: 12, color: '#19E3FF', opacity: 100 } }, segs: [{ text: 'LATE' }] },
      { y: 236, size: 16, font: 'Maxwell', weight: 300, color: '#B9B4E0', ls: 8, segs: [{ text: 'EVERY NIGHT' }] },
    ],
  },
  {
    id: 'typo-less-is-more',
    name: 'Minimal Luxury',
    w: 400, h: 260, bg: '#EFE9E1',
    lines: [
      { y: 52, size: 64, font: 'Rotten', color: '#2B2620', ls: 10, segs: [{ text: 'LESS' }] },
      { y: 122, size: 26, font: 'Melrank', color: '#9C8164', ls: 4, effects: { blur: 0.4 }, segs: [{ text: 'is' }] },
      { y: 154, size: 64, font: 'Rotten', color: '#2B2620', ls: 10, segs: [{ text: 'MORE' }] },
    ],
  },
  {
    id: 'typo-bold-era',
    name: 'Editorial',
    w: 360, h: 400, bg: '#F3F0EA',
    lines: [
      { y: 24, x: 24, align: 'left', size: 14, font: 'Norveza', color: '#111111', ls: 4, segs: [{ text: 'ISSUE · SPRING EDITION' }] },
      { y: 58, size: 118, font: 'Fragor', color: '#111111', segs: [{ text: 'BOLD' }] },
      { y: 176, size: 118, font: 'Fragor', color: '#C2412D', effects: { inner: { x: 3, y: 3, blur: 2, color: '#5E1A10', opacity: 50 }, drop: { x: 0, y: 6, blur: 8, color: '#000000', opacity: 18 } }, segs: [{ text: 'ERA' }] },
      { y: 312, x: 24, align: 'left', size: 26, font: 'Hepab', color: '#111111', segs: [{ text: 'THE NEW WAVE' }] },
      { y: 346, x: 24, align: 'left', size: 26, font: 'Hepab', color: '#111111', segs: [{ text: 'OF DESIGN' }] },
    ],
  },
  {
    id: 'typo-play-time',
    name: 'Kids Fun',
    w: 380, h: 280, bg: '#FFFFFF',
    lines: [
      { y: 40, size: 92, font: 'Patty Press', gap: 2, effects: { drop: { x: 4, y: 4, blur: 0, color: '#000000', opacity: 18 }, inner: { x: 0, y: -4, blur: 1, color: '#FFFFFF', opacity: 45 } }, segs: [
        { text: 'P', color: '#FF595E' }, { text: 'L', color: '#FFCA3A' }, { text: 'A', color: '#8AC926' }, { text: 'Y', color: '#1982C4' },
      ] },
      { y: 146, size: 92, font: 'Patty Press', gap: 2, effects: { drop: { x: 4, y: 4, blur: 0, color: '#000000', opacity: 18 }, inner: { x: 0, y: -4, blur: 1, color: '#FFFFFF', opacity: 45 } }, segs: [
        { text: 'T', color: '#6A4C93' }, { text: 'I', color: '#FF595E' }, { text: 'M', color: '#FFCA3A' }, { text: 'E', color: '#8AC926' },
      ] },
    ],
  },
  {
    id: 'typo-stay-wild',
    name: 'Blackletter',
    w: 360, h: 300, bg: '#16302B',
    lines: [
      { y: 40, size: 96, font: 'Duskfall', color: '#E9D8A6', effects: { inner: { x: 2, y: 2, blur: 1, color: '#6B5A2E', opacity: 70 }, drop: { x: 0, y: 6, blur: 8, color: '#000000', opacity: 50 } }, segs: [{ text: 'Stay' }] },
      { y: 140, size: 96, font: 'Duskfall', color: '#E9D8A6', effects: { inner: { x: 2, y: 2, blur: 1, color: '#6B5A2E', opacity: 70 }, drop: { x: 0, y: 6, blur: 8, color: '#000000', opacity: 50 } }, segs: [{ text: 'Wild' }] },
      { y: 250, size: 16, font: 'Maxwell', color: '#94B49F', ls: 8, segs: [{ text: 'EXPLORE MORE' }] },
    ],
  },
  {
    id: 'typo-future-now',
    name: 'Tech Future',
    w: 420, h: 250, bg: '#05080F',
    shapes: [
      { x: 40, y: 40, w: 6, h: 170, fill: '#00E5FF', name: 'Accent', effects: { drop: { x: 0, y: 0, blur: 8, color: '#00E5FF', opacity: 80 } } },
      { x: 60, y: 196, w: 120, h: 3, fill: '#00E5FF', name: 'Accent' },
    ],
    lines: [
      { y: 44, x: 64, align: 'left', size: 54, font: 'Roba', color: '#FFFFFF', ls: 2, segs: [{ text: 'THE FUTURE' }] },
      { y: 108, x: 64, align: 'left', size: 54, font: 'Roba', color: '#00E5FF', ls: 2, effects: { drop: { x: 0, y: 0, blur: 10, color: '#00E5FF', opacity: 70 } }, segs: [{ text: 'IS NOW' }] },
      { y: 210, x: 64, align: 'left', size: 14, font: 'Maxwell', color: '#7C8BA1', ls: 6, segs: [{ text: 'INNOVATION · TECHNOLOGY' }] },
    ],
  },
  {
    id: 'typo-thank-you',
    name: 'Handwritten Note',
    w: 380, h: 260, bg: '#FCE4EC',
    shapes: [{ x: 120, y: 156, w: 140, h: 8, fill: '#F48FB1', rx: 4, rotate: -2, name: 'Underline', effects: { blur: 1 } }],
    lines: [
      { y: 54, size: 82, font: 'Handrich', color: '#AD1457', rotate: -4, lineHeight: 1.2, effects: { drop: { x: 2, y: 4, blur: 3, color: '#880E4F', opacity: 30 } }, segs: [{ text: 'thank you' }] },
      { y: 186, size: 20, font: 'Arina', color: '#6D2E46', ls: 5, segs: [{ text: 'WITH LOVE AND GRATITUDE' }] },
    ],
  },
];
