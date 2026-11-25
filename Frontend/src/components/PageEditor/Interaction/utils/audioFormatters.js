export const formatRecordingTimePrecise = (totalMs) => {
  const ms = Math.max(0, totalMs || 0);
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)},${pad(hundredths)}`;
};

export const formatAudioTime = (secs) => {
  if (!secs || isNaN(secs) || !isFinite(secs) || secs < 0) return "0:00";
  const sFloor = Math.floor(secs);
  const m = Math.floor(sFloor / 60);
  const s = sFloor % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const getAudioDurationFromMeta = (meta) => {
  if (!meta) return null;
  if (meta.duration && isFinite(meta.duration) && Number(meta.duration) > 0) {
    return Number(meta.duration);
  }
  if (
    meta.durationMs &&
    isFinite(meta.durationMs) &&
    Number(meta.durationMs) > 0
  ) {
    return Number(meta.durationMs) / 1000;
  }
  if (meta.name) {
    const match = String(meta.name).match(/\((\d+):(\d+)\)/);
    if (match) {
      const mins = parseInt(match[1], 10) || 0;
      const secs = parseInt(match[2], 10) || 0;
      const total = mins * 60 + secs;
      if (total > 0) return total;
    }
  }
  return null;
};

export const formatAudioFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};
