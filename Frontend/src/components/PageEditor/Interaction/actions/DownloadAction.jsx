import { CommonDropBox } from "../components/CommonDropBox";
import { Icon } from "@iconify/react";

/** Interaction editor — Download: upload / pick the file to download. */
const DownloadAction = ({
  activePageIndex,
  item,
  openDropdownId,
  resolvedValue,
  setItemValueOverrides,
  setOpenDropdownId,
  setUploadingItems,
  updateElementAttribute,
  uploadingItems,
  user,
}) => {
  let fileMeta = null;
  try {
    if (
      resolvedValue &&
      resolvedValue.startsWith("{")
    ) {
      fileMeta = JSON.parse(resolvedValue);
    }
  } catch {}

  return (
    <div
      className="flex flex-col w-full gap-[0.8vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[0.85vw] text-black font-normal">
        {fileMeta
          ? "Download Preview"
          : "Upload Download File"}
      </span>
      <CommonDropBox
        boxClassName={`w-full h-[18vh] rounded-[0.6vw] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${fileMeta ? "p-0" : "bg-[#F3F4F6] hover:bg-gray-100 p-[0.3vw] gap-[0.5vh]"}`}
        boxStyle={
          !fileMeta
            ? {
                backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%238A94A6' stroke-width='2' stroke-dasharray='5%2c 8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
              }
            : {}
        }
        id={`download-upload-${item.id}`}
        accept="*"
        onFileSelect={(file) => {
          if (file && updateElementAttribute) {
            if (!user) {
              alert(
                "You must be logged in to upload a file.",
              );
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              let base64Data = reader.result;
              base64Data = base64Data.replace(
                /^data:([^;]+);/,
                "data:download-$1;",
              );

              const storedVal = JSON.stringify({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64Data,
              });
              setItemValueOverrides((prev) => ({
                ...prev,
                [item.id]: storedVal,
              }));
              const targetIdx =
                item.pageIndex !== undefined
                  ? item.pageIndex
                  : activePageIndex;
              updateElementAttribute(
                targetIdx,
                item.id,
                {
                  "data-interaction": "download",
                  "data-interaction-value":
                    storedVal,
                },
              );
              setUploadingItems((prev) => ({
                ...prev,
                [item.id]: false,
              }));
            };
            reader.onerror = () =>
              setUploadingItems((prev) => ({
                ...prev,
                [item.id]: false,
              }));
            reader.readAsDataURL(file);
          }
        }}
        isUploading={uploadingItems[item.id]}
        fileMeta={fileMeta}
        renderPreview={(meta) => {
          const isImage =
            meta.type?.startsWith("image/") ||
            meta.name?.match(
              /\.(jpg|jpeg|png|gif)$/i,
            );
          const cleanData = meta.data
            ? meta.data
                .replace(
                  "data:download-",
                  "data:",
                )
                .trim()
            : "";

          const optionsDropId = `download-options-${item.id}`;
          const isOptionsDropOpen =
            openDropdownId === optionsDropId;

          const threeDots = (
            <div
              className="absolute top-[0.4vw] right-[0.4vw] z-[20]"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                data-dropdown-trigger="true"
                className="bg-white rounded-[0.2vw] shadow-sm p-[0.1vw] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(
                    isOptionsDropOpen
                      ? null
                      : optionsDropId,
                  );
                }}
              >
                <Icon
                  icon="lucide:more-vertical"
                  className="text-gray-700 text-[1vw]"
                />
              </div>
              {isOptionsDropOpen && (
                <div
                  data-dropdown-menu="true"
                  className="absolute right-0 top-[calc(100%+0.2vw)] bg-white border border-gray-200 rounded-[0.4vw] shadow-lg py-[0.4vh] min-w-[7vw] z-[99999] flex flex-col"
                >
                  <div
                    className="px-[0.8vw] py-[0.6vh] text-[0.8vw] text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-[0.4vw]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(null);
                      const inputEl =
                        document.getElementById(
                          `download-upload-${item.id}`,
                        );
                      if (inputEl)
                        inputEl.click();
                    }}
                  >
                    <Icon
                      icon="lucide:refresh-cw"
                      className="text-[0.9vw]"
                    />{" "}
                    Replace
                  </div>
                  <div
                    className="px-[0.8vw] py-[0.6vh] text-[0.8vw] text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-[0.4vw]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(null);
                      setItemValueOverrides(
                        (prev) => ({
                          ...prev,
                          [item.id]: null,
                        }),
                      );
                      const targetIdx =
                        item.pageIndex !==
                        undefined
                          ? item.pageIndex
                          : activePageIndex;
                      if (
                        updateElementAttribute
                      ) {
                        updateElementAttribute(
                          targetIdx,
                          item.id,
                          {
                            "data-interaction":
                              "download",
                            "data-interaction-value":
                              "",
                          },
                        );
                      }
                    }}
                  >
                    <Icon
                      icon="lucide:trash-2"
                      className="text-[0.9vw]"
                    />{" "}
                    Delete
                  </div>
                </div>
              )}
            </div>
          );

          if (isImage && cleanData) {
            return (
              <>
                <img
                  src={cleanData}
                  alt={meta.name}
                  className="w-full h-full object-contain bg-[#F8F9FA]"
                />
                {threeDots}
              </>
            );
          }
          return (
            <div className="w-full h-full bg-[#F3F4F6] flex flex-col items-center justify-center relative border border-gray-200">
              <Icon
                icon="fluent:document-checkmark-24-regular"
                className="text-[#5145F6] text-[2vw]"
              />
              <span
                className="text-[0.6vw] font-medium text-gray-500 mt-[0.2vh] truncate text-center w-[12vw]"
                title={meta.name}
              >
                {meta.name}
              </span>
              {threeDots}
            </div>
          );
        }}
        emptyIcon=""
        emptyTitle={
          <div className="flex items-center gap-[0.4vw]">
            <Icon
              icon="lucide:plus"
              className="text-[1.2vw] text-[#9CA3AF]"
            />
            <span className="text-[0.85vw] text-[#9CA3AF] font-medium">
              Add Download File
            </span>
          </div>
        }
        subText=""
      />
    </div>
  );
};

export default DownloadAction;
