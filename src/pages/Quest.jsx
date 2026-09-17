import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLang } from "../context/LangContext";
import { mapPlaces, matchingPairs, questSteps } from "../data/quest";
import { getPlace } from "../data/places";
import { COUNTRY_BORDER_GEOJSON_URL, KAZAKHSTAN_BOUNDS, REGIONS_GEOJSON_URL, SARYARKA_AREA } from "../components/SaryarkaMap";
import Illustration from "../components/Illustration";
import "../styles/pages/quest.css";

const TOTAL_POINTS = 20;
const TOTAL_TASKS = 12;
const STORAGE_KEY = "sq_quest_progress_v4";
const PROGRESS_LIFETIME_MS = 30 * 60 * 1000;
const VIDEO_DURATION_MS = 5000;
const certificateArtwork = "/certificate-side-illustration.webp";
const certificateLogo = "/geosaryarqa-logo.webp";
const copy = {
  ru: { video: "Видеовопрос", test: "Тест", match: "Сопоставление", map: "Карта Сарыарки", mapTitle: "Перетащите названия мест на точки карты", mapHint: "Можно перетащить карточку или нажать на неё, а затем на точку.", checkMap: "Проверить карту", complete: "Завершить квест", certificate: "Получить сертификат", retry: "Пройти заново", below: "Для сертификата нужно набрать минимум 15 баллов.", score: "Ваш результат", selected: "Выбрано", place: "Место", fact: "Факт", name: "Введите имя для сертификата", create: "Создать сертификат", print: "Печать / Сохранить", awarded: "Сертификат выдан за успешное прохождение GeoSaryArqa" },
  kz: { video: "Бейнесұрақ", test: "Тест", match: "Сәйкестендіру", map: "Сарыарқа картасы", mapTitle: "Орын атауларын картадағы нүктелерге апарыңыз", mapHint: "Карточканы сүйреп апарыңыз немесе оны, сосын нүктені басыңыз.", checkMap: "Картаны тексеру", complete: "Квесті аяқтау", certificate: "Сертификат алу", retry: "Қайта өту", below: "Сертификат алу үшін кемінде 15 балл жинау қажет.", score: "Сіздің нәтижеңіз", selected: "Таңдалды", place: "Орын", fact: "Дерек", name: "Сертификат үшін атыңызды енгізіңіз", create: "Сертификат жасау", print: "Басып шығару / Сақтау", awarded: "Сертификат GeoSaryArqa квестін сәтті аяқтағаны үшін берілді" },
  en: { video: "Video question", test: "Test", match: "Matching", map: "Saryarka map", mapTitle: "Drag the place names onto the map points", mapHint: "Drag a card, or select it and then tap a point.", checkMap: "Check map", complete: "Finish quest", certificate: "Get certificate", retry: "Try again", below: "You need at least 15 points for a certificate.", score: "Your result", selected: "Selected", place: "Place", fact: "Fact", name: "Enter your name for the certificate", create: "Create certificate", print: "Print / Save", awarded: "This certificate is awarded for successfully completing GeoSaryArqa" },
};

const certificateCopy = {
  ru: {
    title: "СЕРТИФИКАТ",
    awarded: "Настоящий сертификат выдан",
    completed: "за успешное прохождение образовательного маршрута GeoSaryArqa",
    download: "Скачать сертификат PDF",
    date: "Дата выдачи",
  },
  kz: {
    title: "СЕРТИФИКАТ",
    awarded: "Осы сертификат",
    completed: "GeoSaryArqa білім беру маршрутын сәтті аяқтағаны үшін беріледі",
    download: "Сертификатты PDF жүктеу",
    date: "Берілген күні",
  },
  en: {
    title: "CERTIFICATE",
    awarded: "This certificate is awarded to",
    completed: "for successfully completing the GeoSaryArqa learning route",
    download: "Download certificate PDF",
    date: "Issued",
  },
};

function rankFor(score, lang) {
  if (score === 20) return { kz: "Сарыарқа сарапшысы", ru: "Эксперт Сарыарки", en: "Saryarka Expert" }[lang];
  if (score >= 18) return { kz: "Сарыарқа білгірі", ru: "Знаток Сарыарки", en: "Saryarka Connoisseur" }[lang];
  if (score >= 15) return { kz: "Сарыарқа зерттеушісі", ru: "Исследователь Сарыарки", en: "Saryarka Researcher" }[lang];
  return null;
}

function shuffledOptionOrder(step) {
  const order = Array.from({ length: step.options.kz.length }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  if (order[0] === step.correctIndex) {
    const replacementIndex = 1 + Math.floor(Math.random() * (order.length - 1));
    [order[0], order[replacementIndex]] = [order[replacementIndex], order[0]];
  }

  return order;
}

function shuffledOptionOrders() {
  return questSteps.map((step) => shuffledOptionOrder(step));
}

function hasValidOptionOrders(orders) {
  return Array.isArray(orders) && orders.length === questSteps.length
    && orders.every((order, index) => Array.isArray(order) && order.length === questSteps[index].options.kz.length);
}

function loadCertificateImage(source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

function pdfFromJpeg(jpegDataUrl, width, height) {
  const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(",")[1]), (character) => character.charCodeAt(0));
  const encoder = new TextEncoder();
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const content = encoder.encode(`q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`);
  const chunks = [];
  const offsets = [0];
  let offset = 0;
  const add = (part) => {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    chunks.push(bytes);
    offset += bytes.length;
  };
  const object = (number, value) => {
    offsets[number] = offset;
    add(`${number} 0 obj\n${value}\nendobj\n`);
  };

  add("%PDF-1.4\n%âãÏÓ\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = offset;
  add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
  add(jpegBytes);
  add("\nendstream\nendobj\n");
  offsets[5] = offset;
  add(`5 0 obj\n<< /Length ${content.length} >>\nstream\n`);
  add(content);
  add("endstream\nendobj\n");
  const xrefOffset = offset;
  add("xref\n0 6\n0000000000 65535 f \n");
  for (let index = 1; index <= 5; index += 1) {
    add(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(chunks, { type: "application/pdf" });
}

function readSavedProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || !saved.savedAt || Date.now() - saved.savedAt > PROGRESS_LIFETIME_MS) { localStorage.removeItem(STORAGE_KEY); return null; }
    return saved;
  } catch { return null; }
}

function shuffledMatchingCards() {
  const cards = [...matchingPairs];
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[swapIndex]] = [cards[swapIndex], cards[index]];
  }
  // A derangement guarantees no card begins opposite its matching place.
  if (cards.some((card, index) => card.id === matchingPairs[index].id)) return [...matchingPairs.slice(1), matchingPairs[0]];
  return cards;
}

function QuestIcon({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {type === "medal" ? <><circle cx="12" cy="9" r="5"/><path d="m8.5 14.5-1 6 4.5-2 4.5 2-1-6"/></> : type === "map" ? <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></> : type === "film" ? <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 10h18"/></> : type === "leaf" ? <><path d="M20 4C11 4 5 8.5 5 16c0 2.2 1.8 4 4 4 7.5 0 11-6.2 11-16Z"/><path d="M4 20c3-4 6-6 11-9"/></> : type === "route" ? <><path d="M3 17c5-10 10 5 18-10"/><circle cx="3" cy="17" r="1.5"/><circle cx="21" cy="7" r="1.5"/></> : <><circle cx="12" cy="12" r="8"/><path d="m15.5 8.5-2.2 5-4.8 2 2.2-5z"/></>}
  </svg>;
}

const QUIZ_COORDINATES = {
  burabay: [53.083, 70.314],
  korgalzhyn: [50.425, 69.25],
  bayanaul: [50.793, 75.702],
  karkaraly: [49.412, 75.474],
  ulytau: [48.675, 66.916],
};

function QuizMapBounds({ onReady }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(KAZAKHSTAN_BOUNDS, { padding: [22, 22] });
    onReady(map);
    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(resizeTimer);
  }, [map, onReady]);
  return null;
}

function quizPointIcon(number, label) {
  const text = label ? `<span class="map-quiz-pin__label">${label}</span>` : `<span class="map-quiz-pin__number">${number}</span>`;
  return L.divIcon({ className: "map-quiz-marker", html: `<span class="map-quiz-pin ${label ? "map-quiz-pin--filled" : ""}">${text}</span>`, iconSize: label ? [112, 32] : [34, 34], iconAnchor: label ? [12, 16] : [17, 17] });
}

function SaryarkaQuizMap({ assignments, selected, onSelect, onDrop, l }) {
  const [regions, setRegions] = useState(null);
  const [countryBorder, setCountryBorder] = useState(null);
  const [map, setMap] = useState(null);
  const mapShellRef = useRef(null);
  useEffect(() => {
    let active = true;
    Promise.all([fetch(REGIONS_GEOJSON_URL), fetch(COUNTRY_BORDER_GEOJSON_URL)])
      .then(async ([regionsResponse, borderResponse]) => [regionsResponse.ok ? await regionsResponse.json() : null, borderResponse.ok ? await borderResponse.json() : null])
      .then(([regionsData, borderData]) => { if (active) { setRegions(regionsData); setCountryBorder(borderData); } })
      .catch(() => { /* Leaflet remains usable if local map data is unavailable. */ });
    return () => { active = false; };
  }, []);
  const dropOnMap = (event) => {
    event.preventDefault();
    const labelId = event.dataTransfer.getData("text/plain");
    const shell = mapShellRef.current;
    if (!labelId || !map || !shell) return;
    const bounds = shell.getBoundingClientRect();
    const cursor = L.point(event.clientX - bounds.left, event.clientY - bounds.top);
    const closest = mapPlaces.map((place) => ({ place, point: map.latLngToContainerPoint(QUIZ_COORDINATES[place.id]) })).sort((first, second) => first.point.distanceTo(cursor) - second.point.distanceTo(cursor))[0];
    if (closest && closest.point.distanceTo(cursor) < 58) onDrop(closest.place.id, labelId);
  };
  return <div className="map-quiz">
    <div className="map-quiz__labels">{mapPlaces.map((item) => <button key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onClick={() => onSelect(item.id)} className={`map-label ${selected === item.id ? "map-label--selected" : ""} ${Object.values(assignments).includes(item.id) ? "map-label--placed" : ""}`}>{l(item.name)}</button>)}</div>
    <div ref={mapShellRef} onDragOver={(event) => event.preventDefault()} onDrop={dropOnMap} className="map-quiz__canvas map-quiz-leaflet" aria-label="Map of Kazakhstan">
      <MapContainer center={[48.2, 68.5]} zoom={5} minZoom={4.5} maxZoom={7} zoomControl={false} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} touchZoom={false} className="map-quiz-leaflet__map">
        <QuizMapBounds onReady={setMap}/>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri"/>
        {regions && <GeoJSON data={regions} style={{ color: "#ffffff", weight: 1.15, opacity: .92, fillColor: "#203229", fillOpacity: .08 }} interactive={false}/>} 
        {countryBorder && <GeoJSON data={countryBorder} style={{ color: "#f6d671", weight: 3, opacity: 1, fillOpacity: 0 }} interactive={false}/>} 
        <GeoJSON data={SARYARKA_AREA} style={{ color: "#d9a63d", weight: 3, opacity: 1, fillColor: "#d9a63d", fillOpacity: .16, smoothFactor: 0, lineCap: "butt", lineJoin: "miter" }} interactive={false}/>
        {mapPlaces.map((item, index) => <Marker key={item.id} position={QUIZ_COORDINATES[item.id]} icon={quizPointIcon(index + 1, assignments[item.id] ? l(mapPlaces.find((place) => place.id === assignments[item.id]).name) : "")} eventHandlers={{ click: () => selected && onDrop(item.id, selected) }}/>)}
      </MapContainer>
    </div>
  </div>;
}

function MatchingRound({ assignments, cards, selectedPlace, onSelectPlace, onAssign, l }) {
  const roundRef = useRef(null);
  const placeRefs = useRef({});
  const factRefs = useRef({});
  const [lines, setLines] = useState([]);
  const drop = (event, placeId) => { event.preventDefault(); const cardId = event.dataTransfer.getData("text/plain"); if (cardId) onAssign(placeId, cardId); };
  useLayoutEffect(() => {
    const updateLines = () => {
      const parent = roundRef.current;
      if (!parent) return;
      const parentBox = parent.getBoundingClientRect();
      setLines(Object.entries(assignments).flatMap(([placeId, factId]) => {
        const place = placeRefs.current[placeId]; const fact = factRefs.current[factId];
        if (!place || !fact) return [];
        const left = place.getBoundingClientRect(); const right = fact.getBoundingClientRect();
        return [{ id: placeId, x1: left.right - parentBox.left, y1: left.top + left.height / 2 - parentBox.top, x2: right.left - parentBox.left, y2: right.top + right.height / 2 - parentBox.top }];
      }));
    };
    updateLines();
    const observer = new ResizeObserver(updateLines);
    if (roundRef.current) observer.observe(roundRef.current);
    window.addEventListener("resize", updateLines);
    return () => { observer.disconnect(); window.removeEventListener("resize", updateLines); };
  }, [assignments, cards]);
  return <div className="matching-round" ref={roundRef}>
    <svg className="matching-round__lines" aria-hidden="true">{lines.map((line) => <line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}/>)}</svg>
    <div className="matching-round__column"><p>{l({ ru: "Объекты Сарыарки", kz: "Сарыарқа нысандары", en: "Saryarka places" })}</p>{matchingPairs.map((pair) => <button ref={(node) => { placeRefs.current[pair.id] = node; }} key={pair.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, pair.id)} onClick={() => onSelectPlace(pair.id)} className={`matching-place ${selectedPlace === pair.id ? "matching-place--selected" : ""} ${assignments[pair.id] ? "matching-place--connected" : ""}`} aria-label={l(pair.place)}><strong>{l(pair.place)}</strong></button>)}</div>
    <div className="matching-round__column matching-round__column--facts"><p>{l({ ru: "Характеристики", kz: "Сипаттамалар", en: "Characteristics" })}</p>{cards.map((pair) => <button ref={(node) => { factRefs.current[pair.id] = node; }} key={pair.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", pair.id)} onClick={() => selectedPlace && onAssign(selectedPlace, pair.id)} className={`matching-fact ${Object.values(assignments).includes(pair.id) ? "matching-fact--connected" : ""}`}>{l(pair.fact)}</button>)}</div>
  </div>;
}

export default function Quest() {
  const { lang, l } = useLang();
  const c = copy[lang];
  const certificate = certificateCopy[lang];
  const saved = useRef(readSavedProgress()).current;
  const [stage, setStage] = useState(saved?.stage || "intro");
  const [stepIndex, setStepIndex] = useState(saved?.stepIndex || 0);
  const [score, setScore] = useState(saved?.score || 0);
  const [selected, setSelected] = useState(saved?.selected ?? null);
  const [optionOrders, setOptionOrders] = useState(() => hasValidOptionOrders(saved?.optionOrders) ? saved.optionOrders : shuffledOptionOrders());
  const [lastCorrect, setLastCorrect] = useState(saved?.lastCorrect || false);
  const [questionResults, setQuestionResults] = useState(saved?.questionResults || {});
  const [matchAssignments, setMatchAssignments] = useState(saved?.matchAssignments || {});
  const [matchSelectedPlace, setMatchSelectedPlace] = useState(saved?.matchSelectedPlace || null);
  const [matchScore, setMatchScore] = useState(saved?.matchScore || 0);
  const [matchCards, setMatchCards] = useState(() => {
    const storedIds = saved?.matchCardIds;
    const restored = storedIds?.length === matchingPairs.length ? storedIds.map((id) => matchingPairs.find((pair) => pair.id === id)).filter(Boolean) : null;
    return restored?.length === matchingPairs.length ? restored : shuffledMatchingCards();
  });
  const [mapAssignments, setMapAssignments] = useState(saved?.mapAssignments || {});
  const [mapScore, setMapScore] = useState(saved?.mapScore || 0);
  const [certInput, setCertInput] = useState(saved?.certInput || "");
  const [certName, setCertName] = useState(saved?.certName || "");
  const [videoProgress, setVideoProgress] = useState(saved?.videoProgress || 0);
  const [videoWatched, setVideoWatched] = useState(saved?.videoWatched || false);
  const videoTimer = useRef(null);
  const step = questSteps[stepIndex];
  const place = step && getPlace(step.placeId);
  const rank = rankFor(score, lang);
  const scorePercent = Math.round((score / TOTAL_POINTS) * 100);
  const taskNumber = stage.startsWith("matching") ? 11 : stage === "map" || stage === "map-feedback" ? 12 : stepIndex + 1;
  const completedTaskCount = stage === "map-feedback" ? 12 : stage === "matching-feedback" || stage === "map" ? 11 : stepIndex + (stage === "feedback" ? 1 : 0);
  const progress = Math.min(100, (completedTaskCount / TOTAL_TASKS) * 100);
  const typeLabel = stage.startsWith("matching") ? c.match : stage.startsWith("map") ? c.map : c[step.kind];
  useEffect(() => () => clearInterval(videoTimer.current), []);
  useEffect(() => {
    if (stage === "intro") return;
    const progress = { savedAt: Date.now(), stage, stepIndex, score, selected, optionOrders, lastCorrect, questionResults, matchAssignments, matchSelectedPlace, matchScore, matchCardIds: matchCards.map((pair) => pair.id), mapAssignments, mapScore, certInput, certName, videoProgress, videoWatched };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [stage, stepIndex, score, selected, optionOrders, lastCorrect, questionResults, matchAssignments, matchSelectedPlace, matchScore, matchCards, mapAssignments, mapScore, certInput, certName, videoProgress, videoWatched]);
  const resetVideo = () => { clearInterval(videoTimer.current); setVideoProgress(0); setVideoWatched(false); };
  const reset = () => { localStorage.removeItem(STORAGE_KEY); resetVideo(); setStage("intro"); setStepIndex(0); setScore(0); setSelected(null); setOptionOrders(shuffledOptionOrders()); setQuestionResults({}); setMatchAssignments({}); setMatchSelectedPlace(null); setMatchScore(0); setMatchCards(shuffledMatchingCards()); setMapAssignments({}); setMapScore(0); setCertInput(""); setCertName(""); };
  const downloadCertificate = async () => {
    const date = new Date().toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-GB");
    await document.fonts?.ready;
    const [artwork, logo] = await Promise.all([
      loadCertificateImage(certificateArtwork),
      loadCertificateImage(certificateLogo),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1131;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#c08a44";
    context.lineWidth = 9;
    context.strokeRect(38, 38, 1524, 1055);
    context.strokeStyle = "#34532a";
    context.lineWidth = 2;
    context.strokeRect(62, 62, 1476, 1007);
    if (artwork) context.drawImage(artwork, 55, 155, 1490, 860);
    if (logo) context.drawImage(logo, 730, 105, 140, 140);

    context.textAlign = "center";
    context.fillStyle = "#34532a";
    context.font = "700 31px Georgia, serif";
    context.fillText("GEOSARYARQA", 800, 270);
    context.fillStyle = "#232b1e";
    context.font = "700 78px Georgia, serif";
    context.fillText(certificate.title, 800, 390);
    context.strokeStyle = "#d6a339";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(670, 430);
    context.lineTo(930, 430);
    context.stroke();
    context.fillStyle = "#4c5642";
    context.font = "28px Arial, sans-serif";
    context.fillText(certificate.awarded, 800, 510);
    context.fillStyle = "#34532a";
    context.font = "700 56px Georgia, serif";
    context.fillText(certName, 800, 590);
    context.fillStyle = "#4c5642";
    context.font = "27px Arial, sans-serif";
    context.fillText(certificate.completed, 800, 675);
    context.fillStyle = "#7a5a12";
    context.font = "700 25px Arial, sans-serif";
    context.fillText(`${score} / ${TOTAL_POINTS} (${scorePercent}%) · ${rank}`, 800, 750);
    context.fillStyle = "#4c5642";
    context.font = "22px Arial, sans-serif";
    context.fillText(`${certificate.date}: ${date}`, 800, 1000);

    const pdf = pdfFromJpeg(canvas.toDataURL("image/jpeg", 0.94), canvas.width, canvas.height);
    const url = URL.createObjectURL(pdf);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GeoSaryArqa-${certName.trim().replace(/\s+/g, "-") || "certificate"}.pdf`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  };
  const playVideo = () => {
    if (videoWatched) return;
    clearInterval(videoTimer.current);
    const startedAt = Date.now() - (videoProgress / 100) * VIDEO_DURATION_MS;
    videoTimer.current = setInterval(() => {
      const value = Math.min(100, ((Date.now() - startedAt) / VIDEO_DURATION_MS) * 100);
      setVideoProgress(value);
      if (value === 100) { clearInterval(videoTimer.current); setVideoWatched(true); }
    }, 80);
  };
  const next = () => { setSelected(null); if (stepIndex + 1 < questSteps.length) { const nextIndex = stepIndex + 1; setStepIndex(nextIndex); resetVideo(); setStage(questSteps[nextIndex].kind === "video" ? "video" : "question"); } else setStage("matching"); };
  const submit = () => { const correct = selected === step.correctIndex; setLastCorrect(correct); setQuestionResults((value) => ({ ...value, [stepIndex]: correct })); if (correct) setScore((value) => value + 1); setStage("feedback"); };
  const setMapPlace = (pointId, labelId) => {
    setMapAssignments((value) => {
      const nextAssignments = { ...value };
      Object.keys(nextAssignments).forEach((id) => {
        if (nextAssignments[id] === labelId) delete nextAssignments[id];
      });
      nextAssignments[pointId] = labelId;
      return nextAssignments;
    });
  };
  const selectMatchPlace = (placeId) => {
    if (matchSelectedPlace === placeId) { setMatchAssignments((value) => { const nextAssignments = { ...value }; delete nextAssignments[placeId]; return nextAssignments; }); setMatchSelectedPlace(null); return; }
    setMatchSelectedPlace(placeId);
  };
  const assignMatch = (placeId, cardId) => { setMatchAssignments((value) => { const nextAssignments = { ...value }; Object.keys(nextAssignments).forEach((id) => { if (nextAssignments[id] === cardId) delete nextAssignments[id]; }); nextAssignments[placeId] = cardId; return nextAssignments; }); setMatchSelectedPlace(null); };
  const checkMatching = () => { const correct = matchingPairs.filter((pair) => matchAssignments[pair.id] === pair.id).length; setMatchScore(correct); setScore((value) => value + correct); setStage("matching-feedback"); };
  const checkMap = () => { const correct = mapPlaces.filter((item) => mapAssignments[item.id] === item.id).length; setMapScore(correct); setScore((value) => value + correct); setStage("map-feedback"); };
  const mapReady = Object.keys(mapAssignments).length === mapPlaces.length;
  const matchReady = Object.keys(matchAssignments).length === matchingPairs.length;
  const taskStates = useMemo(() => Array.from({ length: TOTAL_TASKS }, (_, index) => {
    if (index < questSteps.length && Object.hasOwn(questionResults, index)) return questionResults[index] ? "correct" : "incorrect";
    const isCompleted = index < stepIndex || (index === stepIndex && (stage === "feedback" || stage.startsWith("matching") || stage.startsWith("map"))) || (index === 10 && (stage === "matching-feedback" || stage.startsWith("map"))) || (index === 11 && stage === "map-feedback");
    return isCompleted ? "correct" : "pending";
  }), [questionResults, stepIndex, stage]);

  if (stage === "intro") {
    const introStats = [
      { icon: "route", label: l({ kz: "12 тапсырма", ru: "12 заданий", en: "12 tasks" }) },
      { icon: "film", label: l({ kz: "Бейнесұрақтар", ru: "Видеовопросы", en: "Video questions" }) },
      { icon: "medal", label: l({ kz: "20 балл", ru: "20 баллов", en: "20 points" }) },
      { icon: "leaf", label: l({ kz: "Қызықты деректер", ru: "Интересные факты", en: "Fun facts" }) },
    ];
    const introRule = l({
      kz: "12 тапсырма · 20 балл · Сертификат — 15 баллдан бастап.",
      ru: "12 заданий · 20 баллов · Сертификат — от 15 баллов.",
      en: "12 tasks · 20 points · Certificate from 15 points.",
    });

    return <div className="quest-page">
      <section className="quest-intro quest-topography animate-fade-up">
        <div className="quest-intro__heading">
          <div className="quest-intro__icon"><QuestIcon/></div>
          <p className="quest-intro__eyebrow">FIELD JOURNAL · SARYARKA</p>
          <h1>GeoSaryArqa</h1>
          <p className="quest-intro__subtitle">{lang === "kz" ? "Сарыарқа туралы біліміңді тексер" : lang === "ru" ? "Проверь свои знания о Сарыарке" : "Test your knowledge of Saryarka"}</p>
        </div>
        <div className="quest-intro__stats">
          {introStats.map((item) => <div key={item.icon} className="quest-stat">
            <QuestIcon type={item.icon}/>
            <p>{item.label}</p>
          </div>)}
        </div>
        <div className="quest-intro__footer">
          <p>{introRule}</p>
          <button className="quest-button quest-button--gold" onClick={() => setStage("video")}>
            {lang === "kz" ? "Квесті бастау" : lang === "ru" ? "Начать квест" : "Start quest"}
          </button>
        </div>
      </section>
    </div>;
  }

  if (stage === "final") return <div className="quest-page"><section className="quest-final quest-topography animate-fade-up"><div className="quest-final__icon"><QuestIcon type="medal"/></div><h1>{lang === "kz" ? "Квест аяқталды!" : lang === "ru" ? "Квест завершён!" : "Quest complete!"}</h1><p>{c.score}</p><strong>{score} / {TOTAL_POINTS} ({scorePercent}%)</strong>{rank ? <><div className="quest-final__rank">{rank}</div><p>{lang === "kz" ? "Сіз сертификат алдыңыз!" : lang === "ru" ? "Вы получили сертификат!" : "You earned a certificate!"}</p><div className="quest-final__actions"><button className="quest-button quest-button--gold" onClick={() => setStage("certificate")}>{c.certificate}</button></div></> : <><p>{c.below}</p><div className="quest-final__actions"><button className="quest-button quest-button--gold" onClick={reset}>{c.retry}</button></div></>}</section></div>;

  if (stage === "certificate") {
    const certificateDate = new Date().toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-GB");

    return <div className="quest-page">
      <section className="quest-certificate animate-fade-up">
        {!certName ? <div className="quest-certificate__form">
          <div className="quest-certificate__form-icon"><QuestIcon type="medal"/></div>
          <h1>{c.name}</h1>
          <input
            autoFocus
            value={certInput}
            onChange={(event) => setCertInput(event.target.value)}
            placeholder={lang === "kz" ? "Атыңыз" : lang === "ru" ? "Ваше имя" : "Your name"}
          />
          <button disabled={!certInput.trim()} onClick={() => setCertName(certInput.trim())} className="quest-button quest-submit">
            {c.create}
          </button>
        </div> : <div>
          <div className="quest-certificate__preview">
            <img src={certificateArtwork} alt="" className="quest-certificate__artwork"/>
            <div className="quest-certificate__content">
              <img src={certificateLogo} alt="GeoSaryArqa" className="quest-certificate__logo-image"/>
              <p className="quest-certificate__brand">GEOSARYARQA</p>
              <h1>{certificate.title}</h1>
              <div className="quest-certificate__line"/>
              <p>{certificate.awarded}</p>
              <strong>{certName}</strong>
              <p>{certificate.completed}</p>
              <div className="quest-certificate__score">{score} / {TOTAL_POINTS} ({scorePercent}%) · {rank}</div>
              <p className="quest-certificate__date">{certificate.date}: {certificateDate}</p>
            </div>
          </div>
          <div className="quest-certificate__actions">
            <button className="quest-button quest-button--ink" onClick={downloadCertificate}>
              {certificate.download}
            </button>
          </div>
        </div>}
      </section>
    </div>;
  }

  return <div className="quest-page"><section className="quest-flow animate-fade-up"><div className="quest-flow__summary"><p>{lang === "kz" ? "Тапсырма" : lang === "ru" ? "Задание" : "Task"} {taskNumber} / {TOTAL_TASKS}</p><p>{score} / {TOTAL_POINTS} ({scorePercent}%)</p></div><div className="quest-progress"><div className="quest-route-line" style={{ width: `${progress}%` }}/></div><div className="quest-route">{taskStates.map((state, index) => <span key={index} className={`quest-route__dot ${state === "correct" ? "quest-route__dot--done" : state === "incorrect" ? "quest-route__dot--incorrect" : ""}`}>{index + 1}</span>)}</div><div className="quest-card"><div className="quest-card__header"><div className="quest-card__icon"><QuestIcon type={stage.startsWith("map") || stage.startsWith("matching") ? "map" : "compass"}/></div><div><p>{typeLabel}</p><h2>{stage.startsWith("map") ? c.map : stage.startsWith("matching") ? (lang === "kz" ? "Сарыарқа нысандарын сәйкестендіріңіз" : lang === "ru" ? "Сопоставьте объекты Сарыарки" : "Match Saryarka places") : l(place.name)}</h2></div></div>
    {stage === "video" && <div className="quest-card__body"><div className="quest-video"><iframe src={step.videoUrl} title={l(step.question)} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/></div><p className="quest-video__title">{lang === "kz" ? "Бейнені мұқият қараңыз" : lang === "ru" ? "Внимательно посмотрите видео" : "Watch the video carefully"}</p><p className="quest-video__hint">{lang === "kz" ? "Көргеннен кейін сұраққа жауап беріңіз." : lang === "ru" ? "После просмотра ответьте на вопрос." : "Answer the question after watching."}</p><div className="quest-actions"><button onClick={() => setStage("question")} className="quest-button">{lang === "kz" ? "Сұраққа өту" : lang === "ru" ? "Перейти к вопросу" : "Go to question"}</button></div></div>}
    {stage === "question" && <div className="quest-card__body">{step.kind === "match" && <div className="matching-clue"><span>{c.fact}</span><strong>{l(step.clue)}</strong><span>{c.place}</span></div>}<p className="quest-question">{l(step.question)}</p><div className={`quest-options ${step.kind === "match" ? "quest-options--match" : ""}`}>{(optionOrders[stepIndex] || []).map((optionIndex, displayIndex) => <button type="button" onClick={() => setSelected(optionIndex)} key={optionIndex} className={`quest-option ${selected === optionIndex ? "quest-option--selected" : ""}`}><span>{String.fromCharCode(65 + displayIndex)}</span>{l(step.options)[optionIndex]}</button>)}</div><button onClick={submit} disabled={selected === null} className="quest-button quest-submit">{lang === "kz" ? "Жауап беру" : lang === "ru" ? "Ответить" : "Answer"}</button></div>}
    {stage === "feedback" && <div className="quest-card__body"><div className={`quest-feedback ${lastCorrect ? "quest-feedback--correct" : "quest-feedback--incorrect"}`}><QuestIcon type={lastCorrect ? "medal" : "compass"}/><p>{lastCorrect ? (lang === "kz" ? "Дұрыс! +1 балл" : lang === "ru" ? "Правильно! +1 балл" : "Correct! +1 point") : (lang === "kz" ? "Дұрыс емес" : lang === "ru" ? "Неверный ответ" : "Not quite")}</p></div>{!lastCorrect && <p className="quest-correct-answer">{lang === "kz" ? "Дұрыс жауап:" : lang === "ru" ? "Правильный ответ:" : "Correct answer:"} <strong>{l(step.options)[step.correctIndex]}</strong></p>}<p className="quest-explanation">{l(step.explanation)}</p><button onClick={next} className="quest-button quest-submit">{stepIndex === 14 ? c.complete : (lang === "kz" ? "Келесі тапсырма" : lang === "ru" ? "Следующее задание" : "Next task")}</button></div>}
    {stage === "matching" && <div className="quest-card__body"><p className="quest-question">{lang === "kz" ? "Нысандарды тиісті сипаттамалармен сәйкестендіріңіз" : lang === "ru" ? "Сопоставьте каждый объект с подходящей характеристикой" : "Match each place with the right characteristic"}</p><p className="quest-score-hint">{lang === "kz" ? "Әр дұрыс сәйкестендіру — 1 балл. Барлығы — 5 балл." : lang === "ru" ? "Каждая верная пара — 1 балл. Всего — 5 баллов." : "Each correct pair earns 1 point. Total: 5 points."}</p><p className="map-quiz__hint">{lang === "kz" ? "Алдымен нысанды, кейін сипаттаманы басыңыз. Байланысты өшіру үшін таңдалған нысанды қайта басыңыз." : lang === "ru" ? "Нажмите объект, затем характеристику. Чтобы отменить связь, повторно нажмите выбранный объект." : "Tap a place, then a characteristic. Tap the selected place again to remove its link."}</p><MatchingRound assignments={matchAssignments} cards={matchCards} selectedPlace={matchSelectedPlace} onSelectPlace={selectMatchPlace} onAssign={assignMatch} l={l}/><button disabled={!matchReady} onClick={checkMatching} className="quest-button quest-submit">{lang === "kz" ? "Жауап беру" : lang === "ru" ? "Ответить" : "Answer"}</button></div>}
    {stage === "matching-feedback" && <div className="quest-card__body"><div className={`quest-feedback ${matchScore === 5 ? "quest-feedback--correct" : "quest-feedback--incorrect"}`}><QuestIcon type="medal"/><p>{lang === "kz" ? `Сәйкестендіру: ${matchScore} / 5 дұрыс` : lang === "ru" ? `Сопоставление: ${matchScore} / 5 правильно` : `Matching: ${matchScore} / 5 correct`}</p></div><p className="quest-explanation">{lang === "kz" ? "Әр дұрыс жұп үшін 1 балл берілді." : lang === "ru" ? "За каждую верную пару начислен 1 балл." : "Each correct pair earned 1 point."}</p><button onClick={() => setStage("map")} className="quest-button quest-submit">{lang === "kz" ? "Келесі сұрақ" : lang === "ru" ? "Следующий вопрос" : "Next question"}</button></div>}
    {stage === "map" && <div className="quest-card__body"><p className="quest-question">{c.mapTitle}</p><p className="quest-score-hint">{lang === "kz" ? "Әр дұрыс нүкте — 1 балл. Барлығы — 5 балл." : lang === "ru" ? "Каждая верно указанная точка — 1 балл. Всего — 5 баллов." : "Each correctly placed point earns 1 point. Total: 5 points."}</p><p className="map-quiz__hint">{c.mapHint}</p><SaryarkaQuizMap assignments={mapAssignments} selected={selected} onSelect={setSelected} onDrop={(pointId, labelId) => { setMapPlace(pointId, labelId); setSelected(null); }} l={l}/><button disabled={!mapReady} onClick={checkMap} className="quest-button quest-submit">{c.checkMap}</button></div>}
    {stage === "map-feedback" && <div className="quest-card__body"><div className={`quest-feedback ${mapScore === 5 ? "quest-feedback--correct" : "quest-feedback--incorrect"}`}><QuestIcon type="map"/><p>{lang === "kz" ? `Карта: ${mapScore} / 5 дұрыс` : lang === "ru" ? `Карта: ${mapScore} / 5 правильно` : `Map: ${mapScore} / 5 correct`}</p></div><p className="quest-explanation">{lang === "kz" ? "Дұрыс орналастырулар ғана балл береді." : lang === "ru" ? "Баллы начислены только за верно размещённые названия." : "Points were awarded only for correctly placed names."}</p><button onClick={() => setStage("final")} className="quest-button quest-submit">{lang === "kz" ? "Нәтижені көру" : lang === "ru" ? "Посмотреть результат" : "See result"}</button></div>}
  </div></section></div>;
}
