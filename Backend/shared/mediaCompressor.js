const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

let cachedFfmpegPath = null;
let ffmpegChecked = false;

/**
 * Check if ffmpeg binary is available on the system
 */
function getFfmpegPath() {
  if (ffmpegChecked) return cachedFfmpegPath;
  ffmpegChecked = true;

  const candidates = [
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/usr/bin/ffmpeg',
    'ffmpeg'
  ];

  for (const bin of candidates) {
    try {
      const { execFileSync } = require('child_process');
      execFileSync(bin, ['-version'], { stdio: 'ignore' });
      cachedFfmpegPath = bin;
      return bin;
    } catch (_) {}
  }

  return null;
}

/**
 * Execute an ffmpeg command as a Promise
 */
function runFfmpeg(args) {
  const ffmpeg = getFfmpegPath();
  if (!ffmpeg) {
    return Promise.reject(new Error('FFmpeg binary not available on system'));
  }

  return new Promise((resolve, reject) => {
    execFile(ffmpeg, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

/**
 * Visually Lossless Video Compression for Web
 * 
 * Compresses videos (MP4, MOV, WEBM, MKV, AVI) using:
 * - H.264 (libx264) with CRF 23 (visually lossless for human eye)
 * - Proportional downscaling to max 1920px (maintaining even dimensions)
 * - YUV420p color space for 100% universal browser compatibility (iOS, Safari, Chrome, Android)
 * - AAC audio at 128kbps
 * - `+faststart` to move metadata (moov atom) to file start so video streams instantly
 * 
 * @param {string} inputPath - Path to source video
 * @param {string} outputPath - Path to destination
 * @param {Object} [options]
 * @returns {Promise<{ success: boolean, originalSize: number, finalSize: number, percentSaved: number }>}
 */
async function compressVideo(inputPath, outputPath, options = {}) {
  const originalSize = fs.existsSync(inputPath) ? fs.statSync(inputPath).size : 0;
  const tempOut = outputPath + '.tmp.mp4';

  const {
    crf = 23,
    maxDimension = 1920,
    preset = 'fast',
    audioBitrate = '128k',
  } = options;

  try {
    const ffmpeg = getFfmpegPath();
    if (!ffmpeg) {
      fs.copyFileSync(inputPath, outputPath);
      return { success: false, originalSize, finalSize: originalSize, percentSaved: 0 };
    }

    // FFmpeg args for visually lossless web video
    const args = [
      '-i', inputPath,
      '-c:v', 'libx264',
      '-crf', String(crf),
      '-preset', preset,
      '-vf', `scale='min(${maxDimension},iw)':-2`,
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', audioBitrate,
      '-movflags', '+faststart',
      '-y',
      tempOut
    ];

    await runFfmpeg(args);

    if (fs.existsSync(tempOut)) {
      const finalSize = fs.statSync(tempOut).size;
      // If compressed is smaller than original, keep it; otherwise keep original
      if (finalSize < originalSize && finalSize > 0) {
        fs.renameSync(tempOut, outputPath);
        const percentSaved = Math.round((1 - finalSize / originalSize) * 100);
        return { success: true, originalSize, finalSize, percentSaved };
      } else {
        if (fs.existsSync(tempOut)) try { fs.unlinkSync(tempOut); } catch (_) {}
        fs.copyFileSync(inputPath, outputPath);
        return { success: true, originalSize, finalSize: originalSize, percentSaved: 0 };
      }
    } else {
      fs.copyFileSync(inputPath, outputPath);
      return { success: false, originalSize, finalSize: originalSize, percentSaved: 0 };
    }
  } catch (err) {
    console.warn('[mediaCompressor] Video compression failed, falling back to copy:', err.message);
    if (fs.existsSync(tempOut)) try { fs.unlinkSync(tempOut); } catch (_) {}
    fs.copyFileSync(inputPath, outputPath);
    return { success: false, originalSize, finalSize: originalSize, percentSaved: 0 };
  }
}

/**
 * High-Quality GIF Optimization
 * 
 * Uses a 2-pass palette generation algorithm (Lanczos scaling, 256-color differential palette,
 * Bayer dithering) to reduce GIF size by 50-70% with crisp colors and zero color banding.
 * 
 * @param {string} inputPath - Path to source GIF
 * @param {string} outputPath - Path to destination
 * @param {Object} [options]
 * @returns {Promise<{ success: boolean, originalSize: number, finalSize: number, percentSaved: number }>}
 */
async function compressGif(inputPath, outputPath, options = {}) {
  const originalSize = fs.existsSync(inputPath) ? fs.statSync(inputPath).size : 0;
  const tempOut = outputPath + '.tmp.gif';

  const {
    maxDimension = 1280,
    fps = 18,
  } = options;

  try {
    const ffmpeg = getFfmpegPath();
    if (!ffmpeg) {
      fs.copyFileSync(inputPath, outputPath);
      return { success: false, originalSize, finalSize: originalSize, percentSaved: 0 };
    }

    // 2-pass palette generation for flawless visual quality
    const filter = `fps=${fps},scale='min(${maxDimension},iw)':-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3`;

    const args = [
      '-i', inputPath,
      '-vf', filter,
      '-y',
      tempOut
    ];

    await runFfmpeg(args);

    if (fs.existsSync(tempOut)) {
      const finalSize = fs.statSync(tempOut).size;
      if (finalSize < originalSize && finalSize > 0) {
        fs.renameSync(tempOut, outputPath);
        const percentSaved = Math.round((1 - finalSize / originalSize) * 100);
        return { success: true, originalSize, finalSize, percentSaved };
      } else {
        if (fs.existsSync(tempOut)) try { fs.unlinkSync(tempOut); } catch (_) {}
        fs.copyFileSync(inputPath, outputPath);
        return { success: true, originalSize, finalSize: originalSize, percentSaved: 0 };
      }
    } else {
      fs.copyFileSync(inputPath, outputPath);
      return { success: false, originalSize, finalSize: originalSize, percentSaved: 0 };
    }
  } catch (err) {
    console.warn('[mediaCompressor] GIF compression failed, falling back to copy:', err.message);
    if (fs.existsSync(tempOut)) try { fs.unlinkSync(tempOut); } catch (_) {}
    fs.copyFileSync(inputPath, outputPath);
    return { success: false, originalSize, finalSize: originalSize, percentSaved: 0 };
  }
}

/**
 * Universal media processor: automatically detects media type and applies
 * optimal compression with safe fallback.
 */
async function processMediaFile(inputPath, outputPath, assetType = '') {
  const ext = path.extname(inputPath).toLowerCase();
  const typeLower = (assetType || '').toLowerCase();

  const isVideo = typeLower.includes('video') || ['.mp4', '.mov', '.mkv', '.webm', '.avi'].includes(ext);
  const isGif = typeLower.includes('gif') || ext === '.gif';

  if (isVideo) {
    return await compressVideo(inputPath, outputPath);
  } else if (isGif) {
    return await compressGif(inputPath, outputPath);
  } else {
    fs.copyFileSync(inputPath, outputPath);
    const sz = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
    return { success: true, originalSize: sz, finalSize: sz, percentSaved: 0 };
  }
}

module.exports = {
  getFfmpegPath,
  compressVideo,
  compressGif,
  processMediaFile
};
