export type Lang = "en" | "ru" | "es";

const DICT = {
  en: {
    hot: "Hot",
    news: "News",
    live: "Live",
    markets: "Markets",
    all: "All",
    crypto: "Crypto",
    casino: "Casino",
    esports: "Esports",
    subscribe: "Subscribe on Telegram",
    subscribeShort: "Subscribe",
    joinFull: "Join to keep reading",
    joinSub: "Full feed · instant drops · first to know",
    maybeLater: "maybe later",
    locked: "Subscribe to unlock",
    valueStrip: "Full feed · instant drops · first to know",
    updated: "Updated",
    nothingYet: "Nothing here yet. Pull to refresh.",
    error: "Couldn't load. Try again.",
    disclaimer: "18+ · Informational only. Not financial or betting advice.",
    privacy: "Privacy",
    footer: "Cherry Rush — informational news only.",
    liveNow: "LIVE",
    upcoming: "Upcoming",
    fearGreed: "Fear & Greed",
    btcDom: "BTC dominance",
    mcap24: "24h market cap",
    unlocked: "Unlocked! Welcome to the crew.",
    onboardTitle: "Meet Ruby & the Cherry crew",
    onboardBody: "A fast feed of news, live scores and markets. Join the channel for the drops.",
    onboardCta: "Join the channel",
    now: "now",
  },
  ru: {
    hot: "Огонь",
    news: "Новости",
    live: "Лайв",
    markets: "Рынки",
    all: "Все",
    crypto: "Крипта",
    casino: "Казино",
    esports: "Киберспорт",
    subscribe: "Подписаться в Telegram",
    subscribeShort: "Подписаться",
    joinFull: "Подпишись, чтобы читать дальше",
    joinSub: "Полная лента · мгновенные дропы · первым узнаёшь",
    maybeLater: "может позже",
    locked: "Подпишись, чтобы открыть",
    valueStrip: "Полная лента · мгновенные дропы · первым узнаёшь",
    updated: "Обновлено",
    nothingYet: "Пока пусто. Потяни, чтобы обновить.",
    error: "Не загрузилось. Попробуй ещё раз.",
    disclaimer: "18+ · Только информация. Не финансовый и не беттинг-совет.",
    privacy: "Конфиденциальность",
    footer: "Cherry Rush — только информационные новости.",
    liveNow: "LIVE",
    upcoming: "Скоро",
    fearGreed: "Страх и жадность",
    btcDom: "Доминация BTC",
    mcap24: "Капа за 24ч",
    unlocked: "Открыто! Добро пожаловать в crew.",
    onboardTitle: "Знакомься: Ruby и Cherry crew",
    onboardBody: "Быстрая лента новостей, лайв-счёты и рынки. Подпишись на канал ради дропов.",
    onboardCta: "Подписаться на канал",
    now: "сейчас",
  },
  es: {
    hot: "Hot",
    news: "Noticias",
    live: "En vivo",
    markets: "Mercados",
    all: "Todo",
    crypto: "Cripto",
    casino: "Casino",
    esports: "Esports",
    subscribe: "Suscríbete en Telegram",
    subscribeShort: "Suscribirse",
    joinFull: "Únete para seguir leyendo",
    joinSub: "Feed completo · drops al instante · primero en saber",
    maybeLater: "quizá luego",
    locked: "Suscríbete para desbloquear",
    valueStrip: "Feed completo · drops al instante · primero en saber",
    updated: "Actualizado",
    nothingYet: "Nada aún. Desliza para refrescar.",
    error: "No cargó. Reintenta.",
    disclaimer: "18+ · Solo informativo. No es consejo financiero ni de apuestas.",
    privacy: "Privacidad",
    footer: "Cherry Rush — solo noticias informativas.",
    liveNow: "EN VIVO",
    upcoming: "Próximos",
    fearGreed: "Miedo y codicia",
    btcDom: "Dominio BTC",
    mcap24: "Capitalización 24h",
    unlocked: "¡Desbloqueado! Bienvenido al crew.",
    onboardTitle: "Conoce a Ruby y al Cherry crew",
    onboardBody: "Feed rápido de noticias, marcadores en vivo y mercados. Únete al canal para los drops.",
    onboardCta: "Únete al canal",
    now: "ahora",
  },
} as const;

export type DictKey = keyof typeof DICT["en"];

export function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("lang");
    if (q && ["en", "ru", "es"].includes(q)) return q as Lang;
    const ls = localStorage.getItem("mp_lang");
    if (ls && ["en", "ru", "es"].includes(ls)) return ls as Lang;
    const tg = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (tg) {
      const short = String(tg).slice(0, 2);
      if (["en", "ru", "es"].includes(short)) return short as Lang;
    }
    const nav = navigator.language?.slice(0, 2);
    if (nav && ["en", "ru", "es"].includes(nav)) return nav as Lang;
  } catch {}
  return "en";
}

export function setLang(l: Lang) {
  try { localStorage.setItem("mp_lang", l); } catch {}
}

export function t(lang: Lang, key: DictKey): string {
  return DICT[lang][key] ?? DICT.en[key] ?? key;
}

export function relativeTime(iso: string, lang: Lang): string {
  const d = new Date(iso).getTime();
  if (!d) return "";
  const diff = Math.max(0, Date.now() - d);
  const s = Math.floor(diff / 1000);
  if (s < 60) return t(lang, "now");
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const dy = Math.floor(h / 24);
  return `${dy}d`;
}
