import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, Polyline, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./SaryarkaMap.css";
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

// Geographic coordinates in WGS84 (latitude, longitude), used by the actual map.
const COORDINATES = {
  kokshetau: [53.283, 69.383], burabay: [53.083, 70.314], shalkar: [53.183, 70.287],
  korgalzhyn: [50.425, 69.250], bayanaul: [50.793, 75.702], zhasybay: [50.781, 75.620],
  karkaraly: [49.412, 75.474], shaitankol: [49.399, 75.450], begazy: [48.548, 74.907], ulytau: [48.675, 66.916],
};

function typeFor(place) {
  if (place.type?.en?.toLowerCase().includes("lake")) return "lake";
  return place.category;
}

function pinIcon(type, color) {
  const glyph = type === "lake" ? "≈" : type === "history" || type === "archaeology" ? "⌂" : type === "quest" ? "★" : "❋";
  return L.divIcon({ className: "sq-map-icon", html: `<span style="background:${color}">${glyph}</span>`, iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -19] });
}

export default function SaryarkaMap({ initialSelected = null, height = "h-[570px] sm:h-[680px] lg:h-[780px]" }) {
  const { t, l } = useLang();
  const [filter, setFilter] = useState("all");
  const [showRoute, setShowRoute] = useState(true);
  const [selectedId, setSelectedId] = useState(initialSelected);
  const visible = useMemo(() => {
    if (filter === "all") return places;
    if (filter === "quest") return places.filter((place) => place.hasQuest);
    if (filter === "lake") return places.filter((place) => typeFor(place) === "lake");
    return places.filter((place) => place.category === filter);
  }, [filter]);
  const route = places.filter((place) => place.hasQuest).map((place) => COORDINATES[place.id]);
  const selected = places.find((place) => place.id === selectedId);

  return <div className={`relative overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-[#d7ddd0] shadow-[0_18px_50px_rgba(31,49,34,.16)] ${height}`}>
    <MapContainer center={[50.5, 71.5]} zoom={6.45} minZoom={6} maxZoom={10} scrollWheelZoom className="h-full w-full" maxBounds={[[46.4, 63.3], [54.4, 78.2]]}>
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles © Esri" />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.18} attribution="© OpenStreetMap contributors" />
      {showRoute && <><Polyline positions={route} pathOptions={{ color: "#5a4b1f", weight: 7, opacity: .65 }} /><Polyline positions={route} pathOptions={{ color: "#f2c238", weight: 4, opacity: 1 }} /></>}
      {visible.map((place) => { const type = typeFor(place); const color = FILTERS.find((item) => item.id === type)?.color || "#39844d"; return <Marker key={place.id} position={COORDINATES[place.id]} icon={pinIcon(type, color)} eventHandlers={{ click: () => setSelectedId(place.id) }}><Tooltip direction="top" offset={[0, -20]} opacity={.96}>{l(place.name)}</Tooltip><Popup><div className="sq-popup"><Photo id={place.id} alt="" className="h-24 w-full rounded-lg" /><p className="mt-3 text-xs font-bold text-[#4f7a3d]">{l(place.type)}</p><h3 className="mt-1 text-lg font-bold text-[#232b1e]">{l(place.name)}</h3><p className="mt-1 text-xs font-semibold text-[#4c5642]">{l(place.region)}</p><p className="mt-2 text-sm leading-relaxed text-[#4c5642]">{l(place.short)}</p><Link to={`/places/${place.id}`} className="mt-3 inline-block text-sm font-bold text-[#1f5765]">{t("read_more")} →</Link></div></Popup></Marker>; })}
    </MapContainer>
    <div className="pointer-events-none absolute inset-0 z-[400] bg-[linear-gradient(180deg,rgba(24,43,33,.24),transparent_22%,transparent_74%,rgba(24,43,33,.3))]" />
    <div className="pointer-events-none absolute right-4 top-4 z-[401] max-w-[calc(100%-2rem)] rounded-2xl bg-[rgba(22,45,40,.93)] px-4 py-3 text-white shadow-xl backdrop-blur sm:right-5 sm:top-5 sm:max-w-md"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--color-gold-light)]">Saryarka Quest</p><p className="mt-1 text-sm font-semibold sm:text-base">Сарыарқа физикалық-географиялық ауданының туристік маршруты</p></div>
    <aside className="absolute left-4 top-4 z-[401] hidden w-60 rounded-2xl bg-white/93 p-4 shadow-xl backdrop-blur lg:block"><p className="text-sm font-bold text-[var(--color-ink)]">Шартты белгілер</p><div className="mt-3 space-y-2.5">{FILTERS.slice(1).map((item) => <div key={item.id} className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink-soft)]"><span className="grid h-6 w-6 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: item.color }}>{item.id === "quest" ? "★" : "●"}</span>{item.label}</div>)}</div><div className="mt-4 border-t border-[var(--color-line)] pt-3"><button onClick={() => setShowRoute((value) => !value)} className="pointer-events-auto flex w-full items-center justify-between text-left text-xs font-semibold text-[var(--color-ink)]"><span>Маршрутты көрсету</span><span className={`relative h-5 w-9 rounded-full ${showRoute ? "bg-[var(--color-steppe)]" : "bg-[var(--color-line)]"}`}><span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${showRoute ? "translate-x-4" : ""}`} /></span></button></div></aside>
    <div className="absolute bottom-4 left-4 z-[401] flex max-w-[calc(100%-2rem)] flex-wrap gap-1.5 rounded-2xl bg-[rgba(22,45,40,.93)] p-2 shadow-xl backdrop-blur">{FILTERS.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${filter === item.id ? "bg-[var(--color-steppe)] text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>{t(item.key)}</button>)}</div>
    {selected && <div className="pointer-events-none absolute bottom-20 right-4 z-[401] hidden rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-[var(--color-ink)] shadow-md lg:block">{l(selected.name)}</div>}
  </div>;
}
