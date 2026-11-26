import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import { optimizeImageForWeb, shouldOptimizeImage } from "../../../../utils/imageOptimizer";

/** Interaction editor — Slideshow: manage slideshow images (upload, reorder, gallery). */
const SlideshowAction = ({
  activePageIndex,
  dropdownDirectionOverrides,
  isCompressingInteractionSlideshow,
  item,
  itemValueOverrides,
  openDropdownId,
  resolveSlideshowImageUrl,
  resolvedValue,
  setActiveSlideshowItem,
  setDropdownDirectionOverrides,
  setIsCompressingInteractionSlideshow,
  setIsSlideshowGalleryOpen,
  setItemValueOverrides,
  setOpenDropdownId,
  setSlideshowDragIdx,
  setSlideshowDragOverIdx,
  slideshowDragIdx,
  slideshowDragOverIdx,
  updateElementAttribute,
}) => {
    let images = [];
    try {
      if (resolvedValue) {
        images = JSON.parse(resolvedValue);
        if (!Array.isArray(images)) images = [];
      }
    } catch {}

    const handleFilesToAdd = async (files) => {
      const fileArray = Array.from(files || []);
      if (!fileArray.length) return;

      const spaceLeft = 6 - images.length;
      if (spaceLeft <= 0) {
        alert(
          "You can only add up to 6 images in slideshow.",
        );
        return;
      }
      const filesToProcess = fileArray.slice(
        0,
        spaceLeft,
      );
      if (fileArray.length > spaceLeft) {
        alert(
          `You can only add up to 6 images. Only the first ${spaceLeft} were added.`,
        );
      }

      setIsCompressingInteractionSlideshow(true);

      try {
        const readPromises = filesToProcess.map(
          async (file) => {
            let finalData = null;
            let fileName = file.name || "image.webp";

            if (shouldOptimizeImage(file)) {
              try {
                const opt = await optimizeImageForWeb(file, { maxDimension: 2048, quality: 0.82 });
                if (opt?.dataUrl) {
                  finalData = opt.dataUrl;
                }
              } catch (optErr) {
                console.warn("[InteractionPanel] Optimization fallback:", optErr);
              }
            }

            if (!finalData) {
              finalData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
              });
            }

            if (!finalData) return null;

            return {
              name: fileName,
              data: finalData,
              url: finalData,
            };
          },
        );

        const readResults = (
          await Promise.all(readPromises)
        ).filter(Boolean);

      // Deduplicate against existing images and across incoming files
      const existingKeys = new Set(
        images.map((img) =>
          typeof img === "string"
            ? img
            : img.data || img.url || "",
        ),
      );
      const existingNames = new Set(
        images.map((img) =>
          typeof img === "object" ? img.name : "",
        ),
      );

      const newUnique = [];
      for (const itemImg of readResults) {
        const key = itemImg.data;
        if (
          !existingKeys.has(key) &&
          !existingNames.has(itemImg.name)
        ) {
          existingKeys.add(key);
          existingNames.add(itemImg.name);
          newUnique.push(itemImg);
        }
      }

      if (!newUnique.length) return;

      const updatedImages = [
        ...images,
        ...newUnique,
      ].slice(0, 6);
      const storedVal =
        JSON.stringify(updatedImages);
      setItemValueOverrides((prev) => ({
        ...prev,
        [item.id]: storedVal,
      }));
      const targetIdx =
        item.pageIndex !== undefined
          ? item.pageIndex
          : activePageIndex;
      if (updateElementAttribute) {
        updateElementAttribute(targetIdx, item.id, {
          "data-interaction": "slideshow",
          "data-interaction-value": storedVal,
        });
      }
    } finally {
      setIsCompressingInteractionSlideshow(false);
    }
  };

    const handleRemoveImage = (idx) => {
      const newImages = [...images];
      newImages.splice(idx, 1);
      const storedVal = JSON.stringify(newImages);
      setItemValueOverrides((prev) => ({
        ...prev,
        [item.id]: storedVal,
      }));
      const targetIdx =
        item.pageIndex !== undefined
          ? item.pageIndex
          : activePageIndex;
      if (updateElementAttribute) {
        updateElementAttribute(targetIdx, item.id, {
          "data-interaction": "slideshow",
          "data-interaction-value": storedVal,
        });
      }
    };

    const handleReorderImages = (
      fromIdx,
      toIdx,
    ) => {
      if (
        fromIdx === toIdx ||
        fromIdx < 0 ||
        toIdx < 0 ||
        fromIdx >= images.length ||
        toIdx >= images.length
      )
        return;
      const newImages = [...images];
      const [moved] = newImages.splice(fromIdx, 1);
      newImages.splice(toIdx, 0, moved);
      const storedVal = JSON.stringify(newImages);
      setItemValueOverrides((prev) => ({
        ...prev,
        [item.id]: storedVal,
      }));
      const targetIdx =
        item.pageIndex !== undefined
          ? item.pageIndex
          : activePageIndex;
      if (updateElementAttribute) {
        updateElementAttribute(targetIdx, item.id, {
          "data-interaction": "slideshow",
          "data-interaction-value": storedVal,
        });
      }
    };

    return (
      <div
        className="flex flex-col w-full gap-[1.5vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Section Header: Slideshow Images 0 / 6 */}
        <div className="flex items-center justify-between w-full">
          <span className="text-[0.85vw] font-semibold text-gray-800">
            Slideshow Images
          </span>
          <span className="text-[0.78vw] font-medium text-gray-500">
            {images.length} / 6
          </span>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          id={`slideshow-upload-${item.id}`}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => {
            handleFilesToAdd(e.target.files);
            e.target.value = "";
          }}
        />

        {images.length === 0 ? (
          <div className="flex flex-col w-full">
            {/* Empty State Centered */}
            <div className="flex flex-col items-center justify-center py-[2.2vh]">
              <div className="w-[2.5vw] h-[2.5vw] text-gray-400 mb-[0.6vh] flex items-center justify-center">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    width="18"
                    height="18"
                    x="3"
                    y="3"
                    rx="2"
                    ry="2"
                  />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                  />
                  <path d="M21 15l-4-4a2 2 0 0 0-2.8 0L6 19" />
                  <path d="M9 15c.6-.8 1.4-1.2 2-1.2s1.4.4 2 1.2" />
                </svg>
              </div>
              <span className="text-[0.88vw] font-semibold text-gray-800">
                No images added yet
              </span>
              <span className="text-[0.72vw] text-gray-500 mt-[0.2vh]">
                Add up to 6 images to create your
                slideshow.
              </span>
            </div>

            {/* Two Column Action Cards */}
            <div className="grid grid-cols-2 gap-[0.8vw] w-full mt-[0.5vh]">
              {/* Upload Images Card */}
              <div
                className="border border-gray-200 bg-gray-50/70 hover:bg-gray-100 hover:border-gray-300 rounded-[0.6vw] py-[2vh] px-[0.8vw] flex flex-col items-center justify-center gap-[0.3vh] cursor-pointer transition-all select-none group"
                onClick={(e) => {
                  e.stopPropagation();
                  document
                    .getElementById(
                      `slideshow-upload-${item.id}`,
                    )
                    .click();
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add(
                    "border-[#EC5137]",
                    "bg-orange-50/40",
                  );
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove(
                    "border-[#EC5137]",
                    "bg-orange-50/40",
                  );
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove(
                    "border-[#EC5137]",
                    "bg-orange-50/40",
                  );
                  if (e.dataTransfer?.files) {
                    handleFilesToAdd(
                      e.dataTransfer.files,
                    );
                  }
                }}
              >
                {isCompressingInteractionSlideshow ? (
                  <>
                    <Loader2 className="w-[1.4vw] h-[1.4vw] text-[#5145F6] animate-spin mb-[0.2vh]" />
                    <span className="text-[0.82vw] font-semibold text-[#5145F6]">
                      Compressing...
                    </span>
                  </>
                ) : (
                  <>
                    <Icon
                      icon="lucide:upload"
                      className="text-gray-700 text-[1.3vw] mb-[0.2vh]"
                    />
                    <span className="text-[0.82vw] font-semibold text-gray-800">
                      Upload Images
                    </span>
                    <span className="text-[0.68vw] text-gray-500">
                      From your device
                    </span>
                  </>
                )}
              </div>

              {/* Image Gallery Card */}
              <div
                className="border border-gray-200 bg-gray-50/70 hover:bg-gray-100 hover:border-gray-300 rounded-[0.6vw] py-[2vh] px-[0.8vw] flex flex-col items-center justify-center gap-[0.3vh] cursor-pointer transition-all select-none group"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlideshowItem({
                    id: item.id,
                    pageIndex:
                      item.pageIndex !== undefined
                        ? item.pageIndex
                        : activePageIndex,
                    currentImages: images,
                  });
                  setIsSlideshowGalleryOpen(true);
                }}
              >
                <Icon
                  icon="solar:gallery-wide-bold"
                  className="text-gray-700 text-[1.3vw] mb-[0.2vh]"
                />
                <span className="text-[0.82vw] font-semibold text-gray-800">
                  Image Gallery
                </span>
                <span className="text-[0.68vw] text-gray-500">
                  Choose saved images
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[0.8vh] w-full">
            <div className="grid grid-cols-3 gap-[0.6vw]">
              {images.map((img, idx) => {
                const isDraggingThis =
                  slideshowDragIdx === idx;
                const isDragOverThis =
                  slideshowDragOverIdx === idx &&
                  slideshowDragIdx !== idx;

                return (
                  <div
                    key={idx}
                    draggable={true}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.setData(
                        "text/plain",
                        idx.toString(),
                      );
                      e.dataTransfer.effectAllowed =
                        "move";
                      setSlideshowDragIdx(idx);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect =
                        "move";
                      if (
                        slideshowDragOverIdx !== idx
                      ) {
                        setSlideshowDragOverIdx(
                          idx,
                        );
                      }
                    }}
                    onDragLeave={(e) => {
                      e.stopPropagation();
                      if (
                        slideshowDragOverIdx === idx
                      ) {
                        setSlideshowDragOverIdx(
                          null,
                        );
                      }
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                      setSlideshowDragIdx(null);
                      setSlideshowDragOverIdx(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const src =
                        e.dataTransfer.getData(
                          "text/plain",
                        );
                      if (src !== "") {
                        const from = parseInt(
                          src,
                          10,
                        );
                        if (
                          !isNaN(from) &&
                          from !== idx
                        ) {
                          handleReorderImages(
                            from,
                            idx,
                          );
                        }
                      }
                      setSlideshowDragIdx(null);
                      setSlideshowDragOverIdx(null);
                    }}
                    className={`relative aspect-video rounded-[0.5vw] overflow-hidden border group bg-gray-100 cursor-grab active:cursor-grabbing transition-all select-none ${
                      isDraggingThis
                        ? "opacity-40 ring-2 ring-[#EC5137] scale-95"
                        : isDragOverThis
                          ? "border-[#EC5137] ring-2 ring-[#EC5137]/40 scale-105 shadow-md bg-orange-50/50"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Slide Index Badge (1, 2, 3...) */}
                    <div className="absolute top-[0.25vw] left-[0.25vw] w-[1.1vw] h-[1.1vw] rounded-full bg-black/65 backdrop-blur-[2px] text-white text-[0.58vw] font-bold flex items-center justify-center z-10 shadow-sm pointer-events-none border border-white/20">
                      {idx + 1}
                    </div>

                    <img
                      src={resolveSlideshowImageUrl(
                        img,
                      )}
                      alt={
                        img.name || `slide-${idx}`
                      }
                      className="w-full h-full object-cover pointer-events-none"
                    />

                    {/* Hover Action Overlay: Move Left, Trash, Move Right */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-[0.3vw] z-10">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderImages(
                              idx,
                              idx - 1,
                            );
                          }}
                          className="w-[1.4vw] h-[1.4vw] rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110"
                          title="Move left / earlier"
                        >
                          <Icon
                            icon="lucide:chevron-left"
                            className="text-[0.85vw]"
                          />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="w-[1.4vw] h-[1.4vw] rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110"
                        title="Remove image"
                      >
                        <Icon
                          icon="lucide:trash-2"
                          className="text-[0.75vw]"
                        />
                      </button>

                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderImages(
                              idx,
                              idx + 1,
                            );
                          }}
                          className="w-[1.4vw] h-[1.4vw] rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110"
                          title="Move right / later"
                        >
                          <Icon
                            icon="lucide:chevron-right"
                            className="text-[0.85vw]"
                          />
                        </button>
                      )}
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-[0.4vw] py-[0.15vw] text-[0.58vw] text-white truncate pointer-events-none">
                      {img.name ||
                        `Image ${idx + 1}`}
                    </div>
                  </div>
                );
              })}
            </div>

            {images.length > 1 && (
              <div className="flex items-center justify-center text-[0.62vw] text-gray-400 select-none">
                <span>
                  Drag & drop or use arrows to
                  reorder slides
                </span>
              </div>
            )}

            {images.length < 6 && (
              <div className="grid grid-cols-2 gap-[0.6vw] mt-[0.3vh]">
                <button
                  disabled={isCompressingInteractionSlideshow}
                  onClick={() =>
                    !isCompressingInteractionSlideshow &&
                    document
                      .getElementById(
                        `slideshow-upload-${item.id}`,
                      )
                      .click()
                  }
                  className={`py-[0.8vh] px-[0.8vw] rounded-[0.5vw] flex items-center justify-center gap-[0.4vw] text-[0.74vw] font-medium transition-colors shadow-2xs ${
                    isCompressingInteractionSlideshow
                      ? "bg-indigo-50 border border-indigo-200 text-[#5145F6] cursor-wait"
                      : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 cursor-pointer"
                  }`}
                >
                  {isCompressingInteractionSlideshow ? (
                    <>
                      <Loader2 className="w-[0.9vw] h-[0.9vw] animate-spin text-[#5145F6]" />
                      <span>Compressing...</span>
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="lucide:upload"
                        className="text-[0.9vw] text-gray-600"
                      />
                      <span>
                        Upload ({6 - images.length}{" "}
                        left)
                      </span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveSlideshowItem({
                      id: item.id,
                      pageIndex:
                        item.pageIndex !== undefined
                          ? item.pageIndex
                          : activePageIndex,
                      currentImages: images,
                    });
                    setIsSlideshowGalleryOpen(true);
                  }}
                  className="py-[0.8vh] px-[0.8vw] bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-[0.5vw] flex items-center justify-center gap-[0.4vw] text-gray-700 hover:text-gray-900 text-[0.74vw] font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  <Icon
                    icon="solar:gallery-wide-bold"
                    className="text-[0.9vw] text-gray-600"
                  />
                  <span>Gallery</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transition Settings */}
        <div className="flex flex-col gap-[1.2vh] mt-[0.8vh]">
          <span className="text-[0.85vw] font-semibold text-gray-800">
            Transition Settings
          </span>

          {/* Effect Row */}
          {(() => {
            const effectDropId = `slideshow-effect-${item.id}`;
            const isEffectDropOpen =
              openDropdownId === effectDropId;
            const slideshowEffects = [
              {
                value: "3D Flip",
                label: "3D Flip",
              },
              {
                value: "Spring Bounce",
                label: "Spring Bounce",
              },
              {
                value: "Cover Flow",
                label: "Cover Flow",
              },
              {
                value: "Play Cards",
                label: "Play Cards",
              },
              { value: "Zoom", label: "Zoom" },
              { value: "Drop", label: "Drop" },
            ];
            const savedEffect = document
              .getElementById(item.id)
              ?.getAttribute(
                "data-interaction-slideshow-effect",
              );
            const currentEffect =
              itemValueOverrides[effectDropId] ||
              savedEffect ||
              "3D Flip";
            const currentEffectLabel =
              slideshowEffects.find(
                (e) => e.value === currentEffect,
              )?.label || "3D Flip";

            return (
              <div className="flex items-center justify-between relative">
                <span className="text-[0.8vw] text-gray-700 font-medium">
                  Effect
                </span>
                <div
                  data-dropdown-trigger="true"
                  className={`w-[13.5vw] h-[3.8vh] border ${isEffectDropOpen ? "border-[#EC5137]" : "border-gray-200"} rounded-[0.5vw] flex items-center justify-between px-[0.8vw] cursor-pointer bg-white hover:border-gray-300 transition-colors select-none shadow-2xs`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isEffectDropOpen) {
                      const rect =
                        e.currentTarget.getBoundingClientRect();
                      const spaceBelow =
                        window.innerHeight -
                        rect.bottom;
                      setDropdownDirectionOverrides(
                        (prev) => ({
                          ...prev,
                          [effectDropId]:
                            spaceBelow < 220
                              ? "up"
                              : "down",
                        }),
                      );
                    }
                    setOpenDropdownId(
                      isEffectDropOpen
                        ? null
                        : effectDropId,
                    );
                  }}
                >
                  <span className="text-[0.78vw] text-gray-800 truncate">
                    {currentEffectLabel}
                  </span>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`text-gray-400 text-[0.9vw] transition-transform duration-200 ${isEffectDropOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isEffectDropOpen && (
                  <div
                    data-dropdown-menu="true"
                    className={`absolute right-0 w-[13.5vw] z-[99999] bg-white border border-gray-200 rounded-[0.5vw] shadow-xl py-[0.4vh] ${dropdownDirectionOverrides[effectDropId] === "up" ? "bottom-[calc(100%+0.4vh)] origin-bottom" : "top-[calc(100%+0.4vh)] origin-top"}`}
                  >
                    {slideshowEffects.map((eff) => (
                      <div
                        key={eff.value}
                        className={`px-[0.8vw] py-[0.7vh] text-[0.78vw] cursor-pointer transition-colors ${eff.value === currentEffect ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemValueOverrides(
                            (prev) => ({
                              ...prev,
                              [effectDropId]:
                                eff.value,
                            }),
                          );
                          const targetIdx =
                            item.pageIndex !==
                            undefined
                              ? item.pageIndex
                              : activePageIndex;
                          if (
                            updateElementAttribute
                          )
                            updateElementAttribute(
                              targetIdx,
                              item.id,
                              {
                                "data-interaction-slideshow-effect":
                                  eff.value,
                              },
                            );
                          setOpenDropdownId(null);
                        }}
                      >
                        {eff.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Speed Row */}
          {(() => {
            const speedDropId = `slideshow-speed-${item.id}`;
            const isSpeedDropOpen =
              openDropdownId === speedDropId;
            const slideshowSpeeds = [
              "Slow",
              "Medium",
              "Fast",
            ];
            const savedSpeed = document
              .getElementById(item.id)
              ?.getAttribute(
                "data-interaction-slideshow-speed",
              );
            const currentSpeed =
              itemValueOverrides[speedDropId] ||
              savedSpeed ||
              "Medium";

            return (
              <div className="flex items-center justify-between relative">
                <span className="text-[0.8vw] text-gray-700 font-medium">
                  Speed
                </span>
                <div
                  data-dropdown-trigger="true"
                  className={`w-[13.5vw] h-[3.8vh] border ${isSpeedDropOpen ? "border-[#EC5137]" : "border-gray-200"} rounded-[0.5vw] flex items-center justify-between px-[0.8vw] cursor-pointer bg-white hover:border-gray-300 transition-colors select-none shadow-2xs`}
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
                            spaceBelow < 200
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
                  <span className="text-[0.78vw] text-gray-800 truncate">
                    {currentSpeed}
                  </span>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`text-gray-400 text-[0.9vw] transition-transform duration-200 ${isSpeedDropOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isSpeedDropOpen && (
                  <div
                    data-dropdown-menu="true"
                    className={`absolute right-0 w-[13.5vw] z-[99999] bg-white border border-gray-200 rounded-[0.5vw] shadow-xl py-[0.4vh] ${dropdownDirectionOverrides[speedDropId] === "up" ? "bottom-[calc(100%+0.4vh)] origin-bottom" : "top-[calc(100%+0.4vh)] origin-top"}`}
                  >
                    {slideshowSpeeds.map((spd) => (
                      <div
                        key={spd}
                        className={`px-[0.8vw] py-[0.7vh] text-[0.78vw] cursor-pointer transition-colors ${spd === currentSpeed ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemValueOverrides(
                            (prev) => ({
                              ...prev,
                              [speedDropId]: spd,
                            }),
                          );
                          const targetIdx =
                            item.pageIndex !==
                            undefined
                              ? item.pageIndex
                              : activePageIndex;
                          if (
                            updateElementAttribute
                          )
                            updateElementAttribute(
                              targetIdx,
                              item.id,
                              {
                                "data-interaction-slideshow-speed":
                                  spd,
                              },
                            );
                          setOpenDropdownId(null);
                        }}
                      >
                        {spd}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    );
};

export default SlideshowAction;
