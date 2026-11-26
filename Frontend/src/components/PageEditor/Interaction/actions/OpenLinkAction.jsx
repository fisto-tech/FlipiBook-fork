import { ChevronDown } from "lucide-react";
import { Icon } from "@iconify/react";
import { getSocialPlatform } from "../utils/socialPlatforms";

/** Interaction editor — Open Link: URL and link behaviour. */
const OpenLinkAction = ({
  activePageIndex,
  dropdownDirectionOverrides,
  item,
  linkBehaviorOverrides,
  localInputValues,
  openDropdownId,
  resolvedValue,
  setDropdownDirectionOverrides,
  setLinkBehaviorOverrides,
  setLocalInputValues,
  setOpenDropdownId,
  updateElementAttribute,
}) => {
  const currentRawVal =
    localInputValues[item.id] !== undefined
      ? localInputValues[item.id]
      : resolvedValue || "";
  const socialConfig = getSocialPlatform(
    item,
    currentRawVal,
  );
  const trimmedVal = (currentRawVal || "").trim();
  const hasValue = trimmedVal.length > 0;
  const isValid =
    hasValue &&
    socialConfig.regex.test(trimmedVal);
  const isInvalid = hasValue && !isValid;
  const isValidAndFilled = hasValue && isValid;

  const handleSaveLink = () => {
    const val = localInputValues[item.id];
    if (
      val !== undefined &&
      val !== resolvedValue
    ) {
      let finalVal = (val || "").trim();
      if (
        finalVal &&
        !/^https?:\/\//i.test(finalVal) &&
        socialConfig.regex.test(finalVal)
      ) {
        finalVal = "https://" + finalVal;
        setLocalInputValues((prev) => ({
          ...prev,
          [item.id]: finalVal,
        }));
      }
      if (updateElementAttribute) {
        const targetIdx =
          item.pageIndex !== undefined
            ? item.pageIndex
            : activePageIndex;
        updateElementAttribute(
          targetIdx,
          item.id,
          {
            "data-interaction": "open-link",
            "data-interaction-value": finalVal,
          },
        );
      }
    }
  };

  return (
    <div
      className="flex flex-col w-full gap-[0.8vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-[0.4vw]">
        <span className="text-[0.82vw] font-medium text-gray-800 whitespace-nowrap select-none">
          {socialConfig.inputLabel}
        </span>
        <div
          className={`w-full h-[2vw] border ${
            isInvalid
              ? "border-red-400"
              : isValidAndFilled
                ? "border-emerald-500"
                : "border-gray-300 hover:border-gray-400 focus-within:border-[#EC5137]"
          } rounded-[0.4vw] flex items-center px-[0.7vw] bg-white overflow-hidden transition-colors shadow-2xs relative`}
        >
          <Icon
            icon={socialConfig.icon}
            className={`${socialConfig.iconColor} text-[1vw] flex-shrink-0 mr-[0.5vw]`}
          />
          <input
            type="text"
            placeholder={socialConfig.placeholder}
            value={currentRawVal}
            className="flex-1 text-[0.8vw] font-medium text-gray-700 placeholder-gray-400 bg-transparent outline-none truncate pr-[1.8vw]"
            onChange={(e) => {
              const val = e.target.value;
              setLocalInputValues((prev) => ({
                ...prev,
                [item.id]: val,
              }));
            }}
            onBlur={handleSaveLink}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                e.target.blur();
            }}
          />
          {isValidAndFilled && (
            <div className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
              <div className="w-[0.9vw] h-[0.9vw] bg-emerald-500 rounded-full flex items-center justify-center">
                <Icon
                  icon="lucide:check"
                  className="text-white text-[0.65vw]"
                  strokeWidth="3"
                />
              </div>
            </div>
          )}
        </div>
        {isInvalid && (
          <div className="text-red-500 text-[0.72vw] font-normal whitespace-nowrap pl-[0.2vw] pt-[0.1vw]">
            {socialConfig.errorMessage}
          </div>
        )}
        {isValidAndFilled && (
          <div className="text-emerald-600 text-[0.72vw] font-normal whitespace-nowrap pl-[0.2vw] pt-[0.1vw]">
            {socialConfig.successMessage}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[0.4vw]">
        <span className="text-[0.82vw] font-medium text-gray-800 whitespace-nowrap select-none">
          Behavior
        </span>
        <div className="relative w-full">
          {(() => {
            const behaviorDropId = `link-behavior-${item.id}`;
            const isBehaviorDropOpen =
              openDropdownId === behaviorDropId;
            const currentBehavior =
              linkBehaviorOverrides[item.id] ||
              item.linkBehavior ||
              "current";

            return (
              <>
                <div
                  data-dropdown-trigger="true"
                  className="w-full h-[2vw] px-[0.7vw] bg-white border border-gray-300 rounded-[0.4vw] shadow-2xs hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-between cursor-pointer select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isBehaviorDropOpen) {
                      const rect =
                        e.currentTarget.getBoundingClientRect();
                      const spaceBelow =
                        window.innerHeight -
                        rect.bottom;
                      setDropdownDirectionOverrides(
                        (prev) => ({
                          ...prev,
                          [behaviorDropId]:
                            spaceBelow < 250
                              ? "up"
                              : "down",
                        }),
                      );
                    }
                    setOpenDropdownId(
                      isBehaviorDropOpen
                        ? null
                        : behaviorDropId,
                    );
                  }}
                >
                  <span className="text-[0.8vw] font-medium text-gray-700 truncate">
                    {currentBehavior === "current"
                      ? "Open in - Current Tab"
                      : "Open in - New Tab"}
                  </span>
                  <ChevronDown
                    size="0.8vw"
                    className={`text-gray-400 transition-transform ${isBehaviorDropOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isBehaviorDropOpen && (
                  <div
                    data-dropdown-menu="true"
                    className={`absolute left-0 z-[99999] w-full bg-white border border-gray-100 rounded-[0.5vw] shadow-2xl overflow-hidden py-[0.25vw] animate-in fade-in zoom-in-95 duration-150 ${dropdownDirectionOverrides[behaviorDropId] === "up" ? "bottom-[calc(100%+0.3vw)] origin-bottom" : "top-[calc(100%+0.3vw)] origin-top"}`}
                  >
                    <div
                      className={`w-full px-[0.8vw] py-[0.4vw] text-[0.8vw] font-medium text-left transition-colors cursor-pointer ${currentBehavior === "current" ? "text-[#EC5137] bg-gray-50 font-semibold" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLinkBehaviorOverrides(
                          (prev) => ({
                            ...prev,
                            [item.id]: "current",
                          }),
                        );
                        if (
                          updateElementAttribute
                        ) {
                          const targetIdx =
                            item.pageIndex !==
                            undefined
                              ? item.pageIndex
                              : activePageIndex;
                          updateElementAttribute(
                            targetIdx,
                            item.id,
                            {
                              "data-interaction-link-behavior":
                                "current",
                            },
                          );
                        }
                        setOpenDropdownId(null);
                      }}
                    >
                      Open in - Current Tab
                    </div>
                    <div
                      className={`w-full px-[0.8vw] py-[0.4vw] text-[0.8vw] font-medium text-left transition-colors cursor-pointer ${currentBehavior === "new" ? "text-[#EC5137] bg-gray-50 font-semibold" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLinkBehaviorOverrides(
                          (prev) => ({
                            ...prev,
                            [item.id]: "new",
                          }),
                        );
                        if (
                          updateElementAttribute
                        ) {
                          const targetIdx =
                            item.pageIndex !==
                            undefined
                              ? item.pageIndex
                              : activePageIndex;
                          updateElementAttribute(
                            targetIdx,
                            item.id,
                            {
                              "data-interaction-link-behavior":
                                "new",
                            },
                          );
                        }
                        setOpenDropdownId(null);
                      }}
                    >
                      Open in - New Tab
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default OpenLinkAction;
