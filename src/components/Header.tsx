import { useLayoutEffect, useRef } from "react";
import cherryCrew from "@/assets/cherry-crew.png";
import ruby from "@/assets/ruby.png";
import { LangSwitcher } from "./LangSwitcher";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function Header({
  displayName,
  tagline,
  lang,
  onLang,
}: {
  displayName: string;
  tagline: string;
  lang: Lang;
  onLang: (l: Lang) => void;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--cr-header-h", `${Math.round(h)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);
  return (
    <header
      ref={ref}
      className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
    >
      <div className="cr-reel h-1.5" aria-hidden />
      <div className="mx-auto flex max-w-[480px] items-center gap-2 px-3 pt-2.5 pb-2 sm:gap-3 sm:px-4 sm:pt-3">
        <img
          src={ruby}
          alt="Ruby the cherry mascot"
          width={56}
          height={56}
          className="h-10 w-10 shrink-0 -mr-0.5 drop-shadow-[0_4px_10px_rgba(225,29,72,0.45)] sm:h-12 sm:w-12"
        />
        <div className="flex-1 min-w-0">
          <h1 className="cr-wordmark text-xl leading-none sm:text-2xl truncate">{displayName}</h1>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{tagline}</p>
        </div>
        <LangSwitcher lang={lang} onChange={onLang} />
      </div>
    </header>
  );
}

export function MascotEmpty({
  children,
  onRetry,
  onSubscribe,
  lang,
  showSubscribe,
}: {
  children: React.ReactNode;
  onRetry?: () => void;
  onSubscribe?: () => void;
  lang?: Lang;
  showSubscribe?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <img src={cherryCrew} alt="Cherry crew" width={180} height={180} className="h-28 w-auto opacity-90 sm:h-32" />
      <p className="text-sm text-muted-foreground">{children}</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
          >
            ↻ {lang ? t(lang, "retry") : "Retry"}
          </button>
        )}
        {showSubscribe && onSubscribe && lang && (
          <button
            onClick={onSubscribe}
            className="cr-cta inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold"
          >
            🍒 {t(lang, "subscribeShort")}
          </button>
        )}
      </div>
    </div>
  );
}
