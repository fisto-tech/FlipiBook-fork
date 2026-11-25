/**
 * exportPageRenderer.js
 * Makes a page SVG fully self-contained so an export looks exactly like the page:
 *
 *  1. Animations are frozen at their "rest" frame (middle of the longest hold in their
 *     keyframes — the fully-shown state of titles/decorators — or the end state for
 *     one-way animations), instead of frame 0 where most titles are still hidden.
 *  2. Videos become a still frame; YouTube embeds become their thumbnail.
 *  3. Every image (<image>, <img>, CSS url(...)) is embedded as a data URL.
 *  4. Every font used on the page is embedded as base64 @font-face (local /lib/Fonts,
 *     app stylesheets and Google Fonts) — SVG rendered as an image cannot load fonts.
 *
 * Nothing about text, tables, effects or styling is rewritten: the browser renders the
 * same markup it renders in the editor.
 */

import axios from 'axios';

const GENERIC_FAMILIES = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif',
  'ui-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong', 'inherit', 'initial',
  'unset', '-apple-system', 'blinkmacsystemfont',
]);
const SYSTEM_FAMILIES = new Set([
  'arial', 'arial black', 'helvetica', 'helvetica neue', 'times new roman', 'times', 'georgia',
  'verdana', 'courier new', 'courier', 'tahoma', 'trebuchet ms', 'impact', 'segoe ui',
  'comic sans ms', 'lucida console', 'palatino', 'garamond',
]);

const dataUrlCache = new Map();   // url -> Promise<dataUrl|null>
const fontCssCache = new Map();   // family(lower) -> Promise<string>

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onloadend = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(blob);
});

const decodeEntities = (s) => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export const fetchAsDataUrl = (rawUrl) => {
  const url = decodeEntities(rawUrl).trim();
  if (!url || url.startsWith('data:') || url.startsWith('#') || url.startsWith('blob:')) return Promise.resolve(null);
  if (!dataUrlCache.has(url)) {
    dataUrlCache.set(url, (async () => {
      try {
        const res = await axios.get(url, { responseType: 'blob', withCredentials: url.startsWith(window.location.origin) || url.startsWith('/') });
        return await blobToDataUrl(res.data);
      } catch {
        try {
          const res = await fetch(url, { mode: 'cors' });
          if (!res.ok) return null;
          return await blobToDataUrl(await res.blob());
        } catch {
          return null;
        }
      }
    })());
  }
  return dataUrlCache.get(url);
};

/* ───────────────────────── 1. Freeze animations ───────────────────────── */

const parseKeyframes = (css) => {
  const map = new Map();
  const re = /@(?:-webkit-)?keyframes\s+([\w-]+)\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    // find the matching closing brace of the @keyframes block
    let depth = 1;
    let i = re.lastIndex;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    const body = css.slice(re.lastIndex, i - 1);
    const stops = [];
    const stopRe = /([^{}]+)\{([^{}]*)\}/g;
    let s;
    while ((s = stopRe.exec(body))) {
      const decl = s[2].replace(/\s+/g, ' ').trim();
      s[1].split(',').forEach((sel) => {
        const t = sel.trim().toLowerCase();
        const pct = t === 'from' ? 0 : t === 'to' ? 100 : parseFloat(t);
        if (!Number.isNaN(pct)) stops.push({ pct, decl });
      });
    }
    stops.sort((a, b) => a.pct - b.pct);
    map.set(m[1], stops);
  }
  return map;
};

// Fraction (0..1) of one cycle at which the animation shows its rest/visible state.
// Properties carry forward between keyframe stops, so compare the *effective* state at each stop.
const declMap = (decl) => {
  const m = {};
  decl.split(';').forEach((d) => {
    const i = d.indexOf(':');
    if (i > 0) m[d.slice(0, i).trim().toLowerCase()] = d.slice(i + 1).replace(/\s+/g, ' ').trim();
  });
  return m;
};
const restFraction = (stops) => {
  if (!stops || stops.length < 2) return 0.999;
  let state = {};
  const states = stops.map((st) => {
    state = { ...state, ...declMap(st.decl) };
    return { pct: st.pct, key: JSON.stringify(Object.keys(state).sort().map((k) => [k, state[k]])) };
  });
  let best = null;
  for (let i = 0; i < states.length - 1; i++) {
    let j = i;
    while (j + 1 < states.length && states[j + 1].key === states[i].key) j++;
    const len = states[j].pct - states[i].pct;
    if (len > 0 && (!best || len > best.len)) best = { len, mid: (states[i].pct + states[j].pct) / 2 };
    i = j;
  }
  if (best && best.len >= 5) return best.mid / 100;
  return 0.999; // one-way animation → its final state
};

const TIME_RE = /^-?[\d.]+m?s$/i;
const toMs = (t) => (/ms$/i.test(t) ? parseFloat(t) : parseFloat(t) * 1000);

const freezeDeclaration = (value, keyframes) => {
  // value is the animation shorthand (possibly comma-separated list)
  const parts = value.split(/,(?![^(]*\))/);
  const delays = parts.map((part) => {
    const tokens = part.trim().split(/\s+(?![^(]*\))/);
    const name = tokens.find((tk) => keyframes.has(tk));
    const times = tokens.filter((tk) => TIME_RE.test(tk));
    const duration = times.length ? toMs(times[0]) : 0;
    if (!name || !duration) return '0ms';
    return `${-Math.round(duration * restFraction(keyframes.get(name)))}ms`;
  });
  return `${value}; animation-delay: ${delays.join(', ')} !important; animation-play-state: paused !important`;
};

export const freezeAnimations = (svg) => {
  const styleBlocks = [...svg.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
  const keyframes = parseKeyframes(styleBlocks.join('\n'));
  if (keyframes.size === 0) return svg;

  const rewriteCss = (css) => css.replace(
    /(^|[;{\s])animation\s*:\s*([^;{}"]+?)\s*(!important)?\s*(?=;|}|"|$)/gi,
    (full, lead, value) => `${lead}animation: ${freezeDeclaration(value.trim(), keyframes)}`,
  );

  // <style> blocks
  let out = svg.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (m, open, css, close) => {
    // don't touch the @keyframes bodies themselves
    const parts = css.split(/(@(?:-webkit-)?keyframes\s+[\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\})/g);
    return open + parts.map((p) => (/^@(?:-webkit-)?keyframes/.test(p) ? p : rewriteCss(p))).join('') + close;
  });
  // inline style="... animation: ..."
  out = out.replace(/\sstyle\s*=\s*"([^"]*)"/gi, (m, css) => (/animation\s*:/i.test(css) ? ` style="${rewriteCss(css)}"` : m));
  return out;
};

/* ───────────────────────── 2. Media placeholders ───────────────────────── */

const captureVideoFrame = (src) => new Promise((resolve) => {
  try {
    const v = document.createElement('video');
    v.crossOrigin = 'anonymous';
    v.muted = true;
    v.preload = 'auto';
    v.src = decodeEntities(src);
    const done = (val) => { v.removeAttribute('src'); v.load(); resolve(val); };
    const timer = setTimeout(() => done(null), 8000);
    v.addEventListener('loadeddata', () => { try { v.currentTime = Math.min(0.5, (v.duration || 1) / 3); } catch { /* ignore */ } }, { once: true });
    v.addEventListener('seeked', () => {
      clearTimeout(timer);
      try {
        const c = document.createElement('canvas');
        c.width = v.videoWidth || 1280;
        c.height = v.videoHeight || 720;
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        done(c.toDataURL('image/jpeg', 0.92));
      } catch { done(null); }
    }, { once: true });
    v.addEventListener('error', () => { clearTimeout(timer); done(null); }, { once: true });
  } catch { resolve(null); }
});

const youtubeId = (url) => {
  const m = decodeEntities(url).match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  return m ? m[1] : null;
};

const stillImg = (src, fit = 'contain') =>
  `<img xmlns="http://www.w3.org/1999/xhtml" src="${src}" style="width:100%;height:100%;object-fit:${fit};display:block;" />`;

export const replaceMedia = async (svg) => {
  let out = svg;
  // <video ...>...</video> or <video .../>
  const videos = [...out.matchAll(/<video\b([^>]*?)(?:\/>|>[\s\S]*?<\/video>)/gi)];
  for (const m of videos) {
    const attrs = m[1];
    const poster = attrs.match(/\sposter\s*=\s*"([^"]+)"/i)?.[1];
    const src = attrs.match(/\ssrc\s*=\s*"([^"]+)"/i)?.[1] || m[0].match(/<source\b[^>]*\ssrc\s*=\s*"([^"]+)"/i)?.[1];
    const fit = attrs.match(/object-fit\s*:\s*([\w-]+)/i)?.[1] || 'contain';
    let frame = poster ? await fetchAsDataUrl(poster) : null;
    if (!frame && src) frame = await captureVideoFrame(src);
    if (frame) out = out.replace(m[0], stillImg(frame, fit));
  }
  // YouTube iframes → thumbnail
  const iframes = [...out.matchAll(/<iframe\b([^>]*?)(?:\/>|>[\s\S]*?<\/iframe>)/gi)];
  for (const m of iframes) {
    if (/fbe-map-iframe/.test(m[1])) continue;
    // plain src, or the user's embed code stored (escaped) inside srcdoc
    const id = youtubeId(decodeEntities(decodeEntities(m[0])));
    if (!id) continue;
    let thumb = null;
    for (const v of ['maxresdefault', 'sddefault', 'hqdefault']) {
      // eslint-disable-next-line no-await-in-loop
      const d = await fetchAsDataUrl(`https://i.ytimg.com/vi/${id}/${v}.jpg`);
      if (d && d.startsWith('data:image')) { thumb = d; break; }
    }
    if (!thumb) thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    const play = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48" style="position:absolute;left:50%;top:50%;width:68px;height:48px;transform:translate(-50%,-50%);"><path d="M66.5 7.7c-.8-2.9-3-5.2-6-6C55.3.3 34 .3 34 .3s-21.3 0-26.5 1.4c-3 .8-5.2 3.1-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3c.8 2.9 3 5.2 6 6C12.7 47.7 34 47.7 34 47.7s21.3 0 26.5-1.4c3-.8 5.2-3.1 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="#f00"/><path d="M45 24 27 14v20" fill="#fff"/></svg>';
    out = out.replace(m[0], `<div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:100%;height:100%;overflow:hidden;">${stillImg(thumb, 'cover').replace('xmlns="http://www.w3.org/1999/xhtml" ', '')}${play}</div>`);
  }
  return out;
};

/* ───────────────────────── 3. Inline images ───────────────────────── */

const INLINE_ATTR_TAGS = new Set(['image', 'img', 'feimage', 'source', 'use', 'video']);

export const inlineAllImages = async (svg, baseUrl = '') => {
  const resolve = (u) => {
    const url = decodeEntities(u).trim();
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('/')) return url;
    if (baseUrl && /^(\.\.\/|\.\/)?assets\//.test(url)) return baseUrl + url.replace(/^(\.\.\/|\.\/)/, '');
    return url;
  };
  const skip = (u) => !u || /^(data:|#|javascript:|mailto:|tel:|blob:)/i.test(u.trim());

  const jobs = new Map(); // original value -> resolved url
  // attribute references on image-like tags
  svg.replace(/\s(xlink:href|href|src|poster)\s*=\s*(["'])([^"']*)\2/gi, (m, attr, q, val, offset) => {
    if (skip(val)) return m;
    const tagStart = svg.lastIndexOf('<', offset);
    const tag = svg.slice(tagStart + 1, offset).trim().split(/\s/)[0].toLowerCase();
    if (INLINE_ATTR_TAGS.has(tag)) jobs.set(val, resolve(val));
    return m;
  });
  // CSS url(...) (style attributes and <style> blocks), excluding url(#id)
  svg.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, q, val) => {
    if (!skip(val)) jobs.set(val, resolve(val));
    return m;
  });
  if (jobs.size === 0) return svg;

  const results = await Promise.all([...jobs].map(async ([orig, url]) => [orig, await fetchAsDataUrl(url)]));
  let out = svg;
  results.forEach(([orig, data]) => {
    // Only embed real media — a missing file can come back as the app's HTML page,
    // and embedding that breaks the whole SVG image.
    if (data && !/^data:(text\/html|application\/json)/i.test(data)) out = out.split(orig).join(data);
  });
  return out;
};

/* ───────────────────────── 4. Embed fonts ───────────────────────── */

export const collectFontFamilies = (svg) => {
  const families = new Set();
  const add = (list) => decodeEntities(list).split(',').forEach((f) => {
    const name = f.replace(/!important/i, '').replace(/["']/g, '').trim();
    if (name && !GENERIC_FAMILIES.has(name.toLowerCase())) families.add(name);
  });
  for (const m of svg.matchAll(/font-family\s*:\s*([^;"}<]+)/gi)) add(m[1]);
  for (const m of svg.matchAll(/font-family\s*=\s*"([^"]+)"/gi)) add(m[1]);
  for (const m of svg.matchAll(/font-family\s*=\s*'([^']+)'/gi)) add(m[1]);
  return [...families];
};

// @font-face rules for a family from the app's same-origin stylesheets (index.css, injected font styles)
const localFontFaces = (family) => {
  const want = family.toLowerCase();
  const faces = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; } // cross-origin sheet
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      if (rule.constructor?.name !== 'CSSFontFaceRule' && rule.type !== 5) continue;
      const fam = rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim().toLowerCase();
      if (fam !== want) continue;
      const src = rule.style.getPropertyValue('src');
      const urlMatch = src.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
      if (!urlMatch) continue;
      const base = sheet.href || document.baseURI;
      faces.push({
        url: new URL(urlMatch[1], base).href,
        weight: rule.style.getPropertyValue('font-weight') || 'normal',
        style: rule.style.getPropertyValue('font-style') || 'normal',
        unicodeRange: rule.style.getPropertyValue('unicode-range') || '',
        format: /format\(\s*["']?([\w-]+)/i.exec(src)?.[1] || '',
      });
    }
  }
  return faces;
};

// Google Fonts (v1 CSS API tolerates weights a family doesn't have); latin subsets only
const googleFontFaces = async (family) => {
  const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const spec = [...weights.map(String), ...weights.map((w) => `${w}italic`)].join(',');
  try {
    const res = await fetch(`https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:${spec}&display=swap`);
    if (!res.ok) return [];
    const css = await res.text();
    const faces = [];
    const blockRe = /(?:\/\*\s*([\w-]+)\s*\*\/\s*)?@font-face\s*\{([^}]*)\}/g;
    let m;
    while ((m = blockRe.exec(css))) {
      const subset = (m[1] || 'latin').toLowerCase();
      if (subset !== 'latin' && subset !== 'latin-ext') continue;
      const body = m[2];
      const url = body.match(/url\(([^)]+)\)/)?.[1]?.replace(/["']/g, '');
      if (!url) continue;
      faces.push({
        url,
        weight: body.match(/font-weight:\s*([^;]+)/)?.[1]?.trim() || 'normal',
        style: body.match(/font-style:\s*([^;]+)/)?.[1]?.trim() || 'normal',
        unicodeRange: body.match(/unicode-range:\s*([^;]+)/)?.[1]?.trim() || '',
        format: body.match(/format\(['"]?([\w-]+)/)?.[1] || 'woff2',
      });
    }
    return faces;
  } catch {
    return [];
  }
};

const familyFontCss = (family) => {
  const key = family.toLowerCase();
  if (!fontCssCache.has(key)) {
    fontCssCache.set(key, (async () => {
      let faces = localFontFaces(family);
      if (faces.length === 0 && !SYSTEM_FAMILIES.has(key)) faces = await googleFontFaces(family);
      const rules = await Promise.all(faces.map(async (f) => {
        const data = await fetchAsDataUrl(f.url);
        if (!data) return '';
        return `@font-face{font-family:'${family}';src:url(${data})${f.format ? ` format('${f.format}')` : ''};font-weight:${f.weight};font-style:${f.style};${f.unicodeRange ? `unicode-range:${f.unicodeRange};` : ''}}`;
      }));
      return rules.filter(Boolean).join('\n');
    })());
  }
  return fontCssCache.get(key);
};

export const embedFonts = async (svg) => {
  // Font <style> blocks that point at external files are useless inside an image — drop them
  let out = svg.replace(/<style\b[^>]*id="(?:global-fonts-style|custom-fonts-style)"[^>]*>[\s\S]*?<\/style>/gi, '');
  const families = collectFontFamilies(out);
  if (families.length === 0) return out;
  const css = (await Promise.all(families.map(familyFontCss))).filter(Boolean).join('\n');
  if (!css) return out;
  const styleTag = `<style data-export-fonts="true"><![CDATA[\n${css}\n]]></style>`;
  // place at the start of the root svg so every element sees it
  out = out.replace(/(<svg\b[^>]*>)/i, `$1${styleTag}`);
  return out;
};

/* ─────────────── 5. SVG filters on HTML text (inner / drop shadow) ─────────────── */

// Effects on text boxes are a CSS `filter: url(#id)` on the HTML div inside the foreignObject.
// Inside an SVG rendered as an image that reference is ignored, but the same filter works as an
// SVG attribute on the <foreignObject> itself — move it there.
export const hoistTextFilters = (svg) => svg.replace(
  /<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi,
  (fo) => {
    const m = fo.match(/^(<foreignObject\b[^>]*>\s*<div\b[^>]*?\sstyle\s*=\s*")([^"]*?)filter\s*:\s*url\(\s*(?:&quot;|["'])?#([^"')&]+)(?:&quot;|["'])?\s*\)\s*(?:!important)?\s*;?/i);
    if (!m) return fo;
    const id = m[3];
    const cleaned = fo.replace(m[0], `${m[1]}${m[2]}`);
    // A wrapping group sees the text's full painted area (incl. overflow past the box)
    return `<g filter="url(#${id})">${cleaned}</g>`;
  },
);

/* ─────────────── 6. App stylesheet rules used by the page (slideshow, tables…) ─────────────── */

// The page relies on app CSS classes (Swiper slideshow layout, arrows, dots, overlays…).
// An SVG rendered as an image has no access to the app's stylesheets, so copy every rule
// that targets a class used on the page.
export const collectPageCss = (svg) => {
  const classes = new Set();
  for (const m of svg.matchAll(/\sclass\s*=\s*"([^"]+)"/gi)) m[1].split(/\s+/).forEach((c) => c && classes.add(c));
  if (classes.size === 0) return '';
  const selectorUsesPageClass = (sel) => {
    const found = [...sel.matchAll(/\.((?:\\.|[\w-])+)/g)].map((x) => x[1].replace(/\\/g, ''));
    return found.some((c) => classes.has(c));
  };
  const out = [];
  // Recursive: Tailwind v4 keeps utilities inside @layer blocks, theme tokens on :root/:host,
  // and typed custom properties in @property rules — all are needed for the layout to resolve.
  const walk = (rules, sink) => {
    for (const rule of Array.from(rules || [])) {
      const type = rule.constructor?.name || '';
      if (rule.selectorText !== undefined) {
        const sel = rule.selectorText;
        if (selectorUsesPageClass(sel) || /(^|,)\s*(:root|:host|\*|::before|::after|::backdrop)/.test(sel)) sink.push(rule.cssText);
      } else if (type === 'CSSPropertyRule' || /^@property/.test(rule.cssText || '')) {
        sink.push(rule.cssText);
      } else if (rule.cssRules) {
        const inner = [];
        walk(rule.cssRules, inner);
        if (!inner.length) continue;
        if (rule.media) sink.push(`@media ${rule.media.mediaText}{${inner.join('\n')}}`);
        else if (type === 'CSSSupportsRule' && rule.conditionText) sink.push(`@supports ${rule.conditionText}{${inner.join('\n')}}`);
        else sink.push(inner.join('\n')); // @layer etc. — inline in order
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    walk(rules, out);
  }
  return out.join('\n');
};

/* ─────────────── 7. Maps → still map image ─────────────── */

const geocodeCache = new Map();
const userBias = () => {
  try {
    const raw = localStorage.getItem('fbe_map_default_location_v1');
    const v = raw ? JSON.parse(raw) : null;
    const lat = parseFloat(v?.lat ?? v?.coords?.[0]);
    const lon = parseFloat(v?.lon ?? v?.lng ?? v?.coords?.[1]);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
  } catch { return null; }
};
const geocode = (query) => {
  const q = String(query || '').trim();
  if (!q) return Promise.resolve(null);
  const ll = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (ll) return Promise.resolve({ lat: parseFloat(ll[1]), lng: parseFloat(ll[2]) });
  if (!geocodeCache.has(q)) {
    const bias = userBias();
    // Regional bias (not street-level) so "Salem" resolves to the nearby city, not a road named after it
    const photon = `https://photon.komoot.io/api/?limit=6&q=${encodeURIComponent(q)}${bias ? `&lat=${bias.lat}&lon=${bias.lon}&zoom=8&location_bias_scale=0.5` : ''}`;
    geocodeCache.set(q, fetch(photon)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const feats = j?.features || [];
        // prefer real places (city / town / region / landmark) over roads with the same name
        const rank = (f) => {
          const p = f?.properties || {};
          if (p.osm_key === 'place' && ['city', 'town', 'village', 'suburb', 'neighbourhood', 'hamlet', 'locality'].includes(p.osm_value)) return 0;
          if (['amenity', 'tourism', 'building', 'shop', 'leisure', 'historic', 'office'].includes(p.osm_key)) return 1;
          if (p.osm_key === 'place') return 2;
          if (p.osm_key === 'boundary') return 3; // district/region centroids can be in open country
          return 4;
        };
        // first result of the best rank (results are already ordered by relevance/proximity)
        const best = feats.reduce((acc, f) => (!acc || rank(f) < rank(acc) ? f : acc), null);
        const c = best?.geometry?.coordinates;
        if (c) return { lat: c[1], lng: c[0] };
        return fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((arr) => (arr?.[0] ? { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) } : null));
      })
      .catch(() => null));
  }
  return geocodeCache.get(q);
};

// Google's own placement of a query (camera centre + place pin), read by our backend from the
// Google Maps embed — so the map lands exactly where the editor's Google map was.
const googleGeoCache = new Map();
const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || '';
export const googleGeocode = (query, zoom = 14) => {
  const q = String(query || '').trim();
  if (!q) return Promise.resolve(null);
  const key = `${q}|${zoom}`;
  if (!googleGeoCache.has(key)) {
    googleGeoCache.set(key, fetch(`${BACKEND_URL}/api/page-editor/map-geocode?q=${encodeURIComponent(q)}&z=${zoom}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j?.success && j.center ? {
        center: j.center, marker: j.marker || j.center, showPin: Boolean(j.showPin), zoom: Number(j.zoom) || zoom,
      } : null))
      .catch(() => null));
  }
  return googleGeoCache.get(key);
};

// Google tiles via our backend (same imagery/labels as the editor's Google map)
const GOOGLE_LYRS = { m: 'm', k: 'y', h: 'y', p: 'p' };
const googleTileUrl = (mapType, z, x, y) => {
  const hl = (navigator.language || 'en').split('-')[0] || 'en';
  return `${BACKEND_URL}/api/page-editor/map-tile?lyrs=${GOOGLE_LYRS[mapType] || 'm'}&z=${z}&x=${x}&y=${y}&hl=${hl}&scale=2`;
};

// Tile sources matching the editor's Google map types
const MAP_TILE_LAYERS = {
  m: { layers: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'], credit: '© Esri' },
  k: { layers: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], credit: 'Imagery © Esri' },
  h: {
    layers: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    ],
    credit: 'Imagery © Esri',
  },
  p: { layers: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'], credit: '© Esri' },
};

const loadTile = (src) => new Promise((resolve) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = src;
});

const staticMapCache = new Map();
const GOOGLE_STATIC_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_STATIC_KEY) || '';

const drawPin = (ctx, px, py, r) => {
  ctx.fillStyle = '#EA4335';
  ctx.strokeStyle = '#B31412';
  ctx.lineWidth = r * 0.14;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.bezierCurveTo(px - r * 0.2, py - r * 1.1, px - r, py - r * 1.4, px - r, py - r * 2.1);
  ctx.arc(px, py - r * 2.1, r, Math.PI, 0);
  ctx.bezierCurveTo(px + r, py - r * 1.4, px + r * 0.2, py - r * 1.1, px, py);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#7A0C0B';
  ctx.beginPath();
  ctx.arc(px, py - r * 2.1, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * Still image of a map. Uses the saved coordinates (else geocodes the location, biased to the
 * user's area) and the same map type as the editor (roadmap / satellite / hybrid / terrain).
 * With VITE_GOOGLE_MAPS_STATIC_KEY set, uses Google's own static map for an identical look.
 */
export const renderStaticMap = ({ location, coords, zoom = 14, mapType = 'm', cssW, cssH }) => {
  const key = `${coords || location}|${zoom}|${mapType}|${cssW}x${cssH}`;
  if (!staticMapCache.has(key)) {
    staticMapCache.set(key, (async () => {
      const scale = 2;
      const W = Math.round(cssW * scale);
      const H = Math.round(cssH * scale);
      let pos = null;
      if (coords) {
        const [la, ln] = String(coords).split(',').map(parseFloat);
        if (Number.isFinite(la) && Number.isFinite(ln)) pos = { lat: la, lng: ln };
      }

      if (GOOGLE_STATIC_KEY) {
        const typeName = { m: 'roadmap', k: 'satellite', h: 'hybrid', p: 'terrain' }[mapType] || 'roadmap';
        const center = pos ? `${pos.lat},${pos.lng}` : location;
        const gW = Math.min(640, Math.round(cssW));
        const gH = Math.min(640, Math.round(cssH));
        const url = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(center)}&zoom=${Math.round(zoom)}&size=${gW}x${gH}&scale=2&maptype=${typeName}&markers=color:red%7C${encodeURIComponent(center)}&key=${GOOGLE_STATIC_KEY}`;
        const data = await fetchAsDataUrl(url);
        if (data && data.startsWith('data:image')) return data;
      }

      // Google's own placement for the same query/zoom the editor's embed uses
      let marker = pos;
      let showPin = Boolean(pos);
      let zEff = zoom;
      if (!pos) {
        const g = await googleGeocode(location, Math.round(zoom));
        if (g) {
          // The embed centres on the place itself (the camera value is offset for an info card)
          pos = g.marker ? { lat: g.marker.lat, lng: g.marker.lng } : { lat: g.center.lat, lng: g.center.lng };
          marker = g.marker;
          showPin = g.showPin;
          zEff = g.zoom;
        }
      }
      if (!pos) { pos = await geocode(location); marker = pos; showPin = true; }
      if (!pos) return null;

      // Google high-DPI tiles (512 px, scale=2) at the same zoom as the embed — same label size,
      // 2× sharpness; the canvas is 2× the map's CSS size.
      const zFrac = Math.max(1, Math.min(21, zEff));
      const zi = Math.max(1, Math.min(21, Math.round(zFrac)));
      const tile = 512 * 2 ** (zFrac - zi); // tile edge in canvas px
      const n = 2 ** zi;
      const world = tile * n;
      const toWorld = (p) => {
        const sl = Math.sin((p.lat * Math.PI) / 180);
        return [((p.lng + 180) / 360) * world, (0.5 - Math.log((1 + sl) / (1 - sl)) / (4 * Math.PI)) * world];
      };
      const [cx, cy] = toWorld(pos);
      const x0 = cx - W / 2;
      const y0 = cy - H / 2;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#e5e3df';
      ctx.fillRect(0, 0, W, H);
      ctx.imageSmoothingQuality = 'high';
      const jobs = [];
      for (let tx = Math.floor(x0 / tile); tx <= Math.floor((x0 + W) / tile); tx++) {
        for (let ty = Math.floor(y0 / tile); ty <= Math.floor((y0 + H) / tile); ty++) {
          if (ty < 0 || ty >= n) continue;
          const wrapX = ((tx % n) + n) % n;
          jobs.push(loadTile(googleTileUrl(mapType, zi, wrapX, ty)).then((img) => {
            if (img) ctx.drawImage(img, tx * tile - x0, ty * tile - y0, tile + 0.5, tile + 0.5);
          }));
        }
      }
      await Promise.all(jobs);

      // Red pin only where Google shows one (a specific place, not a city/area)
      if (showPin && marker) {
        const [mx, my] = toWorld(marker);
        drawPin(ctx, mx - x0, my - y0, 11 * scale);
      }
      // Google wordmark bottom-left, like the embed
      ctx.font = `bold ${11 * scale}px Arial, sans-serif`;
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.strokeText('Google', 8 * scale, H - 8 * scale);
      ctx.fillStyle = '#5f6368';
      ctx.fillText('Google', 8 * scale, H - 8 * scale);
      try { return canvas.toDataURL('image/jpeg', 0.9); } catch { return null; }
    })().catch(() => null));
  }
  return staticMapCache.get(key);
};

export const replaceMaps = async (svg) => {
  let out = svg;
  const mapIframeRe = /<iframe\b[^>]*class="[^"]*fbe-map-iframe[^"]*"[^>]*?(?:\/>|>[\s\S]*?<\/iframe>)/i;
  let searchFrom = 0;
  for (;;) {
    const rest = out.slice(searchFrom);
    const found = rest.match(mapIframeRe);
    if (!found) break;
    const m = { 0: found[0], index: searchFrom + found.index };
    searchFrom = m.index + found[0].length;
    const tag = m[0];
    const src = decodeEntities(tag.match(/\ssrc\s*=\s*"([^"]+)"/i)?.[1] || '');
    let q = '';
    let zoom = 14;
    try {
      const u = new URL(src);
      q = u.searchParams.get('q') || u.searchParams.get('query') || u.searchParams.get('daddr') || '';
      zoom = parseFloat(u.searchParams.get('z')) || 14;
    } catch { /* ignore */ }
    if (!q) continue;
    const before = out.slice(0, m.index);
    // the enclosing map group carries the exact picked coordinates and the map type
    const groupTag = before.slice(before.lastIndexOf('data-type="map"') >= 0 ? before.lastIndexOf('<g', before.lastIndexOf('data-type="map"')) : 0).match(/^<g\b[^>]*>/)?.[0] || '';
    // Use exactly what the Google map shows (its query), not separately picked coordinates
    const coords = /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(q) ? q : '';
    let mapType = groupTag.match(/\sdata-map-type="([^"]+)"/)?.[1] || '';
    try { mapType = mapType || new URL(src).searchParams.get('t') || 'm'; } catch { mapType = mapType || 'm'; }
    // the iframe fills its .map-stage — use that stage's css size for the map image
    const stageStyle = before.slice(before.lastIndexOf('map-stage')).match(/style="([^"]*)"/)?.[1] || '';
    const cssW = parseFloat(stageStyle.match(/width:\s*([\d.]+)px/)?.[1]) || 360;
    const cssH = parseFloat(stageStyle.match(/height:\s*([\d.]+)px/)?.[1]) || 240;
    const dataUrl = await renderStaticMap({ location: q, coords, zoom, mapType, cssW, cssH });
    if (!dataUrl) continue;
    const filter = tag.match(/filter:\s*([^;"]+)/i)?.[1];
    const img = `<img xmlns="http://www.w3.org/1999/xhtml" src="${dataUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;margin:0;padding:0;${filter ? `filter:${filter};` : ''}" />`;
    out = out.slice(0, m.index) + img + out.slice(m.index + tag.length);
    searchFrom = m.index + img.length;
  }
  return out;
};

/* ─────────────── 8. Non-scaling strokes → real page-unit strokes ─────────────── */

// Shapes use `vector-effect: non-scaling-stroke`, so their stroke width is in *screen* pixels.
// The editor shows a page at 100% zoom as `min(55vw, 72vh × aspect)` CSS px wide; an export at
// 2048 px would draw the same 2 px stroke → visibly thinner. Convert each such stroke into its
// own local units at the 100%-zoom scale (measured from the element's real transform), so the
// stroke keeps the same thickness relative to the page at any export size.
export const bakeNonScalingStrokes = (svg) => {
  if (!/non-scaling-stroke/i.test(svg)) return svg;
  const vb = svg.match(/viewBox\s*=\s*["']([^"']+)["']/i)?.[1]?.trim().split(/[\s,]+/).map(parseFloat);
  if (!vb || vb.length < 4 || !(vb[2] > 0) || !(vb[3] > 0)) return svg;
  const aspect = vb[2] / vb[3];
  const refW = Math.min(window.innerWidth * 0.55, window.innerHeight * 0.72 * aspect);
  const refH = refW / aspect;

  let doc;
  try {
    doc = new DOMParser().parseFromString(svg.replace(/&nbsp;/gi, '&#160;'), 'image/svg+xml');
    if (doc.querySelector('parsererror')) return svg;
  } catch { return svg; }
  const root = doc.documentElement;
  const origW = root.getAttribute('width');
  const origH = root.getAttribute('height');

  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-100000px;top:0;width:${refW}px;height:${refH}px;visibility:hidden;pointer-events:none;`;
  const live = document.importNode(root, true);
  live.setAttribute('width', String(refW));
  live.setAttribute('height', String(refH));
  host.appendChild(live);
  document.body.appendChild(host);
  try {
    const rootCtm = live.getScreenCTM();
    const liveEls = Array.from(live.querySelectorAll('*'));
    const srcEls = Array.from(root.querySelectorAll('*'));
    liveEls.forEach((el, i) => {
      const src = srcEls[i];
      if (!src || typeof el.getScreenCTM !== 'function') return;
      const attrVE = el.getAttribute('vector-effect');
      const styleVE = el.style?.getPropertyValue?.('vector-effect');
      if (!/non-scaling-stroke/i.test(`${attrVE || ''} ${styleVE || ''}`)) return;
      const ctm = el.getScreenCTM();
      if (!ctm || !rootCtm) return;
      // css px per local unit for this element (independent of where the host sits)
      const scale = Math.sqrt(Math.abs(ctm.a * ctm.d - ctm.b * ctm.c));
      if (!(scale > 0)) return;
      const cs = window.getComputedStyle(el);
      const sw = parseFloat(cs.strokeWidth);
      if (!(sw > 0)) {
        src.removeAttribute('vector-effect');
        src.style?.removeProperty?.('vector-effect');
        return;
      }
      src.setAttribute('stroke-width', String(+(sw / scale).toFixed(4)));
      src.style?.removeProperty?.('stroke-width');
      src.removeAttribute('vector-effect');
      src.style?.removeProperty?.('vector-effect');
      const dash = cs.strokeDasharray;
      if (dash && dash !== 'none') {
        src.setAttribute('stroke-dasharray', dash.split(/[\s,]+/).map((d) => +(parseFloat(d) / scale).toFixed(4)).join(' '));
        src.style?.removeProperty?.('stroke-dasharray');
      }
    });
  } finally {
    document.body.removeChild(host);
  }
  if (origW !== null) root.setAttribute('width', origW);
  if (origH !== null) root.setAttribute('height', origH);
  return new XMLSerializer().serializeToString(root);
};

/* ───────────────────────── Pipeline ───────────────────────── */

/** Returns a self-contained SVG string that renders exactly like the page, frozen. */
export const prepareExportSvg = async (svg, { baseUrl = '' } = {}) => {
  let out = bakeNonScalingStrokes(svg);
  out = freezeAnimations(out);
  out = hoistTextFilters(out);
  out = await replaceMaps(out);
  out = await replaceMedia(out);
  // App CSS for classes used on the page (slideshow layout, arrows, dots, overlays…)
  // Hide interactive chrome that isn't page content (embed "Open website" / "Full screen" buttons)
  out = out.replace(/<div\b[^>]*class="[^"]*embed-overlay-wrapper[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  out = out.replace(/(<svg\b[^>]*>)/i, '$1<style data-export-hide-ui="true">.embed-overlay-wrapper,.embed-open-btn,.embed-fullscreen-btn,[data-embed-action]{display:none!important}</style>');
  const pageCss = collectPageCss(out);
  if (pageCss) out = out.replace(/(<svg\b[^>]*>)/i, `$1<style data-export-app-css="true"><![CDATA[\n${pageCss.replace(/\]\]>/g, '')}\n]]></style>`);
  out = await inlineAllImages(out, baseUrl);
  out = await embedFonts(out);
  return out;
};
