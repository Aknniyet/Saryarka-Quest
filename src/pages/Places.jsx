import { useState, useMemo } from "react";
import { useLang } from "../context/LangContext";
import { places } from "../data/places";
import PlaceCard from "../components/PlaceCard";
import "../styles/pages/shared.css";
import "../styles/pages/places.css";

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
    <div className="page-container">
      <div className="page-intro">
        <span className="page-eyebrow">Place collection</span>
        <h1 className="page-heading mt-2">{t("places_title")}</h1>
        <p className="page-description">{t("places_subtitle")}</p>
      </div>

      <div className="place-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`place-filter ${
              filter === f.id
                ? "place-filter--active"
                : ""
            }`}
          >
            {t(f.key)}
          </button>
        ))}
      </div>

      <div className="places-grid">
        {filtered.map((p) => (
          <PlaceCard key={p.id} place={p} />
        ))}
      </div>
    </div>
  );
}
