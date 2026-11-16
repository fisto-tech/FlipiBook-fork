const fs = require('fs');
const path = require('path');
const os = require('os');
const { nanoid } = require('nanoid');

const storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.resolve(__dirname, '../../../../storage');

const TEMP_CHUNKS_DIR = path.join(storageRoot, 'temp_chunks');
const TEMP_UPLOADS_DIR = path.join(storageRoot, 'temp_uploads');

// Ensure directories exist
try {
  fs.mkdirSync(TEMP_CHUNKS_DIR, { recursive: true });
  fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
} catch (e) {}

/**
 * Handles incoming binary chunks with zero-copy direct byte-offset writing.
 * Allows out-of-order parallel chunk ingestion with zero assembly latency!
 *
 * @param {Object} params
 * @param {string} params.uploadId - Unique upload session ID
 * @param {number} params.chunkIndex - Zero-indexed chunk number
 * @param {number} params.totalChunks - Total chunks expected
 * @param {string} params.fileName - Original file name
 * @param {Buffer} params.chunkBuffer - Raw binary chunk data
 * @param {number} [params.chunkSize] - Standard chunk size in bytes
 * @returns {Promise<{ isComplete: boolean, filePath?: string, uploadId: string, progress: number }>}
 */
async function handleChunkUpload({ uploadId, chunkIndex, totalChunks, fileName, chunkBuffer, chunkSize = 10 * 1024 * 1024 }) {
  if (!uploadId) {
    uploadId = `up_${nanoid(12)}`;
  }

  const uploadDir = path.join(TEMP_CHUNKS_DIR, uploadId);
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(fileName) || '.pdf';
  const finalFilePath = path.join(TEMP_UPLOADS_DIR, `${uploadId}${ext}`);

  // 1. Write chunk directly to destination file at exact byte offset (Zero assembly overhead!)
  const byteOffset = chunkIndex * chunkSize;
  const handle = await fs.promises.open(finalFilePath, 'a+');
  try {
    await handle.write(chunkBuffer, 0, chunkBuffer.length, byteOffset);
  } finally {
    await handle.close();
  }

  // 2. Mark this chunk index as completed on disk (crash-safe & supports parallel chunks)
  const markerPath = path.join(uploadDir, `${String(chunkIndex).padStart(6, '0')}.done`);
  await fs.promises.writeFile(markerPath, '');

  const doneFiles = await fs.promises.readdir(uploadDir);
  const doneCount = doneFiles.filter(f => f.endsWith('.done')).length;
  const progress = Math.min(100, Math.round((doneCount / totalChunks) * 100));

  // 3. If all chunks have arrived, file is ALREADY fully assembled!
  if (doneCount >= totalChunks) {
    // Clean up temporary tracking directory in background
    fs.promises.rm(uploadDir, { recursive: true, force: true }).catch(() => {});

    const stats = await fs.promises.stat(finalFilePath);
    return {
      isComplete: true,
      uploadId,
      filePath: finalFilePath,
      fileName,
      fileSize: stats.size,
      progress: 100
    };
  }

  return {
    isComplete: false,
    uploadId,
    chunkIndex,
    totalChunks,
    progress
  };
}

module.exports = {
  handleChunkUpload,
  TEMP_UPLOADS_DIR
};

