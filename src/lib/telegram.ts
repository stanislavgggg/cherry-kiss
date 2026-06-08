export function tg(): any {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp ?? null;
}

export function getUid(): number | null {
  const u = tg()?.initDataUnsafe?.user?.id;
  return typeof u === "number" ? u : null;
}

export function haptic(kind: "light" | "medium" | "heavy" | "success" = "light") {
  try {
    const w = tg();
    if (!w?.HapticFeedback) return;
    if (kind === "success") w.HapticFeedback.notificationOccurred("success");
    else w.HapticFeedback.impactOccurred(kind);
  } catch {}
}

export function openChannel(url: string) {
  try {
    const w = tg();
    if (w?.openTelegramLink) {
      w.openTelegramLink(url);
      return;
    }
  } catch {}
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
}
