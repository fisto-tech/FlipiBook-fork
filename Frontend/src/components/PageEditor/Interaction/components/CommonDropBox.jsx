import { Icon } from "@iconify/react";
import { useRef } from "react";

export const CommonDropBox = ({
  id,
  accept,
  onFileSelect,
  fileMeta, // Object or null. If null, shows empty state
  emptyIcon = "prime:upload",
  emptyTitle = (
    <>
      Drag & Drop or{" "}
      <span className="text-[#5145F6] font-semibold hover:underline">
        Upload
      </span>
    </>
  ),
  subText,
  renderPreview,
  boxClassName, // override entire box classes if needed
  boxStyle, // custom styles
  hideInput = false,
  isUploading = false,
  disableClick = false,
}) => {
  const inputRef = useRef(null);

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {!hideInput && (
        <input
          type="file"
          id={id}
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onFileSelect) onFileSelect(file);
            if (e.target) e.target.value = "";
          }}
        />
      )}
      <div
        onClick={() => {
          if (!disableClick && !isUploading) {
            if (inputRef.current) inputRef.current.click();
            else document.getElementById(id)?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isUploading)
            e.currentTarget.classList.add("border-[#5145F6]", "bg-[#5145F6]/5");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove(
            "border-[#5145F6]",
            "bg-[#5145F6]/5",
          );
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove(
            "border-[#5145F6]",
            "bg-[#5145F6]/5",
          );
          if (isUploading) return;
          const file = e.dataTransfer.files?.[0];
          if (file && onFileSelect) onFileSelect(file);
        }}
        className={
          boxClassName ||
          "w-full h-[11vh] border-2 border-dashed border-[#8A94A6] rounded-[0.6vw] bg-[#F8F9FA] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden p-[0.3vw] gap-[0.5vh]"
        }
        style={boxStyle}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-transparent">
            <Icon
              icon="eos-icons:loading"
              className="text-[#5145F6] text-[1.8vw]"
            />
            <span className="text-[0.65vw] text-[#5145F6] mt-2 font-medium">
              Uploading...
            </span>
          </div>
        ) : fileMeta ? (
          renderPreview ? (
            renderPreview(fileMeta)
          ) : (
            <>
              <Icon
                icon="fluent:document-checkmark-24-regular"
                className="text-[#5145F6] text-[2vw]"
              />
              <span
                className="text-[0.6vw] font-medium text-gray-500 mt-[0.2vh] truncate text-center w-[7vw]"
                title={fileMeta.name}
              >
                {fileMeta.name}
              </span>
            </>
          )
        ) : (
          <>
            <span className="text-[0.75vw] text-[#6B7280] font-normal text-center select-none">
              {emptyTitle}
            </span>
            <Icon
              icon={emptyIcon}
              className="text-[#6B7280] text-[1.6vw] my-[0.2vh]"
            />
            {subText && (
              <span className="text-[0.65vw] text-[#9CA3AF] font-normal select-none">
                {subText}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
