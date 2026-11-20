import React, { useRef, useState, useEffect, memo } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';
import { flipbookApi } from '../../api/flipbookApi';
import { resolveUploadsPath, getAssetBaseUrl } from '../../utils/assets/assetUtils';
import { sanitizeSvgXml } from '../../utils/pageEditor/editorUtils';
import { TemplatePreview, COVER_TEMPLATES } from '../FlipbookInfoModal';

// Global font cache across all preview cards to prevent duplicate Google Fonts requests
const globallyRequestedFonts = new Set();

function LazyPreviewComponent({
    v_id,
    emailId,
    backendUrl,
    iframeBaseUrl,
    title,
    imageUrl,
    coverPicture = null,
    pages = [],
    firstPageFileName = 'Page 1.svg',
    firstPageContent = null,
}) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [html, setHtml] = useState(() => {
        if (firstPageContent && typeof firstPageContent === 'string' && firstPageContent.includes('<svg')) {
            return { content: firstPageContent, fontImports: '' };
        }
        return null;
    });
    const [templatePagesMap, setTemplatePagesMap] = useState({});
    const [fetchedBaseUrl, setFetchedBaseUrl] = useState('');
    const [loaded, setLoaded] = useState(Boolean(firstPageContent));
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };
        updateWidth();
        const ro = new ResizeObserver(() => updateWidth());
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const resolvedCoverTemplate = coverPicture?.type === 'template'
        ? (typeof coverPicture.selectedTemplate === 'object' && coverPicture.selectedTemplate
            ? coverPicture.selectedTemplate
            : COVER_TEMPLATES.find(t => t.id === Number(coverPicture.selectedTemplate || coverPicture.templateId)) || COVER_TEMPLATES[0])
        : null;

    const mergedCoverPicture = coverPicture?.type === 'template' ? {
        ...coverPicture,
        selectedTemplate: resolvedCoverTemplate
    } : coverPicture;

    useEffect(() => {
        if (firstPageContent && typeof firstPageContent === 'string' && firstPageContent.includes('<svg')) {
            setHtml({ content: firstPageContent, fontImports: '' });
            setLoaded(true);
        } else {
            setHtml(null);
            setLoaded(false);
        }
    }, [v_id, firstPageContent]);

    useEffect(() => {
        if (!v_id || loaded || html) return;

        let isMounted = true;
        const abortController = new AbortController();

        const loadPreview = async () => {
            if (fetching) return;
            setFetching(true);

            try {
                // 1. Primary: fetch preview HTML/SVG from flipbookApi
                const targetPages = coverPicture?.type === 'template' && Array.isArray(coverPicture.selectedPages) && coverPicture.selectedPages.length > 0
                    ? coverPicture.selectedPages.filter(Boolean)
                    : [coverPicture?.selectedPages?.[0] || 1];

                const pageFetchPromises = targetPages.map(p =>
                    flipbookApi.getPreview(v_id, emailId, p, abortController.signal)
                        .then(res => ({ pageNum: p, res }))
                        .catch(() => null)
                );

                const results = await Promise.all(pageFetchPromises);
                if (!isMounted) return;

                const newPagesMap = {};
                let primaryHtml = null;

                for (const item of results) {
                    if (!item || !item.res) continue;
                    const res = item.res;
                    if (res.data?.book && !fetchedBaseUrl) {
                        const b = res.data.book;
                        const uFolder = b.userID || b.userFolder || b.userId || emailId?.replace(/[@.]/g, '_');
                        const fName = b.folderName || 'default';
                        const bName = b.realName || b.flipbookName || b.title || title;
                        if (uFolder && bName) {
                            setFetchedBaseUrl(getAssetBaseUrl(uFolder, fName, bName));
                        }
                    }
                    if (res.data?.html && typeof res.data.html === 'string' && res.data.html.trim().length > 0) {
                        newPagesMap[item.pageNum] = res.data.html;
                        if (!primaryHtml) {
                            primaryHtml = res.data.html;
                        }
                    }
                }

                if (Object.keys(newPagesMap).length > 0) {
                    setTemplatePagesMap(prev => ({ ...prev, ...newPagesMap }));
                }

                if (primaryHtml) {
                    const fontsToLoad = new Set();
                    const cssRegex = /font-family\s*:\s*(?:['"]([^'"]+)['"]|([^;}'"\s]+))/g;
                    const attrRegex = /font-family\s*=\s*['"]([^'"]+)['"]/g;
                    let match;
                    while ((match = cssRegex.exec(primaryHtml)) !== null) {
                        let f = match[1] || match[2];
                        if (f) f = f.split(',')[0].replace(/['"]/g, '').trim();
                        if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) {
                            fontsToLoad.add(f);
                        }
                    }
                    while ((match = attrRegex.exec(primaryHtml)) !== null) {
                        let f = match[1].split(',')[0].replace(/['"]/g, '').trim();
                        if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) {
                            fontsToLoad.add(f);
                        }
                    }

                    const newFonts = Array.from(fontsToLoad).filter(f => !globallyRequestedFonts.has(f));
                    newFonts.forEach(f => globallyRequestedFonts.add(f));

                    let fontImports = '';
                    if (fontsToLoad.size > 0) {
                        const fontList = Array.from(fontsToLoad).map(f => f.replace(/\s+/g, '+')).join('|');
                        fontImports = `<link href="https://fonts.googleapis.com/css?family=${fontList}:300,400,500,600,700,800,900&display=swap" rel="stylesheet">`;
                    }

                    setHtml({ content: primaryHtml, fontImports });
                    setLoaded(true);
                    return;
                }
            } catch (err) {
                if (axios.isCancel(err)) return;
            }

            // 2. Secondary fallback: directly fetch first-page SVG file from static storage
            if (iframeBaseUrl && isMounted) {
                const cleanBase = iframeBaseUrl.endsWith('/') ? iframeBaseUrl : `${iframeBaseUrl}/`;
                const candidates = [
                    `${cleanBase}pages/${firstPageFileName || 'Page 1.svg'}`,
                    `${cleanBase}pages/1.svg`,
                    `${cleanBase}pages/Page 1.svg`,
                    `${cleanBase}${firstPageFileName || 'Page 1.svg'}`,
                    `${cleanBase}1.svg`
                ];

                for (const candUrl of new Set(candidates)) {
                    if (!isMounted) return;
                    try {
                        const staticRes = await axios.get(candUrl, { signal: abortController.signal, timeout: 5000 });
                        if (typeof staticRes.data === 'string' && staticRes.data.includes('<svg')) {
                            setHtml({ content: staticRes.data, fontImports: '' });
                            setLoaded(true);
                            return;
                        }
                    } catch (e) {
                        if (axios.isCancel(e)) return;
                    }
                }
            }

            if (isMounted) {
                setLoaded(true);
            }
        };

        // Trigger load immediately without waiting for intersection delays
        loadPreview().finally(() => {
            if (isMounted) setFetching(false);
        });

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [v_id, loaded, html, emailId, iframeBaseUrl, firstPageFileName]);

    const isLoading = !loaded || fetching;

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gray-100">
            {/* Skeleton shimmer — visible while loading */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200/80 overflow-hidden z-10">
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'skeletonShimmer 1.5s infinite ease-in-out',
                        }}
                    />
                    <style>{`
                        @keyframes skeletonShimmer {
                            0% { background-position: -200% 0; }
                            100% { background-position: 200% 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* Custom Cover Picture (Template or Uploaded Image) */}
            {coverPicture ? (
                coverPicture.type === 'template' ? (() => {
                    const baseWidthPx = (typeof window !== 'undefined' ? window.innerWidth : 1200) * 0.24;
                    const scaleFactor = containerWidth && baseWidthPx ? containerWidth / baseWidthPx : 1;
                    // Build effective pages list matching requested slots
                    let resolvedTemplatePages = pages && pages.length > 0 && pages[0]?.html ? [...pages] : [];
                    if (resolvedTemplatePages.length === 0 && Object.keys(templatePagesMap).length > 0) {
                        const maxPageNum = Math.max(...Object.keys(templatePagesMap).map(Number), 1);
                        resolvedTemplatePages = Array.from({ length: maxPageNum }, (_, idx) => {
                            const pNum = idx + 1;
                            const pageSvg = templatePagesMap[pNum] || (pNum === 1 ? html?.content : null) || '';
                            return {
                                pageNumber: pNum,
                                html: pageSvg,
                                content: pageSvg
                            };
                        });
                    } else if (resolvedTemplatePages.length === 0 && html?.content) {
                        const targetPageNum = Number(coverPicture?.selectedPages?.[0] || 1);
                        resolvedTemplatePages = Array.from({ length: Math.max(targetPageNum, 1) }, (_, idx) => {
                            const pNum = idx + 1;
                            const isMatch = pNum === targetPageNum;
                            return {
                                pageNumber: pNum,
                                html: isMatch ? html.content : '',
                                content: isMatch ? html.content : ''
                            };
                        });
                    }

                    return (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none">
                            <div
                                style={{
                                    width: '24vw',
                                    height: '18vw',
                                    transform: `scale(${scaleFactor})`,
                                    transformOrigin: 'center center',
                                    flexShrink: 0
                                }}
                            >
                                <TemplatePreview
                                    {...mergedCoverPicture}
                                    pages={resolvedTemplatePages}
                                />
                            </div>
                        </div>
                    );
                })() : (coverPicture.url || coverPicture.type === 'upload') ? (
                    <img
                        src={coverPicture.url}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : null
            ) : html ? (() => {
                let processedContent = sanitizeSvgXml(html.content || '');
                const cleanBaseUrl = (iframeBaseUrl || fetchedBaseUrl || '').trim();
                let effectiveBaseHref = cleanBaseUrl;
                if (cleanBaseUrl) {
                    const bookBaseUrl = cleanBaseUrl.endsWith('/') ? cleanBaseUrl : `${cleanBaseUrl}/`;
                    effectiveBaseHref = `${bookBaseUrl}pages/`;
                    const assetsBaseUrl = `${bookBaseUrl}assets/`;
                    processedContent = processedContent.replace(
                        /(\b(?:href|xlink:href|src)=["'])(?:\.\.\/|\.\/)*assets\/([^"']+)["']/gi,
                        (match, prefix, path) => `${prefix}${assetsBaseUrl}${path}"`
                    );
                }

                const backend = (backendUrl || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_BACKEND_URL : '') || '').trim().replace(/\/+$/, '');
                if (backend) {
                    processedContent = processedContent.replace(
                        /(\b(?:href|xlink:href|src)=["'])\/(storage|uploads)\/([^"']+)["']/gi,
                        `$1${backend}/$2/$3"`
                    );
                }

                // Self-healing: if SVG contains an expired/unreachable blob: URL from an older session, replace with server-side page asset
                if (processedContent.includes('href="blob:') || processedContent.includes("href='blob:") || processedContent.includes('src="blob:') || processedContent.includes("src='blob:")) {
                    const fallbackPageAsset = `${effectiveBaseHref}1.webp`;
                    processedContent = processedContent.replace(
                        /(\b(?:href|xlink:href|src)=["'])blob:[^"']+["']/gi,
                        `$1${fallbackPageAsset}"`
                    );
                }

                // Normalize vector-effect so strokes scale down proportionally with the thumbnail viewBox
                processedContent = processedContent
                    .replace(/\bvector-effect\s*=\s*["']non-scaling-stroke["']/gi, 'vector-effect="none"')
                    .replace(/\bvectorEffect\s*=\s*["']non-scaling-stroke["']/gi, 'vectorEffect="none"')
                    .replace(/vector-effect\s*:\s*non-scaling-stroke\s*;?/gi, 'vector-effect: none;');

                if (processedContent.includes('preserveAspectRatio')) {
                    processedContent = processedContent.replace(/preserveAspectRatio=["'][^"']*["']/i, 'preserveAspectRatio="xMidYMid meet"');
                } else {
                    processedContent = processedContent.replace(/<svg\b/i, '<svg preserveAspectRatio="xMidYMid meet" ');
                }
                if (!processedContent.includes('viewBox')) {
                    const wMatch = processedContent.match(/width=["'](\d+(?:\.\d+)?)/i);
                    const hMatch = processedContent.match(/height=["'](\d+(?:\.\d+)?)/i);
                    if (wMatch && hMatch) {
                        processedContent = processedContent.replace(/<svg\b/i, `<svg viewBox="0 0 ${wMatch[1]} ${hMatch[1]}" `);
                    }
                }

                return (
                    <iframe
                        title={`Preview of ${title}`}
                        className="w-full h-full border-none pointer-events-none select-none"
                        sandbox="allow-same-origin allow-scripts"
                        srcDoc={`<!DOCTYPE html><html><head>${html.fontImports || ''}<base href="${effectiveBaseHref}"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f3f4f6;}svg{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;display:block;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.12));}svg,svg *{vector-effect:none !important;}[data-name="Free Frame"]{stroke:transparent !important;fill:transparent !important;}</style></head><body>${processedContent}</body></html>`}
                    />
                );
            })() : loaded && imageUrl ? (
                <img src={resolveUploadsPath(imageUrl)} alt={title} className="w-full h-full object-contain" />
            ) : loaded && !html ? (
                <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full">
                    <BookOpen size="1.8vw" strokeWidth={1.5} />
                    <span className="text-[0.7vw] mt-1 font-semibold">No Preview</span>
                </div>
            ) : null}
        </div>
    );
}

export const LazyPreview = memo(LazyPreviewComponent);
export default LazyPreview;
