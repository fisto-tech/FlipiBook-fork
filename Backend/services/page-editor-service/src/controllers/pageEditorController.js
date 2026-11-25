const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const Flipbook = require('../../../../shared/models/Flipbook');
const FlipbookAsset = require('../../../../shared/models/FlipbookAsset');
const { getAuthUser } = require('../utils/userHelper');
const { resolveFlipbookPaths } = require('../utils/storageHelper');

/**
 * Service status / health check endpoint
 * @route GET /api/page-editor/status
 */
const getServiceStatus = (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'page-editor-service',
    timestamp: new Date().toISOString()
  });
};

/**
 * Helper to recursively follow HTTP/HTTPS redirects
 */
const followRedirects = (url, maxRedirects = 5) => {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) return resolve(url);
    try {
      const u = new URL(url);
      const client = u.protocol === 'https:' ? https : http;
      const options = {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      };

      const request = client.request(options, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          let nextUrl = response.headers.location;
          if (!nextUrl.startsWith('http')) {
            nextUrl = new URL(nextUrl, url).href;
          }
          return followRedirects(nextUrl, maxRedirects - 1).then(resolve);
        }
        resolve(url);
      });

      request.on('error', () => resolve(url));
      request.setTimeout(5000, () => {
        request.destroy();
        resolve(url);
      });
      request.end();
    } catch (e) {
      resolve(url);
    }
  });
};

/**
 * Resolve Google Maps URL (especially shortlinks like maps.app.goo.gl)
 * @route GET /api/page-editor/resolve-map-url or /api/flipbook/resolve-map-url
 */
const resolveMapUrl = async (req, res) => {
  try {
    const rawUrl = (req.query.url || '').trim();
    if (!rawUrl) {
      return res.status(400).json({ success: false, message: 'URL query parameter is required' });
    }

    const resolved = await followRedirects(rawUrl);

    let place = '';
    let coords = '';
    const placeMatch = resolved.match(/\/maps\/place\/([^/@?]+)/i);
    const searchMatch = resolved.match(/\/maps\/search\/([^/@?]+)/i);
    const coordsMatch = resolved.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);

    if (placeMatch && placeMatch[1]) {
      place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    } else if (searchMatch && searchMatch[1]) {
      place = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
    }

    if (coordsMatch) {
      coords = `${coordsMatch[1]}, ${coordsMatch[2]}`;
    }

    try {
      const u = new URL(resolved.startsWith('http') ? resolved : `https://${resolved}`);
      const q = u.searchParams.get('q') || u.searchParams.get('query');
      if (q && !place) {
        place = decodeURIComponent(q.replace(/\+/g, ' '));
      }
    } catch (e) { }

    let embedUrl = '';
    if (coords) {
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(coords)}&t=&z=16&ie=UTF8&iwloc=near&output=embed`;
    } else if (place) {
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=15&ie=UTF8&iwloc=near&output=embed`;
    } else {
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(rawUrl)}&t=&z=14&ie=UTF8&iwloc=near&output=embed`;
    }

    const nameParts = (place || '').split(',');
    const mainTitle = nameParts[0]?.trim() || place || 'Location';
    const secondaryAddress = nameParts.length > 1 ? nameParts.slice(1).join(',').trim() : (coords ? `Coordinates: ${coords}` : mainTitle);

    return res.status(200).json({
      success: true,
      resolvedUrl: resolved,
      embedUrl,
      place: mainTitle,
      details: {
        name: mainTitle,
        address: secondaryAddress,
        coords: coords || null
      }
    });
  } catch (error) {
    console.error('[Page Editor Controller] resolveMapUrl error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resolve map URL',
      error: error.message
    });
  }
};

/**
 * Where Google places a map query — the same result the editor's Google Maps embed shows.
 * Reads Google's embed page for the query and returns its camera centre and the place pin.
 * @route GET /api/flipbook/map-geocode?q=...
 */
const mapGeocodeCache = new Map();
const geocodeMapQuery = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const z = Math.max(1, Math.min(21, parseFloat(req.query.z) || 14));
    if (!q) return res.status(400).json({ success: false, message: 'q query parameter is required' });
    const cacheKey = `${q}|${z}`;
    if (mapGeocodeCache.has(cacheKey)) return res.status(200).json(mapGeocodeCache.get(cacheKey));

    // Same URL shape as the editor's embed, so Google picks the same place / camera
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=${z}&ie=UTF8&iwloc=near&output=embed`;
    const html = await new Promise((resolve, reject) => {
      const fetchUrl = (url, hops = 5) => {
        https.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
            'Accept-Language': 'en',
          },
        }, (resp) => {
          if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location && hops > 0) {
            resp.resume();
            return fetchUrl(new URL(resp.headers.location, url).href, hops - 1);
          }
          let body = '';
          resp.setEncoding('utf8');
          resp.on('data', (c) => { body += c; if (body.length > 2_000_000) resp.destroy(); });
          resp.on('end', () => resolve(body));
          resp.on('error', reject);
        }).on('error', reject).setTimeout(8000, function onTimeout() { this.destroy(new Error('timeout')); });
      };
      fetchUrl(embedUrl);
    });

    // Place: ["0x…:0x…","Name, Address",[lat,lng](,"<cid>")?] — a cid means a specific place
    // (business / landmark), which Google marks with a red pin; areas (cities) get no pin.
    const placeM = html.match(/\["0x[0-9a-f]+:0x[0-9a-f]+","((?:[^"\\]|\\.)*)",\[(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\](?:,"(\d+)")?\]/i);
    // Camera: [[[altitude,lng,lat],[0,0,0],null,fov]
    const camM = html.match(/\[\[\[(\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\],\[0,0,0\],null,(\d+(?:\.\d+)?)\]/);

    const marker = placeM ? { lat: parseFloat(placeM[2]), lng: parseFloat(placeM[3]) } : null;
    const center = camM ? { lat: parseFloat(camM[3]), lng: parseFloat(camM[2]) } : marker;
    if (!center) return res.status(200).json({ success: false, message: 'Location not found' });

    // Effective zoom of Google's camera. Calibrated: a city at z=14 (lat 11.67°) has altitude ≈ 62518 m,
    // so zoom = log2(K·cos(lat) / altitude) with K = 2^14·62518 / cos(11.67°).
    let zoom = z;
    if (camM) {
      const alt = parseFloat(camM[1]);
      const K = (2 ** 14) * 62518.11 / Math.cos((11.66731595 * Math.PI) / 180);
      const zEff = Math.log2((K * Math.cos((center.lat * Math.PI) / 180)) / alt);
      if (Number.isFinite(zEff) && zEff > 0 && zEff < 23) zoom = Math.round(zEff * 100) / 100;
    }

    const result = {
      success: true,
      query: q,
      name: placeM ? JSON.parse(`"${placeM[1]}"`) : q,
      center,
      marker,
      showPin: Boolean(placeM && placeM[4]),
      zoom,
    };
    if (mapGeocodeCache.size > 500) mapGeocodeCache.delete(mapGeocodeCache.keys().next().value);
    mapGeocodeCache.set(cacheKey, result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Page Editor Controller] geocodeMapQuery error:', error.message);
    return res.status(200).json({ success: false, message: 'Geocoding failed' });
  }
};

/**
 * Google map tile proxy for exports (the browser can't read Google tiles cross-origin).
 * @route GET /api/flipbook/map-tile?lyrs=m|y|s|p&x=&y=&z=&hl=en
 */
const mapTileCache = new Map();
const getMapTile = (req, res) => {
  const lyrs = ['m', 'y', 's', 'p', 'h'].includes(req.query.lyrs) ? req.query.lyrs : 'm';
  const x = parseInt(req.query.x, 10);
  const y = parseInt(req.query.y, 10);
  const z = parseInt(req.query.z, 10);
  const hl = /^[a-z]{2}(-[A-Za-z]{2})?$/.test(req.query.hl || '') ? req.query.hl : 'en';
  const scale = req.query.scale === '2' ? 2 : 1; // 2 = high-DPI 512px tile, same labels/zoom
  if (![x, y, z].every(Number.isFinite) || z < 0 || z > 21) {
    return res.status(400).end();
  }
  const key = `${lyrs}/${z}/${x}/${y}/${hl}/${scale}`;
  const send = (buf, type) => {
    res.set('Content-Type', type);
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).end(buf);
  };
  if (mapTileCache.has(key)) {
    const c = mapTileCache.get(key);
    return send(c.buf, c.type);
  }
  const url = `https://mt${(x + y) % 4}.google.com/vt/lyrs=${lyrs}&x=${x}&y=${y}&z=${z}&hl=${hl}${scale === 2 ? '&scale=2' : ''}`;
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' } }, (resp) => {
    if (resp.statusCode !== 200) { resp.resume(); return res.status(502).end(); }
    const chunks = [];
    resp.on('data', (c) => chunks.push(c));
    resp.on('end', () => {
      const buf = Buffer.concat(chunks);
      const type = resp.headers['content-type'] || 'image/png';
      if (mapTileCache.size > 2000) mapTileCache.delete(mapTileCache.keys().next().value);
      mapTileCache.set(key, { buf, type });
      send(buf, type);
    });
    resp.on('error', () => res.status(502).end());
  }).on('error', () => res.status(502).end()).setTimeout(8000, function onTimeout() { this.destroy(); });
};

/**
 * Pixabay image search for the editor's Add Elements → Images panel.
 * The API key stays on the server (env PIXBAY_API / PIXABAY_API). Responses are cached for 24h
 * as Pixabay's API terms require.
 * @route GET /api/page-editor/pixabay?q=&page=&orientation=
 */
let pixabayKeyCache = null;
const getPixabayKey = () => {
  if (pixabayKeyCache !== null) return pixabayKeyCache;
  let key = process.env.PIXBAY_API || process.env.PIXABAY_API || process.env.PIXABAY_API_KEY || '';
  if (!key) {
    // Local monorepo fallback: the key may only be in the Frontend .env
    try {
      const fs = require('fs');
      const pathMod = require('path');
      const candidate = pathMod.resolve(__dirname, '../../../../../Frontend/.env');
      if (fs.existsSync(candidate)) {
        const parsed = require('dotenv').parse(fs.readFileSync(candidate));
        key = parsed.PIXBAY_API || parsed.PIXABAY_API || '';
      }
    } catch (e) { /* ignore */ }
  }
  pixabayKeyCache = key || '';
  return pixabayKeyCache;
};
const pixabayCache = new Map();
const PIXABAY_TTL = 24 * 60 * 60 * 1000;
let pixabayRateLimitedUntil = 0;

const findFallbackPixabayData = (cacheKey, q, orientation) => {
  if (pixabayCache.has(cacheKey)) {
    return pixabayCache.get(cacheKey).data;
  }
  const cleanQ = (q || '').toLowerCase();
  for (const [key, val] of pixabayCache.entries()) {
    if (cleanQ && key.startsWith(`v3|${cleanQ}|`) && val?.data?.hits?.length) {
      return val.data;
    }
  }
  // Fallback to any cached popular results
  for (const [, val] of pixabayCache.entries()) {
    if (val?.data?.hits?.length) {
      return val.data;
    }
  }
  return null;
};

const cdnSize = (previewURL, size) => (
  /^https:\/\/cdn\.pixabay\.com\/.+_150\.(jpe?g|png)$/i.test(previewURL || '')
    ? previewURL.replace(/_150\.(jpe?g|png)$/i, `_${size}.$1`) : null
);

const searchPixabay = async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  const page = Math.max(1, Math.min(50, parseInt(req.query.page, 10) || 1));
  const perPage = Math.max(3, Math.min(60, parseInt(req.query.per_page, 10) || 30));
  const reqOrientation = String(req.query.orientation || 'all').toLowerCase();
  const orientation = ['all', 'horizontal', 'vertical', 'square'].includes(reqOrientation) ? reqOrientation : 'all';
  const cacheKey = `v3|${q.toLowerCase()}|${page}|${perPage}|${orientation}`;

  try {
    const key = getPixabayKey();
    if (!key) return res.status(503).json({ success: false, message: 'Pixabay API key is not configured (PIXBAY_API)' });

    // Check memory cache first (TTL 24h)
    const hit = pixabayCache.get(cacheKey);
    if (hit && Date.now() - hit.at < PIXABAY_TTL) return res.status(200).json(hit.data);

    // If Pixabay is currently cooling down from a 429 rate limit
    if (pixabayRateLimitedUntil > Date.now()) {
      const fallback = findFallbackPixabayData(cacheKey, q, orientation);
      if (fallback) {
        return res.status(200).json({ ...fallback, rateLimited: true, stale: true });
      }
      return res.status(429).json({
        success: false,
        rateLimited: true,
        hits: [],
        message: 'Pixabay is busy right now. Please wait a few moments before trying again.',
      });
    }

    const pixabayOrientation = orientation === 'square' ? 'all' : orientation;
    const apiPerPage = orientation === 'square' ? Math.min(100, perPage * 2) : perPage;
    const params = new URLSearchParams({
      key, q, page: String(page), per_page: String(apiPerPage), image_type: 'photo',
      orientation: pixabayOrientation, safesearch: 'true', order: q ? 'popular' : 'latest',
    });

    const body = await new Promise((resolve, reject) => {
      https.get(`https://pixabay.com/api/?${params.toString()}`, (resp) => {
        let d = '';
        resp.setEncoding('utf8');
        resp.on('data', (c) => { d += c; });
        resp.on('end', () => {
          if (resp.statusCode === 200) {
            resolve(d);
          } else if (resp.statusCode === 429) {
            const retryAfter = parseInt(resp.headers['retry-after'], 10) || 60;
            pixabayRateLimitedUntil = Date.now() + (Math.min(retryAfter, 120) * 1000);
            const err = new Error('Pixabay 429');
            err.statusCode = 429;
            reject(err);
          } else {
            reject(new Error(`Pixabay ${resp.statusCode}`));
          }
        });
        resp.on('error', reject);
      }).on('error', reject).setTimeout(10000, function onTimeout() { this.destroy(new Error('timeout')); });
    });

    const json = JSON.parse(body);
    let rawHits = json.hits || [];
    if (orientation === 'square') {
      rawHits = rawHits.filter((h) => {
        const ratio = (h.imageWidth && h.imageHeight) ? (h.imageWidth / h.imageHeight) : 1;
        return ratio >= 0.75 && ratio <= 1.33;
      });
    }

    const data = {
      success: true,
      total: orientation === 'square' ? Math.round((json.totalHits || 0) * 0.4) : (json.totalHits || 0),
      page,
      hits: rawHits.map((h) => ({
        id: h.id,
        tags: h.tags,
        width: h.imageWidth,
        height: h.imageHeight,
        // Permanent CDN links (the API's webformatURL/largeImageURL are temporary, rate-limited
        // pixabay.com/get/ links that often fail to load in the browser)
        preview: cdnSize(h.previewURL, 640) || h.webformatURL, // grid
        large: cdnSize(h.previewURL, 1280) || h.webformatURL,  // inserted into the page
        user: h.user,
        pageURL: h.pageURL,
      })),
    };
    if (pixabayCache.size > 500) pixabayCache.delete(pixabayCache.keys().next().value);
    pixabayCache.set(cacheKey, { at: Date.now(), data });
    return res.status(200).json(data);
  } catch (error) {
    if (error.statusCode === 429 || error.message?.includes('429')) {
      console.warn('[Page Editor Controller] Pixabay rate limit (429) hit. Active until:', new Date(pixabayRateLimitedUntil).toLocaleTimeString());
      const fallback = findFallbackPixabayData(cacheKey, q, orientation);
      if (fallback) {
        return res.status(200).json({ ...fallback, rateLimited: true, stale: true });
      }
      return res.status(429).json({
        success: false,
        rateLimited: true,
        hits: [],
        message: 'Pixabay is receiving too many requests right now. Please wait a few moments.',
      });
    }
    console.error('[Page Editor Controller] searchPixabay error:', error.message);
    return res.status(502).json({ success: false, message: 'Image search failed' });
  }
};

/**
 * Get page editor data for an authenticated user and specific flipbook
 * @route GET /api/page-editor/data
 */
const getPageData = async (req, res) => {
  try {
    const { emailId: authEmail, objectId, customUserId } = getAuthUser(req);
    const { v_id, emailId: reqEmail } = req.query;
    const emailId = authEmail || reqEmail;

    if (!v_id) {
      return res.status(400).json({
        success: false,
        message: 'v_id query parameter is required to load page editor data'
      });
    }

    const doc = await Flipbook.findOne({ v_id });
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Flipbook not found'
      });
    }

    // Verify ownership
    if (emailId && doc.userEmail && doc.userEmail.toLowerCase() !== emailId.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this flipbook'
      });
    }

    // Fetch assets count associated with this flipbook
    const assetCount = await FlipbookAsset.countDocuments({ flipbook_v_id: v_id });

    // 1. MUST load page data directly from local storage file on disk first
    let populatedPages = doc.pages || [];
    try {
      const { bookDir } = await resolveFlipbookPaths({
        v_id: doc.v_id,
        emailId: doc.userEmail || emailId,
        folderName: doc.folderName,
        flipbookName: doc.flipbookName
      });

      populatedPages = (doc.pages || []).map((p) => {
        const pageObj = p.toObject ? p.toObject() : { ...p };
        let pageContent = '';
        const targetFileName = pageObj.fileName || `${pageObj.pageNumber}.svg`;
        const possibleFilePaths = [
          path.join(bookDir, 'pages', targetFileName),
          pageObj.name ? path.join(bookDir, 'pages', `${pageObj.name}.svg`) : null,
          path.join(bookDir, 'pages', `${pageObj.pageNumber}.svg`),
          path.join(bookDir, 'pages', `Page ${pageObj.pageNumber}.svg`),
          path.join(bookDir, 'pages', `${pageObj.name}.html`),
          path.join(bookDir, targetFileName)
        ].filter(Boolean);

        for (const filePath of possibleFilePaths) {
          if (fs.existsSync(filePath)) {
            try {
              const str = fs.readFileSync(filePath, 'utf8');
              if (str && str.trim()) {
                pageContent = str;
                break;
              }
            } catch (e) { }
          }
        }

        if (!pageContent) {
          pageContent = pageObj.html || pageObj.content || '';
        }

        return {
          ...pageObj,
          html: pageContent,
          content: pageContent
        };
      });
    } catch (readErr) {
      console.warn('[Page Editor Controller] Disk read error in getPageData:', readErr.message);
    }

    return res.status(200).json({
      success: true,
      flipbook: {
        v_id: doc.v_id,
        flipbookName: doc.flipbookName,
        folderName: doc.folderName,
        userEmail: doc.userEmail,
        fileSize: doc.fileSize || 0,
        totalPages: doc.pages?.length || 0,
        pages: populatedPages,
        assetCount,
        lastUpdated: doc.lastUpdated || doc.updatedAt
      }
    });
  } catch (error) {
    console.error('[Page Editor Controller] Error fetching page data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving page editor data',
      error: error.message
    });
  }
};

module.exports = {
  getServiceStatus,
  getPageData,
  resolveMapUrl,
  geocodeMapQuery,
  getMapTile,
  searchPixabay
};
