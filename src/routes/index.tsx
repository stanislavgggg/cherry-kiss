import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getConfig,
  getNews,
  getLive,
  getUpcoming,
  getMembership,
  trackEvent,
  type NewsItem,
} from "@/lib/funnel";
import { getUid, haptic, openChannel } from "@/lib/telegram";
import { t, relativeTime } from "@/lib/i18n";

import { Header, MascotEmpty } from "@/components/Header";
import { FilterRail, type NewsSub, type Tab } from "@/components/FilterRail";
import { NewsCard, LiveCard, LockedCard } from "@/components/Cards";
import { SubscribeBar, ValueStrip, Interstitial, UnlockBurst } from "@/components/Funnel";
import { MarketsPanel, Ticker } from "@/components/Markets";
import { useLang } from "@/components/LangSwitcher";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cherry Rush — hot drops, first to know" },
      { name: "description", content: "A fast news + live-scores feed. Informational only. 18+." },
      { property: "og:title", content: "Cherry Rush" },
      { property: "og:description", content: "Hot drops. First to know." },
    ],
  }),
  component: StreamPage,
});

function StreamPage() {
  const [lang, setLang] = useLang();
  const [tab, setTab] = useState<Tab>("hot");
  const [sub, setSub] = useState<NewsSub>("all");
  const [interstitialOpen, setInterstitialOpen] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const opensRef = useRef(0);
  const interstitialShownRef = useRef(false);
  const uid = useMemo(() => (typeof window !== "undefined" ? getUid() : null), []);

  const configQ = useQuery({ queryKey: ["config"], queryFn: getConfig, staleTime: 5 * 60_000 });
  const membershipQ = useQuery({
    queryKey: ["membership", uid],
    queryFn: () => getMembership(uid),
    staleTime: 30_000,
    enabled: true,
  });

  const newsCategory = tab === "news" ? sub : "all";
  const newsQ = useQuery({
    queryKey: ["news", newsCategory],
    queryFn: () => getNews(newsCategory, 40),
    refetchInterval: 5 * 60_000,
    staleTime: 60_000,
  });
  const liveQ = useQuery({
    queryKey: ["live"],
    queryFn: getLive,
    refetchInterval: 60_000,
    enabled: tab === "hot" || tab === "live",
  });
  const upcomingQ = useQuery({
    queryKey: ["upcoming"],
    queryFn: getUpcoming,
    refetchInterval: 5 * 60_000,
    enabled: tab === "live",
  });

  const cfg = configQ.data;
  const gateEnabled = cfg?.cta?.gate ?? true;
  const isMember = Boolean(membershipQ.data?.gate?.is_member);
  const gated = gateEnabled && !isMember;

  const channelUrl =
    cfg?.cta?.channel_url ||
    (cfg?.cta?.bot_username ? `https://t.me/${cfg.cta.bot_username}?start=join` : "https://t.me/cherryrush");

  const onSubscribe = useCallback(() => {
    haptic("success");
    trackEvent("channel_open", { url: channelUrl }, uid);
    openChannel(channelUrl);
  }, [channelUrl, uid]);

  // Interstitial trigger: after 3 item-opens OR ~8 scrolls (once per session)
  useEffect(() => {
    if (!gated) return;
    if (interstitialShownRef.current) return;
    let scrolls = 0;
    const onScroll = () => {
      scrolls++;
      if (scrolls >= 8 && !interstitialShownRef.current) {
        interstitialShownRef.current = true;
        setInterstitialOpen(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [gated]);

  // Unlock-on-return: re-check membership on focus
  useEffect(() => {
    const prevMember = isMember;
    const onVis = () => {
      if (document.visibilityState === "visible") {
        membershipQ.refetch();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    // burst trigger via watching isMember change
    if (prevMember === false && membershipQ.data?.gate?.is_member) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 1000);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [isMember, membershipQ]);

  const handleItemOpen = () => {
    if (!gated || interstitialShownRef.current) return;
    opensRef.current++;
    if (opensRef.current >= 3) {
      interstitialShownRef.current = true;
      setInterstitialOpen(true);
    }
  };

  const newsItems = newsQ.data?.items ?? [];
  const market = newsQ.data?.market ?? null;
  const updatedAt = newsQ.data?.updated_at;

  // Compose stream
  const renderStream = () => {
    if (tab === "markets") {
      if (newsQ.isLoading) return <SkeletonList />;
      return <MarketsPanel market={market} lang={lang} />;
    }
    if (tab === "live") {
      const live = liveQ.data?.matches ?? [];
      const upcoming = upcomingQ.data?.matches ?? [];
      if (liveQ.isLoading && upcomingQ.isLoading) return <SkeletonList />;
      if (!live.length && !upcoming.length) return <MascotEmpty>{t(lang, "nothingYet")}</MascotEmpty>;
      return (
        <div className="space-y-2.5 px-1">
          {live.map((m, i) => <LiveCard key={"l" + i} match={m} lang={lang} onSubscribe={onSubscribe} />)}
          {upcoming.map((m, i) => <LiveCard key={"u" + i} match={m} lang={lang} onSubscribe={onSubscribe} />)}
        </div>
      );
    }

    // hot or news → unified feed with locks
    if (newsQ.isLoading) return <SkeletonList />;
    if (newsQ.isError) return <MascotEmpty>{t(lang, "error")}</MascotEmpty>;
    if (!newsItems.length) return <MascotEmpty>{t(lang, "nothingYet")}</MascotEmpty>;

    const liveTop = tab === "hot" ? (liveQ.data?.matches ?? []).slice(0, 2) : [];

    return (
      <div className="space-y-2.5 px-1">
        {liveTop.map((m, i) => (
          <LiveCard key={"hotlive" + i} match={m} lang={lang} onSubscribe={onSubscribe} />
        ))}

        {newsItems.map((item, idx) => {
          // gating: first 2 free; then interleave locks every 3rd item
          const shouldLock = gated && idx >= 2 && (idx - 2) % 3 === 2;
          if (shouldLock) {
            return <LockedCardWithView key={item.id} item={item} lang={lang} onSubscribe={onSubscribe} />;
          }
          return (
            <div key={item.id} onClick={handleItemOpen}>
              <NewsCard item={item} lang={lang} />
            </div>
          );
        })}

        {gated && <ValueStrip lang={lang} />}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-32">
      <Header
        displayName={cfg?.display_name || "Cherry Rush"}
        tagline={cfg?.tagline || "Hot drops. First to know."}
        lang={lang}
        onLang={setLang}
      />
      <Ticker market={market} />
      <FilterRail tab={tab} onTab={setTab} sub={sub} onSub={setSub} lang={lang} />

      <main className="mx-auto max-w-[480px] px-3 pt-3">
        {updatedAt && (
          <p className="px-1 pb-2 text-[11px] text-muted-foreground">
            {t(lang, "updated")} {relativeTime(updatedAt, lang)}
          </p>
        )}
        {renderStream()}

        <footer className="mt-8 space-y-2 px-2 pb-4 text-center">
          <div className="cr-divider-gold" />
          <p className="text-[11px] text-rose">{t(lang, "disclaimer")}</p>
          <p className="text-[11px] text-muted-foreground">
            <Link to="/privacy" className="underline">{t(lang, "privacy")}</Link> · {t(lang, "footer")}
          </p>
        </footer>
      </main>

      {gated && <SubscribeBar onSubscribe={onSubscribe} lang={lang} />}
      {gated && interstitialOpen && (
        <Interstitial
          lang={lang}
          onSubscribe={onSubscribe}
          onClose={() => setInterstitialOpen(false)}
        />
      )}
      {showBurst && <UnlockBurst />}
    </div>
  );
}

function LockedCardWithView({ item, lang, onSubscribe }: { item: NewsItem; lang: any; onSubscribe: () => void }) {
  useEffect(() => {
    trackEvent("cta_view", { surface: "feed_lock" }, getUid());
  }, []);
  return <LockedCard item={item} lang={lang} onSubscribe={onSubscribe} />;
}

function SkeletonList() {
  return (
    <div className="space-y-2.5 px-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="cr-card animate-pulse p-3">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
          <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
