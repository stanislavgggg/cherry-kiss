import { useEffect, useRef, useState } from "react";
import type { NewsItem, BackendMatch } from "@/lib/funnel";
import { trackEvent } from "@/lib/funnel";
import type { Lang } from "@/lib/i18n";
import { relativeTime, t } from "@/lib/i18n";
import { getUid, haptic } from "@/lib/telegram";

export function NewsCard({ item, lang }: { item: NewsItem; lang: Lang }) {
  const [imgOk, setImgOk] = useState(Boolean(item.image));
  const onTap = () => {
    haptic("light");
    trackEvent("cta_tap", { surface: "feed_item", source: item.source, category: item.category }, getUid());
    if (typeof window !== "undefined") window.open(item.url, "_blank", "noopener");
  };
  const tagColor =
    item.category === "crypto"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : item.category === "casino"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30";
  return (
    <button
      onClick={onTap}
      className="cr-card cr-rise w-full text-left p-3 active:scale-[0.99] transition will-change-transform"
    >
      <div className="flex items-center gap-2 text-[11px]">
        <span className={`rounded-full border px-2 py-0.5 font-semibold uppercase tracking-wider ${tagColor}`}>
          {t(lang, item.category as any)}
        </span>
        <span className="text-muted-foreground">{item.source}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{relativeTime(item.published_at, lang)}</span>
      </div>
      <h3 className="mt-2 text-[15px] font-semibold leading-snug text-foreground">
        {item.title}
      </h3>
      {item.summary && (
        <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">{item.summary}</p>
      )}
      {imgOk && item.image && (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          onError={() => setImgOk(false)}
          className="mt-2.5 h-40 w-full rounded-lg object-cover border border-border"
        />
      )}
    </button>
  );
}

export function LiveCard({
  match,
  lang,
}: {
  match: BackendMatch;
  lang: Lang;
  onSubscribe?: () => void;
  gated?: boolean;
}) {
  const onTap = () => {
    haptic("light");
    trackEvent("cta_tap", { surface: "live_match", game: match.game }, getUid());
  };
  const live = match.score1 != null || match.score2 != null;
  return (
    <button onClick={onTap} className="cr-card cr-rise w-full text-left p-3 active:scale-[0.99] transition">
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="truncate font-semibold uppercase tracking-wider text-foreground/80">
          {match.game}{match.league ? ` · ${match.league}` : ""}
        </span>
        {live ? (
          <span className="shrink-0 cr-pulse-dot text-[10px] font-bold tracking-widest text-cherry">
            {t(lang, "liveNow")}
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-gold">
            {t(lang, "upcoming")}
          </span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className="truncate text-[14px] font-semibold text-foreground sm:text-[15px]">{match.team1}</span>
        <span className="cr-gold-text whitespace-nowrap font-display text-lg font-bold sm:text-xl">
          {match.score1 ?? "–"} : {match.score2 ?? "–"}
        </span>
        <span className="truncate text-right text-[14px] font-semibold text-foreground sm:text-[15px]">{match.team2}</span>
      </div>
      {match.begin_at && !live && (
        <p className="mt-1 text-right text-[11px] text-muted-foreground">
          {new Date(match.begin_at).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
        </p>
      )}
    </button>
  );
}

export function LivePinnedCard({
  match,
  lang,
  onSubscribe,
}: {
  match: BackendMatch;
  lang: Lang;
  onSubscribe: () => void;
}) {
  useEffect(() => {
    trackEvent("cta_view", { surface: "live_pinned" }, getUid());
  }, []);
  const live = match.score1 != null || match.score2 != null;
  return (
    <div className="cr-card cr-rise relative w-full p-4 border-2 border-[hsl(var(--gold)/0.45)] shadow-[0_10px_40px_-10px_rgba(225,29,72,0.5)]">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="rounded-full bg-gold/15 text-gold border border-gold/40 px-2 py-0.5 font-semibold uppercase tracking-wider">
          📌 {t(lang, "channelPinned")}
        </span>
        {live ? (
          <span className="cr-pulse-dot text-[10px] font-bold tracking-widest text-cherry">
            {t(lang, "liveNow")}
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
            {t(lang, "upcoming")}
          </span>
        )}
      </div>
      <div className="mt-3 text-[12px] uppercase tracking-wider text-muted-foreground">
        {match.game}{match.league ? ` · ${match.league}` : ""}
      </div>
      <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className="truncate text-base font-bold text-foreground">{match.team1}</span>
        <span className="cr-gold-text whitespace-nowrap font-display text-2xl font-bold">
          {match.score1 ?? "–"} : {match.score2 ?? "–"}
        </span>
        <span className="truncate text-right text-base font-bold text-foreground">{match.team2}</span>
      </div>
      <button
        onClick={() => {
          haptic("medium");
          trackEvent("cta_tap", { surface: "live_pinned" }, getUid());
          onSubscribe();
        }}
        className="cr-cta mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-extrabold"
      >
        🍒 {t(lang, "liveCommentary")}
      </button>
    </div>
  );
}

export function LockedCard({
  item,
  lang,
  onSubscribe,
  onVisible,
}: {
  item: NewsItem;
  lang: Lang;
  onSubscribe: () => void;
  onVisible?: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const firedRef = useRef(false);
  useEffect(() => {
    if (!onVisible || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          onVisible();
        }
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [onVisible]);

  // Stable pseudo-random reader count derived from item id
  const readers = (() => {
    let h = 0;
    for (let i = 0; i < item.id.length; i++) h = (h * 31 + item.id.charCodeAt(i)) | 0;
    return 1200 + (Math.abs(h) % 4800);
  })();

  return (
    <div ref={ref} className="cr-card relative overflow-hidden p-3">
      <div className="cr-blur-lock">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-semibold uppercase tracking-wider">
            {t(lang, item.category as any)}
          </span>
          <span className="text-muted-foreground">{item.source}</span>
        </div>
        <h3 className="mt-2 text-[15px] font-semibold">{item.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">{item.summary}</p>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/30 p-4 text-center">
        <span className="text-2xl">🔒</span>
        <p className="text-sm font-semibold text-foreground">{t(lang, "locked")}</p>
        <p className="text-[11px] text-muted-foreground">
          👀 {readers.toLocaleString()} {t(lang, "readingNow")} · {relativeTime(item.published_at, lang)}
        </p>
        <button
          onClick={() => {
            trackEvent("cta_tap", { surface: "feed_lock" }, getUid());
            onSubscribe();
          }}
          className="cr-cta mt-1 inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-bold"
        >
          {t(lang, "subscribeShort")} 🍒
        </button>
      </div>
    </div>
  );
}
