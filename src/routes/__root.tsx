import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="cr-wordmark text-7xl">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This drop doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="cr-cta inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold">
            Back to the Stream
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const showDetails =
    typeof window !== "undefined" &&
    (import.meta.env.DEV ||
      /lovable\.app|lovableproject\.com|localhost/.test(window.location.hostname));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Something tripped.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again — the reel will spin back up.</p>
        {showDetails && (
          <pre className="mt-4 max-h-48 overflow-auto rounded-lg border border-border bg-card p-3 text-left text-[11px] text-rose">
            {error?.message}
            {error?.stack ? "\n\n" + error.stack.split("\n").slice(0, 6).join("\n") : ""}
          </pre>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="cr-cta inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Cherry Rush — hot drops, first to know" },
      { name: "description", content: "Cherry Rush: a fast news + live-scores Telegram mini app. Informational only." },
      { name: "theme-color", content: "#120608" },
      { property: "og:title", content: "Cherry Rush — hot drops, first to know" },
      { property: "og:description", content: "Cherry Rush: a fast news + live-scores Telegram mini app. Informational only." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Cherry Rush — hot drops, first to know" },
      { name: "twitter:description", content: "Cherry Rush: a fast news + live-scores Telegram mini app. Informational only." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/419f3b03-6647-48e3-ba32-d5c7323132d5/id-preview-5f5bf63a--f173211c-2bfa-4d35-9de5-00f9e8b9bb3d.lovable.app-1780934806360.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/419f3b03-6647-48e3-ba32-d5c7323132d5/id-preview-5f5bf63a--f173211c-2bfa-4d35-9de5-00f9e8b9bb3d.lovable.app-1780934806360.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      { src: "https://telegram.org/js/telegram-web-app.js", async: true },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    try {
      const w = (window as any).Telegram?.WebApp;
      if (w) { w.ready?.(); w.expand?.(); }
    } catch {}
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
