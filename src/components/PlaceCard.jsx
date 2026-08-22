import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Photo from "./Photo";

const CATEGORY_KEY = { nature: "filter_nature", history: "filter_history", archaeology: "filter_archaeology" };

export default function PlaceCard({ place }) {
  const { t, l } = useLang();
  return (
    <Link to={`/places/${place.id}`} className="group overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-white shadow-[0_10px_30px_rgba(31,49,34,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(31,49,34,0.13)]">
      <div className="relative overflow-hidden">
        <Photo id={place.id} alt={l(place.name)} className="h-64 w-full transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-[var(--color-steppe)] px-3 py-1.5 text-xs font-bold text-white shadow-sm">{t(CATEGORY_KEY[place.category])}</span>
        {place.hasQuest && <span className="absolute right-4 top-4 rounded-full bg-[#F2BF3B] px-3 py-1.5 text-xs font-bold text-[var(--color-ink)] shadow-sm">✦ Quest</span>}
      </div>
      <div className="p-6">
        <h3 className="font-display text-[1.4rem] font-semibold tracking-tight text-[var(--color-ink)]">{l(place.name)}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]"><span aria-hidden="true">⌾</span>{l(place.region)}</p>
        <p className="mt-4 min-h-12 text-[15px] leading-relaxed text-[var(--color-ink-soft)] line-clamp-2">{l(place.short)}</p>
        <span className="mt-5 inline-block text-sm font-bold text-[var(--color-steppe)] group-hover:underline">{t("read_more")}</span>
      </div>
    </Link>
  );
}
