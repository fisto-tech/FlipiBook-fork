# Coming Soon flow (pre-launch lock) — currently DISABLED

This folder keeps the pre-launch "Coming Soon" flow so it can be switched back on quickly.
When enabled:

- Only the Home page (`/` and `/home`) is reachable. Typing or opening any other route
  redirects to `/` and opens the Coming Soon popup.
- Every click in the top navigation (except Home / logo) opens the popup instead of navigating.
- The popup opens every time the Home page loads (including refresh), with a close button
  (✕, Esc, or click outside).

## Files

| File | Purpose |
| --- | --- |
| `../../config/launchLock.js` | `LAUNCH_LOCK` switch, allowed paths, `requestComingSoonModal()` |
| `LaunchLockGate.jsx` | Route guard that wraps `<Routes>` |
| `launchLockHeaderClick.js` | `onClickCapture` handler for the site header |
| `ComingSoonModal.jsx` | Popup shown on the Home page (uses `pages/ComingSoon.jsx` in `embedded` mode) |

The standalone page `pages/ComingSoon.jsx` and its route `/coming-soon` stay in the app and work
independently of this flow.

## Turn it back on

1. **`src/config/launchLock.js`** — make sure `export const LAUNCH_LOCK = true;`

2. **`src/App.jsx`** — import the gate and wrap `<Routes>`:

   ```jsx
   import LaunchLockGate from "./features/comingSoon/LaunchLockGate";
   // …
   <LaunchLockGate>
     <Routes>
       {/* …all routes… */}
     </Routes>
   </LaunchLockGate>
   ```

3. **`src/Layouts/MainLayout.jsx`** — block header clicks:

   ```jsx
   import launchLockHeaderClick from '../features/comingSoon/launchLockHeaderClick';
   // …
   <header
     className="w-full flex-none bg-white z-[100] h-14 sm:h-16 md:h-[7vh] min-h-[52px]"
     onClickCapture={launchLockHeaderClick}
   >
   ```

4. **`src/pages/Home.jsx`** — show the popup:

   ```jsx
   import ComingSoonModal from '../features/comingSoon/ComingSoonModal';
   // … first child inside Home's root <div>:
   <ComingSoonModal />
   ```

To open the site again later, either undo steps 2–4 or simply set `LAUNCH_LOCK = false`
(the gate and header blocker then do nothing; remove `<ComingSoonModal />` from Home to stop the popup).
