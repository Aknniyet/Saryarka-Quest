import { useState } from "react";
import { useLang } from "../context/LangContext";
import { animals } from "../data/animals";
import { plants } from "../data/plants";
import NatureCard from "../components/NatureCard";
import "../styles/pages/shared.css";
import "../styles/pages/nature.css";

export default function Nature() {
  const { t } = useLang();
  const [tab, setTab] = useState("animals");

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
          onClick={() => setTab("animals")}
          className={`nature-tab ${tab === "animals" ? "nature-tab--active" : ""}`}
        >
          {t("animals")}
        </button>
        <button
          onClick={() => setTab("plants")}
          className={`nature-tab ${tab === "plants" ? "nature-tab--active" : ""}`}
        >
          {t("plants")}
        </button>
      </div>

      {tab === "animals" && (
        <section className="nature-feature">
          <div className="nature-feature__content">
            <span className="page-eyebrow mb-3">
              Жануарлар картасы
            </span>
            <h2 className="nature-feature__title">
              Сарыарқаның жануарлар әлемі
            </h2>
            <p className="nature-feature__text">
              Қорықтар мен далалы аймақтарда мекендейтін жануарларды бір картадан таныңыз.
            </p>
          </div>
          <div className="nature-feature__image-wrap">
            <img
              src="/saryarka-animals-map.png"
              alt="Сарыарқа аңдары картасы"
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
