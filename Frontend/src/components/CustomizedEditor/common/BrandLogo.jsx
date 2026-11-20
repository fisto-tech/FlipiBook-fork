import React from 'react';
import { Icon } from '@iconify/react';

/**
 * Standard BrandLogo component across all Flipbook layouts.
 * - If a custom logo is uploaded, it renders the logo image (with filters, opacity, crop, url).
 * - If logo is enabled in settings but no custom logo is uploaded, it renders a predefined "YOUR LOGO" placeholder box.
 */
const BrandLogo = ({
    logoSettings,
    settings,
    isTablet = false,
    className = '',
    style = {},
    logoObjectFit = 'contain',
    logoCropStyle = {},
    onClick
}) => {
    // Check if logo is enabled in settings
    const isLogoEnabled = settings?.brandingProfile?.logo !== false;
    if (!isLogoEnabled) return null;

    const hasCustomLogo = Boolean(logoSettings?.src);

    if (hasCustomLogo) {
        const adj = logoSettings?.adjustments || {};
        const exposure = adj.exposure || 0;
        const contrast = adj.contrast || 0;
        const saturation = adj.saturation || 0;
        const temperature = adj.temperature || 0;
        const tint = adj.tint || 0;
        const highlights = (adj.highlights || 0) / 5;
        const shadows = (adj.shadows || 0) / 5;
        const filterStr = `brightness(${100 + exposure}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) hue-rotate(${tint}deg) sepia(${temperature > 0 ? temperature : 0}%) brightness(${100 + highlights}%) contrast(${100 + shadows}%)`;

        const imgStyle = {
            objectFit: logoObjectFit,
            filter: filterStr,
            opacity: (logoSettings?.opacity ?? 100) / 100,
            ...logoCropStyle,
            ...style
        };

        const imgEl = (
            <img
                src={logoSettings.src}
                alt="Brand Logo"
                className={`${className || (isTablet ? 'h-[1.5vw]' : 'h-[2vw]')} w-auto transition-all duration-300`}
                style={imgStyle}
            />
        );

        if (logoSettings?.url) {
            return (
                <a
                    href={logoSettings.url.startsWith('http') ? logoSettings.url : `https://${logoSettings.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-all hover:scale-105"
                    onClick={onClick}
                >
                    {imgEl}
                </a>
            );
        }

        return (
            <div className="inline-flex items-center" onClick={onClick}>
                {imgEl}
            </div>
        );
    }

    // Predefined "YOUR LOGO" Placeholder Box
    return (
        <div
            className={`flex items-center justify-center gap-[0.35vw] px-[0.7vw] py-[0.35vh] rounded-[0.3vw] border border-dashed border-gray-400/50 bg-white/10 select-none transition-all ${className ? '' : (isTablet ? 'h-[1.6vw]' : 'h-[2vw]')}`}
            style={{
                backdropFilter: 'blur(4px)',
                ...style
            }}
            title="Your Logo"
            onClick={onClick}
        >
            <Icon
                icon="lucide:image"
                className={`${isTablet ? 'w-[0.75vw] h-[0.75vw]' : 'w-[0.9vw] h-[0.9vw]'} opacity-70`}
            />
            <span
                className={`${isTablet ? 'text-[0.55vw]' : 'text-[0.68vw]'} font-bold tracking-wider uppercase opacity-85 whitespace-nowrap`}
            >
                YOUR LOGO
            </span>
        </div>
    );
};

export default BrandLogo;
