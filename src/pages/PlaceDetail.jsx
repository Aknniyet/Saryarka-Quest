import { useEffect } from "react";
import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { getPlace, placeQuestContext, placeReferences } from "../data/places";
import Illustration from "../components/Illustration";
import Photo from "../components/Photo";
import "../styles/pages/shared.css";
import "../styles/pages/details.css";

export default function PlaceDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { t, l } = useLang();
  const place = getPlace(id);
  const reference = placeReferences[id];
  const questContext = placeQuestContext[id];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  if (!place) return <Navigate to="/places" replace />;
  const cameFromMap = location.state?.from === "map";

  return (
    <div className="page-container page-container--wide">
      <Link to={cameFromMap ? "/map" : "/places"} className="back-link">
        {cameFromMap ? t("back_to_map") : t("back_to_list")}
      </Link>

      <div className="place-photo">
        <Photo id={place.id} alt={l(place.name)} />
      </div>

      <div className="place-header">
        <div>
          <h1 className="place-title">{l(place.name)}</h1>
          <p className="place-type">{l(place.type)}</p>
        </div>
      </div>

      <div className="place-layout">
        <div className="place-content">
          <p className="place-summary">{l(place.short)}</p>

          {reference && <div className="place-reference">
            <p>{reference.text}</p>
          </div>}

          {questContext && <p className="place-section__text place-section__text--context">
            {l(questContext)}
          </p>}

          <div>
            <h2 className="place-section__title">{t("history_section")}</h2>
            <p className="place-section__text">{l(place.history)}</p>
          </div>

          <div>
            <h2 className="place-section__title">{t("nature_section")}</h2>
            <p className="place-section__text">{l(place.nature)}</p>
          </div>

          <div>
            <h2 className="place-gallery-title">{t("photos")}</h2>
            <div className="place-gallery">
              {[0, 1, 2, 3].map((i) => (
                <Illustration key={i} seed={`${place.id}-${i}`} category={place.category} className="place-gallery-item" />
              ))}
            </div>
          </div>
        </div>

        <aside className="place-sidebar">
          <div className="info-card">
            <p className="info-card__label">{t("location")}</p>
            <p className="info-card__value info-card__value--location">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s6-5.12 6-11a6 6 0 1 0-12 0c0 5.88 6 11 6 11Z"/>
                <circle cx="12" cy="10" r="2"/>
              </svg>
              {l(place.region)}
            </p>
          </div>
          <div className="info-card">
            <p className="info-card__label">{t("object_type")}</p>
            <p className="info-card__value">{l(place.type)}</p>
          </div>
          <div className="info-card">
            <p className="mb-2 info-card__label">{t("facts")}</p>
            <ul className="fact-list">
              {l(place.facts).map((f, i) => (
                <li key={i} className="fact-list__item">
                  <span className="fact-list__mark">✦</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {reference && <section className="place-sources">
        <a href={reference.url} target="_blank" rel="noreferrer">
          {t("source")}: {reference.label} ↗
        </a>
      </section>}
    </div>
  );
}
