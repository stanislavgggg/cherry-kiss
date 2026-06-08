import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { trackEvent } from "@/lib/funnel";
import { getUid, haptic } from "@/lib/telegram";
import ruby from "@/assets/ruby.png";
import bg from "@/assets/onboarding-bg.jpg";

const KEY = "cr_onboarded_v1";

export function Onboarding({ lang, onSubscribe }: { lang: Lang; onSubscribe: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        setOpen(true);
        trackEvent("cta_view", { surface: "onboarding" }, getUid());
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (step === 2) trackEvent("cta_view", { surface: "onboarding_join" }, getUid());
  }, [step]);
  if (!open) return null;
  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
      <img
        src={bg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover scale-110"
        style={{ filter: "blur(18px) brightness(0.45) saturate(1.1)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 50%, rgba(18,6,8,0.55), rgba(18,6,8,0.92))",
        }}
      />
      <div
        className="relative mx-4 w-full max-w-[420px] rounded-3xl border border-[hsl(var(--gold)/0.35)] bg-background/55 p-6 text-center shadow-[0_30px_80px_-20px_rgba(225,29,72,0.55)] backdrop-blur-xl cr-rise"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 1.5rem)",
          paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
        }}
      >
        <img
          src={ruby}
          alt=""
          width={96}
          height={96}
          className="mx-auto h-20 w-20 drop-shadow-[0_6px_16px_rgba(225,29,72,0.55)]"
        />
        {step === 1 ? (
          <>
            <h2 className="cr-wordmark mt-3 text-3xl">{t(lang, "onboardTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t(lang, "onboardBody")}</p>
            <button
              onClick={() => {
                haptic("medium");
                trackEvent("cta_tap", { surface: "onboarding" }, getUid());
                setStep(2);
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
          </>
        ) : (
          <>
            <h2 className="cr-wordmark mt-3 text-2xl">{t(lang, "oneLastThing")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t(lang, "onboardJoinBody")}</p>
            <button
              onClick={() => {
                haptic("medium");
                trackEvent("cta_tap", { surface: "onboarding_join" }, getUid());
                onSubscribe();
                close();
              }}
              className="cr-cta mt-5 w-full rounded-xl px-5 py-3 text-base font-extrabold"
            >
              🍒 {t(lang, "joinChannel")}
            </button>
            <button
              onClick={() => {
                trackEvent("cta_dismiss", { surface: "onboarding_join" }, getUid());
                close();
              }}
              className="mt-3 text-xs text-muted-foreground underline"
            >
              {t(lang, "skipForNow")}
            </button>
          </>
        )}
        <p className="mt-3 text-[10px] text-rose/80">{t(lang, "disclaimer")}</p>
      </div>
    </div>
  );
}
