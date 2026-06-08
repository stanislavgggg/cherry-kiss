import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { trackEvent } from "@/lib/funnel";
import { getUid, haptic } from "@/lib/telegram";
import ruby from "@/assets/ruby.png";

const KEY = "cr_onboarded_v1";

export function Onboarding({ lang, onSubscribe }: { lang: Lang; onSubscribe: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        setOpen(true);
        trackEvent("cta_view", { surface: "onboarding" }, getUid());
      }
    } catch {}
  }, []);
  if (!open) return null;
  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/85 backdrop-blur-md sm:items-center">
      <div
        className="cr-card cr-rise w-full max-w-[480px] rounded-b-none rounded-t-3xl p-6 text-center sm:rounded-3xl"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
      >
        <img src={ruby} alt="" width={96} height={96} className="mx-auto h-20 w-20 drop-shadow-[0_6px_16px_rgba(225,29,72,0.55)]" />
        <h2 className="cr-wordmark mt-3 text-3xl">{t(lang, "onboardTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t(lang, "onboardBody")}</p>
        <button
          onClick={() => {
            haptic("medium");
            trackEvent("cta_tap", { surface: "onboarding" }, getUid());
            onSubscribe();
            close();
          }}
          className="cr-cta mt-5 w-full rounded-xl px-5 py-3 text-base font-extrabold"
        >
          🍒 {t(lang, "onboardCta")}
        </button>
        <button
          onClick={() => {
            trackEvent("cta_dismiss", { surface: "onboarding" }, getUid());
            close();
          }}
          className="mt-3 text-xs text-muted-foreground underline"
        >
          {t(lang, "maybeLater")}
        </button>
        <p className="mt-3 text-[10px] text-rose/80">{t(lang, "disclaimer")}</p>
      </div>
    </div>
  );
}
