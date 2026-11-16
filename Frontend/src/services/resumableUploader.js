/**
 * High-Scale Resumable Uploader for 10,000+ Page Documents
 * - Pure Binary Streaming (application/octet-stream, 0-copy req.pipe())
 * - FlippingBook / FlipHTML5 2-Stage Progression:
 *   Stage 1 (Upload): Live transferred bytes (e.g. 22.4 MB / 35.0 MB)
 *   Stage 2 (Extraction): Real-time page counter & stopwatch (e.g. 66 / 100 pages, 00:14)
 *   Stage 3 (Complete): Opens flipbook ONLY when 100% of pages are extracted & verified
 */

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunk (safe 10-14s upload per chunk, eliminates Traefik 60s gateway timeouts)

export async function uploadAndExtractDocument({
  file,
  bookId,
  userId = 'FLIPI0001',
  title,
  backendUrl = '',
  onProgress,
  onInitialReady,
  onComplete,
  onError
}) {
  const totalSize = file.size;
  const uploadId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const resolvedBackend = backendUrl || import.meta.env.VITE_BACKEND_URL || '';

  try {
    let resolvedBookId = bookId || (Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10));
    const clientJobId = `job_${uploadId.replace(/^up_/, '')}`;
    let jobId = clientJobId;

    // Fast Path: Direct Streaming Upload for small files <= 2MB
    if (totalSize <= 2 * 1024 * 1024) {
      const uploadResult = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${resolvedBackend}/api/customized-editor/upload-chunk-binary`);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('X-Upload-Id', uploadId);
        xhr.setRequestHeader('X-Chunk-Index', '0');
        xhr.setRequestHeader('X-Total-Chunks', '1');
        xhr.setRequestHeader('X-Chunk-Size', String(totalSize));
        xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
        xhr.setRequestHeader('X-User-Id', userId);
        xhr.setRequestHeader('X-Book-Id', resolvedBookId);
        xhr.setRequestHeader('X-Title', encodeURIComponent(title || file.name));
        xhr.setRequestHeader('X-Job-Id', clientJobId);

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const rawPct = Math.round((evt.loaded / evt.total) * 100);
            if (onProgress) {
              onProgress({
                stage: 'uploading',
                percent: rawPct,
                loadedBytes: evt.loaded,
                totalBytes: evt.total,
                message: `Uploading document: ${(evt.loaded / (1024 * 1024)).toFixed(1)} MB / ${(evt.total / (1024 * 1024)).toFixed(1)} MB (${rawPct}%)`
              });
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error('Invalid upload response from server'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during file upload'));
        xhr.send(file);
      });

      if (uploadResult?.jobId) jobId = uploadResult.jobId;
      if (uploadResult?.bookId) resolvedBookId = uploadResult.bookId;
    } else {
      // Pure Binary Streaming Chunking (application/octet-stream)
      // 2MB chunks with 2-lane concurrency: stays safely under 60s proxy timeouts
      const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
      const concurrency = Math.min(2, totalChunks);

      const chunkProgressBytes = new Array(totalChunks).fill(0);

      const updateAggregatedProgress = () => {
        const totalUploadedBytes = chunkProgressBytes.reduce((a, b) => a + b, 0);
        const overallRatio = Math.min(1, totalUploadedBytes / totalSize);
        const rawPct = Math.round(overallRatio * 100);
        if (onProgress) {
          onProgress({
            stage: 'uploading',
            percent: rawPct,
            loadedBytes: totalUploadedBytes,
            totalBytes: totalSize,
            message: `Uploading document: ${(totalUploadedBytes / (1024 * 1024)).toFixed(1)} MB / ${(totalSize / (1024 * 1024)).toFixed(1)} MB (${rawPct}%)`
          });
        }
      };

      const uploadSingleChunkWithRetry = async (chunkIndex, maxRetries = 2) => {
        let attempt = 0;
        while (attempt <= maxRetries) {
          try {
            return await new Promise((resolve, reject) => {
              const start = chunkIndex * CHUNK_SIZE;
              const end = Math.min(start + CHUNK_SIZE, totalSize);
              const chunkBlob = file.slice(start, end);

              const xhr = new XMLHttpRequest();
              xhr.open('POST', `${resolvedBackend}/api/customized-editor/upload-chunk-binary`);
              xhr.setRequestHeader('Content-Type', 'application/octet-stream');
              xhr.setRequestHeader('X-Upload-Id', uploadId);
              xhr.setRequestHeader('X-Chunk-Index', String(chunkIndex));
              xhr.setRequestHeader('X-Total-Chunks', String(totalChunks));
              xhr.setRequestHeader('X-Chunk-Size', String(CHUNK_SIZE));
              xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
              xhr.setRequestHeader('X-User-Id', userId);
              xhr.setRequestHeader('X-Book-Id', resolvedBookId);
              xhr.setRequestHeader('X-Title', encodeURIComponent(title || file.name));
              xhr.setRequestHeader('X-Job-Id', clientJobId);

              xhr.upload.onprogress = (evt) => {
                if (evt.lengthComputable) {
                  chunkProgressBytes[chunkIndex] = evt.loaded;
                  updateAggregatedProgress();
                }
              };

              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    chunkProgressBytes[chunkIndex] = chunkBlob.size;
                    updateAggregatedProgress();
                    const resData = JSON.parse(xhr.responseText);
                    resolve(resData);
                  } catch (e) {
                    reject(new Error('Invalid chunk response'));
                  }
                } else {
                  reject(new Error(`Chunk ${chunkIndex + 1} upload failed with status ${xhr.status}`));
                }
              };

              xhr.onerror = () => reject(new Error(`Network error on chunk ${chunkIndex + 1}`));
              xhr.send(chunkBlob);
            });
          } catch (err) {
            attempt++;
            if (attempt > maxRetries) throw err;
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
      };

      let currentIndex = 0;
      let finalJobId = null;

      const runLane = async () => {
        while (currentIndex < totalChunks) {
          const idx = currentIndex++;
          const res = await uploadSingleChunkWithRetry(idx);
          if (res?.isComplete && res?.jobId) {
            finalJobId = res.jobId;
          }
        }
      };

      const lanes = [];
      for (let l = 0; l < concurrency; l++) {
        lanes.push(runLane());
      }
      await Promise.all(lanes);
      if (finalJobId) jobId = finalJobId;
    }

    if (!jobId) {
      throw new Error('Failed to retrieve extraction Job ID from server');
    }

    // Signal completion of upload step -> UI switches cleanly to Stage 2: Extraction
    if (onProgress) {
      onProgress({
        stage: 'extracting',
        percent: 0,
        current: 0,
        total: file._pageCount || 1,
        message: 'Upload complete! Starting page extraction...'
      });
    }

    // Phase 2: Dual SSE Stream + Resilient Poller for Real-Time Page Extraction
    let pollInterval = null;
    let eventSource = null;

    const cleanup = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (eventSource) {
        try { eventSource.close(); } catch (_) {}
        eventSource = null;
      }
    };

    const handleJobUpdate = (job) => {
      if (!job) return;

      const total = job.totalPages || file._pageCount || 1;
      const available = (job.availablePages !== undefined && job.availablePages !== null) ? job.availablePages : 0;
      const progressVal = job.progress || (total ? Math.round((available / total) * 100) : 0);

      if (onProgress) {
        onProgress({
          stage: 'extracting',
          percent: progressVal,
          current: available,
          total: total,
          message: `Extracting page ${available} of ${total}...`
        });
      }

      // Complete trigger: opens ONLY when 100% of all pages are extracted and verified
      if (job.status === 'completed' || (total > 0 && available >= total && job.pages?.length >= total)) {
        cleanup();
        if (onComplete) {
          onComplete({
            bookId: resolvedBookId,
            userId: job.userId || userId,
            totalPages: job.totalPages || (job.manifest && job.manifest.totalPages) || total,
            initialPages: job.pages || (job.manifest && job.manifest.pages),
            width: job.width || (job.manifest && job.manifest.width),
            height: job.height || (job.manifest && job.manifest.height),
            aspectRatio: job.aspectRatio || (job.manifest && job.manifest.aspectRatio),
            manifest: job.manifest
          });
        }
      } else if (job.status === 'failed') {
        cleanup();
        if (onError) onError(new Error(job.error || 'Server extraction failed'));
      }
    };

    // 1. Primary: Server-Sent Events (SSE) with 0ms live latency
    try {
      eventSource = new EventSource(`${resolvedBackend}/api/customized-editor/extract-stream/${jobId}`);
      eventSource.onmessage = (event) => {
        try {
          const job = JSON.parse(event.data);
          handleJobUpdate(job);
        } catch (parseErr) {
          console.error('[SSE Stream Parse Error]:', parseErr);
        }
      };
      eventSource.onerror = (err) => {
        console.warn('[SSE Connection Reconnecting or Buffered]:', err);
      };
    } catch (e) {
      console.warn('[SSE Setup Error]:', e);
    }

    // 2. Secondary: Resilient 1-second Polling fallback
    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${resolvedBackend}/api/customized-editor/job-status/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.job) {
          handleJobUpdate(data.job);
        }
      } catch (_) {}
    }, 1000);

  } catch (err) {
    if (onError) onError(err);
    else throw err;
  }
}

/**
 * Promise wrapper to extract document via server and return all pages when 100% complete
 */
export function extractDocumentViaServer(file, options = {}) {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const handleReady = (data) => {
      if (resolved) return;
      resolved = true;
      resolve(data);
    };

    let resolvedUserId = options.userId;
    if (!resolvedUserId && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          resolvedUserId = u.userID || u.userId || (u.emailId || u.email ? (u.emailId || u.email).replace(/[@.]/g, '_') : null);
        }
      } catch (_) {}
    }

    uploadAndExtractDocument({
      file,
      bookId: options.bookId,
      userId: resolvedUserId || 'FLIPI0001',
      title: options.title || file.name,
      backendUrl: options.backendUrl || '',
      onProgress: options.onProgress,
      onComplete: (data) => {
        handleReady(data);
      },
      onError: (err) => {
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      }
    });
  });
}

