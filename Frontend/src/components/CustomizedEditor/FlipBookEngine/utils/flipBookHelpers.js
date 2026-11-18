import { rewriteHtmlUploads } from '../../../../utils/assetUtils';

/* ─────────────────────────────── helpers ─────────────────────────────── */

export const extractPageTexture = (rawContent, pageNum = '') => {
    if (!rawContent || typeof rawContent !== 'string') return null;
    let res = null;
    const trimmed = rawContent.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/') || trimmed.startsWith('/uploads/') || trimmed.startsWith('/storage/') || trimmed.startsWith('storage/') || trimmed.startsWith('blob:')) {
        res = trimmed;
    } else {
        // 1. Prefer explicit PDF/Document background layer image
        const pdfBgMatch = rawContent.match(/<g\b[^>]*data-type=["']pdf-vector-layer["'][^>]*>[\s\S]*?<image\b[^>]*(?:href|xlink:href)=["']([^"']+)["']/i);
        if (pdfBgMatch && pdfBgMatch[1]) {
            res = pdfBgMatch[1];
        } else {
            // Guard: If the SVG contains other visual components (<text>, <path>, <foreignObject>),
            // do not mistake an inner clip-art or child photo for the full-page texture!
            const hasOtherGraphics = /<text\b|<foreignObject\b|<path\b/i.test(rawContent);
            const match = rawContent.match(/<image\b[^>]*(?:href|xlink:href)=["']([^"']+)["']/i);
            if (match && match[1] && !hasOtherGraphics) {
                res = match[1];
            } else {
                const imgMatch = rawContent.match(/<img\b[^>]*src=["']([^"']+)["']/i);
                if (imgMatch && imgMatch[1] && !hasOtherGraphics) res = imgMatch[1];
            }
        }
    }
    return res;
};

export const staticHtmlCache = new Map();

export const staticVideoBg = '<div class="video-static-backdrop" style="position: absolute; inset: 0; width: 100%; height: 100%; background: #0f172a; display: flex; align-items: center; justify-content: center; overflow: hidden;"><svg width="44" height="44" viewBox="0 0 24 24" fill="#ffffff" style="opacity: 0.9; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>';

export const cleanStaticHtml = (html) => {
    if (!html) return '';
    if (staticHtmlCache.has(html)) return staticHtmlCache.get(html);
    try {
        // Ultra-fast regex cleaning without allocating heavy DOMParser documents
        let cleaned = html
            // Keep real Google Map iframe intact with pointer-events: none during peel/turn and orange loading spinner
            .replace(/(<div\b[^>]*class=["'][^"']*map-stage[^"']*["'][^>]*>)\s*(<iframe\b[^>]*>[\s\S]*?<\/iframe>)/gi, (match, p1, p2) => {
                let safeIframe = p2;
                if (!safeIframe.includes('fbe-map-iframe')) {
                    safeIframe = safeIframe.replace('<iframe', '<iframe class="fbe-map-iframe"');
                }
                safeIframe = safeIframe.replace(/style=["']([^"']*)["']/i, (sMatch, styleVal) => {
                    return `style="${styleVal}; visibility: visible !important; opacity: 1 !important;"`;
                });
                if (!safeIframe.includes('style=')) {
                    safeIframe = safeIframe.replace('<iframe', '<iframe style="visibility: visible !important; opacity: 1 !important;"');
                }
                if (!safeIframe.includes('onload=')) {
                    safeIframe = safeIframe.replace('<iframe', '<iframe onload="const s=this.previousElementSibling; if(s && s.classList.contains(\'map-loading-spinner\')) s.remove();"');
                }
                return `${p1}
                    <div class="map-loading-spinner" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(244,243,240,0.85); z-index: 2; pointer-events: none; transition: opacity 0.2s ease;">
                        <div class="fbe-spinner" style="width: 28px; height: 28px; border: 2.5px solid rgba(234,114,51,0.2); border-top-color: #ea7233; border-radius: 50%; animation: fbe-spin 0.7s linear infinite;"></div>
                    </div>
                    ${safeIframe}`;
            })
            // Keep real 3rd-Party Embed iframe intact with pointer-events: none during peel/turn and orange loading spinner (no dummy SVG globe)
            .replace(/(<div\b[^>]*class=["'][^"']*embed-root-container[^"']*["'][^>]*>)\s*(<iframe\b[^>]*>[\s\S]*?<\/iframe>)/gi, (match, p1, p2) => {
                let safeIframe = p2;
                if (!safeIframe.includes('fbe-embed-iframe')) {
                    safeIframe = safeIframe.replace('<iframe', '<iframe class="fbe-embed-iframe"');
                }
                safeIframe = safeIframe.replace(/style=["']([^"']*)["']/i, (sMatch, styleVal) => {
                    return `style="${styleVal}; visibility: visible !important; opacity: 1 !important;"`;
                });
                if (!safeIframe.includes('style=')) {
                    safeIframe = safeIframe.replace('<iframe', '<iframe style="visibility: visible !important; opacity: 1 !important;"');
                }
                if (!safeIframe.includes('onload=')) {
                    safeIframe = safeIframe.replace('<iframe', '<iframe onload="const s=this.previousElementSibling; if(s && s.classList.contains(\'embed-loading-spinner\')) s.remove();"');
                }
                return `${p1}
                    <div class="embed-loading-spinner" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(248,250,252,0.85); z-index: 2; pointer-events: none; transition: opacity 0.2s ease;">
                        <div class="fbe-spinner" style="width: 28px; height: 28px; border: 2.5px solid rgba(234,114,51,0.2); border-top-color: #ea7233; border-radius: 50%; animation: fbe-spin 0.7s linear infinite;"></div>
                    </div>
                    ${safeIframe}`;
            })
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, staticVideoBg)
            .replace(/<iframe\b(?![^>]*class=["'][^"']*(?:fbe-map-iframe|fbe-embed-iframe)[^"']*["'])[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

        // Ensure root SVG scales to 100% width and height
        cleaned = cleaned.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
            let updatedAttrs = attrs;
            if (!/viewBox=/i.test(updatedAttrs)) {
                const wMatch = updatedAttrs.match(/width=["']?(\d+(?:\.\d+)?)(?:px)?["']?/i);
                const hMatch = updatedAttrs.match(/height=["']?(\d+(?:\.\d+)?)(?:px)?["']?/i);
                if (wMatch && hMatch) {
                    updatedAttrs += ` viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`;
                }
            }
            updatedAttrs = updatedAttrs.replace(/\bwidth=["'][^"']*["']/i, 'width="100%"');
            updatedAttrs = updatedAttrs.replace(/\bheight=["'][^"']*["']/i, 'height="100%"');
            if (!/width="100%"/.test(updatedAttrs)) updatedAttrs += ' width="100%"';
            if (!/height="100%"/.test(updatedAttrs)) updatedAttrs += ' height="100%"';
            return `<svg ${updatedAttrs}>`;
        });

        if (staticHtmlCache.size > 200) staticHtmlCache.clear();
        staticHtmlCache.set(html, cleaned);
        return cleaned;
    } catch (e) {
        return html;
    }
};

export const sanitizePageHtmlForPreview = (html) => {
    if (!html) return '';
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const rootSvg = doc.querySelector('svg');
        if (rootSvg) {
            const w = rootSvg.getAttribute('width');
            const h = rootSvg.getAttribute('height');
            const vb = rootSvg.getAttribute('viewBox');
            if (!vb && w && h && !w.includes('%') && !h.includes('%')) {
                const nw = parseFloat(w);
                const nh = parseFloat(h);
                if (!isNaN(nw) && !isNaN(nh)) {
                    rootSvg.setAttribute('viewBox', `0 0 ${nw} ${nh}`);
                }
            }
            rootSvg.setAttribute('width', '100%');
            rootSvg.setAttribute('height', '100%');
        }

        doc.querySelectorAll('iframe').forEach(iframe => {
            const fo = iframe.closest('foreignObject');
            const isMap = (fo && fo.getAttribute('data-type') === 'map') || iframe.closest('g[data-type="map"]') || iframe.closest('.map-root-container');
            const hideControls = (fo && fo.getAttribute('data-show-controls') === 'false') || iframe.getAttribute('data-show-controls') === 'false';

            const currentStyle = iframe.getAttribute('style') || '';
            if (currentStyle) {
                const cleanedStyle = currentStyle.replace(/pointer-events\s*:\s*(?:auto|none)\s*(?:!important)?\s*;?/gi, '');
                iframe.setAttribute('style', cleanedStyle + (cleanedStyle.endsWith(';') || !cleanedStyle ? '' : ';') + ' pointer-events: auto !important;');
            }

            const src = iframe.getAttribute('src') || '';
            if (hideControls && (src.includes('youtube.com') || src.includes('youtu.be'))) {
                try {
                    const url = new URL(src);
                    url.searchParams.set('controls', '0');
                    iframe.setAttribute('src', url.toString());
                } catch (e) {
                    iframe.setAttribute('src', src.includes('controls=') ? src.replace(/controls=[^&"']+/i, 'controls=0') : `${src}${src.includes('?') ? '&' : '?'}controls=0`);
                }
            }

            iframe.setAttribute('allowfullscreen', 'true');
            const allow = iframe.getAttribute('allow') || '';
            if (!allow) {
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
            } else if (!allow.includes('fullscreen')) {
                iframe.setAttribute('allow', `${allow}; fullscreen`);
            }
        });

        return doc.body.innerHTML || html;
    } catch (e) {
        return html;
    }
};

export const buildPageDoc = (rawHtml, pageNum) => `<!DOCTYPE html>
<html>
<head>
<style>
  html, body {
    margin:0; padding:0; overflow:hidden; background:transparent; width:100%; height:100%;
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;
  }
  body > svg {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    shape-rendering: geometricPrecision !important;
  }
  * { box-sizing: border-box; outline: none !important; }

  /* Ensure text inside contentEditable boxes and scrollable features wrap correctly */
  .text-edit-box,
  [contenteditable="true"],
  [data-scrollable="true"],
  foreignObject:not([data-type="map"]) div:not(.map-root-container):not(.map-card-overlay):not(.map-card-overlay *) {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
  }

  .map-nowrap,
  [data-nowrap="true"],
  .map-card-overlay .map-nowrap {
    white-space: nowrap !important;
    word-break: normal !important;
    overflow-wrap: normal !important;
  }

  foreignObject:not([data-type="map"]):not([data-type="embed-frame"]) {
    overflow: visible !important;
    clip-path: none !important;
  }

  foreignObject:not([data-type="map"]):not([data-type="embed-frame"]) * {
    clip-path: none !important;
  }

  foreignObject[data-type="map"],
  g[data-type="map"] foreignObject,
  .map-root-container {
    overflow: hidden !important;
  }

  .map-root-container,
  .embed-root-container,
  .table-card-wrapper,
  .table-container {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    position: relative !important;
    box-sizing: border-box !important;
  }

  .map-stage {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    overflow: hidden !important;
    pointer-events: auto !important;
  }

  .map-stage iframe,
  .map-root-container iframe {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    pointer-events: auto !important;
  }

  /* Prevent transparent editor selection overlay rect from blocking clicks on the live map in preview */
  g[data-type="map"] > rect,
  g[id^="map-"] > rect {
    pointer-events: none !important;
    display: none !important;
  }

  .map-open-maps-btn,
  .map-action-btn-circle,
  .map-card-overlay,
  .map-sheet-btn,
  .map-sheet-link-btn {
    pointer-events: auto !important;
  }

  foreignObject video {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    border: none !important;
    outline: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    pointer-events: auto !important;
  }
  foreignObject iframe {
    display: block !important;
    border: none !important;
    outline: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    pointer-events: auto !important;
    transform-origin: 0 0 !important;
  }

  foreignObject[data-type="video"] {
    overflow: hidden !important;
    pointer-events: auto !important;
  }

  foreignObject[data-type="video"] * {
    pointer-events: auto !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar,
  [data-scrollable="true"]::-webkit-scrollbar,
  [data-scrollable="true"] *::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
    background: transparent !important;
    display: block !important;
    -webkit-appearance: none !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar-track,
  [data-scrollable="true"]::-webkit-scrollbar-track,
  [data-scrollable="true"] *::-webkit-scrollbar-track {
    background: #E5E7EB !important;
    border-radius: 10px !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar-thumb,
  [data-scrollable="true"]::-webkit-scrollbar-thumb,
  [data-scrollable="true"] *::-webkit-scrollbar-thumb {
    background: #4B5563 !important;
    border-radius: 10px !important;
    border: none !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar-thumb:hover,
  [data-scrollable="true"]::-webkit-scrollbar-thumb:hover,
  [data-scrollable="true"] *::-webkit-scrollbar-thumb:hover {
    background: #374151 !important;
  }

  .flipbook-text-scrollbar::-webkit-scrollbar-thumb:active,
  [data-scrollable="true"]::-webkit-scrollbar-thumb:active,
  [data-scrollable="true"] *::-webkit-scrollbar-thumb:active {
    background: #1F2937 !important;
  }

  foreignObject[data-sizing-mode="fixed"]>div {
    display: block !important;
  }

  foreignObject[data-scrollable="true"]>div {
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    box-sizing: border-box !important;
    pointer-events: auto !important;
    -webkit-user-select: text !important;
    user-select: text !important;
  }

  foreignObject[data-scrollable="true"] * {
    -webkit-user-select: text !important;
    user-select: text !important;
    pointer-events: auto !important;
  }
</style>
</head>
<body>${rewriteHtmlUploads(sanitizePageHtmlForPreview(rawHtml || ''))}</body>
</html>`;

export const scriptPromises = {};

export const loadScript = (src) => {
    if (scriptPromises[src]) {
        return scriptPromises[src];
    }

    scriptPromises[src] = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => {
            delete scriptPromises[src];
            reject(new Error(`Failed to load ${src}`));
        };
        document.head.appendChild(s);
    });

    return scriptPromises[src];
};

export const pageDocCache = new Map();

export const getCachedPageDoc = (builder, html, pageNum) => {
    if (!html) return '';
    const fn = builder || buildPageDoc;
    const cacheKey = `${pageNum}:${html.length}:${html.slice(0, 40)}`;
    if (pageDocCache.has(cacheKey)) {
        return pageDocCache.get(cacheKey);
    }
    const doc = fn(html, pageNum);
    if (pageDocCache.size > 200) pageDocCache.clear();
    pageDocCache.set(cacheKey, doc);
    return doc;
};

export const checkTurnReady = ($book) => {
    if (!$book || !$book.length) return false;
    try {
        const d = $book.data();
        if (d && (d.totalPages || d.done)) return true;
        return Boolean($book.turn('pages'));
    } catch (_) {
        return false;
    }
};
