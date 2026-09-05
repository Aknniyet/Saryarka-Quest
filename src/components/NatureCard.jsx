import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Photo from "./Photo";
import "../styles/components/NatureCard.css";

export default function NatureCard({ item, type }) {
  const { l } = useLang();
  return (
    <Link to={`/nature/${type}/${item.id}`} className="nature-card">
      <Photo id={item.id} type={type} alt={l(item.name)} className="nature-card__image" />
      <div className="nature-card__caption">
        <h3 className="nature-card__title">{l(item.name)}</h3>
      </div>
    </Link>
  );
}
