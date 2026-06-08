import type { NewsMarket } from "@/lib/funnel";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

function fmtPrice(n: number | null | undefined) {
  if (n == null || !isFinite(n)) return "–";
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}
function fmtPct(n: number | null | undefined) {
  if (n == null || !isFinite(n)) return "–";
  const s = n >= 0 ? "+" : "";
  return `${s}${n.toFixed(2)}%`;
}

export function MarketsPanel({ market, lang }: { market: NewsMarket | null; lang: Lang }) {
  if (!market) return null;
  const fngPct = market.fng ? Math.min(100, Math.max(0, market.fng.value)) : 0;
  return (
    <div className="space-y-3 px-1">
      <div className="cr-card p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t(lang, "fearGreed")}</span>
          {market.fng && <span className="cr-gold-text font-bold">{market.fng.label}</span>}
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: `${fngPct}%`,
              background: "linear-gradient(90deg, var(--down), var(--gold), var(--up))",
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>0</span><span>{market.fng ? market.fng.value : "–"}</span><span>100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="cr-card min-w-0 p-3">
          <p className="text-[11px] text-muted-foreground">{t(lang, "mcap24")}</p>
          <p className={`mt-1 truncate font-display text-lg font-bold sm:text-xl ${(market.mcap_change_24h ?? 0) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
            {fmtPct(market.mcap_change_24h)}
          </p>
        </div>
        <div className="cr-card min-w-0 p-3">
          <p className="text-[11px] text-muted-foreground">{t(lang, "btcDom")}</p>
          <p className="mt-1 truncate font-display text-lg font-bold cr-gold-text sm:text-xl">
            {market.btc_dominance != null ? `${market.btc_dominance.toFixed(1)}%` : "–"}
          </p>
        </div>
      </div>

      <div className="cr-card overflow-hidden">
        {market.coins.map((c, i) => {
          const up = (c.change_24h ?? 0) >= 0;
          return (
            <div key={c.symbol + i} className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0">
              {c.image ? (
                <img src={c.image} alt="" width={28} height={28} loading="lazy" className="h-7 w-7 rounded-full" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{c.symbol}</p>
                {c.name && <p className="truncate text-[11px] text-muted-foreground">{c.name}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">${fmtPrice(c.price)}</p>
                <p className={`text-[11px] font-semibold ${up ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                  {fmtPct(c.change_24h)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Ticker({ market }: { market: NewsMarket | null }) {
  if (!market || !market.coins?.length) return null;
  const items = market.coins.slice(0, 8);
  const row = items.map((c) => (
    <span key={c.symbol} className="mx-3 inline-flex items-center gap-1.5 text-xs">
      <span className="font-semibold text-foreground">{c.symbol}</span>
      <span className="text-muted-foreground">${fmtPrice(c.price)}</span>
      <span className={`font-semibold ${(c.change_24h ?? 0) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
        {fmtPct(c.change_24h)}
      </span>
    </span>
  ));
  return (
    <div className="cr-reel overflow-hidden">
      <div className="flex whitespace-nowrap py-1.5 animate-[cr-marquee_28s_linear_infinite]">
        {row}{row}
      </div>
      <style>{`@keyframes cr-marquee { from {transform: translateX(0)} to {transform: translateX(-50%)} }`}</style>
    </div>
  );
}
