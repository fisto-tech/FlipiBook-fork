import { Icon } from "@iconify/react";
import { ZoomTargetThumbnail } from "../components/ZoomTargetThumbnail";

/** Interaction editor — Zoom: choose the zoom target. */
const ZoomAction = ({
  activePageIndex,
  item,
  resolvedValue,
  setItemValueOverrides,
  updateElementAttribute,
}) => (
  <div
    className="flex flex-col w-full gap-[1vh]"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex flex-col gap-[0.5vh]">
      <span className="text-[0.8vw] text-gray-800 font-medium select-none">
        Zoom View
      </span>
      <ZoomTargetThumbnail targetId={item.id} />
    </div>

    <div className="flex items-center justify-between w-full mt-[0.5vh]">
      <span className="text-[0.85vw] text-gray-600 font-medium whitespace-nowrap">
        Zoom Level :
      </span>
      <div className="relative w-[12vw]">
        <select
          className="w-full appearance-none h-[4vh] px-[0.8vw] text-[0.8vw] text-gray-600 border border-gray-300 rounded-[0.4vw] bg-white outline-none focus:border-[#5145F6]"
          value={item.zoomLevel || "2X"}
          onChange={(e) => {
            const val = e.target.value;
            setTimeout(() => {
              if (updateElementAttribute) {
                const targetIdx =
                  item.pageIndex !== undefined
                    ? item.pageIndex
                    : activePageIndex;
                updateElementAttribute(
                  targetIdx,
                  item.id,
                  { "data-zoom-level": val },
                );
              }
            }, 0);
          }}
        >
          <option value="1.5X">1.5X</option>
          <option value="2X">2X</option>
          <option value="2.5X">2.5X</option>
          <option value="3X">3X</option>
        </select>
        <Icon
          icon="lucide:chevron-down"
          className="absolute right-[0.8vw] top-1/2 -translate-y-1/2 text-gray-400 text-[1vw] pointer-events-none"
        />
      </div>
    </div>

    <div className="flex items-center justify-between w-full">
      <span className="text-[0.85vw] text-gray-600 font-medium whitespace-nowrap">
        Zoom Speed :
      </span>
      <div className="relative w-[12vw]">
        <select
          className="w-full appearance-none h-[4vh] px-[0.8vw] text-[0.8vw] text-gray-600 border border-gray-300 rounded-[0.4vw] bg-white outline-none focus:border-[#5145F6]"
          value={resolvedValue || "Medium"}
          onChange={(e) => {
            const val = e.target.value;
            setItemValueOverrides((prev) => ({
              ...prev,
              [item.id]: val,
            }));
            setTimeout(() => {
              if (updateElementAttribute) {
                const targetIdx =
                  item.pageIndex !== undefined
                    ? item.pageIndex
                    : activePageIndex;
                updateElementAttribute(
                  targetIdx,
                  item.id,
                  {
                    "data-interaction": "zoom",
                    "data-interaction-value": val,
                  },
                );
              }
            }, 50);
          }}
        >
          <option value="Slow">Slow</option>
          <option value="Medium">Medium</option>
          <option value="Fast">Fast</option>
        </select>
        <Icon
          icon="lucide:chevron-down"
          className="absolute right-[0.8vw] top-1/2 -translate-y-1/2 text-gray-400 text-[1vw] pointer-events-none"
        />
      </div>
    </div>
  </div>
);

export default ZoomAction;
