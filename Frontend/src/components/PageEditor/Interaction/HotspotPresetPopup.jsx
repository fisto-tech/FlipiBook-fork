import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { X } from 'lucide-react';

// Import all 18 SVGs from assets
import openLinkSvg from '../../../assets/hotspot preset icon/icons/openlink.svg';
import whatsappSvg from '../../../assets/hotspot preset icon/icons/whatsapp.svg';
import navigationSvg from '../../../assets/hotspot preset icon/icons/Navigation.svg';
import threeDSvg from '../../../assets/hotspot preset icon/icons/3D.svg';
import callSvg from '../../../assets/hotspot preset icon/icons/call.svg';
import emailSvg from '../../../assets/hotspot preset icon/icons/email.svg';
import locationSvg from '../../../assets/hotspot preset icon/icons/location.svg';
import youtubeSvg from '../../../assets/hotspot preset icon/icons/yotube.svg';
import instagramSvg from '../../../assets/hotspot preset icon/icons/instagram.svg';
import xSvg from '../../../assets/hotspot preset icon/icons/X.svg';
import facebookSvg from '../../../assets/hotspot preset icon/icons/facebook.svg';
import linkedinSvg from '../../../assets/hotspot preset icon/icons/linkedin.svg';
import videoSvg from '../../../assets/hotspot preset icon/icons/vedio.svg';
import popupSvg from '../../../assets/hotspot preset icon/icons/popup.svg';
import slideshowSvg from '../../../assets/hotspot preset icon/icons/slideshow.svg';
import zoomSvg from '../../../assets/hotspot preset icon/icons/zoom.svg';
import downloadSvg from '../../../assets/hotspot preset icon/icons/download.svg';
import infoSvg from '../../../assets/hotspot preset icon/icons/info.svg';
import audioSvg from '../../../assets/hotspot preset icon/icons/audio.svg';

export const presets = [
  { id: 'open-link', label: 'Open Link', src: openLinkSvg },
  { id: 'email', label: 'Email', src: emailSvg },
  { id: 'location', label: 'Location', src: locationSvg },
  { id: 'call', label: 'Call', src: callSvg },
  { id: '3d-viewer', label: '3D Viewer', src: threeDSvg },
  { id: 'navigate-to', label: 'Navigate Page', src: navigationSvg },
  { id: 'video', label: 'Video', src: videoSvg },
  { id: 'popup', label: 'Popup', src: popupSvg },
  { id: 'slideshow', label: 'Slideshow', src: slideshowSvg },
  { id: 'zoom', label: 'Zoom', src: zoomSvg },
  { id: 'download', label: 'Download', src: downloadSvg },
  { id: 'audio', label: 'Audio', src: audioSvg },
  { id: 'info-box', label: 'Info Popup', src: infoSvg },
  { id: 'whatsapp', label: 'WhatsApp', src: whatsappSvg },
  { id: 'youtube', label: 'You tube', src: youtubeSvg },
  { id: 'instagram', label: 'Instagram', src: instagramSvg },
  { id: 'x', label: 'X', src: xSvg },
  { id: 'facebook', label: 'Facebook', src: facebookSvg },
  { id: 'linkedin', label: 'Linked in', src: linkedinSvg }
];

const HotspotPresetPopup = ({ onClose, onSelectPreset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const popupRef = useRef(null);

  // Dragging state for popup (matching ColorPicker.jsx movable behavior)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const isDraggingPopup = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, scale: 1 });
  const [isPopupDragging, setIsPopupDragging] = useState(false);

  const handlePopupPointerDown = (e) => {
    // Avoid dragging if the user is interacting with form controls or dragging preset items
    const isInteractive = e.target.closest('button, input, [role="button"], [draggable="true"], .cursor-pointer, .cursor-text, .cursor-grab, .cursor-grabbing');
    if (isInteractive && !e.target.closest('.drag-handle')) return;

    let scale = 1;
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const offsetWidth = popupRef.current.offsetWidth;
      if (offsetWidth > 0) scale = rect.width / offsetWidth;
    }

    isDraggingPopup.current = true;
    setIsPopupDragging(true);

    dragStartRef.current = {
      x: e.clientX - (dragPosition.x * scale),
      y: e.clientY - (dragPosition.y * scale),
      scale
    };

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingPopup.current) return;
      const s = dragStartRef.current.scale;
      const newX = (moveEvent.clientX - dragStartRef.current.x) / s;
      const newY = (moveEvent.clientY - dragStartRef.current.y) / s;
      setDragPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      isDraggingPopup.current = false;
      setIsPopupDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDraggingPopup.current) return;
      // If clicking inside the popup, do nothing
      if (popupRef.current && popupRef.current.contains(event.target)) {
        return;
      }
      
      // Avoid closing if clicking the trigger button itself
      const trigger = document.getElementById('hotspot-trigger-container');
      if (trigger && trigger.contains(event.target)) {
        return;
      }
      
      if (onClose) onClose();
    };

    // Use mousedown to catch it before other elements handle click
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const filteredPresets = presets.filter(p => p.label.toLowerCase().includes(searchTerm.toLowerCase()));
  const socialIds = ['whatsapp', 'youtube', 'instagram', 'x', 'facebook', 'linkedin'];
  const hotspotItems = filteredPresets.filter(p => !socialIds.includes(p.id));
  const socialItems = filteredPresets.filter(p => socialIds.includes(p.id));

  const allButtons = [
    { id: 'btn-blue', color: '#2D8CFF', text: 'Button', rounded: 4, w: 80, h: 32 },
    { id: 'btn-orange', color: '#FF7A00', text: 'Button', rounded: 4, w: 80, h: 32 },
    { id: 'btn-purple-icon', color: '#7B42F6', text: 'Icon', rounded: 4, w: 80, h: 32, icon: true },
    { id: 'btn-yellow-round', color: '#FFD600', text: 'Round Button', rounded: 16, w: 100, h: 32 },
    { id: 'btn-purple-round', color: '#7B42F6', text: 'Button', rounded: 16, w: 80, h: 32 }
  ];
  const buttonItems = allButtons.filter(b => b.text.toLowerCase().includes(searchTerm.toLowerCase()));

  return createPortal(
    <div 
      ref={popupRef}
      className={`fixed right-[14vw] top-1/2 w-[19vw] min-w-[280px] pl-[1.2vw] pt-[1.2vw] pb-[1.2vw] pr-[0.35vw] rounded-[0.8vw] bg-white shadow-[0_1vw_3vw_-0.5vw_rgba(0,0,0,0.2)] border border-gray-300 animate-in fade-in zoom-in-95 duration-200 select-none font-sans pointer-events-auto z-[99999] flex flex-col max-h-[56vh] ${isPopupDragging ? 'cursor-grabbing' : ''}`}
      style={{
        transform: `translate3d(${dragPosition.x}px, calc(-50% + ${dragPosition.y}px), 0)`,
        transition: isPopupDragging ? 'none' : 'transform 0.05s ease-out'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={handlePopupPointerDown}
    >
      {/* Sleek Custom Scrollbar Styling */}
      <style>{`
        .hotspot-custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .hotspot-custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hotspot-custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 9999px;
        }
        .hotspot-custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      {/* Top Header Controls: Search input & Close button */}
      <div className="flex items-center justify-between w-full gap-[0.6vw] mb-[1vw] pr-[0.85vw]">
        <div className="relative flex-1">
          <Icon icon="lucide:search" className="absolute left-[0.6vw] top-1/2 -translate-y-1/2 text-gray-400 text-[0.85vw]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[2.2vw] pl-[1.8vw] pr-[0.6vw] bg-white border border-gray-300 rounded-[0.55vw] text-[0.8vw] font-medium text-gray-700 shadow-2xs hover:border-gray-400 focus:outline-none focus:border-[#EC5137] transition-colors"
          />
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-[0.1vw] rounded-[0.5vw] text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer flex-shrink-0"
            title="Close"
          >
            <X size="1.2vw" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-[1.2vw] overflow-y-auto hotspot-custom-scrollbar pr-[0.4vw] max-h-[44vh]">
        {/* Interactive Hotspot Section */}
        <div>
          <div className="flex items-center gap-[1vw] mb-[1vw]">
            <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Interactive Hotspot</span>
            <div className="h-[0.0925vw] bg-gray-200 flex-1"></div>
          </div>

          {hotspotItems.length === 0 ? (
            <div className="py-[0.8vh] text-center text-[0.75vw] text-gray-400 font-medium bg-gray-50/60 rounded-[0.4vw]">
              No items found
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-y-[0.6vh] gap-x-[0.5vw]">
              {hotspotItems.map((preset) => (
                <div 
                  key={preset.id}
                  className="group flex flex-col items-center cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-[0.5vw] p-[0.35vw] transition-colors"
                  draggable="true"
                  onDragStart={(e) => {
                    const data = {
                      type: 'hotspot',
                      icon: { presetId: preset.id, src: preset.src }
                    };
                    e.dataTransfer.setData('application/json', JSON.stringify(data));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <div className="w-[2.8vw] h-[2.8vw] flex items-center justify-center rounded-full pointer-events-none">
                    <img src={preset.src} alt={preset.label} className="w-full h-full object-contain pointer-events-none" />
                  </div>
                  <span className="text-[0.6vw] text-gray-600 font-medium text-center leading-tight mt-[0.3vh]">
                    {preset.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Social Media Icons Section */}
        <div>
          <div className="flex items-center gap-[1vw] mb-[1vw]">
            <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Social Media Icons</span>
            <div className="h-[0.0925vw] bg-gray-200 flex-1"></div>
          </div>

          {socialItems.length === 0 ? (
            <div className="py-[0.8vh] text-center text-[0.75vw] text-gray-400 font-medium bg-gray-50/60 rounded-[0.4vw]">
              No items found
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-y-[0.6vh] gap-x-[0.5vw]">
              {socialItems.map((preset) => (
                <div 
                  key={preset.id}
                  className="group flex flex-col items-center cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-[0.5vw] p-[0.35vw] transition-colors"
                  draggable="true"
                  onDragStart={(e) => {
                    const data = {
                      type: 'hotspot',
                      icon: { presetId: preset.id, src: preset.src }
                    };
                    e.dataTransfer.setData('application/json', JSON.stringify(data));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <div className="w-[2.8vw] h-[2.8vw] flex items-center justify-center rounded-full pointer-events-none">
                    <img src={preset.src} alt={preset.label} className="w-full h-full object-contain pointer-events-none" />
                  </div>
                  <span className="text-[0.6vw] text-gray-600 font-medium text-center leading-tight mt-[0.3vh]">
                    {preset.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Buttons Section */}
        <div>
          <div className="flex items-center gap-[1vw] mb-[1vw]">
            <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Interactive Buttons</span>
            <div className="h-[0.0925vw] bg-gray-200 flex-1"></div>
          </div>

          {buttonItems.length === 0 ? (
            <div className="py-[0.8vh] text-center text-[0.75vw] text-gray-400 font-medium bg-gray-50/60 rounded-[0.4vw]">
              No items found
            </div>
          ) : (
            <div className="flex flex-wrap gap-[0.5vw]">
              {buttonItems.map((btn) => {
                const handleDragStart = (e) => {
                  let html = `<rect x="0" y="0" width="${btn.w}" height="${btn.h}" rx="${btn.rounded}" fill="${btn.color}" />`;
                  if (btn.icon) {
                    const textWidth = btn.text.length * (14 * 0.55);
                    const contentWidth = 15 + 5 + textWidth;
                    const startX = (btn.w - contentWidth) / 2;
                    const textX = startX + 20 + (textWidth / 2);
                  
                    html += `<g transform="translate(${startX - 20}, 0)">`;
                    html += `<path d="M20 16 L25 21 L35 11" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;
                    html += `</g>`;
                    html += `<text x="${textX}" y="21" fill="#ffffff" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle" data-type="text">${btn.text}</text>`;
                  } else {
                    html += `<text x="${btn.w / 2}" y="21" fill="#ffffff" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle" data-type="text">${btn.text}</text>`;
                  }
                  const data = {
                    type: 'hotspot',
                    icon: { 
                      presetId: 'interactive-button', 
                      html: html,
                      bgColor: btn.color,
                      iconColor: '#ffffff'
                    }
                  };
                  if (e) {
                    e.dataTransfer.setData('application/json', JSON.stringify(data));
                    e.dataTransfer.effectAllowed = 'copy';
                  }
                  return data;
                };

                const handleClick = () => {
                  const data = handleDragStart();
                  window.dispatchEvent(new CustomEvent('add-hotspot-to-editor', {
                    detail: { icon: data.icon }
                  }));
                };

                return (
                  <div 
                    key={btn.id}
                    className={`bg-[${btn.color}] flex items-center justify-center cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity`}
                    style={{ 
                      backgroundColor: btn.color, 
                      borderRadius: btn.rounded === 4 ? '0.4vw' : '9999px',
                      padding: btn.icon ? '0.5vh 0.8vw' : '0.5vh 1vw'
                    }}
                    draggable="true"
                    onDragStart={handleDragStart}
                  >
                    {btn.icon && <Icon icon="lucide:check" className="text-white text-[0.7vw] mr-[0.3vw]" />}
                    <span className="text-white text-[0.7vw] font-semibold">{btn.text}</span>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  </div>,
  document.body
  );
};

export default HotspotPresetPopup;
