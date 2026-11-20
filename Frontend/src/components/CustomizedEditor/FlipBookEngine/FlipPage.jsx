import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { getCachedRaster, subscribeRasterCache } from '../../../utils/customizedEditor/pageRasterCache';
import { cleanStaticHtml } from './utils/flipBookHelpers';

const FlipPage = forwardRef(function FlipPage(props, ref) {
    const {
        className,
        style,
        children,
        'data-density': dataDensity,
        'data-page-index': dataPageIndex,
        onMouseDown,
        onMouseUp,
        onClick,
        pageNum,
        html,
        isPad,
        isTransparentSheet,
        textureStyle,
        singlePage,
        directionClass
    } = props;

    const [rasterUrl, setRasterUrl] = useState(() => getCachedRaster(pageNum));

    useEffect(() => {
        if (isPad) return;
        const current = getCachedRaster(pageNum);
        if (current && current !== rasterUrl) {
            setRasterUrl(current);
        }
        const unsubscribe = subscribeRasterCache((key, url) => {
            if (key === pageNum) {
                setRasterUrl(url);
            }
        });
        return unsubscribe;
    }, [pageNum, isPad, rasterUrl]);

    const staticContent = useMemo(() => {
        if (rasterUrl || !html || isPad) return null;
        return cleanStaticHtml(html);
    }, [rasterUrl, html, isPad]);

    return (
        <div
            ref={ref}
            data-density={dataDensity}
            data-page-index={dataPageIndex}
            className={className}
            style={style}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onClick={onClick}
        >
            {!isPad && (
                <>
                    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'inherit' }}>
                        <div
                            className="fbe-static-bg"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                overflow: 'hidden',
                                background: isTransparentSheet ? 'transparent' : '#fff',
                                borderRadius: 'inherit',
                                pointerEvents: 'none'
                            }}
                        >
                            {rasterUrl ? (
                                <img
                                    src={rasterUrl}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                                    alt={`Page ${pageNum}`}
                                />
                            ) : staticContent ? (
                                <div
                                    className="fbe-static-svg"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        pointerEvents: 'none',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: `<style>[data-name="Free Frame"] { stroke: transparent !important; } .fbe-static-svg svg { width: 100% !important; height: 100% !important; display: block !important; }</style>` + staticContent
                                    }}
                                />
                            ) : (
                                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isTransparentSheet ? 'transparent' : '#ffffff' }}>
                                    <div className="fbe-spinner" style={{ width: '28px', height: '28px', border: '2.5px solid rgba(234,114,51,0.2)', borderTopColor: '#ea7233', borderRadius: '50%', animation: 'fbe-spin 0.7s linear infinite' }} />
                                </div>
                            )}
                        </div>
                    </div>
                    {(!isTransparentSheet && textureStyle && (textureStyle.backgroundImage !== 'none' || textureStyle.backgroundColor)) && (
                        <div
                            className="absolute inset-0 z-10 pointer-events-none"
                            style={{
                                ...textureStyle,
                                borderRadius: 'inherit'
                            }}
                        />
                    )}
                    {singlePage ? (
                        <>
                            <div className="fbe-drag-overlay" style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '25px', zIndex: 20, cursor: 'grab', pointerEvents: 'auto' }} />
                            <div className="fbe-drag-overlay" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '25px', zIndex: 20, cursor: 'grab', pointerEvents: 'auto' }} />
                        </>
                    ) : (
                        <div
                            className="fbe-drag-overlay"
                            style={{ position: 'absolute', top: 0, bottom: 0, [directionClass]: 0, width: '25px', zIndex: 20, cursor: 'grab', pointerEvents: 'auto' }}
                        />
                    )}
                </>
            )}
        </div>
    );
});
FlipPage.displayName = 'FlipPage';

export default FlipPage;
