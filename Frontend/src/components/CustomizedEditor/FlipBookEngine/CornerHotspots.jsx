import React from 'react';

/**
 * CornerHotspots
 * Clickable corner target hotspots for non-Turn.js engines.
 */
export default function CornerHotspots({
    ready,
    singlePage,
    showingTurnJs,
    rightIdx,
    leftIdx,
    pagesCount,
    flipNextFn,
    flipPrevFn
}) {
    if (!ready || singlePage || showingTurnJs) return null;

    return (
        <>
            {/* Top-Right Corner Hotspot */}
            {rightIdx !== null && rightIdx < pagesCount && (
                <div
                    className="fbe-corner-hotspot fbe-corner-tr"
                    style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, zIndex: 125, cursor: 'pointer' }}
                    onClick={flipNextFn}
                />
            )}
            {/* Bottom-Right Corner Hotspot */}
            {rightIdx !== null && rightIdx < pagesCount && (
                <div
                    className="fbe-corner-hotspot fbe-corner-br"
                    style={{ position: 'absolute', bottom: 0, right: 0, width: 80, height: 80, zIndex: 125, cursor: 'pointer' }}
                    onClick={flipNextFn}
                />
            )}
            {/* Top-Left Corner Hotspot */}
            {leftIdx !== null && leftIdx >= 0 && (
                <div
                    className="fbe-corner-hotspot fbe-corner-tl"
                    style={{ position: 'absolute', top: 0, left: 0, width: 80, height: 80, zIndex: 125, cursor: 'pointer' }}
                    onClick={flipPrevFn}
                />
            )}
            {/* Bottom-Left Corner Hotspot */}
            {leftIdx !== null && leftIdx >= 0 && (
                <div
                    className="fbe-corner-hotspot fbe-corner-bl"
                    style={{ position: 'absolute', bottom: 0, left: 0, width: 80, height: 80, zIndex: 125, cursor: 'pointer' }}
                    onClick={flipPrevFn}
                />
            )}
        </>
    );
}
