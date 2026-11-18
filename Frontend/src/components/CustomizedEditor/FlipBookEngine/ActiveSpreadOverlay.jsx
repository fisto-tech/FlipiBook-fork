import React, { useCallback } from 'react';
import { initGifRunner } from '../../PageEditor/Animation/AnimationRunner';
import { getCachedPageDoc, buildPageDoc as defaultBuildPageDoc } from './utils/flipBookHelpers';

/**
 * ActiveSpreadOverlay
 * Layer 2 interactive overlay rendering persistent interactive iframes,
 * spine shadows, and forwarding mouse interactions to the underlying flipbook engine.
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
    bookEl
}) {
    const isInteractive = useCallback((rawHtml) => {
        if (!rawHtml || typeof rawHtml !== 'string') return false;
        // Maps and 3rd-Party Embeds are persistent directly inside .turn-page with direct pointer events,
        // so pages with only maps or embeds do NOT mount a redundant overlay iframe!
        const htmlClean = rawHtml.replace(/<foreignObject\b[^>]*data-type=["'](?:map|embed-frame)["'][\s\S]*?<\/foreignObject>/gi, '')
            .replace(/<g\b[^>]*data-type=["'](?:map|embed-frame)["'][\s\S]*?<\/g>/gi, '');
        return /<video|<audio|<iframe|data-type=["'](video|audio|form|link|slideshow)|slideshow|flipibook-swiper|data-interaction|hotspot|class=["'][^"']*interactive|<a\s+href/i.test(htmlClean);
    }, []);

    const hasInteractiveLeft = Boolean(!singlePage && leftIdx !== null && leftIdx >= 0 && pages[leftIdx] && isInteractive(pages[leftIdx].html || pages[leftIdx].content));
    const hasInteractiveRight = Boolean(rightIdx !== null && rightIdx >= 0 && pages[rightIdx] && isInteractive(pages[rightIdx].html || pages[rightIdx].content));
    const anyInteractive = hasInteractiveLeft || hasInteractiveRight;

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
                    if (ev.clientX > rect.width * 0.75) flipNextFn?.();
                    else if (ev.clientX < rect.width * 0.25) flipPrevFn?.();
                }
            });
        } catch (err) { }
    }, [bookEl, flipNextFn, flipPrevFn]);

    if (!ready) return null;

    const builderFn = buildPageDocRef?.current || defaultBuildPageDoc;

    return (
        <div
            className="fbe-active-spread-overlay"
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                zIndex: 110,
                width: singlePage ? width : width * 2,
                height,
                opacity: isTurning ? 0 : 1,
                visibility: isTurning ? 'hidden' : 'visible',
                pointerEvents: (isTurning || !anyInteractive) ? 'none' : 'auto',
                transition: isTurning ? 'none' : 'opacity 0.15s ease-in'
            }}
        >
            {!singlePage && (
                <div
                    style={{
                        position: 'relative',
                        width,
                        height,
                        overflow: 'hidden',
                        pointerEvents: hasInteractiveLeft ? 'auto' : 'none',
                        borderRadius: `${cornerRadius} 0 0 ${cornerRadius}`
                    }}
                >
                    {hasInteractiveLeft && leftIdx !== null && leftIdx >= 0 && leftIdx < pages.length && pages[leftIdx] && !pages[leftIdx].isPad && (
                        <iframe
                            key={`spread-left-${leftIdx}`}
                            title={`Page ${leftIdx + 1}`}
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                            srcDoc={getCachedPageDoc(builderFn, pages[leftIdx].html || pages[leftIdx].content || '', leftIdx + 1)}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                outline: 'none',
                                pointerEvents: 'auto',
                                background: 'transparent',
                                opacity: 1,
                                transition: 'opacity 0.15s ease'
                            }}
                            onLoad={(e) => setupIframeForwarding(e.target)}
                        />
                    )}
                    {/* Spread center spine shadow (left page inner seam) */}
                    {!singlePage && (
                        <div
                            className="fbe-spread-spine-shadow-left"
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                right: 0,
                                width: 24,
                                background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.01) 40%, rgba(0,0,0,0.03) 75%, rgba(0,0,0,0.08) 100%)',
                                pointerEvents: 'none',
                                zIndex: 15
                            }}
                        />
                    )}
                </div>
            )}
            <div
                style={{
                    position: 'relative',
                    width,
                    height,
                    overflow: 'hidden',
                    pointerEvents: hasInteractiveRight ? 'auto' : 'none',
                    borderRadius: `0 ${cornerRadius} ${cornerRadius} 0`
                }}
            >
                {hasInteractiveRight && rightIdx !== null && rightIdx >= 0 && rightIdx < pages.length && pages[rightIdx] && !pages[rightIdx].isPad && (
                    <iframe
                        key={`spread-right-${rightIdx}`}
                        title={`Page ${rightIdx + 1}`}
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        srcDoc={getCachedPageDoc(builderFn, pages[rightIdx].html || pages[rightIdx].content || '', rightIdx + 1)}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            outline: 'none',
                            pointerEvents: 'auto',
                            background: 'transparent',
                            opacity: 1,
                            transition: 'opacity 0.15s ease'
                        }}
                        onLoad={(e) => setupIframeForwarding(e.target)}
                    />
                )}
                {/* Spread center spine shadow (right page inner seam) */}
                {!singlePage && leftIdx !== null && (
                    <div
                        className="fbe-spread-spine-shadow-right"
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: 24,
                            background: 'linear-gradient(to left, transparent 0%, rgba(0,0,0,0.01) 40%, rgba(0,0,0,0.03) 75%, rgba(0,0,0,0.08) 100%)',
                            pointerEvents: 'none',
                            zIndex: 15
                        }}
                    />
                )}
                {rightIdx === 0 && (
                    <div
                        className="fbe-spine-shadow-overlay"
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: 28,
                            background: 'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.02) 60%, transparent 100%)',
                            pointerEvents: 'none',
                            zIndex: 10
                        }}
                    />
                )}
            </div>
        </div>
    );
}
