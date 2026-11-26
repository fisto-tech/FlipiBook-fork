import { Icon } from "@iconify/react";
import { TEMPLATES } from "../PopupTemplateSelection";
import { getFormattedPopupSvg } from "../utils/popupSvg";

/** Interaction editor — Popup: choose and customise the popup template. */
const PopupAction = ({
  activePageIndex,
  item,
  onCustomizePopup,
  openDropdownId,
  popupCustomHtmlOverrides,
  resolvedValue,
  setActiveTemplateSelectionId,
  setItemValueOverrides,
  setOpenDropdownId,
  setPopupCustomHtmlOverrides,
  updateElementAttribute,
}) => {
  const currentCustomHtml =
    popupCustomHtmlOverrides[item.id] !==
    undefined
      ? popupCustomHtmlOverrides[item.id]
      : item.customPopupHtml || null;

  let resolvedPopupHtml = currentCustomHtml;
  if (!resolvedPopupHtml) {
    try {
      const editorDoc =
        document.getElementById(
          "main-flipbook-editor",
        )?.contentDocument || document;
      const liveEl =
        editorDoc.getElementById?.(item.id) ||
        document.getElementById(item.id);
      resolvedPopupHtml =
        liveEl?.getAttribute(
          "data-interaction-popup-custom-html",
        ) || null;
    } catch {}
  }

  const templateImage = TEMPLATES.find(
    (tpl) => tpl.id === resolvedValue,
  )?.image;

  return (
    <div className="flex flex-col w-full">
      <span className="text-[0.9vw] font-medium text-black mb-[1vh]">
        Popup Preview
      </span>
      {resolvedValue ? (
        <div className="flex flex-col gap-[1.5vh] w-full">
          <div className="w-full bg-white rounded-[0.5vw] border border-gray-100 flex flex-col p-[0.3vw] shadow-sm relative overflow-visible group">
            <div className="flex items-center justify-between px-[0.6vw] pt-[0.4vh] pb-[0.6vh]">
              <span className="text-[0.6vw] text-gray-500">
                Enter Popup Heading here
              </span>
              <span className="text-[0.7vw] text-gray-400">
                ×
              </span>
            </div>

            {/* Inner container for image / edited preview */}
            <div className="relative w-full h-[18vh] rounded-[0.4vw] overflow-hidden bg-[#F4F5F7] border border-gray-100 flex items-center justify-center">
              {resolvedPopupHtml ? (
                <div
                  className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none bg-white p-[0.3vw] [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain"
                  dangerouslySetInnerHTML={{
                    __html:
                      getFormattedPopupSvg(
                        resolvedPopupHtml,
                      ),
                  }}
                />
              ) : templateImage ? (
                <img
                  src={templateImage}
                  alt="Selected Template"
                  className="w-full h-full object-cover"
                />
              ) : null}

              {/* 3 dots menu inside the image box */}
              <div className="absolute top-[0.4vh] right-[0.2vw] z-10">
                <div
                  className="p-[0.2vw] cursor-pointer bg-white/50 backdrop-blur-sm rounded-[0.2vw] opacity-0 group-hover:opacity-100 transition-opacity"
                  data-dropdown-trigger="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(
                      openDropdownId ===
                        `popup-${item.id}`
                        ? null
                        : `popup-${item.id}`,
                    );
                  }}
                >
                  <Icon
                    icon="bi:three-dots-vertical"
                    className="text-gray-800 drop-shadow-md text-[1.2vw]"
                  />
                </div>
              </div>
            </div>

            {/* 3 dots dropdown menu (placed outside hidden overflow) */}
            {openDropdownId ===
              `popup-${item.id}` && (
              <div
                data-dropdown-menu="true"
                className="absolute top-[4vh] right-[0.5vw] w-[9.5vw] bg-white rounded-[0.4vw] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-200 py-[0.4vh] flex flex-col z-20"
              >
                <div
                  className="flex items-center gap-[0.5vw] px-[0.8vw] py-[0.6vh] hover:bg-gray-50 cursor-pointer transition-colors group/menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(null);
                    setActiveTemplateSelectionId(
                      item.id,
                    );
                  }}
                >
                  <Icon
                    icon="carbon:template"
                    className="text-gray-800 text-[1.1vw] group-hover/menu:text-black"
                  />
                  <span className="text-[0.75vw] text-gray-700 font-medium group-hover/menu:text-gray-900">
                    Change Template
                  </span>
                </div>
                <div
                  className="flex items-center gap-[0.5vw] px-[0.8vw] py-[0.6vh] hover:bg-red-50 cursor-pointer transition-colors group/menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(null);
                    setItemValueOverrides(
                      (prev) => ({
                        ...prev,
                        [item.id]: null,
                      }),
                    );
                    setPopupCustomHtmlOverrides(
                      (prev) => {
                        const next = { ...prev };
                        delete next[item.id];
                        return next;
                      },
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
                          "data-interaction-value":
                            null,
                          "data-interaction-popup-custom-html":
                            null,
                        },
                      );
                    }
                  }}
                >
                  <Icon
                    icon="iconamoon:trash-light"
                    className="text-[#EF4444] text-[1.1vw] group-hover/menu:text-red-600"
                  />
                  <span className="text-[0.75vw] text-[#EF4444] font-medium group-hover/menu:text-red-600">
                    Delete
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <div
            className="w-full bg-white border border-gray-100 shadow-sm rounded-[0.5vw] flex items-center justify-center py-[1vh] cursor-pointer hover:shadow-md transition-shadow gap-[0.8vw] group"
            onClick={(e) => {
              e.stopPropagation();
              if (onCustomizePopup) {
                const targetIdx =
                  item.pageIndex !== undefined
                    ? item.pageIndex
                    : activePageIndex;
                onCustomizePopup(
                  resolvedValue,
                  item.id,
                  targetIdx,
                );
              }
            }}
          >
            <Icon
              icon="bx:edit"
              className="text-[1.4vw] text-black group-hover:text-gray-700 transition-colors"
            />
            <span className="text-[1vw] text-black font-medium group-hover:text-gray-700 transition-colors">
              Edit Popup
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full bg-[#FAFAFA] rounded-[0.5vw] border border-gray-100 flex flex-col p-[0.3vw] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between px-[0.6vw] pt-[0.4vh] pb-[0.6vh]">
            <span className="text-[0.6vw] text-gray-500">
              Enter Popup Heading here
            </span>
            <span className="text-[0.7vw] text-gray-400">
              ×
            </span>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveTemplateSelectionId(
                item.id,
              );
            }}
            className="w-full relative py-[1.8vh] border-[1.5px] border-dashed border-[#A0AEC0] rounded-[0.4vw] bg-[#F4F5F7] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group overflow-hidden"
          >
            <div className="flex flex-col items-center gap-[1vh] mt-[0.2vh]">
              <div className="flex items-center gap-[0.5vw] text-[#8A94A6] group-hover:text-gray-600 transition-colors">
                <Icon
                  icon="lucide:plus"
                  className="text-[1.2vw]"
                  strokeWidth="2"
                />
                <span className="text-[0.95vw] font-medium">
                  Add Popup File
                </span>
              </div>
              <span className="text-[0.75vw] text-gray-400">
                or
              </span>
              <div className="flex items-center gap-[0.5vw] bg-white px-[1.5vw] py-[0.8vh] rounded-[0.4vw] shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-gray-100 mt-[0.2vh] hover:shadow-md transition-shadow">
                <Icon
                  icon="bx:layout"
                  className="text-[1.2vw] text-black"
                />
                <span className="text-[0.9vw] text-black font-medium">
                  Choose Template
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupAction;
