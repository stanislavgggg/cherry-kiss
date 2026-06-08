
## Problem
On mobile, the Onboarding bottom-sheet sits at the bottom — the top half of the screen is empty dark space. Looks unfinished.

## Plan

1. **Generate a themed background image** with `imagegen` (premium quality, 1024x1536 portrait):
   - Prompt: glamorous pin-up cherry girl in a casino setting — red velvet, gold sparkles, playing cards, roulette glow, neon bokeh, cinematic, sultry but tasteful (Telegram Ads-safe: no nudity, no explicit content).
   - Save to `src/assets/onboarding-bg.jpg`.

2. **Restyle `src/components/Onboarding.tsx`**:
   - Make it a full-screen modal (not a bottom sheet) on all viewports.
   - Background layer: the generated image, `object-cover`, with `filter: blur(18px) brightness(0.45)` + a red/black gradient overlay for legibility.
   - Foreground card: vertically + horizontally centered (`flex items-center justify-center`), max-width ~420px, glassmorphism (`bg-background/60 backdrop-blur-xl`, gold border, soft shadow).
   - Keep existing content (Ruby mascot, title, body, CTA, "maybe later", disclaimer) — just recentered.
   - Preserve safe-area insets and existing analytics/localStorage logic.

3. **No backend / no other component changes.**

## Files
- create `src/assets/onboarding-bg.jpg` (generated)
- edit `src/components/Onboarding.tsx`
