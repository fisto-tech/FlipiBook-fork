
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
// Text-effects engine added in the new AnimationRunner (adjust path if the file lives elsewhere)
import { initTextEffectsRunner } from './AnimationRunner';
import {
  ChevronDown,
  ArrowRightLeft,
  X,
  ScanEye
} from 'lucide-react';
import CustomScrollbar from '../../CustomScrollbar';

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

const ANIMATION_VARIANTS = {
  'none': {},
  'fade-in': { initial: { opacity: 0 }, animate: { opacity: 1 } },
  'fade-out': { initial: { opacity: 1 }, animate: { opacity: 0 } },
  'slide-up': { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  'slide-down': { initial: { y: -100, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  'slide-left': { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  'slide-right': { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  'back-in-up': { initial: { y: 500, scale: 0.7, opacity: 0 }, animate: { y: 0, scale: 1, opacity: 1 }, transition: { type: 'spring', stiffness: 100 } },
  'back-in-down': { initial: { y: -500, scale: 0.7, opacity: 0 }, animate: { y: 0, scale: 1, opacity: 1 }, transition: { type: 'spring', stiffness: 100 } },
  'back-in-left': { initial: { x: -500, scale: 0.7, opacity: 0 }, animate: { x: 0, scale: 1, opacity: 1 }, transition: { type: 'spring', stiffness: 100 } },
  'back-in-right': { initial: { x: 500, scale: 0.7, opacity: 0 }, animate: { x: 0, scale: 1, opacity: 1 }, transition: { type: 'spring', stiffness: 100 } },
  'zoom-in': { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
  'zoom-in-up': { initial: { scale: 0.1, y: 100, opacity: 0 }, animate: { scale: 1, y: 0, opacity: 1 } },
  'zoom-in-down': { initial: { scale: 0.1, y: -100, opacity: 0 }, animate: { scale: 1, y: 0, opacity: 1 } },
  'zoom-out': { initial: { scale: 1, opacity: 1 }, animate: { scale: 0, opacity: 0 } },
  'rotate-in': { initial: { rotate: -200, opacity: 0, scale: 0 }, animate: { rotate: 0, opacity: 1, scale: 1 } },
  'rotate-in-down-left': { initial: { rotate: -45, transformOrigin: 'left bottom', opacity: 0 }, animate: { rotate: 0, opacity: 1 } },
  'rotate-in-up-right': { initial: { rotate: -90, transformOrigin: 'right bottom', opacity: 0 }, animate: { rotate: 0, opacity: 1 } },
  'bounce-in': { initial: { scale: 0.3, opacity: 0 }, animate: { scale: [0.3, 1.1, 0.9, 1.03, 0.97, 1], opacity: 1 }, transition: { duration: 0.75 } },
  'bounce-out': { initial: { scale: 1, opacity: 1 }, animate: { scale: [1, 0.97, 1.03, 0.9, 1.1, 0.3], opacity: 0 }, transition: { duration: 0.75 } },
  'flip-in': { initial: { rotateX: -90, opacity: 0 }, animate: { rotateX: 0, opacity: 1 }, transition: { duration: 0.4 } },
  'flip-in-y': { initial: { rotateY: -90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, transition: { duration: 0.4 } },
  'roll-in': { initial: { x: -100, rotate: -120, opacity: 0 }, animate: { x: 0, rotate: 0, opacity: 1 } },
  'pulse': { animate: { scale: [1, 1.1, 1] }, transition: { repeat: Infinity, duration: 1 } },
  'tada': { animate: { scale: [1, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1], rotate: [0, -3, -3, 3, -3, 3, -3, 3, -3, 0] }, transition: { repeat: Infinity, duration: 1 } },
  'rubber-band': { animate: { scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1], scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1] }, transition: { repeat: Infinity, duration: 2 } },
  'jello': { animate: { skewX: [0, -12.5, 6.25, -3.125, 1.5625, -0.78125, 0.390625, -0.1953125, 0], skewY: [0, -12.5, 6.25, -3.125, 1.5625, -0.78125, 0.390625, -0.1953125, 0] }, transition: { repeat: Infinity, duration: 2 } },
  'heartbeat': { animate: { scale: [1, 1.3, 1, 1.3, 1] }, transition: { repeat: Infinity, duration: 1.3, ease: "easeInOut" } },
  'glitch': { animate: { x: [0, -2, 2, -2, 2, 0], y: [0, 1, -1, 1, -1, 0], filter: ["none", "hue-rotate(90deg)", "hue-rotate(-90deg)", "none"] }, transition: { repeat: Infinity, duration: 0.2 } },
  'blur-in': { initial: { filter: "blur(20px)", opacity: 0 }, animate: { filter: "blur(0px)", opacity: 1 } },
  'focus-in': { initial: { filter: "blur(12px)", opacity: 0, scale: 1.2 }, animate: { filter: "blur(0px)", opacity: 1, scale: 1 } },
  'neon-glow': { animate: { textShadow: ["0 0 4px #4f46e5", "0 0 15px #4f46e5", "0 0 4px #4f46e5"], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }, transition: { repeat: Infinity, duration: 1.5 } },
  'swing': { animate: { rotate: [0, 15, -10, 5, -5, 0] }, transition: { repeat: Infinity, duration: 2 } },
  'wobble': { animate: { x: [0, -25, 20, -15, 10, -5, 0], rotate: [0, -5, 3, -3, 2, -1, 0] }, transition: { repeat: Infinity, duration: 2 } },
  'float': { animate: { y: [0, -15, 0] }, transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
  'perspective-in': { initial: { rotateX: -60, opacity: 0, z: -500 }, animate: { rotateX: 0, opacity: 1, z: 0 }, transition: { duration: 1, type: "spring" } },
  'glass-reveal': { initial: { opacity: 0, backdropFilter: "blur(20px)" }, animate: { opacity: 1, backdropFilter: "blur(0px)" }, transition: { duration: 1.5 } },
};

/* -------------------------------------------------------------------------- */
/*                                WAAPI DEFINITIONS                           */
/* -------------------------------------------------------------------------- */

const WAAPI_ANIMATIONS = {
  'none': [],
  'fade-in': [{ opacity: 0 }, { opacity: 1 }],
  'fade-out': [{ opacity: 1 }, { opacity: 0 }],
  'blur-in': [{ filter: 'blur(20px)', opacity: 0 }, { filter: 'blur(0)', opacity: 1 }],
  'focus-in': [{ filter: 'blur(12px)', opacity: 0, scale: '1.2' }, { filter: 'blur(0)', opacity: 1, scale: '1' }],
  'glass-reveal': [{ opacity: 0, backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)' }, { opacity: 1, backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)' }],
  'perspective-in': [{ transform: 'perspective(400px) rotateX(-60deg) translateZ(-500px)', opacity: 0 }, { transform: 'perspective(400px) rotateX(0deg) translateZ(0)', opacity: 1 }],
  'slide-up': [{ translate: '0 100px', opacity: 0 }, { translate: '0 0', opacity: 1 }],
  'slide-down': [{ translate: '0 -100px', opacity: 0 }, { translate: '0 0', opacity: 1 }],
  'slide-left': [{ translate: '100px 0', opacity: 0 }, { translate: '0 0', opacity: 1 }],
  'slide-right': [{ translate: '-100px 0', opacity: 0 }, { translate: '0 0', opacity: 1 }],
  'back-in-up': [{ translate: '0 500px', scale: '0.7', opacity: 0 }, { translate: '0 0', scale: '0.7', opacity: 0.7, offset: 0.8 }, { translate: '0 0', scale: '1', opacity: 1 }],
  'back-in-down': [{ translate: '0 -500px', scale: '0.7', opacity: 0 }, { translate: '0 0', scale: '0.7', opacity: 0.7, offset: 0.8 }, { translate: '0 0', scale: '1', opacity: 1 }],
  'back-in-left': [{ translate: '-500px 0', scale: '0.7', opacity: 0 }, { translate: '0 0', scale: '0.7', opacity: 0.7, offset: 0.8 }, { translate: '0 0', scale: '1', opacity: 1 }],
  'back-in-right': [{ translate: '500px 0', scale: '0.7', opacity: 0 }, { translate: '0 0', scale: '0.7', opacity: 0.7, offset: 0.8 }, { translate: '0 0', scale: '1', opacity: 1 }],
  'zoom-in': [{ scale: '0', opacity: 0 }, { scale: '1', opacity: 1 }],
  'zoom-out': [{ scale: '1', opacity: 1 }, { scale: '0', opacity: 0 }],
  'zoom-in-up': [{ scale: '0.1', translate: '0 100px', opacity: 0 }, { scale: '1', translate: '0 0', opacity: 1 }],
  'zoom-in-down': [{ scale: '0.1', translate: '0 -100px', opacity: 0 }, { scale: '1', translate: '0 0', opacity: 1 }],
  'rotate-in': [{ rotate: '-200deg', scale: '0', opacity: 0 }, { rotate: '0deg', scale: '1', opacity: 1 }],
  'rotate-in-down-left': [{ rotate: '-45deg', transformOrigin: 'left bottom', opacity: 0 }, { rotate: '0deg', transformOrigin: 'left bottom', opacity: 1 }],
  'rotate-in-up-right': [{ rotate: '-90deg', transformOrigin: 'right bottom', opacity: 0 }, { rotate: '0deg', transformOrigin: 'right bottom', opacity: 1 }],
  'bounce-in': [{ scale: '0.3', opacity: 0 }, { scale: '1.1', opacity: 0.8, offset: 0.5 }, { scale: '0.9', opacity: 1, offset: 0.7 }, { scale: '1', opacity: 1 }],
  'bounce-out': [{ scale: '1', opacity: 1 }, { scale: '1.1', opacity: 0.8, offset: 0.2 }, { scale: '0.3', opacity: 0, offset: 1 }],
  'flip-in': [{ transform: 'perspective(400px) rotateX(90deg)', opacity: 0 }, { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 }],
  'flip-in-y': [{ transform: 'perspective(400px) rotateY(90deg)', opacity: 0 }, { transform: 'perspective(400px) rotateY(0deg)', opacity: 1 }],
  'roll-in': [{ translate: '-100px 0', rotate: '-120deg', opacity: 0 }, { translate: '0 0', rotate: '0deg', opacity: 1 }],
  'pulse': [{ scale: '1' }, { scale: '1.1', offset: 0.5 }, { scale: '1' }],
  'heartbeat': [{ scale: '1' }, { scale: '1.3', offset: 0.14 }, { scale: '1', offset: 0.28 }, { scale: '1.3', offset: 0.42 }, { scale: '1', offset: 0.7 }],
  'float': [{ translate: '0 0' }, { translate: '0 -15px', offset: 0.5 }, { translate: '0 0' }],
  'neon-glow': [{ filter: 'brightness(1) drop-shadow(0 0 0px rgba(79, 70, 229, 0))' }, { filter: 'brightness(1.5) drop-shadow(0 0 10px rgba(79, 70, 229, 0.8))', offset: 0.5 }, { filter: 'brightness(1) drop-shadow(0 0 0px rgba(79, 70, 229, 0))' }],
  'tada': [{ scale: '1', rotate: '0deg' }, { scale: '0.9', rotate: '-3deg', offset: 0.1 }, { scale: '0.9', rotate: '-3deg', offset: 0.2 }, { scale: '1.1', rotate: '3deg', offset: 0.3 }, { scale: '1.1', rotate: '-3deg', offset: 0.4 }, { scale: '1.1', rotate: '3deg', offset: 0.5 }, { scale: '1.1', rotate: '-3deg', offset: 0.6 }, { scale: '1.1', rotate: '3deg', offset: 0.7 }, { scale: '1.1', rotate: '-3deg', offset: 0.8 }, { scale: '1.1', rotate: '3deg', offset: 0.9 }, { scale: '1', rotate: '0deg' }],
  'rubber-band': [{ scale: '1 1' }, { scale: '1.25 0.75', offset: 0.3 }, { scale: '0.75 1.25', offset: 0.4 }, { scale: '1.15 0.85', offset: 0.5 }, { scale: '0.95 1.05', offset: 0.65 }, { scale: '1.05 0.95', offset: 0.75 }, { scale: '1 1' }],
  'jello': [{ transform: 'skew(0,0)' }, { transform: 'skew(-12.5deg, -12.5deg)', offset: 0.22 }, { transform: 'skew(6.25deg, 6.25deg)', offset: 0.33 }, { transform: 'skew(-3.125deg, -3.125deg)', offset: 0.44 }, { transform: 'skew(1.5625deg, 1.5625deg)', offset: 0.55 }, { transform: 'skew(-0.78deg, -0.78deg)', offset: 0.66 }, { transform: 'skew(0.39deg, 0.39deg)', offset: 0.77 }, { transform: 'skew(-0.2deg, -0.2deg)', offset: 0.88 }, { transform: 'skew(0,0)' }],
  'swing': [{ rotate: '0deg' }, { rotate: '15deg', offset: 0.2 }, { rotate: '-10deg', offset: 0.4 }, { rotate: '5deg', offset: 0.6 }, { rotate: '-5deg', offset: 0.8 }, { rotate: '0deg' }],
  'wobble': [{ translate: '0 0', rotate: '0deg' }, { translate: '-25% 0', rotate: '-5deg', offset: 0.15 }, { translate: '20% 0', rotate: '3deg', offset: 0.3 }, { translate: '-15% 0', rotate: '-3deg', offset: 0.45 }, { translate: '10% 0', rotate: '2deg', offset: 0.6 }, { translate: '-5% 0', rotate: '-1deg', offset: 0.75 }, { translate: '0 0', rotate: '0deg' }],
  'glitch': [{ translate: '0' }, { translate: '-2px 2px', offset: 0.2 }, { translate: '2px -2px', offset: 0.4 }, { translate: '-2px 2px', offset: 0.6 }, { translate: '2px -2px', offset: 0.8 }, { translate: '0' }],
};

const BASE_ANIMATION_GALLERY_ITEMS = [
  { id: 'none', label: 'None', icon: 'None' },
  { id: 'fade-in', label: 'Fade In', icon: 'Bars' },
  { id: 'fade-out', label: 'Fade Out', icon: 'Bars' },
  { id: 'zoom-in', label: 'Zoom In', icon: 'Circle' },
  { id: 'zoom-out', label: 'Zoom Out', icon: 'Circle' },
  { id: 'rotate-in', label: 'Rotate In', icon: 'Circle' },
  { id: 'blur-in', label: 'Blur In', icon: 'Bars' },
  { id: 'slide-up', label: 'Slide Up', icon: 'Bars' },
  { id: 'slide-down', label: 'Slide Down', icon: 'Bars' },
  { id: 'slide-left', label: 'Slide Left', icon: 'Bars' },
  { id: 'slide-right', label: 'Slide Right', icon: 'Bars' },
  { id: 'flip-in', label: 'Flip X', icon: 'Bars' },
  { id: 'flip-in-y', label: 'Flip Y', icon: 'Bars' },
  { id: 'bounce-in', label: 'Bounce In', icon: 'Circle' },
  { id: 'bounce-out', label: 'Bounce Out', icon: 'Circle' },
  { id: 'pulse', label: 'Pulse', icon: 'Circle' },
];

/* ===== EXTRA ELEMENT ANIMATIONS (added; existing animations untouched) ===== */
const EXTRA_WAAPI_ANIMATIONS = {
  /* ---- Emphasis (new ones; heartbeat/swing/tada/wobble/jello/rubber-band already exist) ---- */
  'flash': [
    { opacity: 1 }, { opacity: 0, offset: 0.25 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.75 }, { opacity: 1 },
  ],
  'head-shake': [
    { transform: 'perspective(400px) translateX(0px) rotateY(0deg)' },
    { transform: 'perspective(400px) translateX(-6px) rotateY(-9deg)', offset: 0.065 },
    { transform: 'perspective(400px) translateX(5px) rotateY(7deg)', offset: 0.185 },
    { transform: 'perspective(400px) translateX(-3px) rotateY(-5deg)', offset: 0.315 },
    { transform: 'perspective(400px) translateX(2px) rotateY(3deg)', offset: 0.435 },
    { transform: 'perspective(400px) translateX(0px) rotateY(0deg)' },
  ],
  'shake-x': [
    { transform: 'translateX(0px)' },
    { transform: 'translateX(-10px)', offset: 0.1 }, { transform: 'translateX(10px)', offset: 0.2 },
    { transform: 'translateX(-10px)', offset: 0.3 }, { transform: 'translateX(10px)', offset: 0.4 },
    { transform: 'translateX(-10px)', offset: 0.5 }, { transform: 'translateX(10px)', offset: 0.6 },
    { transform: 'translateX(-10px)', offset: 0.7 }, { transform: 'translateX(10px)', offset: 0.8 },
    { transform: 'translateX(-10px)', offset: 0.9 }, { transform: 'translateX(0px)' },
  ],
  'shake-y': [
    { transform: 'translateY(0px)' },
    { transform: 'translateY(-10px)', offset: 0.1 }, { transform: 'translateY(10px)', offset: 0.2 },
    { transform: 'translateY(-10px)', offset: 0.3 }, { transform: 'translateY(10px)', offset: 0.4 },
    { transform: 'translateY(-10px)', offset: 0.5 }, { transform: 'translateY(10px)', offset: 0.6 },
    { transform: 'translateY(-10px)', offset: 0.7 }, { transform: 'translateY(10px)', offset: 0.8 },
    { transform: 'translateY(-10px)', offset: 0.9 }, { transform: 'translateY(0px)' },
  ],
  'jack-in-the-box': [
    { transform: 'scale(0.1) rotate(30deg)', transformOrigin: 'center bottom', opacity: 0 },
    { transform: 'scale(0.5) rotate(-10deg)', transformOrigin: 'center bottom', opacity: 1, offset: 0.5 },
    { transform: 'scale(0.7) rotate(3deg)', transformOrigin: 'center bottom', opacity: 1, offset: 0.7 },
    { transform: 'scale(1) rotate(0deg)', transformOrigin: 'center bottom', opacity: 1 },
  ],
  'hinge': [
    { transform: 'translate(0px,0px) rotate(0deg)', transformOrigin: 'left top', opacity: 1 },
    { transform: 'translate(0px,0px) rotate(80deg)', transformOrigin: 'left top', opacity: 1, offset: 0.2 },
    { transform: 'translate(0px,0px) rotate(60deg)', transformOrigin: 'left top', opacity: 1, offset: 0.4 },
    { transform: 'translate(0px,0px) rotate(80deg)', transformOrigin: 'left top', opacity: 1, offset: 0.6 },
    { transform: 'translate(0px,0px) rotate(60deg)', transformOrigin: 'left top', opacity: 1, offset: 0.8 },
    { transform: 'translate(0px,700px) rotate(60deg)', transformOrigin: 'left top', opacity: 0 },
  ],

  /* ---- Special ---- */
  'swing-in': [
    { transform: 'perspective(400px) rotateX(-100deg)', transformOrigin: 'center top', opacity: 0 },
    { transform: 'perspective(400px) rotateX(60deg)', transformOrigin: 'center top', opacity: 1, offset: 0.4 },
    { transform: 'perspective(400px) rotateX(-20deg)', transformOrigin: 'center top', opacity: 1, offset: 0.6 },
    { transform: 'perspective(400px) rotateX(10deg)', transformOrigin: 'center top', opacity: 1, offset: 0.8 },
    { transform: 'perspective(400px) rotateX(0deg)', transformOrigin: 'center top', opacity: 1 },
  ],
  'spiral-in': [
    { transform: 'rotate(-720deg) scale(0)', opacity: 0 },
    { transform: 'rotate(0deg) scale(1)', opacity: 1 },
  ],
  'spiral-out': [
    { transform: 'rotate(0deg) scale(1)', opacity: 1 },
    { transform: 'rotate(720deg) scale(0)', opacity: 0 },
  ],
  // Shape "morph" built from scale + skew + rotate (border-radius does not work on SVG nodes)
  'morph': [
    { transform: 'scale(0.3,1.6) skew(-20deg,0deg) rotate(-15deg)', opacity: 0 },
    { transform: 'scale(1.3,0.8) skew(12deg,0deg) rotate(8deg)', opacity: 1, offset: 0.4 },
    { transform: 'scale(0.92,1.06) skew(-5deg,0deg) rotate(-3deg)', opacity: 1, offset: 0.7 },
    { transform: 'scale(1,1) skew(0deg,0deg) rotate(0deg)', opacity: 1 },
  ],
  'skew-in': [
    { transform: 'translate(-100px,0px) skew(-30deg,0deg)', opacity: 0 },
    { transform: 'translate(20px,0px) skew(15deg,0deg)', opacity: 1, offset: 0.6 },
    { transform: 'translate(-5px,0px) skew(-5deg,0deg)', opacity: 1, offset: 0.8 },
    { transform: 'translate(0px,0px) skew(0deg,0deg)', opacity: 1 },
  ],
  'skew-out': [
    { transform: 'translate(0px,0px) skew(0deg,0deg)', opacity: 1 },
    { transform: 'translate(-10px,0px) skew(-5deg,0deg)', opacity: 1, offset: 0.2 },
    { transform: 'translate(100px,0px) skew(30deg,0deg)', opacity: 0 },
  ],
  'elastic-in': [
    { transform: 'scale(0)', opacity: 0 },
    { transform: 'scale(1.25)', opacity: 1, offset: 0.3 },
    { transform: 'scale(0.9)', opacity: 1, offset: 0.5 },
    { transform: 'scale(1.08)', opacity: 1, offset: 0.7 },
    { transform: 'scale(0.97)', opacity: 1, offset: 0.85 },
    { transform: 'scale(1)', opacity: 1 },
  ],
  'elastic-out': [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(0.88)', opacity: 1, offset: 0.2 },
    { transform: 'scale(1.18)', opacity: 1, offset: 0.4 },
    { transform: 'scale(0)', opacity: 0 },
  ],
  // Expand = grows in sideways, Collapse = shrinks away vertically
  'expand': [
    { transform: 'scale(0.001,1)', opacity: 0 },
    { transform: 'scale(1,1)', opacity: 1 },
  ],
  'collapse': [
    { transform: 'scale(1,1)', opacity: 1 },
    { transform: 'scale(1,0.001)', opacity: 0 },
  ],
  'blur-out': [
    { filter: 'blur(0px)', opacity: 1 },
    { filter: 'blur(20px)', opacity: 0 },
  ],
  'zoom-out-up': [
    { transform: 'translate(0px,0px) scale(1)', opacity: 1 },
    { transform: 'translate(0px,60px) scale(0.475)', opacity: 1, offset: 0.4 },
    { transform: 'translate(0px,-300px) scale(0.1)', opacity: 0 },
  ],
  'zoom-out-down': [
    { transform: 'translate(0px,0px) scale(1)', opacity: 1 },
    { transform: 'translate(0px,-60px) scale(0.475)', opacity: 1, offset: 0.4 },
    { transform: 'translate(0px,300px) scale(0.1)', opacity: 0 },
  ],
};


const EXTRA_LOOP_ANIMATIONS = ['flash', 'head-shake', 'shake-x', 'shake-y'];


const EXTRA_LOOP_TRANSITION = (duration) => ({ repeat: Infinity, duration });

const EXTRA_ANIMATION_VARIANTS = {
  'flash': { animate: { opacity: [1, 0, 1, 0, 1] }, transition: EXTRA_LOOP_TRANSITION(1.5) },
  'head-shake': { animate: { x: [0, -6, 5, -3, 2, 0], rotateY: [0, -9, 7, -5, 3, 0] }, transition: EXTRA_LOOP_TRANSITION(1.2) },
  'shake-x': { animate: { x: [0, -8, 8, -8, 8, -8, 8, 0] }, transition: EXTRA_LOOP_TRANSITION(0.9) },
  'shake-y': { animate: { y: [0, -8, 8, -8, 8, -8, 8, 0] }, transition: EXTRA_LOOP_TRANSITION(0.9) },
  'jack-in-the-box': { initial: { scale: 0.1, rotate: 30, opacity: 0 }, animate: { scale: 1, rotate: 0, opacity: 1 } },
  'hinge': { animate: { rotate: [0, 80, 60, 80, 60, 60], y: [0, 0, 0, 0, 0, 60], opacity: [1, 1, 1, 1, 1, 0], transformOrigin: 'left top' }, transition: EXTRA_LOOP_TRANSITION(2) },
  'swing-in': { initial: { rotateX: -100, opacity: 0, transformOrigin: 'center top' }, animate: { rotateX: 0, opacity: 1, transformOrigin: 'center top' } },
  'spiral-in': { initial: { rotate: -540, scale: 0, opacity: 0 }, animate: { rotate: 0, scale: 1, opacity: 1 } },
  'spiral-out': { initial: { rotate: 0, scale: 1, opacity: 1 }, animate: { rotate: 540, scale: 0, opacity: 0 } },
  'morph': { initial: { scaleX: 0.4, scaleY: 1.4, skewX: -20, opacity: 0 }, animate: { scaleX: 1, scaleY: 1, skewX: 0, opacity: 1 } },
  'skew-in': { initial: { x: -60, skewX: -30, opacity: 0 }, animate: { x: 0, skewX: 0, opacity: 1 } },
  'skew-out': { initial: { x: 0, skewX: 0, opacity: 1 }, animate: { x: 60, skewX: 30, opacity: 0 } },
  'elastic-in': { initial: { scale: 0, opacity: 0 }, animate: { scale: [0, 1.25, 0.9, 1.08, 1], opacity: 1 } },
  'elastic-out': { initial: { scale: 1, opacity: 1 }, animate: { scale: [1, 0.88, 1.18, 0], opacity: [1, 1, 1, 0] } },
  'expand': { initial: { scaleX: 0, opacity: 0 }, animate: { scaleX: 1, opacity: 1 } },
  'collapse': { initial: { scaleY: 1, opacity: 1 }, animate: { scaleY: 0, opacity: 0 } },
  'blur-out': { initial: { filter: 'blur(0px)', opacity: 1 }, animate: { filter: 'blur(12px)', opacity: 0 } },
  'zoom-out-up': { initial: { scale: 1, y: 0, opacity: 1 }, animate: { scale: 0.1, y: -60, opacity: 0 } },
  'zoom-out-down': { initial: { scale: 1, y: 0, opacity: 1 }, animate: { scale: 0.1, y: 60, opacity: 0 } },
};


const EXTRA_GALLERY_ITEMS = [
  { id: 'heartbeat', label: 'Heart Beat', icon: 'Circle', sectionTitle: 'Emphasis' },
  { id: 'flash', label: 'Flash', icon: 'Circle' },
  { id: 'head-shake', label: 'Head Shake', icon: 'Circle' },
  { id: 'swing', label: 'Swing', icon: 'Circle' },
  { id: 'tada', label: 'Tada', icon: 'Circle' },
  { id: 'wobble', label: 'Wobble', icon: 'Circle' },
  { id: 'jello', label: 'Jello', icon: 'Circle' },
  { id: 'rubber-band', label: 'Rubber Band', icon: 'Circle' },
  { id: 'shake-x', label: 'Shake X', icon: 'Circle' },
  { id: 'shake-y', label: 'Shake Y', icon: 'Circle' },
  { id: 'jack-in-the-box', label: 'Jack In The Box', icon: 'Circle' },
  { id: 'hinge', label: 'Hinge', icon: 'Circle' },

  { id: 'swing-in', label: 'Swing In', icon: 'Bars', sectionTitle: 'Special animations' },
  { id: 'spiral-in', label: 'Spiral In', icon: 'Bars' },
  { id: 'spiral-out', label: 'Spiral Out', icon: 'Bars' },
  { id: 'morph', label: 'Morph', icon: 'Bars' },
  { id: 'skew-in', label: 'Skew In', icon: 'Bars' },
  { id: 'skew-out', label: 'Skew Out', icon: 'Bars' },
  { id: 'elastic-in', label: 'Elastic In', icon: 'Bars' },
  { id: 'elastic-out', label: 'Elastic Out', icon: 'Bars' },
  { id: 'expand', label: 'Expand', icon: 'Bars' },
  { id: 'collapse', label: 'Collapse', icon: 'Bars' },
  { id: 'blur-out', label: 'Blur Out', icon: 'Bars' },
  { id: 'zoom-out-up', label: 'Zoom Out Up', icon: 'Bars' },
  { id: 'zoom-out-down', label: 'Zoom Out Down', icon: 'Bars' },
];

Object.assign(WAAPI_ANIMATIONS, EXTRA_WAAPI_ANIMATIONS);
Object.assign(ANIMATION_VARIANTS, EXTRA_ANIMATION_VARIANTS);
const ANIMATION_GALLERY_ITEMS = [
  ...BASE_ANIMATION_GALLERY_ITEMS,
  ...EXTRA_GALLERY_ITEMS
];
/* ===== END EXTRA ELEMENT ANIMATIONS ===== */

const EASING_OPTIONS = [
  'Linear',
  'Smooth',
  'Ease In',
  'Ease Out',
  'Ease In & Out',
  'Bounce'
];

/* -------------------------------------------------------------------------- */
/*                         TEXT EFFECTS (new runner)                          */
/* -------------------------------------------------------------------------- */

// Every id here must exist in TE_EFFECT_CSS inside AnimationRunner.js
const TEXT_EFFECT_IDS = [
  'slots',
  'carousel',
  'bloat',
  'roulette',
  'hinged',
  'mexiwave',
  'enter',
  'random',
  'swapsies',
  'fading',
  'flipping',
  'slide',
  'karaoke',
  'filling',
  'blocks',
  'scaling',
  'turning',
  'folding',
  'bulge',
  'perspective',
  'zipping',
  'spinning',
  'tumbling',
  'bubbling',
  'swinging',
  'rolling',
  'blowing',
  'meeting',
  'conveyor',
  'cascade',
  'tossing',
  'wave',
  'rising',
  'twirl',
  'backflip',
  'jump',
  'glare',
  'expanding',
  'falling',
  'scrolled',
  'bloom',
  'bloom-north',
  'bloom-north-east',
  'bloom-east',
  'bloom-south-east',
  'bloom-south',
  'bloom-south-west',
  'bloom-west',
  'bloom-north-west',
  'stream',
  'reflective',
  'glitch',
  'glitchy',
  'strikethrough',
  'taste'
];

const TEXT_EFFECT_GALLERY_ITEMS = [
  { id: 'none', label: 'None', icon: 'None' },
  ...TEXT_EFFECT_IDS.map(id => ({
    id,
    label: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    icon: 'Text'
  }))
];

const TEXT_FX_ATTR_MAP = {
  effect: 'data-text-effect',
  speed: 'data-text-effect-speed',
  step: 'data-text-effect-step',
  color: 'data-text-effect-color'
};
const TEXT_FX_DEFAULTS = { speed: 0.25, step: 0.1 };

const resolveLiveElement = (el) => {
  if (el && !document.body.contains(el)) {
    const id = el.id || el.getAttribute('data-name');
    if (id) {
      const activePage = document.querySelector('.active-page-outline') || document.querySelector('.page-svg-container');
      const fresh = activePage?.querySelector(`[id="${id}"], [data-name="${id}"]`) || document.getElementById(id);
      if (fresh) return fresh;
    }
  }
  return el;
};

const readTextFx = (el) => {
  const speed = parseFloat(el?.getAttribute('data-text-effect-speed'));
  const step = parseFloat(el?.getAttribute('data-text-effect-step'));
  return {
    effect: el?.getAttribute('data-text-effect') || 'none',
    speed: isNaN(speed) ? TEXT_FX_DEFAULTS.speed : speed,
    step: isNaN(step) ? TEXT_FX_DEFAULTS.step : step,
    color: el?.getAttribute('data-text-effect-color') || ''
  };
};

// True for plain SVG <text>/<tspan>: the runner builds HTML <span>s, which SVG text cannot render
const isPlainSvgText = (el) =>
  !!el && el.namespaceURI === 'http://www.w3.org/2000/svg' &&
  !el.closest?.('foreignObject') && !el.querySelector?.('foreignObject');

// Detect if an element is a text element (supports Text Effects)
const isTextElement = (el) => {
  if (!el) return false;
  // If element already has text effect set, treat as text
  if (el.hasAttribute?.('data-text-effect') && el.getAttribute?.('data-text-effect') !== 'none') return true;

  const tag = el.tagName?.toLowerCase() || '';
  const dataType = (el.getAttribute?.('data-type') || '').toLowerCase();
  const dataSubtopic = (el.getAttribute?.('data-subtopic') || '').toLowerCase();
  const id = (el.id || '').toLowerCase();
  const dataName = (el.getAttribute?.('data-name') || '').toLowerCase();

  // Explicit non-text element tags (shapes, media, containers)
  if (['circle', 'rect', 'ellipse', 'polygon', 'polyline', 'line', 'path', 'image', 'img', 'video', 'audio', 'canvas'].includes(tag)) {
    return false;
  }

  // Explicit non-text data types
  if (dataType && ['image', 'video', 'audio', 'icon', 'shape', 'button', 'qrcode', 'table', 'embed', 'map', 'slideshow', 'hotspot', 'vector-path'].includes(dataType)) {
    return false;
  }

  // Component shape/button flags or IDs
  if (
    el.getAttribute?.('data-is-element-shape') === 'true' ||
    el.getAttribute?.('data-is-shape') === 'true' ||
    el.getAttribute?.('data-is-element-button') === 'true' ||
    el.getAttribute?.('data-is-button') === 'true' ||
    id.startsWith('button-') ||
    id.startsWith('shape-') ||
    id.startsWith('circle-') ||
    id.startsWith('rect-')
  ) {
    return false;
  }

  // Explicit text element tags & types
  if (tag === 'text' || tag === 'tspan') return true;
  if (dataType === 'text') return true;
  if (dataSubtopic === 'text' || dataSubtopic === 'typography') return true;
  if (el.getAttribute?.('data-is-element-typography') === 'true') return true;

  // foreignObject (HTML text container)
  if (tag === 'foreignobject') {
    if (el.querySelector('video, iframe, canvas, audio')) return false;
    return true;
  }

  // Groups (<g>)
  if (tag === 'g') {
    if (
      el.getAttribute?.('data-is-shape-group') === 'true' ||
      el.getAttribute?.('data-is-icon-group') === 'true' ||
      el.getAttribute?.('data-is-image-group') === 'true'
    ) {
      return false;
    }
    const hasTextChild = el.querySelector?.('text, tspan, foreignObject');
    if (hasTextChild && !el.querySelector?.('circle, rect, ellipse, polygon, polyline, image, video')) {
      return true;
    }
    if ((dataName.includes('text') || id.includes('text') || dataName.includes('typography')) && !id.includes('circle') && !id.includes('rect') && !id.includes('shape')) {
      return true;
    }
    return !!hasTextChild;
  }

  if (el.classList?.contains('text-element') || el.classList?.contains('canvas-text')) {
    return true;
  }

  return false;
};

/* -------------------------------------------------------------------------- */
/*                                SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */

const SliderControl = React.memo(({ label, value, onChange, onCommit, min = 0, max = 10, step = 0.1, unit = '' }) => {
  const [localVal, setLocalVal] = React.useState(value);
  const commitTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    setLocalVal(value);
  }, [value]);

  React.useEffect(() => {
    return () => {
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    };
  }, []);

  const percentage = Math.max(0, Math.min(100, ((localVal - min) / (max - min)) * 100));

  const handleChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalVal(val);
    if (onChange) onChange(val);

    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    commitTimeoutRef.current = setTimeout(() => {
      if (onCommit) onCommit(val);
    }, 250);
  };

  const handleCommit = () => {
    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    if (onCommit) onCommit(localVal);
  };

  return (
    <div
      className="flex flex-col gap-[0.2vw] w-full select-none"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="text-[0.82vw] font-medium text-gray-800">{label} :</span>
      <div className="flex items-center gap-[0.5vw] w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localVal}
          onChange={handleChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          onKeyUp={handleCommit}
          className="flex-1 cursor-pointer custom-range-slider"
          style={{ backgroundImage: `linear-gradient(to right, #EC5137 0%, #EC5137 ${percentage}%, #E2E8F0 ${percentage}%, #E2E8F0 100%)` }}
        />
        <span className="text-[0.8vw] font-medium text-gray-700 min-w-[1.8vw] text-right">{Math.round(localVal * 100) / 100}{unit}</span>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                        SINGLE ELEMENT EDITOR                               */
/* -------------------------------------------------------------------------- */

const SingleAnimationEditor = ({ element, elements, onUpdate, onDelete, onOpenGallery, previewAnimation, previewTextEffects, ANIMATION_GALLERY_ITEMS, EASING_OPTIONS }) => {
  const [showEasingSelector, setShowEasingSelector] = React.useState(false);
  const [showRepeatSelector, setShowRepeatSelector] = React.useState(false);
  const [showTriggerSelector, setShowTriggerSelector] = React.useState(false);

  const primaryElement = element || (elements && elements[0]);
  const targetList = elements || (() => {
    if (!element) return [];
    const multiSelect = Array.from(document.querySelectorAll('.is-selected'));
    if (multiSelect.length > 1 && multiSelect.some(el => el.id === element.id || el.getAttribute('data-name') === (element.getAttribute('data-name') || element.id))) {
      return multiSelect;
    }
    return [element];
  })();

  const [trigger, setTrigger] = React.useState(primaryElement.getAttribute('data-animation-trigger') || 'While Opening');
  const [action, setAction] = React.useState(primaryElement.getAttribute('data-animation-action') || 'Click');
  const [showActionSelector, setShowActionSelector] = React.useState(false);

  const getPrefix = (t) => (t === 'While Opening' ? 'open' : 'interact');

  const isText = isTextElement(primaryElement);

  // 'animation' = classic entrance/interaction animations, 'text' = new cascading text effects (only for text elements)
  const [mode, setMode] = React.useState(() => {
    if (!isText) return 'animation';
    const hasFx = primaryElement.hasAttribute('data-text-effect');
    const hasAnim = (primaryElement.getAttribute('data-animation-open-type') || 'none') !== 'none' ||
      (primaryElement.getAttribute('data-animation-interact-type') || 'none') !== 'none';
    return hasFx && !hasAnim ? 'text' : 'animation';
  });
  const [textFx, setTextFx] = React.useState(() => readTextFx(primaryElement));

  React.useEffect(() => {
    if (!isText && mode !== 'animation') {
      setMode('animation');
    }
  }, [isText, mode, primaryElement]);

  const [settings, setSettings] = React.useState({
    type: primaryElement.getAttribute(`data-animation-${getPrefix(trigger)}-type`) || 'none',
    delay: parseFloat(primaryElement.getAttribute(`data-animation-${getPrefix(trigger)}-delay`)) || 0,
    duration: parseFloat(primaryElement.getAttribute(`data-animation-${getPrefix(trigger)}-duration`)) || 1,
    easing: primaryElement.getAttribute(`data-animation-${getPrefix(trigger)}-easing`) || 'Linear',
    repeat: primaryElement.getAttribute(`data-animation-${getPrefix(trigger)}-repeat`) || 'None',
    everyVisit: primaryElement.getAttribute(`data-animation-${getPrefix(trigger)}-every-visit`) !== 'false'
  });

  React.useEffect(() => {
    const t = primaryElement.getAttribute('data-animation-trigger') || 'While Opening';
    const p = getPrefix(t);
    setTrigger(t);
    setAction(primaryElement.getAttribute('data-animation-action') || 'Click');
    setSettings({
      type: primaryElement.getAttribute(`data-animation-${p}-type`) || 'none',
      delay: parseFloat(primaryElement.getAttribute(`data-animation-${p}-delay`)) || 0,
      duration: parseFloat(primaryElement.getAttribute(`data-animation-${p}-duration`)) || 1,
      easing: primaryElement.getAttribute(`data-animation-${p}-easing`) || 'Linear',
      repeat: primaryElement.getAttribute(`data-animation-${p}-repeat`) || 'None',
      everyVisit: primaryElement.getAttribute(`data-animation-${p}-every-visit`) !== 'false'
    });
  }, [primaryElement]);

  React.useEffect(() => {
    setTextFx(readTextFx(primaryElement));
  }, [primaryElement]);

  const updateTextFx = (key, value, commit = true) => {
    const isRemoval = value === null || value === '' || (key === 'effect' && value === 'none');
    setTextFx(prev => key === 'effect' && isRemoval
      ? { ...prev, effect: 'none', ...TEXT_FX_DEFAULTS, color: '' }
      : { ...prev, [key]: value });

    targetList.forEach(el => {
      const target = resolveLiveElement(el);
      const id = target.id || target.getAttribute('data-name');
      const attr = TEXT_FX_ATTR_MAP[key];
      if (isRemoval) target.removeAttribute(attr); else target.setAttribute(attr, String(value));
      if (commit && onUpdate) onUpdate(id, attr, isRemoval ? null : String(value));

      if (key === 'effect') {
        if (isRemoval) {
          ['speed', 'step', 'color'].forEach(k => {
            target.removeAttribute(TEXT_FX_ATTR_MAP[k]);
            if (commit && onUpdate) onUpdate(id, TEXT_FX_ATTR_MAP[k], null);
          });
        } else {
          // When applying a text effect, clear classic animation to prevent duplicate/conflicting animations
          target.removeAttribute('data-animation-open-type');
          target.removeAttribute('data-animation-interact-type');
          target.removeAttribute('data-animation-intent');
          if (commit && onUpdate) {
            onUpdate(id, 'data-animation-open-type', null);
            onUpdate(id, 'data-animation-interact-type', null);
            onUpdate(id, 'data-animation-intent', null);
          }
          setSettings(prev => ({ ...prev, type: 'none' }));
        }
      }
    });
  };

  const updateSetting = (key, value, commit = true) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    const prefix = getPrefix(trigger);
    const attr = `data-animation-${prefix}-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

    targetList.forEach(el => {
      let target = el;
      if (target && !document.body.contains(target)) {
        const id = target.id || target.getAttribute('data-name');
        if (id) {
          const activePage = document.querySelector('.active-page-outline') || document.querySelector('.page-svg-container');
          const fresh = activePage?.querySelector(`[id="${id}"], [data-name="${id}"]`) || document.getElementById(id);
          if (fresh) target = fresh;
        }
      }
      target.setAttribute(attr, String(value));
      target.setAttribute('data-animation-trigger', trigger);
      if (trigger === 'On Page') {
        target.setAttribute('data-animation-action', action || 'Click');
        target.style.pointerEvents = 'auto';
        if ((action || 'Click') === 'Click') target.style.cursor = 'pointer';
      }
      target.setAttribute('data-animation-intent', 'true');

      // When applying a classic animation, clear any text effect to prevent duplicate/conflicting effects
      if (key === 'type' && value && value !== 'none') {
        target.removeAttribute('data-text-effect');
        ['speed', 'step', 'color'].forEach(k => target.removeAttribute(TEXT_FX_ATTR_MAP[k]));
        if (commit && onUpdate) {
          onUpdate(target.id || target.getAttribute('data-name'), 'data-text-effect', null);
          ['speed', 'step', 'color'].forEach(k => onUpdate(target.id || target.getAttribute('data-name'), TEXT_FX_ATTR_MAP[k], null));
        }
        setTextFx({ effect: 'none', ...TEXT_FX_DEFAULTS, color: '' });
      }

      if (commit && onUpdate) {
        onUpdate(target.id || target.getAttribute('data-name'), attr, value);
        onUpdate(target.id || target.getAttribute('data-name'), 'data-animation-trigger', trigger);
        onUpdate(target.id || target.getAttribute('data-name'), 'data-animation-intent', 'true');
        if (trigger === 'On Page') {
          onUpdate(target.id || target.getAttribute('data-name'), 'data-animation-action', action || 'Click');
        }
      }
    });
  };

  const handleTriggerChange = (newTrigger) => {
    const oldPrefix = getPrefix(trigger);
    const newPrefix = getPrefix(newTrigger);
    setTrigger(newTrigger);

    // Refresh local settings to match the new prefix
    setSettings({
      type: primaryElement.getAttribute(`data-animation-${newPrefix}-type`) || 'none',
      delay: parseFloat(primaryElement.getAttribute(`data-animation-${newPrefix}-delay`)) || 0,
      duration: parseFloat(primaryElement.getAttribute(`data-animation-${newPrefix}-duration`)) || 1,
      easing: primaryElement.getAttribute(`data-animation-${newPrefix}-easing`) || 'Linear',
      repeat: primaryElement.getAttribute(`data-animation-${newPrefix}-repeat`) || 'None',
      everyVisit: primaryElement.getAttribute(`data-animation-${newPrefix}-every-visit`) !== 'false'
    });

    targetList.forEach(el => {
      let target = el;
      if (target && !document.body.contains(target)) {
        const id = target.id || target.getAttribute('data-name');
        const activePage = document.querySelector('.active-page-outline') || document.querySelector('.page-svg-container');
        const fresh = activePage?.querySelector(`[id="${id}"], [data-name="${id}"]`) || document.getElementById(id);
        if (fresh) target = fresh;
      }

      // Migrate settings if the new namespace is empty
      const currentNewType = target.getAttribute(`data-animation-${newPrefix}-type`);
      if (!currentNewType || currentNewType === 'none') {
        const oldType = target.getAttribute(`data-animation-${oldPrefix}-type`);
        if (oldType && oldType !== 'none') {
          ['type', 'delay', 'duration', 'easing', 'repeat', 'every-visit'].forEach(k => {
            const attrName = `data-animation-${newPrefix}-${k}`;
            const val = target.getAttribute(`data-animation-${oldPrefix}-${k}`);
            if (val) {
              target.setAttribute(attrName, val);
              if (onUpdate) onUpdate(target.id || target.getAttribute('data-name'), attrName, val);
            }
          });
        }
      }

      target.setAttribute('data-animation-trigger', newTrigger);
      if (newTrigger === 'On Page') {
        const currentAction = target.getAttribute('data-animation-action') || action || 'Click';
        target.setAttribute('data-animation-action', currentAction);
        target.style.pointerEvents = 'auto';
        if (currentAction === 'Click') target.style.cursor = 'pointer';
        if (onUpdate) onUpdate(target.id || target.getAttribute('data-name'), 'data-animation-action', currentAction);
      } else {
        target.style.pointerEvents = '';
        target.style.cursor = '';
      }
      target.setAttribute('data-animation-intent', 'true');
      if (onUpdate) {
        onUpdate(target.id || target.getAttribute('data-name'), 'data-animation-trigger', newTrigger);
        onUpdate(target.id || target.getAttribute('data-name'), 'data-animation-intent', 'true');
      }
    });
    setShowTriggerSelector(false);
  };

  const handleActionChange = (newAction) => {
    setAction(newAction);
    targetList.forEach(el => {
      let target = el;
      if (target && !document.body.contains(target)) {
        const id = target.id || target.getAttribute('data-name');
        const activePage = document.querySelector('.active-page-outline') || document.querySelector('.page-svg-container');
        const fresh = activePage?.querySelector(`[id="${id}"], [data-name="${id}"]`) || document.getElementById(id);
        if (fresh) target = fresh;
      }
      target.setAttribute('data-animation-action', newAction);
      target.setAttribute('data-animation-intent', 'true');

      // Ensure interactive elements are receptive to pointer events
      if (newAction === 'Click' || newAction === 'Hover') {
        target.style.pointerEvents = 'auto';
        if (newAction === 'Click') target.style.cursor = 'pointer';
      }

      if (onUpdate) {
        onUpdate(target.id || target.getAttribute('data-name'), 'data-animation-action', newAction);
        onUpdate(target.id || target.getAttribute('data-name'), 'data-animation-intent', 'true');
      }
    });
    setShowActionSelector(false);
  };

  const handleDeleteTextFx = () => {
    targetList.forEach(el => {
      const target = resolveLiveElement(el);
      const id = target.id || target.getAttribute('data-name');
      Object.values(TEXT_FX_ATTR_MAP).forEach(attr => {
        target.removeAttribute(attr);
        if (onUpdate) onUpdate(id, attr, null);
      });
    });
    setTextFx({ effect: 'none', ...TEXT_FX_DEFAULTS, color: '' });
    const stillAnimated = targetList.some(el => {
      const t = resolveLiveElement(el);
      return t.getAttribute('data-animation-intent') === 'true' ||
        (t.getAttribute('data-animation-open-type') || 'none') !== 'none';
    });
    if (!stillAnimated && onDelete) onDelete(targetList);
  };

  const handleDelete = () => {
    targetList.forEach(el => {
      let target = el;
      if (target && !document.body.contains(target)) {
        const id = target.id || target.getAttribute('data-name');
        const activePage = document.querySelector('.active-page-outline') || document.querySelector('.page-svg-container');
        const fresh = activePage?.querySelector(`[id="${id}"], [data-name="${id}"]`) || document.getElementById(id);
        if (fresh) target = fresh;
      }
      const attrsToRemove = Array.from(target.attributes)
        .map(a => a.name)
        .filter(name => name.startsWith('data-animation-') && name !== 'data-animation-group');
      attrsToRemove.forEach(a => {
        target.removeAttribute(a);
        if (onUpdate) onUpdate(target.id || target.getAttribute('data-name'), a, null);
      });
      target.removeAttribute('data-animation-intent');
      if (onUpdate) onUpdate(target.id || target.getAttribute('data-name'), 'data-animation-intent', null);

      // Clear inline styles that might have been left over by WAAPI animations
      if (target.__currentAnimation) {
        try { target.__currentAnimation.cancel(); } catch {}
        target.__currentAnimation = null;
      }
    });
    setSettings({ type: 'none', delay: 0, duration: 1, easing: 'Linear', repeat: 'None', everyVisit: true });
    const keepsTextFx = targetList.some(el => resolveLiveElement(el).hasAttribute('data-text-effect'));
    if (onDelete && !keepsTextFx) {
      onDelete(targetList);
    }
  };

  const galleryItem = ANIMATION_GALLERY_ITEMS.find(a => a.id === settings.type);
  const textFxItem = TEXT_EFFECT_GALLERY_ITEMS.find(a => a.id === textFx.effect);

  return (
    <div className="flex flex-col gap-[0.75vw]">
      {/* Mode toggle: Animation | Text Effect (only shown for text elements) */}
      {isText && (
        <div className="flex p-[0.2vw] bg-gray-100 rounded-[0.45vw] gap-[0.2vw]">
          {[['animation', 'Animation'], ['text', 'Text Effect']].map(([key, label]) => (
            <button
              key={key}
              onClick={(e) => { e.stopPropagation(); setMode(key); }}
              className={`flex-1 h-[2vw] rounded-[0.4vw] text-[0.8vw] font-medium transition-all ${mode === key ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {mode === 'text' && isText ? (
        <div className="flex flex-col gap-[0.75vw]">
          {isPlainSvgText(primaryElement) && (
            <div className="text-[0.7vw] leading-snug text-amber-700 bg-amber-50 border border-amber-200 rounded-[0.4vw] px-[0.6vw] py-[0.45vw]">
              Text effects need HTML text. Plain SVG &lt;text&gt; cannot show split letters, so use a text box / foreignObject element.
            </div>
          )}

          <div className="flex items-center justify-between gap-[0.75vw]">
            <span className="text-[0.75vw] text-gray-500 leading-tight">Plays each time the text scrolls into view</span>
            <button
              onClick={(e) => { e.stopPropagation(); previewTextEffects(targetList); }}
              disabled={textFx.effect === 'none'}
              className="w-[2vw] h-[2vw] flex items-center justify-center bg-white border border-gray-300 rounded-[0.4vw] text-[#EC5137] shadow-2xs hover:border-[#EC5137] hover:bg-[#EC5137]/5 disabled:opacity-40 transition-all flex-shrink-0"
              title="Preview Text Effect"
            >
              <ScanEye size="0.95vw" />
            </button>
          </div>

          <div className="flex gap-[0.8vw] items-center">
            <div className="anim-panel-preview-card w-[5.5vw] h-[6.5vw] relative group rounded-[0.45vw] overflow-hidden border border-gray-200 bg-white shadow-2xs hover:border-gray-300 transition-all duration-200 flex-shrink-0 flex flex-col">
              <div className="flex-1 relative w-full flex items-center justify-center">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenGallery(primaryElement, (newEffect) => updateTextFx('effect', newEffect), 'text');
                  }}
                  className="anim-panel-replace-btn absolute top-[0.4vw] right-[0.4vw] w-[1.4vw] h-[1.4vw] rounded-[0.3vw] flex items-center justify-center cursor-pointer transition-all duration-200 z-20 text-gray-400 hover:text-[#EC5137] hover:bg-gray-100"
                  title="Replace Text Effect"
                >
                  <Icon icon="ph:arrows-left-right" width="0.85vw" height="0.85vw" className="transition-colors" />
                </div>
                <div className="pt-[1vw] group-hover:opacity-40 transition-opacity duration-100">
                  {textFx.effect === 'none'
                    ? <Icon icon="radix-icons:shadow-none" width="1.8vw" height="1.8vw" className="text-gray-500" />
                    : <span className="text-[1.5vw] font-semibold text-gray-700 leading-none">Aa</span>}
                </div>
              </div>
              <div className="h-[1.8vw] w-full flex items-center justify-center bg-gray-50/70 border-t border-gray-100">
                <span className="text-[0.72vw] font-medium text-gray-700 truncate px-[0.4vw]">{textFxItem?.label || 'None'}</span>
              </div>
            </div>

            <div className="flex-1 space-y-[0.5vw]">
              <SliderControl
                label="Speed"
                value={textFx.speed}
                onChange={(v) => updateTextFx('speed', v, false)}
                onCommit={(v) => updateTextFx('speed', v, true)}
                unit="s"
                min={0.05}
                max={2}
                step={0.05}
              />
              <SliderControl
                label="Letter Delay"
                value={textFx.step}
                onChange={(v) => updateTextFx('step', v, false)}
                onCommit={(v) => updateTextFx('step', v, true)}
                unit="s"
                min={0}
                max={0.5}
                step={0.01}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[0.82vw] font-medium text-gray-800 leading-none">Text Color :</span>
            <div className="flex items-center gap-[0.5vw]">
              {textFx.color && (
                <button onClick={() => updateTextFx('color', '')} className="text-[0.75vw] text-gray-500 hover:text-[#EC5137] transition-colors">Auto</button>
              )}
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(textFx.color) ? textFx.color : '#000000'}
                onChange={(e) => updateTextFx('color', e.target.value)}
                className="w-[2vw] h-[2vw] p-0 border border-gray-300 rounded-[0.4vw] cursor-pointer bg-white shadow-2xs"
              />
            </div>
          </div>

          <div className="flex flex-col pt-[0.2vw] mt-[0.6vw] border-t border-gray-100 gap-[0.4vw]">
            <div className="flex items-center justify-end pt-[0.2vw]">
              <button
                onClick={handleDeleteTextFx}
                className="w-[1.9vw] h-[1.9vw] flex items-center justify-center bg-white border border-gray-300 rounded-[0.4vw] text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-2xs"
                title="Remove text effect"
              >
                <Icon icon="lucide:trash-2" width="0.95vw" height="0.95vw" />
              </button>
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* Top Dropdowns & Preview */}
      <div className="flex gap-[0.6vw]">
        <div className="flex-1 relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowTriggerSelector(!showTriggerSelector); setShowActionSelector(false); }}
            className="w-full h-[2vw] flex items-center justify-between px-[0.7vw] bg-white border border-gray-300 rounded-[0.4vw] shadow-2xs text-[0.8vw] font-semibold text-gray-700 hover:border-gray-400 focus:border-[#EC5137] transition-all group"
          >
            <span className="text-[0.8vw] font-semibold text-gray-700 truncate">{trigger}</span>
            <ArrowRightLeft size="0.75vw" className="text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          {showTriggerSelector && (
            <div className="absolute top-full left-0 w-full mt-[0.3vw] bg-white border border-gray-100 rounded-[0.5vw] shadow-2xl z-30 py-[0.25vw] overflow-hidden animate-in fade-in zoom-in-95">
              {['While Opening', 'On Page'].map(t => (
                <button
                  key={t}
                  onClick={() => handleTriggerChange(t)}
                  className={`w-full text-left px-[0.8vw] py-[0.45vw] text-[0.8vw] font-medium transition-colors ${trigger === t ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {trigger === 'On Page' && (
          <div className="flex-1 relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowActionSelector(!showActionSelector); setShowTriggerSelector(false); }}
              className="w-full h-[2vw] flex items-center justify-between px-[0.7vw] bg-white border border-gray-300 rounded-[0.4vw] shadow-2xs text-[0.8vw] font-semibold text-gray-700 hover:border-gray-400 focus:border-[#EC5137] transition-all group"
            >
              <span className="text-[0.8vw] font-semibold text-gray-700 truncate">{action}</span>
              <ArrowRightLeft size="0.75vw" className="text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            {showActionSelector && (
              <div className="absolute top-full left-0 w-full mt-[0.3vw] bg-white border border-gray-100 rounded-[0.5vw] shadow-2xl z-30 py-[0.25vw] overflow-hidden animate-in fade-in zoom-in-95">
                {['Click', 'Hover', 'Always'].map(a => (
                  <button
                    key={a}
                    onClick={() => handleActionChange(a)}
                    className={`w-full text-left px-[0.8vw] py-[0.45vw] text-[0.8vw] font-medium transition-colors ${action === a ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={(e) => {
            if (elements) {
              elements.forEach(target => {
                previewAnimation(e, settings.type, settings, target, true);
              });
            } else {
              previewAnimation(e, settings.type, settings, primaryElement);
            }
          }}
          className="w-[2vw] h-[2vw] flex items-center justify-center bg-white border border-gray-300 rounded-[0.4vw] text-[#EC5137] shadow-2xs hover:border-[#EC5137] hover:bg-[#EC5137]/5 transition-all flex-shrink-0"
          title="Preview Animation"
        >
          <ScanEye size="0.95vw" />
        </button>
      </div>

      <div className="flex gap-[0.8vw] items-center">
        {/* Style Preview Card */}
        <div
          className="anim-panel-preview-card w-[5.5vw] h-[6.5vw] relative group rounded-[0.45vw] overflow-hidden border border-gray-200 bg-white shadow-2xs hover:border-gray-300 transition-all duration-200 flex-shrink-0 flex flex-col"
        >
          <div className="flex-1 relative w-full flex items-center justify-center">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenGallery(primaryElement, (newType) => {
                  updateSetting('type', newType);
                });
              }}
              className="anim-panel-replace-btn absolute top-[0.4vw] right-[0.4vw] w-[1.4vw] h-[1.4vw] rounded-[0.3vw] flex items-center justify-center cursor-pointer transition-all duration-200 z-20 text-gray-400 hover:text-[#EC5137] hover:bg-gray-100"
              title="Replace Animation"
            >
              <Icon icon="ph:arrows-left-right" width="0.85vw" height="0.85vw" className="transition-colors" />
            </div>
            <div className="pt-[1vw] group-hover:opacity-40 transition-opacity duration-100 relative z-0">
              {galleryItem?.icon === 'None' ? (
                <Icon icon="radix-icons:shadow-none" width="1.8vw" height="1.8vw" className="text-gray-500" />
              ) : galleryItem?.icon === 'Circle' ? (
                <Icon icon="game-icons:glass-ball" width="1.8vw" height="1.8vw" className="text-gray-700" />
              ) : (
                <div className="anim-panel-bars flex items-end gap-[0.3vw]">
                  <div className="anim-panel-bar w-[0.55vw] h-[1.5vw] bg-gray-300 rounded-[0.05vw]" />
                  <div className="anim-panel-bar w-[0.55vw] h-[1.5vw] bg-gray-400 rounded-[0.05vw]" />
                  <div className="anim-panel-bar w-[0.55vw] h-[1.5vw] bg-gray-600 rounded-[0.05vw]" />
                </div>
              )}
            </div>
          </div>
          <div className="h-[1.8vw] w-full flex items-center justify-center bg-gray-50/70 border-t border-gray-100 relative z-0">
            <span className="text-[0.72vw] font-medium text-gray-700 truncate px-[0.4vw]">{galleryItem?.label || 'None'}</span>
          </div>
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10" />
        </div>

        {/* Sliders */}
        <div className="flex-1 space-y-[0.5vw]">
          <SliderControl
            label="Delay"
            value={settings.delay}
            onChange={(v) => updateSetting('delay', v, false)}
            onCommit={(v) => updateSetting('delay', v, true)}
            unit="s"
            max={10}
          />
          <SliderControl
            label="Duration"
            value={settings.duration}
            onChange={(v) => updateSetting('duration', v, false)}
            onCommit={(v) => updateSetting('duration', v, true)}
            unit="s"
            max={10}
          />
        </div>
      </div>

      {/* Easing Dropdown */}
      <div className="flex items-center justify-between">
        <span className="text-[0.82vw] font-medium text-gray-800 leading-none">Easing Effects :</span>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowEasingSelector(!showEasingSelector); setShowRepeatSelector(false); }}
            className="flex items-center justify-between px-[0.7vw] h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] shadow-2xs hover:border-gray-400 focus:border-[#EC5137] transition-all group w-[8.8vw]"
          >
            <span className="text-[0.8vw] font-medium text-gray-700 truncate">{settings.easing}</span>
            <ChevronDown size="0.85vw" className={`text-gray-400 transition-transform duration-200 ${showEasingSelector ? 'rotate-180' : ''}`} />
          </button>
          {showEasingSelector && (
            <div className="absolute bottom-full left-0 w-full mb-[0.3vw] bg-white border border-gray-100 rounded-[0.5vw] shadow-2xl z-30 py-[0.25vw] max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
              {EASING_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSetting('easing', opt);
                    setShowEasingSelector(false);

                    // Defer preview slightly so DOM updates and React re-renders complete cleanly
                    setTimeout(() => {
                      const targetEls = elements || (primaryElement ? [primaryElement] : []);
                      targetEls.forEach(target => {
                        const targetId = target?.id || target?.getAttribute?.('data-name');
                        const safeId = (window.CSS && CSS.escape) ? CSS.escape(targetId || '') : (targetId || '');
                        const liveEl = (targetId && (document.querySelector(`.page-svg-container [id="${safeId}"]`) || document.querySelector(`.page-svg-container [data-name="${safeId}"]`))) ||
                          (targetId && document.getElementById(targetId)) ||
                          target;

                        if (!liveEl) return;
                        const t = liveEl.getAttribute('data-animation-trigger') || trigger || 'While Opening';
                        const p = t === 'While Opening' ? 'open' : 'interact';
                        const animType = (settings.type && settings.type !== 'none')
                          ? settings.type
                          : liveEl.getAttribute(`data-animation-${p}-type`) || 'slide-right';

                        if (typeof previewAnimation === 'function') {
                          previewAnimation(null, animType, {
                            ...settings,
                            easing: opt,
                            delay: 0 // Immediate playback so user sees the easing curve without waiting through delays
                          }, liveEl, elements ? true : false);
                        }
                      });
                    }, 120);
                  }}
                  className={`w-full text-left px-[0.8vw] py-[0.45vw] text-[0.8vw] font-medium transition-colors ${settings.easing === opt ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Repeat Dropdown */}
      {trigger === 'On Page' && action !== 'Always' && (
        <div className="flex items-center justify-between">
          <span className="text-[0.82vw] font-medium text-gray-800 leading-none">Repeat :</span>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowRepeatSelector(!showRepeatSelector); setShowEasingSelector(false); }}
              className="flex items-center justify-between px-[0.7vw] h-[2vw] bg-white border border-gray-300 rounded-[0.4vw] shadow-2xs hover:border-gray-400 focus:border-[#EC5137] transition-all group w-[8.8vw]"
            >
              <span className="text-[0.8vw] font-medium text-gray-700 truncate">
                {['None', 'Once', 'Twice', 'Thrice', 'Infinite'].includes(settings.repeat || 'None') ? (settings.repeat || 'None') : `${settings.repeat} times`}
              </span>
              <ChevronDown size="0.85vw" className={`text-gray-400 transition-transform duration-200 ${showRepeatSelector ? 'rotate-180' : ''}`} />
            </button>
            {showRepeatSelector && (
              <div className="absolute bottom-full left-0 w-full mb-[0.3vw] bg-white border border-gray-100 rounded-[0.5vw] shadow-2xl z-30 py-[0.25vw] max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
                {['None', 'Once', 'Twice', 'Thrice', 'Infinite'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => { updateSetting('repeat', opt); setShowRepeatSelector(false); }}
                    className={`w-full text-left px-[0.8vw] py-[0.45vw] text-[0.8vw] font-medium transition-colors ${settings.repeat === opt ? 'text-[#EC5137] bg-gray-50 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {opt}
                  </button>
                ))}
                <div className="px-[0.8vw] py-[0.4vw] flex items-center justify-center gap-[0.4vw] border-t border-gray-100 mt-[0.2vw]" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    min="1"
                    placeholder="Custom"
                    className="w-[3.5vw] h-[1.8vw] border border-gray-200 rounded-[0.3vw] px-[0.4vw] text-[0.75vw] text-center text-gray-700 outline-none focus:border-[#EC5137] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={!['None', 'Once', 'Twice', 'Thrice', 'Infinite'].includes(settings.repeat || 'None') ? (settings.repeat || '') : ''}
                    onChange={(e) => updateSetting('repeat', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setShowRepeatSelector(false); }}
                  />
                  <span className="text-[0.75vw] text-gray-500 font-medium">times</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col pt-[0.2vw] mt-[0.6vw] border-t border-gray-100 gap-[0.4vw]">
        <div className="flex items-center justify-between pt-[0.2vw]">
          <label className="flex items-center gap-[0.6vw] cursor-pointer group select-none">
            <div className={`w-[1.1vw] h-[1.1vw] rounded-[0.3vw] flex items-center justify-center transition-all ${settings.everyVisit ? 'bg-[#EC5137]' : 'border border-gray-300 bg-white hover:border-gray-400'}`}>
              {settings.everyVisit && <Icon icon="lucide:check" width="0.75vw" height="0.75vw" className="text-white stroke-[3]" />}
            </div>
            <input type="checkbox" className="hidden" checked={settings.everyVisit} onChange={() => updateSetting('everyVisit', !settings.everyVisit)} />
            <span className="text-[0.8vw] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Animate in Every Visit</span>
          </label>
          <button
            onClick={handleDelete}
            className="w-[1.9vw] h-[1.9vw] flex items-center justify-center bg-white border border-gray-300 rounded-[0.4vw] text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-2xs"
            title="Delete Animation"
          >
            <Icon icon="lucide:trash-2" width="0.95vw" height="0.95vw" />
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             MAIN COMPONENT                                 */
/* -------------------------------------------------------------------------- */

const AnimationPanel = ({ selectedElement, selectedLayerId, setSelectedLayerId, onUpdate }) => {
  const [animatableElements, setAnimatableElements] = React.useState([]);
  const [expandedElementId, setExpandedElementId] = React.useState(null);
  const lastSelectedIdRef = React.useRef(null);
  const [editingNameId, setEditingNameId] = React.useState(null);
  const [tempName, setTempName] = React.useState('');

  const scrollContainerRef = React.useRef(null);
  const itemRefs = React.useRef({});

  const [showGallery, setShowGallery] = React.useState(false);
  const [tempSelectedAnim, setTempSelectedAnim] = React.useState(null);
  const [editingElement, setEditingElement] = React.useState(null);
  const [galleryCallback, setGalleryCallback] = React.useState(null);
  const [galleryKind, setGalleryKind] = React.useState('animation'); // 'animation' | 'text'

  const [forceIncludeIds, setForceIncludeIds] = React.useState(new Set());
  const previewCleanupRef = React.useRef([]);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [previewMaxTime, setPreviewMaxTime] = React.useState(0);
  const [previewKey, setPreviewKey] = React.useState(0);

  /* ---------------------------- TEXT EFFECT PREVIEW ---------------------------- */
  // The runner splits text into letter spans inside the live canvas, so every preview
  // is torn down (destroy() restores the original markup) when it ends.
  const textPreviewRef = React.useRef(null);

  const stopTextPreview = React.useCallback(() => {
    const s = textPreviewRef.current;
    if (!s) return;
    textPreviewRef.current = null;
    clearTimeout(s.timer);
    try { s.handle?.destroy(); } catch { }
    s.restore.forEach(fn => { try { fn(); } catch { } });
  }, []);

  // override: optional attribute map applied only while previewing (e.g. gallery hover/click)
  // returns preview length in seconds (0 when nothing to play)
  const previewTextEffects = React.useCallback((targets, override = null) => {
    stopTextPreview();
    const list = (targets || []).filter(Boolean).map(resolveLiveElement);
    if (!list.length) return 0;

    // Cancel any active WAAPI animation on the targets to prevent duplicate animation collisions
    list.forEach(el => {
      if (el.__currentAnimation) {
        try { el.__currentAnimation.cancel(); } catch { }
        el.__currentAnimation = null;
      }
    });

    const restore = [];
    let maxMs = 0;

    list.forEach(el => {
      if (override) {
        const prev = {};
        Object.keys(override).forEach(attr => { prev[attr] = el.getAttribute(attr); el.setAttribute(attr, override[attr]); });
        restore.push(() => Object.keys(prev).forEach(attr => (prev[attr] === null ? el.removeAttribute(attr) : el.setAttribute(attr, prev[attr]))));
      }
      if (!el.getAttribute('data-text-effect')) return;
      const fx = readTextFx(el);
      const chars = (el.textContent || '').replace(/\s+/g, '').length;
      const ms = (fx.speed * 4 + chars * fx.step + 1.5) * 1000;
      if (ms > maxMs) maxMs = ms;
    });

    if (!maxMs) { restore.forEach(fn => fn()); return 0; }
    maxMs = Math.min(Math.max(maxMs, 3000), 12000);

    let handle = null;
    try { handle = initTextEffectsRunner(document); } catch (err) { console.error('Text effect preview error:', err); }
    textPreviewRef.current = { handle, restore, timer: setTimeout(stopTextPreview, maxMs) };
    return maxMs / 1000;
  }, [stopTextPreview]);

  // Never leave a half-previewed gallery value on the element once the gallery closes
  React.useEffect(() => {
    if (!showGallery) stopTextPreview();
  }, [showGallery, stopTextPreview]);

  // Stop and cancel all active WAAPI animations when the Animation panel is closed / unmounted
  React.useEffect(() => {
    return () => {
      stopTextPreview();
      // 1. Run all registered preview cleanup functions
      if (previewCleanupRef.current && previewCleanupRef.current.length > 0) {
        previewCleanupRef.current.forEach(cancel => {
          try { cancel(); } catch { }
        });
        previewCleanupRef.current = [];
      }
      // 2. Also cancel any other active WAAPI animations inside the page SVG containers 
      //    to ensure the canvas is completely clean when leaving the Animation tab.
      document.querySelectorAll('.page-svg-container *').forEach(el => {
        try {
          const anims = el.getAnimations?.() || [];
          anims.forEach(anim => {
            try { anim.cancel(); } catch { }
          });
          el.removeAttribute('data-is-animating');
          if (el.__currentAnimation) el.__currentAnimation = null;
          if (el.__shadowAnimation) el.__shadowAnimation = null;
        } catch { }
      });
    };
  }, [stopTextPreview]);


  React.useEffect(() => {
    // Robust discovery of the SVG root for the active page
    let activePage = document.querySelector('.active-page-outline');
    let svgRoot = selectedElement?.closest ? selectedElement.closest('svg') : null;

    if (!svgRoot) {
      if (activePage) svgRoot = activePage.querySelector('svg');
      if (!svgRoot) svgRoot = document.querySelector('.flipbook-page-active svg') || document.querySelector('.page-svg-container svg') || document.querySelector('svg');
    }

    if (!svgRoot) return;

    const els = Array.from(svgRoot.querySelectorAll('[data-name], [id]')).filter(el => {
      const tag = el.tagName?.toLowerCase();
      return !['svg', 'defs', 'clippath', 'pattern', 'lineargradient', 'radialgradient', 'filter', 'style', 'script'].includes(tag);
    });

    const visibleEls = els.filter(el => !el.closest('defs') && !el.closest('clipPath'));

    let relevantEls = visibleEls.filter(el => {
      const id = el.id || el.getAttribute('data-name');
      const hasAnim = el.getAttribute('data-animation-open-type') && el.getAttribute('data-animation-open-type') !== 'none';
      const hasIntent = el.getAttribute('data-animation-intent') === 'true';
      const isForced = id && forceIncludeIds.has(id);
      const hasTextFx = el.hasAttribute('data-text-effect') && el.getAttribute('data-text-effect') !== 'none' && el.getAttribute('data-text-effect') !== '';
      return hasAnim || hasIntent || isForced || hasTextFx;
    });

    if (selectedElement) {
      const id = selectedElement.id || selectedElement.getAttribute('data-name');
      const hasAnim = selectedElement.getAttribute('data-animation-open-type') && selectedElement.getAttribute('data-animation-open-type') !== 'none';
      const hasIntent = selectedElement.getAttribute('data-animation-intent') === 'true';
      const isForced = id && forceIncludeIds.has(id);
      const hasTextFx = selectedElement.hasAttribute('data-text-effect') && selectedElement.getAttribute('data-text-effect') !== 'none' && selectedElement.getAttribute('data-text-effect') !== '';

      if (hasAnim || hasIntent || isForced || hasTextFx) {
        const isAlreadyInList = relevantEls.some(el => el === selectedElement || (id && (el.id === id || el.getAttribute('data-name') === id)));
        if (!isAlreadyInList) {
          relevantEls = [selectedElement, ...relevantEls];
        }
      }
    }

    const uniqueEls = [];
    const seenIds = new Set();
    relevantEls.forEach(el => {
      const id = el.id || el.getAttribute('data-name');
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        uniqueEls.push(el);
      } else if (!id && !uniqueEls.includes(el)) {
        uniqueEls.push(el);
      }
    });
    setAnimatableElements(uniqueEls);

    const activeEl = selectedElement || (selectedLayerId ? (document.getElementById(selectedLayerId) || document.querySelector(`[data-name="${selectedLayerId}"]`)) : null);
    if (activeEl) {
      const id = activeEl.id || activeEl.getAttribute('data-name');
      if (id && id !== lastSelectedIdRef.current) {
        lastSelectedIdRef.current = id;
        const group = activeEl.getAttribute('data-animation-group');
        const targetId = group || id;
        if (expandedElementId !== targetId) {
          setExpandedElementId(targetId);
        }
      }
    } else {
      lastSelectedIdRef.current = null;
      setExpandedElementId(null);
    }
  }, [selectedElement, selectedLayerId, forceIncludeIds]);

  // Clear expanded item when unselected on canvas
  React.useEffect(() => {
    if (!selectedElement && !selectedLayerId) {
      lastSelectedIdRef.current = null;
      setExpandedElementId(null);
    }
  }, [selectedElement, selectedLayerId]);

  // Force re-render when DOM attributes change (sync with Canvas Tooltip)
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!selectedElement) return;
    const observer = new MutationObserver(() => setTick(t => t + 1));
    observer.observe(selectedElement, { attributes: true });
    return () => observer.disconnect();
  }, [selectedElement]);

  // Handle auto-scroll to center when an item is expanded
  React.useEffect(() => {
    if (expandedElementId && itemRefs.current[expandedElementId] && scrollContainerRef.current) {
      const element = itemRefs.current[expandedElementId];

      // Use setTimeout to allow the element's height to expand before calculating
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [expandedElementId]);

  const previewAnimation = React.useCallback((e, type, settings, elementToAnimate, isGlobal = false) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!elementToAnimate) return;

    // Stop any active text effect preview so effects don't collide or duplicate
    stopTextPreview();

    let target = elementToAnimate;
    const targetId = target?.id || target?.getAttribute?.('data-name');
    if (targetId) {
      const activePage = document.querySelector('.active-page-outline') || document.querySelector('.page-svg-container');
      const safeId = (window.CSS && CSS.escape) ? CSS.escape(targetId) : targetId;
      const fresh = (activePage && (activePage.querySelector(`[id="${safeId}"]`) || activePage.querySelector(`[data-name="${safeId}"]`))) ||
        document.getElementById(targetId);
      if (fresh) target = fresh;
    }

    if (!isGlobal && previewCleanupRef.current && previewCleanupRef.current.length > 0) {
      previewCleanupRef.current.forEach(cancel => cancel());
      previewCleanupRef.current = [];
    }

    const keyframes = WAAPI_ANIMATIONS[type];
    if (!type || !keyframes || keyframes.length === 0) return;

    // Helper: Map Easing
    const getWaapiEase = (name) => {
      const map = {
        'Linear': 'linear',
        'Smooth': 'ease-in-out',
        'Ease In': 'ease-in',
        'Ease Out': 'ease-out',
        'Ease In & Out': 'ease-in-out',
        'Bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      };
      return map[name] || 'linear';
    };

    const duration = (parseFloat(settings?.duration || 1)) * 1000;
    const delay = (parseFloat(settings?.delay || 0)) * 1000;
    const easing = getWaapiEase(settings?.easing || 'Linear');
    let cx = 0, cy = 0;
    let useMathOrigin = false;
    let cachedBBox = { x: 0, y: 0, width: 0, height: 0 };
    const isSVG = target.namespaceURI === 'http://www.w3.org/2000/svg' || target.ownerSVGElement !== undefined;
    if (isSVG) {
      try {
        cachedBBox = target.getBBox();
        cx = cachedBBox.x + cachedBBox.width / 2;
        cy = cachedBBox.y + cachedBBox.height / 2;
        useMathOrigin = true;
        target.style.transformOrigin = '0 0';
      } catch {
        target.style.transformBox = 'fill-box';
        target.style.transformOrigin = 'center';
      }
    }

    try {
      // Cancel previous on this specific target
      if (target.__currentAnimation) {
        try { target.__currentAnimation.cancel(); } catch { }
      }

      if (target.__originalTransform === undefined) {
        let baseTransform = window.getComputedStyle(target).transform;
        if (!baseTransform || baseTransform === 'none') {
          const transformAttr = target.getAttribute('transform');
          if (transformAttr) {
            try {
              const dummy = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              dummy.setAttribute('transform', transformAttr);
              if (dummy.transform.baseVal) {
                dummy.transform.baseVal.consolidate();
                if (dummy.transform.baseVal.numberOfItems > 0) {
                  const m = dummy.transform.baseVal.getItem(0).matrix;
                  baseTransform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.e}, ${m.f})`;
                }
              }
            } catch { }
            if (!baseTransform || baseTransform === 'none') {
              baseTransform = transformAttr;
            }
          }
        }
        target.__originalTransform = (!baseTransform || baseTransform === 'none') ? '' : baseTransform;
      }

      const baseTransform = target.__originalTransform;

      const finalKeyframes = keyframes.map(kf => {
        const newKf = { ...kf };

        let transformParts = [];
        if (newKf.translate) {
          transformParts.push(`translate(${String(newKf.translate).split(' ').join(',')})`);
          delete newKf.translate;
        }
        if (newKf.rotate) {
          const r = String(newKf.rotate).trim();
          transformParts.push(`rotate(${r === '0' ? '0deg' : r})`);
          delete newKf.rotate;
        }
        if (newKf.scale !== undefined) {
          transformParts.push(`scale(${String(newKf.scale).split(' ').join(',')})`);
          delete newKf.scale;
        }
        if (newKf.skew) {
          const parts = String(newKf.skew).split(',').map(p => p.trim() === '0' ? '0deg' : p.trim());
          transformParts.push(`skew(${parts.join(',')})`);
          delete newKf.skew;
        }

        let combinedKfTransform = newKf.transform || '';
        if (transformParts.length > 0) {
          combinedKfTransform = `${combinedKfTransform} ${transformParts.join(' ')}`.trim();
        }

        if (baseTransform || useMathOrigin) {
          if (combinedKfTransform) {
            if (useMathOrigin) {
              let px = cx;
              let py = cy;
              if (newKf.transformOrigin) {
                const origin = newKf.transformOrigin;
                if (origin.includes('left')) px = cachedBBox.x;
                if (origin.includes('right')) px = cachedBBox.x + cachedBBox.width;
                if (origin.includes('top')) py = cachedBBox.y;
                if (origin.includes('bottom')) py = cachedBBox.y + cachedBBox.height;
                delete newKf.transformOrigin;
              }
              newKf.transform = `${baseTransform} translate(${px}px, ${py}px) ${combinedKfTransform} translate(-${px}px, -${py}px)`;
            } else {
              newKf.transform = `${baseTransform} ${combinedKfTransform}`;
            }
          } else {
            newKf.transform = baseTransform;
          }
        } else if (combinedKfTransform) {
          newKf.transform = combinedKfTransform;
        }

        return newKf;
      });

      // Force preview to play exactly once, ignoring repeat/loop settings
      let iterations = 1;

      target.setAttribute('data-is-animating', 'true');
      const anim = target.animate(finalKeyframes, {
        duration,
        delay,
        easing,
        fill: 'none',
        iterations
      });

      const cleanup = () => {
        target.removeAttribute('data-is-animating');
        try { anim.cancel(); } catch { }
        target.style.translate = '';
        target.style.scale = '';
        target.style.rotate = '';
        target.style.opacity = '';
        target.style.transform = '';
        target.style.filter = '';
        target.style.transformBox = '';
        target.style.transformOrigin = '';
        if (target.__currentAnimation === anim) target.__currentAnimation = null;
      };
      anim.onfinish = cleanup;
      anim.oncancel = cleanup;

      target.__currentAnimation = anim;
      previewCleanupRef.current.push(cleanup);

      let previewTime;
      if (iterations === Infinity) {
        previewTime = Math.max(duration + delay + 500, 3000); // Let it loop for a bit
      } else {
        previewTime = (duration * iterations) + delay + 500; // Hold for 500ms after all repeats
      }
      setTimeout(cleanup, previewTime);

    } catch (err) {
      console.error("Preview error:", err);
    }
  }, []);

  const handleDeleteAnimation = React.useCallback((targets) => {
    const ids = targets.map(t => t.id || t.getAttribute('data-name')).filter(Boolean);
    const groups = targets.map(t => t.getAttribute('data-animation-group')).filter(Boolean);

    setForceIncludeIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });

    setExpandedElementId(prev => {
      if (ids.includes(prev) || groups.includes(prev)) {
        return null;
      }
      return prev;
    });
  }, []);

  const handleOpenGallery = (el, callback, kind = 'animation') => {
    setEditingElement(el);
    setGalleryKind(kind);
    if (kind === 'text') {
      setTempSelectedAnim(el.getAttribute('data-text-effect') || 'none');
    } else {
      const trigger = el.getAttribute('data-animation-trigger') || 'While Opening';
      const prefix = trigger === 'While Opening' ? 'open' : 'interact';
      setTempSelectedAnim(el.getAttribute(`data-animation-${prefix}-type`) || 'none');
    }
    setGalleryCallback(() => callback);
    setShowGallery(true);
  };

  React.useEffect(() => {
    const handleForceAdd = (e) => {
      const id = e.detail;
      setForceIncludeIds(prev => new Set(prev).add(id));
      setExpandedElementId(id);

      const addEl = () => {
        const el = document.getElementById(id) || document.querySelector(`[data-name="${id}"]`);
        if (el) {
          setAnimatableElements(prev => {
            const alreadyIn = prev.some(existing => (existing.id === id || existing.getAttribute('data-name') === id));
            if (alreadyIn) return prev;
            return [el, ...prev];
          });

          // Play live animation preview on element immediately!
          const type = el.getAttribute('data-animation-open-type') || 'fade-in';
          if (typeof previewAnimation === 'function') {
            previewAnimation(null, type, {
              duration: el.getAttribute('data-animation-open-duration') || '1',
              delay: el.getAttribute('data-animation-open-delay') || '0',
              speed: '1',
              easing: 'Linear'
            }, el);
          }
        }
      };
      addEl();
      requestAnimationFrame(addEl);
    };
    window.addEventListener('animation-force-add', handleForceAdd);
    return () => window.removeEventListener('animation-force-add', handleForceAdd);
  }, [onUpdate]);

  React.useEffect(() => {
    const handleAnimationRemoved = (e) => {
      const id = e.detail?.id;
      if (id) {
        setForceIncludeIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setExpandedElementId(prev => (prev === id ? null : prev));
      }
      setTick(t => t + 1);
    };
    window.addEventListener('animation-removed', handleAnimationRemoved);
    return () => window.removeEventListener('animation-removed', handleAnimationRemoved);
  }, []);

  const handleGlobalPreview = () => {
    if (previewCleanupRef.current.length > 0) {
      previewCleanupRef.current.forEach(cancel => cancel());
      previewCleanupRef.current = [];
    }

    let maxT = 0;
    animatableElements.forEach(el => {
      const trigger = el.getAttribute('data-animation-trigger') || 'While Opening';
      const prefix = trigger === 'While Opening' ? 'open' : 'interact';
      const type = el.getAttribute(`data-animation-${prefix}-type`);

      if (type && type !== 'none') {
        const duration = parseFloat(el.getAttribute(`data-animation-${prefix}-duration`)) || 1;
        const delay = parseFloat(el.getAttribute(`data-animation-${prefix}-delay`)) || 0;
        const speed = 1;
        const total = (duration / speed) + delay;
        if (total > maxT) maxT = total;

        const settings = {
          delay,
          duration,
          speed,
          easing: el.getAttribute(`data-animation-${prefix}-easing`) || 'Linear'
        };
        previewAnimation(null, type, settings, el, true);
      }
    });

    const textEls = animatableElements.filter(el => el.hasAttribute('data-text-effect'));
    if (textEls.length) {
      const t = previewTextEffects(textEls);
      if (t > maxT) maxT = t;
    } else {
      stopTextPreview();
    }

    if (maxT > 0) {
      setPreviewMaxTime(maxT);
      setIsPreviewing(true);
      setPreviewKey(prev => prev + 1);
    }
  };

  const isPageOrRootElement = (el, idStr) => {
    if (!el && !idStr) return true;
    const id = idStr || el?.id || '';
    const name = el?.getAttribute?.('data-name') || '';
    const dataType = el?.getAttribute?.('data-type') || '';
    if (dataType && ['icon', 'shape', 'button', 'text', 'image', 'video', 'audio', 'qrcode', 'table', 'table-frame', 'embed', 'embed-frame', 'map', 'slideshow', 'hotspot', 'decorator', 'group'].includes(dataType)) {
      return false;
    }
    if (dataType === 'frame') return true;
    if (el?.tagName?.toLowerCase() === 'svg') return true;
    if (/^(page|slide)\s*\d+/i.test(name) || name === 'Overlay') return true;
    if (/^(page|slide)-/i.test(id) || id === 'Overlay') return true;
    if (el?.parentElement?.tagName?.toLowerCase() === 'svg' && el?.tagName?.toLowerCase() === 'g') {
      return !dataType && !id.startsWith('icon-') && !id.startsWith('shape-') && !id.startsWith('text-') && !id.startsWith('image-');
    }
    return false;
  };

  const rawActiveSelectedEl = selectedElement || (() => {
    if (!selectedLayerId) return null;
    return document.getElementById(selectedLayerId) || document.querySelector(`[data-name="${selectedLayerId}"]`);
  })();

  const activeSelectedEl = isPageOrRootElement(rawActiveSelectedEl, selectedLayerId) ? null : rawActiveSelectedEl;

  const selectedElId = activeSelectedEl ? (activeSelectedEl.id || activeSelectedEl.getAttribute('data-name')) : null;
  const selectedElName = activeSelectedEl ? (activeSelectedEl.getAttribute('data-name') || activeSelectedEl.id) : null;
  const isSelectedElAnimated = activeSelectedEl ? (
    (activeSelectedEl.getAttribute('data-animation-open-type') && activeSelectedEl.getAttribute('data-animation-open-type') !== 'none') ||
    (activeSelectedEl.getAttribute('data-animation-interact-type') && activeSelectedEl.getAttribute('data-animation-interact-type') !== 'none') ||
    activeSelectedEl.getAttribute('data-animation-intent') === 'true' ||
    (activeSelectedEl.hasAttribute('data-text-effect') && activeSelectedEl.getAttribute('data-text-effect') !== 'none' && activeSelectedEl.getAttribute('data-text-effect') !== '') ||
    (selectedElId && forceIncludeIds.has(selectedElId))
  ) : false;

  const handleAddAnimationToSelected = (elToAdd = activeSelectedEl) => {
    if (!elToAdd) return;
    const targetId = elToAdd.id || elToAdd.getAttribute('data-name');
    if (!targetId) return;

    elToAdd.setAttribute('data-animation-open-type', 'fade-in');
    elToAdd.setAttribute('data-animation-open-duration', '1');
    elToAdd.setAttribute('data-animation-open-delay', '0');
    elToAdd.setAttribute('data-animation-open-easing', 'Linear');
    elToAdd.setAttribute('data-animation-trigger', 'While Opening');
    elToAdd.setAttribute('data-animation-intent', 'true');

    if (onUpdate) {
      onUpdate(targetId, 'data-animation-open-type', 'fade-in');
      onUpdate(targetId, 'data-animation-open-duration', 1);
      onUpdate(targetId, 'data-animation-open-delay', 0);
      onUpdate(targetId, 'data-animation-open-easing', 'Linear');
      onUpdate(targetId, 'data-animation-trigger', 'While Opening');
      onUpdate(targetId, 'data-animation-intent', 'true');
    }

    setForceIncludeIds(prev => new Set(prev).add(targetId));
    setExpandedElementId(targetId);
    lastSelectedIdRef.current = targetId;
    if (setSelectedLayerId) setSelectedLayerId(targetId);

    window.dispatchEvent(new CustomEvent('update-interaction-badge', {
      detail: { elementId: targetId, actionType: { id: 'fade-in', label: 'Fade In', icon: 'tdesign:animation-1' } }
    }));
  };

  return (
    <div className="relative flex flex-col w-full h-full min-h-0 overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0.25vw; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 0.5vw; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes anim-panel-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .custom-range-slider { -webkit-appearance: none; width: 100%; background: transparent; position: relative; }
        .custom-range-slider::before { content: ""; position: absolute; top: -0.75vw; bottom: -0.75vw; left: 0; right: 0; cursor: pointer; z-index: 1; }
        .custom-range-slider::-webkit-slider-runnable-track { height: 0.2vw; border-radius: 0.1vw; background: inherit; }
        .custom-range-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 1vw; width: 1vw; border-radius: 50%; background: #EC5137; border: 0.02vw solid #ffffff; box-shadow: 0 0.15vw 0.5vw rgba(236,81,55,0.4); margin-top: -0.4vw; cursor: pointer; transition: box-shadow 0.15s ease; position: relative; z-index: 2; }
        .custom-range-slider::-webkit-slider-thumb:hover { box-shadow: 0 0.15vw 0.75vw rgba(236,81,55,0.6); }
        .overlay-scrollbar {
          overflow-y: overlay !important;
        }
      `}</style>

      {/* Top Fixed Header Area */}
      <div className="flex-shrink-0 px-[1.5vw] pt-[1.5vw] flex flex-col">
        {/* Top Banner Button (STICKY AT TOP, NEVER SQUISHED) */}
        <div
          onClick={handleGlobalPreview}
          className="flex-shrink-0 min-h-[3.2vw] relative bg-gray-100 hover:bg-gray-200/80 p-[0.75vw] rounded-[0.6vw] flex items-center gap-[0.75vw] border border-gray-200 cursor-pointer mb-[1.2vw] transition-all overflow-hidden group shadow-2xs select-none"
        >
          {/* Progress Bar Overlay */}
          {isPreviewing && (
            <div
              key={previewKey}
              className="absolute inset-y-0 left-0 bg-white pointer-events-none z-0"
              style={{ animation: `anim-panel-progress ${previewMaxTime}s linear forwards` }}
              onAnimationEnd={() => setIsPreviewing(false)}
            />
          )}

          <div className="relative z-10 px-[0.2vw] flex-shrink-0">
            <Icon icon="tdesign:animation-1" width="1.4vw" height="1.4vw" className="text-yellow-400 fill-yellow-400" />
          </div>
          <span className="relative z-10 text-[0.75vw] text-gray-500 leading-tight">
            Click to preview<br />
            <span className="font-semibold text-gray-900 text-[0.82vw]">Animations</span>
          </span>
        </div>

        {/* Selected Element Animation Status Card (ONLY if selected AND not added yet) */}
        {activeSelectedEl && !isSelectedElAnimated && (
          <div className="flex-shrink-0 p-[0.65vw] rounded-[0.6vw] border border-[#EC5137]/25 bg-gradient-to-r from-[#EC5137]/[0.06] via-white to-white hover:border-[#EC5137]/45 shadow-2xs mb-[1.2vw] flex items-center justify-between gap-[0.8vw] transition-all">
            <div className="flex items-center gap-[0.65vw] min-w-0 flex-1">
              <div className="w-[2.2vw] h-[2.2vw] rounded-[0.45vw] flex items-center justify-center flex-shrink-0 bg-[#EC5137]/10 text-[#EC5137] border border-[#EC5137]/15">
                <Icon icon="tdesign:animation-1" width="1.15vw" height="1.15vw" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[0.82vw] font-semibold text-gray-900 truncate leading-tight" title={selectedElName}>
                  {selectedElName}
                </span>
                <span className="text-[0.68vw] text-gray-500 font-medium whitespace-nowrap flex items-center gap-[0.3vw] mt-[0.15vh]">
                  <span className="w-[0.35vw] h-[0.35vw] rounded-full bg-amber-400 flex-shrink-0" />
                  No animation added
                </span>
              </div>
            </div>

            <button
              onClick={() => handleAddAnimationToSelected(activeSelectedEl)}
              className="flex-shrink-0 h-[1.85vw] px-[0.85vw] bg-[#EC5137] hover:bg-[#d6442c] text-white rounded-[0.4vw] text-[0.74vw] font-medium flex items-center gap-[0.3vw] shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Icon icon="lucide:plus" width="0.85vw" height="0.85vw" />
              <span>Add Animation</span>
            </button>
          </div>
        )}

        <div className="flex-shrink-0 flex items-center gap-[0.8vw] mb-[1.2vh]">
          <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">Animations in this Page</span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>
      </div>

      {/* Scrollable Accordions List (cards bottom of Animations in this Page text) */}
      <div
        className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar"
      >
        <div
          ref={scrollContainerRef}
          className="flex flex-col gap-[0.7vh] pb-[4vw] pt-[0.2vw] px-[1.5vw]"
        >
        {(() => {
          const groups = {};
          const items = [];

          animatableElements.forEach(el => {
            const g = el.getAttribute('data-animation-group');
            if (g) {
              if (!groups[g]) groups[g] = [];
              groups[g].push(el);
            } else {
              items.push({ type: 'single', element: el });
            }
          });

          // Add groups to items
          Object.entries(groups).forEach(([name, elements]) => {
            items.push({ type: 'group', name, elements });
          });

          return items.map((item, idx) => {
            const isGroup = item.type === 'group';
            const el = isGroup ? item.elements[0] : item.element;
            const id = isGroup ? item.name : (el.id || el.getAttribute('data-name'));
            const name = isGroup ? item.name : (el.getAttribute('data-name') || el.id);
            const hasSelection = Boolean(selectedElement || selectedLayerId);
            const isExpanded = hasSelection && expandedElementId === id;
            const isSelected = hasSelection && (
              isGroup
                ? item.elements.some(e => e === selectedElement || e.id === selectedElement?.id || (selectedLayerId && e.id === selectedLayerId))
                : (el === selectedElement || el.id === selectedElement?.id || (selectedLayerId && el.id === selectedLayerId))
            );

            return (
              <div
                key={id || idx}
                ref={el => itemRefs.current[id] = el}
                className={`w-full mx-auto bg-white border-[0.15vw] rounded-[0.6vw] shadow-2xs flex flex-col relative transition-all duration-200 overflow-hidden ${
                  isExpanded || isSelected
                    ? 'border-[#EC5137] shadow-sm z-[50]'
                    : 'border-gray-200 hover:border-gray-300 z-[10]'
                }`}
              >
                <div
                  className="flex items-center justify-between gap-[0.8vw] py-[0.7vw] px-[0.8vw] cursor-pointer select-none rounded-t-[0.6vw]"
                  onClick={() => {
                    const nextId = isExpanded ? null : id;
                    setExpandedElementId(nextId);
                    lastSelectedIdRef.current = nextId;
                    if (nextId) {
                      if (setSelectedLayerId) setSelectedLayerId(nextId);
                      const targetIds = isGroup ? item.elements.map(e => e.id || e.getAttribute('data-name')) : [el.id || el.getAttribute('data-name')];
                      window.dispatchEvent(new CustomEvent('select-layer', { detail: { ids: targetIds, layerId: nextId } }));
                    }
                  }}
                >
                  <div className="flex items-center gap-[0.8vw] flex-1 min-w-0">
                    {/* Star / Animation Icon */}
                    <div className="flex-shrink-0 text-[#EC5137] flex items-center" style={{ stroke: 'currentColor', strokeWidth: '0.35px' }}>
                      <Icon icon="tdesign:animation-1" className="text-[1.15vw]" width="1.15vw" height="1.15vw" />
                    </div>

                    {/* Name Container */}
                    <div className="h-[2vw] flex items-center justify-start gap-[0.4vw] px-[0.7vw] relative select-none">
                      {editingNameId === id ? (
                        <input
                          className="text-[0.8vw] text-gray-700 font-semibold font-sans bg-gray-50 border-b border-[#EC5137] outline-none w-full px-[0.2vw]"
                          value={tempName}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const newVal = e.target.value;
                            setTempName(newVal);
                            if (newVal.trim() && !isGroup) {
                              onUpdate(id, 'data-name', newVal);
                              setTick(t => t + 1);
                            }
                          }}
                          onBlur={() => {
                            setEditingNameId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.target.blur();
                            if (e.key === 'Escape') {
                              if (!isGroup) onUpdate(id, 'data-name', name);
                              setEditingNameId(null);
                            }
                          }}
                        />
                      ) : (
                        <span
                          className="text-[0.8vw] text-gray-700 font-semibold font-sans select-none flex-shrink-0 truncate max-w-[14vw] cursor-pointer hover:text-[#EC5137] transition-colors"
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (!isGroup) {
                              setEditingNameId(id);
                              setTempName(name);
                            }
                          }}
                        >
                          {name}
                        </span>
                      )}
                      {isGroup && (
                        <span className="text-[0.65vw] bg-gray-100 text-gray-500 px-[0.4vw] py-[0.1vw] rounded-full font-semibold ml-[0.2vw]">
                          {item.elements.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-[0.5vw]">
                    {isExpanded && (
                      <div className="flex-shrink-0 text-gray-400 hover:text-[#EC5137] transition-colors p-[0.2vw]">
                        <Icon
                          icon="lucide:rotate-cw"
                          width="0.85vw"
                          height="0.85vw"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isGroup) {
                              if (previewCleanupRef.current.length > 0) {
                                previewCleanupRef.current.forEach(cancel => cancel());
                                previewCleanupRef.current = [];
                              }
                              item.elements.forEach(target => {
                                const t = target.getAttribute('data-animation-trigger') || 'While Opening';
                                const p = t === 'While Opening' ? 'open' : 'interact';
                                previewAnimation(e, target.getAttribute(`data-animation-${p}-type`), { delay: parseFloat(target.getAttribute(`data-animation-${p}-delay`)) || 0, duration: parseFloat(target.getAttribute(`data-animation-${p}-duration`)) || 1, easing: target.getAttribute(`data-animation-${p}-easing`) || 'Linear', repeat: target.getAttribute(`data-animation-${p}-repeat`) || 'None' }, target, true);
                              });
                            } else {
                              const t = el.getAttribute('data-animation-trigger') || 'While Opening';
                              const p = t === 'While Opening' ? 'open' : 'interact';
                              previewAnimation(e, el.getAttribute(`data-animation-${p}-type`), { delay: parseFloat(el.getAttribute(`data-animation-${p}-delay`)) || 0, duration: parseFloat(el.getAttribute(`data-animation-${p}-duration`)) || 1, easing: el.getAttribute(`data-animation-${p}-easing`) || 'Linear', repeat: el.getAttribute(`data-animation-${p}-repeat`) || 'None' }, el);
                            }
                            const fxTargets = (isGroup ? item.elements : [el]).filter(t => t.hasAttribute('data-text-effect'));
                            if (fxTargets.length) previewTextEffects(fxTargets);
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors p-[0.2vw]">
                      <ChevronDown
                        size="0.85vw"
                        className={`transition-transform duration-200 ${!isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="bg-white rounded-b-[0.6vw] overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-full border-t border-gray-100"></div>
                      <div className="px-[0.8vw] pt-[0.8vw] pb-[0.8vw]">
                        <SingleAnimationEditor
                          element={isGroup ? null : el}
                          elements={isGroup ? item.elements : null}
                          onUpdate={onUpdate}
                          onDelete={handleDeleteAnimation}
                          onOpenGallery={(target, cb, kind) => {
                            if (isGroup && kind !== 'text') {
                              handleOpenGallery(target, (newType) => {
                                // 1. Close gallery immediately for better UX
                                setShowGallery(false);

                                // 2. Immediate DOM update for all (and remove duplicate text effects if any)
                                item.elements.forEach(member => {
                                  const t = member.getAttribute('data-animation-trigger') || 'While Opening';
                                  const p = t === 'While Opening' ? 'open' : 'interact';
                                  member.setAttribute(`data-animation-${p}-type`, newType);
                                  member.removeAttribute('data-text-effect');
                                  ['speed', 'step', 'color'].forEach(k => member.removeAttribute(TEXT_FX_ATTR_MAP[k]));
                                });

                                // 3. Staggered state updates to prevent UI hang
                                item.elements.forEach((member, i) => {
                                  const t = member.getAttribute('data-animation-trigger') || 'While Opening';
                                  const p = t === 'While Opening' ? 'open' : 'interact';
                                  if (onUpdate) {
                                    setTimeout(() => {
                                      const mid = member.id || member.getAttribute('data-name');
                                      onUpdate(mid, `data-animation-${p}-type`, newType);
                                      onUpdate(mid, 'data-text-effect', null);
                                    }, i * 30);
                                  }
                                });

                                // 4. Update the editor UI state
                                cb(newType);

                                // 5. Play preview for the whole group
                                setTimeout(() => {
                                  item.elements.forEach(member => {
                                    const t = member.getAttribute('data-animation-trigger') || 'While Opening';
                                    const p = t === 'While Opening' ? 'open' : 'interact';
                                    previewAnimation(null, newType, {
                                      delay: parseFloat(member.getAttribute(`data-animation-${p}-delay`)) || 0,
                                      duration: parseFloat(member.getAttribute(`data-animation-${p}-duration`)) || 1,
                                      easing: member.getAttribute(`data-animation-${p}-easing`) || 'Linear',
                                      repeat: member.getAttribute(`data-animation-${p}-repeat`) || 'None'
                                    }, member, true);
                                  });
                                }, 200);
                              });
                            } else {
                              handleOpenGallery(target, cb, kind);
                            }
                          }}
                          previewAnimation={previewAnimation}
                          previewTextEffects={previewTextEffects}
                          ANIMATION_GALLERY_ITEMS={ANIMATION_GALLERY_ITEMS}
                          EASING_OPTIONS={EASING_OPTIONS}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          });
        })()}

        </div>
      </div>

      {/* Animation Gallery Modal */}
      {showGallery && (
        <>
          <div
            className="fixed inset-0 z-[40]"
            onClick={(e) => { e.stopPropagation(); setShowGallery(false); }}
          />
          <div className="anim-panel-gallery-modal fixed z-[50] bg-white rounded-[0.8vw] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ width: '20vw', height: '32vw', top: '55%', left: '80%', transform: 'translate(-50%, -50%)' }}>
            <div className="anim-panel-gallery-header flex items-center gap-[1vw] px-[1vw] py-[1vw] border-b border-gray-100 shadow-[0_4px_6px_1px_rgba(0,0,0,0.10)]">
              <h2 className="text-[1vw] font-semibold text-gray-900">{galleryKind === 'text' ? 'Text Effect Gallery' : 'Animation Gallery'}</h2>
              <div className="h-[0.1vw] flex-1 bg-gray-200 opacity-50"></div>
              <button onClick={() => setShowGallery(false)} className="anim-panel-close-btn w-[1.5vw] h-[1.5vw] flex items-center justify-center rounded-lg border border-red-500 hover:bg-red-50 transition-colors">
                <X size="1vw" className="text-red-500" strokeWidth={2} />
              </button>
            </div>

            <div className="anim-panel-gallery-content flex-1 px-[1vw] py-[1vw] overflow-y-auto custom-scrollbar">
              <div className="anim-panel-gallery-grid grid grid-cols-4 gap-x-[0.5vw] gap-y-[0.5vw]">
                {(galleryKind === 'text' ? TEXT_EFFECT_GALLERY_ITEMS : ANIMATION_GALLERY_ITEMS).map((anim, idx) => (
                  <React.Fragment key={anim.id}>
                  {anim.sectionTitle && galleryKind !== 'text' && (
                    <div className="col-span-4 text-[0.75vw] font-semibold text-gray-900 mt-[0.6vw]">{anim.sectionTitle}</div>
                  )}
                  <div className="anim-panel-gallery-item group cursor-pointer flex flex-col items-center" onClick={(e) => {
                    setTempSelectedAnim(anim.id);
                    if (galleryKind === 'text') {
                      if (anim.id === 'none') stopTextPreview();
                      else previewTextEffects([editingElement], { 'data-text-effect': anim.id });
                      return;
                    }
                    const t = editingElement?.getAttribute('data-animation-trigger') || 'While Opening';
                    const p = t === 'While Opening' ? 'open' : 'interact';
                    previewAnimation(e, anim.id, {
                      delay: parseFloat(editingElement?.getAttribute(`data-animation-${p}-delay`)) || 0,
                      duration: parseFloat(editingElement?.getAttribute(`data-animation-${p}-duration`)) || 1,
                      easing: editingElement?.getAttribute(`data-animation-${p}-easing`) || 'Linear',
                      repeat: editingElement?.getAttribute(`data-animation-${p}-repeat`) || 'None'
                    }, editingElement);
                  }}>
                    <div className={`anim-panel-item-card aspect-square w-full rounded-[0.2vw] border flex flex-col items-center justify-center transition-all bg-white shadow-sm overflow-hidden ${tempSelectedAnim === anim.id ? 'border-gray-700 border-[0.1vw]' : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      <div className="anim-panel-item-icon flex-1 flex items-center justify-center p-[0.25vw]">
                        {galleryKind === 'text' && anim.id !== 'none' ? (
                          <span className="text-[1.3vw] font-semibold text-gray-600 leading-none">Aa</span>
                        ) : anim.icon === 'None' ? (
                          <Icon icon="radix-icons:shadow-none" width="2.2vw" height="2.2vw" className="text-gray-500" />
                        ) : anim.icon === 'Circle' ? (
                          <motion.div
                            variants={ANIMATION_VARIANTS[anim.id]} initial="initial" animate="animate"
                            transition={ANIMATION_VARIANTS[anim.id]?.transition || { repeat: Infinity, duration: 2 }}
                            className="flex items-center justify-center"
                          >
                            <Icon icon="game-icons:glass-ball" width="2vw" height="2vw" className="text-gray-500" />
                          </motion.div>
                        ) : (
                          <div className="anim-panel-bars-icon flex items-end gap-[0.3vw] h-[1.8vw]">
                            <motion.div
                              variants={ANIMATION_VARIANTS[anim.id]} initial="initial" animate="animate"
                              transition={ANIMATION_VARIANTS[anim.id]?.transition || { repeat: Infinity, duration: 1.5 }} className="anim-panel-bar-1 w-[0.6vw] h-[1.8vw] bg-gray-200 rounded-[0.05vw]"
                            />
                            <motion.div
                              variants={ANIMATION_VARIANTS[anim.id]} initial="initial" animate="animate"
                              transition={ANIMATION_VARIANTS[anim.id]?.transition || { repeat: Infinity, duration: 1.5, delay: 0.1 }} className="anim-panel-bar-2 w-[0.6vw] h-[1.8vw] bg-gray-300 rounded-[0.05vw]"
                            />
                            <motion.div
                              variants={ANIMATION_VARIANTS[anim.id]} initial="initial" animate="animate"
                              transition={ANIMATION_VARIANTS[anim.id]?.transition || { repeat: Infinity, duration: 1.5, delay: 0.2 }} className="anim-panel-bar-3 w-[0.6vw] h-[1.8vw] bg-gray-400 rounded-[0.05vw]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`anim-panel-item-label text-[0.6vw] mt-[0.6vw] font-medium text-center leading-tight transition-colors ${tempSelectedAnim === anim.id ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{anim.label}</span>
                  </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="anim-panel-gallery-footer p-[0.8vw] border-t border-gray-100 flex justify-end gap-[0.5vw] bg-white rounded-b-[0.5vw] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.10)] relative z-10">
              <button onClick={() => setShowGallery(false)} className="anim-panel-gallery-close cursor-pointer px-[1vw] h-[2vw] border border-black rounded-[0.3vw] text-[0.8vw] font-semibold flex items-center justify-center gap-[0.5vw] hover:bg-gray-50 transition-colors">
                <X size="1vw" /> Close
              </button>
              <button
                disabled={!tempSelectedAnim}
                onClick={() => {
                  if (tempSelectedAnim && editingElement) {
                    // A running gallery preview must be stopped first, otherwise its restore step would undo the new value
                    stopTextPreview();
                    // Execute callback if present
                    if (typeof galleryCallback === 'function') {
                      try {
                        galleryCallback(tempSelectedAnim);
                      } catch (err) {
                        console.error('Gallery callback error:', err);
                      }
                    } else if (galleryKind === 'text') {
                      editingElement.setAttribute('data-text-effect', tempSelectedAnim);
                      if (onUpdate) onUpdate(editingElement.id || editingElement.getAttribute('data-name'), 'data-text-effect', tempSelectedAnim);
                    } else {
                      // Fallback for direct single element edit
                      editingElement.setAttribute('data-animation-open-type', tempSelectedAnim);
                      if (onUpdate) onUpdate(editingElement.id || editingElement.getAttribute('data-name'), 'data-animation-open-type', tempSelectedAnim);
                    }

                    // Always close and reset
                    setShowGallery(false);
                    setTempSelectedAnim(null);
                    setGalleryCallback(null);
                  }
                }}
                className="anim-panel-gallery-replace px-[1vw] cursor-pointer h-[2vw] bg-black text-white rounded-[0.3vw] text-[0.8vw] font-semibold flex items-center justify-center gap-[0.5vw] hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-lg"
              >
                <Icon icon="ph:arrows-clockwise-bold" width="1vw" height="1vw" className="text-white" /> Replace
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnimationPanel;
