/**
 * saveLockManager.js
 * 
 * Enterprise concurrency & in-flight activity manager for FlipiBook editors.
 * 
 * Features:
 * 1. Global In-Flight Activity Counter: Tracks background uploads (videos, images, audio)
 *    and active save requests to prevent tab-close data loss.
 * 2. Monotonic Revision Sequencer: Prevents race conditions where an older autosave 
 *    finishes after a newer manual save and corrupts page states.
 */

let inFlightCount = 0;
const activeActivities = new Map();
const activityListeners = new Set();

/**
 * Increment in-flight activity counter (e.g. asset upload, backend save)
 * @param {string} activityId - Unique identifier or description
 */
export const startInFlightActivity = (activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`) => {
  inFlightCount++;
  activeActivities.set(activityId, Date.now());
  notifyListeners();
  return activityId;
};

/**
 * Decrement in-flight activity counter when operation completes or errors
 * @param {string} activityId 
 */
export const endInFlightActivity = (activityId) => {
  if (activityId && activeActivities.has(activityId)) {
    activeActivities.delete(activityId);
    inFlightCount = Math.max(0, inFlightCount - 1);
    notifyListeners();
  } else if (!activityId && inFlightCount > 0) {
    inFlightCount--;
    notifyListeners();
  }
};

/**
 * Returns current total of active uploads / saves in progress
 */
export const getInFlightActivityCount = () => inFlightCount;

/**
 * Returns active activity descriptions (helpful for debug & diagnostics)
 */
export const getActiveActivities = () => Array.from(activeActivities.keys());

/**
 * Subscribe to in-flight activity count changes
 */
export const subscribeInFlightActivity = (callback) => {
  activityListeners.add(callback);
  return () => activityListeners.delete(callback);
};

const notifyListeners = () => {
  activityListeners.forEach(cb => {
    try { cb(inFlightCount); } catch (_) {}
  });
};

/**
 * Monotonic Revision Sequencer for auto-save operations.
 * Guarantees that responses from older save requests are discarded if a newer
 * save request has already completed.
 */
export const createRevisionSequencer = () => {
  let latestDispatchedRevision = 0;
  let latestCommittedRevision = 0;

  return {
    /**
     * Call before dispatching an HTTP save request
     * @returns {number} The assigned revision ticket
     */
    nextRevision: () => {
      latestDispatchedRevision++;
      return latestDispatchedRevision;
    },

    /**
     * Call when a save response arrives
     * @param {number} revision - The ticket returned by nextRevision
     * @returns {boolean} True if this response is the newest and safe to commit
     */
    isCurrent: (revision) => {
      if (revision >= latestCommittedRevision) {
        latestCommittedRevision = revision;
        return true;
      }
      console.warn(`[saveLockManager] Discarded stale save response #${revision} (already committed #${latestCommittedRevision})`);
      return false;
    },

    getLatestRevision: () => latestDispatchedRevision
  };
};
