import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Photo from "./Photo";
import "../styles/components/PlaceCard.css";

const CATEGORY_KEY = { nature: "filter_nature", history: "filter_history", archaeology: "filter_archaeology" };

export default function PlaceCard({ place }) {
  const { t, l } = useLang();
  return (
    <Link to={`/places/${place.id}`} className="place-card">
      <div className="place-card__image-wrap">
        <Photo id={place.id} alt={l(place.name)} className="place-card__image" />
        <span className="place-card__badge">{t(CATEGORY_KEY[place.category])}</span>
        {place.hasQuest && <span className="place-card__quest">✦ Quest</span>}
      </div>
      <div className="place-card__content">
        <h3 className="place-card__title">{l(place.name)}</h3>
        <p className="place-card__region"><span aria-hidden="true">⌾</span> {l(place.region)}</p>
        <p className="place-card__description line-clamp-2">{l(place.short)}</p>
        <span className="place-card__link">{t("read_more")}</span>
      </div>
    </Link>
  );
}
