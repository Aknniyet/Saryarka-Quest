import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { animals } from "../data/animals";
import { plants } from "../data/plants";
import NatureCard from "../components/NatureCard";
import "../styles/pages/shared.css";
import "../styles/pages/nature.css";

export default function Nature() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "plants" ? "plants" : "animals");

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setSearchParams({ tab: nextTab }, { replace: true });
  };

  const list = tab === "animals" ? animals : plants;

  return (
    <div className="page-container">
      <div className="page-intro">
        <span className="page-eyebrow">Flora & fauna</span>
        <h1 className="page-heading mt-2">{t("nature_title")}</h1>
        <p className="page-description">{t("nature_subtitle")}</p>
      </div>

      <div className="nature-tabs">
        <button
          onClick={() => changeTab("animals")}
          className={`nature-tab ${tab === "animals" ? "nature-tab--active" : ""}`}
        >
          {t("animals")}
        </button>
        <button
          onClick={() => changeTab("plants")}
          className={`nature-tab ${tab === "plants" ? "nature-tab--active" : ""}`}
        >
          {t("plants")}
        </button>
      </div>

      {tab === "animals" && (
        <section className="nature-feature">
          <div className="nature-feature__content">
            <span className="page-eyebrow mb-3">
              {t("animals_map_eyebrow")}
            </span>
            <h2 className="nature-feature__title">
              {t("animals_map_title")}
            </h2>
            <p className="nature-feature__text">
              {t("animals_map_text")}
            </p>
          </div>
          <div className="nature-feature__image-wrap">
            <img
              src="/saryarka-animals-map.webp"
              alt={t("animals_map_alt")}
              className="nature-feature__image"
            />
          </div>
        </section>
      )}

      <div className="nature-grid">
        {list.map((item) => (
          <NatureCard key={item.id} item={item} type={tab} />
        ))}
      </div>
    </div>
  );
}
