## Проблема

В Telegram (особенно в встроенном WebView) приложение падает в корневой error boundary (`__root.tsx` → `ErrorComponent` → «Something tripped»). В обычном браузере всё рендерится. Значит, ошибка происходит на клиенте после гидрации, и почти наверняка — в коде, который специфично выполняется в Telegram-окружении.

В логах воркера ошибок от приложения нет (только устаревший `_worker_bundle.json` 404 для preview-SHA, не относится к делу). На опубликованном `cherry-kiss.lovable.app/` сам HTML отдаётся 200 — значит SSR живой, падает именно клиент.

## Наиболее вероятные причины

1. **Telegram WebApp скрипт грузится `async`** → в момент `useEffect` в `__root.tsx` он ещё может быть не готов; это безопасно (try/catch). Но в `RootComponent` мы дергаем `w.expand()` — в десктоп-клиенте Telegram некоторые методы кидают исключение. Сейчас всё в try/catch, ОК.
2. **`detectLang()` / `useLang`** — обращается к `window.Telegram.WebApp.initDataUnsafe.user.language_code`. В Telegram Desktop это объект, но `language_code` может быть `undefined`; код устойчив. Это не источник.
3. **`/api/event` отдаёт 404** на preview-домене (видно в логах). Сам `trackEvent` использует `keepalive: true` и `.catch(()=>{})` — fetch-промис не падает. Но если в каком-то месте мы вызываем `trackEvent` в `useEffect` несколько раз и ловим `TypeError` — это вылетит. Маловероятно.
4. **Главный подозреваемый**: `bgArt` фон-картинка `position: fixed; zIndex: -10` поверх Telegram WebView. В Telegram in-app браузере `<img>` с `zIndex: -10` может не рендериться, но это не падение. Это не источник.
5. **Реальный подозреваемый**: где-то на маршруте `/` мы делаем синхронный доступ к `window` / `document` без `typeof window` гарда, и при первом рендере React 19 + TanStack SSR прокидывает Suspense, который из-за этого падает уже на клиенте. Конкретно — `useMemo(() => getUid(), [])` вычисляется на SSR (uid = null), затем у нас `useQuery({ queryKey: ["membership", uid] })` с `enabled: true` всегда вызывает `getMembership(null)`, который возвращает `null` — ОК. Но `prevMemberRef.current` инициализирован `false`, `isMember` тоже `false` → ОК.
6. **Самый вероятный реальный источник**: `ErrorComponent` сам что-то репортит через `reportLovableError`, а само приложение возможно роняет какой-то компонент из-за `t(lang, key)` где `key` отсутствует в словаре — но мы только что проверили, все ключи на месте.

Без console-логов из Telegram точно сказать нельзя. Поэтому план — добавить диагностику и одновременно усилить устойчивость в подозрительных местах.

## Что сделаю

### 1. Показать настоящую ошибку в error boundary (dev/preview only)
В `src/routes/__root.tsx` → `ErrorComponent`: при `import.meta.env.DEV` или на хосте `*-dev.lovable.app` / `id-preview--*` показывать `error.message` и первые 5 строк `error.stack` в `<pre>` под текстом «Something tripped». В проде — оставить как есть. Это сразу скажет, что именно падает в Telegram.

### 2. Глобальный перехват `window.onerror` и `unhandledrejection` на клиенте
В `RootComponent` (`__root.tsx`) добавить слушатели, которые шлют `trackEvent("cta_view", { surface: "client_error", message, stack })` через уже существующий `/api/event` (даже если 404 — попадёт в network log). Это даст серверный след даже когда у пользователя нет devtools (внутри Telegram).

### 3. Защитить рендер от падений вложенных секций
Обернуть содержимое `StreamPage` (`src/routes/index.tsx`) в локальный `<SectionErrorBoundary>` (новый компонент, простой class component) — тогда корневой error boundary не съест всю страницу, и пользователь увидит хотя бы Header + Filter + сообщение об ошибке в зоне ленты с кнопкой Retry. Это страховка от любых будущих регрессий.

### 4. Подчистить точки риска в Telegram
- В `__root.tsx` `RootComponent`: убедиться, что `Telegram.WebApp.ready/expand` вызывается ПОСЛЕ `script load` — добавить fallback на `setTimeout(..., 300)` если объекта ещё нет.
- В `src/lib/telegram.ts` `openChannel`: при отсутствии `Telegram.WebApp.openTelegramLink` и при `typeof window === "undefined"` — no-op (сейчас ок, но добавим явный гард).
- В `src/components/Onboarding.tsx`: `localStorage` уже в try/catch, оставляем; убедиться, что нет других неосторожных обращений к `window`.

### 5. Проверить и пофиксить /api/event 404
В логах preview-домена `/api/event` стабильно 404. Это значит трекинг не работает — но что важнее, на проде (`cherry-kiss.lovable.app`) `API_BASE` пустой → fetch уходит на тот же домен, и если там тоже 404, мы теряем диагностику. План: подтвердить, что бэкенд отдаёт `/api/event` на проде; если нет — сделать `trackEvent` no-op при двух последовательных 404 (без повторных попыток), чтобы исключить любые побочные эффекты.

## После раскатки
Пользователь снова открывает мини-приложение в Telegram. Если ошибка повторится — мы увидим:
- (a) точный `error.message`/`stack` прямо в UI (на dev/preview),
- (b) запись в network log на /api/event с полем `surface: "client_error"`,
- (c) ленту, защищённую локальным boundary, чтобы шапка/фильтры остались живыми.

Дальше точечно фиксим то, что выявит диагностика.

## Файлы

- edit `src/routes/__root.tsx` — расширенный ErrorComponent + глобальные window listeners
- edit `src/routes/index.tsx` — обернуть `renderStream()` в локальный error boundary
- new `src/components/SectionErrorBoundary.tsx`
- edit `src/lib/funnel.ts` — авто-отключение `trackEvent` после повторных 404
- edit `src/lib/telegram.ts` — мелкий guard в `openChannel`

Никаких backend изменений.
