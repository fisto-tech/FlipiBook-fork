import React from 'react';
import { Icon } from '@iconify/react';

/**
 * Reusable Switch toggle component matching LeadForm style.
 */
const Switch = ({ checked, enabled, onChange, disabled = false, className = '' }) => {
  const isChecked = Boolean(checked !== undefined ? checked : enabled);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        if (onChange) onChange(!isChecked);
      }}
      className={`relative inline-flex items-center w-[1.9vw] min-w-[34px] h-[0.9vw] min-h-[15px] rounded-full transition-colors duration-200 ease-in-out outline-none shrink-0 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isChecked ? 'bg-[#E54826]' : 'bg-[#D1D5DB]'} ${className}`}
    >
      <div
        className={`absolute w-[1.15vw] min-w-[18px] h-[1.15vw] min-h-[18px] rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.22)] -top-[0.12vw] ${isChecked
          ? 'right-0 bg-[#E54826]'
          : 'left-0 bg-white'
          }`}
      >
        {isChecked && (
          <Icon icon="lucide:check" className="w-[0.65vw] min-w-[10px] h-[0.65vw] min-h-[10px] text-white stroke-[3.2]" />
        )}
      </div>
    </button>
  );
};

export default Switch;
