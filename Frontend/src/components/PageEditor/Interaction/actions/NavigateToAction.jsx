import { Icon } from "@iconify/react";

/** Interaction editor — Navigate to: pick a target page. */
const NavigateToAction = ({
  activePageIndex,
  dropdownDirectionOverrides,
  item,
  openDropdownId,
  pages,
  resolvedValue,
  setDropdownDirectionOverrides,
  setItemValueOverrides,
  setOpenDropdownId,
  updateElementAttribute,
}) => {
  const pageDropId = `page-drop-${item.id}`;
  const isPageDropOpen =
    openDropdownId === pageDropId;
  const selectedPage = resolvedValue || "1";
  return (
    <div
      className="flex flex-col w-full gap-[0.8vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[0.8vw] text-black font-normal">
        Select Page to Navigate
      </span>
      <div className="relative w-full">
        <div
          data-dropdown-trigger="true"
          className="w-full h-[4.5vh] border border-gray-500 rounded-[0.5vw] flex items-center justify-between px-[0.8vw] bg-white cursor-pointer select-none"
          onClick={(e) => {
            e.stopPropagation();
            if (!isPageDropOpen) {
              const rect =
                e.currentTarget.getBoundingClientRect();
              const spaceBelow =
                window.innerHeight - rect.bottom;
              setDropdownDirectionOverrides(
                (prev) => ({
                  ...prev,
                  [pageDropId]:
                    spaceBelow < 250
                      ? "up"
                      : "down",
                }),
              );
            }
            setOpenDropdownId(
              isPageDropOpen ? null : pageDropId,
            );
          }}
        >
          <span className="text-[0.8vw] text-gray-700 font-medium font-sans">
            Page {selectedPage}
          </span>
          <Icon
            icon="lucide:chevron-down"
            className={`text-gray-700 text-[1vw] transition-transform duration-200 ${isPageDropOpen ? "rotate-180" : ""}`}
          />
        </div>
        {isPageDropOpen && (
          <div
            data-dropdown-menu="true"
            className={`absolute left-0 z-[99999] w-full bg-white border border-gray-200 rounded-[0.6vw] shadow-xl py-[0.5vh] max-h-[15vh] overflow-y-auto ${dropdownDirectionOverrides[pageDropId] === "up" ? "bottom-[calc(100%+0.4vh)] origin-bottom" : "top-[calc(100%+0.4vh)] origin-top"}`}
          >
            {Array.from(
              { length: pages?.length || 0 },
              (_, i) => (
                <div
                  key={i + 1}
                  className={`px-[0.8vw] py-[0.7vh] text-[0.8vw] font-sans cursor-pointer rounded-[0.3vw] mx-[0.3vw] transition-colors ${String(i + 1) === String(selectedPage) ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const val = (
                      i + 1
                    ).toString();
                    setItemValueOverrides(
                      (prev) => ({
                        ...prev,
                        [item.id]: val,
                      }),
                    );
                    setOpenDropdownId(null);
                    setTimeout(() => {
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
                            "data-interaction":
                              "navigate-to",
                            "data-interaction-value":
                              val,
                          },
                        );
                      }
                    }, 250);
                  }}
                >
                  Page {i + 1}
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigateToAction;
