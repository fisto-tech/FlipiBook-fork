import React from 'react';

/**
 * Concave (inverted) corner that joins the right sidebar to the white edge strip,
 * drawn as an SVG so the curve is crisp and seamless.
 * position: 'top' (above the sidebar) | 'bottom' (below the sidebar)
 */
const WhiteAttachedCurve = ({ position = 'top', size = '0.9vw', color = '#ffffff', edgeOffset = '0.25vw' }) => {
    const isTop = position === 'top';
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            style={{
                position: 'absolute',
                right: edgeOffset, // meet the inner edge of the 0.25vw white strip
                width: size,
                height: size,
                pointerEvents: 'none',
                display: 'block',
                ...(isTop ? { bottom: '100%' } : { top: '100%' }),
            }}
        >
            <path
                d={isTop ? 'M1 0 L1 1 L0 1 A1 1 0 0 0 1 0 Z' : 'M1 1 L1 0 L0 0 A1 1 0 0 1 1 1 Z'}
                fill={color}
            />
        </svg>
    );
};

export default WhiteAttachedCurve;
