import { useState } from "react";
import { useLang } from "../context/LangContext";
import { animals } from "../data/animals";
import { plants } from "../data/plants";
import NatureCard from "../components/NatureCard";

export default function Nature() {
  const { t } = useLang();
  const [tab, setTab] = useState("animals");

  const list = tab === "animals" ? animals : plants;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-6">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-steppe)]">Flora & fauna</span>
        <h1 className="page-heading mt-2">{t("nature_title")}</h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">{t("nature_subtitle")}</p>
      </div>

      <div className="mb-8 inline-flex rounded-full border border-[var(--color-line)] bg-white p-1">
        <button
          onClick={() => setTab("animals")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "animals" ? "bg-[var(--color-steppe)] text-white" : "text-[var(--color-ink-soft)]"
          }`}
        >
          🦌 {t("animals")}
        </button>
        <button
          onClick={() => setTab("plants")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "plants" ? "bg-[var(--color-steppe)] text-white" : "text-[var(--color-ink-soft)]"
          }`}
        >
          🌿 {t("plants")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((item) => (
          <NatureCard key={item.id} item={item} type={tab} />
        ))}
      </div>
    </div>
  );
}
