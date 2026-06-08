import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { detectLang, setLang as persistLang } from "@/lib/i18n";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => { setLangState(detectLang()); }, []);
  const update = (l: Lang) => { persistLang(l); setLangState(l); };
  return [lang, update];
}

export function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const langs: Lang[] = ["en", "ru", "es"];
  return (
    <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-card/70 p-0.5 text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`rounded-full px-1.5 py-1 transition sm:px-2.5 ${
            lang === l ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
