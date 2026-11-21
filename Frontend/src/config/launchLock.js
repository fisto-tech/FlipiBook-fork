/**
 * Pre-launch lock.
 * While LAUNCH_LOCK is true the site only allows the Home page. Any other route
 * (typed URL or click) redirects to Home and opens the "Coming Soon" modal.
 * Set to false on launch day to open the whole site again.
 */
export const LAUNCH_LOCK = false;

// Exact paths that stay open during the lock
export const LAUNCH_ALLOWED_PATHS = ['/', '/home', '/coming-soon'];

// Path prefixes that stay open (the page and anything under it)
export const LAUNCH_ALLOWED_PREFIXES = [
  '/features',
  // Legal & policy pages (pages/LegalFile)
  '/terms', '/privacy', '/cookie', '/refund', '/copyright',
];

export const isLaunchAllowedPath = (pathname = '/') => {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  if (LAUNCH_ALLOWED_PATHS.includes(p)) return true;
  return LAUNCH_ALLOWED_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix));
};

/** Ask the Home page to show the Coming Soon modal (works whether or not Home is mounted yet). */
export const COMING_SOON_FORCE_KEY = 'flipibook_force_coming_soon';
export const requestComingSoonModal = () => {
  try { sessionStorage.setItem(COMING_SOON_FORCE_KEY, '1'); } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent('show-coming-soon'));
};
