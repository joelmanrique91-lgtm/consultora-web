# Header links auto-diagnosis (desktop)

## Summary
- I set up a Playwright E2E harness (`e2e/header-links.spec.js`) and config (`playwright.config.js`) to automatically verify header links and capture hit-testing data.
- Automatic execution **could not run** because Playwright is not available in this environment and `npm` registry access is blocked with HTTP 403.
- As a result, the root cause classification is **not confirmed** by runtime evidence; below are the static-code candidates plus the exact failing outputs.

## How to run the diagnosis
```bash
cd site/app
npm run test:e2e
```

## Execution evidence (automatic)
### Install attempt
Command:
```bash
cd site/app
npm i -D @playwright/test
```
Result:
```
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@playwright%2ftest
```

### Test run attempt
Command:
```bash
cd site/app
npm run test:e2e
```
Result:
```
playwright: not found
```

## Files/lines involved (static inspection)
- Header markup and links: `site/app/src/layouts/Layout.astro` (links + header layout).
- Menu JS (open/close, aria/inert sync): `site/app/src/layouts/Layout.astro` (inline script).
- Backdrop/panel CSS: `site/app/src/styles/global.css` (desktop vs mobile rules).

## Planned runtime signals (when Playwright is available)
The test captures for each header link:
- Bounding box, computed styles (pointer-events, z-index, position), and `document.elementFromPoint` hit element.
- Whether navigation occurs after click; if not, a forensic dump of menu state (`details[open]`, `body.menu-open`, `aria-hidden`, `inert`).
- Trace/screenshot artifacts on failure.

## Root cause classification
**Status: UNCONFIRMED** (blocked by Playwright install/exec failure).

When Playwright runs, the test will classify into:
- **A: Interception** (overlay/backdrop/panel intercepts clicks)
- **B: PreventDefault** (JS cancels navigation)
- **C: Invalid href** (not a real anchor)
- **D: Stale state** (mobile-open state lingering in desktop)

## Minimal fix recommendations (to apply after diagnosis)
- **If A (interception):** enforce `pointer-events: none` / `display: none` for `.site-nav__backdrop` in desktop, and only enable pointer events when `details[open]` in mobile.
- **If B (preventDefault):** restrict any `preventDefault` to the toggle only, never to header `<a>`.
- **If D (stale state):** force `syncMenuState()` on `astro:page-load`, `pageshow`, and `matchMedia('change')`, ensuring `aria-hidden`/`inert` are cleared on desktop.

## Next step
Unblock Playwright installation (registry access) and re-run `npm run test:e2e` to produce runtime evidence and confirm the root cause.
