import { useParams, Link, Navigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { getAnimal } from "../data/animals";
import { getPlant } from "../data/plants";
import Photo from "../components/Photo";

export default function NatureDetail() {
  const { type, id } = useParams();
  const { t, l } = useLang();
  const item = type === "animals" ? getAnimal(id) : getPlant(id);

  if (!item) return <Navigate to="/nature" replace />;
  const isAnimal = type === "animals";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <Link to="/nature" className="mb-6 inline-block text-sm font-medium text-[var(--color-steppe-deep)] hover:underline">
        {t("back_to_list")}
      </Link>

      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,.8fr)]">
        <div className="order-2 md:order-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-steppe-deep)]">{l(item.class)}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[var(--color-ink)]">{l(item.name)}</h1>
          <p className="mt-3 text-lg leading-relaxed text-[var(--color-ink-soft)]">{l(item.short)}</p>
        </div>

        <div className="order-1 w-fit max-w-full justify-self-center overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[#edf0e8] shadow-sm md:order-2">
          <Photo
            id={item.id}
            type={type}
            alt={l(item.name)}
            className="h-56 !w-auto max-w-full !object-contain sm:h-64"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{t("habitat")}</p>
          <p className="mt-1 text-sm text-[var(--color-ink)]">{l(item.habitat)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
            {isAnimal ? t("diet") : t("bloom_period")}
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink)]">{isAnimal ? l(item.diet) : l(item.bloom)}</p>
        </div>
      </div>

      {!isAnimal && (
        <div className="mt-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{t("conservation_status")}</p>
          <p className="mt-1 text-sm text-[var(--color-ink)]">{l(item.status)}</p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">{t("interesting_facts")}</p>
        <ul className="space-y-1.5 text-sm text-[var(--color-ink)]">
          {l(item.facts).map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--color-steppe)]">✦</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
