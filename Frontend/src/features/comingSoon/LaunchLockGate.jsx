import { Navigate, useLocation } from 'react-router-dom';
import { LAUNCH_LOCK, isLaunchAllowedPath, requestComingSoonModal } from '../../config/launchLock';

/**
 * Pre-launch route lock. Wrap <Routes> with it:
 *   <LaunchLockGate><Routes>…</Routes></LaunchLockGate>
 * Any path other than / or /home redirects to / and opens the Coming Soon modal.
 */
export default function LaunchLockGate({ children }) {
  const location = useLocation();
  if (LAUNCH_LOCK && !isLaunchAllowedPath(location.pathname)) {
    requestComingSoonModal();
    return <Navigate to="/" replace />;
  }
  return children;
}
