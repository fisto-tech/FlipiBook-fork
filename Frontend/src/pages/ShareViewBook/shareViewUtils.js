// Helpers shared by the ShareViewBook page and its panels

export const AVATAR_COLORS = [
    '#4F46E5', // Indigo
    '#059669', // Emerald
    '#D97706', // Amber
    '#E11D48', // Rose
    '#7C3AED', // Violet
    '#0891B2', // Cyan
    '#C026D3', // Fuchsia
    '#EA580C', // Orange
    '#2563EB', // Blue
    '#DB2777', // Pink
    '#0D9488', // Teal
    '#9333EA', // Purple
];

export const getAvatarBg = (name = '') => {
    let hash = 0;
    const str = String(name || 'User').trim();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
export const checkInviteAutoExpired = (autoExpire, fallbackDate) => {
    if (!autoExpire || !autoExpire.enabled) return false;

    const rawGranted = autoExpire.grantedAt || autoExpire.createdAt || fallbackDate;
    if (!rawGranted) return false;
    const grantedAt = new Date(rawGranted).getTime();

    const daysStr = String(autoExpire.days || '0');
    const daysMatch = daysStr.match(/(\d+)/);
    const daysNum = daysMatch ? parseInt(daysMatch[1], 10) : 0;

    const timeStr = String(autoExpire.time || '0');
    const timeMatch = timeStr.match(/(\d+)/);
    const timeNum = timeMatch ? parseInt(timeMatch[1], 10) : 0;

    let timeInMs = 0;
    if (timeStr.toLowerCase().includes('hour')) {
        timeInMs = timeNum * 60 * 60 * 1000;
    } else {
        timeInMs = timeNum * 60 * 1000;
    }

    const daysInMs = daysNum * 24 * 60 * 60 * 1000;
    const totalAllowedMs = daysInMs + timeInMs;

    if (totalAllowedMs <= 0) return false;

    const now = Date.now();
    const elapsed = now - grantedAt;

    return elapsed > totalAllowedMs;
};
