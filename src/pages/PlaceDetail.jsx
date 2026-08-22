import { useParams, Link, Navigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { getPlace } from "../data/places";
import Illustration from "../components/Illustration";
import Photo from "../components/Photo";

export default function PlaceDetail() {
  const { id } = useParams();
  const { t, l } = useLang();
  const place = getPlace(id);

  if (!place) return <Navigate to="/places" replace />;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
      <Link to="/map" className="mb-6 inline-block text-sm font-medium text-[var(--color-steppe-deep)] hover:underline">
        {t("back_to_map")}
      </Link>

      <div className="overflow-hidden rounded-3xl border border-[var(--color-line)] shadow-sm">
        <Photo id={place.id} alt={l(place.name)} className="h-56 w-full sm:h-72" />
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">{l(place.name)}</h1>
          <p className="mt-1 text-[var(--color-ink-soft)]">{l(place.type)}</p>
        </div>
        {place.hasQuest && (
          <Link
            to="/quest"
            className="rounded-full bg-[var(--color-steppe)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {t("pass_quest_place")}
          </Link>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <p className="text-lg leading-relaxed text-[var(--color-ink-soft)]">{l(place.short)}</p>

          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">{t("history_section")}</h2>
            <p className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">{l(place.history)}</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">{t("nature_section")}</h2>
            <p className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">{l(place.nature)}</p>
          </div>

          <div>
            <h2 className="mb-3 font-display text-xl font-semibold text-[var(--color-ink)]">{t("photos")}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Illustration key={i} seed={`${place.id}-${i}`} category={place.category} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{t("location")}</p>
            <p className="mt-1 text-sm text-[var(--color-ink)]">📍 {l(place.region)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{t("object_type")}</p>
            <p className="mt-1 text-sm text-[var(--color-ink)]">{l(place.type)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{t("facts")}</p>
            <ul className="space-y-1.5 text-sm text-[var(--color-ink)]">
              {l(place.facts).map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--color-steppe)]">✦</span>
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
