import { useParams, Link, Navigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { getAnimal } from "../data/animals";
import { getPlant } from "../data/plants";
import Photo from "../components/Photo";
import "../styles/pages/shared.css";
import "../styles/pages/details.css";

export default function NatureDetail() {
  const { type, id } = useParams();
  const { t, l } = useLang();
  const item = type === "animals" ? getAnimal(id) : getPlant(id);

  if (!item) return <Navigate to="/nature" replace />;
  const isAnimal = type === "animals";

  return (
    <div className="page-container page-container--narrow">
      <Link to="/nature" className="back-link">
        {t("back_to_list")}
      </Link>

      <div className="nature-detail-hero">
        <div className="nature-detail-copy">
          <p className="nature-detail-kind">{l(item.class)}</p>
          <h1 className="nature-detail-title">{l(item.name)}</h1>
          <p className="nature-detail-summary">{l(item.short)}</p>
        </div>

        <div className="nature-detail-photo">
          <Photo
            id={item.id}
            type={type}
            alt={l(item.name)}
          />
        </div>
      </div>

      <div className="detail-info-grid">
        <div className="info-card">
          <p className="info-card__label">{t("habitat")}</p>
          <p className="info-card__value">{l(item.habitat)}</p>
        </div>
        <div className="info-card">
          <p className="info-card__label">
            {isAnimal ? t("diet") : t("bloom_period")}
          </p>
          <p className="info-card__value">{isAnimal ? l(item.diet) : l(item.bloom)}</p>
        </div>
      </div>

      {!isAnimal && (
        <div className="mt-4 info-card">
          <p className="info-card__label">{t("conservation_status")}</p>
          <p className="info-card__value">{l(item.status)}</p>
        </div>
      )}

      <div className="detail-facts info-card">
        <p className="mb-2 info-card__label">{t("interesting_facts")}</p>
        <ul className="fact-list">
          {l(item.facts).map((f, i) => (
            <li key={i} className="fact-list__item">
              <span className="fact-list__mark">✦</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
