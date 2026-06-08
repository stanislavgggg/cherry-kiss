## Goal
Make the funnel watertight (no dead ends, no broken triggers) and ensure the layout looks correct on every common smartphone (iPhone SE 320px → iPhone Pro Max 430px, Android 360–412px, with notch / dynamic island).

## 1. Funnel holes to close

### 1.1 Dead-end on error / empty feed
When `/api/news` fails or returns 0 items, the user sees only a mascot + "Couldn't load. Try again." — no retry button, no CTA, and the interstitial never fires (no scroll, no opens). Result: gated users have zero path to subscribe.

Fix in `src/components/Header.tsx` (`MascotEmpty`) and `src/routes/index.tsx`:
- Add an explicit **Retry** button to `MascotEmpty` (`onRetry?: () => void`) that calls `newsQ.refetch()` / `liveQ.refetch()`.
- When gated and the feed is empty or errored, render the **Subscribe CTA** inline inside the empty state (in addition to the sticky bar), with the disclaimer below.
- Pass `onRetry` from every empty/error branch in `renderStream()`.

### 1.2 Unlock burst never triggers
In `src/routes/index.tsx` the effect computes `const prevMember = isMember` from the same closure that fires *because* `isMember` changed, so the condition `prevMember === false && data.is_member === true` is never true simultaneously.

Fix: use a `useRef<boolean>(isMember)` to remember the previous value across renders, compare against the current `isMember`, then update the ref. Trigger `setShowBurst(true)` only on the false→true transition.

### 1.3 Live cards do nothing for members
`LiveCard.onTap` always calls `onSubscribe`. For non-gated users that's a wasted tap.

Fix: pass `gated` into `LiveCard`; if not gated, no-op (or open match url when available). Same change applies to the `hot` tab top-2 live cards.

### 1.4 Interstitial fires once then is gone forever
Once dismissed with "maybe later", `interstitialShownRef` stays `true` for the session.

Fix:
- After dismissal, set a cooldown (e.g. 90 s) before re-arming, and re-arm again after **5 more item opens** or **tab change**.
- Track `cta_dismiss` event for analytics parity.

### 1.5 Onboarding never shown
Translation keys `onboardTitle / onboardBody / onboardCta` exist but no component uses them. First-time users get no value pitch.

Fix: add a tiny `<OnboardingSheet />` (new file `src/components/Onboarding.tsx`) that:
- Reads `localStorage.cr_onboarded`. If absent, shows once at mount as a bottom sheet (over the feed, not blocking the SSR shell).
- Has a single primary CTA → `onSubscribe()`, plus a "Skip" link that sets the flag.
- Fires `cta_view` / `cta_tap` with `surface: "onboarding"`.

### 1.6 Tab switches uninstrumented
No `tab_switch` event in `trackEvent` type union. Add `"tab_switch"` to `EventName` and emit on `setTab`. Lets us see where the funnel leaks.

### 1.7 Subscribe deeplink fallback
`openChannel` falls back to `window.open` outside Telegram WebApp — good. But when the channel is opened in-app, `visibilitychange` may not fire reliably on iOS Telegram. Add a short **polling fallback**: on `onSubscribe`, kick `membershipQ.refetch()` 3× over ~12 s (2 s, 6 s, 12 s). Cancel timers on unmount.

## 2. Responsive / layout fixes

### 2.1 Header sticky offset bug
`FilterRail` uses `sticky top-[68px]`, but the header is actually ~74–78px tall (1.5px reel + 12px pt + 48px image + 8px pb + safe-area). Causes a 6–10px gap or overlap.

Fix: drop the hardcoded number. Stack the two sticky bars naturally — wrap header + filter rail in a single sticky container, or compute the offset with a ref + `useLayoutEffect` setting a CSS variable `--cr-header-h`, then `top: var(--cr-header-h)` on the rail.

### 2.2 Safe-area insets for notch / dynamic island
Header `pt-3` ignores `env(safe-area-inset-top)`. On iPhone 14/15 Pro this overlaps the dynamic island.

Fix: header → `pt-[max(env(safe-area-inset-top),12px)]`; root layout already paints background under the bar.

### 2.3 Header overflow at 320 px
At 320 px the row is `image(48) + gap(12) + wordmark + tagline + LangSwitcher(~110)`. Tagline truncates but wordmark `text-2xl` plus full LangSwitcher pushes past edge.

Fix:
- Add `min-w-0` to the wordmark wrapper (already present — keep).
- Make `LangSwitcher` more compact under 360 px: shrink padding to `px-1.5 py-0.5` and font to `text-[10px]`; add `shrink-0`.
- Use `text-xl` on wordmark below `sm` breakpoint (`text-xl sm:text-2xl`).
- Reduce `gap-3` → `gap-2` on the header row.

### 2.4 Subscribe bar text wrapping
"Подписаться в Telegram" + two cherry emoji wraps on 320 px.

Fix: `whitespace-nowrap` on the label, `text-sm sm:text-base`, and remove one of the emoji at `<360px` via responsive class.

### 2.5 Bottom padding under sticky CTA
Main uses `pb-32`. With the disclaimer wrapping to two lines + safe-area, the last item can hide. Switch to `pb-[calc(env(safe-area-inset-bottom)+9rem)]` and add `pb-[calc(env(safe-area-inset-bottom)+12px)]` to the bar wrapper (already partially there).

### 2.6 Live card score row on narrow screens
At 320 px, two long team names + score don't fit the single row. Switch to a 2-line layout: team names on top row truncated, big score centered on row 2. Keep flex but `flex-col sm:flex-row` swap.

### 2.7 Markets grid on very narrow screens
`grid-cols-2 gap-3` with `font-display text-xl` overflows on 320 px when value is `-12.34%`.

Fix: drop the value text to `text-lg sm:text-xl`, ensure the parent has `min-w-0` and the value uses `truncate`.

### 2.8 Horizontal scroll hygiene
Add `overflow-x-hidden` to `body` in `styles.css` to guarantee no rogue overflow from drop-shadows or marquee transforms on mobile.

### 2.9 Tap target sizes
Several pills are `py-1` / `py-1.5` ≈ 28 px tall — below the WCAG / Apple 44 px guideline.
Bump filter-rail tab pills to `py-2` and sub-pills to `py-1.5` with `min-h-[36px]`.

## 3. Verification

After build, open the live preview at three sizes via the browser tool and screenshot each:
- **320 × 568** (iPhone SE 1st gen)
- **390 × 844** (iPhone 14)
- **412 × 915** (Pixel 7)

For each: confirm header doesn't overlap rail, sticky CTA doesn't cover last card, Subscribe button text fits on one line, language switcher is reachable, the empty/error state shows a working Retry + CTA.

Then trigger the funnel paths with the running app:
- Force an empty/error state by loading offline once — confirm Retry works and inline CTA is visible.
- Simulate transition to member (toggle a debug flag) — confirm `UnlockBurst` plays exactly once.
- Open and dismiss the interstitial — wait, scroll more, confirm it re-arms.

## Files touched
- `src/routes/index.tsx` — fix unlock ref, retry plumbing, onboarding mount, interstitial cooldown, tab_switch event, polling after subscribe, dynamic header offset CSS var.
- `src/components/Header.tsx` — safe-area inset, responsive wordmark/gap, `MascotEmpty` retry+CTA props.
- `src/components/FilterRail.tsx` — use `top: var(--cr-header-h)`, taller pills.
- `src/components/Funnel.tsx` — Subscribe bar responsive text, ValueStrip CTA button, `cta_dismiss` event.
- `src/components/Cards.tsx` — `LiveCard` accepts `gated`, stacked layout on narrow screens.
- `src/components/Markets.tsx` — narrow-screen typography + `min-w-0`.
- `src/components/LangSwitcher.tsx` — compact mode under sm.
- `src/components/Onboarding.tsx` — **new** one-time bottom sheet.
- `src/lib/funnel.ts` — extend `EventName` with `"tab_switch" | "cta_dismiss"`.
- `src/styles.css` — `body { overflow-x: hidden; }`, helper class for safe-area.

No backend, schema, or business-logic changes — purely funnel-UX and CSS.
