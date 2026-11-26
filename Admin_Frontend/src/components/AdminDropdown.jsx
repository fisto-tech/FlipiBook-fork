import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const AdminDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuWidth = 'w-full',
  width = '12vw',
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => {
    const val = typeof opt === 'string' ? opt : opt.value;
    return String(val) === String(value);
  });

  const displayLabel = selectedOption
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : (value || placeholder);

  return (
    <div
      className={`relative select-none ${className} ${isOpen ? 'z-[1001]' : ''}`}
      ref={dropdownRef}
      style={{ width }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[2.35vw] min-h-[38px] bg-white rounded-[0.55vw] px-[0.9vw] py-[0.45vw] flex items-center justify-between transition-all duration-150 cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-2 border-indigo-600 ring-2 ring-indigo-50 shadow-xs'
            : 'border border-gray-200 hover:border-gray-300 focus:border-indigo-500'
        } ${buttonClassName}`}
      >
        <span
          className={`text-[0.82vw] font-medium text-left truncate flex-1 ${
            value ? 'text-[#1e293b]' : 'text-gray-400'
          }`}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-[0.9vw] h-[0.9vw] min-w-[14px] min-h-[14px] text-gray-500 transition-transform duration-200 ml-[0.4vw] shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
          strokeWidth={2}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-[0.35vw] ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuWidth === 'w-full' ? 'w-full' : ''} bg-white rounded-[0.7vw] shadow-xl border border-gray-100/90 z-[9999] overflow-hidden py-[0.35vw] animate-in fade-in zoom-in-95 duration-150`}
          style={menuWidth !== 'w-full' ? { width: menuWidth, zIndex: 9999 } : { zIndex: 9999 }}
        >
          <div className="max-h-[14vw] overflow-y-auto custom-scrollbar">
            {options.length === 0 ? (
              <div className="px-[1vw] py-[0.6vw] text-[0.78vw] text-gray-400 text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const optVal = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = String(value) === String(optVal);

                return (
                  <button
                    key={optVal}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(optVal);
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full text-left px-[1vw] py-[0.52vw] text-[0.82vw] flex items-center justify-between font-medium transition-colors cursor-pointer ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'text-black bg-gray-50/90 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    <span className="truncate">{optLabel}</span>
                    {isSelected && (
                      <Check className="w-[0.85vw] h-[0.85vw] text-black shrink-0 ml-[0.4vw]" strokeWidth={2.2} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDropdown;
