import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * TurnBook — soft page-curl flipbook powered by turn.js (loaded from /public/lib, no CDN).
 *
 * Drop-in replacement for the parts of `react-pageflip` used on the Home page:
 *   - ref.current.pageFlip().flipNext() / flipPrev() / flip(i) / turnToPage(i)
 *     / getCurrentPageIndex() / getPageCount() / update()
 *   - onFlip({ data: pageIndex })      (0-based, first visible page — same as react-pageflip)
 *   - startPage (0-based)
 * Every page (covers included) turns with a soft curl — no stiff "hard" pages.
 *
 * Pages are passed as image URLs (`pages`), because turn.js owns the book's DOM.
 */

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find((s) => s.src && s.src.includes(src.split('?')[0]));
    if (existing && existing.dataset.loaded === 'true') return resolve();
    const el = existing || document.createElement('script');
    el.addEventListener('load', () => { el.dataset.loaded = 'true'; resolve(); }, { once: true });
    el.addEventListener('error', reject, { once: true });
    if (!existing) {
      el.src = src;
      el.async = true;
      document.body.appendChild(el);
    }
  });

let turnReadyPromise = null;
const ensureTurnJs = () => {
  if (window.jQuery?.fn?.turn) return Promise.resolve();
  if (!turnReadyPromise) {
    turnReadyPromise = (async () => {
      if (!window.jQuery) await loadScript('/lib/jquery.min.js');
      if (!window.jQuery?.fn?.turn) await loadScript('/lib/turn.min.js?v=5.4-fbe');
    })().catch((err) => {
      turnReadyPromise = null;
      throw err;
    });
  }
  return turnReadyPromise;
};

const TurnBook = forwardRef(function TurnBook(
  {
    pages = [],
    width = 595, // single page aspect (width : height)
    height = 842,
    startPage = 0,
    duration = 900,
    onFlip,
    className = '',
    pageClassName = '',
    singleBelow = 640, // viewport width (px) under which the book shows one page at a time
  },
  ref
) {
  const wrapRef = useRef(null);
  const bookRef = useRef(null);
  const shiftRef = useRef(null);
  const onFlipRef = useRef(onFlip);
  const [ready, setReady] = useState(false);
  onFlipRef.current = onFlip;
  const displayMode = () => (typeof window !== 'undefined' && window.innerWidth < singleBelow ? 'single' : 'double');
  const modeRef = useRef(displayMode());

  const $book = () => (window.jQuery && bookRef.current ? window.jQuery(bookRef.current) : null);
  const isInit = () => {
    const $b = $book();
    try { return Boolean($b && $b.turn('is')); } catch { return false; }
  };

  // First visible page of the current view, 0-based (matches react-pageflip's index)
  const currentIndex = () => {
    const $b = $book();
    if (!$b || !isInit()) return 0;
    try {
      const view = $b.turn('view') || [];
      const first = view.find((p) => p > 0) || $b.turn('page') || 1;
      return first - 1;
    } catch { return 0; }
  };

  // Horizontal shift (% of the book) that centres a view: lone front cover right half, back cover left half
  const centerShift = (view) =>
    modeRef.current === 'single' || !Array.isArray(view) ? 0 : view[0] === 0 ? -25 : view[1] === 0 ? 25 : 0;
  const dragRef = useRef(null); // { x, from, to, span } while a page is pulled by hand
  const peelingRef = useRef(false);

  // Centre a lone cover: front cover sits on the right half, back cover on the left half.
  // Driven from turn.js's `turning` event so it starts the moment a turn begins (no lag on fast flips).
  const applyCenter = (view, animate = true) => {
    const el = shiftRef.current;
    if (!el || !Array.isArray(view)) return;
    const shift = centerShift(view);
    dragRef.current = null;
    // Same centring motion as the preview engine: 0.85s, smooth ease-in-out (GPU transform)
    el.style.transition = animate ? 'transform 850ms cubic-bezier(0.45, 0, 0.2, 1)' : 'none';
    el.style.transform = `translate3d(${shift}%, 0, 0)`;
  };

  // Dark backing under the spine only while a two-page spread is (or is becoming) visible
  const markSpread = (view, onlyAdd = false) => {
    const b = bookRef.current;
    if (!b || !Array.isArray(view)) return;
    const full = modeRef.current !== 'single' && view[0] > 0 && view[1] > 0;
    if (full) b.setAttribute('data-spread', '');
    else if (!onlyAdd) b.removeAttribute('data-spread');
  };
  // Per-page GPU layers only while a page moves (at rest both pages paint as one layer: no seam)
  const setMoving = (on) => bookRef.current?.classList.toggle('turnbook-moving', on);

  // Fit two pages side by side inside the wrapper, keeping the page aspect ratio
  const fitSize = () => {
    const wrap = wrapRef.current;
    const $b = $book();
    if (!wrap || !$b || !isInit()) return;
    const cw = wrap.clientWidth;
    const ch = wrap.clientHeight || (cw / 2) * (height / width);
    if (!cw || !ch) return;
    const across = modeRef.current === 'single' ? 1 : 2;
    const pageAspect = width / height;
    let bookH = ch;
    let bookW = bookH * pageAspect * across;
    if (bookW > cw) {
      bookW = cw;
      bookH = bookW / (pageAspect * across);
    }
    $b.turn('size', Math.floor(bookW), Math.floor(bookH));
  };

  useImperativeHandle(ref, () => ({
    pageFlip: () => ({
      flipNext: () => { if (isInit()) $book().turn('next'); },
      flipPrev: () => { if (isInit()) $book().turn('previous'); },
      flip: (index) => { if (isInit()) $book().turn('page', Math.max(1, (index | 0) + 1)); },
      turnToPage: (index) => { if (isInit()) $book().turn('page', Math.max(1, (index | 0) + 1)); },
      getCurrentPageIndex: () => currentIndex(),
      getPageCount: () => (isInit() ? $book().turn('pages') : pages.length),
      update: () => fitSize(),
    }),
  }));

  // Build / rebuild the book whenever the page list changes
  useEffect(() => {
    let cancelled = false;
    const bookEl = bookRef.current;

    ensureTurnJs()
      .then(() => {
        if (cancelled || !bookEl) return;
        const $ = window.jQuery;

        // turn.js owns this DOM: build the pages imperatively
        bookEl.replaceChildren();
        pages.forEach((src, i) => {
          const page = document.createElement('div');
          page.className = `turnbook-page ${pageClassName}`.trim();
          const img = document.createElement('img');
          img.src = src;
          img.alt = `Page ${i + 1}`;
          img.draggable = false;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.className = 'turnbook-img';
          page.appendChild(img);
          // Spine (gutter) shadow on the inner edge of each page in an open spread.
          // Page n (1-based): even = left page (shadow on its right edge), odd = right page (shadow on its left edge).
          const n = i + 1;
          const isFrontCover = n === 1;
          const isBackCover = n === pages.length && n % 2 === 0;
          // Covers get a narrower "hinge" shade on their binding edge (front: left, back: right).
          const isCover = isFrontCover || isBackCover;
          const gutter = document.createElement('div');
          gutter.className = `turnbook-gutter ${n % 2 === 0 ? 'turnbook-gutter-left-page' : 'turnbook-gutter-right-page'}${isCover ? ' turnbook-gutter-cover' : ''}`;
          page.appendChild(gutter);
          bookEl.appendChild(page);
        });

        const wrap = wrapRef.current;
        modeRef.current = displayMode();
        const across = modeRef.current === 'single' ? 1 : 2;
        const pageAspect = width / height;
        const cw = wrap?.clientWidth || 800;
        const ch = wrap?.clientHeight || (cw / across) / pageAspect;
        let bookH = ch;
        let bookW = bookH * pageAspect * across;
        if (bookW > cw) { bookW = cw; bookH = bookW / (pageAspect * across); }

        bookEl.classList.toggle('turnbook-single', modeRef.current === 'single');
        $(bookEl).turn({
          width: Math.floor(bookW),
          height: Math.floor(bookH),
          display: modeRef.current,
          page: Math.min(Math.max(1, (startPage | 0) + 1), Math.max(1, pages.length)),
          autoCenter: false, // centring handled by applyCenter (starts on `turning`, not after the turn)
          acceleration: true,
          gradients: true,
          elevation: 50,
          duration,
          when: {
            start: () => { peelingRef.current = true; setMoving(true); },
            end: (e, pageObj, turned) => { peelingRef.current = false; if (!turned) setMoving(false); },
            turning: (e, page, view) => {
              setMoving(true);
              const v = view || $(bookEl).turn('view', page);
              markSpread(v); // off as soon as a turn heads to a lone cover
              applyCenter(v);
            },
            turned: (e, page, view) => {
              setMoving(false);
              const v = view || $(bookEl).turn('view');
              markSpread(v);
              applyCenter(v);
              onFlipRef.current?.({ data: currentIndex() });
            },
          },
        });
        try { const v = $(bookEl).turn('view'); applyCenter(v, false); markSpread(v); } catch { /* noop */ }
        setReady(true);
      })
      .catch((err) => console.error('[TurnBook] failed to load turn.js', err));

    return () => {
      cancelled = true;
      setReady(false);
      try {
        const $b = window.jQuery && bookEl ? window.jQuery(bookEl) : null;
        if ($b && $b.turn('is')) $b.turn('destroy');
      } catch { /* already gone */ }
      if (bookEl) bookEl.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.join('|'), width, height]);

  // While a page is pulled by hand, slide the book toward its next centred position in step with the
  // drag (like the preview engine). On release the `turning` centring (850ms) continues from here;
  // a cancelled pull eases back.
  useEffect(() => {
    if (!ready) return undefined;
    const book = bookRef.current;
    if (!book) return undefined;
    const viewFor = (page) => { try { return $book().turn('view', page); } catch { return null; } };
    const onDown = (e) => {
      if (!isInit() || modeRef.current === 'single') return;
      const p = e.touches ? e.touches[0] : e;
      const r = book.getBoundingClientRect();
      const $b = $book();
      const view = $b.turn('view') || [];
      const next = p.clientX > r.left + r.width / 2;
      const target = next
        ? Math.max(...view) + 1
        : Math.min(...view.filter((v) => v > 0)) - 1;
      if (target < 1 || target > $b.turn('pages')) return;
      const from = centerShift(view);
      const to = centerShift(viewFor(target));
      if (from === to) return;
      dragRef.current = { x: p.clientX, from, to, span: r.width, dir: next ? -1 : 1 };
    };
    const onMove = (e) => {
      const d = dragRef.current;
      const el = shiftRef.current;
      if (!d || !el || !peelingRef.current) return;
      const p = e.touches ? e.touches[0] : e;
      const progress = Math.min(1, Math.max(0, ((p.clientX - d.x) * d.dir) / d.span));
      el.style.transition = 'none';
      el.style.transform = `translate3d(${d.from + (d.to - d.from) * progress}%, 0, 0)`;
    };
    const onUp = () => {
      // Released without a turn: ease back to the current centre (a turn re-centres via `turning`)
      if (!dragRef.current) return;
      setTimeout(() => {
        if (!dragRef.current || !isInit()) return;
        const el = shiftRef.current;
        if (el) el.style.transition = 'transform 400ms cubic-bezier(0.45, 0, 0.2, 1)';
        if (el) el.style.transform = `translate3d(${centerShift($book().turn('view'))}%, 0, 0)`;
        dragRef.current = null;
      }, 0);
    };
    book.addEventListener('mousedown', onDown, true);
    book.addEventListener('touchstart', onDown, { capture: true, passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      book.removeEventListener('mousedown', onDown, true);
      book.removeEventListener('touchstart', onDown, true);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Keep the book fitted to its container
  useEffect(() => {
    if (!ready || !wrapRef.current) return undefined;
    const ro = new ResizeObserver(() => {
      // Switch single <-> double page view when crossing the breakpoint
      const mode = displayMode();
      if (mode !== modeRef.current && isInit()) {
        modeRef.current = mode;
        bookRef.current?.classList.toggle('turnbook-single', mode === 'single');
        try {
          $book().turn('display', mode);
          applyCenter($book().turn('view'), false);
          markSpread($book().turn('view'));
        } catch { /* noop */ }
      }
      fitSize();
    });
    ro.observe(wrapRef.current);
    fitSize();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div ref={wrapRef} className={`relative w-full h-full flex items-center justify-center ${className}`.trim()}>
      <style>{`
        .turnbook-page { background: #fff; overflow: hidden; }
        .turnbook-img { width: 100%; height: 100%; display: block; object-fit: cover; user-select: none; -webkit-user-drag: none; pointer-events: none; }
        .turnbook-page { position: relative; }
        .turnbook-gutter { position: absolute; top: 0; bottom: 0; width: 14%; pointer-events: none; z-index: 2; }
        .turnbook-gutter-left-page {
          right: 0;
          background: linear-gradient(to left, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0) 100%);
        }
        .turnbook-gutter-right-page {
          left: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0) 100%);
        }
        /* Covers (spine edge): dark seam fading to grey into the cover */
        .turnbook-gutter-cover { width: max(10px, 2.2%); }
        .turnbook-gutter-cover.turnbook-gutter-right-page { left: 0; right: auto; background: linear-gradient(to right, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.24) 12%, rgba(0,0,0,0.13) 32%, rgba(0,0,0,0.05) 62%, rgba(0,0,0,0) 100%); }
        .turnbook-gutter-cover.turnbook-gutter-left-page { right: 0; left: auto; background: linear-gradient(to left, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.24) 12%, rgba(0,0,0,0.13) 32%, rgba(0,0,0,0.05) 62%, rgba(0,0,0,0) 100%); }
        /* One page at a time (mobile): no spine */
        .turnbook-single .turnbook-gutter { display: none; }
        /* turn.js's own book shadow + sheet box-shadow (same as the preview engine: hidden; the curl
           gradients and spine shadows do the shading, so no duplicate shadow trails behind the turn) */
        .turnbook > .shadow { display: none !important; }
        .turnbook, .turnbook .page-wrapper, .turnbook .page-wrapper *, .turnbook-page { box-shadow: none !important; }
        /* At rest, paint both pages in one layer so no hairline opens at the spine while the book slides */
        .turnbook:not(.turnbook-moving) .page-wrapper,
        .turnbook:not(.turnbook-moving) .page-wrapper > * { will-change: auto !important; }
        /* Thin dark backing under the spine: any sub-pixel gap reads as a crease, never a white line */
        .turnbook[data-spread]::before {
          content: ''; position: absolute; top: 0; bottom: 0; left: calc(50% - 1.5px); width: 3px;
          background: rgba(20,20,26,0.85); pointer-events: none; z-index: 0;
        }
      `}</style>
      <div ref={shiftRef} style={{ willChange: 'transform' }}>
        <div ref={bookRef} className="turnbook select-none" />
      </div>
    </div>
  );
});

export default TurnBook;
