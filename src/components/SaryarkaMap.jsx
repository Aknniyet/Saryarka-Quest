import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GeoJSON, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./SaryarkaMap.css";
import { useLang } from "../context/LangContext";
import { places } from "../data/places";
import Photo from "./Photo";

const FILTERS = [
  { id: "all", key: "filter_all", color: "#4f7a3d" },
  { id: "nature", key: "filter_natural_landscape", color: "#39844d" },
  { id: "history", key: "filter_historical_cultural", color: "#d47c24" },
];

export const COORDINATES = {
  kokshetau: [53.283, 69.383], burabay: [53.083, 70.314], shalkar: [53.183, 70.287],
  korgalzhyn: [50.425, 69.25], bayanaul: [50.793, 75.702], zhasybay: [50.781, 75.62],
  karkaraly: [49.412, 75.474], shaitankol: [49.399, 75.45], begazy: [48.548, 74.907], ulytau: [48.675, 66.916],
  zerendi: [52.906, 69.156], kobeituz: [51.7425, 73.5475], alzhir: [51.0782, 70.9723], "mashhur-jusup": [51.0145, 75.648],
  astana: [51.1694, 71.4491], karlag: [49.6778, 72.6819], shunak: [47.2083, 72.7597],
};

// The overview deliberately covers the entire country, so Saryarka is shown in
// its real central position instead of looking like a separate, cropped map.
export const KAZAKHSTAN_BOUNDS = [[40.45, 46.35], [55.55, 87.55]];
export const SARYARKA_AREA = {
  type: "Feature",
  properties: { name: "Сарыарқа / Saryarka" },
  geometry: {
    type: "Polygon",
    coordinates: [[
      // Контур соответствует области № 5 на учебной физико-географической карте:
      // Казахский мелкосопочник (Сарыарқа), а не административным областям.
      // Трассировка физико-географической зоны № 5 с предоставленной карты.
      [65.75, 53.75], [66.75, 53.7], [67.7, 53.78], [68.7, 53.72],
      [69.65, 53.82], [70.8, 53.62], [71.85, 53.48], [72.95, 53.42],
      [74.15, 53.3], [75.25, 53.15], [76.35, 52.92], [77.45, 52.58],
      [78.25, 52.15], [79.05, 51.9], [79.8, 51.58], [80.55, 51.12],
      [80.95, 50.4], [80.62, 49.85], [80.22, 49.2], [79.25, 48.82],
      [78.25, 48.42], [77.28, 48.05], [76.48, 47.55], [75.5, 47.12],
      [74.38, 46.88], [73.25, 46.76], [72.12, 46.76], [71.2, 46.88],
      [70.3, 46.76], [69.25, 46.95], [68.4, 46.82], [67.68, 47.15],
      [66.9, 47.45], [66.23, 48.02], [65.72, 48.56], [65.12, 48.88],
      [65.08, 49.42], [65.45, 49.78], [65.72, 50.12], [65.63, 50.62],
      [65.82, 51.08], [65.74, 51.62], [65.88, 52.15], [65.72, 52.7],
      [65.84, 53.12], [65.75, 53.75],
    ]],
  },
};
export const REGIONS_GEOJSON_URL = "/kazakhstan-regions.geojson";
export const COUNTRY_BORDER_GEOJSON_URL = "/kazakhstan-border.geojson";

// Порядок точек образовательного маршрута с запада на восток.
const ROUTE_IDS = [
  "ulytau", "shunak", "karlag", "karkaraly", "shaitankol", "begazy",
  "alzhir", "astana", "korgalzhyn", "burabay", "shalkar", "kokshetau",
  "zerendi", "bayanaul", "zhasybay", "kobeituz", "mashhur-jusup",
];

// Additional landmarks shown on the map. They are kept separate from the long-form place cards.
const MAP_LANDMARKS = [
  { id: "zerendi", category: "nature", coords: [52.906, 69.156], name: { kz: "\u0417\u0435\u0440\u0435\u043d\u0434\u0456", ru: "\u0417\u0435\u0440\u0435\u043d\u0434\u0430", en: "Zerendi" }, type: { kz: "\u0422\u0430\u0431\u0438\u0493\u0438 \u043d\u044b\u0441\u0430\u043d", ru: "\u041f\u0440\u0438\u0440\u043e\u0434\u043d\u044b\u0439 \u043e\u0431\u044a\u0435\u043a\u0442", en: "Natural site" } },
  { id: "kobeituz", category: "lake", coords: [51.7425, 73.5475], name: { kz: "\u041a\u04e9\u0431\u0435\u0439\u0442\u04b1\u0437 \u043a\u04e9\u043b\u0456", ru: "\u041e\u0437\u0435\u0440\u043e \u041a\u043e\u0431\u0435\u0439\u0442\u0443\u0437", en: "Lake Kobeituz" }, type: { kz: "\u041a\u04e9\u043b", ru: "\u041e\u0437\u0435\u0440\u043e", en: "Lake" } },
  { id: "alzhir", category: "history", coords: [51.0782, 70.9723], name: { kz: "\u0410\u041b\u0416\u0418\u0420 \u043c\u0443\u0437\u0435\u0439\u0456", ru: "\u041c\u0443\u0437\u0435\u0439 \u0410\u041b\u0416\u0418\u0420", en: "ALZHIR Museum" }, type: { kz: "\u0422\u0430\u0440\u0438\u0445\u0438 \u043d\u044b\u0441\u0430\u043d", ru: "\u0418\u0441\u0442\u043e\u0440\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043e\u0431\u044a\u0435\u043a\u0442", en: "Historical site" } },
  { id: "mashhur-jusup", category: "history", coords: [51.0145, 75.648], name: { kz: "\u041c\u04d9\u0448\u04bb\u04af\u0440 \u0416\u04af\u0441\u0456\u043f \u041a\u04e9\u043f\u0435\u0439\u04b1\u043b\u044b \u043a\u0435\u0441\u0435\u043d\u0435\u0441\u0456", ru: "\u041c\u0430\u0432\u0437\u043e\u043b\u0435\u0439 \u041c\u0430\u0448\u0445\u0443\u0440\u0430 \u0416\u0443\u0441\u0443\u043f\u0430", en: "Mashhur Zhusup Mausoleum" }, type: { kz: "\u0422\u0430\u0440\u0438\u0445\u0438 \u043d\u044b\u0441\u0430\u043d", ru: "\u0418\u0441\u0442\u043e\u0440\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043e\u0431\u044a\u0435\u043a\u0442", en: "Historical site" } },
  { id: "astana", category: "history", coords: [51.1694, 71.4491], name: { kz: "\u0410\u0441\u0442\u0430\u043d\u0430", ru: "\u0410\u0441\u0442\u0430\u043d\u0430", en: "Astana" }, type: { kz: "\u049a\u0430\u043b\u0430", ru: "\u0413\u043e\u0440\u043e\u0434", en: "City" } },
  { id: "karlag", category: "history", coords: [49.6778, 72.6819], name: { kz: "\u041a\u0430\u0440\u041b\u0410\u0413 \u043c\u0443\u0437\u0435\u0439\u0456", ru: "\u041c\u0443\u0437\u0435\u0439 \u041a\u0430\u0440\u041b\u0410\u0413", en: "KarLag Museum" }, type: { kz: "\u0422\u0430\u0440\u0438\u0445\u0438 \u043d\u044b\u0441\u0430\u043d", ru: "\u0418\u0441\u0442\u043e\u0440\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043e\u0431\u044a\u0435\u043a\u0442", en: "Historical site" } },
  { id: "shunak", category: "archaeology", coords: [47.2083, 72.7597], name: { kz: "\u0428\u04b1\u043d\u0430\u049b \u043c\u0435\u0442\u0435\u043e\u0440\u0438\u0442 \u043a\u0440\u0430\u0442\u0435\u0440\u0456", ru: "\u041c\u0435\u0442\u0435\u043e\u0440\u0438\u0442\u043d\u044b\u0439 \u043a\u0440\u0430\u0442\u0435\u0440 \u0428\u0443\u043d\u0430\u043a", en: "Shunak impact crater" }, type: { kz: "\u0413\u0435\u043e\u043b\u043e\u0433\u0438\u044f\u043b\u044b\u049b \u043d\u044b\u0441\u0430\u043d", ru: "\u0413\u0435\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043e\u0431\u044a\u0435\u043a\u0442", en: "Geological site" } },
];

function typeFor(place) {
  return place.category;
}

function markerGlyph(type) {
  return type === "history" ? "◆" : "●";
}

function pinIcon(type, color) {
  const glyph = markerGlyph(type);
  return L.divIcon({
    className: "sq-map-icon",
    html: `<span class="sq-map-pin sq-map-pin--${type}" style="background:${color}">${glyph}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
}

function MapZoomControl() {
  const map = useMap();

  useEffect(() => {
    map.zoomControl?.remove();
    const control = L.control.zoom({ position: "bottomright" });
    control.addTo(map);
    return () => control.remove();
  }, [map]);

  return null;
}

function MapInteraction({ fullscreen }) {
  const map = useMap();

  useEffect(() => {
    if (fullscreen) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(timer);
  }, [fullscreen, map]);

  return null;
}

function KazakhstanOverview() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => map.fitBounds(KAZAKHSTAN_BOUNDS, { padding: [18, 18] }), 100);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

export default function SaryarkaMap({ initialSelected = null, height = "h-[460px] sm:h-[680px] lg:h-[780px]" }) {
  const { t, l } = useLang();
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(initialSelected);
  const [fullscreen, setFullscreen] = useState(false);
  const [regions, setRegions] = useState(null);
  const [countryBorder, setCountryBorder] = useState(null);
  const mapShellRef = useRef(null);
  const mapLocations = useMemo(() => places, []);

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === mapShellRef.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([fetch(REGIONS_GEOJSON_URL), fetch(COUNTRY_BORDER_GEOJSON_URL)])
      .then(async ([regionsResponse, borderResponse]) => [
        regionsResponse.ok ? await regionsResponse.json() : null,
        borderResponse.ok ? await borderResponse.json() : null,
      ])
      .then(([regionsData, borderData]) => {
        if (!active) return;
        setRegions(regionsData);
        setCountryBorder(borderData);
      })
      .catch(() => { /* The basemap remains usable if a visitor is offline. */ });
    return () => { active = false; };
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await mapShellRef.current?.requestFullscreen?.();
  };

  const visible = useMemo(() => {
    if (filter === "all") return mapLocations;
    return mapLocations.filter((place) => place.category === filter);
  }, [filter, mapLocations]);

  const selected = mapLocations.find((place) => place.id === selectedId);
  const routePositions = ROUTE_IDS.map((id) => COORDINATES[id]).filter(Boolean);

  return (
    <div ref={mapShellRef} className={`sq-map-shell relative isolate z-0 overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-[#d7ddd0] shadow-[0_18px_50px_rgba(31,49,34,.16)] ${height}`}>
      <MapContainer center={[48.2, 68.5]} zoom={5} minZoom={4.5} maxZoom={10} scrollWheelZoom={false} zoomControl={false} className="h-full w-full" maxBounds={[[38.8, 43.5], [57.2, 90.4]]}>
        <MapZoomControl />
        <MapInteraction fullscreen={fullscreen} />
        <KazakhstanOverview />
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
        {regions && <GeoJSON data={regions} style={{ color: "#ffffff", weight: 1.15, opacity: 0.92, fillColor: "#203229", fillOpacity: 0.06 }} interactive={false} />}
        {countryBorder && <GeoJSON data={countryBorder} style={{ color: "#f6d671", weight: 3, opacity: 1, fillOpacity: 0 }} interactive={false} />}
        <GeoJSON data={SARYARKA_AREA} style={{ color: "#d9a63d", weight: 3, opacity: 1, fillColor: "#d9a63d", fillOpacity: 0.16, smoothFactor: 0, lineCap: "butt", lineJoin: "miter" }} interactive={false} />
        <Polyline positions={routePositions} pathOptions={{ color: "#d6a339", weight: 4, opacity: 0.85, dashArray: "9 9" }} interactive={false} />
        {visible.map((place) => {
          const type = typeFor(place);
          const color = FILTERS.find((item) => item.id === type)?.color || "#39844d";
          const position = COORDINATES[place.id] || place.coords;
          return <Marker key={place.id} position={position} icon={pinIcon(type, color)} eventHandlers={{ click: () => setSelectedId(place.id) }}>
            <Tooltip direction="top" offset={[0, -20]} opacity={0.96}>{l(place.name)}</Tooltip>
            <Popup><div className="sq-popup"><Photo id={place.id} alt="" className="h-24 w-full rounded-lg" /><p className="mt-3 text-xs font-bold text-[#4f7a3d]">{l(place.type)}</p><h3 className="mt-1 text-lg font-bold text-[#232b1e]">{l(place.name)}</h3><p className="mt-1 text-xs font-semibold text-[#4c5642]">{l(place.region)}</p><p className="mt-2 text-sm leading-relaxed text-[#4c5642]">{l(place.short)}</p><Link to={`/places/${place.id}`} state={{ from: "map" }} className="mt-3 inline-block text-sm font-bold text-[#1f5765]">{t("read_more")}</Link></div></Popup>
          </Marker>;
        })}
      </MapContainer>

      <div className="pointer-events-none absolute right-4 top-4 z-[401] max-w-[calc(100%-2rem)] rounded-2xl bg-[rgba(22,45,40,.93)] px-4 py-3 text-white shadow-xl backdrop-blur sm:right-5 sm:top-5 sm:max-w-md"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--color-gold-light)]">GeoSaryArqa</p><p className="mt-1 text-sm font-semibold sm:text-base">{t("map_subtitle")}</p></div>

      <aside className="absolute left-4 top-4 z-[401] hidden w-64 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur lg:block">
        <p className="text-sm font-bold text-[var(--color-ink)]">{t("legend_title")}</p>
        <div className="mt-3 space-y-1">
          {FILTERS.map((item) => <button key={item.id} onClick={() => setFilter(item.id === "all" ? "all" : filter === item.id ? "all" : item.id)} className={`sq-legend-button ${filter === item.id ? "sq-legend-button--active" : ""}`}><span className="sq-legend-symbol" style={{ backgroundColor: item.color }}>{markerGlyph(item.id)}</span>{t(item.key)}</button>)}
        </div>
      </aside>

      <button type="button" onClick={toggleFullscreen} className="sq-map-fullscreen-button" aria-label={fullscreen ? "Exit full screen" : "Open map in full screen"} title={fullscreen ? "Exit full screen" : "Full screen map"}>
        {fullscreen ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4m11-5v5h5M9 20v-5H4m16 5v-5h-5" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" /></svg>}
      </button>

      {selected && <div className="pointer-events-none absolute bottom-6 right-4 z-[401] hidden rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-[var(--color-ink)] shadow-md lg:block">{l(selected.name)}</div>}
    </div>
  );
}
