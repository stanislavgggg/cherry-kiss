import { API_BASE, BRAND } from "./brand";

// SINGLE backend module — every API call goes through here.

export type NewsCategory = "crypto" | "casino" | "esports";
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  category: NewsCategory;
  published_at: string;
  image: string | null;
  summary: string;
}
export interface NewsCoin {
  symbol: string;
  name?: string;
  price: number | null;
  change_24h: number | null;
  image?: string | null;
}
export interface NewsMarket {
  coins: NewsCoin[];
  fng: { value: number; label: string } | null;
  mcap_change_24h: number | null;
  btc_dominance: number | null;
}
export interface NewsResponse {
  items: NewsItem[];
  market: NewsMarket;
  updated_at: string;
}
export interface BackendMatch {
  game: string;
  team1: string;
  team2: string;
  league?: string;
  score1?: number | null;
  score2?: number | null;
  begin_at?: string;
  format?: string;
  id?: string;
}
export interface AppConfig {
  brand: string;
  display_name: string;
  tagline: string;
  character: { name: string; role: string };
  mode: string;
  show_offer: boolean;
  cta: {
    label: { en?: string; ru?: string; es?: string };
    url: string;
    channel: string;
    channel_url: string;
    gate: boolean;
    bot_username: string;
    partner_name?: string;
  };
  offer?: any;
  markets?: any;
  honest_stats?: any;
  win_rate_display?: any;
  privacy_url?: string;
}
export interface MembershipResponse {
  uid: number | string;
  member: boolean;
  gate: { enabled: boolean; locked: boolean; is_member: boolean; channel: string };
  channel: string;
  configured: boolean;
}

async function jget<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "omit" });
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getConfig(): Promise<AppConfig> {
  try {
    return await jget<AppConfig>("/api/config");
  } catch {
    // Fallback to brand env
    return {
      brand: BRAND.id,
      display_name: BRAND.wordmark,
      tagline: BRAND.tagline,
      character: { name: BRAND.character.name, role: BRAND.character.role },
      mode: "fallback",
      show_offer: true,
      cta: {
        label: { en: "Subscribe", ru: "Подписаться", es: "Suscribirse" },
        url: `https://t.me/${BRAND.channelHandle}`,
        channel: `@${BRAND.channelHandle}`,
        channel_url: `https://t.me/${BRAND.channelHandle}`,
        gate: true,
        bot_username: BRAND.botUsername,
      },
    };
  }
}

export async function getNews(
  category: "all" | NewsCategory = "all",
  limit = 40,
): Promise<NewsResponse> {
  return jget<NewsResponse>(`/api/news?category=${category}&limit=${limit}`);
}

export async function getLive(): Promise<{ matches: BackendMatch[] }> {
  return jget(`/api/live`);
}
export async function getUpcoming(): Promise<{ matches: BackendMatch[] }> {
  return jget(`/api/upcoming`);
}

export async function getMembership(uid: number | null): Promise<MembershipResponse | null> {
  if (uid == null) return null;
  try {
    return await jget<MembershipResponse>(`/api/membership?uid=${uid}`);
  } catch {
    return null;
  }
}

export type EventName = "cta_view" | "cta_tap" | "channel_open";
export function trackEvent(event: EventName, meta: Record<string, any> = {}, uid: number | null = null) {
  try {
    const body = JSON.stringify({ event, uid: uid ?? undefined, meta });
    fetch(`${API_BASE}/api/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
