const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const { handleChunkUpload, TEMP_UPLOADS_DIR, TEMP_CHUNKS_DIR, activeAssemblies } = require('../services/resumableUploadService');
const queueManager = require('../services/queueService');
require('../services/documentExtractor'); // Register worker:start listener

const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../../../storage');

/**
 * Direct High-Speed Upload for documents up to 80MB
 * Eliminates multi-chunk roundtrip overhead (completes in <5s)
 * POST /api/customized-editor/upload-document
 */
exports.uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const {
      userId = 'FLIPI0001',
      bookId = nanoid(16),
      title,
      jobId: clientJobId
    } = req.body;

    const originalName = file.originalname || 'document.pdf';
    // file.path is already written directly to disk by multer diskStorage (0MB RAM heap allocation)
    let finalFilePath = file.path;
    if (!finalFilePath && file.buffer) {
      const ext = path.extname(originalName) || '.pdf';
      finalFilePath = path.join(TEMP_UPLOADS_DIR, `direct_${nanoid(12)}_${Date.now()}${ext}`);
      await fs.promises.writeFile(finalFilePath, file.buffer);
    }

    const jobId = clientJobId || `job_${nanoid(12)}`;
    try {
      await queueManager.createJob({
        jobId,
        userId,
        bookId,
        title: title || originalName || 'My Flipbook',
        filePath: finalFilePath,
        fileName: originalName
      });
    } catch (qErr) {
      console.error('[Upload Document] Queue warning:', qErr.message);
    }

    return res.json({
      success: true,
      isComplete: true,
      jobId,
      bookId,
      progress: 100
    });
  } catch (err) {
    console.error('[Upload Document Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Handles chunked upload from frontend for very large files (>80MB)
 * POST /api/customized-editor/upload-chunk
 */
exports.uploadChunk = async (req, res) => {
  try {
    const chunkFile = req.file;
    if (!chunkFile) {
      return res.status(400).json({ success: false, message: 'No chunk data provided' });
    }

    const {
      uploadId,
      chunkIndex,
      totalChunks,
      chunkSize,
      fileName,
      userId = 'FLIPI0001',
      bookId = nanoid(16),
      title,
      jobId: clientJobId
    } = req.body;

    const parsedIndex = parseInt(chunkIndex, 10) || 0;
    const parsedTotal = parseInt(totalChunks, 10) || 1;
    const parsedChunkSize = parseInt(chunkSize, 10) || (2 * 1024 * 1024);

    const result = await handleChunkUpload({
      uploadId: uploadId || `up_${nanoid(10)}`,
      chunkIndex: parsedIndex,
      totalChunks: parsedTotal,
      chunkSize: parsedChunkSize,
      fileName: fileName || chunkFile.originalname || 'document.pdf',
      chunkBuffer: chunkFile.buffer
    });

    // If upload is finished, trigger the Redis extraction worker
    if (result.isComplete) {
      const jobId = clientJobId || `job_${nanoid(12)}`;
      try {
        await queueManager.createJob({
          jobId,
          userId,
          bookId,
          title: title || fileName || 'My Flipbook',
          filePath: result.filePath,
          fileName: result.fileName
        });
      } catch (qErr) {
        console.error('[Upload Chunk] Queue warning:', qErr.message);
      }

      return res.json({
        success: true,
        isComplete: true,
        uploadId: result.uploadId,
        jobId,
        bookId,
        progress: 100
      });
    }

    return res.json({
      success: true,
      isComplete: false,
      uploadId: result.uploadId,
      bookId,
      progress: result.progress
    });
  } catch (err) {
    console.error('[Upload Chunk Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Pure Binary Zero-Copy Chunk Streaming (FlipHTML5 / FlippingBook Architecture)
 * - Raw binary body (application/octet-stream) piped directly to disk
 * - Zero Multer, zero Busboy, zero multipart boundary parsing
 * - FlippingBook state protocol: returns completedChunks array and state: 'WaitingMoreData'
 * POST /api/customized-editor/upload-chunk-binary
 */
exports.uploadChunkBinary = async (req, res) => {
  let fileStream = null;
  let partPath = null;
  try {
    const uploadId = req.headers['x-upload-id'] || `up_${nanoid(12)}`;
    const chunkIndex = parseInt(req.headers['x-chunk-index'], 10) || 0;
    const totalChunks = parseInt(req.headers['x-total-chunks'], 10) || 1;
    const chunkSize = parseInt(req.headers['x-chunk-size'], 10) || (2 * 1024 * 1024);
    const fileName = decodeURIComponent(req.headers['x-file-name'] || 'document.pdf');
    const userId = req.headers['x-user-id'] || 'FLIPI0001';
    const bookId = req.headers['x-book-id'] || nanoid(16);
    const title = decodeURIComponent(req.headers['x-title'] || fileName);
    const clientJobId = req.headers['x-job-id'];

    const uploadDir = path.join(TEMP_CHUNKS_DIR, uploadId);
    await fs.promises.mkdir(uploadDir, { recursive: true });

    partPath = path.join(uploadDir, `${String(chunkIndex).padStart(6, '0')}.part`);
    fileStream = fs.createWriteStream(partPath);

    req.on('error', (err) => {
      console.error('[Binary Upload] Request stream error on chunk', chunkIndex, err.message);
      try { fileStream?.destroy(); } catch (_) {}
      if (!res.headersSent) res.status(500).json({ success: false, message: 'Request stream aborted' });
    });

    fileStream.on('error', (err) => {
      console.error('[Binary Upload] File stream error on chunk', chunkIndex, err.message);
      if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
    });

    fileStream.on('finish', async () => {
      try {
        const files = await fs.promises.readdir(uploadDir);
        const partFiles = files.filter(f => f.endsWith('.part')).sort();
        const progress = Math.min(100, Math.round((partFiles.length / totalChunks) * 100));
        const completedChunks = partFiles.map(f => parseInt(f.replace('.part', ''), 10));

        if (partFiles.length >= totalChunks && !activeAssemblies.has(uploadId)) {
          activeAssemblies.add(uploadId);
          try {
            const ext = path.extname(fileName) || '.pdf';
            const finalFilePath = path.join(TEMP_UPLOADS_DIR, `${uploadId}${ext}`);
            const finalStream = fs.createWriteStream(finalFilePath);
            for (const part of partFiles) {
              const partBuf = await fs.promises.readFile(path.join(uploadDir, part));
              finalStream.write(partBuf);
            }
            await new Promise((resolve, reject) => {
              finalStream.end(resolve);
              finalStream.on('error', reject);
            });

            fs.promises.rm(uploadDir, { recursive: true, force: true }).catch(() => {});

            const jobId = clientJobId || `job_${nanoid(12)}`;
            try {
              await queueManager.createJob({
                jobId,
                userId,
                bookId,
                title,
                filePath: finalFilePath,
                fileName
              });
            } catch (qErr) {
              console.error('[Binary Upload] Queue warning:', qErr.message);
            }

            if (!res.headersSent) {
              return res.json({
                success: true,
                isComplete: true,
                state: 'Complete',
                uploadId,
                bookId,
                jobId,
                completedChunks,
                progress: 100
              });
            }
          } finally {
            activeAssemblies.delete(uploadId);
          }
        }

        if (!res.headersSent) {
          return res.json({
            success: true,
            isComplete: false,
            state: 'WaitingMoreData',
            uploadId,
            bookId,
            chunkIndex,
            completedChunks,
            progress
          });
        }
      } catch (finishErr) {
        console.error('[Binary Upload] Finish processing error on chunk', chunkIndex, finishErr);
        if (!res.headersSent) {
          return res.status(500).json({ success: false, message: finishErr.message });
        }
      }
    });

    req.pipe(fileStream);
  } catch (err) {
    console.error('[Binary Upload Setup Error]:', err);
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Server-Sent Events (SSE) Real-Time Progress Stream
 * GET /api/customized-editor/extract-stream/:jobId
 */
exports.extractStream = async (req, res) => {
  const { jobId } = req.params;
  const job = await queueManager.getJob(jobId);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx / Traefik proxy buffering for live SSE progress
  res.flushHeaders?.();

  // Send initial state immediately
  res.write(`data: ${JSON.stringify(job)}\n\n`);

  if (job.status === 'completed' || job.status === 'failed') {
    return res.end();
  }

  const updateListener = (updatedJob) => {
    res.write(`data: ${JSON.stringify(updatedJob)}\n\n`);
    if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
      queueManager.off(`job:update:${jobId}`, updateListener);
      res.end();
    }
  };

  queueManager.on(`job:update:${jobId}`, updateListener);

  req.on('close', () => {
    queueManager.off(`job:update:${jobId}`, updateListener);
  });
};

/**
 * Polling fallback for job status
 * GET /api/customized-editor/job-status/:jobId
 */
exports.getJobStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = await queueManager.getJob(jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  return res.json({ success: true, job });
};

/**
 * Lightweight manifest descriptor for 10,000+ page books (< 25 KB JSON)
 * GET /api/customized-editor/manifest/:userId/:bookId
 */
exports.getBookManifest = async (req, res) => {
  const { userId, bookId } = req.params;
  const manifestPath = path.join(storageRoot, userId, 'books', bookId, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ success: false, message: 'Manifest not found' });
  }

  try {
    const raw = await fs.promises.readFile(manifestPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(raw);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

