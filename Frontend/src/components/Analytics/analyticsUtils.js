export const formatDuration = (seconds = 0) => {
  const sec = Math.max(0, Math.round(Number(seconds) || 0));
  if (sec === 0) return '0s';
  if (sec < 60) return `${sec}s`;
  const mins = Math.floor(sec / 60);
  const remSec = sec % 60;
  if (mins < 60) {
    return remSec > 0 ? `${mins}m ${remSec}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours} Hr ${remMins} Min`;
};

export const formatShortDate = (dateVal) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    return `${day} ${month}`;
  } catch {
    return '—';
  }
};

export const formatFullDate = (dateVal) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return '—';
  }
};

export const getCountryFlag = (code = '') => {
  if (!code || code === 'UN' || code === 'LOCAL') return '🌐';
  try {
    const codePoints = code
      .toUpperCase()
      .slice(0, 2)
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
};

export const scrollToTop = () => {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      mainEl.scrollTop = 0;
    }
  } catch (e) {
    console.warn('Scroll to top error:', e);
  }
};

export const getPaginationPages = (currentPage, totalPages) => {
  if (totalPages <= 1) return [1];
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

/**
 * Generate a dynamic day-by-day timeline array based on selected Date Preset or Custom Range
 */
export const buildDynamicTimeline = (preset = '7 Days', customRange = {}, rawDailyData = [], durationSeconds = 0) => {
  const map = new Map();
  (rawDailyData || []).forEach(d => {
    if (d && d._id) map.set(d._id, d);
  });

  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  const normPreset = (preset || '7 Days').toLowerCase().trim();

  if (normPreset === 'today') {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
  } else if (normPreset === 'yesterday') {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
  } else if (normPreset === '7 days' || normPreset === '7d') {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
  } else if (normPreset === '30 days' || normPreset === '30d') {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
  } else if (normPreset === 'custom' && customRange?.startDate && customRange?.endDate) {
    startDate = new Date(customRange.startDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(customRange.endDate);
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
  }

  const result = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const dd = String(cur.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;

    const found = map.get(key);
    const views = found ? (Number(found.views) || Number(found.count) || 0) : 0;
    const readers = found ? (found.readers || Math.max(0, Math.round(views * 0.8))) : 0;
    const durSec = views > 0 ? (found?.avgDuration || durationSeconds || 0) : 0;

    result.push({
      dateKey: key,
      date: key,
      dt: new Date(cur),
      formattedShort: formatShortDate(cur),
      formattedFull: formatFullDate(cur),
      views,
      readers,
      totalDuration: formatDuration(views * durSec),
      avgDuration: views > 0 ? formatDuration(durSec) : '0s',
      rawItem: found || null
    });

    cur.setDate(cur.getDate() + 1);
  }

  return result;
};

/**
 * Downsample timeline points so the bottom X-axis displays at most 7 evenly-spaced tick labels
 */
export const getSampledXLabels = (points = [], maxLabels = 7) => {
  if (!points || points.length === 0) return [];
  if (points.length <= maxLabels) return points;

  const step = (points.length - 1) / (maxLabels - 1);
  const seenIndices = new Set();
  const labels = [];

  for (let i = 0; i < maxLabels; i++) {
    const idx = Math.min(points.length - 1, Math.round(i * step));
    if (!seenIndices.has(idx)) {
      seenIndices.add(idx);
      labels.push(points[idx]);
    }
  }

  return labels;
};


