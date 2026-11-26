import { Icon } from "@iconify/react";

/** Interaction editor — Email: address and link behaviour. */
const EmailAction = ({
  activePageIndex,
  item,
  linkBehaviorOverrides,
  localInputValues,
  resolvedValue,
  setLinkBehaviorOverrides,
  setLocalInputValues,
  updateElementAttribute,
}) => (
  <div
    className="flex flex-col w-full gap-[1.5vh]"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex flex-col gap-[0.4vh]">
      <span className="text-[0.8vw] text-gray-800 font-normal select-none">
        Enter your Email Address
      </span>
      <div className="w-full h-[4.5vh] border border-gray-400 rounded-[0.5vw] flex items-center px-[0.8vw] bg-white overflow-hidden hover:border-gray-500 focus-within:border-[#5145F6] transition-colors shadow-sm">
        <Icon
          icon="ic:outline-mail"
          className="text-gray-600 text-[1.2vw] mr-[0.5vw]"
        />
        <input
          type="email"
          placeholder="Enter Email Id"
          value={
            localInputValues[item.id] !== undefined
              ? localInputValues[item.id]
              : resolvedValue || ""
          }
          className="w-full h-full text-[0.85vw] font-medium text-gray-700 placeholder-gray-400 bg-transparent outline-none truncate"
          onChange={(e) => {
            const val = e.target.value;
            setLocalInputValues((prev) => ({
              ...prev,
              [item.id]: val,
            }));
          }}
          onBlur={() => {
            const val = localInputValues[item.id];
            if (
              val !== undefined &&
              val !== resolvedValue
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
                    "data-interaction": "email",
                    "data-interaction-value": val,
                  },
                );
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.target.blur();
          }}
        />
      </div>
    </div>
    <div className="flex flex-col gap-[0.4vh]">
      <span className="text-[0.8vw] text-gray-800 font-normal select-none">
        Behavior
      </span>
      <div className="relative w-full">
        <select
          className="w-full appearance-none h-[4.5vh] px-[1vw] pr-[2.5vw] text-[0.85vw] text-gray-600 font-normal border border-gray-400 rounded-[0.5vw] bg-white outline-none focus:border-[#5145F6] shadow-sm hover:border-gray-500 transition-colors cursor-pointer"
          value={
            linkBehaviorOverrides[item.id] ||
            item.linkBehavior ||
            "current"
          }
          onChange={(e) => {
            const val = e.target.value;
            setLinkBehaviorOverrides((prev) => ({
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
                  "data-interaction-link-behavior":
                    val,
                },
              );
            }
          }}
        >
          <option value="current">
            Open in - Current Tab
          </option>
          <option value="new">
            Open in - New Tab
          </option>
        </select>
        <Icon
          icon="lucide:chevron-down"
          className="absolute right-[0.8vw] top-1/2 -translate-y-1/2 text-gray-500 text-[1vw] pointer-events-none"
        />
      </div>
    </div>
  </div>
);

export default EmailAction;
