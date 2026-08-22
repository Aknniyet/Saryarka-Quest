import { useState, useMemo } from "react";
import { useLang } from "../context/LangContext";
import { places } from "../data/places";
import PlaceCard from "../components/PlaceCard";

const FILTERS = [
  { id: "all", key: "filter_all" },
  { id: "nature", key: "filter_nature" },
  { id: "history", key: "filter_history" },
  { id: "archaeology", key: "filter_archaeology" },
];

export default function Places() {
  const { t } = useLang();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => (filter === "all" ? places : places.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-6">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-steppe)]">Place collection</span>
        <h1 className="page-heading mt-2">{t("places_title")}</h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">{t("places_subtitle")}</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? "border-[var(--color-steppe)] bg-[var(--color-steppe)] text-white"
                : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-steppe)]"
            }`}
          >
            {t(f.key)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <PlaceCard key={p.id} place={p} />
        ))}
      </div>
    </div>
  );
}
