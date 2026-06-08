// SINGLE source of truth for Cherry Rush brand values.
// Runtime config (/api/config) overrides these at runtime; these are fallbacks.
export const BRAND = {
  id: import.meta.env.VITE_BRAND_ID || "cherry-rush",
  wordmark: "Cherry Rush",
  tagline: "Hot drops. First to know.",
  character: { name: "Ruby", role: "Cherry crew lead" },
  botUsername: import.meta.env.VITE_BOT_USERNAME || "cherryrush_bot",
  channelHandle: import.meta.env.VITE_CHANNEL_HANDLE || "cherryrush",
  colors: {
    bg: "#120608",
    red: "#FF2D4A",
    redDeep: "#E11D48",
    gold: "#FFC83D",
    goldDeep: "#F5B301",
    cream: "#FFF6E8",
    rose: "#C58A95",
  },
} as const;

export const API_BASE = (import.meta.env.VITE_API_BASE as string) || "";
