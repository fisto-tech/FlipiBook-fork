import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Realistic physics pull-rope switch (Verlet rope simulation).
 * - Rope is a chain of particles with gravity, inertia and length constraints.
 * - Moving the cursor across the rope brushes it and makes it swing naturally.
 * - Grab the handle (or anywhere) and pull down: the cord extends out of the
 *   ceiling housing; past the threshold it clicks and toggles the lights.
 * - Releasing retracts the cord, yanking the handle up with a natural bounce.
 * - A simple click performs a quick tug + toggle.
 */

const SEGMENTS = 14;
const GRAVITY = 1600; // px/s^2
const DAMPING = 0.988; // velocity retention per step
const ITERATIONS = 14; // constraint solver passes
const MAX_PULL = 42; // max cord extension in px
const TOGGLE_AT = 22; // extension needed to click the switch
const STEP = 1 / 120; // fixed physics step
const ANCHOR_X = 24;
const ANCHOR_Y = 6;
const HANDLE_INV_MASS = 0.25; // handle is ~4x heavier than a rope node
const WIND_BASE = 200; // px/s^2 steady breeze force at windStrength = 1

// Smooth, non-repeating breeze: layered sines + slow gust envelope
const windForce = (t) => {
  const breeze =
    Math.sin(t * 0.9) * 0.55 +
    Math.sin(t * 2.3 + 1.7) * 0.25 +
    Math.sin(t * 5.1 + 0.4) * 0.08;
  const gust = 0.6 + 0.4 * Math.max(0, Math.sin(t * 0.31 + 2.1)) ** 3;
  return breeze * gust;
};

const ROPE_STYLES = {
  blue: {
    cord: ['#cdb994', '#e9dcc0'],
    outline: '#9c8463',
    twist: '#8a7253',
    shine: '#fffaf0',
    cap: ['#3f4a5a', '#9aa6b6', '#334155'],
    ferrule: '#7a6243',
    knobOn: ['#fff7c2', '#d99a2b', '#6b3a0e'],
    knobOff: ['#f1f5f9', '#a3adbb', '#475569'],
    strokeOn: '#fde68a',
    strokeOff: '#cbd5e1',
    glow: 'rgba(251, 191, 36, 0.25)',
    handle: 'teardrop',
  },
  golden: {
    cord: ['#d97706', '#fde68a'],
    outline: '#92400e',
    twist: '#78350f',
    shine: '#fef9c3',
    cap: ['#78350f', '#fbbf24', '#78350f'],
    ferrule: '#b45309',
    knobOn: ['#fef9c3', '#f59e0b', '#78350f'],
    knobOff: ['#fde68a', '#b45309', '#451a03'],
    strokeOn: '#fef08a',
    strokeOff: '#d97706',
    glow: 'rgba(250, 204, 21, 0.35)',
    handle: 'bell',
  },
  window: {
    cord: ['#d6d3d1', '#fafaf9'],
    outline: '#a8a29e',
    twist: '#78716c',
    shine: '#ffffff',
    cap: ['#78350f', '#d97706', '#78350f'],
    ferrule: '#92400e',
    knobOn: ['#fef3c7', '#d97706', '#78350f'],
    knobOff: ['#e7d5c3', '#a17a58', '#5c3a21'],
    strokeOn: '#fde68a',
    strokeOff: '#d6d3d1',
    glow: 'rgba(251, 191, 36, 0.26)',
    handle: 'acorn',
  },
  green: {
    cord: ['#059669', '#a7f3d0'],
    outline: '#065f46',
    twist: '#064e3b',
    shine: '#ecfdf5',
    cap: ['#064e3b', '#34d399', '#064e3b'],
    ferrule: '#047857',
    knobOn: ['#d1fae5', '#10b981', '#064e3b'],
    knobOff: ['#e2e8f0', '#94a3b8', '#475569'],
    strokeOn: '#a7f3d0',
    strokeOff: '#cbd5e1',
    glow: 'rgba(52, 211, 153, 0.32)',
    handle: 'crystal',
  },
  orange: {
    cord: ['#ea580c', '#fed7aa'],
    outline: '#9a3412',
    twist: '#7c2d12',
    shine: '#fff7ed',
    cap: ['#7c2d12', '#fb923c', '#7c2d12'],
    ferrule: '#c2410c',
    knobOn: ['#ffedd5', '#f97316', '#9a3412'],
    knobOff: ['#e7e5e4', '#a8a29e', '#57534e'],
    strokeOn: '#fed7aa',
    strokeOff: '#d6d3d1',
    glow: 'rgba(251, 146, 60, 0.32)',
    handle: 'cylinder',
  },
  plant: {
    cord: ['#8c734b', '#e7d8b9'],
    outline: '#6b5535',
    twist: '#524024',
    shine: '#fefce8',
    cap: ['#3f6212', '#a3e635', '#365314'],
    ferrule: '#4d7c0f',
    knobOn: ['#ecfccb', '#84cc16', '#3f6212'],
    knobOff: ['#e7e5e4', '#a8a29e', '#57534e'],
    strokeOn: '#d9f99d',
    strokeOff: '#cbd5e1',
    glow: 'rgba(163, 230, 53, 0.3)',
    handle: 'acorn',
  },
  light: {
    cord: ['#94a3b8', '#f1f5f9'],
    outline: '#64748b',
    twist: '#475569',
    shine: '#ffffff',
    cap: ['#475569', '#e2e8f0', '#475569'],
    ferrule: '#64748b',
    knobOn: ['#ffffff', '#fef08a', '#eab308'],
    knobOff: ['#f8fafc', '#cbd5e1', '#64748b'],
    strokeOn: '#fde047',
    strokeOff: '#cbd5e1',
    glow: 'rgba(255, 255, 255, 0.42)',
    handle: 'capsule',
  },
  bluerope: {
    cord: ['#1d4ed8', '#bfdbfe'],
    outline: '#1e3a8a',
    twist: '#172554',
    shine: '#eff6ff',
    cap: ['#1e3a8a', '#60a5fa', '#1e3a8a'],
    ferrule: '#1d4ed8',
    knobOn: ['#fef9c3', '#f59e0b', '#b45309'],
    knobOff: ['#dbeafe', '#60a5fa', '#1e40af'],
    strokeOn: '#fde68a',
    strokeOff: '#93c5fd',
    glow: 'rgba(96, 165, 250, 0.35)',
    handle: 'ring',
  },
  greenlight: {
    cord: ['#047857', '#d1fae5'],
    outline: '#064e3b',
    twist: '#022c22',
    shine: '#ecfdf5',
    cap: ['#064e3b', '#6ee7b7', '#064e3b'],
    ferrule: '#059669',
    knobOn: ['#fef9c3', '#34d399', '#065f46'],
    knobOff: ['#e2e8f0', '#94a3b8', '#475569'],
    strokeOn: '#fde68a',
    strokeOff: '#cbd5e1',
    glow: 'rgba(110, 231, 183, 0.32)',
    handle: 'ring',
  },
};

const PullRopeSwitch = ({
  isOn = true,
  onToggle,
  variant = 'blue',
  right = '4.5%',
  top = '0%',
  ropeLength = 76,
  zIndex = 30,
  wind = true,
  windStrength = 1,
}) => {
  const styleCfg = ROPE_STYLES[variant] || ROPE_STYLES.blue;
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef(null);
  const shadowRef = useRef(null);
  const outlineRef = useRef(null);
  const coreRef = useRef(null);
  const twistRef = useRef(null);
  const shineRef = useRef(null);
  const handleRef = useRef(null);
  const [isPulling, setIsPulling] = useState(false);

  const onToggleRef = useRef(onToggle);
  onToggleRef.current = onToggle;

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const windRef = useRef(0);
  windRef.current = wind && !reducedMotion ? windStrength : 0;

  const sim = useRef(null);
  if (!sim.current) {
    const segLen = ropeLength / SEGMENTS;
    const pts = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const y = ANCHOR_Y + i * segLen;
      pts.push({ x: ANCHOR_X, y, px: ANCHOR_X, py: y });
    }
    sim.current = {
      pts,
      extend: 0, // current cord extension
      extendVel: 0,
      dragging: false,
      dragTarget: null,
      toggled: false,
      moved: false,
      startY: 0,
      tugUntil: 0,
      lastPointer: null,
      raf: 0,
      lastTime: 0,
      acc: 0,
      idleFrames: 0,
    };
  }

  // ---------- rendering ----------
  const render = useCallback(() => {
    const { pts } = sim.current;
    // smooth curve through particles (quadratic midpoints)
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;

    [shadowRef, outlineRef, coreRef, twistRef, shineRef].forEach((r) => {
      if (r.current) r.current.setAttribute('d', d);
    });

    // Handle orientation follows the last rope segment
    const prev = pts[pts.length - 2];
    const angle = (Math.atan2(last.y - prev.y, last.x - prev.x) * 180) / Math.PI - 90;
    if (handleRef.current) {
      handleRef.current.setAttribute(
        'transform',
        `translate(${last.x.toFixed(2)} ${last.y.toFixed(2)}) rotate(${angle.toFixed(2)})`
      );
    }
  }, []);

  // ---------- physics step ----------
  const step = useCallback(
    (dt) => {
      const s = sim.current;
      const { pts } = s;

      // Cord extension: follows the drag, or springs back (retracts) when released
      if (!s.dragging) {
        const target = performance.now() < s.tugUntil ? 26 : 0;
        const k = 900;
        const c = 38;
        const a = -k * (s.extend - target) - c * s.extendVel;
        s.extendVel += a * dt;
        s.extend += s.extendVel * dt;
        if (s.extend < 0) {
          s.extend = 0;
          if (s.extendVel < 0) s.extendVel = 0;
        }
      }
      const segLen = (ropeLength + s.extend) / SEGMENTS;

      // Wind (mild ambient sway, stronger toward the free end)
      s.t = (s.t || 0) + dt;
      const w = windRef.current ? WIND_BASE * windRef.current * windForce(s.t) * dt * dt : 0;

      // Verlet integration
      const g = GRAVITY * dt * dt;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        const vx = (p.x - p.px) * DAMPING;
        const vy = (p.y - p.py) * DAMPING;
        p.px = p.x;
        p.py = p.y;
        p.x += vx + w * (0.4 + 0.6 * (i / SEGMENTS));
        p.y += vy + g;
      }

      // Anchor
      pts[0].x = pts[0].px = ANCHOR_X;
      pts[0].y = pts[0].py = ANCHOR_Y;

      const lastIdx = pts.length - 1;

      for (let it = 0; it < ITERATIONS; it++) {
        // Drag pin on the handle
        if (s.dragging && s.dragTarget) {
          pts[lastIdx].x = s.dragTarget.x;
          pts[lastIdx].y = s.dragTarget.y;
        }

        for (let i = 0; i < lastIdx; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = (dist - segLen) / dist;

          const wa = i === 0 ? 0 : 1;
          let wb = i + 1 === lastIdx ? HANDLE_INV_MASS : 1;
          if (s.dragging && i + 1 === lastIdx) wb = 0;
          const wSum = wa + wb;
          if (wSum === 0) continue;

          const ox = dx * diff;
          const oy = dy * diff;
          a.x += ox * (wa / wSum);
          a.y += oy * (wa / wSum);
          b.x -= ox * (wb / wSum);
          b.y -= oy * (wb / wSum);
        }
      }
    },
    [ropeLength]
  );

  // ---------- loop (sleeps when the rope settles) ----------
  const loop = useCallback(
    (time) => {
      const s = sim.current;
      if (!s.lastTime) s.lastTime = time;
      const frame = Math.min(0.05, (time - s.lastTime) / 1000);
      s.lastTime = time;
      s.acc += frame;
      while (s.acc >= STEP) {
        step(STEP);
        s.acc -= STEP;
      }
      render();

      // measure motion to decide whether to sleep
      let motion = Math.abs(s.extendVel) + s.extend * 0.5;
      for (const p of s.pts) motion += Math.abs(p.x - p.px) + Math.abs(p.y - p.py);
      if (!windRef.current && !s.dragging && motion < 0.02 && performance.now() > s.tugUntil) {
        s.idleFrames++;
      } else {
        s.idleFrames = 0;
      }

      if (s.idleFrames > 30) {
        s.raf = 0;
        s.lastTime = 0;
        s.acc = 0;
        return;
      }
      s.raf = requestAnimationFrame(loop);
    },
    [render, step]
  );

  const wake = useCallback(() => {
    const s = sim.current;
    s.idleFrames = 0;
    if (!s.raf) s.raf = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    if (windRef.current) wake();
  }, [wind, windStrength, wake]);

  useEffect(() => {
    render();
    wake();
    const s = sim.current;
    return () => {
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [render, wake]);

  // ---------- helpers ----------
  const toLocal = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // Brush the rope with the cursor: nodes near the pointer receive its velocity
  const handlePointerMoveHover = (e) => {
    const s = sim.current;
    if (s.dragging || !containerRef.current) return;
    const p = toLocal(e.clientX, e.clientY);
    const lp = s.lastPointer;
    s.lastPointer = p;
    if (!lp) return;

    const vx = p.x - lp.x;
    const vy = p.y - lp.y;
    if (Math.abs(vx) + Math.abs(vy) < 0.1) return;

    const radius = 14;
    let touched = false;
    for (let i = 1; i < s.pts.length; i++) {
      const n = s.pts[i];
      const dist = Math.hypot(n.x - p.x, n.y - p.y);
      if (dist < radius) {
        const f = (1 - dist / radius) * 0.35;
        // push by shifting previous position (adds velocity in Verlet)
        n.px -= Math.max(-6, Math.min(6, vx)) * f;
        n.py -= Math.max(-3, Math.min(3, vy)) * f * 0.3;
        touched = true;
      }
    }
    if (touched) wake();
  };

  const handlePointerLeave = () => {
    sim.current.lastPointer = null;
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const s = sim.current;
    s.dragging = true;
    s.toggled = false;
    s.moved = false;
    s.startY = e.clientY;
    s.dragTarget = { ...s.pts[s.pts.length - 1] };
    const grabOffset = toLocal(e.clientX, e.clientY);
    const handleStart = { x: s.pts[s.pts.length - 1].x, y: s.pts[s.pts.length - 1].y };
    setIsPulling(true);
    wake();

    const onMove = (ev) => {
      if (!s.dragging || !containerRef.current) return;
      const p = toLocal(ev.clientX, ev.clientY);
      if (Math.abs(ev.clientY - s.startY) > 3) s.moved = true;

      // target follows the pointer relative to where it was grabbed
      let tx = handleStart.x + (p.x - grabOffset.x);
      let ty = handleStart.y + (p.y - grabOffset.y);

      // limit by total available cord length (rope + max extension)
      const dx = tx - ANCHOR_X;
      const dy = ty - ANCHOR_Y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const maxLen = ropeLength + MAX_PULL;
      if (dist > maxLen) {
        tx = ANCHOR_X + (dx / dist) * maxLen;
        ty = ANCHOR_Y + (dy / dist) * maxLen;
      }
      const reach = Math.min(dist, maxLen);
      s.extend = Math.max(0, reach - ropeLength);
      s.extendVel = 0;
      s.dragTarget = { x: tx, y: ty };

      if (s.extend >= TOGGLE_AT && !s.toggled) {
        s.toggled = true;
        onToggleRef.current?.();
      }
      wake();
    };

    const onUp = () => {
      const wasMoved = s.moved;
      const wasToggled = s.toggled;
      s.dragging = false;
      s.dragTarget = null;
      setIsPulling(false);

      if (!wasMoved && !wasToggled) {
        // click / tap: quick tug
        s.tugUntil = performance.now() + 110;
        onToggleRef.current?.();
      }
      wake();

      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const height = ropeLength + MAX_PULL + 30;
  const cordId = `ropeCord-${uid}`;
  const knobId = `ropeKnob-${uid}`;
  const capId = `ropeCap-${uid}`;
  const blurId = `ropeBlur-${uid}`;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMoveHover}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      title={isOn ? 'Pull rope to turn lights off' : 'Pull rope to turn lights on'}
      className={`absolute pointer-events-auto select-none touch-none ${
        isPulling ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ right, top, zIndex, width: '48px', height: `${ropeLength + 40}px` }}
    >
      <svg
        width="48"
        height={height}
        viewBox={`0 0 48 ${height}`}
        className="overflow-visible block"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id={cordId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={styleCfg.cord[0]} />
            <stop offset="100%" stopColor={styleCfg.cord[1]} />
          </linearGradient>
          <radialGradient id={knobId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={isOn ? styleCfg.knobOn[0] : styleCfg.knobOff[0]} />
            <stop offset="55%" stopColor={isOn ? styleCfg.knobOn[1] : styleCfg.knobOff[1]} />
            <stop offset="100%" stopColor={isOn ? styleCfg.knobOn[2] : styleCfg.knobOff[2]} />
          </radialGradient>
          <linearGradient id={capId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={styleCfg.cap[0]} />
            <stop offset="50%" stopColor={styleCfg.cap[1]} />
            <stop offset="100%" stopColor={styleCfg.cap[2]} />
          </linearGradient>
          <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>

        {/* Soft drop shadow of the cord */}
        <path
          ref={shadowRef}
          fill="none"
          stroke="#000"
          strokeOpacity="0.22"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(2.2 3)"
          filter={`url(#${blurId})`}
        />

        {/* Cord: soft edge, smooth fabric core, side shading, highlight */}
        <path
          ref={outlineRef}
          fill="none"
          stroke={styleCfg.outline}
          strokeOpacity="0.9"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          ref={coreRef}
          fill="none"
          stroke={`url(#${cordId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          ref={twistRef}
          fill="none"
          stroke={styleCfg.twist}
          strokeOpacity="0.35"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0.7 0)"
        />
        <path
          ref={shineRef}
          fill="none"
          stroke={styleCfg.shine}
          strokeOpacity="0.55"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(-0.5 0)"
        />

        {/* Ceiling housing (drawn over the cord top so the cord comes out of it) */}
        <ellipse cx="24" cy="2" rx="10" ry="2.2" fill="#1e293b" opacity="0.35" />
        <path d="M 15 0 L 33 0 L 30 8 Q 24 10 18 8 Z" fill={`url(#${capId})`} />
        <ellipse cx="24" cy="8" rx="2.2" ry="1" fill="#111827" />

        {/* Handle (positioned by physics) */}
        <g ref={handleRef}>
          {/* glow when ON */}
          {isOn && <circle cx="0" cy="9" r="11" fill={styleCfg.glow} />}
          {/* knot / ferrule */}
          <rect x="-2.2" y="-1" width="4.4" height="4" rx="1.4" fill={styleCfg.ferrule} />

          {styleCfg.handle === 'bell' && (
            <>
              <path
                d="M -5 3.5 C -5 0.5 5 0.5 5 3.5 L 7.2 13 L -7.2 13 Z M -2 13 A 2 2 0 0 0 2 13"
                fill={`url(#${knobId})`}
                stroke={isOn ? styleCfg.strokeOn : styleCfg.strokeOff}
                strokeWidth="0.9"
                strokeLinejoin="round"
              />
              <ellipse cx="-2" cy="8" rx="1.1" ry="2.6" fill="#fff" opacity="0.4" />
            </>
          )}

          {styleCfg.handle === 'acorn' && (
            <>
              <path d="M -5.5 5 C -5.5 1 5.5 1 5.5 5 Z" fill={styleCfg.ferrule} />
              <ellipse
                cx="0"
                cy="10"
                rx="5.2"
                ry="6.2"
                fill={`url(#${knobId})`}
                stroke={isOn ? styleCfg.strokeOn : styleCfg.strokeOff}
                strokeWidth="0.9"
              />
              <ellipse cx="-1.8" cy="8" rx="1.2" ry="2" fill="#fff" opacity="0.4" />
            </>
          )}

          {styleCfg.handle === 'crystal' && (
            <>
              <polygon
                points="0,2.5 5.5,8.5 0,16.5 -5.5,8.5"
                fill={`url(#${knobId})`}
                stroke={isOn ? styleCfg.strokeOn : styleCfg.strokeOff}
                strokeWidth="0.9"
                strokeLinejoin="round"
              />
              <polygon points="0,3.5 2.5,8.5 0,14" fill="#fff" opacity="0.3" />
            </>
          )}

          {styleCfg.handle === 'cylinder' && (
            <>
              <rect
                x="-4.5"
                y="2.5"
                width="9"
                height="13.5"
                rx="2.8"
                fill={`url(#${knobId})`}
                stroke={isOn ? styleCfg.strokeOn : styleCfg.strokeOff}
                strokeWidth="0.9"
              />
              <rect x="-2.4" y="4.5" width="1.6" height="8.5" rx="0.8" fill="#fff" opacity="0.35" />
            </>
          )}

          {styleCfg.handle === 'capsule' && (
            <>
              <rect
                x="-3.6"
                y="2.5"
                width="7.2"
                height="14"
                rx="3.6"
                fill={`url(#${knobId})`}
                stroke={isOn ? styleCfg.strokeOn : styleCfg.strokeOff}
                strokeWidth="0.9"
              />
              <rect x="-1.8" y="4.5" width="1.3" height="8" rx="0.65" fill="#fff" opacity="0.45" />
            </>
          )}

          {styleCfg.handle === 'ring' && (
            <>
              <circle
                cx="0"
                cy="9.5"
                r="6"
                fill="none"
                stroke={`url(#${knobId})`}
                strokeWidth="3"
              />
              <circle
                cx="0"
                cy="9.5"
                r="6"
                fill="none"
                stroke={isOn ? styleCfg.strokeOn : styleCfg.strokeOff}
                strokeWidth="0.7"
              />
            </>
          )}

          {styleCfg.handle === 'teardrop' && (
            <>
              <path
                d="M 0 2.5 C 3.2 2.5 6 7 6 10.5 C 6 14.2 3.3 16.5 0 16.5 C -3.3 16.5 -6 14.2 -6 10.5 C -6 7 -3.2 2.5 0 2.5 Z"
                fill={`url(#${knobId})`}
                stroke={isOn ? styleCfg.strokeOn : styleCfg.strokeOff}
                strokeWidth="0.9"
              />
              <ellipse cx="-2" cy="7.5" rx="1.4" ry="2.4" fill="#fff" opacity="0.45" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

export default PullRopeSwitch;
