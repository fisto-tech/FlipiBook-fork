import { useState } from "react";
import ColorPicker from "../../../Color";
import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { fontFamilies } from "../../../../utils/pageEditor/constants";

/** Interaction editor — Info Box: content, typography and styling of the info box. */
const InfoBoxAction = ({
  activePageIndex,
  dropdownDirectionOverrides,
  item,
  openDropdownId,
  resolvedValue,
  setDropdownDirectionOverrides,
  setItemValueOverrides,
  setOpenDropdownId,
  updateElementAttribute,
}) => {
  const [pickerPos, setPickerPos] = useState({ top: 120, right: "19.5vw" });

  let infoData = {
    text: "",
    fontFamily: "Poppins",
    fontWeight: "Regular",
    fontSize: "14",
    textColor: "#555555",
    textOpacity: 100,
    bgColor: "#FFFFFF",
    bgOpacity: 100,
    animationStyle: "Default",
    animationSpeed: "Default",
  };
  try {
    if (
      resolvedValue &&
      resolvedValue.startsWith("{")
    ) {
      infoData = {
        ...infoData,
        ...JSON.parse(resolvedValue),
      };
      if (
        infoData.text &&
        infoData.text.length > 15
      ) {
        infoData.text = infoData.text.slice(
          0,
          15,
        );
      }
    }
  } catch {}

  const handleInfoChange = (key, val) => {
    const processedVal =
      key === "text" && typeof val === "string"
        ? val.slice(0, 15)
        : val;
    const newData = {
      ...infoData,
      [key]: processedVal,
    };
    const storedVal = JSON.stringify(newData);
    setItemValueOverrides((prev) => ({
      ...prev,
      [item.id]: storedVal,
    }));
  };

  const saveInfoToCanvas = (
    dataToSave = infoData,
  ) => {
    if (updateElementAttribute) {
      const storedVal =
        JSON.stringify(dataToSave);
      const targetIdx =
        item.pageIndex !== undefined
          ? item.pageIndex
          : activePageIndex;
      updateElementAttribute(targetIdx, item.id, {
        "data-interaction": "info-box",
        "data-interaction-value": storedVal,
      });
    }
  };

  const updateInfo = (key, val) => {
    const processedVal =
      key === "text" && typeof val === "string"
        ? val.slice(0, 15)
        : val;
    const newData = {
      ...infoData,
      [key]: processedVal,
    };
    handleInfoChange(key, processedVal);
    setTimeout(
      () => saveInfoToCanvas(newData),
      50,
    );
  };

  return (
    <div
      className="flex flex-col w-full gap-[1.2vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-[0.8vh]">
        <span className="text-[0.85vw] text-black font-medium">
          Enter Information
        </span>
        <div className="relative w-full">
          <textarea
            className="w-full h-[9vh] border border-gray-300 rounded-[0.4vw] p-[0.6vw] pb-[1.5vw] outline-none resize-none focus:border-[#5145F6] transition-colors"
            style={{
              color: infoData.textColor,
              backgroundColor: infoData.bgColor,
              fontFamily: infoData.fontFamily,
              fontWeight:
                infoData.fontWeight === "Bold"
                  ? "800"
                  : infoData.fontWeight ===
                      "Semi Bold"
                    ? "600"
                    : infoData.fontWeight ===
                        "Medium"
                      ? "500"
                      : infoData.fontWeight ===
                          "Regular"
                        ? "400"
                        : infoData.fontWeight ===
                            "Light"
                          ? "200"
                          : infoData.fontWeight ===
                              "Extra Light"
                            ? "100"
                            : infoData.fontWeight ===
                                "Thin"
                              ? "50"
                              : "normal",
              fontSize: `${infoData.fontSize}px`,
            }}
            placeholder="Enter text"
            maxLength={15}
            value={infoData.text}
            onChange={(e) =>
              handleInfoChange(
                "text",
                e.target.value.slice(0, 15),
              )
            }
            onBlur={() => saveInfoToCanvas()}
          />
          <span className="absolute bottom-[0.4vw] right-[0.6vw] text-[0.7vw] text-gray-400 font-medium">
            {(infoData.text || "").length}/15
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-[0.8vh]">
        <div className="relative w-full">
          {(() => {
            const fontDropId = `info-font-drop-${item.id}`;
            const isFontDropOpen =
              openDropdownId === fontDropId;
            return (
              <>
                <div
                  data-dropdown-trigger="true"
                  className={`w-full h-[4vh] border ${isFontDropOpen ? "border-[#5145F6]" : "border-gray-300"} rounded-[0.4vw] flex items-center justify-between px-[0.8vw] bg-white cursor-pointer select-none transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isFontDropOpen) {
                      const rect =
                        e.currentTarget.getBoundingClientRect();
                      const spaceBelow =
                        window.innerHeight -
                        rect.bottom;
                      setDropdownDirectionOverrides(
                        (prev) => ({
                          ...prev,
                          [fontDropId]:
                            spaceBelow < 250
                              ? "up"
                              : "down",
                        }),
                      );
                    }
                    setOpenDropdownId(
                      isFontDropOpen
                        ? null
                        : fontDropId,
                    );
                  }}
                >
                  <span className="text-[0.8vw] text-gray-600 truncate">
                    {infoData.fontFamily}
                  </span>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`text-gray-400 text-[1vw] transition-transform duration-200 ${isFontDropOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isFontDropOpen && (
                  <div
                    data-dropdown-menu="true"
                    className={`absolute left-0 z-[99999] w-full bg-white border border-gray-200 rounded-[0.6vw] shadow-lg py-[0.5vh] max-h-[20vh] overflow-y-auto ${dropdownDirectionOverrides[fontDropId] === "up" ? "bottom-[calc(100%+0.4vh)] origin-bottom" : "top-[calc(100%+0.4vh)] origin-top"}`}
                  >
                    {fontFamilies.map((font) => (
                      <div
                        key={font}
                        className={`px-[1vw] py-[0.8vh] text-[0.85vw] cursor-pointer transition-colors ${font === infoData.fontFamily ? "bg-[#F1F5F9] text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        style={{
                          fontFamily: font,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateInfo(
                            "fontFamily",
                            font,
                          );
                          setOpenDropdownId(null);
                        }}
                      >
                        {font}
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
        <div className="flex gap-[0.8vw]">
          <div className="relative w-[65%]">
            {(() => {
              const weightDropId = `info-weight-drop-${item.id}`;
              const isWeightDropOpen =
                openDropdownId === weightDropId;
              const infoFontWeights = [
                { label: "Thin", value: "50" },
                {
                  label: "Extra Light",
                  value: "100",
                },
                { label: "Light", value: "200" },
                {
                  label: "Regular",
                  value: "400",
                },
                { label: "Medium", value: "500" },
                {
                  label: "Semi Bold",
                  value: "600",
                },
                { label: "Bold", value: "800" },
              ];
              return (
                <>
                  <div
                    data-dropdown-trigger="true"
                    className={`w-full h-[4vh] border ${isWeightDropOpen ? "border-[#5145F6]" : "border-gray-300"} rounded-[0.4vw] flex items-center justify-between px-[0.8vw] bg-white cursor-pointer select-none transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isWeightDropOpen) {
                        const rect =
                          e.currentTarget.getBoundingClientRect();
                        const spaceBelow =
                          window.innerHeight -
                          rect.bottom;
                        setDropdownDirectionOverrides(
                          (prev) => ({
                            ...prev,
                            [weightDropId]:
                              spaceBelow < 250
                                ? "up"
                                : "down",
                          }),
                        );
                      }
                      setOpenDropdownId(
                        isWeightDropOpen
                          ? null
                          : weightDropId,
                      );
                    }}
                  >
                    <span className="text-[0.8vw] text-gray-600 truncate">
                      {infoData.fontWeight}
                    </span>
                    <Icon
                      icon="lucide:chevron-down"
                      className={`text-gray-400 text-[1vw] transition-transform duration-200 ${isWeightDropOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  {isWeightDropOpen && (
                    <div
                      data-dropdown-menu="true"
                      className={`absolute left-0 z-[99999] w-full bg-white border border-gray-200 rounded-[0.6vw] shadow-lg py-[0.5vh] max-h-[20vh] overflow-y-auto ${dropdownDirectionOverrides[weightDropId] === "up" ? "bottom-[calc(100%+0.4vh)] origin-bottom" : "top-[calc(100%+0.4vh)] origin-top"}`}
                    >
                      {infoFontWeights.map(
                        (fw) => (
                          <div
                            key={fw.label}
                            className={`px-[1vw] py-[0.8vh] text-[0.85vw] cursor-pointer transition-colors ${fw.label === infoData.fontWeight ? "bg-[#F1F5F9] text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                            style={{
                              fontWeight:
                                fw.value,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateInfo(
                                "fontWeight",
                                fw.label,
                              );
                              setOpenDropdownId(
                                null,
                              );
                            }}
                          >
                            {fw.label}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <div className="relative w-[35%]">
            {(() => {
              const sizeDropId = `info-size-drop-${item.id}`;
              const isSizeDropOpen =
                openDropdownId === sizeDropId;
              const sizes = Array.from(
                { length: 50 },
                (_, i) => String((i + 1) * 2),
              );
              return (
                <>
                  <div
                    data-dropdown-trigger="true"
                    className={`w-full h-[4vh] border ${isSizeDropOpen ? "border-[#5145F6]" : "border-gray-300"} rounded-[0.4vw] flex items-center justify-between px-[0.8vw] bg-white cursor-pointer select-none transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSizeDropOpen) {
                        const rect =
                          e.currentTarget.getBoundingClientRect();
                        const spaceBelow =
                          window.innerHeight -
                          rect.bottom;
                        setDropdownDirectionOverrides(
                          (prev) => ({
                            ...prev,
                            [sizeDropId]:
                              spaceBelow < 250
                                ? "up"
                                : "down",
                          }),
                        );
                      }
                      setOpenDropdownId(
                        isSizeDropOpen
                          ? null
                          : sizeDropId,
                      );
                    }}
                  >
                    <span className="text-[0.8vw] text-gray-600 truncate">
                      {infoData.fontSize}
                    </span>
                    <Icon
                      icon="lucide:chevron-down"
                      className={`text-gray-400 text-[1vw] transition-transform duration-200 ${isSizeDropOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  {isSizeDropOpen && (
                    <div
                      data-dropdown-menu="true"
                      className={`absolute left-0 z-[99999] w-full bg-white border border-gray-200 rounded-[0.6vw] shadow-lg py-[0.5vh] max-h-[20vh] overflow-y-auto ${dropdownDirectionOverrides[sizeDropId] === "up" ? "bottom-[calc(100%+0.4vh)] origin-bottom" : "top-[calc(100%+0.4vh)] origin-top"}`}
                    >
                      {sizes.map((size) => (
                        <div
                          key={size}
                          className={`px-[1vw] py-[0.8vh] text-[0.85vw] cursor-pointer text-center transition-colors ${size === String(infoData.fontSize) ? "bg-[#5145F6] text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateInfo(
                              "fontSize",
                              size,
                            );
                            setOpenDropdownId(
                              null,
                            );
                          }}
                        >
                          {size}
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

      <div className="flex items-center gap-[0.8vw] mt-[0.5vh]">
        <span className="text-[0.85vw] text-black font-semibold">
          Colors
        </span>
        <div className="flex-1 h-[1px] bg-gray-200"></div>
      </div>

      <div className="flex flex-col gap-[0.8vh]">
        {(() => {
          const colorDropId = `info-text-color-${item.id}`;
          const isColorDropOpen =
            openDropdownId === colorDropId;
          return (
            <div className="flex items-center justify-between relative">
              <span className="text-[0.85vw] text-gray-800 font-medium">
                Text Color :
              </span>
              <div className="flex items-center gap-[0.5vw]">
                <div
                  data-dropdown-trigger="true"
                  className="w-[2vw] h-[2vw] rounded-[0.4vw] border border-gray-300 cursor-pointer"
                  style={{
                    backgroundColor:
                      infoData.textColor,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const cardEl = e.currentTarget.closest('[data-interaction-card-id]') || e.currentTarget.closest('.border-\\[0\\.15vw\\]');
                    const cardRect = cardEl ? cardEl.getBoundingClientRect() : null;
                    const cardLeft = cardRect ? cardRect.left : rect.left;
                    const cardTop = cardRect ? cardRect.top : 200;
                    const top = Math.max(80, Math.min(cardTop, window.innerHeight - 480));
                    const right = `calc(100vw - ${cardLeft}px + 0.8vw)`;
                    setPickerPos({ top, right });
                    setOpenDropdownId(
                      isColorDropOpen
                        ? null
                        : colorDropId,
                    );
                  }}
                />
                <div className="flex items-center justify-between w-[9vw] h-[4vh] border border-gray-300 rounded-[0.4vw] px-[0.6vw] bg-white">
                  <input
                    type="text"
                    className="text-[0.8vw] text-gray-600 outline-none w-[4.5vw] bg-transparent uppercase"
                    value={infoData.textColor}
                    onChange={(e) =>
                      handleInfoChange(
                        "textColor",
                        e.target.value,
                      )
                    }
                    onBlur={() =>
                      saveInfoToCanvas()
                    }
                  />
                  <span className="text-[0.8vw] text-gray-600">
                    {infoData.textOpacity !== undefined ? infoData.textOpacity : 100}%
                  </span>
                </div>
              </div>
              {isColorDropOpen &&
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[99998] cursor-default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(null);
                        saveInfoToCanvas();
                      }}
                    />
                    <div
                      data-dropdown-menu="true"
                      className="fixed z-[99999]"
                      style={{
                        right: pickerPos.right,
                        top: pickerPos.top,
                      }}
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <ColorPicker
                        color={infoData.textColor}
                        onChange={(color) =>
                          handleInfoChange(
                            "textColor",
                            color,
                          )
                        }
                        opacity={infoData.textOpacity !== undefined ? infoData.textOpacity : 100}
                        onOpacityChange={(op) =>
                          handleInfoChange(
                            "textOpacity",
                            op,
                          )
                        }
                        onClose={() => {
                          setOpenDropdownId(null);
                          saveInfoToCanvas();
                        }}
                        disableGradient={true}
                      />
                    </div>
                  </>,
                  document.body,
                )}
            </div>
          );
        })()}

        {(() => {
          const bgColorDropId = `info-bg-color-${item.id}`;
          const isBgColorDropOpen =
            openDropdownId === bgColorDropId;
          return (
            <div className="flex items-center justify-between relative">
              <span className="text-[0.85vw] text-gray-800 font-medium">
                Bg Color :
              </span>
              <div className="flex items-center gap-[0.5vw]">
                <div
                  data-dropdown-trigger="true"
                  className="w-[2vw] h-[2vw] rounded-[0.4vw] border border-gray-300 cursor-pointer"
                  style={{
                    backgroundColor:
                      infoData.bgColor,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const cardEl = e.currentTarget.closest('[data-interaction-card-id]') || e.currentTarget.closest('.border-\\[0\\.15vw\\]');
                    const cardRect = cardEl ? cardEl.getBoundingClientRect() : null;
                    const cardLeft = cardRect ? cardRect.left : rect.left;
                    const cardTop = cardRect ? cardRect.top : 200;
                    const top = Math.max(80, Math.min(cardTop, window.innerHeight - 480));
                    const right = `calc(100vw - ${cardLeft}px + 0.8vw)`;
                    setPickerPos({ top, right });
                    setOpenDropdownId(
                      isBgColorDropOpen
                        ? null
                        : bgColorDropId,
                    );
                  }}
                />
                <div className="flex items-center justify-between w-[9vw] h-[4vh] border border-gray-300 rounded-[0.4vw] px-[0.6vw] bg-white">
                  <input
                    type="text"
                    className="text-[0.8vw] text-gray-600 outline-none w-[4.5vw] bg-transparent uppercase"
                    value={infoData.bgColor}
                    onChange={(e) =>
                      handleInfoChange(
                        "bgColor",
                        e.target.value,
                      )
                    }
                    onBlur={() =>
                      saveInfoToCanvas()
                    }
                  />
                  <span className="text-[0.8vw] text-gray-600">
                    {infoData.bgOpacity !== undefined ? infoData.bgOpacity : 100}%
                  </span>
                </div>
              </div>
              {isBgColorDropOpen &&
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[99998] cursor-default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(null);
                        saveInfoToCanvas();
                      }}
                    />
                    <div
                      data-dropdown-menu="true"
                      className="fixed z-[99999]"
                      style={{
                        right: pickerPos.right,
                        top: pickerPos.top,
                      }}
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <ColorPicker
                        color={infoData.bgColor}
                        onChange={(color) =>
                          handleInfoChange(
                            "bgColor",
                            color,
                          )
                        }
                        opacity={infoData.bgOpacity !== undefined ? infoData.bgOpacity : 100}
                        onOpacityChange={(op) =>
                          handleInfoChange(
                            "bgOpacity",
                            op,
                          )
                        }
                        onClose={() => {
                          setOpenDropdownId(null);
                          saveInfoToCanvas();
                        }}
                        disableGradient={true}
                      />
                    </div>
                  </>,
                  document.body,
                )}
            </div>
          );
        })()}
      </div>

      <div className="flex items-center gap-[0.8vw] mt-[0.5vh]">
        <span className="text-[0.85vw] text-black font-semibold">
          Animation
        </span>
        <div className="flex-1 h-[1px] bg-gray-200"></div>
      </div>

      <div className="flex flex-col gap-[1vh]">
        {(() => {
          const animStyleDropId = `info-anim-style-${item.id}`;
          const isAnimStyleDropOpen =
            openDropdownId === animStyleDropId;
          const animStyles = [
            "Default",
            "Fade in",
            "Slide up",
            "Zoom in",
            "Bounce in",
          ];
          return (
            <div className="flex items-center justify-between">
              <span className="text-[0.85vw] text-gray-800 font-medium">
                Animation Style :
              </span>
              <div className="relative w-[10vw]">
                <div
                  data-dropdown-trigger="true"
                  className={`w-full h-[4vh] border ${isAnimStyleDropOpen ? "border-[#5145F6]" : "border-gray-300"} rounded-[0.4vw] flex items-center justify-between px-[0.8vw] bg-white cursor-pointer select-none transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAnimStyleDropOpen) {
                      const rect =
                        e.currentTarget.getBoundingClientRect();
                      const spaceBelow =
                        window.innerHeight -
                        rect.bottom;
                      setDropdownDirectionOverrides(
                        (prev) => ({
                          ...prev,
                          [animStyleDropId]:
                            spaceBelow < 250
                              ? "up"
                              : "down",
                        }),
                      );
                    }
                    setOpenDropdownId(
                      isAnimStyleDropOpen
                        ? null
                        : animStyleDropId,
                    );
                  }}
                >
                  <span className="text-[0.8vw] text-gray-600 truncate">
                    {infoData.animationStyle}
                  </span>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`text-gray-400 text-[1vw] transition-transform duration-200 ${isAnimStyleDropOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isAnimStyleDropOpen && (
                  <div
                    data-dropdown-menu="true"
                    className={`absolute left-0 z-[99999] w-full bg-white border border-gray-200 rounded-[0.6vw] shadow-lg py-[0.5vh] max-h-[20vh] overflow-y-auto ${dropdownDirectionOverrides[animStyleDropId] === "up" ? "bottom-[calc(100%+0.4vh)] origin-bottom" : "top-[calc(100%+0.4vh)] origin-top"}`}
                  >
                    {animStyles.map((style) => (
                      <div
                        key={style}
                        className={`px-[1vw] py-[0.8vh] text-[0.85vw] cursor-pointer transition-colors ${style === infoData.animationStyle ? "bg-[#F1F5F9] text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateInfo(
                            "animationStyle",
                            style,
                          );
                          setOpenDropdownId(null);
                        }}
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
        {(() => {
          const animSpeedDropId = `info-anim-speed-${item.id}`;
          const isAnimSpeedDropOpen =
            openDropdownId === animSpeedDropId;
          const animSpeeds = [
            "Default",
            "Slow",
            "Medium",
            "Fast",
          ];
          return (
            <div className="flex items-center justify-between">
              <span className="text-[0.85vw] text-gray-800 font-medium">
                Animation Speed :
              </span>
              <div className="relative w-[10vw]">
                <div
                  data-dropdown-trigger="true"
                  className={`w-full h-[4vh] border ${isAnimSpeedDropOpen ? "border-[#5145F6]" : "border-gray-300"} rounded-[0.4vw] flex items-center justify-between px-[0.8vw] bg-white cursor-pointer select-none transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAnimSpeedDropOpen) {
                      const rect =
                        e.currentTarget.getBoundingClientRect();
                      const spaceBelow =
                        window.innerHeight -
                        rect.bottom;
                      setDropdownDirectionOverrides(
                        (prev) => ({
                          ...prev,
                          [animSpeedDropId]:
                            spaceBelow < 250
                              ? "up"
                              : "down",
                        }),
                      );
                    }
                    setOpenDropdownId(
                      isAnimSpeedDropOpen
                        ? null
                        : animSpeedDropId,
                    );
                  }}
                >
                  <span className="text-[0.8vw] text-gray-600 truncate">
                    {infoData.animationSpeed}
                  </span>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`text-gray-400 text-[1vw] transition-transform duration-200 ${isAnimSpeedDropOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isAnimSpeedDropOpen && (
                  <div
                    data-dropdown-menu="true"
                    className={`absolute left-0 z-[99999] w-full bg-white border border-gray-200 rounded-[0.6vw] shadow-lg py-[0.5vh] max-h-[20vh] overflow-y-auto ${dropdownDirectionOverrides[animSpeedDropId] === "up" ? "bottom-[calc(100%+0.4vh)] origin-bottom" : "top-[calc(100%+0.4vh)] origin-top"}`}
                  >
                    {animSpeeds.map((speed) => (
                      <div
                        key={speed}
                        className={`px-[1vw] py-[0.8vh] text-[0.85vw] cursor-pointer transition-colors ${speed === infoData.animationSpeed ? "bg-[#F1F5F9] text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateInfo(
                            "animationSpeed",
                            speed,
                          );
                          setOpenDropdownId(null);
                        }}
                      >
                        {speed}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default InfoBoxAction;
