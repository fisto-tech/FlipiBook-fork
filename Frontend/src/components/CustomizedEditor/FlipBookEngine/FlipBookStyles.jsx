import React from 'react';
import { SPINE_SHADOWS } from './utils/flipBookHelpers';

/**
 * FlipBookStyles
 * Centralized styles for Turn.js and React-PageFlip engines.
 */
export default function FlipBookStyles({ cornerRadius = '0px' }) {
    return (
        <style>{`
            .fbe-is-dragging iframe, .fbe-is-turning iframe, .fbe-is-flipping iframe {
                pointer-events: none !important;
            }
            .fbe-is-turning .flipbook-magazine-wrapper,
            .fbe-is-flipping .flipbook-magazine-wrapper,
            .fbe-is-dragging .flipbook-magazine-wrapper {
                transition: none !important;
            }
            .fbe-is-flipping .fbe-active-spread-overlay,
            .fbe-is-turning .fbe-active-spread-overlay {
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                transition: none !important;
            }
            .fbe-is-flipping .fbe-corner-hotspot {
                pointer-events: none !important;
            }
            .fbe-is-flipping .fbe-texture-overlay,
            .fbe-is-flipping .fbe-clone-underlay {
                filter: none !important;
            }
            .fbe-static-bg {
                backface-visibility: hidden;
            }
            /* A live page iframe temporarily moved into its Turn.js page during a peel/turn
               (frozen at its current slide / audio time). Visible, but never takes the mouse. */
            .fbe-borrowed-iframe {
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: none !important;
                z-index: 5 !important;
            }
            /* One spine shadow at a time: while a live overlay page (with its own identical shadow)
               is shown over a Turn.js page, hide the page's baked-in copy. During any peel/turn the
               overlay is hidden and these selectors stop matching in the same frame. */
            .fbe-wrapper:not(.fbe-is-turning):not(.fbe-is-flipping):not(.fbe-is-dragging) .fbe-book[data-live-left]:not(.fbe-is-turning):not(.fbe-is-flipping):not(.fbe-is-dragging) .fbe-page--left .fbe-inner::before,
            .fbe-wrapper:not(.fbe-is-turning):not(.fbe-is-flipping):not(.fbe-is-dragging) .fbe-book[data-live-left]:not(.fbe-is-turning):not(.fbe-is-flipping):not(.fbe-is-dragging) .fbe-page--left .fbe-inner::after,
            .fbe-wrapper:not(.fbe-is-turning):not(.fbe-is-flipping):not(.fbe-is-dragging) .fbe-book[data-live-right]:not(.fbe-is-turning):not(.fbe-is-flipping):not(.fbe-is-dragging) .fbe-page--right .fbe-inner::before,
            .fbe-wrapper:not(.fbe-is-turning):not(.fbe-is-flipping):not(.fbe-is-dragging) .fbe-book[data-live-right]:not(.fbe-is-turning):not(.fbe-is-flipping):not(.fbe-is-dragging) .fbe-page--right .fbe-inner::after {
                visibility: hidden;
            }
            @keyframes fbe-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .fbe-spinner {
                width: 28px;
                height: 28px;
                border: 2.5px solid rgba(234,114,51,0.2);
                border-top-color: #ea7233;
                border-radius: 50%;
                animation: fbe-spin 0.7s linear infinite;
            }

            .fbe-wrapper, .fbe-wrapper * {
                outline: none !important;
                user-select: none !important;
                -webkit-user-select: none !important;
                -webkit-user-drag: none !important;
            }

            .fbe-page, .page {
                background: #fff;
                overflow: hidden;
                margin: 0;
                padding: 0;
                -webkit-box-shadow: none !important;
                -moz-box-shadow: none !important;
                box-shadow: none !important;
                border: none !important;
                outline: none !important;
            }

            .fbe-book .shadow,
            #flipbook .shadow,
            .turn-page .shadow,
            .shadow.turn-shadow {
                display: none !important;
                box-shadow: none !important;
            }

            .fbe-inner {
                width: 100%;
                height: 100%;
                overflow: hidden;
                background: #fff;
                margin: 0;
                padding: 0;
                box-shadow: none !important;
                border: none !important;
                writing-mode: horizontal-tb !important;
            }

            .turn-page {
                background-color: #fff;
                box-shadow: none !important;
                border: none !important;
                outline: none !important;
                transform-style: flat !important;
            }

            .turn-page-wrapper {
                background-color: transparent !important;
                box-shadow: none !important;
                border: none !important;
                outline: none !important;
                transform-style: flat !important;
            }

            /* React-pageflip specific classes */
            .fbe-react-page {
                width: 100%;
                height: 100%;
                overflow: hidden !important;
                transition: border-radius 0.5s ease;
            }

            .fbe-react-page--left, .fbe-page--left {
                border-radius: ${cornerRadius} 0 0 ${cornerRadius} !important;
            }

            .fbe-react-page--right, .fbe-page--right {
                border-radius: 0 ${cornerRadius} ${cornerRadius} 0 !important;
            }

            .fbe-page--left .fbe-inner::after,
            .fbe-react-page--left .fbe-inner::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                right: 0;
                width: ${SPINE_SHADOWS.left.width}px;
                background: ${SPINE_SHADOWS.left.background};
                pointer-events: none;
                z-index: 15;
            }

            .fbe-page--right .fbe-inner::after,
            .fbe-react-page--right .fbe-inner::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                width: ${SPINE_SHADOWS.right.width}px;
                background: ${SPINE_SHADOWS.right.background};
                pointer-events: none;
                z-index: 15;
            }

            /* Realistic spine binding shadows on front cover and back cover */
            .fbe-page--first .fbe-inner::before,
            .fbe-react-page--first .fbe-inner::before,
            .p1 .fbe-inner::before {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                width: ${SPINE_SHADOWS.cover.width}px;
                background: ${SPINE_SHADOWS.cover.background};
                pointer-events: none;
                z-index: 15;
                border-top-left-radius: inherit;
                border-bottom-left-radius: inherit;
            }

            .fbe-page--last .fbe-inner::before,
            .fbe-react-page--last .fbe-inner::before {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                right: 0;
                width: ${SPINE_SHADOWS.backCover.width}px;
                background: ${SPINE_SHADOWS.backCover.background};
                pointer-events: none;
                z-index: 15;
                border-top-right-radius: inherit;
                border-bottom-right-radius: inherit;
            }

            .fbe-page--first .fbe-inner::after,
            .fbe-page--last .fbe-inner::after,
            .fbe-react-page--first .fbe-inner::after,
            .fbe-react-page--last .fbe-inner::after {
                display: none !important;
            }

            .fbe-react-page--left::after, .fbe-page--left::after {
                display: none !important;
            }

            .fbe-react-page--right::after, .fbe-page--right::after {
                display: none !important;
            }

            .fbe-wrapper[data-single-page="true"][data-mobile-shadow="left"] .fbe-react-page,
            .fbe-wrapper[data-single-page="true"][data-mobile-shadow="left"] .fbe-page {
                border-radius: 0 ${cornerRadius} ${cornerRadius} 0 !important;
            }
            .fbe-wrapper[data-single-page="true"][data-mobile-shadow="left"] .fbe-react-page::after,
            .fbe-wrapper[data-single-page="true"][data-mobile-shadow="left"] .fbe-page::after {
                left: 0 !important;
                right: auto !important;
                background: linear-gradient(to left, transparent 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.4) 100%) !important;
            }

            .fbe-wrapper[data-single-page="true"][data-mobile-shadow="right"] .fbe-react-page,
            .fbe-wrapper[data-single-page="true"][data-mobile-shadow="right"] .fbe-page {
                border-radius: ${cornerRadius} 0 0 ${cornerRadius} !important;
            }
            .fbe-wrapper[data-single-page="true"][data-mobile-shadow="right"] .fbe-react-page::after,
            .fbe-wrapper[data-single-page="true"][data-mobile-shadow="right"] .fbe-page::after {
                right: 0 !important;
                left: auto !important;
                background: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.4) 100%) !important;
            }

            .fbe-page--first::after, .fbe-page--last::after {
                width: 40px !important;
            }

            /* Reset global cursor pointer applied by flipbook engines and their descendants */
            .stf__wrapper, .stf__block {
                background: transparent !important;
            }
            .stf__wrapper, .stf__wrapper *, 
            .stf__block, .stf__block *, 
            .turn-page-wrapper, .turn-page-wrapper *, 
            .turn-page, .turn-page *, 
            .fbe-wrapper, .fbe-wrapper *, 
            .fbe-react-page, .fbe-react-page *,
            .fbe-book, .fbe-book * {
                cursor: default;
            }

            .fbe-book {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            
            /* Hand cursor for turn.js pages and drag overlays */
            .fbe-drag-overlay,
            .fbe-corner-hotspot {
                cursor: grab !important;
                pointer-events: auto !important;
            }
            .fbe-drag-overlay:active,
            .fbe-corner-hotspot:active {
                cursor: grabbing !important;
            }
            .turn-page-wrapper, .turn-page {
                cursor: default;
            }
            
            /* While flipping, dragging, or turning, hide background raw iframes to avoid 3D stalls,
               while keeping the real map iframe (.fbe-map-iframe) and 3rd-party embed iframe (.fbe-embed-iframe)
               visible with pointer-events: none so turn/drag interactions are buttery smooth! */
            .fbe-is-turning iframe:not(.fbe-map-iframe):not(.fbe-embed-iframe):not(.fbe-borrowed-iframe),
            .fbe-is-dragging iframe:not(.fbe-map-iframe):not(.fbe-embed-iframe):not(.fbe-borrowed-iframe),
            .fbe-is-flipping iframe:not(.fbe-map-iframe):not(.fbe-embed-iframe):not(.fbe-borrowed-iframe),
            .fbe-is-turning .fbe-active-spread-overlay,
            .fbe-is-dragging .fbe-active-spread-overlay,
            .fbe-is-flipping .fbe-active-spread-overlay,
            .fbe-wrapper.fbe-is-turning .fbe-active-spread-overlay,
            .fbe-wrapper.fbe-is-dragging .fbe-active-spread-overlay,
            .fbe-wrapper.fbe-is-flipping .fbe-active-spread-overlay,
            .fbe-wrapper.fbe-is-turning iframe:not(.fbe-map-iframe):not(.fbe-embed-iframe):not(.fbe-borrowed-iframe),
            .fbe-wrapper.fbe-is-dragging iframe:not(.fbe-map-iframe):not(.fbe-embed-iframe):not(.fbe-borrowed-iframe),
            .fbe-wrapper.fbe-is-flipping iframe:not(.fbe-map-iframe):not(.fbe-embed-iframe):not(.fbe-borrowed-iframe),
            .fbe-book.fbe-is-turning iframe:not(.fbe-map-iframe):not(.fbe-embed-iframe):not(.fbe-borrowed-iframe),
            .fbe-book.fbe-is-dragging iframe:not(.fbe-map-iframe):not(.fbe-embed-iframe):not(.fbe-borrowed-iframe),
            .fbe-book.fbe-is-flipping iframe:not(.fbe-map-iframe):not(.fbe-embed-iframe):not(.fbe-borrowed-iframe) {
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                transition: none !important;
            }

            /* While book is resting, allow interactive clicks/drags directly on persistent map and embed iframes */
            .fbe-wrapper:not(.fbe-is-turning):not(.fbe-is-dragging):not(.fbe-is-flipping) .fbe-map-iframe,
            .fbe-book:not(.fbe-is-turning):not(.fbe-is-dragging):not(.fbe-is-flipping) .fbe-map-iframe,
            .turn-page:not(.turning) .fbe-map-iframe,
            .fbe-wrapper:not(.fbe-is-turning):not(.fbe-is-dragging):not(.fbe-is-flipping) .fbe-embed-iframe,
            .fbe-book:not(.fbe-is-turning):not(.fbe-is-dragging):not(.fbe-is-flipping) .fbe-embed-iframe,
            .turn-page:not(.turning) .fbe-embed-iframe {
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            /* While flipping, dragging, or turning, freeze pointer events on map/embed so page drag gestures work */
            .fbe-is-turning .fbe-map-iframe,
            .fbe-is-dragging .fbe-map-iframe,
            .fbe-is-flipping .fbe-map-iframe,
            .fbe-wrapper.fbe-is-turning .fbe-map-iframe,
            .fbe-wrapper.fbe-is-dragging .fbe-map-iframe,
            .fbe-wrapper.fbe-is-flipping .fbe-map-iframe,
            .fbe-book.fbe-is-turning .fbe-map-iframe,
            .fbe-book.fbe-is-dragging .fbe-map-iframe,
            .fbe-book.fbe-is-flipping .fbe-map-iframe,
            .fbe-is-turning .fbe-embed-iframe,
            .fbe-is-dragging .fbe-embed-iframe,
            .fbe-is-flipping .fbe-embed-iframe,
            .fbe-wrapper.fbe-is-turning .fbe-embed-iframe,
            .fbe-wrapper.fbe-is-dragging .fbe-embed-iframe,
            .fbe-wrapper.fbe-is-flipping .fbe-embed-iframe,
            .fbe-book.fbe-is-turning .fbe-embed-iframe,
            .fbe-book.fbe-is-dragging .fbe-embed-iframe,
            .fbe-book.fbe-is-flipping .fbe-embed-iframe {
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: none !important;
            }

            /* If an active spread overlay ever mounts, keep duplicate map/embed invisible so live persistent page elements show */
            .fbe-active-spread-overlay .map-stage iframe,
            .fbe-active-spread-overlay .embed-root-container iframe,
            .fbe-active-spread-overlay .fbe-map-iframe,
            .fbe-active-spread-overlay .fbe-embed-iframe {
                opacity: 0 !important;
                pointer-events: none !important;
            }

            /* Prevent editor selection overlay rect from blocking clicks on live map or embed */
            g[data-type="map"] > rect,
            g[id^="map-"] > rect,
            g[data-type="embed-frame"] > rect,
            g[id^="embed-"] > rect {
                pointer-events: none !important;
                display: none !important;
            }

            /* Add a global invisible shield over the entire wrapper during a drag to guarantee mousemove tracking */
            .fbe-wrapper.fbe-is-dragging::after,
            .fbe-book.fbe-is-dragging::after {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
                cursor: grabbing !important;
                pointer-events: none;
            }
        `}</style>
    );
}
