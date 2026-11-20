const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const queueManager = require('./queueService');

const execFileAsync = promisify(execFile);

const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../../../storage');

// High-speed RAM disk directory: /dev/shm on Linux VPS (100% RAM tmpfs, zero SSD wear)
const RAM_DISK_DIR = fs.existsSync('/dev/shm') ? '/dev/shm' : os.tmpdir();

const CANDIDATE_CWEBP = [
  '/opt/homebrew/bin/cwebp',
  '/usr/local/bin/cwebp',
  '/usr/bin/cwebp'
];

let cachedCwebp = null;
function getCwebp() {
  if (cachedCwebp) return cachedCwebp;

  if (process.env.CWEBP_PATH && fs.existsSync(process.env.CWEBP_PATH)) {
    cachedCwebp = process.env.CWEBP_PATH;
    return cachedCwebp;
  }

  try {
    const cwebpBin = require('cwebp-bin');
    const binPath = typeof cwebpBin === 'string' ? cwebpBin : (cwebpBin && cwebpBin.default);
    if (binPath && fs.existsSync(binPath)) {
      cachedCwebp = binPath;
      return cachedCwebp;
    }
  } catch (e) {}

  for (const c of CANDIDATE_CWEBP) {
    try {
      if (fs.existsSync(c)) {
        cachedCwebp = c;
        return c;
      }
    } catch (e) {}
  }
  return 'cwebp';
}

const { pathToFileURL } = require('url');

let mupdfModule = null;
async function getMuPdf() {
  if (!mupdfModule) {
    try {
      mupdfModule = await import('mupdf');
      return mupdfModule;
    } catch (_) {}

    const candidatePaths = [
      path.resolve(__dirname, '../../../../node_modules/mupdf/dist/mupdf.js'),
      path.resolve(__dirname, '../../node_modules/mupdf/dist/mupdf.js')
    ];

    for (const cPath of candidatePaths) {
      if (fs.existsSync(cPath)) {
        try {
          mupdfModule = await import(pathToFileURL(cPath).href);
          return mupdfModule;
        } catch (_) {}
      }
    }

    try {
      const resolved = require.resolve('mupdf/dist/mupdf.js');
      mupdfModule = await import(pathToFileURL(resolved).href);
      return mupdfModule;
    } catch (finalErr) {
      throw new Error(`Failed to load MuPDF module: ${finalErr.message}`);
    }
  }
  return mupdfModule;
}

/**
 * Convert a PNG buffer directly to WebP using Google cwebp binary
 * Uses RAM-disk /dev/shm for zero physical SSD disk wear and ultra-low latency
 */
async function bufferToWebP(pngBuffer, outPath, quality = 85, resizeWidth = 0) {
  const cwebp = getCwebp();
  const randId = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const tempPng = path.join(RAM_DISK_DIR, `flip_tmp_${randId}.png`);

  await fs.promises.writeFile(tempPng, pngBuffer);

  const args = ['-q', String(quality), '-mt'];
  if (resizeWidth > 0) {
    args.push('-resize', String(resizeWidth), '0');
  }
  args.push(tempPng, '-o', outPath);

  try {
    await execFileAsync(cwebp, args, { timeout: 30000 });
  } finally {
    await fs.promises.unlink(tempPng).catch(() => {});
  }
}

/**
 * Extracts a single page using MuPDF:
 * - High-Res WebP (2400px Retina quality)
 * - Thumbnail WebP (240px thumbnail)
 * - Vector Structured Text JSON
 */
async function extractSinglePage(doc, pageIndex, outDir, mupdf) {
  const pageNum = pageIndex + 1;
  const page = doc.loadPage(pageIndex);
  const bounds = page.getBounds(); // [x0, y0, x1, y1]
  const widthPt = bounds[2] - bounds[0];
  const heightPt = bounds[3] - bounds[1];

  const ptToMm = 25.4 / 72;
  const widthMm = Math.round(widthPt * ptToMm * 10) / 10;
  const heightMm = Math.round(heightPt * ptToMm * 10) / 10;

  // 1. Vector Structured Text JSON
  let textJsonStr = '{"blocks":[]}';
  try {
    textJsonStr = page.toStructuredText().asJSON();
  } catch (e) {}
  const textJsonPath = path.join(outDir, `${pageNum}_text.json`);
  await fs.promises.writeFile(textJsonPath, textJsonStr);

  // 2. High-Res 2400px Render Scale
  const maxPt = Math.max(widthPt, heightPt);
  const targetPixels = 2400;
  const highScale = maxPt > 0 ? Math.max(1.5, Math.min(3.5, targetPixels / maxPt)) : 2.5;

  const highPix = page.toPixmap(mupdf.Matrix.scale(highScale, highScale), mupdf.ColorSpace.DeviceRGB, false, true);
  const highPngBytes = highPix.asPNG();
  const webpPath = path.join(outDir, `${pageNum}.webp`);

  // 3. Thumbnail 240px Render Scale
  const thumbScale = maxPt > 0 ? 240 / maxPt : 0.3;
  const thumbPix = page.toPixmap(mupdf.Matrix.scale(thumbScale, thumbScale), mupdf.ColorSpace.DeviceRGB, false, true);
  const thumbPngBytes = thumbPix.asPNG();
  const thumbPath = path.join(outDir, `${pageNum}_thumb.webp`);

  // Run high-res and thumbnail encodings concurrently with multi-threading
  await Promise.all([
    bufferToWebP(highPngBytes, webpPath, 85),
    bufferToWebP(thumbPngBytes, thumbPath, 75)
  ]);

  return {
    pageNumber: pageNum,
    image: `${pageNum}.webp`,
    thumb: `${pageNum}_thumb.webp`,
    text: `${pageNum}_text.json`,
    width: widthMm,
    height: heightMm,
    hasInteractive: false
  };
}

/**
 * Main Extraction Worker with Multi-Core Parallel Page Sliding Window
 */
async function processExtractionJob(job) {
  const { jobId, userId, bookId, filePath, folderName, bookName } = job;

  try {
    let fName = folderName;
    let bName = bookName;
    if (!fName || !bName) {
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.db) {
          const bookDoc = await mongoose.connection.db.collection('flipbooks').findOne({ v_id: bookId });
          if (bookDoc) {
            if (!bName) bName = bookDoc.flipbookName || bookDoc.realName || bookDoc.title;
            if (!fName) {
              const rawF = bookDoc.folder || bookDoc.folderName;
              fName = (!rawF || rawF === 'default' || rawF === 'fol_default' || String(rawF).toLowerCase() === 'my flipbooks') ? 'default' : rawF;
            }
          }
        }
      } catch (_) {}
    }
    if (!fName || String(fName).trim().toLowerCase() === 'my flipbooks' || fName === 'fol_default') fName = 'default';
    if (!bName) bName = bookId;

    const bookDir = path.join(storageRoot, userId, 'books', fName, bName);
    const pagesDir = path.join(bookDir, 'pages');
    const webpPagesDir = path.join(pagesDir, 'webp_page');
    await fs.promises.mkdir(webpPagesDir, { recursive: true });
    const baseUrl = `/storage/${userId}/books/${fName}/${bName}/pages/webp_page/`;

    const mupdf = await getMuPdf();
    const pdfBytes = await fs.promises.readFile(filePath);
    const doc = mupdf.Document.openDocument(new Uint8Array(pdfBytes), 'application/pdf');
    const totalPages = doc.countPages();

    if (totalPages === 0) {
      throw new Error('PDF document contains zero pages');
    }

    const firstPage = doc.loadPage(0);
    const firstBounds = firstPage.getBounds();
    const ptToMm = 25.4 / 72;
    const widthMm = Math.round((firstBounds[2] - firstBounds[0]) * ptToMm * 10) / 10;
    const heightMm = Math.round((firstBounds[3] - firstBounds[1]) * ptToMm * 10) / 10;
    const aspectRatio = parseFloat((widthMm / heightMm).toFixed(4));

    await queueManager.updateJob(jobId, {
      totalPages,
      width: widthMm || 210,
      height: heightMm || 297,
      aspectRatio: aspectRatio || 0.7071,
      stage: 'extracting_initial',
      status: 'extracting'
    });

    const allPages = new Array(totalPages);
    let extractedCount = 0;

    // ==========================================
    // Phase 1: Fast-Launch (Pages 1 to 4 in <500ms)
    // ==========================================
    const initialBatchSize = Math.min(4, totalPages);
    for (let p = 0; p < initialBatchSize; p++) {
      const pageInfo = await extractSinglePage(doc, p, webpPagesDir, mupdf);
      allPages[p] = pageInfo;
      extractedCount++;

      const progress = Math.round((extractedCount / totalPages) * 100);
      await queueManager.updateJob(jobId, {
        availablePages: extractedCount,
        totalPages,
        progress,
        stage: 'extracting',
        pages: allPages.filter(Boolean)
      });
    }

    await queueManager.updateJob(jobId, {
      availablePages: extractedCount,
      totalPages,
      initialPagesReady: true,
      stage: totalPages > 4 ? 'streaming_remaining' : 'finalizing',
      progress: Math.round((extractedCount / totalPages) * 100),
      pages: allPages.filter(Boolean)
    });

    // ==========================================
    // Phase 2: Multi-Core Parallel Sliding Pool
    // Process remaining pages concurrently across all CPU cores
    // ==========================================
    if (totalPages > initialBatchSize) {
      const cpuCount = os.cpus().length || 4;
      // Concurrency: 4 to 8 parallel page workers per job
      const PAGE_CONCURRENCY = Math.max(2, Math.min(8, Math.floor(cpuCount * 0.8) || 4));

      const remainingPageIndices = [];
      for (let p = initialBatchSize; p < totalPages; p++) {
        remainingPageIndices.push(p);
      }

      let nextQueueIndex = 0;
      let lastDbSyncTime = Date.now();

      const runPageWorker = async () => {
        while (nextQueueIndex < remainingPageIndices.length) {
          const currentIndex = nextQueueIndex++;
          const pageIdx = remainingPageIndices[currentIndex];

          const pageInfo = await extractSinglePage(doc, pageIdx, webpPagesDir, mupdf);
          allPages[pageIdx] = pageInfo;
          extractedCount++;

          const progress = Math.round((extractedCount / totalPages) * 100);

          // Real-time SSE update on every extracted page
          await queueManager.updateJob(jobId, {
            availablePages: extractedCount,
            totalPages,
            progress,
            stage: 'streaming_remaining'
          });

          // Sync batch to MongoDB every 5 pages or at least every 2 seconds
          const now = Date.now();
          if (extractedCount % 5 === 0 || extractedCount === totalPages || (now - lastDbSyncTime > 2000)) {
            lastDbSyncTime = now;
            try {
              const mongoose = require('mongoose');
              if (mongoose.connection && mongoose.connection.db) {
                const currentPagesFormatted = allPages.filter(Boolean).map(ap => {
                  const webpUrl = `${baseUrl}${ap.pageNumber}.webp`;
                  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${widthMm || 210} ${heightMm || 297}" width="100%" height="100%" style="overflow: visible"><g id="g-page-${ap.pageNumber}" data-name="Page ${ap.pageNumber}"><image id="img-page-${ap.pageNumber}" x="0" y="0" width="${widthMm || 210}" height="${heightMm || 297}" href="${webpUrl}" preserveAspectRatio="none" style="image-rendering: -webkit-optimize-contrast; image-rendering: high-quality;" /></g></svg>`;
                  return {
                    id: ap.pageNumber,
                    pageNumber: ap.pageNumber,
                    name: `Page ${ap.pageNumber}`,
                    fileName: `Page ${ap.pageNumber}.svg`,
                    imageUrl: webpUrl,
                    content: svgContent,
                    html: svgContent,
                    isPlaceholder: false
                  };
                });
                await mongoose.connection.db.collection('flipbooks').updateOne(
                  { v_id: bookId },
                  { $set: { pages: currentPagesFormatted, pagesCount: totalPages } }
                );
              }
            } catch (_) {}
          }
        }
      };

      // Launch worker pool
      const workerCount = Math.min(PAGE_CONCURRENCY, remainingPageIndices.length);
      const workers = Array.from({ length: workerCount }, () => runPageWorker());
      await Promise.all(workers);
    }

    const finalPages = allPages.filter(Boolean);

    // Save lightweight manifest.json (< 25 KB)
    const manifest = {
      bookId,
      userId,
      folderName: fName,
      bookName: bName,
      totalPages,
      width: widthMm,
      height: heightMm,
      aspectRatio,
      baseUrl,
      pages: finalPages
    };

    await fs.promises.writeFile(
      path.join(bookDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Sync total pages count and page structures with MongoDB collection 'flipbooks'
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection && mongoose.connection.db) {
        const formattedDbPages = finalPages.map(p => ({
          id: p.pageNumber,
          pageNumber: p.pageNumber,
          name: `Page ${p.pageNumber}`,
          fileName: `${p.pageNumber}.webp`,
          imageUrl: `${manifest.baseUrl}${p.pageNumber}.webp`,
          content: `<div style="position:relative;width:100%;height:100%;"><img src="${manifest.baseUrl}${p.pageNumber}.webp" style="width:100%;height:100%;object-fit:contain;display:block;" alt="Page ${p.pageNumber}" /></div>`,
          html: `<div style="position:relative;width:100%;height:100%;"><img src="${manifest.baseUrl}${p.pageNumber}.webp" style="width:100%;height:100%;object-fit:contain;display:block;" alt="Page ${p.pageNumber}" /></div>`,
          isPlaceholder: false
        }));

        await mongoose.connection.db.collection('flipbooks').updateOne(
          { v_id: bookId },
          { 
            $set: { 
              pages: formattedDbPages,
              pagesCount: totalPages,
              'meta.pages': totalPages,
              'meta.pageCount': totalPages,
              'meta.pagesCount': totalPages
            } 
          }
        );
      }
    } catch (dbErr) {
      console.warn('[documentExtractor] DB update warning:', dbErr);
    }

    await queueManager.updateJob(jobId, {
      status: 'completed',
      stage: 'completed',
      progress: 100,
      pages: finalPages,
      manifest
    });

    // Remove uploaded temporary PDF
    await fs.promises.unlink(filePath).catch(() => {});
  } catch (err) {
    console.error(`[Extraction Job ${jobId} Error]:`, err);
    await queueManager.updateJob(jobId, {
      status: 'failed',
      stage: 'error',
      error: err.message || 'Extraction failed'
    });
  } finally {
    queueManager.releaseWorker();
  }
}

queueManager.on('worker:start', (job) => {
  processExtractionJob(job);
});

module.exports = {
  processExtractionJob,
  extractSinglePage
};
