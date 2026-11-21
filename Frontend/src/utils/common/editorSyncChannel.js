/**
 * editorSyncChannel.js
 * 
 * Cross-tab and Cross-editor state synchronization via BroadcastChannel.
 * 
 * Features:
 * 1. Notifies CustomizedEditor when PageEditor saves new interactions or pages.
 * 2. Detects multi-tab collision when the same book is open in multiple browser windows.
 */

const CHANNEL_NAME = 'flipbook_cross_editor_sync';

let channelInstance = null;
const getChannel = () => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!channelInstance) {
    try {
      channelInstance = new BroadcastChannel(CHANNEL_NAME);
    } catch (_) {
      channelInstance = null;
    }
  }
  return channelInstance;
};

/**
 * Broadcast an event to all other open tabs/windows
 * @param {string} type 
 * @param {Object} [payload] 
 */
export const broadcastEditorEvent = (type, payload = {}) => {
  const ch = getChannel();
  if (ch) {
    try {
      ch.postMessage({
        type,
        timestamp: Date.now(),
        ...payload
      });
    } catch (_) {}
  }
};

/**
 * Notify all editors that a book has been saved
 * @param {string} v_id 
 */
export const notifyBookSaved = (v_id) => {
  if (!v_id) return;
  broadcastEditorEvent('book-saved', { v_id });
};

/**
 * Subscribe to sync events for a specific flipbook
 * @param {string} targetVId 
 * @param {Function} onEvent - Callback receiving ({ type, ...payload })
 * @returns {Function} Unsubscribe cleanup function
 */
export const subscribeEditorSync = (targetVId, onEvent) => {
  const ch = getChannel();
  if (!ch) return () => {};

  const handleMessage = (e) => {
    const data = e.data;
    if (!data) return;
    if (!targetVId || data.v_id === targetVId || data.all) {
      try {
        onEvent(data);
      } catch (err) {
        console.warn('[editorSyncChannel] Handler error:', err);
      }
    }
  };

  ch.addEventListener('message', handleMessage);
  return () => {
    try {
      ch.removeEventListener('message', handleMessage);
    } catch (_) {}
  };
};
