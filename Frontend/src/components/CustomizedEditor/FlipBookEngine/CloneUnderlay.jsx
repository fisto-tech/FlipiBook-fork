import React from 'react';
import { buildPageDoc as defaultBuildPageDoc } from './utils/flipBookHelpers';

/**
 * CloneUnderlay
 * Renders blur background underlay for transparent sheets.
 */
export default function CloneUnderlay({
    showingTurnJs,
    showingReactFlip,
    singlePage,
    width,
    height,
    hardCoverZoom,
    cloneUnderlay,
    buildPageDoc,
    externalBuildPageDoc
}) {
    const builder = externalBuildPageDoc || buildPageDoc || defaultBuildPageDoc;

    return (
        <div
            className="fbe-clone-underlay"
            style={{
                position: 'absolute',
                zIndex: showingTurnJs ? 2 : 90,
                display: 'flex',
                pointerEvents: 'none',
                width: singlePage ? width : width * 2,
                height,
                visibility: (showingTurnJs || showingReactFlip) ? 'visible' : 'hidden',
                background: 'transparent',
                transform: (showingReactFlip && hardCoverZoom) ? `scale(${hardCoverZoom.scale})` : 'none',
                transformOrigin: '0 0'
            }}
        >
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {cloneUnderlay.left && (
                    <iframe
                        title="Clone Left"
                        frameBorder="0"
                        srcDoc={builder(cloneUnderlay.left.page.html || cloneUnderlay.left.page.content || '', cloneUnderlay.left.index + 1)}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            background: '#fff',
                            filter: `blur(${cloneUnderlay.left.blurPx}px)`
                        }}
                    />
                )}
            </div>
            {!singlePage && (
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    {cloneUnderlay.right && (
                        <iframe
                            title="Clone Right"
                            frameBorder="0"
                            srcDoc={builder(cloneUnderlay.right.page.html || cloneUnderlay.right.page.content || '', cloneUnderlay.right.index + 1)}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                background: '#fff',
                                filter: `blur(${cloneUnderlay.right.blurPx}px)`
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
