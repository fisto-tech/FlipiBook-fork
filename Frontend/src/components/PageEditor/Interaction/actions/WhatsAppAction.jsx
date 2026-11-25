import { CallInteractionInput } from "../components/CallInteractionInput";
import { Icon } from "@iconify/react";

/** Interaction editor — WhatsApp: number, message and link behaviour. */
const WhatsAppAction = ({
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
  setWhatsappMessageOverrides,
  updateElementAttribute,
  whatsappMessageOverrides,
}) => (
  <div
    className="flex flex-col w-full gap-[1.5vh]"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex flex-col gap-[0.4vh]">
      <span className="text-[0.8vw] text-gray-800 font-normal select-none">
        Enter your WhatsApp Number
      </span>
      <div className="w-full h-[4.5vh]">
        <CallInteractionInput
          initialValue={
            localInputValues[item.id] !== undefined
              ? localInputValues[item.id]
              : resolvedValue || ""
          }
          onSave={(val) => {
            setLocalInputValues((prev) => ({
              ...prev,
              [item.id]: val,
            }));
            if (updateElementAttribute) {
              const targetIdx =
                item.pageIndex !== undefined
                  ? item.pageIndex
                  : activePageIndex;
              updateElementAttribute(
                targetIdx,
                item.id,
                {
                  "data-interaction": "whatsapp",
                  "data-interaction-value": val,
                },
              );
            }
          }}
          isWhatsApp={true}
        />
      </div>
    </div>
    <div className="flex flex-col gap-[0.4vh]">
      <div className="flex items-center gap-[0.3vw]">
        <span className="text-gray-800 font-normal select-none text-[0.8vw]">
          Pre filled Message
        </span>
        <span className="text-[#EF4444] text-[0.8vw] font-medium select-none ml-[0.1vw]">
          *
        </span>
      </div>
      <div className="relative w-full h-[4.5vh] border border-[#C5C5C5] rounded-[0.5vw] flex items-center px-[0.8vw] bg-white overflow-hidden hover:border-gray-400 focus-within:border-[#5145F6] transition-colors shadow-sm">
        <Icon
          icon="lucide:message-square-text"
          className="text-gray-500 text-[1.1vw] flex-shrink-0 mr-[0.5vw]"
        />
        <input
          type="text"
          placeholder="Hello! I have a question"
          maxLength={100}
          value={
            whatsappMessageOverrides[item.id] !==
            undefined
              ? whatsappMessageOverrides[item.id]
              : item.whatsappMessage || ""
          }
          className="flex-1 text-[0.85vw] text-gray-600 placeholder-gray-400 bg-transparent outline-none font-normal"
          onChange={(e) => {
            const val = e.target.value;
            setWhatsappMessageOverrides((prev) => ({
              ...prev,
              [item.id]: val,
            }));
          }}
          onBlur={() => {
            const val =
              whatsappMessageOverrides[item.id];
            if (
              val !== undefined &&
              val !== item.whatsappMessage
            ) {
              if (updateElementAttribute) {
                const targetIdx =
                  item.pageIndex !== undefined
                    ? item.pageIndex
                    : activePageIndex;
                updateElementAttribute(
                  targetIdx,
                  item.id,
                  {
                    "data-interaction-whatsapp-message":
                      val,
                  },
                );
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.target.blur();
          }}
        />
        <span className="text-[0.7vw] text-gray-400 ml-[0.5vw] select-none whitespace-nowrap">
          {
            (
              (whatsappMessageOverrides[item.id] !==
              undefined
                ? whatsappMessageOverrides[item.id]
                : item.whatsappMessage || "") || ""
            ).length
          }
          /100
        </span>
      </div>
    </div>
    <div className="flex flex-col gap-[0.4vh]">
      <span className="text-[0.8vw] text-gray-800 font-normal select-none">
        Behavior
      </span>
      <div className="relative w-full">
        {(() => {
          const behaviorDropId = `whatsapp-behavior-${item.id}`;
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
                className={`w-full h-[4.5vh] border ${isBehaviorDropOpen ? "border-[#5145F6]" : "border-[#C5C5C5]"} rounded-[0.5vw] flex items-center justify-between px-[1vw] bg-white cursor-pointer select-none transition-colors shadow-sm hover:border-gray-400`}
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
                <span className="text-[0.85vw] text-gray-600 font-normal truncate">
                  {currentBehavior === "current"
                    ? "Open in - Current Tab"
                    : "Open in - New Tab"}
                </span>
                <Icon
                  icon="lucide:chevron-down"
                  className={`text-gray-500 text-[1vw] transition-transform duration-200 ${isBehaviorDropOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isBehaviorDropOpen && (
                <div
                  data-dropdown-menu="true"
                  className={`absolute left-0 z-[99999] w-full bg-white border border-gray-200 rounded-[0.6vw] shadow-lg py-[0.5vh] ${dropdownDirectionOverrides[behaviorDropId] === "up" ? "bottom-[calc(100%+0.4vh)] origin-bottom" : "top-[calc(100%+0.4vh)] origin-top"}`}
                >
                  <div
                    className={`px-[1vw] py-[0.8vh] text-[0.85vw] cursor-pointer transition-colors ${currentBehavior === "current" ? "bg-[#F1F5F9] text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLinkBehaviorOverrides(
                        (prev) => ({
                          ...prev,
                          [item.id]: "current",
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
                    className={`px-[1vw] py-[0.8vh] text-[0.85vw] cursor-pointer transition-colors ${currentBehavior === "new" ? "bg-[#F1F5F9] text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLinkBehaviorOverrides(
                        (prev) => ({
                          ...prev,
                          [item.id]: "new",
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

export default WhatsAppAction;
