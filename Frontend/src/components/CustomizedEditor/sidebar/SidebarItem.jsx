import React from "react";
import { Icon } from "@iconify/react";

/**
 * SidebarItem
 * Nav button item used in CustomizedEditor Sidebar
 */
const SidebarItem = ({
  id,
  icon,
  label,
  isOpen,
  onClick,
  children,
  hasDropdown = true,
  isActive = false,
}) => {
  return (
    <div className="flex flex-col px-[0.75vw] py-[0.25vw]">
      <button
        id={id}
        onClick={onClick}
        className={`relative w-full flex items-center justify-between p-[0.75vw] rounded-[0.55vw] transition-all duration-200 group cursor-pointer overflow-hidden border border-transparent ${
          isActive 
            ? 'bg-gradient-to-r from-[#F05B42] via-[#EC5137] to-[#E24429] text-white active-sidebar-item shadow-[0_4px_14px_rgba(236,81,55,0.32)]' 
            : 'bg-transparent text-gray-800 hover:bg-gray-100 hover:text-black'
        }`}
      >
        {/* Subtle, soft silver shine */}
        {isActive && (
          <div 
            className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-35"
          />
        )}

        <div className="flex items-center gap-[1vw] relative z-10">
          {typeof icon === 'string' ? (
            <Icon 
              icon={icon} 
              className={`w-[1.25vw] h-[1.25vw] transition-colors ${
                isActive ? 'text-white' : 'text-gray-700 group-hover:text-black'
              }`} 
            />
          ) : React.isValidElement(icon) ? (
            React.cloneElement(icon, {
              className: `w-[1.25vw] h-[1.25vw] transition-colors ${
                isActive ? 'text-white' : 'text-gray-700 group-hover:text-black'
              }`
            })
          ) : (
            icon
          )}
          <span className={`text-[0.8125vw] font-semibold transition-colors ${
            isActive ? 'text-white tracking-wide' : 'text-gray-800 group-hover:text-black'
          }`}>
            {label}
          </span>
        </div>
        {hasDropdown && (
          <Icon
            icon="lucide:chevron-down"
            className={`w-[1vw] h-[1vw] transition-all duration-200 relative z-10 ${
              isActive ? 'text-white/90' : 'text-gray-400 group-hover:text-gray-700'
            } ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        )}
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[31.25vw] opacity-100 mt-[0.25vw] mb-[0.5vw]' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-[0.25vw]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarItem;
