import { Icon } from "@iconify/react";

/** Interaction editor — extra options shown under a Popup interaction. */
const PopupExtraOptions = ({
  activePageIndex,
  dropdownDirectionOverrides,
  item,
  itemValueOverrides,
  openDropdownId,
  setDropdownDirectionOverrides,
  setItemValueOverrides,
  setOpenDropdownId,
  updateElementAttribute,
}) => (
  <div className="flex flex-col gap-[1.5vh] w-full mt-[1.5vh]">
    {/* Animation Dropdown */}
    <div className="flex items-center w-full gap-[0.5vw]">
      <span className="w-[6.5vw] text-[0.9vw] text-black font-medium whitespace-nowrap">
        Animation :
      </span>
      <div className="relative flex-1">
        {(() => {
          const animDropId = `popup-anim-${item.id}`;
          const isAnimDropOpen =
            openDropdownId === animDropId;
          const popupAnimations = [
            {
              value: "Fade In /Out",
              label: "Fade in",
            },
            { value: "Slide Up", label: "Slide Up" },
            {
              value: "Slide Down",
              label: "Slide Down",
            },
            { value: "Zoom In", label: "Zoom In" },
          ];
          const liveEl = (
            document.getElementById(
              "main-flipbook-editor",
            )?.contentDocument || document
          ).getElementById(item.id);
          const savedAnim = liveEl?.getAttribute(
            "data-interaction-popup-animation",
          );
          const currentAnim =
            itemValueOverrides[animDropId] ||
            savedAnim ||
            item.popupAnimation ||
            "Fade In /Out";
          const currentAnimLabel =
            popupAnimations.find(
              (a) => a.value === currentAnim,
            )?.label || "Fade in";

          return (
            <>
              <div
                data-dropdown-trigger="true"
                className={`w-full h-[4.5vh] border ${isAnimDropOpen ? "border-[#5145F6]" : "border-gray-400"} rounded-[0.4vw] flex items-center justify-between px-[1vw] bg-white cursor-pointer select-none transition-colors`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAnimDropOpen) {
                    const rect =
                      e.currentTarget.getBoundingClientRect();
                    const spaceBelow =
                      window.innerHeight -
                      rect.bottom;
                    setDropdownDirectionOverrides(
                      (prev) => ({
                        ...prev,
                        [animDropId]:
                          spaceBelow < 250
                            ? "up"
                            : "down",
                      }),
                    );
                  }
                  setOpenDropdownId(
                    isAnimDropOpen
                      ? null
                      : animDropId,
                  );
                }}
              >
                <span className="text-[0.85vw] text-gray-600 font-medium truncate">
                  {currentAnimLabel}
                </span>
                <Icon
                  icon="lucide:chevron-down"
                  className={`text-gray-400 text-[1.2vw] transition-transform duration-200 ${isAnimDropOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isAnimDropOpen && (
                <div
                  data-dropdown-menu="true"
                  className={`absolute left-0 z-[99999] w-full bg-white border border-gray-200 rounded-[0.5vw] shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-[0.5vh] ${dropdownDirectionOverrides[animDropId] === "up" ? "bottom-[calc(100%+0.5vh)] origin-bottom" : "top-[calc(100%+0.5vh)] origin-top"}`}
                >
                  {popupAnimations.map((anim) => (
                    <div
                      key={anim.value}
                      className={`px-[1vw] py-[1vh] text-[0.85vw] cursor-pointer transition-colors ${anim.value === currentAnim ? "bg-[#F1F5F9] text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemValueOverrides(
                          (prev) => ({
                            ...prev,
                            [animDropId]: anim.value,
                          }),
                        );
                        if (updateElementAttribute) {
                          const targetIdx =
                            item.pageIndex !==
                            undefined
                              ? item.pageIndex
                              : activePageIndex;
                          updateElementAttribute(
                            targetIdx,
                            item.id,
                            {
                              "data-interaction-popup-animation":
                                anim.value,
                            },
                          );
                        }
                        try {
                          const editorDoc =
                            document.getElementById(
                              "main-flipbook-editor",
                            )?.contentDocument ||
                            document;
                          const el =
                            editorDoc.getElementById(
                              item.id,
                            );
                          if (el)
                            el.setAttribute(
                              "data-interaction-popup-animation",
                              anim.value,
                            );
                        } catch {}
                        setOpenDropdownId(null);
                      }}
                    >
                      {anim.label}
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>

    {/* Animation Speed Dropdown */}
    <div className="flex items-center w-full gap-[0.5vw]">
      <span className="w-[6.5vw] text-[0.9vw] text-black font-medium whitespace-nowrap">
        Speed :
      </span>
      <div className="relative flex-1">
        {(() => {
          const speedDropId = `popup-speed-${item.id}`;
          const isSpeedDropOpen =
            openDropdownId === speedDropId;
          const popupSpeeds = [
            "Slow",
            "Medium",
            "Fast",
          ];
          const liveSpeedEl = (
            document.getElementById(
              "main-flipbook-editor",
            )?.contentDocument || document
          ).getElementById(item.id);
          const savedSpeed =
            liveSpeedEl?.getAttribute(
              "data-interaction-popup-speed",
            );
          const currentSpeed =
            itemValueOverrides[speedDropId] ||
            savedSpeed ||
            item.popupSpeed ||
            "Medium";

          return (
            <>
              <div
                data-dropdown-trigger="true"
                className={`w-full h-[4.5vh] border ${isSpeedDropOpen ? "border-[#5145F6]" : "border-gray-400"} rounded-[0.4vw] flex items-center justify-between px-[1vw] bg-white cursor-pointer select-none transition-colors`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSpeedDropOpen) {
                    const rect =
                      e.currentTarget.getBoundingClientRect();
                    const spaceBelow =
                      window.innerHeight -
                      rect.bottom;
                    setDropdownDirectionOverrides(
                      (prev) => ({
                        ...prev,
                        [speedDropId]:
                          spaceBelow < 250
                            ? "up"
                            : "down",
                      }),
                    );
                  }
                  setOpenDropdownId(
                    isSpeedDropOpen
                      ? null
                      : speedDropId,
                  );
                }}
              >
                <span className="text-[0.85vw] text-gray-600 font-medium truncate">
                  {currentSpeed}
                </span>
                <Icon
                  icon="lucide:chevron-down"
                  className={`text-gray-400 text-[1.2vw] transition-transform duration-200 ${isSpeedDropOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isSpeedDropOpen && (
                <div
                  data-dropdown-menu="true"
                  className={`absolute left-0 z-[99999] w-full bg-white border border-gray-200 rounded-[0.5vw] shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-[0.5vh] ${dropdownDirectionOverrides[speedDropId] === "up" ? "bottom-[calc(100%+0.5vh)] origin-bottom" : "top-[calc(100%+0.5vh)] origin-top"}`}
                >
                  {popupSpeeds.map((speed) => (
                    <div
                      key={speed}
                      className={`px-[1vw] py-[1vh] text-[0.85vw] cursor-pointer transition-colors ${speed === currentSpeed ? "bg-[#F1F5F9] text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemValueOverrides(
                          (prev) => ({
                            ...prev,
                            [speedDropId]: speed,
                          }),
                        );
                        if (updateElementAttribute) {
                          const targetIdx =
                            item.pageIndex !==
                            undefined
                              ? item.pageIndex
                              : activePageIndex;
                          updateElementAttribute(
                            targetIdx,
                            item.id,
                            {
                              "data-interaction-popup-speed":
                                speed,
                            },
                          );
                        }
                        try {
                          const editorDoc =
                            document.getElementById(
                              "main-flipbook-editor",
                            )?.contentDocument ||
                            document;
                          const el =
                            editorDoc.getElementById(
                              item.id,
                            );
                          if (el)
                            el.setAttribute(
                              "data-interaction-popup-speed",
                              speed,
                            );
                        } catch {}
                        setOpenDropdownId(null);
                      }}
                    >
                      {speed}
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  </div>
);

export default PopupExtraOptions;
