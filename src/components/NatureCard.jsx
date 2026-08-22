import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Photo from "./Photo";

export default function NatureCard({ item, type }) {
  const { l } = useLang();
  return (
    <Link to={`/nature/${type}/${item.id}`} className="group relative block h-72 overflow-hidden rounded-[1.75rem] bg-[var(--color-ink)] shadow-sm">
      <Photo id={item.id} type={type} alt={l(item.name)} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 pb-4 pt-12">
        <h3 className="font-display text-lg font-semibold text-white">{l(item.name)}</h3>
      </div>
    </Link>
  );
}
