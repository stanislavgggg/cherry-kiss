import { useEffect } from "react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { trackEvent, type NewsItem } from "@/lib/funnel";
import { getUid, haptic } from "@/lib/telegram";
import ruby from "@/assets/ruby.png";

export function ChannelPreview({
  lang,
  displayName,
  onSubscribe,
  pinned,
}: {
  lang: Lang;
  displayName: string;
  onSubscribe: () => void;
  pinned: NewsItem[];
}) {
  useEffect(() => {
    trackEvent("cta_view", { surface: "channel_screen" }, getUid());
  }, []);

  const postsToday = pinned.filter((p) => {
    const t0 = new Date(p.published_at).getTime();
    return t0 && Date.now() - t0 < 24 * 60 * 60 * 1000;
  }).length || pinned.length;

  const handleJoin = () => {
    haptic("medium");
    trackEvent("cta_tap", { surface: "channel_screen" }, getUid());
    onSubscribe();
  };

  return (
    <div className="space-y-3 px-1 pb-4">
      {/* Hero */}
      <div className="cr-card relative overflow-hidden p-5 text-center border-2 border-[hsl(var(--gold)/0.4)]">
        <img
          src={ruby}
          alt=""
          width={96}
          height={96}
          className="mx-auto h-20 w-20 drop-shadow-[0_6px_16px_rgba(225,29,72,0.55)]"
        />
        <h2 className="cr-wordmark mt-3 text-3xl">{displayName}</h2>
        <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-semibold text-gold">18+</span>
          <span>· {postsToday} {t(lang, "materialsToday")}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t(lang, "channelDesc")}</p>
        <button
          onClick={handleJoin}
          className="cr-cta mt-4 w-full rounded-xl px-5 py-3 text-base font-extrabold"
        >
          🍒 {t(lang, "openInTg")}
        </button>
      </div>

      {/* Pinned posts */}
      {pinned.slice(0, 3).map((p) => (
        <div key={p.id} className="cr-card p-3">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="rounded-full bg-gold/15 text-gold border border-gold/40 px-2 py-0.5 font-semibold uppercase tracking-wider">
              📌 {t(lang, "channelPinned")}
            </span>
            <span className="text-muted-foreground">{p.source}</span>
          </div>
          <h3 className="mt-2 text-[14px] font-semibold leading-snug">{p.title}</h3>
          {p.summary && (
            <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{p.summary}</p>
          )}
        </div>
      ))}

      {/* How it works */}
      <div className="cr-card p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gold">{t(lang, "howItWorks")}</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li>🔥 {t(lang, "bullet1")}</li>
          <li>🎮 {t(lang, "bullet2")}</li>
          <li>📈 {t(lang, "bullet3")}</li>
        </ul>
        <button
          onClick={handleJoin}
          className="cr-cta mt-4 w-full rounded-xl px-5 py-2.5 text-sm font-extrabold"
        >
          🍒 {t(lang, "joinChannel")}
        </button>
      </div>
    </div>
  );
}
