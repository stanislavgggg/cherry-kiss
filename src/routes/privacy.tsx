import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Cherry Rush" },
      { name: "description", content: "Cherry Rush privacy notice." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[480px] px-5 py-8 text-foreground">
      <Link to="/" className="text-sm text-muted-foreground">← Back</Link>
      <h1 className="cr-wordmark mt-4 text-4xl">Privacy</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Cherry Rush is an informational news + live scores mini app. We process the minimum data
        needed to operate: your Telegram user id (to check channel membership and personalize the
        feed) and anonymous analytics events (which surface you tapped). We do not sell your data.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Content is for information only. It is not financial or betting advice.
      </p>
      <p className="mt-6 text-xs text-rose">18+ · Informational only. Not financial or betting advice.</p>
    </main>
  );
}
