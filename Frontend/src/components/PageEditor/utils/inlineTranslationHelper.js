import { loadGoogleFont } from '../properties/TextProperties';
import editCacheManager from './EditCacheManager';

export const TRANSLATE_LANGUAGES = [
  { code: 'tam_Taml', name: 'Tamil', native: 'தமிழ்' },
  { code: 'hin_Deva', name: 'Hindi', native: 'हिन्दी' },
  { code: 'tel_Telu', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mal_Mlym', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'kan_Knda', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ben_Beng', name: 'Bengali', native: 'বাংলা' },
  { code: 'mar_Deva', name: 'Marathi', native: 'मराठी' },
  { code: 'guj_Gujr', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pan_Guru', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ory_Orya', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'urd_Arab', name: 'Urdu', native: 'اردو' }
];

export const FONT_FOR_LANGUAGE = {
  'tam_Taml': 'Noto Sans Tamil',
  'hin_Deva': 'Noto Sans Devanagari',
  'mar_Deva': 'Noto Sans Devanagari',
  'san_Deva': 'Noto Sans Devanagari',
  'tel_Telu': 'Noto Sans Telugu',
  'kan_Knda': 'Noto Sans Kannada',
  'mal_Mlym': 'Noto Sans Malayalam',
  'ben_Beng': 'Noto Sans Bengali',
  'guj_Gujr': 'Noto Sans Gujarati',
  'pan_Guru': 'Noto Sans Gurmukhi',
  'ory_Orya': 'Noto Sans Oriya',
  'urd_Arab': 'Noto Naskh Arabic'
};

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('flipibook-inline-translate-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'flipibook-inline-translate-style';
    styleEl.textContent = `
      @keyframes spinTranslateBadge {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes fadeInTranslateBadge {
        from { opacity: 0; transform: translate(-50%, 6px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      .inline-translating-pulse {
        opacity: 0.45 !important;
        filter: blur(0.4px) !important;
        background: rgba(107, 114, 128, 0.16) !important;
        border-radius: 4px !important;
        outline: 1.5px dashed rgba(107, 114, 128, 0.6) !important;
        transition: all 0.2s ease !important;
        user-select: none !important;
        pointer-events: none !important;
      }
      .translating-element-pulse {
        opacity: 0.45 !important;
        filter: blur(0.4px) !important;
        pointer-events: none !important;
        user-select: none !important;
        transition: opacity 0.2s ease !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

function showSpinnerBadge(targetRect, langName) {
  if (typeof document === 'undefined') return null;
  ensureStyles();

  // Remove any lingering spinner badge
  const existing = document.getElementById('inline-translate-spinner-badge');
  if (existing) existing.remove();

  const badge = document.createElement('div');
  badge.id = 'inline-translate-spinner-badge';
  badge.style.position = 'fixed';
  badge.style.left = `${Math.max(60, targetRect.left + (targetRect.width / 2))}px`;
  badge.style.top = `${Math.max(50, targetRect.top - 42)}px`;
  badge.style.transform = 'translate(-50%, 0)';
  badge.style.zIndex = '999999';
  badge.style.pointerEvents = 'none';

  badge.innerHTML = `
    <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(17, 24, 39, 0.95); color:#ffffff; padding:6px 14px; border-radius:20px; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:12px; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.18); backdrop-filter:blur(8px); animation:fadeInTranslateBadge 0.2s ease-out; white-space:nowrap;">
      <svg style="animation:spinTranslateBadge 0.75s linear infinite; width:14px; height:14px; flex-shrink:0;" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-linecap="round" stroke-opacity="0.3"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"></path>
      </svg>
      <span>Translating to ${langName}...</span>
    </div>
  `;

  document.body.appendChild(badge);
  return badge;
}

function showNoticeBadge(targetRect, message) {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('inline-translate-spinner-badge');
  if (existing) existing.remove();

  const rect = targetRect && (targetRect.width > 0 || targetRect.height > 0)
    ? targetRect
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };

  const badge = document.createElement('div');
  badge.id = 'inline-translate-spinner-badge';
  badge.style.position = 'fixed';
  badge.style.left = `${Math.max(80, rect.left + (rect.width / 2))}px`;
  badge.style.top = `${Math.max(50, rect.top - 42)}px`;
  badge.style.transform = 'translate(-50%, 0)';
  badge.style.zIndex = '999999';
  badge.style.pointerEvents = 'none';
  badge.innerHTML = `
    <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(153, 27, 27, 0.95); color:#ffffff; padding:6px 14px; border-radius:20px; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:12px; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.2); white-space:nowrap;">
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(badge);
  setTimeout(() => {
    if (badge.parentNode) badge.remove();
  }, 3000);
}

/**
 * Checks whether selected text appears to be non-English Indic script without English words.
 */
function isNonEnglishIndicText(text) {
  if (!text) return false;
  const hasIndic = /[\u0900-\u0D7F]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);
  return hasIndic && !hasLatin;
}

/**
 * Translates either the currently highlighted text range or the specified layer element.
 */
export async function executeInlineTranslation({
  targetLang = 'tam_Taml',
  layerId = null,
  activePageIndex = 0,
  saveModifiedPageHtml = null,
  onStart = null,
  onComplete = null,
  onError = null
}) {
  ensureStyles();
  const langObj = TRANSLATE_LANGUAGES.find(l => l.code === targetLang) || TRANSLATE_LANGUAGES[0];
  const langName = `${langObj.name} (${langObj.native})`;

  let textToTranslate = '';
  let rangeToReplace = null;
  let targetContainer = null;
  let targetElement = null;
  let translatingWrapper = null;
  let spinnerBadge = null;

  try {
    // 1. Check if user actively highlighted a range with mouse
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const r = sel.getRangeAt(0);
      const str = r.toString().trim();
      if (str.length > 0) {
        textToTranslate = str;
        rangeToReplace = r;
        targetContainer = r.commonAncestorContainer.nodeType === 1 
          ? r.commonAncestorContainer 
          : r.commonAncestorContainer.parentElement;
      }
    }

    // 2. If no active DOM range, check window.__lastTextSelection (recent within 2 minutes)
    if (!textToTranslate && window.__lastTextSelection && window.__lastTextSelection.text) {
      const saved = window.__lastTextSelection;
      const targetEl = document.getElementById(saved.elementId);
      if (targetEl) {
        const editableDiv = targetEl.querySelector('[contenteditable="true"]') || targetEl.querySelector('div') || targetEl;
        textToTranslate = saved.text.trim();
        targetContainer = editableDiv;
        targetElement = targetEl;
      }
    }

    // 3. If still no range text, check if a layer is selected and translate its text
    if (!textToTranslate) {
      const effectiveId = layerId || (typeof window !== 'undefined' && window.__selectedLayerId);
      if (effectiveId) {
        const el = document.getElementById(effectiveId);
        if (el) {
          targetElement = el;
          const textDiv = el.querySelector('div') || el;
          const str = (textDiv.innerText || el.textContent || '').trim();
          if (str.length > 0) {
            textToTranslate = str;
            targetContainer = textDiv;
          }
        }
      }
    }

    if (!textToTranslate) {
      const msg = 'Please select a word, sentence, or text layer to translate.';
      showNoticeBadge(null, msg);
      if (onError) onError(msg);
      return false;
    }

    if (isNonEnglishIndicText(textToTranslate)) {
      const rect = rangeToReplace ? rangeToReplace.getBoundingClientRect() : targetContainer?.getBoundingClientRect();
      const msg = 'Only English to Indian language translation is enabled. Please select English text.';
      showNoticeBadge(rect, msg);
      if (onError) onError(msg);
      return false;
    }

    if (onStart) onStart();

    // 4. Apply the visual "disable feel" and show the spinner
    let rect = null;
    if (rangeToReplace) {
      rect = rangeToReplace.getBoundingClientRect();
      // Wrap range with temporary pulse span
      const wrapper = document.createElement('span');
      wrapper.className = 'inline-translating-pulse';
      try {
        rangeToReplace.surroundContents(wrapper);
        translatingWrapper = wrapper;
      } catch (e) {
        // Fallback for complex ranges: extract and append
        const fragment = rangeToReplace.extractContents();
        wrapper.appendChild(fragment);
        rangeToReplace.insertNode(wrapper);
        translatingWrapper = wrapper;
      }
    } else if (targetContainer) {
      rect = targetContainer.getBoundingClientRect();
      targetContainer.classList.add('translating-element-pulse');
    }

    if (!rect || (rect.width === 0 && rect.height === 0)) {
      rect = { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    }

    spinnerBadge = showSpinnerBadge(rect, langName);

    // 5. Call Backend Translation API
    const res = await fetch('/api/myflipibook/translate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: textToTranslate,
        src_lang: 'eng_Latn',
        tgt_lang: targetLang
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !data.translatedText) {
      throw new Error(data.message || 'Translation service did not return translated text');
    }

    const translatedText = data.translatedText;

    // 6. Ensure Google Font for target Indic script is loaded
    const fontName = FONT_FOR_LANGUAGE[targetLang];
    if (fontName) {
      loadGoogleFont(fontName);
    }

    const appendIndicFallback = (el) => {
      if (!el || !fontName) return;
      const computed = window.getComputedStyle(el).fontFamily || '';
      const existing = el.style.fontFamily || computed;
      if (existing && !existing.toLowerCase().includes(fontName.toLowerCase())) {
        const generic = new Set(['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui']);
        const parts = existing.split(',').map((p) => p.trim()).filter(Boolean);
        const idx = parts.findIndex((p) => generic.has(p.replace(/['"]/g, '').toLowerCase()));
        if (idx >= 0) {
          parts.splice(idx, 0, `'${fontName}'`);
        } else {
          parts.push(`'${fontName}'`, 'sans-serif');
        }
        el.style.fontFamily = parts.join(', ');
      } else if (!existing) {
        el.style.fontFamily = `'${fontName}', sans-serif`;
      }
    };

    // Helper to replace text inside nested styled leaves without stripping bold/italic/color markup
    const replaceTextPreservingLeafStyle = (rootEl, newText) => {
      if (!rootEl) return;
      const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) {
        if (n.nodeValue && n.nodeValue.trim()) {
          textNodes.push(n);
        }
      }
      if (textNodes.length > 0) {
        textNodes[0].nodeValue = newText;
        for (let i = 1; i < textNodes.length; i++) {
          textNodes[i].nodeValue = '';
        }
        const hostEl = textNodes[0].parentElement || rootEl;
        appendIndicFallback(hostEl);
      } else {
        rootEl.textContent = newText;
      }
      appendIndicFallback(rootEl);
      if (rootEl.style) {
        rootEl.style.whiteSpace = 'pre-wrap';
        rootEl.style.overflowWrap = 'break-word';
      }
    };

    // 7. In-place replace translated text (preserving existing font, weight/bold, color, and box bounds)
    if (translatingWrapper) {
      const translatedSpan = document.createElement('span');
      translatedSpan.textContent = translatedText;
      const parentEl = translatingWrapper.parentElement;
      if (parentEl && fontName) {
        const parentFF = window.getComputedStyle(parentEl).fontFamily;
        if (parentFF) {
          translatedSpan.style.fontFamily = parentFF;
        }
        appendIndicFallback(translatedSpan);
      } else if (fontName) {
        translatedSpan.style.fontFamily = `'${fontName}', sans-serif`;
      }
      translatingWrapper.replaceWith(translatedSpan);
    } else if (targetContainer) {
      replaceTextPreservingLeafStyle(targetContainer, translatedText);
      targetContainer.classList.remove('translating-element-pulse');
    }

    // 8. Re-measure text bounding box & trigger autosave
    const foEl = targetContainer?.closest('foreignObject') || targetElement?.closest('foreignObject');
    if (foEl) {
      // Trigger input event to recompute dimensions
      const div = foEl.querySelector('div') || foEl;
      div.dispatchEvent(new Event('input', { bubbles: true }));
      editCacheManager.scheduleInputMeasurement((el, highlightType) => {
        window.dispatchEvent(new CustomEvent('redraw-selection-highlight', { detail: { element: el, type: highlightType } }));
      });
    }

    // Find the enclosing SVG to persist changes
    const svgRoot = (targetContainer || targetElement)?.closest('svg') || document.querySelector('.page-svg-container svg');
    const container = (targetContainer || targetElement)?.closest('.page-svg-container');
    const pageIdx = container ? parseInt(container.getAttribute('data-page-index')) : activePageIndex;

    if (saveModifiedPageHtml && svgRoot) {
      saveModifiedPageHtml(pageIdx, svgRoot);
    }

    // Clear saved selection so it doesn't re-trigger stale text
    window.__savedTextSelection = null;
    window.__lastTextSelection = null;

    if (onComplete) onComplete(translatedText);
    return true;
  } catch (err) {
    console.error('[Inline Translation] Error:', err);

    // Revert visual loading state on error
    if (translatingWrapper) {
      // Unwrap
      const parent = translatingWrapper.parentNode;
      while (translatingWrapper.firstChild) {
        parent.insertBefore(translatingWrapper.firstChild, translatingWrapper);
      }
      translatingWrapper.remove();
    }
    if (targetContainer) {
      targetContainer.classList.remove('translating-element-pulse');
    }

    if (spinnerBadge) {
      spinnerBadge.remove();
      spinnerBadge = null;
    }

    const errMsg = err.message || 'Translation failed. Please try again.';
    showNoticeBadge(targetContainer?.getBoundingClientRect?.(), errMsg);
    if (onError) onError(errMsg);
    return false;
  } finally {
    if (spinnerBadge) {
      spinnerBadge.remove();
    }
  }
}
