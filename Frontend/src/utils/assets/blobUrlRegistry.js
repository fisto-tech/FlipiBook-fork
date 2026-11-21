/**
 * blobUrlRegistry.js
 * 
 * Central Memory Manager for Blob / Object URLs across FlipiBook.
 * 
 * Prevents silent browser RAM leakage:
 * When users create Object URLs (for drag & drop previews, file replaces, uploads),
 * browsers pin the full raw file bytes in memory until explicitly revoked.
 * 
 * Features:
 * 1. Automatic LRU eviction (cap at 60 active URLs)
 * 2. Scoped owner-based cleanup (e.g. revokes all modal previews on close)
 * 3. Safe revoke helper with error suppression
 */

const registry = new Map(); // url -> { blob, ownerId, createdAt }
const MAX_ACTIVE_BLOB_URLS = 60;

/**
 * Creates a tracked Object URL and automatically prunes stale URLs to keep memory low.
 * @param {Blob|File} blob 
 * @param {string} [ownerId='global'] - Scope/component name (e.g. 'replace_modal', 'canvas_drop')
 * @returns {string} The created object URL
 */
export const createManagedBlobUrl = (blob, ownerId = 'global') => {
  if (!blob) return '';
  
  // Prune oldest if we exceed threshold
  if (registry.size >= MAX_ACTIVE_BLOB_URLS) {
    const oldestKey = registry.keys().next().value;
    revokeManagedBlobUrl(oldestKey);
  }

  const url = URL.createObjectURL(blob);
  registry.set(url, {
    ownerId,
    createdAt: Date.now()
  });
  return url;
};

/**
 * Revokes a specific Object URL and frees memory.
 * @param {string} url 
 */
export const revokeManagedBlobUrl = (url) => {
  if (!url || typeof url !== 'string') return;
  if (registry.has(url)) {
    try {
      URL.revokeObjectURL(url);
    } catch (_) {}
    registry.delete(url);
  }
};

/**
 * Revokes all Object URLs owned by a specific component or context.
 * Call this in useEffect cleanup functions (e.g., when a modal closes).
 * @param {string} ownerId 
 */
export const revokeBlobUrlsByOwner = (ownerId) => {
  if (!ownerId) return;
  const toDelete = [];
  registry.forEach((entry, url) => {
    if (entry.ownerId === ownerId) {
      toDelete.push(url);
    }
  });
  toDelete.forEach(url => revokeManagedBlobUrl(url));
};

/**
 * Number of active managed blob URLs currently alive in memory
 */
export const getActiveBlobUrlCount = () => registry.size;
