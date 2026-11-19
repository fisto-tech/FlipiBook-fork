import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { initGifRunner } from '../../PageEditor/Animation/AnimationRunner';
import { getCachedPageDoc, buildPageDoc as defaultBuildPageDoc, SPINE_SHADOWS, SPINE_SHADOW_EDGE, getSpineShadowType, afterNextFrame } from './utils/flipBookHelpers';

/** How many recently-visited interactive pages keep their live iframe alive (hidden) */
const POOL_MAX = 6;
/** Fallback: reveal a live page even if fonts never settle */
const REVEAL_TIMEOUT_MS = 1200;

/**
 * ActiveSpreadOverlay
 * Layer 2 interactive overlay. Keeps a small pool of live page iframes so that turning
 * away and back does not reload them (slideshow position, audio progress, etc. persist).
 *
 * Pool rules (avoid iframe reloads):
 *  - Iframes are rendered in a stable, insertion-ordered keyed list, so React never moves them.
 *  - Each iframe sits at its page's fixed slot (left / right half) and is only shown/hidden.
 *  - Leaving the spread pauses <video>/<audio> inside it; returning resumes autoplay media.
 *  - Pages containing nested 3rd-party players (YouTube etc.) cannot be paused, so they are
 *    unmounted on leave instead of pooled.
 */
export default function ActiveSpreadOverlay({
    ready,
    isTurning,
    singlePage,
    width,
    height,
    cornerRadius = '0px',
    pages = [],
    leftIdx,
    rightIdx,
    buildPageDocRef,
    flipNextFn,
    flipPrevFn,
    bookEl,
    liveControlRef
}) {
    // Always-current flip handlers: pooled iframes bind listeners once, on first load
    const flipNextRef = useRef(flipNextFn);
    const flipPrevRef = useRef(flipPrevFn);
    useEffect(() => { flipNextRef.current = flipNextFn; flipPrevRef.current = flipPrevFn; }, [flipNextFn, flipPrevFn]);

    const isInteractive = useCallback((rawHtml) => {
        if (!rawHtml || typeof rawHtml !== 'string') return false;
        // Maps and 3rd-Party Embeds are persistent directly inside .turn-page with direct pointer events,
        // so pages with only maps or embeds do NOT mount a redundant overlay iframe!
        const htmlClean = rawHtml.replace(/<foreignObject\b[^>]*data-type=["'](?:map|embed-frame)["'][\s\S]*?<\/foreignObject>/gi, '')
            .replace(/<g\b[^>]*data-type=["'](?:map|embed-frame)["'][\s\S]*?<\/g>/gi, '');
        return /<video|<audio|<iframe|data-type=["'](video|audio|form|link|slideshow)|slideshow|flipibook-swiper|data-interaction|hotspot|class=["'][^"']*interactive|<a\s+href/i.test(htmlClean);
    }, []);

    // Nested non-map/embed iframes (e.g. YouTube) keep playing when hidden and can't be paused from here
    const hasUnpausableMedia = useCallback((rawHtml) => {
        if (!rawHtml) return false;
        const stripped = rawHtml.replace(/(<div\b[^>]*class=["'][^"']*(?:map-stage|embed-root-container)[^"']*["'][^>]*>)\s*<iframe\b[\s\S]*?<\/iframe>/gi, '$1');
        return /<iframe\b/i.test(stripped);
    }, []);

    const pageHtml = (idx) => (pages[idx]?.html || pages[idx]?.content || '');
    const isLivePage = (idx) => idx !== null && idx !== undefined && idx >= 0 && idx < pages.length
        && pages[idx] && !pages[idx].isPad && isInteractive(pageHtml(idx));

    const hasInteractiveLeft = Boolean(!singlePage && isLivePage(leftIdx));
    const hasInteractiveRight = Boolean(isLivePage(rightIdx));
    const anyInteractive = hasInteractiveLeft || hasInteractiveRight;

    const activeIdxs = [];
    if (hasInteractiveLeft) activeIdxs.push(leftIdx);
    if (hasInteractiveRight) activeIdxs.push(rightIdx);
    const activeSig = activeIdxs.join(',');

    /* ── Pool bookkeeping ── */
    const [pool, setPool] = useState([]);           // insertion-ordered page indexes
    const lastUsedRef = useRef(new Map());          // idx -> timestamp of last time it was active
    const iframeElsRef = useRef(new Map());         // idx -> iframe element

    // Render list = pool + any active page not yet pooled (appended → no DOM moves)
    const renderIdxs = [...pool];
    activeIdxs.forEach(i => { if (!renderIdxs.includes(i)) renderIdxs.push(i); });

    useEffect(() => {
        const now = Date.now();
        activeIdxs.forEach(i => lastUsedRef.current.set(i, now));
        setPool(prev => {
            let next = [...prev];
            activeIdxs.forEach(i => { if (!next.includes(i)) next.push(i); });
            // Drop pages that left the spread but can't be safely kept alive, or whose page no longer qualifies
            next = next.filter(i => activeIdxs.includes(i) || (isLivePage(i) && !hasUnpausableMedia(pageHtml(i))));
            // LRU eviction (removal never moves the remaining iframes)
            while (next.length > POOL_MAX) {
                const evictable = next.filter(i => !activeIdxs.includes(i));
                if (!evictable.length) break;
                const oldest = evictable.reduce((a, b) => ((lastUsedRef.current.get(a) || 0) <= (lastUsedRef.current.get(b) || 0) ? a : b));
                next = next.filter(i => i !== oldest);
            }
            return next.length === prev.length && next.every((v, k) => v === prev[k]) ? prev : next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSig, pages]);

    /* ── Readiness: a live page is revealed only after load + fonts, keyed by its document ── */
    const [readyDocs, setReadyDocs] = useState(() => new Map()); // idx -> srcDoc that finished loading
    const handleFrameLoad = useCallback((iframeEl, idx, doc) => {
        let done = false;
        const reveal = () => {
            if (done) return;
            done = true;
            afterNextFrame(() => {
                setReadyDocs(prev => {
                    if (prev.get(idx) === doc) return prev;
                    const next = new Map(prev);
                    next.set(idx, doc);
                    return next;
                });
            });
        };
        try {
            const fontsReady = iframeEl?.contentDocument?.fonts?.ready;
            if (fontsReady) fontsReady.then(reveal, reveal);
            else reveal();
        } catch (_) { reveal(); }
        setTimeout(reveal, REVEAL_TIMEOUT_MS);
    }, []);

    // Forget readiness for evicted pages so a remount stays hidden until it reloads
    useEffect(() => {
        setReadyDocs(prev => {
            let changed = false;
            const next = new Map();
            prev.forEach((v, k) => { if (renderIdxs.includes(k)) next.set(k, v); else changed = true; });
            return changed ? next : prev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renderIdxs.join(',')]);


    const setupIframeForwarding = useCallback((iframeEl) => {
        try {
            const doc = iframeEl?.contentDocument;
            if (!doc) return;
            initGifRunner(doc);

            const interactiveSelector = 'a, button, [data-interaction], [data-type="map"], [data-type="video"], [data-type="audio"], [data-type="embed-frame"], [data-type="slideshow"], [data-type="form"], video, audio, input, select, textarea, .interactive, .fbe-interactive, [data-is-hotspot], .swiper, .swiper-button-prev, .swiper-button-next, .swiper-pagination, .swiper-pagination-bullet, [data-is-slideshow="true"], .slideshow-foreign-object, .map-root-container, .map-card-overlay, .map-stage, foreignObject[data-type="map"], iframe';

            const forwardMouseEvent = (ev, type) => {
                const docWidth = doc.documentElement?.clientWidth || window.innerWidth || 800;
                const docHeight = doc.documentElement?.clientHeight || window.innerHeight || 600;
                const isCornerZone = (
                    (ev.clientX <= 120 || ev.clientX >= docWidth - 120) &&
                    (ev.clientY <= 120 || ev.clientY >= docHeight - 120)
                );

                const isInteractiveEl = ev.target && ev.target.closest && ev.target.closest(interactiveSelector);
                if (isInteractiveEl && !isCornerZone) {
                    return;
                }

                // Optimization: If mouse is moving passively outside corners without dragging, avoid layout reflows
                if (type === 'mousemove' && !isCornerZone && ev.buttons === 0) {
                    return;
                }
                const iframeRect = iframeEl.getBoundingClientRect();
                const clientX = ev.clientX + iframeRect.left;
                const clientY = ev.clientY + iframeRect.top;
                const pageX = clientX + (window.pageXOffset || window.scrollX || 0);
                const pageY = clientY + (window.pageYOffset || window.scrollY || 0);

                const syntheticEv = new MouseEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX,
                    clientY,
                    screenX: ev.screenX,
                    screenY: ev.screenY,
                    button: ev.button,
                    buttons: ev.buttons
                });
                Object.defineProperty(syntheticEv, 'pageX', { value: pageX, configurable: true });
                Object.defineProperty(syntheticEv, 'pageY', { value: pageY, configurable: true });

                if (type === 'mousedown') {
                    if (bookEl?.current) {
                        bookEl.current.dispatchEvent(syntheticEv);
                    }
                } else {
                    document.dispatchEvent(syntheticEv);
                }
            };

            doc.addEventListener('mousemove', (ev) => forwardMouseEvent(ev, 'mousemove'));
            doc.addEventListener('mousedown', (ev) => forwardMouseEvent(ev, 'mousedown'));
            doc.addEventListener('mouseup', (ev) => forwardMouseEvent(ev, 'mouseup'));
            doc.addEventListener('mouseleave', () => {
                const syntheticEv = new MouseEvent('mousemove', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: -9999,
                    clientY: -9999,
                    screenX: -9999,
                    screenY: -9999
                });
                Object.defineProperty(syntheticEv, 'pageX', { value: -9999, configurable: true });
                Object.defineProperty(syntheticEv, 'pageY', { value: -9999, configurable: true });
                document.dispatchEvent(syntheticEv);
            });

            doc.addEventListener('click', (ev) => {
                const docWidth = doc.documentElement?.clientWidth || window.innerWidth || 800;
                const docHeight = doc.documentElement?.clientHeight || window.innerHeight || 600;
                const isCornerZone = (
                    (ev.clientX <= 120 || ev.clientX >= docWidth - 120) &&
                    (ev.clientY <= 120 || ev.clientY >= docHeight - 120)
                );
                if (isCornerZone || !ev.target.closest(interactiveSelector)) {
                    const rect = doc.documentElement.getBoundingClientRect();
                    if (ev.clientX > rect.width * 0.75) flipNextRef.current?.();
                    else if (ev.clientX < rect.width * 0.25) flipPrevRef.current?.();
                }
            });
        } catch (err) { }
    }, [bookEl]);
    const builderFn = buildPageDocRef?.current || defaultBuildPageDoc;

    // Pages whose live iframe (and its spine shadow) is currently visible
    const shownIdxs = activeIdxs.filter(idx => readyDocs.get(idx) === getCachedPageDoc(builderFn, pageHtml(idx), idx + 1));
    const shownSig = shownIdxs.join(',');

    /* ── Freeze live pages during a peel / turn ──────────────────────────────────────────
     * At the instant a peel or turn starts (called synchronously by the engine), every visible
     * live page is paused exactly where it is — audio time, video time, slideshow slide, CSS
     * animations — and, where Element.moveBefore exists, the live iframe itself is moved into
     * its Turn.js page so the curling paper shows that frozen state (not the static snapshot).
     * When the book is at rest again it moves back to its overlay slot and resumes playing.
     * Pages that end up off-screen stay paused until they are shown again. */
    const shownIdxsRef = useRef([]);
    shownIdxsRef.current = shownIdxs;
    const frozenRef = useRef(false);
    const borrowedRef = useRef(new Map()); // idx -> { iframe, slot }
    const canMoveLive = typeof Element !== 'undefined' && typeof Element.prototype.moveBefore === 'function';

    const pauseDoc = useCallback((doc) => {
        if (!doc) return;
        try {
            // Audio players are `new Audio()` objects kept on their frame element (not in the DOM)
            doc.querySelectorAll('[data-type="audio-frame"], g[id^="audio-"]').forEach(f => {
                const a = f._audioInstance;
                if (a && !a.paused) { a.pause(); a.__fbeResume = true; }
            });
            doc.querySelectorAll('video, audio').forEach(m => {
                if (!m.paused) { m.pause(); m.__fbeResume = true; }
            });
            doc.querySelectorAll('.swiper, .flipibook-swiper-container').forEach(c => {
                const sw = c.swiper;
                if (sw && sw.autoplay && sw.autoplay.running) { sw.autoplay.stop(); c.__fbeResumeAutoplay = true; }
            });
            if (!doc.getElementById('fbe-freeze-style')) {
                const st = doc.createElement('style');
                st.id = 'fbe-freeze-style';
                st.textContent = '*, *::before, *::after { animation-play-state: paused !important; }';
                (doc.head || doc.documentElement).appendChild(st);
            }
        } catch (_) { }
    }, []);

    const resumeDoc = useCallback((doc) => {
        if (!doc) return;
        try {
            doc.getElementById('fbe-freeze-style')?.remove();
            doc.querySelectorAll('[data-type="audio-frame"], g[id^="audio-"]').forEach(f => {
                const a = f._audioInstance;
                if (a && a.__fbeResume) { a.__fbeResume = false; const p = a.play(); if (p && p.catch) p.catch(() => { }); }
            });
            doc.querySelectorAll('video, audio').forEach(m => {
                if (m.__fbeResume) { m.__fbeResume = false; const p = m.play(); if (p && p.catch) p.catch(() => { }); }
            });
            doc.querySelectorAll('.swiper, .flipibook-swiper-container').forEach(c => {
                if (c.__fbeResumeAutoplay) { c.__fbeResumeAutoplay = false; try { c.swiper?.autoplay?.start(); } catch (_) { } }
            });
        } catch (_) { }
    }, []);

    const freeze = useCallback(() => {
        const book = bookEl?.current;
        // The overlay is about to hide: hand the spine shadow back to the Turn.js pages NOW
        // (synchronously), not on the next React commit — otherwise a frame shows no seam at all.
        if (book) { book.removeAttribute('data-live-left'); book.removeAttribute('data-live-right'); }
        if (frozenRef.current) return;
        frozenRef.current = true;
        shownIdxsRef.current.forEach(idx => {
            const iframe = iframeElsRef.current.get(idx);
            if (!iframe) return;
            pauseDoc(iframe.contentDocument);
            if (!canMoveLive || !book || !iframe.isConnected) return;
            const inner = book.querySelector(`[data-page-num="${idx + 1}"] .fbe-inner`);
            if (!inner || !inner.isConnected) return;
            const slot = iframe.parentElement;
            try {
                iframe.classList.add('fbe-borrowed-iframe');
                inner.moveBefore(iframe, null);
                borrowedRef.current.set(idx, { iframe, slot });
            } catch (_) {
                iframe.classList.remove('fbe-borrowed-iframe');
            }
        });
    }, [bookEl, pauseDoc, canMoveLive]);

    const returnBorrowed = useCallback(() => {
        borrowedRef.current.forEach(({ iframe, slot }) => {
            iframe.classList.remove('fbe-borrowed-iframe');
            if (slot && slot.isConnected) {
                if (iframe.parentElement !== slot) {
                    try { slot.moveBefore(iframe, slot.firstChild); }
                    catch (_) { slot.insertBefore(iframe, slot.firstChild); }
                }
            } else {
                iframe.remove(); // its slot was evicted meanwhile
            }
        });
        borrowedRef.current.clear();
    }, []);

    // Undo a freeze when the requested turn never started (e.g. "next" on the last page)
    const release = useCallback(() => {
        returnBorrowed();
        frozenRef.current = false;
        shownIdxsRef.current.forEach(idx => resumeDoc(iframeElsRef.current.get(idx)?.contentDocument));
    }, [returnBorrowed, resumeDoc]);

    useEffect(() => {
        if (liveControlRef) liveControlRef.current = { freeze, release };
    }, [liveControlRef, freeze, release]);

    // At rest: bring borrowed iframes home (before paint, same commit the overlay shows), resume
    // the pages on screen, and keep any page that left the spread paused.
    useLayoutEffect(() => {
        renderIdxs.forEach(idx => {
            if (!activeIdxs.includes(idx)) pauseDoc(iframeElsRef.current.get(idx)?.contentDocument);
        });
        if (isTurning) return;
        returnBorrowed();
        frozenRef.current = false;
        activeIdxs.forEach(idx => resumeDoc(iframeElsRef.current.get(idx)?.contentDocument));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTurning, activeSig]);

    // Never leave a live iframe inside the Turn.js DOM on unmount
    useEffect(() => () => returnBorrowed(), [returnBorrowed]);

    // Mark the matching Turn.js pages so their baked-in spine shadow hides (CSS) — avoids a
    // doubled, darker seam at rest. Layout effect → applied in the same frame as the overlay shows.
    // Flags live on the book element itself (per side), so they survive Turn.js page rebuilds.
    useLayoutEffect(() => {
        const book = bookEl?.current;
        if (!book) return;
        // Only while the overlay is really visible (React state), never just because classes are gone
        const shown = (!isTurning && shownSig) ? shownSig.split(',').map(Number) : [];
        // Page side matches the Turn.js page class: even index → fbe-page--right, odd → fbe-page--left
        book.toggleAttribute('data-live-left', shown.some(i => i % 2 === 1));
        book.toggleAttribute('data-live-right', shown.some(i => i % 2 === 0));
    }, [shownSig, bookEl, ready, isTurning]);

    if (!ready) return null;

    // Same seam shadow as the one baked into the Turn.js page underneath; drawn above the live
    // iframe (which is opaque) only once that iframe is visible, so the swap is pixel-identical.
    const renderSpineShadow = (pageIdx) => {
        const type = getSpineShadowType(pageIdx, pages);
        if (!type) return null;
        const spine = SPINE_SHADOWS[type];
        return (
            <div
                className="fbe-overlay-spine-shadow"
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    [SPINE_SHADOW_EDGE[type]]: 0,
                    width: spine.width,
                    background: spine.background,
                    pointerEvents: 'none',
                    zIndex: 15
                }}
            />
        );
    };

    return (
        <div
            className="fbe-active-spread-overlay"
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 110,
                width: singlePage ? width : width * 2,
                height,
                opacity: isTurning ? 0 : 1,
                visibility: isTurning ? 'hidden' : 'visible',
                pointerEvents: (isTurning || !anyInteractive) ? 'none' : 'auto',
                transition: 'none'
            }}
        >
            {renderIdxs.map((idx) => {
                if (!pages[idx] || pages[idx].isPad) return null;
                const isActive = activeIdxs.includes(idx);
                // Fixed slot per page: in double mode odd indexes are left pages, even are right
                const isLeftSlot = !singlePage && idx % 2 === 1;
                const doc = getCachedPageDoc(builderFn, pageHtml(idx), idx + 1);
                const isShown = isActive && readyDocs.get(idx) === doc;
                return (
                    <div
                        key={`live-page-${idx}`}
                        className="fbe-live-page-slot"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: isLeftSlot || singlePage ? 0 : width,
                            width,
                            height,
                            overflow: 'hidden',
                            // 'inherit' (not 'visible'/'auto'): while the overlay is hidden during a
                            // peel/turn, the active slot must stay hidden too, or its invisible box
                            // swallows the mousedown meant for the Turn.js corner.
                            visibility: isActive ? 'inherit' : 'hidden',
                            pointerEvents: isActive ? 'inherit' : 'none',
                            borderRadius: isLeftSlot ? `${cornerRadius} 0 0 ${cornerRadius}` : `0 ${cornerRadius} ${cornerRadius} 0`
                        }}
                    >
                        <iframe
                            ref={(el) => { if (el) iframeElsRef.current.set(idx, el); else iframeElsRef.current.delete(idx); }}
                            title={`Page ${idx + 1}`}
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                            srcDoc={doc}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                outline: 'none',
                                pointerEvents: 'auto',
                                background: 'transparent',
                                opacity: isShown ? 1 : 0,
                                transition: 'none'
                            }}
                            onLoad={(e) => {
                                const el = e.target;
                                if (!el.__fbeForwarded || el.__fbeForwardedDoc !== el.contentDocument) {
                                    el.__fbeForwarded = true;
                                    el.__fbeForwardedDoc = el.contentDocument;
                                    setupIframeForwarding(el);
                                }
                                handleFrameLoad(el, idx, doc);
                            }}
                        />
                        {isShown && renderSpineShadow(idx)}
                    </div>
                );
            })}
        </div>
    );
}
