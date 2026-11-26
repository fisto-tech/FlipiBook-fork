import { CallInteractionInput } from "../components/CallInteractionInput";

/** Interaction editor — Call: phone number input. */
const CallAction = ({
  activePageIndex,
  item,
  updateElementAttribute,
}) => {
  const val = item.value || "";
  return (
    <div
      className="flex flex-col w-full gap-[0.8vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[0.85vw] text-black font-normal">
        Enter your Number
      </span>
      <div className="relative w-full h-[4.5vh]">
        <CallInteractionInput
          initialValue={val}
          onSave={(newValue) => {
            if (updateElementAttribute) {
              const targetIdx =
                item.pageIndex !== undefined
                  ? item.pageIndex
                  : activePageIndex;
              updateElementAttribute(
                targetIdx,
                item.id,
                {
                  "data-interaction": "call",
                  "data-interaction-value":
                    newValue,
                },
              );
            }
          }}
        />
      </div>
    </div>
  );
};

export default CallAction;
