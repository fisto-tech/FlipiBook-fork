import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { getSocialPlatform } from "../utils/socialPlatforms";
import { useEffect, useRef, useState } from "react";

export const ActionDropdown = ({
  item,
  currentAction,
  actionTypes,
  isDropdownOpen,
  setOpenDropdownId,
  updateElementAttribute,
  activePageIndex,
  setCardActionOverrides,
  setItemValueOverrides,
  setLocalInputValues,
  setTooltipSettingsOverrides,
  isCollapsed,
  theme = "light",
}) => {
  const triggerRef = useRef(null);
  const [dropdownStyles, setDropdownStyles] = useState({});

  useEffect(() => {
    if (isCollapsed && isDropdownOpen) {
      setOpenDropdownId(null);
    }
  }, [isCollapsed, isDropdownOpen, setOpenDropdownId]);

  useEffect(() => {
    if (isDropdownOpen && !isCollapsed && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownMaxHeight = Math.min(window.innerHeight * 0.28, 260);
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards =
        spaceBelow < dropdownMaxHeight && rect.top > dropdownMaxHeight;

      setDropdownStyles({
        position: "fixed",
        left: `${rect.left}px`,
        top: openUpwards
          ? `${Math.max(10, rect.top - dropdownMaxHeight - 5)}px`
          : `${rect.bottom + 5}px`,
        width: "10.5vw",
        minWidth: "145px",
        zIndex: 999999,
      });
    } else {
      setDropdownStyles({});
    }
  }, [isDropdownOpen, isCollapsed]);

  // Close dropdown when scrolling to avoid detached floating menu
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleScroll = (e) => {
      // Don't close if scrolling inside the dropdown itself
      if (e.target.closest && e.target.closest('[data-dropdown-menu="true"]'))
        return;
      setOpenDropdownId(null);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isDropdownOpen, setOpenDropdownId]);

  const isLocked = [
    "youtube",
    "instagram",
    "x",
    "facebook",
    "linkedin",
    "whatsapp",
  ].includes(item.presetId);
  const platformInfo = getSocialPlatform(item);
  const actionLabel =
    ["youtube", "instagram", "x", "facebook", "linkedin"].includes(
      item.presetId,
    ) ||
    ["youtube", "instagram", "x", "facebook", "linkedin"].includes(
      platformInfo.platformKey,
    )
      ? platformInfo.name
      : item.presetId === "whatsapp"
        ? "WhatsApp"
        : currentAction.label;

  const isDark = theme === "dark";

  return (
    <>
      <div
        ref={triggerRef}
        data-dropdown-trigger="true"
        className={`h-[2vw] flex items-center justify-start gap-[0.4vw] px-[0.7vw] relative select-none outline-none focus:outline-none cursor-pointer transition-colors duration-150 ${
          isLocked
            ? "opacity-70 cursor-not-allowed border border-transparent"
            : isCollapsed
              ? "border border-transparent bg-transparent shadow-none"
              : isDark
                ? "bg-transparent border-0 shadow-none px-0 hover:opacity-85"
                : "bg-white border border-gray-300 rounded-full shadow-2xs hover:bg-gray-50 hover:border-gray-400"
        }`}
        style={{ outline: "none" }}
        onClick={(e) => {
          if (isLocked) return;
          if (!isCollapsed) {
            e.stopPropagation();
            setOpenDropdownId(isDropdownOpen ? null : item.id);
          }
        }}
      >
        <span
          className={`text-[0.85vw] font-semibold font-sans select-none flex-shrink-0 ${isDark ? "text-white" : "text-gray-700"}`}
        >
          {actionLabel}
        </span>
        {!isLocked && !isCollapsed && (
          <svg
            width="0.8vw"
            height="0.8vw"
            viewBox="0 0 24 24"
            fill="none"
            className={`${isDark ? "stroke-zinc-300 hover:stroke-white" : "stroke-gray-400 hover:stroke-[#EC5137]"} transition-colors flex-shrink-0 ml-[0.1vw]`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16M16 3l4 4-4 4M20 17H4M8 13l-4 4 4 4" />
          </svg>
        )}
      </div>

      {isDropdownOpen &&
        !isCollapsed &&
        dropdownStyles.left &&
        createPortal(
          <div
            data-dropdown-menu="true"
            className={`${isDark ? "bg-[#18181b] border-[#27272a] text-zinc-200" : "bg-white border-gray-100 text-gray-700"} border rounded-[0.5vw] shadow-2xl flex flex-col py-[0.25vw] max-h-[26vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150 origin-top-left`}
            style={dropdownStyles}
          >
            {actionTypes.map((action) => (
              <div
                key={action.id}
                className={`flex items-center gap-[0.5vw] px-[0.8vw] py-[0.4vw] text-[0.8vw] font-medium transition-colors text-left cursor-pointer ${
                  action.id === currentAction.id
                    ? isDark
                      ? "text-white bg-[#27272a] font-semibold"
                      : "text-[#EC5137] bg-gray-50 font-semibold"
                    : isDark
                      ? "text-zinc-300 hover:bg-[#27272a] hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(null);
                  setCardActionOverrides((prev) => ({
                    ...prev,
                    [item.id]: action.id,
                  }));
                  if (setItemValueOverrides)
                    setItemValueOverrides((prev) => ({
                      ...prev,
                      [item.id]: null,
                    }));
                  if (setLocalInputValues)
                    setLocalInputValues((prev) => ({ ...prev, [item.id]: "" }));
                  if (setTooltipSettingsOverrides)
                    setTooltipSettingsOverrides((prev) => ({
                      ...prev,
                      [item.id]: null,
                    }));

                  setTimeout(() => {
                    if (updateElementAttribute) {
                      const targetIdx =
                        item.pageIndex !== undefined
                          ? item.pageIndex
                          : activePageIndex;
                      updateElementAttribute(targetIdx, item.id, {
                        "data-interaction": action.id,
                        "data-interaction-value": null,
                        "data-tooltip-settings": null,
                      });
                    }
                    window.dispatchEvent(
                      new CustomEvent("update-interaction-badge", {
                        detail: {
                          elementId: item.id,
                          actionType: action,
                        },
                      }),
                    );
                  }, 50);
                }}
              >
                <Icon
                  icon={action.icon}
                  className="text-gray-600 text-[1.1vw] group-hover:text-[#5145F6] transition-colors flex-shrink-0"
                />
                <span className="text-[0.8vw] text-gray-800 font-medium font-sans group-hover:text-[#5145F6] transition-colors truncate">
                  {action.label}
                </span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};
