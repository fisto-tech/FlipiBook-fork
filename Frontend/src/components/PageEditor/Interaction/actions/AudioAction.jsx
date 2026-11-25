import { CommonDropBox } from "../components/CommonDropBox";
import { Icon } from "@iconify/react";
import axios from "axios";
import { formatAudioFileSize, formatAudioTime, formatRecordingTimePrecise, getAudioDurationFromMeta } from "../utils/audioFormatters";
import { resolveUploadsPath } from "../../../../utils/assets/assetUtils";

/** Interaction editor — Audio: upload or record audio, preview playback. */
const AudioAction = ({
  activeAudioRef,
  activePageIndex,
  audioPlaybackTimes,
  audioProgressPercent,
  audioSourceMode,
  effectiveBook,
  effectiveFolder,
  effectiveVId,
  handleAudioSeek,
  handleCancelRecording,
  handleSaveRecordedAudio,
  handleStartRecording,
  handleStopRecording,
  handleTogglePauseResumeRecording,
  handleTogglePlayAudio,
  isRecordingPaused,
  item,
  openDropdownId,
  playingAudioId,
  recordedDataMap,
  recordedPreviewPlaying,
  recordingItemId,
  recordingMillis,
  recordingWaveform,
  resolvedValue,
  setAudioSourceMode,
  setItemValueOverrides,
  setOpenDropdownId,
  setPlayingAudioId,
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
    } else if (resolvedValue) {
      fileMeta = {
        name: "Audio File",
        data: resolvedValue,
        url: resolvedValue,
      };
    }
  } catch {}

  const isRecordMode =
    audioSourceMode[item.id] === "record";
  const isRecordingThisItem =
    recordingItemId === item.id;
  const hasRecordedTake = Boolean(
    recordedDataMap[item.id],
  );
  const defaultAmbientWave = [
    0.15, 0.22, 0.18, 0.26, 0.35, 0.28, 0.42,
    0.55, 0.38, 0.62, 0.48, 0.72, 0.88, 0.65,
    0.45, 0.58, 0.42, 0.68, 0.82, 0.6, 0.48, 0.64,
    0.78, 0.92, 0.84,
  ];
  const displayWaveform =
    isRecordingThisItem &&
    recordingWaveform.length > 0
      ? recordingWaveform
      : hasRecordedTake &&
          recordedDataMap[item.id]?.waveform
            ?.length > 0
        ? recordedDataMap[item.id].waveform
        : defaultAmbientWave;

  return (
    <div
      className="flex flex-col w-full gap-[0.8vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-[0.85vw] text-black font-normal">
          {fileMeta && !isRecordMode
            ? "Audio Preview"
            : "Audio Interaction"}
        </span>
        {(!fileMeta || isRecordMode) && (
          <div className="flex items-center bg-gray-100 p-[0.15vw] rounded-[0.4vw]">
            <button
              type="button"
              onClick={() => {
                if (isRecordingThisItem)
                  handleCancelRecording(item.id);
                setAudioSourceMode((prev) => ({
                  ...prev,
                  [item.id]: "upload",
                }));
              }}
              className={`px-[0.6vw] py-[0.3vh] text-[0.7vw] font-medium rounded-[0.3vw] transition-all flex items-center gap-[0.3vw] ${
                !isRecordMode
                  ? "bg-white text-[#7C3AED] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon
                icon="lucide:upload-cloud"
                className="text-[0.8vw]"
              />
              Upload
            </button>
            <button
              type="button"
              onClick={() =>
                setAudioSourceMode((prev) => ({
                  ...prev,
                  [item.id]: "record",
                }))
              }
              className={`px-[0.6vw] py-[0.3vh] text-[0.7vw] font-medium rounded-[0.3vw] transition-all flex items-center gap-[0.3vw] ${
                isRecordMode
                  ? "bg-white text-[#7C3AED] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon
                icon="solar:microphone-3-bold"
                className="text-[0.8vw]"
              />
              Record
            </button>
          </div>
        )}
      </div>

      {isRecordMode ? (
        <div className="w-full h-[18vh] rounded-[0.6vw] bg-white border border-gray-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between items-center py-[1vh] px-[1vw] relative overflow-hidden select-none">
          {/* Top Timer Display (00:06,23) with sleek modern font */}
          <div className="flex items-center justify-center w-full relative pt-[0.1vh]">
            <span
              className="text-[1.3vw] font-semibold text-[#111827] tracking-tight leading-none"
              style={{
                fontFamily:
                  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontVariantNumeric:
                  "tabular-nums",
              }}
            >
              {isRecordingThisItem
                ? formatRecordingTimePrecise(
                    recordingMillis,
                  )
                : hasRecordedTake
                  ? formatRecordingTimePrecise(
                      recordedPreviewPlaying ===
                        item.id
                        ? recordingMillis
                        : recordedDataMap[item.id]
                            ?.durationMs ||
                            recordedDataMap[
                              item.id
                            ]?.duration * 1000,
                    )
                  : "00:00,00"}
            </span>
            {fileMeta && !isRecordingThisItem && (
              <button
                type="button"
                onClick={() => {
                  handleCancelRecording(item.id);
                  setAudioSourceMode((prev) => ({
                    ...prev,
                    [item.id]: "upload",
                  }));
                }}
                className="absolute right-0 top-0 text-[0.68vw] text-gray-400 hover:text-gray-700 flex items-center gap-[0.2vw]"
                title="Close and keep current audio"
              >
                <Icon
                  icon="lucide:x"
                  className="text-[0.85vw]"
                />
              </button>
            )}
          </div>

          {/* Waveform Visualization with Red Needle & Dashed Line (Uniform Bar Width) */}
          <div className="w-full flex items-center justify-center px-[0.6vw] h-[4.8vh] my-[0.1vh] overflow-hidden">
            <svg
              viewBox="0 0 240 42"
              className="w-full max-w-[19vw] h-full overflow-hidden select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient
                  id={`waveFade-${item.id}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor="white"
                    stopOpacity="0"
                  />
                  <stop
                    offset="15%"
                    stopColor="white"
                    stopOpacity="1"
                  />
                  <stop
                    offset="100%"
                    stopColor="white"
                    stopOpacity="1"
                  />
                </linearGradient>
                <mask id={`waveMask-${item.id}`}>
                  <rect
                    x="0"
                    y="0"
                    width="150"
                    height="42"
                    fill={`url(#waveFade-${item.id})`}
                  />
                </mask>
              </defs>

              {/* Soundwave bars (Uniform 2.4px width with rounded pill caps) */}
              <g
                mask={`url(#waveMask-${item.id})`}
              >
                {displayWaveform.map(
                  (val, idx) => {
                    const distFromNeedle =
                      displayWaveform.length -
                      1 -
                      idx;
                    const x =
                      144 - distFromNeedle * 5.8;
                    if (x < -6) return null;

                    const maxBarH = 34;
                    const barH = Math.max(
                      3.5,
                      Math.min(
                        maxBarH,
                        (val || 0.12) * maxBarH,
                      ),
                    );
                    const y = (42 - barH) / 2;

                    const ratio =
                      displayWaveform.length > 1
                        ? idx /
                          (displayWaveform.length -
                            1)
                        : 1;
                    const r = Math.round(
                      156 - ratio * 126,
                    );
                    const g = Math.round(
                      163 - ratio * 122,
                    );
                    const b = Math.round(
                      175 - ratio * 116,
                    );
                    const color = `rgb(${r}, ${g}, ${b})`;

                    return (
                      <rect
                        key={idx}
                        x={x}
                        y={y}
                        width="2.4"
                        height={barH}
                        rx="1.2"
                        fill={color}
                      />
                    );
                  },
                )}
              </g>

              {/* Red Playhead Needle (Matches 2.4px width of waveform bars) */}
              <rect
                x="150"
                y="3"
                width="2.4"
                height="36"
                rx="1.2"
                fill="#EF4444"
              />

              {/* Light Dashed Horizontal Line Extending Right */}
              <line
                x1="158"
                y1="21"
                x2="238"
                y2="21"
                stroke="#D1D5DB"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Bottom Controls (3 Buttons: Start/Stop, Pause/Play, Submit) */}
          <div className="flex items-center justify-center gap-[1.1vw] w-full pb-[0.2vh]">
            {/* 1. Start or Stop (Same Button) */}
            {isRecordingThisItem ? (
              <button
                type="button"
                onClick={() =>
                  handleStopRecording(item.id)
                }
                className="w-[2.4vw] h-[2.4vw] rounded-full bg-gradient-to-tr from-[#EF4444] to-[#F87171] hover:from-[#DC2626] hover:to-[#EF4444] shadow-[0_3px_10px_rgba(239,68,68,0.35)] flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                title="Stop Recording"
              >
                <div className="w-[0.8vw] h-[0.8vw] bg-white rounded-[0.18vw] shadow-xs" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleStartRecording(item.id)
                }
                className="w-[2.4vw] h-[2.4vw] rounded-full bg-gradient-to-tr from-[#EF4444] to-[#F87171] hover:from-[#DC2626] hover:to-[#EF4444] shadow-[0_3px_10px_rgba(239,68,68,0.35)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
                title={
                  hasRecordedTake
                    ? "Record Again"
                    : "Start Recording"
                }
              >
                <div className="w-[0.9vw] h-[0.9vw] bg-white rounded-full flex items-center justify-center shadow-xs">
                  <div className="w-[0.45vw] h-[0.45vw] bg-[#EF4444] rounded-full" />
                </div>
              </button>
            )}

            {/* 2. Pause or Resume Recording (Enabled ONLY while actively recording) */}
            {isRecordingThisItem ? (
              <button
                type="button"
                onClick={() =>
                  handleTogglePauseResumeRecording(
                    item.id,
                  )
                }
                className="w-[2.1vw] h-[2.1vw] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                title={
                  isRecordingPaused
                    ? "Resume Recording"
                    : "Pause Recording"
                }
              >
                <Icon
                  icon={
                    isRecordingPaused
                      ? "solar:play-bold"
                      : "solar:pause-bold"
                  }
                  className={`text-[0.95vw] text-gray-900 ${isRecordingPaused ? "ml-[0.1vw]" : ""}`}
                />
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-[2.1vw] h-[2.1vw] rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 opacity-35 cursor-not-allowed"
                title="Pause / Resume recording (enabled during recording)"
              >
                <Icon
                  icon="solar:pause-bold"
                  className="text-[0.95vw] text-gray-300"
                />
              </button>
            )}

            {/* 3. Submit (Tick Mark Button - Enabled ONLY after recording is stopped) */}
            {hasRecordedTake &&
            !isRecordingThisItem ? (
              <button
                type="button"
                disabled={uploadingItems[item.id]}
                onClick={() =>
                  handleSaveRecordedAudio(item)
                }
                className="w-[2.1vw] h-[2.1vw] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 active:scale-95 transition-all cursor-pointer"
                title="Submit / Save Audio"
              >
                {uploadingItems[item.id] ? (
                  <Icon
                    icon="lucide:loader-2"
                    className="animate-spin text-[0.95vw] text-[#7C3AED]"
                  />
                ) : (
                  <Icon
                    icon="lucide:check"
                    className="text-[1vw] text-emerald-600"
                    strokeWidth="2.5"
                  />
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-[2.1vw] h-[2.1vw] rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 opacity-35 cursor-not-allowed"
                title="Stop recording first to enable submit"
              >
                <Icon
                  icon="lucide:check"
                  className="text-[1vw] text-gray-300"
                  strokeWidth="2.5"
                />
              </button>
            )}
          </div>
        </div>
      ) : (
        <CommonDropBox
          boxClassName={`w-full h-[18vh] rounded-[0.6vw] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${fileMeta ? "p-0" : "bg-[#F3F4F6] hover:bg-gray-100 p-[0.3vw] gap-[0.5vh]"}`}
          boxStyle={
            !fileMeta
              ? {
                  backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%238A94A6' stroke-width='2' stroke-dasharray='5%2c 8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                }
              : {}
          }
          id={`audio-upload-${item.id}`}
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
          onFileSelect={async (file) => {
            if (file && updateElementAttribute) {
              if (!user) {
                alert(
                  "You must be logged in to upload a file.",
                );
                return;
              }

              setUploadingItems((prev) => ({
                ...prev,
                [item.id]: true,
              }));

              try {
                const backendUrl =
                  import.meta.env
                    .VITE_BACKEND_URL || "";
                const formData = new FormData();
                formData.append(
                  "emailId",
                  user.emailId || user.email,
                );
                if (effectiveVId)
                  formData.append(
                    "v_id",
                    effectiveVId,
                  );
                if (effectiveFolder)
                  formData.append(
                    "folderName",
                    effectiveFolder,
                  );
                if (effectiveBook)
                  formData.append(
                    "flipbookName",
                    effectiveBook,
                  );
                formData.append("type", "audio");
                formData.append(
                  "page_v_id",
                  "global",
                );
                formData.append("file", file);

                const res = await axios.post(
                  `${backendUrl}/api/flipbook/upload-asset`,
                  formData,
                  {
                    headers: {
                      "Content-Type":
                        "multipart/form-data",
                    },
                  },
                );

                if (res.data && res.data.url) {
                  const uploadedUrl =
                    resolveUploadsPath(
                      res.data.url,
                    );
                  const storedVal =
                    JSON.stringify({
                      name: file.name,
                      type:
                        file.type || "audio/mpeg",
                      size: file.size,
                      data: uploadedUrl,
                      url: uploadedUrl,
                    });

                  setItemValueOverrides(
                    (prev) => ({
                      ...prev,
                      [item.id]: storedVal,
                    }),
                  );
                  const targetIdx =
                    item.pageIndex !== undefined
                      ? item.pageIndex
                      : activePageIndex;
                  updateElementAttribute(
                    targetIdx,
                    item.id,
                    {
                      "data-interaction": "audio",
                      "data-interaction-value":
                        storedVal,
                    },
                  );
                } else {
                  throw new Error(
                    "Failed to upload audio asset",
                  );
                }
              } catch (err) {
                console.error(
                  "Audio upload error:",
                  err,
                );
                alert(
                  "Failed to upload audio file. Please try again.",
                );
              } finally {
                setUploadingItems((prev) => ({
                  ...prev,
                  [item.id]: false,
                }));
              }
            }
          }}
          isUploading={uploadingItems[item.id]}
          fileMeta={fileMeta}
          renderPreview={(meta) => {
            const optionsDropId = `audio-options-${item.id}`;
            const isOptionsDropOpen =
              openDropdownId === optionsDropId;
            const isPlaying =
              playingAudioId === item.id;
            const knownDur =
              getAudioDurationFromMeta(meta);
            const defaultTimeText = knownDur
              ? `0:00 / ${formatAudioTime(knownDur)}`
              : "0:00";
            const timeText =
              audioPlaybackTimes[item.id] ||
              defaultTimeText;
            const progress =
              audioProgressPercent[item.id] || 0;

            const threeDots = (
              <div
                className="absolute top-[0.4vw] right-[0.4vw] z-[20]"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <div
                  data-dropdown-trigger="true"
                  className="bg-white/90 rounded-[0.2vw] shadow-sm p-[0.2vw] flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
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
                    className="absolute right-0 top-[calc(100%+0.2vw)] bg-white border border-gray-200 rounded-[0.4vw] shadow-lg py-[0.4vh] min-w-[7.5vw] z-[99999] flex flex-col"
                  >
                    <div
                      className="px-[0.8vw] py-[0.6vh] text-[0.8vw] text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-[0.4vw]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(null);
                        const inputEl =
                          document.getElementById(
                            `audio-upload-${item.id}`,
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
                      className="px-[0.8vw] py-[0.6vh] text-[0.8vw] text-[#7C3AED] hover:bg-purple-50 cursor-pointer flex items-center gap-[0.4vw]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(null);
                        if (
                          playingAudioId ===
                            item.id &&
                          activeAudioRef.current
                        ) {
                          activeAudioRef.current.pause();
                          setPlayingAudioId(null);
                        }
                        setAudioSourceMode(
                          (prev) => ({
                            ...prev,
                            [item.id]: "record",
                          }),
                        );
                      }}
                    >
                      <Icon
                        icon="solar:microphone-3-bold"
                        className="text-[0.9vw]"
                      />{" "}
                      Record Voice
                    </div>
                    <div
                      className="px-[0.8vw] py-[0.6vh] text-[0.8vw] text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-[0.4vw]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(null);
                        if (
                          playingAudioId ===
                            item.id &&
                          activeAudioRef.current
                        ) {
                          activeAudioRef.current.pause();
                          setPlayingAudioId(null);
                        }
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
                                "audio",
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

            return (
              <div className="w-full h-full bg-gradient-to-br from-[#FAF5FF] via-white to-[#F3E8FF] flex flex-col justify-between p-[0.8vw] relative border border-[#E9D5FF] rounded-[0.6vw]">
                {threeDots}

                {/* Top Info */}
                <div className="flex items-center gap-[0.6vw] pr-[1.8vw]">
                  <div className="w-[2.4vw] h-[2.4vw] rounded-[0.5vw] bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon="solar:music-note-2-bold"
                      className="text-[1.3vw]"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className="text-[0.8vw] font-semibold text-gray-800 truncate"
                      title={
                        meta.name || "Audio File"
                      }
                    >
                      {meta.name || "Audio File"}
                    </span>
                    <span className="text-[0.65vw] text-gray-500 font-medium">
                      {meta.size
                        ? formatAudioFileSize(
                            meta.size,
                          )
                        : "Audio Clip"}
                    </span>
                  </div>
                </div>

                {/* Player Controls & Progress */}
                <div
                  className="flex flex-col gap-[0.4vh] mt-[0.5vh]"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <div className="flex items-center gap-[0.6vw]">
                    <button
                      type="button"
                      className="w-[2vw] h-[2vw] rounded-full bg-[#7C3AED] text-white flex items-center justify-center hover:bg-[#6D28D9] transition-transform active:scale-95 shadow-sm flex-shrink-0"
                      onClick={() =>
                        handleTogglePlayAudio(
                          item.id,
                          meta.data || meta.url,
                          knownDur,
                        )
                      }
                      title={
                        isPlaying
                          ? "Pause"
                          : "Play"
                      }
                    >
                      <Icon
                        icon={
                          isPlaying
                            ? "solar:pause-bold"
                            : "solar:play-bold"
                        }
                        className="text-[1vw]"
                      />
                    </button>

                    <div
                      className="flex-1 h-[0.5vw] bg-purple-100 rounded-full cursor-pointer relative overflow-hidden group"
                      onClick={(e) =>
                        handleAudioSeek(
                          e,
                          item.id,
                          knownDur,
                        )
                      }
                    >
                      <div
                        className="h-full bg-[#7C3AED] rounded-full transition-all duration-100"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <span className="text-[0.65vw] text-gray-600 font-mono flex-shrink-0 select-none">
                      {timeText}
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
          emptyIcon=""
          emptyTitle={
            <div className="flex flex-col items-center gap-[0.4vh]">
              <div className="flex items-center gap-[0.4vw]">
                <Icon
                  icon="lucide:plus"
                  className="text-[1.2vw] text-[#9CA3AF]"
                />
                <span className="text-[0.85vw] text-[#9CA3AF] font-medium">
                  Add Audio File
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAudioSourceMode((prev) => ({
                    ...prev,
                    [item.id]: "record",
                  }));
                }}
                className="text-[0.72vw] text-[#7C3AED] hover:text-[#6D28D9] font-medium flex items-center gap-[0.2vw] hover:underline mt-[0.2vh]"
              >
                <Icon
                  icon="solar:microphone-3-bold"
                  className="text-[0.85vw]"
                />
                Or record with microphone
              </button>
            </div>
          }
          subText="Supports MP3, WAV, OGG, M4A"
        />
      )}
    </div>
  );
};

export default AudioAction;
