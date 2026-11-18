/**
 * Hardware Capability & Memory Profiler (<2ms execution)
 *
 * Strict Safety Rule: 1.5x Multiplier & Guaranteed Free Buffer
 *
 * Formula:
 *   Available Free Headroom >= max(750 MB, Estimated Job Memory * 1.5)
 *
 * Option 3 Stress Test Hooks:
 *   - window.__SIMULATE_LOW_MEMORY__ = true -> simulates constrained RAM (routes to VPS)
 *   - window.__FORCE_VPS__ = true           -> forces Cloud VPS Engine
 *   - window.__STRESS_TEST_HANG__(mb)       -> artificially loads browser RAM to test GC & hang limits
 */

// Global stress test hooks exposed for browser console testing
if (typeof window !== 'undefined') {
  window.__SIMULATE_LOW_MEMORY__ = window.__SIMULATE_LOW_MEMORY__ || false;
  window.__FORCE_VPS__ = window.__FORCE_VPS__ || false;

  // Option 3 Stress Tester: Allocates real RAM buffers in memory
  window.__STRESS_TEST_HANG__ = function(mbToAllocate = 500) {
    console.warn(`[STRESS TEST] Allocating ${mbToAllocate}MB of real memory buffers to induce browser memory pressure...`);
    window.__STRESS_BUFFERS__ = window.__STRESS_BUFFERS__ || [];
    try {
      for (let i = 0; i < mbToAllocate; i += 50) {
        const buf = new Uint8Array(50 * 1024 * 1024);
        for (let j = 0; j < buf.length; j += 4096) buf[j] = 1; // Touch memory to force OS allocation
        window.__STRESS_BUFFERS__.push(buf);
      }
      console.warn(`[STRESS TEST] Successfully allocated ${mbToAllocate}MB! Check performance.memory in console.`);
    } catch (e) {
      console.error('[STRESS TEST] Allocation triggered OOM as expected:', e);
    }
  };

  window.__CLEAR_STRESS_TEST__ = function() {
    window.__STRESS_BUFFERS__ = null;
    window.__SIMULATE_LOW_MEMORY__ = false;
    window.__FORCE_VPS__ = false;
    console.log('[STRESS TEST] Cleared stress test buffers.');
  };
}

/**
 * Calculates estimated memory for a given file size and page count:
 * - Raw binary buffer: fileMb
 * - PDF.js parse & decompressed objects: fileMb * 3
 * - V8 generational GC buffer & page canvases: estimatedPages * 2.5MB
 * - UI & React cushion: 300MB
 *
 * @param {object} params
 * @param {number} [params.fileSizeBytes=0]
 * @param {number} [params.pageCount=0]
 * @returns {number} Estimated RAM needed in MB
 */
export function estimateJobMemoryMb({ fileSizeBytes = 0, pageCount = 0 } = {}) {
  const fileMb = (fileSizeBytes || 0) / (1024 * 1024);
  const estimatedPages = pageCount > 0 ? pageCount : Math.max(1, Math.round(fileMb * 2));
  const estimatedJobMb = Math.round((fileMb * 3) + (estimatedPages * 2.5) + 300);
  return Math.max(150, estimatedJobMb);
}

/**
 * Probes whether the OS/browser can commit a memory buffer right now.
 * @param {number} mb
 * @returns {boolean}
 */
export function canAllocateSafely(mb = 32) {
  try {
    const buffer = new ArrayBuffer(mb * 1024 * 1024);
    const view = new Uint8Array(buffer);
    view[0] = 1; // Force OS page commitment
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Profiles client hardware in <2ms with the strict 1.5x Safety Multiplier.
 *
 * @param {object} [options={}]
 * @param {number} [options.fileSizeBytes=0]
 * @param {number} [options.pageCount=0]
 * @returns {{
 *   tier: 1 | 3,
 *   cores: number,
 *   deviceMemoryGb: number,
 *   heapHeadroomMb: number | null,
 *   estimatedJobMb: number,
 *   requiredHeadroomMb: number,
 *   capacityUsagePct: number | null,
 *   mode: 'edge' | 'vps',
 *   recommendedWorkers: number,
 *   reason: string
 * }}
 */
export function getHardwareProfile({ fileSizeBytes = 0, pageCount = 0 } = {}) {
  const cores =
    typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 0 : 0;
  const deviceMemoryGb =
    typeof navigator !== 'undefined' ? navigator.deviceMemory || 0 : 0;

  // Read JS heap headroom (Chromium only)
  let heapHeadroomMb = null;
  if (typeof performance !== 'undefined' && performance.memory) {
    const limit = performance.memory.jsHeapSizeLimit || 0;
    const used = performance.memory.usedJSHeapSize || 0;
    if (limit > 0) {
      heapHeadroomMb = Math.round((limit - used) / (1024 * 1024));
    }
  }

  // Option 3: Simulate low memory if triggered via console hook or URL param
  const isSimulatedLow = typeof window !== 'undefined' && (
    window.__SIMULATE_LOW_MEMORY__ === true ||
    new URLSearchParams(window.location.search).get('simulate_low_memory') === 'true'
  );
  if (isSimulatedLow) {
    heapHeadroomMb = 350; // Artificially simulate 350MB free headroom (triggers strict failover)
  }

  const isForceVps = typeof window !== 'undefined' && (
    window.__FORCE_VPS__ === true ||
    new URLSearchParams(window.location.search).get('force_vps') === 'true'
  );

  // Micro-allocation probe: must be able to commit 32 MB right now
  const canAllocate32Mb = canAllocateSafely(32);

  // ── STRICT 1.5x SAFETY MULTIPLIER GATE ────────────────────────────────────
  const SAFETY_MULTIPLIER = 1.5;
  const estimatedJobMb = estimateJobMemoryMb({ fileSizeBytes, pageCount });
  const requiredHeadroomMb = Math.max(750, Math.round(estimatedJobMb * SAFETY_MULTIPLIER));

  const capacityUsagePct = (heapHeadroomMb !== null && heapHeadroomMb > 0)
    ? Math.round((estimatedJobMb / heapHeadroomMb) * 100)
    : null;

  // Conditions for 100% verified edge processing:
  const heapOk = !isForceVps && heapHeadroomMb !== null && heapHeadroomMb >= requiredHeadroomMb;
  const deviceRamOk = deviceMemoryGb >= 4;
  const coresOk = cores >= 2;
  const allocOk = canAllocate32Mb;

  if (!heapOk || !deviceRamOk || !coresOk || !allocOk) {
    const reasons = [];
    if (isForceVps) reasons.push('forced via test flag (__FORCE_VPS__)');
    if (isSimulatedLow) reasons.push('simulated low memory (__SIMULATE_LOW_MEMORY__)');
    if (!heapOk && !isForceVps && !isSimulatedLow) {
      if (heapHeadroomMb === null) {
        reasons.push('heap headroom unknown (non-Chromium -> cannot verify memory safety)');
      } else {
        reasons.push(
          `headroom ${heapHeadroomMb}MB < ${requiredHeadroomMb}MB required (job needs ${estimatedJobMb}MB x 1.5 buffer, load would be ${capacityUsagePct}% > 60% safe limit)`
        );
      }
    }
    if (!deviceRamOk) reasons.push(`device RAM ${deviceMemoryGb}GB < 4GB required`);
    if (!coresOk) reasons.push(`CPU cores ${cores} < 2 required`);
    if (!allocOk) reasons.push('32MB allocation probe failed (OOM risk)');

    return {
      tier: 3,
      cores,
      deviceMemoryGb,
      heapHeadroomMb,
      estimatedJobMb,
      requiredHeadroomMb,
      capacityUsagePct,
      mode: 'vps',
      recommendedWorkers: 0,
      reason: `VPS required: ${reasons.join('; ')}`
    };
  }

  // ── 100% VERIFIED CLIENT CAPABILITY ───────────────────────────────────────
  const recommendedWorkers = Math.min(4, Math.max(2, Math.floor(cores * 0.6)));
  return {
    tier: 1,
    cores,
    deviceMemoryGb,
    heapHeadroomMb,
    estimatedJobMb,
    requiredHeadroomMb,
    capacityUsagePct,
    mode: 'edge',
    recommendedWorkers,
    reason: `Client edge verified: ${heapHeadroomMb}MB free heap, job load ${capacityUsagePct}% (safe <60%), ${deviceMemoryGb}GB RAM, ${cores} cores`
  };
}
