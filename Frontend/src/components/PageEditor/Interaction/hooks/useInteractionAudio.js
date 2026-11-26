import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { formatAudioTime } from "../utils/audioFormatters";
import { resolveUploadsPath } from "../../../../utils/assets/assetUtils";

/**
 * Audio playback + voice recording for Audio interactions (play/seek, record/pause/stop/cancel,
 * save recording). Extracted from InteractionPanel; owns its own state, refs and unmount cleanup.
 */
export const useInteractionAudio = ({
  activePageIndex,
  effectiveBook,
  effectiveFolder,
  effectiveVId,
  setItemValueOverrides,
  setUploadingItems,
  updateElementAttribute,
  user,
}) => {
  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioPlaybackTimes, setAudioPlaybackTimes] = useState({});
  const [audioProgressPercent, setAudioProgressPercent] = useState({});
  const activeAudioRef = useRef(null);

  // Audio recording state
  const [audioSourceMode, setAudioSourceMode] = useState({}); // { [itemId]: 'upload' | 'record' }
  const [recordingItemId, setRecordingItemId] = useState(null);
  const [, setRecordingSeconds] = useState(0);
  const [recordingMillis, setRecordingMillis] = useState(0);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordingWaveform, setRecordingWaveform] = useState([]);
  const [recordedDataMap, setRecordedDataMap] = useState({}); // { [itemId]: { blob, url, duration, durationMs, waveform, mimeType, fileExt } }
  const [recordedPreviewPlaying, setRecordedPreviewPlaying] = useState(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const waveformIntervalRef = useRef(null);
  const recordingStartTimeRef = useRef(0);
  const recordingAccumulatedMsRef = useRef(0);
  const recordingWaveformRef = useRef([]);
  const saveAfterStopRef = useRef(false);
  const recordedPreviewAudioRef = useRef(null);

  const handleTogglePlayAudio = (itemId, audioSrc, fallbackDuration) => {
    if (!audioSrc) return;

    const resolvedSrc = resolveUploadsPath(audioSrc);

    if (playingAudioId === itemId && activeAudioRef.current) {
      if (!activeAudioRef.current.paused) {
        activeAudioRef.current.pause();
        setPlayingAudioId(null);
        return;
      }
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (recordedPreviewAudioRef.current) {
      recordedPreviewAudioRef.current.pause();
      setRecordedPreviewPlaying(null);
    }

    const audio = new Audio(resolvedSrc);
    activeAudioRef.current = audio;
    setPlayingAudioId(itemId);

    let effectiveDuration =
      fallbackDuration &&
      isFinite(fallbackDuration) &&
      Number(fallbackDuration) > 0
        ? Number(fallbackDuration)
        : null;

    const resolveDuration = () => {
      if (
        effectiveDuration &&
        isFinite(effectiveDuration) &&
        effectiveDuration > 0
      ) {
        return effectiveDuration;
      }
      if (
        audio.duration &&
        isFinite(audio.duration) &&
        audio.duration > 0 &&
        audio.duration !== Infinity
      ) {
        effectiveDuration = audio.duration;
        return audio.duration;
      }
      return 0;
    };

    const updateTimesAndProgress = () => {
      const cur = audio.currentTime || 0;
      const dur = resolveDuration();

      if (dur > 0) {
        const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
        setAudioPlaybackTimes((prev) => ({
          ...prev,
          [itemId]: `${formatAudioTime(cur)} / ${formatAudioTime(dur)}`,
        }));
        setAudioProgressPercent((prev) => ({
          ...prev,
          [itemId]: pct,
        }));
      } else {
        setAudioPlaybackTimes((prev) => ({
          ...prev,
          [itemId]: `${formatAudioTime(cur)}`,
        }));
      }
    };

    // Fix Chromium WebM duration missing bug when duration is Infinity
    audio.onloadedmetadata = () => {
      if (
        !effectiveDuration &&
        (!audio.duration ||
          !isFinite(audio.duration) ||
          audio.duration === Infinity)
      ) {
        try {
          const originalTime = audio.currentTime;
          audio.currentTime = 1e101;
          const onTimeFix = () => {
            audio.removeEventListener("timeupdate", onTimeFix);
            if (
              audio.duration &&
              isFinite(audio.duration) &&
              audio.duration !== Infinity
            ) {
              effectiveDuration = audio.duration;
            }
            audio.currentTime = originalTime;
            updateTimesAndProgress();
          };
          audio.addEventListener("timeupdate", onTimeFix);
        } catch {}
      } else {
        updateTimesAndProgress();
      }
    };

    audio.ontimeupdate = () => {
      updateTimesAndProgress();
    };

    audio.onended = () => {
      setPlayingAudioId(null);
      setAudioProgressPercent((prev) => ({ ...prev, [itemId]: 0 }));
      const dur = resolveDuration();
      setAudioPlaybackTimes((prev) => ({
        ...prev,
        [itemId]: `0:00 / ${dur > 0 ? formatAudioTime(dur) : "0:00"}`,
      }));
    };

    audio.play().catch((err) => {
      console.error("Audio playback failed in panel", err);
      setPlayingAudioId(null);
    });
  };

  const handleAudioSeek = (e, itemId, fallbackDuration) => {
    const audio = activeAudioRef.current;
    if (!audio || playingAudioId !== itemId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, clickX / rect.width));

    let dur =
      audio.duration && isFinite(audio.duration) && audio.duration !== Infinity
        ? audio.duration
        : fallbackDuration && isFinite(fallbackDuration)
          ? Number(fallbackDuration)
          : 0;

    if (dur > 0) {
      audio.currentTime = pct * dur;
      setAudioProgressPercent((prev) => ({ ...prev, [itemId]: pct * 100 }));
      const cur = audio.currentTime || 0;
      setAudioPlaybackTimes((prev) => ({
        ...prev,
        [itemId]: `${formatAudioTime(cur)} / ${formatAudioTime(dur)}`,
      }));
    }
  };

  // Recording handlers
  const handleStartRecording = async (itemId) => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      alert("Audio recording is not supported in your browser.");
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      setPlayingAudioId(null);
    }
    if (recordedPreviewAudioRef.current) {
      recordedPreviewAudioRef.current.pause();
      setRecordedPreviewPlaying(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Connect Web Audio API Analyser for real-time waveform visualization
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const src = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.5;
          src.connect(analyser);
          audioContextRef.current = ctx;
          analyserRef.current = analyser;
        }
      } catch (e) {
        console.warn("AudioContext initialization note:", e);
      }

      let mimeType = "audio/webm";
      let fileExt = ".webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
          fileExt = ".webm";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
          fileExt = ".webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
          fileExt = ".mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
          fileExt = ".ogg";
        }
      }

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      mediaRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalMs = recordingAccumulatedMsRef.current || 1000;
        const finalSecs = Math.max(1, Math.round(finalMs / 1000));
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const dataObj = {
          blob,
          url,
          duration: finalSecs,
          durationMs: finalMs,
          waveform: [...(recordingWaveformRef.current || [])],
          mimeType,
          fileExt,
        };
        setRecordedDataMap((prev) => ({
          ...prev,
          [itemId]: dataObj,
        }));

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
          try {
            audioContextRef.current.close();
          } catch {}
          audioContextRef.current = null;
          analyserRef.current = null;
        }

        if (saveAfterStopRef.current) {
          saveAfterStopRef.current = false;
          handleSaveRecordedAudio({ id: itemId }, dataObj);
        }
      };

      recordingAccumulatedMsRef.current = 0;
      recordingStartTimeRef.current = Date.now();
      setRecordingSeconds(0);
      setRecordingMillis(0);
      setIsRecordingPaused(false);
      const initialWave = [0.12, 0.18, 0.14, 0.22, 0.28, 0.2];
      setRecordingWaveform(initialWave);
      recordingWaveformRef.current = initialWave;
      setRecordingItemId(itemId);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        const elapsed =
          recordingAccumulatedMsRef.current +
          (Date.now() - recordingStartTimeRef.current);
        setRecordingMillis(elapsed);
        setRecordingSeconds(Math.floor(elapsed / 1000));
      }, 33);

      if (waveformIntervalRef.current)
        clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount,
          );
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / (dataArray.length || 1);
          const norm = Math.max(0.12, Math.min(1.0, (avg / 100) * 1.35));
          setRecordingWaveform((prev) => {
            const next = [...prev, norm];
            const updated =
              next.length > 28 ? next.slice(next.length - 28) : next;
            recordingWaveformRef.current = updated;
            return updated;
          });
        }
      }, 90);

      recorder.start(200);
    } catch (err) {
      console.error("Microphone access failed:", err);
      alert(
        "Microphone permission was denied. Please allow microphone access in your browser to record audio.",
      );
    }
  };

  const handleTogglePauseResumeRecording = (itemId) => {
    if (!mediaRecorderRef.current || recordingItemId !== itemId) return;

    if (!isRecordingPaused) {
      // Pause
      if (mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.pause();
        } catch {}
      }
      recordingAccumulatedMsRef.current +=
        Date.now() - recordingStartTimeRef.current;
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
        waveformIntervalRef.current = null;
      }
      setIsRecordingPaused(true);
    } else {
      // Resume / Play
      if (mediaRecorderRef.current.state === "paused") {
        try {
          mediaRecorderRef.current.resume();
        } catch {}
      }
      recordingStartTimeRef.current = Date.now();
      setIsRecordingPaused(false);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        const elapsed =
          recordingAccumulatedMsRef.current +
          (Date.now() - recordingStartTimeRef.current);
        setRecordingMillis(elapsed);
        setRecordingSeconds(Math.floor(elapsed / 1000));
      }, 33);

      if (waveformIntervalRef.current)
        clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount,
          );
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / (dataArray.length || 1);
          const norm = Math.max(0.12, Math.min(1.0, (avg / 100) * 1.35));
          setRecordingWaveform((prev) => {
            const next = [...prev, norm];
            const updated =
              next.length > 28 ? next.slice(next.length - 28) : next;
            recordingWaveformRef.current = updated;
            return updated;
          });
        }
      }, 90);
    }
  };

  const handleStopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
    if (!isRecordingPaused && recordingStartTimeRef.current) {
      recordingAccumulatedMsRef.current +=
        Date.now() - recordingStartTimeRef.current;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecordingPaused(false);
    setRecordingItemId(null);
  };

  const handleCancelRecording = (itemId) => {
    saveAfterStopRef.current = false;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = null;
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (recordedDataMap[itemId]?.url) {
      URL.revokeObjectURL(recordedDataMap[itemId].url);
    }
    setRecordedDataMap((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
    setRecordingItemId(null);
    setRecordingSeconds(0);
    setRecordingMillis(0);
    setIsRecordingPaused(false);
    setRecordingWaveform([]);
    recordingAccumulatedMsRef.current = 0;
  };

  const handleSaveRecordedAudio = async (item, overrideData) => {
    // If currently actively recording or paused, trigger save on stop
    if (recordingItemId === item.id && !overrideData) {
      saveAfterStopRef.current = true;
      handleStopRecording(item.id);
      return;
    }

    const recordedData = overrideData || recordedDataMap[item.id];
    if (!recordedData || !recordedData.blob) return;

    if (!user) {
      alert("You must be logged in to save recorded audio.");
      return;
    }

    setUploadingItems((prev) => ({ ...prev, [item.id]: true }));

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const ext = recordedData.fileExt || ".webm";
      const mime = recordedData.mimeType || "audio/webm";
      const recFile = new File(
        [recordedData.blob],
        `voice_recording_${Date.now()}${ext}`,
        { type: mime },
      );

      const formData = new FormData();
      formData.append("emailId", user.emailId || user.email);
      if (effectiveVId) formData.append("v_id", effectiveVId);
      if (effectiveFolder) formData.append("folderName", effectiveFolder);
      if (effectiveBook) formData.append("flipbookName", effectiveBook);
      formData.append("type", "audio");
      formData.append("page_v_id", "global");
      formData.append("file", recFile);

      const res = await axios.post(
        `${backendUrl}/api/flipbook/upload-asset`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data && res.data.url) {
        const uploadedUrl = resolveUploadsPath(res.data.url);
        const durText = formatAudioTime(recordedData.duration);
        const storedVal = JSON.stringify({
          name: `Voice Recording (${durText})`,
          type: recFile.type || "audio/webm",
          size: recFile.size || recordedData.blob.size,
          data: uploadedUrl,
          url: uploadedUrl,
          duration: recordedData.duration,
          durationMs: recordedData.durationMs,
        });

        setItemValueOverrides((prev) => ({ ...prev, [item.id]: storedVal }));
        const targetIdx =
          item.pageIndex !== undefined ? item.pageIndex : activePageIndex;
        updateElementAttribute(targetIdx, item.id, {
          "data-interaction": "audio",
          "data-interaction-value": storedVal,
        });

        if (recordedDataMap[item.id]?.url) {
          URL.revokeObjectURL(recordedDataMap[item.id].url);
        }
        setRecordedDataMap((prev) => {
          const copy = { ...prev };
          delete copy[item.id];
          return copy;
        });
        setAudioSourceMode((prev) => ({ ...prev, [item.id]: "upload" }));
      } else {
        throw new Error("Failed to upload recorded audio");
      }
    } catch (err) {
      console.error("Save recorded audio error:", err);
      alert("Failed to upload recorded audio. Please try again.");
    } finally {
      setUploadingItems((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  // Clean up audio and recorders on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if (recordedPreviewAudioRef.current) {
        recordedPreviewAudioRef.current.pause();
        recordedPreviewAudioRef.current = null;
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    activeAudioRef,
    audioPlaybackTimes,
    audioProgressPercent,
    audioSourceMode,
    handleAudioSeek,
    handleCancelRecording,
    handleSaveRecordedAudio,
    handleStartRecording,
    handleStopRecording,
    handleTogglePauseResumeRecording,
    handleTogglePlayAudio,
    isRecordingPaused,
    playingAudioId,
    recordedDataMap,
    recordedPreviewPlaying,
    recordingItemId,
    recordingMillis,
    recordingWaveform,
    setAudioSourceMode,
    setPlayingAudioId,
  };
};
