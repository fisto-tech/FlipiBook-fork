export const getInteractionScript = (pageNumber) => `  <style>
    [data-type="qrcode"],
    [data-type="qrcode"] *,
    [data-qr-url],
    [data-qr-url] * {
      cursor: default !important;
    }
    [data-interaction="link"],
    [data-interaction="open-link"],
    [data-interaction="navigate-to"],
    [data-interaction="download"],
    [data-interaction="zoom"],
    [data-interaction="popup"],
    [data-interaction="tooltip"],
    [data-interaction="info-box"],
    [data-interaction="call"],
    [data-interaction="whatsapp"],
    [data-interaction="email"],
    [data-interaction="audio"],
    [data-interaction="3d-viewer"] {
      cursor: pointer !important;
    }
  </style>
  <script>
    (function() {
        const init = () => {
            window._pageNumber = ${pageNumber};
            // Walk ancestors from target to find data-interaction (handles SVG bubbling quirks)
            const findInteractionEl = (target) => {
                let el = target;
                while (el && el !== document.body) {
                    if (el.dataset && el.dataset.interaction) return el;
                    // Also check getAttribute for SVG elements where dataset may not work
                    if (el.getAttribute && el.getAttribute('data-interaction')) return el;
                    el = el.parentElement;
                }
                return null;
            };
            let lastInteractionTime = 0;
            const handleStart = (e) => {
                // Native <a> tag support (e.g. Map cards, Embed overlays, Table links)
                const anchorEl = e.target.closest ? e.target.closest('a[href]') : null;
                if (anchorEl && !findInteractionEl(anchorEl)) {
                    const href = anchorEl.getAttribute('href');
                    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                        e.preventDefault();
                        e.stopPropagation();
                        const target = anchorEl.getAttribute('target') || '_blank';
                        if (target === '_top' || target === '_self') {
                            try {
                                window.top.location.href = href;
                            } catch (err) {
                                window.open(href, '_top');
                            }
                        } else {
                            window.open(href, '_blank', 'noopener,noreferrer');
                        }
                        return;
                    }
                }

                // QR Code elements are scan-only: do not redirect on click or hover
                const qrEl = e.target.closest ? e.target.closest('[data-type="qrcode"], [data-qr-url]') : null;
                if (qrEl && !findInteractionEl(qrEl)) {
                    return;
                }

               const el = findInteractionEl(e.target);
               if (el) {
                   e.preventDefault();
                   e.stopPropagation();

                   const now = Date.now();
                   if (now - lastInteractionTime < 300) return;
                   lastInteractionTime = now;
                   
                   const type = el.dataset.interaction || el.getAttribute('data-interaction');
                   const value = el.dataset.interactionValue || el.getAttribute('data-interaction-value');
                   if ((type === 'link' || type === 'open-link') && value) {
                       e.preventDefault();
                       e.stopPropagation();
                       const behavior = el.dataset.interactionLinkBehavior || el.getAttribute('data-interaction-link-behavior') || 'current';
                       const target = behavior === 'new' ? '_blank' : '_top';
                       window.open(value.startsWith('http') ? value : 'https://' + value, target);
                   } else if (type === 'navigate-to' && value) {
                       e.preventDefault();
                       e.stopPropagation();
                       window.parent.postMessage({ type: 'navigate-to-page', page: parseInt(value, 10) }, '*');
                   } else if (type === 'download' && value) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.parent.postMessage({ type: 'download-file', value: value }, '*');
                    } else if (type === 'zoom') {
                        e.preventDefault();
                        e.stopPropagation();
                        // Toggle zoom in/out per element
                        var currentlyZoomed = el.dataset.zoomedIn === 'true';
                        if (currentlyZoomed) {
                            el.dataset.zoomedIn = 'false';
                            window.parent.postMessage({ type: 'zoom-out-element' }, '*');
                        } else {
                            document.querySelectorAll('[data-zoomed-in="true"]').forEach(function(other) {
                                other.dataset.zoomedIn = 'false';
                            });
                            el.dataset.zoomedIn = 'true';
                            var rect = el.getBoundingClientRect();
                            window.parent.postMessage({
                                type: 'zoom-to-element',
                                speed: value || 'Medium',
                                pageNumber: window._pageNumber,
                                rect: {
                                    left: rect.left,
                                    top: rect.top,
                                    width: rect.width,
                                    height: rect.height,
                                    windowWidth: window.innerWidth,
                                    windowHeight: window.innerHeight
                                }
                            }, '*');
                        }
                    } else if (type === 'popup') {
                       e.preventDefault();
                       e.stopPropagation();
                       var customHtml = el.dataset.interactionPopupCustomHtml || el.getAttribute('data-interaction-popup-custom-html');
                       var popupAnim = el.dataset.interactionPopupAnimation || el.getAttribute('data-interaction-popup-animation') || 'Fade In /Out';
                       var popupSpeed = el.dataset.interactionPopupSpeed || el.getAttribute('data-interaction-popup-speed') || 'Medium';
                       if (!customHtml && value) {
                           customHtml = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%"><rect width="100%" height="100%" fill="#ffffff" rx="16" /><text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="#333">Popup Content</text></svg>';
                       }
                       if (customHtml) {
                           window.parent.postMessage({
                               type: 'show-popup-interaction',
                               html: customHtml,
                               templateId: value,
                               animation: popupAnim,
                               speed: popupSpeed
                           }, '*');
                       }
                   }  else if (type === 'slideshow') {
                       e.preventDefault();
                       e.stopPropagation();
                       var effect = el.dataset.interactionSlideshowEffect || el.getAttribute('data-interaction-slideshow-effect') || '3D Flip';
                       var speed = el.dataset.interactionSlideshowSpeed || el.getAttribute('data-interaction-slideshow-speed') || 'Medium';
                       try {
                           var parsedImages = JSON.parse(value);
                           if (parsedImages && parsedImages.length > 0) {
                               window.parent.postMessage({
                                   type: 'show-slideshow-interaction',
                                   images: parsedImages,
                                   effect: effect,
                                   speed: speed,
                                   baseUrl: window.location.href
                               }, '*');
                           }
                       } catch(e) {
                           console.error('Failed to parse slideshow interaction images', e);
                       }
                    }  else if (type === '3d-viewer') {
                        e.preventDefault();
                        e.stopPropagation();
                        let modelUrl = value;
                        let configObj = null;
                        let vId = null;
                        let modelName = '3D Model';
                        let parsedHotspots = [];
                        if (value && value.startsWith('{')) {
                            try {
                                var parsed = JSON.parse(value);
                                modelUrl = parsed.data || parsed.url || value;
                                if (parsed.v_id || parsed.modelId || parsed.sourceModelId) {
                                    vId = parsed.v_id || parsed.modelId || parsed.sourceModelId;
                                }
                                if (Array.isArray(parsed.hotspots)) {
                                    parsedHotspots = parsed.hotspots;
                                }
                                if (parsed.displayName || parsed.name) {
                                    modelName = parsed.displayName || parsed.name;
                                }
                            } catch(e) {}
                        }
                        const configStr = el.dataset.interactionConfig || el.getAttribute('data-interaction-config');
                        if (configStr) {
                            try {
                                configObj = JSON.parse(configStr);
                            } catch(e) {}
                        }
                        if (!configObj) {
                            configObj = {
                                topText: 'You can Rotate 3D Model',
                                bottomText: modelName,
                                shadowStrength: 35,
                                shadowSoftness: 35,
                                autoRotate: true,
                                autoRotateSpeed: 1.5,
                                lockMaxZoom: true,
                                maxZoom: 4.5,
                                bgType: 'Solid',
                                bgColor: '#ffffff',
                                customBg: true,
                                enableAR: true,
                                qrText: 'Scan Me',
                                qrColor: '#000000',
                                qrBgType: 'Solid',
                                qrBgColor: '#ffffff'
                            };
                        } else {
                            if (!configObj.topText) configObj.topText = 'You can Rotate 3D Model';
                            if (!configObj.bottomText) configObj.bottomText = modelName;
                        }
                        window.parent.postMessage({
                            type: 'show-3d-viewer',
                            url: modelUrl,
                            v_id: vId,
                            vId: vId,
                            hotspots: parsedHotspots,
                            config: configObj
                        }, '*');
                    } else if (type === 'audio' && value) {
                       if (el.getAttribute('data-type') === 'audio-frame' || (typeof el.closest === 'function' && el.closest('[data-type="audio-frame"]'))) {
                           return;
                       }
                       e.preventDefault();
                       e.stopPropagation();
                       try {
                           let audioSrc = null;
                           if (typeof value === 'string' && value.startsWith('{')) {
                               const audioData = JSON.parse(value);
                               audioSrc = audioData.data || audioData.url || audioData.src;
                           } else {
                               audioSrc = value;
                           }

                           if (audioSrc) {
                               let targetWin = window;
                               try {
                                   if (window.parent && window.parent.document) targetWin = window.parent;
                               } catch (err) {
                                   targetWin = window;
                               }

                               if (typeof audioSrc === 'string' && (audioSrc.startsWith('/storage/') || audioSrc.startsWith('/uploads/'))) {
                                   try {
                                       if (targetWin && typeof targetWin.resolveUploadsPath === 'function') {
                                           audioSrc = targetWin.resolveUploadsPath(audioSrc);
                                       } else if (!audioSrc.startsWith('http')) {
                                           audioSrc = (targetWin?.location?.origin || '') + audioSrc;
                                       }
                                   } catch (_) {}
                               }

                               if (targetWin._activePreviewAudio && targetWin._activePreviewAudioEl === el) {
                                   if (!targetWin._activePreviewAudio.paused) {
                                       targetWin._activePreviewAudio.pause();
                                       targetWin._activePreviewAudio.currentTime = 0;
                                   } else {
                                       targetWin._activePreviewAudio.play().catch(function(err) { console.error('Audio playback failed', err); });
                                   }
                               } else {
                                   if (targetWin._activePreviewAudio) {
                                       targetWin._activePreviewAudio.pause();
                                       targetWin._activePreviewAudio.currentTime = 0;
                                   }
                                   const audio = new Audio(audioSrc);
                                   targetWin._activePreviewAudio = audio;
                                   targetWin._activePreviewAudioEl = el;

                                   audio.onended = function() {
                                       if (targetWin._activePreviewAudio === audio) {
                                           targetWin._activePreviewAudio = null;
                                           targetWin._activePreviewAudioEl = null;
                                       }
                                   };

                                   audio.play().catch(function(err) { console.error('Audio playback failed', err); });
                               }
                           }
                       } catch(err) {
                           console.error('Failed to parse or play audio interaction', err);
                       }
                    } else if (type === 'whatsapp' && value) {
                        e.preventDefault();
                        e.stopPropagation();
                        const behavior = el.dataset.interactionLinkBehavior || el.getAttribute('data-interaction-link-behavior') || 'current';
                        const target = behavior === 'new' ? '_blank' : '_top';
                        
                        const msg = el.dataset.interactionWhatsappMessage || el.getAttribute('data-interaction-whatsapp-message');
                        let url = 'https://wa.me/' + value.replace(/[^0-9]/g, '');
                        if (msg) {
                            url += '?text=' + encodeURIComponent(msg);
                        }
                        window.open(url, target);
                    } else if (type === 'call' && value) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open('tel:' + value, '_blank');
                    } else if (type === 'email' && value) {
                        e.preventDefault();
                        e.stopPropagation();
                        const behavior = el.dataset.interactionLinkBehavior || el.getAttribute('data-interaction-link-behavior') || 'current';
                        const target = behavior === 'new' ? '_blank' : '_top';
                        window.parent.postMessage({ type: 'open-email', value: value, target: target }, '*');
                    } else if (type === 'info-box') {
                        e.preventDefault();
                        e.stopPropagation();
                        var isShowing = el.dataset.infoBoxShowing === 'true';
                        if (isShowing) {
                            el.dataset.infoBoxShowing = 'false';
                            window.parent.postMessage({ type: 'hide-tooltip' }, '*');
                        } else {
                            document.querySelectorAll('[data-info-box-showing="true"]').forEach(function(other) {
                                other.dataset.infoBoxShowing = 'false';
                            });
                            el.dataset.infoBoxShowing = 'true';
                            var rect = el.getBoundingClientRect();
                            var settingsStr = el.getAttribute('data-interaction-value');
                            var settings = null;
                            try { if (settingsStr) settings = JSON.parse(settingsStr); } catch(e){}
                            if (settings) {
                                settings.isInfoBox = true;
                                settings.isWidthAuto = true;
                                settings.isHeightAuto = true;
                                settings.shape = settings.shape || 'bottom-center';
                                if (settings.text && settings.text.length > 15) {
                                    settings.text = settings.text.slice(0, 15);
                                }
                            } else {
                                settings = { isInfoBox: true, isWidthAuto: true, isHeightAuto: true, shape: 'bottom-center' };
                            }
                            var absLeft = rect.left, absTop = rect.top, absW = rect.width, absH = rect.height;
                            try {
                                var iframe = window.frameElement;
                                if (iframe) {
                                    var fr = iframe.getBoundingClientRect();
                                    var sx = fr.width / (window.innerWidth || 1);
                                    var sy = fr.height / (window.innerHeight || 1);
                                    absLeft = fr.left + rect.left * sx;
                                    absTop  = fr.top  + rect.top  * sy;
                                    absW    = rect.width  * sx;
                                    absH    = rect.height * sy;
                                }
                            } catch(err) {}
                            window.parent.postMessage({
                                type: 'show-tooltip',
                                abs: { left: absLeft, top: absTop, width: absW, height: absH },
                                settings: settings,
                                pageNumber: window._pageNumber,
                                elementId: el.id
                            }, '*');
                        }
                    } else if (type === 'tooltip') {
                        const trigger = el.dataset.interactionTrigger || el.getAttribute('data-interaction-trigger') || 'click';
                        if (trigger === 'click') {
                            e.preventDefault();
                            e.stopPropagation();
                            var isShowing = el.dataset.tooltipShowing === 'true';
                            if (isShowing) {
                                el.dataset.tooltipShowing = 'false';
                                window.parent.postMessage({ type: 'hide-tooltip' }, '*');
                            } else {
                                document.querySelectorAll('[data-tooltip-showing="true"]').forEach(function(other) {
                                    other.dataset.tooltipShowing = 'false';
                                });
                                el.dataset.tooltipShowing = 'true';
                                var rect = el.getBoundingClientRect();
                                var settingsStr = el.getAttribute('data-tooltip-settings');
                                var settings = null;
                                try { if (settingsStr) settings = JSON.parse(settingsStr); } catch(e){}
                                var absLeft = rect.left, absTop = rect.top, absW = rect.width, absH = rect.height;
                                try {
                                    var iframe = window.frameElement;
                                    if (iframe) {
                                        var fr = iframe.getBoundingClientRect();
                                        var sx = fr.width / (window.innerWidth || 1);
                                        var sy = fr.height / (window.innerHeight || 1);
                                        absLeft = fr.left + rect.left * sx;
                                        absTop  = fr.top  + rect.top  * sy;
                                        absW    = rect.width  * sx;
                                        absH    = rect.height * sy;
                                    }
                                } catch(err) {}
                                window.parent.postMessage({
                                    type: 'show-tooltip',
                                    abs: { left: absLeft, top: absTop, width: absW, height: absH },
                                    settings: settings,
                                    pageNumber: window._pageNumber,
                                    elementId: el.id
                                }, '*');
                            }
                        }
                    }
                } else {
                    // Forward mousedown to parent for dragging (only for mouse/touch down, not click)
                    if (e.type === 'mousedown' || e.type === 'touchstart') {
                        window._isIframeDragging = true;
                        try {
                        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                        const screenX = e.touches ? e.touches[0].screenX : e.screenX;
                        const screenY = e.touches ? e.touches[0].screenY : e.screenY;
                        window.parent.postMessage({
                            type: 'IFRAME_MOUSEDOWN',
                            originalClientX: clientX,
                            originalClientY: clientY,
                            screenX: screenX,
                            screenY: screenY,
                            pageNumber: window._pageNumber
                        }, '*');
                    } catch (err) {}
               } else if (e.type === 'click') {
                   getBlinkTargets().forEach((interactionEl, n) => playHighlightBlink(interactionEl, n * 150));
               }
                }
            };
           
            document.addEventListener('mousedown', handleStart);
            document.addEventListener('touchstart', handleStart, { passive: true });
            document.addEventListener('click', handleStart);

            const handleMove = (e) => {
                if (!window._isIframeDragging) return;
                try {
                    const screenX = e.touches ? e.touches[0].screenX : e.screenX;
                    const screenY = e.touches ? e.touches[0].screenY : e.screenY;
                    window.parent.postMessage({
                        type: 'IFRAME_MOUSEMOVE',
                        screenX: screenX,
                        screenY: screenY
                    }, '*');
                } catch(err) {}
            };

            const handleEnd = (e) => {
                const el = findInteractionEl(e.target);
                if (el) {
                    e.stopPropagation();
                    return;
                }
                if (!window._isIframeDragging) return;
                window._isIframeDragging = false;
                try {
                    const touch = (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : null;
                    const screenX = touch ? touch.screenX : e.screenX;
                    const screenY = touch ? touch.screenY : e.screenY;
                    window.parent.postMessage({
                        type: 'IFRAME_MOUSEUP',
                        screenX: screenX,
                        screenY: screenY
                    }, '*');
                } catch(err) {}
            };

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('touchmove', handleMove, { passive: true });
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchend', handleEnd);

 
            // Hover logic for tooltips
            const handleHover = (e, isEnter) => {
                const el = findInteractionEl(e.target);
                if (el) {
                    const type = el.dataset.interaction || el.getAttribute('data-interaction');
                    const trigger = el.dataset.interactionTrigger || el.getAttribute('data-interaction-trigger') || 'click';
                    if (type === 'tooltip' && trigger === 'hover') {
                        if (isEnter) {
                             var rect = el.getBoundingClientRect();
                             var settingsStr = el.getAttribute('data-tooltip-settings');
                             var settings = null;
                             try { if (settingsStr) settings = JSON.parse(settingsStr); } catch(e){}
                             var absLeft = rect.left, absTop = rect.top, absW = rect.width, absH = rect.height;
                             try {
                                 var iframe = window.frameElement;
                                 if (iframe) {
                                     var fr = iframe.getBoundingClientRect();
                                     var sx = fr.width / (window.innerWidth || 1);
                                     var sy = fr.height / (window.innerHeight || 1);
                                     absLeft = fr.left + rect.left * sx;
                                     absTop  = fr.top  + rect.top  * sy;
                                     absW    = rect.width  * sx;
                                     absH    = rect.height * sy;
                                 }
                             } catch(err) {}
                             window.parent.postMessage({
                                 type: 'show-tooltip',
                                 abs: { left: absLeft, top: absTop, width: absW, height: absH },
                                 settings: settings,
                                 pageNumber: window._pageNumber,
                                 elementId: el.id
                             }, '*');
                        } else {
                             window.parent.postMessage({ type: 'hide-tooltip' }, '*');
                        }
                    }
                }
            };
            document.addEventListener('mouseover', (e) => {
                if (!document.hasFocus()) window.focus();
                handleHover(e, true);
            });
            document.addEventListener('mouseout', (e) => handleHover(e, false));

            // Elements that get the click-hint + blink:
            //  - every hotspot (always — its highlight flag is locked off in the editor), even with no action yet
            //  - other interactive elements unless their highlight is switched off
            const HOTSPOT_SEL = '[data-is-hotspot="true"], [data-type="hotspot"]';
            function getBlinkTargets() {
                const found = Array.from(document.querySelectorAll('[data-interaction], ' + HOTSPOT_SEL));
                const set = new Set(found);
                return found.filter(el => {
                    // Skip children of another target (one hint per hotspot/interactive group)
                    let p = el.parentElement;
                    while (p) { if (set.has(p)) return false; p = p.parentElement; }
                    if (el.matches(HOTSPOT_SEL)) return true;
                    return el.getAttribute('data-show-highlight') !== 'false';
                });
            }

            // Hand cursor (white with dark outline) used by the "mouse moves in and clicks" hint
            const HINT_CURSOR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74c-3.6-.76-3.54-.75-3.67-.75-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z" fill="#ffffff" stroke="#1f2340" stroke-width="1.1" stroke-linejoin="round"/></svg>';

            // Soft blink box over an interactive element
            function runBlinkOverlay(el, rect) {
                const overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.left = (rect.left + window.scrollX) + 'px';
                overlay.style.top = (rect.top + window.scrollY) + 'px';
                overlay.style.width = rect.width + 'px';
                overlay.style.height = rect.height + 'px';
                overlay.style.backgroundColor = 'rgba(81, 69, 246, 0.18)';
                overlay.style.pointerEvents = 'none';
                overlay.style.zIndex = '999999';
                overlay.style.opacity = '0';
                const isHotspot = el.matches && el.matches(HOTSPOT_SEL);
                const squareish = rect.width > 0 && Math.abs(rect.width - rect.height) / Math.max(rect.width, rect.height) < 0.25;
                overlay.style.borderRadius = (isHotspot && squareish) ? '50%' : (isHotspot ? '10px' : 'inherit');
                document.body.appendChild(overlay);

                const anim = overlay.animate([
                    { opacity: 0 },
                    { opacity: 1, offset: 0.25 },
                    { opacity: 0, offset: 0.5 },
                    { opacity: 1, offset: 0.75 },
                    { opacity: 0, offset: 1 }
                ], { duration: 1200, easing: 'ease-in-out', fill: 'forwards' });
                return new Promise(resolve => {
                    anim.onfinish = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); resolve(); };
                });
            }

            // Animated cursor glides onto the element, presses, ripples — resolves at the click moment
            function runClickHint(rect) {
                const vw = document.documentElement.clientWidth || window.innerWidth;
                const vh = document.documentElement.clientHeight || window.innerHeight;
                const tx = rect.left + rect.width / 2 + window.scrollX;
                const ty = rect.top + rect.height / 2 + window.scrollY;
                // Approach from the lower-right (or the side with room), kept inside the page
                const sx = Math.max(8, Math.min(vw - 30, tx + (tx + 70 < vw ? 60 : -60)));
                const sy = Math.max(8, Math.min(vh - 30, ty + (ty + 70 < vh ? 55 : -55)));

                const cursor = document.createElement('div');
                cursor.innerHTML = HINT_CURSOR_SVG;
                // Hotspot = fingertip (≈ x 11, y 3 of the 26px icon)
                cursor.style.cssText = 'position:absolute;left:0;top:0;width:26px;height:26px;margin-left:-11px;margin-top:-3px;pointer-events:none;z-index:1000000;opacity:0;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35));will-change:transform,opacity;';
                document.body.appendChild(cursor);

                const at = (x, y, s) => 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
                const move = cursor.animate([
                    { transform: at(sx, sy, 1), opacity: 0 },
                    { transform: at(sx, sy, 1), opacity: 1, offset: 0.15 },
                    { transform: at(tx, ty, 1), opacity: 1, offset: 0.7 },
                    { transform: at(tx, ty, 0.82), opacity: 1, offset: 0.82 },   // press
                    { transform: at(tx, ty, 1), opacity: 1, offset: 0.92 },      // release
                    { transform: at(tx, ty, 1), opacity: 1 }
                ], { duration: 900, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });

                return new Promise(resolve => {
                    // Click moment (press offset 0.82 of 900ms) → ripple + start blink
                    setTimeout(() => {
                        const ripple = document.createElement('div');
                        ripple.style.cssText = 'position:absolute;left:' + (tx - 14) + 'px;top:' + (ty - 14) + 'px;width:28px;height:28px;border-radius:50%;border:2px solid rgba(81,69,246,0.55);background:rgba(81,69,246,0.12);pointer-events:none;z-index:999999;';
                        document.body.appendChild(ripple);
                        const r = ripple.animate([
                            { transform: 'scale(0.4)', opacity: 1 },
                            { transform: 'scale(1.9)', opacity: 0 }
                        ], { duration: 550, easing: 'ease-out', fill: 'forwards' });
                        r.onfinish = () => ripple.remove();
                        resolve();
                    }, 740);
                    move.onfinish = () => {
                        const fade = cursor.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, delay: 250, fill: 'forwards' });
                        fade.onfinish = () => cursor.remove();
                    };
                });
            }

            function playHighlightBlink(el, delay) {
                if (el.__isBlinking) return;
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                el.__isBlinking = true;
                const start = () => {
                    const r = el.getBoundingClientRect();
                    runClickHint(r)
                        .then(() => runBlinkOverlay(el, r))
                        .then(() => { el.__isBlinking = false; }, () => { el.__isBlinking = false; });
                };
                if (delay) setTimeout(start, delay); else start();
            };

            window.addEventListener('message', function(e) {
                if (!e.data) return;
                if (e.data.type === 'PAGE_TURNED' || e.data.type === 'BLINK_INTERACTIONS') {
                    if (e.data.type === 'PAGE_TURNED') {
                        const visiblePages = e.data.visiblePages || [];
                        if (!visiblePages.includes(window._pageNumber)) return;
                    }
                    
                    const triggerBlinks = () => {
                        getBlinkTargets().forEach((el, n) => playHighlightBlink(el, n * 150));
                    };

                    if (typeof window._waitForEntranceAnimations === 'function') {
                        window._waitForEntranceAnimations().then(() => {
                            setTimeout(triggerBlinks, 80);
                        });
                    } else {
                        setTimeout(triggerBlinks, 100);
                    }
                }
            });
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    })();
  </script>
`;

;
export default getInteractionScript;
