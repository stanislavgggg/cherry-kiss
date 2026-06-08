import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export type Tab = "hot" | "news" | "live" | "markets";
export type NewsSub = "all" | "crypto" | "casino" | "esports";

export function FilterRail({
  tab,
  onTab,
  sub,
  onSub,
  lang,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  sub: NewsSub;
  onSub: (s: NewsSub) => void;
  lang: Lang;
}) {
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "hot", label: t(lang, "hot"), icon: "🔥" },
    { key: "news", label: t(lang, "news"), icon: "🍒" },
    { key: "live", label: t(lang, "live"), icon: "🎮" },
    { key: "markets", label: t(lang, "markets"), icon: "📈" },
  ];
  const subs: { key: NewsSub; label: string }[] = [
    { key: "all", label: t(lang, "all") },
    { key: "crypto", label: t(lang, "crypto") },
    { key: "casino", label: t(lang, "casino") },
    { key: "esports", label: t(lang, "esports") },
  ];
  return (
    <div
      className="sticky z-20 bg-background/85 backdrop-blur-md border-b border-border"
      style={{ top: "var(--cr-header-h, 76px)" }}
    >
      <div className="mx-auto max-w-[480px] px-3 py-2 sm:px-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {tabs.map((x) => {
            const active = tab === x.key;
            return (
              <button
                key={x.key}
                onClick={() => onTab(x.key)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition border min-h-[36px] ${
                  active
                    ? "bg-accent text-accent-foreground border-accent shadow-[var(--shadow-glow-gold)]"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <span className="mr-1">{x.icon}</span>
                {x.label}
              </button>
            );
          })}
        </div>
        {tab === "news" && (
          <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
            {subs.map((s) => {
              const active = sub === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => onSub(s.key)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition border min-h-[32px] ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
