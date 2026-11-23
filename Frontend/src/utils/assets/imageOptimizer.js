/**
 * Reusable Image Optimizer & Progressive Uploader for FlipiBook
 * 
 * Modeled after Figma / Canva client-side processing:
 * 1. Off-main-thread hardware decoding via `createImageBitmap` (no UI freeze).
 * 2. High-performance downsampling (max 2048px by default) preserving aspect ratio.
 * 3. Modern WebP compression (0.82 quality) turning 20MB-40MB raw shots into ~250KB.
 * 4. Special format safety: Animated GIFs and SVGs are preserved intact.
 * 5. Instant preview generation (DataURL / ObjectURL) + async backend upload.
 */

import axios from 'axios';
import { resolveUploadsPath } from './assetUtils';
import { startInFlightActivity, endInFlightActivity } from '../storage/saveLockManager';

/**
 * Checks whether an asset (File, Blob, or DataURL) should undergo client-side optimization.
 * Bypasses SVGs, GIFs, videos, remote/storage URLs, and assets already under minBytes.
 * 
 * @param {File|Blob|string} input 
 * @param {number} [minBytes=307200] - 300KB threshold
 * @returns {boolean}
 */
export function shouldOptimizeImage(input, minBytes = 3 * 1024 * 1024) {
  if (!input) return false;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/storage/') || trimmed.startsWith('blob:') || trimmed.startsWith('../assets/')) {
      return false; // Already hosted or memory-managed blob
    }
    if (trimmed.startsWith('data:image/svg+xml') || trimmed.startsWith('data:image/gif')) {
      return false; // Vector or animated
    }
    if (trimmed.startsWith('data:image/')) {
      return trimmed.length > (minBytes * 1.33); // Heavy base64 string (> 3MB)
    }
    return false;
  }
  if (input instanceof Blob || (typeof File !== 'undefined' && input instanceof File)) {
    const type = input.type || '';
    if (type.includes('svg') || type.includes('gif') || type.startsWith('video/')) {
      return false;
    }
    return input.size > minBytes;
  }
  return false;
}

/**
 * Optimizes an image client-side before storing or uploading.
 * 
 * @param {File|Blob|string} fileOrDataUrl - The raw input file, blob, or base64 dataUrl.
 * @param {Object} [options]
 * @param {number} [options.maxDimension=3840] - 4K UHD max width/height in pixels.
 * @param {number} [options.quality=0.94] - Visually lossless quality (0.0 to 1.0).
 * @param {string} [options.preferredFormat='image/webp'] - Target format ('image/webp' or 'image/jpeg').
 * @param {number} [options.minBytes=3145728] - Skip if under this byte size (default 3MB).
 * @returns {Promise<{ file: File, dataUrl: string, width: number, height: number, originalSize: number, compressedSize: number, isBypassed?: boolean }>}
 */
export async function optimizeImageForWeb(fileOrDataUrl, options = {}) {
  const {
    maxDimension = 3840,
    quality = 0.94,
    preferredFormat = 'image/webp',
    minBytes = 3 * 1024 * 1024,
  } = options;

  if (!fileOrDataUrl) {
    throw new Error('No file provided to optimizeImageForWeb');
  }

  // Handle string dataUrl or remote URL
  let file = fileOrDataUrl;
  if (typeof fileOrDataUrl === 'string') {
    const trimmed = fileOrDataUrl.trim();
    if (!shouldOptimizeImage(trimmed, minBytes)) {
      return {
        file: null,
        dataUrl: trimmed,
        width: 0,
        height: 0,
        originalSize: trimmed.length,
        compressedSize: trimmed.length,
        isBypassed: true,
      };
    }
    try {
      const res = await fetch(trimmed);
      file = await res.blob();
    } catch {
      return {
        file: null,
        dataUrl: trimmed,
        width: 0,
        height: 0,
        originalSize: trimmed.length,
        compressedSize: trimmed.length,
        isBypassed: true,
      };
    }
  }

  const originalSize = file.size || 0;

  if (!shouldOptimizeImage(file, minBytes)) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      file: file instanceof File ? file : null,
      dataUrl,
      width: 0,
      height: 0,
      originalSize,
      compressedSize: originalSize,
      isBypassed: true,
    };
  }

  const fileName = (file.name || 'image').replace(/\.[^/.]+$/, '');
  const fileType = file.type || '';

  // 1. Preserve vector SVGs and animated GIFs as-is
  if (fileType.includes('svg') || fileType.includes('gif')) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      file,
      dataUrl,
      width: 0,
      height: 0,
      originalSize,
      compressedSize: originalSize,
      isBypassed: true,
    };
  }

  // Smart Skip Gate: If the image is already lightweight (< 300KB), no need to recompress!
  if (originalSize > 0 && originalSize <= minBytes) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      file,
      dataUrl,
      width: 0,
      height: 0,
      originalSize,
      compressedSize: originalSize,
      isBypassed: true,
    };
  }

  try {
    // 2. Decode image off-the-main-thread using createImageBitmap if available
    let sourceWidth = 0;
    let sourceHeight = 0;
    let imageSource = null;
    let cleanup = () => {};

    if (typeof createImageBitmap === 'function') {
      try {
        imageSource = await createImageBitmap(file);
        sourceWidth = imageSource.width;
        sourceHeight = imageSource.height;
        cleanup = () => {
          if (imageSource && typeof imageSource.close === 'function') {
            imageSource.close();
          }
        };
      } catch (bitmapErr) {
        // Fallback to Image element if createImageBitmap fails on certain formats
        imageSource = null;
      }
    }

    if (!imageSource) {
      const img = await loadImageElement(file);
      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
      imageSource = img;
    }

    // 3. Compute constrained dimensions maintaining aspect ratio
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (sourceWidth > maxDimension || sourceHeight > maxDimension) {
      if (sourceWidth >= sourceHeight) {
        targetWidth = maxDimension;
        targetHeight = Math.round((sourceHeight * maxDimension) / sourceWidth);
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.round((sourceWidth * maxDimension) / sourceHeight);
      }
    }

    // 4. Render to canvas (OffscreenCanvas preferred for worker-level speed)
    let blob = null;
    let targetMimeType = preferredFormat;

    if (typeof OffscreenCanvas !== 'undefined') {
      try {
        const offscreen = new OffscreenCanvas(targetWidth, targetHeight);
        const ctx = offscreen.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);
          blob = await offscreen.convertToBlob({
            type: targetMimeType,
            quality,
          });
        }
      } catch (e) {
        blob = null;
      }
    }

    // Standard HTMLCanvasElement fallback
    if (!blob && typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);
        blob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), targetMimeType, quality);
        });
      }
    }

    cleanup();

    if (!blob) {
      // If canvas failed, return original file
      const dataUrl = await readFileAsDataUrl(file);
      return {
        file,
        dataUrl,
        width: sourceWidth,
        height: sourceHeight,
        originalSize,
        compressedSize: originalSize,
      };
    }

    // Determine extension based on actual blob type
    const ext = blob.type.includes('webp') ? 'webp' : 'jpg';
    const compressedFile = new File([blob], `${fileName}.${ext}`, {
      type: blob.type,
      lastModified: Date.now(),
    });

    const dataUrl = await readFileAsDataUrl(compressedFile);

    return {
      file: compressedFile,
      blob,
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      originalSize,
      compressedSize: compressedFile.size,
      reductionRatio: originalSize > 0 ? (1 - compressedFile.size / originalSize) : 0,
    };
  } catch (err) {
    console.warn('[imageOptimizer] Optimization error, falling back to original:', err);
    const dataUrl = await readFileAsDataUrl(file);
    return {
      file,
      dataUrl,
      width: 0,
      height: 0,
      originalSize,
      compressedSize: originalSize,
    };
  }
}

/**
 * Uploads an optimized file or blob to the backend asset storage.
 * 
 * @param {File|Blob} file - The optimized image file
 * @param {Object} [params]
 * @param {string} [params.emailId] - User's email
 * @param {string} [params.page_v_id='global']
 * @param {string} [params.type='image']
 * @param {string} [params.isGallery='true']
 * @returns {Promise<{ success: boolean, url: string, rawUrl: string, file_v_id: string }>}
 */
export async function uploadAssetToStorage(file, params = {}) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const emailId = params.emailId || 'guest@fisto.tech';

  const formData = new FormData();
  formData.append('emailId', emailId);
  formData.append('isGallery', params.isGallery !== undefined ? String(params.isGallery) : 'true');
  formData.append('type', params.type || 'image');
  formData.append('assetType', params.type || 'image');
  formData.append('file', file);
  formData.append('page_v_id', params.page_v_id || 'global');

  const activityId = startInFlightActivity(`upload_asset_${Date.now()}`);
  try {
    const res = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData, {
      withCredentials: true,
    });

    if (res.data && res.data.url) {
      const resolved = resolveUploadsPath(res.data.url);
      return {
        success: true,
        url: resolved,
        rawUrl: res.data.url,
        file_v_id: res.data.file_v_id,
      };
    }
    return { success: false, error: 'No URL returned from server' };
  } catch (err) {
    console.error('[imageOptimizer] Upload failed:', err);
    return { success: false, error: err.message };
  } finally {
    endInFlightActivity(activityId);
  }
}

/**
 * Helper to read a Blob/File as a DataURL
 */
function readFileAsDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(blob);
  });
}

/**
 * Fallback to load image in an HTMLImageElement
 */
function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
