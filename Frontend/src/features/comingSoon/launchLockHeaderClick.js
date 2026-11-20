import { LAUNCH_LOCK, isLaunchAllowedPath, requestComingSoonModal } from '../../config/launchLock';

/**
 * Header click blocker. Attach to the site header:
 *   <header onClickCapture={launchLockHeaderClick}> … </header>
 * Every click except Home / logo opens the Coming Soon modal instead of navigating.
 */
export default function launchLockHeaderClick(e) {
  if (!LAUNCH_LOCK) return;
  const el = e.target.closest?.('a, button, [role="button"], [role="menuitem"]');
  if (!el) return;
  // Home link / logo stay usable
  const href = el.tagName === 'A' ? el.getAttribute('href') : null;
  if (href && isLaunchAllowedPath(href.split(/[?#]/)[0])) return;
  e.preventDefault();
  e.stopPropagation();
  requestComingSoonModal();
}
