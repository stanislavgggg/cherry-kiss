## Goal
Поднять CTR на канал, убрав CTA-усталость в Live, создав «постоянный адрес» канала и усилив момент ценности в News. Все поверхности логируются — через 2–3 дня решаем, что отключить.

## 1. Новая вкладка «Channel» + экран `/channel`

- В `FilterRail` добавить пятый таб `channel` (иконка ✨/Send, лейбл из i18n `channelTab`). Активный таб подсвечивается gold-glow как другие.
- Переключение на `channel` НЕ грузит ленту — рендерит новый компонент `ChannelPreview` (внутри `src/routes/index.tsx` через switch по `tab`, чтобы сохранить state и хедер).
- `src/components/ChannelPreview.tsx` — «витрина»:
  - Лого канала (ruby + wordmark), описание, бейдж «18+».
  - Social-proof строка: `getConfig()` если есть `cta.partner_name`/подписчики; fallback — `«N материалов сегодня»` из `newsQ.data.items` (count за 24ч).
  - 2–3 закреплённых превью-карточки (берём топ-3 `newsItems` как mock pinned posts, помеченные «📌 Pinned»).
  - Крупная primary-кнопка «Open in Telegram» → `onSubscribe()`.
  - Маленький линк «How it works» (скролл к секции с 3 буллетами: free hot drops, live commentary, market signals).
- Аналитика: `cta_view {surface: "channel_screen"}` при маунте, `cta_tap {surface: "channel_screen"}` на основной кнопке, `tab_switch {to: "channel"}` уже работает.

## 2. Live: убрать CTA из карточек, добавить sticky + pinned hero

- В `LiveCard` удалить `onClick → onSubscribe` для gated — карточка остаётся информативной и тапабельной только для аналитики (`cta_tap {surface:"live_match"}`), без открытия канала.
- В `src/routes/index.tsx` для `tab === "live"`:
  - **Pinned hero**: первый live-матч (или ближайший upcoming) рендерится как `LivePinnedCard` — увеличенная карточка с подписью `Live commentary in channel →`, единственная с явным CTA в контексте. Surface: `live_pinned`.
  - **Sticky CTA** (Live-only): новый компонент `LiveStickyCTA` — копия `SubscribeBar`, но показывается ТОЛЬКО после 6 секунд на табе ИЛИ скролла >300px. Surface: `live_sticky`. Существующий глобальный `SubscribeBar` на Live скрываем (чтобы не дублировать).
- Остальные `LiveCard` рендерятся без кнопок-призывов.

## 3. News: лок-стек с intersection-trigger + social proof

- Глобальный `SubscribeBar` на табах `hot`/`news` НЕ показывать постоянно. Вместо этого:
  - В `LockedCard` через `IntersectionObserver` при первом появлении в вьюпорте триггерим показ нового sticky `FeedLockSticky` (тот же sticky CTA, surface: `feed_lock_sticky`). После закрытия — cooldown 60s.
- В `LockedCard` добавить строку social-proof над кнопкой: `«3 240 читают сейчас · обновлено 2 мин назад»` (число генерим из `item.id` хэшем для стабильности; «обновлено» — из `item.published_at`).
- `Interstitial` оставить как есть (срабатывает по scroll/opens).

## 4. Onboarding handoff

- В `Onboarding.tsx` после нажатия основной CTA не закрывать сразу, а показывать второй шаг `OnboardJoin`:
  - Заголовок «You're in. One last thing 🍒» / RU «Готово. Последний шаг»
  - Кнопка «Join channel» → `onSubscribe()` (surface: `onboarding_join`)
  - Линк «Skip for now» → `close()`
- Surface уже отслеживается через `cta_view/cta_tap` с `surface: "onboarding_join"`.

## 5. Аналитика — единый контракт

Все новые поверхности через существующий `trackEvent`:
- `nav_channel_tab` — `tab_switch {to:"channel"}` (уже)
- `channel_screen` — view + tap
- `live_pinned` — view + tap
- `live_sticky` — view + tap
- `feed_lock` — tap (уже)
- `feed_lock_sticky` — view + tap (новое)
- `onboarding_join` — view + tap

## Файлы

**Создать:**
- `src/components/ChannelPreview.tsx`
- `src/components/LivePinnedCard.tsx`
- `src/components/LiveStickyCTA.tsx` (или параметризовать `SubscribeBar` через prop `surface`)
- `src/components/FeedLockSticky.tsx` (или тот же `SubscribeBar` с другим surface + IO-триггером в `LockedCard`)

**Изменить:**
- `src/components/FilterRail.tsx` — добавить таб `channel`
- `src/components/Cards.tsx` — `LiveCard` без gated-CTA; `LockedCard` + social proof + IO-callback
- `src/components/Funnel.tsx` — `SubscribeBar` принимает `surface` prop
- `src/components/Onboarding.tsx` — двухшаговый flow
- `src/routes/index.tsx` — роутинг таба `channel`, pinned hero на Live, условный показ sticky-баров
- `src/lib/i18n.ts` — ключи `channelTab`, `channelDesc`, `pinned`, `openInTg`, `liveCommentary`, `readingNow`, `oneLastThing`, `joinChannel`, `skipForNow`

**Без бэкенда.** Никаких новых API — всё на существующих `getConfig/getNews/getLive` и `trackEvent`.

## Out of scope
- Реальный счётчик подписчиков канала (нет API) — используем стабильный fake/derived из конфига.
- Отдельный route `/channel` через TanStack — таб внутри `index.tsx` сохраняет state ленты и быстрее; при желании добавим позже.