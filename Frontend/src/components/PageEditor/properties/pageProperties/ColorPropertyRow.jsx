import React from 'react';
import { createPortal } from 'react-dom';
import ColorPicker from '../../../Color';
import { handleScrubHelper } from '../FillStrokeProperties';

const ColorPropertyRow = ({
  label,
  swatchBackground,
  hexValue,
  isGradient = false,
  opacity,
  isPickerOpen,
  onTogglePicker,
  onClosePicker,
  onHexChange,
  onColorChange,
  onOpacityChange,
  pickerColor,
  colorsOnPage,
  disableGradient = false,
  title
}) => {
  const opacityPct = Math.round(opacity * 100);

  return (
    <div className="flex flex-col gap-[0.35vw]">
      <span className="text-[0.82vw] font-medium text-gray-800">{label}</span>
      <div className="flex items-center gap-[0.6vw]">
        <button
          type="button"
          onClick={onTogglePicker}
          className="w-[3.6vw] h-[2vw] rounded-[0.4vw] border border-gray-300 shadow-2xs cursor-pointer flex-shrink-0 relative overflow-hidden transition-transform hover:scale-105"
          style={{ background: swatchBackground }}
          title={title}
        />
        <div className="flex-1 h-[2vw] rounded-[0.4vw] border border-gray-300 bg-white flex items-center justify-between px-[0.7vw] hover:border-gray-400 transition-colors">
          {isGradient ? (
            <span
              onClick={onTogglePicker}
              className="text-[0.8vw] font-medium text-gray-700 cursor-pointer flex-1 truncate"
            >
              Gradient
            </span>
          ) : (
            <input
              type="text"
              value={hexValue}
              onChange={onHexChange}
              className="text-[0.8vw] font-mono font-medium text-gray-800 outline-none bg-transparent w-[5.5vw] uppercase"
              maxLength={7}
            />
          )}
          <div
            className="flex items-center cursor-ew-resize select-none px-[0.2vw] hover:bg-gray-50 rounded"
            onPointerDown={(e) => {
              handleScrubHelper(e, opacityPct, (val) => {
                const num = parseInt(val, 10);
                const clamped = Math.min(Math.max(num, 0), 100);
                onOpacityChange(clamped / 100);
              });
            }}
            title="Drag horizontally to adjust opacity"
          >
            <span className="text-[0.8vw] font-medium text-gray-700">{opacityPct}%</span>
          </div>
        </div>
      </div>

      {isPickerOpen && createPortal(
        <div
          className="fixed z-[5000]"
          style={{
            top: '50%',
            right: '25vw',
            transform: 'translateY(-50%)'
          }}
        >
          <div className="animate-in fade-in zoom-in-95 duration-200 relative">
            <ColorPicker
              color={pickerColor}
              colorsOnPage={colorsOnPage}
              disableGradient={disableGradient}
              onChange={onColorChange}
              opacity={opacityPct}
              onOpacityChange={(newOp) => onOpacityChange(newOp / 100)}
              onClose={onClosePicker}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ColorPropertyRow;
