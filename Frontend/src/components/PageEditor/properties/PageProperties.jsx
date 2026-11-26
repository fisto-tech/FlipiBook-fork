import React, { useState, useEffect, useMemo } from 'react';
import { parseGradient } from '../../Color';
import ColorPropertyRow from './pageProperties/ColorPropertyRow';
import DocumentInfoCard from './pageProperties/DocumentInfoCard';
import {
  getDocumentInfo,
  resolveOverlayElement,
  buildOverlayBackgroundString,
  extractPageColors
} from './pageProperties/pagePropertiesUtils';

export { getDocumentInfo };

const getCanvaSwatchBackground = (canvaColor, canvaOpacity) => {
  if (!canvaColor.startsWith('#')) return canvaColor;
  let hex = canvaColor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${canvaOpacity})`;
};

const PageProperties = ({
  pages,
  overlay,
  activePageIndex,
  updateElementAttribute,
  baseWidth,
  baseHeight
}) => {
  const [isPageColorPickerOpen, setIsPageColorPickerOpen] = useState(false);
  const [isCanvaColorPickerOpen, setIsCanvaColorPickerOpen] = useState(false);

  const [canvaColor, setCanvaColor] = useState(() => {
    return localStorage.getItem('editor_canva_color') || '#E6E7E7';
  });
  const [canvaOpacity, setCanvaOpacity] = useState(() => {
    const saved = localStorage.getItem('editor_canva_opacity');
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [canvaColorHex, setCanvaColorHex] = useState(canvaColor);

  useEffect(() => {
    setCanvaColorHex(canvaColor);
  }, [canvaColor]);

  const effectiveOverlay = resolveOverlayElement(overlay, pages, activePageIndex);
  const currentBg = effectiveOverlay?.getAttribute('fill') || '#FFFFFF';
  const fillType = effectiveOverlay?.getAttribute('fill-type') || 'solid';
  const rawOpacity = effectiveOverlay?.getAttribute('fill-opacity');
  const pageOpacity = rawOpacity !== null && rawOpacity !== undefined ? parseFloat(rawOpacity) : 1;

  const currentBgStr = buildOverlayBackgroundString(effectiveOverlay);
  const isPageGradient = fillType === 'gradient' || currentBgStr.includes('gradient') || currentBg.toLowerCase().includes('url(#');

  const [pageColorHex, setPageColorHex] = useState(currentBg.startsWith('#') ? currentBg : '#FFFFFF');

  useEffect(() => {
    if (currentBg.startsWith('#')) {
      setPageColorHex(currentBg);
    }
  }, [currentBg]);

  const handlePageColorChange = (newVal) => {
    if (newVal.includes('gradient')) {
      const parsed = parseGradient(newVal);
      if (parsed) {
        updateElementAttribute(activePageIndex, 'Overlay', {
          'fill-type': 'gradient',
          'fill-gradient-type': parsed.type.toLowerCase(),
          'fill-stops': JSON.stringify(parsed.stops.map((s) => ({
            color: s.color,
            offset: s.offset,
            opacity: s.opacity / 100
          }))),
          'fill-angle': (parsed.angle || 0).toString(),
          'fill-radius': (parsed.radius || 100).toString(),
          'fill': newVal
        });
      }
    } else {
      updateElementAttribute(activePageIndex, 'Overlay', {
        'fill-type': 'solid',
        'fill': newVal
      });
      if (newVal.startsWith('#')) setPageColorHex(newVal);
    }
  };

  const handlePageOpacityChange = (newOpacity) => {
    updateElementAttribute(activePageIndex, 'Overlay', {
      'fill-opacity': newOpacity.toString()
    });
  };

  const handlePageHexInput = (e) => {
    const val = e.target.value;
    setPageColorHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      handlePageColorChange(val);
    }
  };

  const handleCanvaColorChange = (newColor) => {
    setCanvaColor(newColor);
    setCanvaColorHex(newColor);
    localStorage.setItem('editor_canva_color', newColor);
    window.dispatchEvent(new CustomEvent('editor-canva-color-changed', {
      detail: { color: newColor, opacity: canvaOpacity }
    }));
  };

  const handleCanvaOpacityChange = (newOpacity) => {
    setCanvaOpacity(newOpacity);
    localStorage.setItem('editor_canva_opacity', newOpacity.toString());
    window.dispatchEvent(new CustomEvent('editor-canva-color-changed', {
      detail: { color: canvaColor, opacity: newOpacity }
    }));
  };

  const handleCanvaHexInput = (e) => {
    const val = e.target.value;
    setCanvaColorHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      handleCanvaColorChange(val);
    }
  };

  const info = getDocumentInfo(baseWidth, baseHeight);
  const pageColors = useMemo(() => extractPageColors(pages, activePageIndex), [pages, activePageIndex]);

  return (
    <div className="bg-white px-[1.2vw] pt-[1.1vw] pb-[1.5vw] flex flex-col gap-[1.5vw] flex-1 select-none">
      {/* ── Page Properties Section ── */}
      <div className="flex flex-col gap-[1vw]">
        <div className="flex items-center gap-[0.8vw]">
          <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">Page Properties</span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        <ColorPropertyRow
          label="Page Color"
          swatchBackground={currentBgStr}
          hexValue={pageColorHex}
          isGradient={isPageGradient}
          opacity={pageOpacity}
          isPickerOpen={isPageColorPickerOpen}
          onTogglePicker={() => {
            setIsCanvaColorPickerOpen(false);
            setIsPageColorPickerOpen((prev) => !prev);
          }}
          onClosePicker={() => setIsPageColorPickerOpen(false)}
          onHexChange={handlePageHexInput}
          onColorChange={handlePageColorChange}
          onOpacityChange={handlePageOpacityChange}
          pickerColor={currentBgStr}
          colorsOnPage={pageColors}
          title="Change page color"
        />

        <ColorPropertyRow
          label="Canva Color"
          swatchBackground={getCanvaSwatchBackground(canvaColor, canvaOpacity)}
          hexValue={canvaColorHex}
          isGradient={canvaColor.includes('gradient')}
          opacity={canvaOpacity}
          isPickerOpen={isCanvaColorPickerOpen}
          onTogglePicker={() => {
            setIsPageColorPickerOpen(false);
            setIsCanvaColorPickerOpen((prev) => !prev);
          }}
          onClosePicker={() => setIsCanvaColorPickerOpen(false)}
          onHexChange={handleCanvaHexInput}
          onColorChange={handleCanvaColorChange}
          onOpacityChange={handleCanvaOpacityChange}
          pickerColor={canvaColor}
          colorsOnPage={pageColors}
          disableGradient={true}
          title="Change canva color"
        />
      </div>

      {/* ── Document Info Section ── */}
      <DocumentInfoCard info={info} />
    </div>
  );
};

export default PageProperties;
