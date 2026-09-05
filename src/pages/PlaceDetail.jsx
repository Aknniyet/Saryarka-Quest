import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { getPlace } from "../data/places";
import Illustration from "../components/Illustration";
import Photo from "../components/Photo";
import "../styles/pages/shared.css";
import "../styles/pages/details.css";

export default function PlaceDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { t, l } = useLang();
  const place = getPlace(id);

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
        {place.hasQuest && (
          <Link
            to="/quest"
            className="place-quest-link"
          >
            {t("pass_quest_place")}
          </Link>
        )}
      </div>

      <div className="place-layout">
        <div className="place-content">
          <p className="place-summary">{l(place.short)}</p>

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
            <p className="info-card__value">📍 {l(place.region)}</p>
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
    </div>
  );
}
