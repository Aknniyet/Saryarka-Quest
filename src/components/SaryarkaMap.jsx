import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { places } from "../data/places";
import Photo from "./Photo";

const FILTERS = [
  { id: "all", key: "filter_all", color: "#4f7a3d", label: "Барлығы" },
  { id: "nature", key: "filter_nature", color: "#39844d", label: "Табиғат" },
  { id: "lake", key: "legend_lakes", color: "#2789b5", label: "Көлдер" },
  { id: "history", key: "filter_history", color: "#d47c24", label: "Тарих" },
  { id: "archaeology", key: "filter_archaeology", color: "#7552a4", label: "Археология" },
  { id: "quest", key: "filter_quest", color: "#d6a339", label: "Quest" },
];

function typeFor(place) {
  if (place.type?.en?.toLowerCase().includes("lake")) return "lake";
  return place.category;
}

function MarkerGlyph({ type }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "h-5 w-5" };
  if (type === "lake") return <svg {...common}><path d="M3 15c2.4 1.8 4.8 1.8 7.2 0s4.8-1.8 7.2 0 4.2 1.8 5.4 0" /><path d="M4 10c2.2 1.5 4.5 1.5 6.7 0s4.5-1.5 6.7 0 4.1 1.5 5.2 0" /></svg>;
  if (type === "history" || type === "archaeology") return <svg {...common}><path d="M4 20h16M6 17h12M7 17V9h10v8M5 9h14L12 4Z" /></svg>;
  if (type === "quest") return <svg {...common}><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" /></svg>;
  return <svg {...common}><path d="M20 4C11 4 5 8.5 5 16c0 2.2 1.8 4 4 4 7.5 0 11-6.2 11-16Z" /><path d="M4 20c3-4 6-6 11-9" /></svg>;
}

export default function SaryarkaMap({ initialSelected = null, height = "h-[560px] sm:h-[660px] lg:h-[760px]" }) {
  const { t, l } = useLang();
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(initialSelected);
  const [showRoute, setShowRoute] = useState(true);
  const selected = places.find((place) => place.id === selectedId);
  const visible = useMemo(() => {
    if (filter === "all") return places;
    if (filter === "quest") return places.filter((place) => place.hasQuest);
    if (filter === "lake") return places.filter((place) => typeFor(place) === "lake");
    return places.filter((place) => place.category === filter);
  }, [filter]);
  const route = places.filter((place) => place.hasQuest).map((place) => place.coords);

  return <div className={`relative overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-[#e7ead9] shadow-[0_18px_50px_rgba(31,49,34,.15)] ${height}`}>
    <img src="/saryarka-map-atlas.png" alt="Topographic map of Saryarka" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.05),rgba(18,39,28,.08))]" />
    <div className="absolute left-4 top-4 z-20 max-w-[calc(100%-2rem)] rounded-2xl bg-[rgba(24,48,43,.92)] px-4 py-3 text-white shadow-lg backdrop-blur sm:left-auto sm:right-5 sm:top-5 sm:max-w-md">
      <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M12 21s7-6.2 7-12A7 7 0 1 0 5 9c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2" /></svg></span><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--color-gold-light)]">Saryarka Quest</p><p className="mt-0.5 text-sm font-semibold sm:text-base">Сарыарқа физикалық-географиялық ауданының туристік маршруты</p></div></div>
    </div>
    <div className="absolute left-4 top-24 z-20 hidden w-56 rounded-2xl bg-white/92 p-4 shadow-lg backdrop-blur lg:block"><p className="text-sm font-bold text-[var(--color-ink)]">Шартты белгілер</p><div className="mt-3 space-y-2.5">{FILTERS.slice(1).map((item) => <div key={item.id} className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink-soft)]"><span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ backgroundColor: item.color }}><MarkerGlyph type={item.id} /></span>{item.label}</div>)}</div><div className="mt-4 border-t border-[var(--color-line)] pt-3"><button onClick={() => setShowRoute((value) => !value)} className="flex w-full items-center justify-between text-left text-xs font-semibold text-[var(--color-ink)]"><span>Маршрутты көрсету</span><span className={`relative h-5 w-9 rounded-full transition ${showRoute ? "bg-[var(--color-steppe)]" : "bg-[var(--color-line)]"}`}><span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${showRoute ? "translate-x-4" : ""}`} /></span></button></div></div>
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{showRoute && <><polyline points={route.map((point) => point.join(",")).join(" ")} fill="none" stroke="rgba(74,61,25,.55)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /><polyline points={route.map((point) => point.join(",")).join(" ")} fill="none" stroke="#edbd33" strokeWidth=".55" strokeLinecap="round" strokeLinejoin="round" />{route.map((point, index) => <circle key={index} cx={point[0]} cy={point[1]} r=".85" fill="#edbd33" stroke="white" strokeWidth=".35" />)}</>}</svg>
    {visible.map((place) => { const type = typeFor(place); const color = FILTERS.find((item) => item.id === type)?.color || "#39844d"; return <button key={place.id} onClick={() => setSelectedId(place.id)} style={{ left: `${place.coords[0]}%`, top: `${place.coords[1]}%`, backgroundColor: color }} className="group absolute z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-white text-white shadow-[0_3px_10px_rgba(0,0,0,.35)] transition hover:scale-110 focus:scale-110" aria-label={l(place.name)}><MarkerGlyph type={type} /><span className="pointer-events-none absolute left-1/2 top-12 w-max max-w-40 -translate-x-1/2 rounded-md bg-white/85 px-2 py-1 text-center text-[11px] font-bold leading-tight text-[var(--color-ink)] opacity-0 shadow-sm transition group-hover:opacity-100 group-focus:opacity-100 sm:opacity-100">{l(place.name)}</span></button>; })}
    {selected && <div className="absolute bottom-4 left-1/2 z-30 w-[min(25rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,.28)] sm:bottom-6 sm:p-5"><button onClick={() => setSelectedId(null)} className="absolute right-3 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white text-xl leading-none text-[var(--color-ink-soft)]" aria-label={t("close")}>×</button><div className="flex gap-4"><Photo id={selected.id} alt="" className="h-20 w-24 shrink-0 rounded-xl" /><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--color-steppe)]">{l(selected.type)}</p><h3 className="mt-1 font-display text-xl font-semibold text-[var(--color-ink)]">{l(selected.name)}</h3><p className="mt-1 text-xs font-semibold text-[var(--color-ink-soft)]">{l(selected.region)}</p></div></div><p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)] line-clamp-2">{l(selected.short)}</p><Link to={`/places/${selected.id}`} className="mt-3 inline-block text-sm font-bold text-[var(--color-lake)] hover:underline">{t("read_more")} →</Link></div>}
    <div className="absolute bottom-4 left-4 z-20 flex max-w-[calc(100%-2rem)] flex-wrap gap-1.5 rounded-2xl bg-[rgba(24,48,43,.92)] p-2 shadow-lg backdrop-blur lg:bottom-5">{FILTERS.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${filter === item.id ? "bg-[var(--color-steppe)] text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>{t(item.key)}</button>)}</div>
  </div>;
}
