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
const STORAGE_KEY = "sq_quest_progress_v4";
const PROGRESS_LIFETIME_MS = 30 * 60 * 1000;
const VIDEO_DURATION_MS = 5000;
const copy = {
  ru: { video: "Видеовопрос", test: "Тест", match: "Сопоставление", map: "Карта Сарыарки", mapTitle: "Перетащите названия мест на точки карты", mapHint: "Можно перетащить карточку или нажать на неё, а затем на точку.", checkMap: "Проверить карту", complete: "Завершить квест", certificate: "Получить сертификат", retry: "Пройти заново", below: "Для сертификата нужно набрать минимум 15 баллов.", score: "Ваш результат", selected: "Выбрано", place: "Место", fact: "Факт", name: "Введите имя для сертификата", create: "Создать сертификат", print: "Печать / Сохранить", awarded: "Сертификат выдан за успешное прохождение GeoSaryArqa" },
  kz: { video: "Бейнесұрақ", test: "Тест", match: "Сәйкестендіру", map: "Сарыарқа картасы", mapTitle: "Орын атауларын картадағы нүктелерге апарыңыз", mapHint: "Карточканы сүйреп апарыңыз немесе оны, сосын нүктені басыңыз.", checkMap: "Картаны тексеру", complete: "Квесті аяқтау", certificate: "Сертификат алу", retry: "Қайта өту", below: "Сертификат алу үшін кемінде 15 балл жинау қажет.", score: "Сіздің нәтижеңіз", selected: "Таңдалды", place: "Орын", fact: "Дерек", name: "Сертификат үшін атыңызды енгізіңіз", create: "Сертификат жасау", print: "Басып шығару / Сақтау", awarded: "Сертификат GeoSaryArqa квестін сәтті аяқтағаны үшін берілді" },
  en: { video: "Video question", test: "Test", match: "Matching", map: "Saryarka map", mapTitle: "Drag the place names onto the map points", mapHint: "Drag a card, or select it and then tap a point.", checkMap: "Check map", complete: "Finish quest", certificate: "Get certificate", retry: "Try again", below: "You need at least 15 points for a certificate.", score: "Your result", selected: "Selected", place: "Place", fact: "Fact", name: "Enter your name for the certificate", create: "Create certificate", print: "Print / Save", awarded: "This certificate is awarded for successfully completing GeoSaryArqa" },
};

function rankFor(score, lang) {
  if (score === 20) return { kz: "Сарапшы", ru: "Эксперт", en: "Expert" }[lang];
  if (score >= 18) return { kz: "Білгір", ru: "Знаток", en: "Expert" }[lang];
  if (score >= 15) return { kz: "Зерттеуші", ru: "Исследователь", en: "Researcher" }[lang];
  return null;
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
    {type === "medal" ? <><circle cx="12" cy="9" r="5"/><path d="m8.5 14.5-1 6 4.5-2 4.5 2-1-6"/></> : type === "map" ? <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></> : <><circle cx="12" cy="12" r="8"/><path d="m15.5 8.5-2.2 5-4.8 2 2.2-5z"/></>}
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
  const assignedIds = new Set(Object.values(assignments));
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
    <div className="map-quiz__labels">{mapPlaces.filter((item) => !assignedIds.has(item.id)).map((item) => <button key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onClick={() => onSelect(item.id)} className={`map-label ${selected === item.id ? "map-label--selected" : ""}`}>{l(item.name)}</button>)}</div>
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
  const saved = useRef(readSavedProgress()).current;
  const [stage, setStage] = useState(saved?.stage || "intro");
  const [stepIndex, setStepIndex] = useState(saved?.stepIndex || 0);
  const [score, setScore] = useState(saved?.score || 0);
  const [selected, setSelected] = useState(saved?.selected ?? null);
  const [lastCorrect, setLastCorrect] = useState(saved?.lastCorrect || false);
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
  const taskNumber = stage.startsWith("matching") ? "11–15" : stage === "map" || stage === "map-feedback" ? "16–20" : stepIndex + 1;
  const progress = Math.min(100, (((stage.startsWith("matching") ? 10 : stage.startsWith("map") ? 15 : stepIndex + (stage === "feedback" ? 1 : 0)) / TOTAL_POINTS) * 100));
  const typeLabel = stage.startsWith("matching") ? c.match : stage.startsWith("map") ? c.map : c[step.kind];
  useEffect(() => () => clearInterval(videoTimer.current), []);
  useEffect(() => {
    if (stage === "intro") return;
    const progress = { savedAt: Date.now(), stage, stepIndex, score, selected, lastCorrect, matchAssignments, matchSelectedPlace, matchScore, matchCardIds: matchCards.map((pair) => pair.id), mapAssignments, mapScore, certInput, certName, videoProgress, videoWatched };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [stage, stepIndex, score, selected, lastCorrect, matchAssignments, matchSelectedPlace, matchScore, matchCards, mapAssignments, mapScore, certInput, certName, videoProgress, videoWatched]);
  const resetVideo = () => { clearInterval(videoTimer.current); setVideoProgress(0); setVideoWatched(false); };
  const reset = () => { localStorage.removeItem(STORAGE_KEY); resetVideo(); setStage("intro"); setStepIndex(0); setScore(0); setSelected(null); setMatchAssignments({}); setMatchSelectedPlace(null); setMatchScore(0); setMatchCards(shuffledMatchingCards()); setMapAssignments({}); setMapScore(0); setCertInput(""); setCertName(""); };
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
  const submit = () => { const correct = selected === step.correctIndex; setLastCorrect(correct); if (correct) setScore((value) => value + 1); setStage("feedback"); };
  const setMapPlace = (pointId, labelId) => setMapAssignments((value) => ({ ...value, [pointId]: labelId }));
  const selectMatchPlace = (placeId) => {
    if (matchSelectedPlace === placeId) { setMatchAssignments((value) => { const nextAssignments = { ...value }; delete nextAssignments[placeId]; return nextAssignments; }); setMatchSelectedPlace(null); return; }
    setMatchSelectedPlace(placeId);
  };
  const assignMatch = (placeId, cardId) => { setMatchAssignments((value) => { const nextAssignments = { ...value }; Object.keys(nextAssignments).forEach((id) => { if (nextAssignments[id] === cardId) delete nextAssignments[id]; }); nextAssignments[placeId] = cardId; return nextAssignments; }); setMatchSelectedPlace(null); };
  const checkMatching = () => { const correct = matchingPairs.filter((pair) => matchAssignments[pair.id] === pair.id).length; setMatchScore(correct); setScore((value) => value + correct); setStage("matching-feedback"); };
  const checkMap = () => { const correct = mapPlaces.filter((item) => mapAssignments[item.id] === item.id).length; setMapScore(correct); setScore((value) => value + correct); setStage("map-feedback"); };
  const mapReady = Object.keys(mapAssignments).length === mapPlaces.length;
  const matchReady = Object.keys(matchAssignments).length === matchingPairs.length;
  const completed = useMemo(() => Array.from({ length: TOTAL_POINTS }, (_, index) => index < stepIndex || (index === stepIndex && stage === "feedback") || (index >= 10 && index < 15 && (stage === "matching-feedback" || stage.startsWith("map"))) || (index >= 15 && stage === "map-feedback")), [stepIndex, stage]);

  if (stage === "intro") return <div className="quest-page"><section className="quest-intro quest-topography animate-fade-up"><div className="quest-intro__heading"><div className="quest-intro__icon"><QuestIcon/></div><p className="quest-intro__eyebrow">FIELD JOURNAL · SARYARKA</p><h1>GeoSaryArqa</h1><p className="quest-intro__subtitle">{lang === "kz" ? "Сарыарқа туралы біліміңді тексер" : lang === "ru" ? "Проверь свои знания о Сарыарке" : "Test your knowledge of Saryarka"}</p></div><div className="quest-intro__stats"><div className="quest-stat"><b>20</b><p>{lang === "kz" ? "тапсырма" : lang === "ru" ? "заданий" : "tasks"}</p></div><div className="quest-stat"><b>5</b><p>{lang === "kz" ? "бейнесұрақ" : lang === "ru" ? "видеовопросов" : "video questions"}</p></div><div className="quest-stat"><b>5 + 5</b><p>{lang === "kz" ? "тест және сәйкестендіру" : lang === "ru" ? "тестов и сопоставлений" : "tests and matches"}</p></div><div className="quest-stat"><b>5</b><p>{lang === "kz" ? "карта нүктесі" : lang === "ru" ? "точек на карте" : "map points"}</p></div></div><div className="quest-intro__footer"><p>{lang === "kz" ? "Әр дұрыс жауап — 1 балл. Сертификат үшін 15 балл жинаңыз." : lang === "ru" ? "Каждый правильный ответ — 1 балл. Для сертификата нужно 15 баллов." : "Each correct answer earns 1 point. Score 15 points to receive a certificate."}</p><button className="quest-button quest-button--gold" onClick={() => setStage("video")}>{lang === "kz" ? "Квесті бастау" : lang === "ru" ? "Начать квест" : "Start quest"}</button></div></section></div>;

  if (stage === "final") return <div className="quest-page"><section className="quest-final quest-topography animate-fade-up"><div className="quest-final__icon"><QuestIcon type="medal"/></div><h1>{lang === "kz" ? "Квест аяқталды!" : lang === "ru" ? "Квест завершён!" : "Quest complete!"}</h1><p>{c.score}</p><strong>{score} / {TOTAL_POINTS}</strong>{rank ? <><div className="quest-final__rank">{rank}</div><p>{lang === "kz" ? "Сіз сертификат алдыңыз!" : lang === "ru" ? "Вы получили сертификат!" : "You earned a certificate!"}</p><div className="quest-final__actions"><button className="quest-button quest-button--gold" onClick={() => setStage("certificate")}>{c.certificate}</button><button className="quest-button quest-button--outline" onClick={reset}>{c.retry}</button></div></> : <><p>{c.below}</p><div className="quest-final__actions"><button className="quest-button quest-button--gold" onClick={reset}>{c.retry}</button></div></>}</section></div>;

  if (stage === "certificate") return <div className="quest-page"><section className="quest-certificate animate-fade-up">{!certName ? <div className="quest-certificate__form"><div className="quest-certificate__form-icon"><QuestIcon type="medal"/></div><h1>{c.name}</h1><input autoFocus value={certInput} onChange={(event) => setCertInput(event.target.value)} placeholder={lang === "kz" ? "Атыңыз" : lang === "ru" ? "Ваше имя" : "Your name"}/><button disabled={!certInput.trim()} onClick={() => setCertName(certInput.trim())} className="quest-button quest-submit">{c.create}</button></div> : <div><div className="quest-certificate__preview"><img src="/certificate-side-illustration.png" alt="" className="quest-certificate__artwork"/><div className="quest-certificate__content"><img src="/geosaryarqa-logo.png" alt="GeoSaryArqa" className="quest-certificate__logo-image"/><p className="quest-certificate__brand">GEOSARYARQA</p><h1>{lang === "kz" ? "СЕРТИФИКАТ" : "CERTIFICATE"}</h1><div className="quest-certificate__line"/><p>{c.awarded}</p><strong>{certName}</strong><div className="quest-certificate__score">{score} / 20 · {rank}</div></div></div><div className="quest-certificate__actions"><button className="quest-button quest-button--ink" onClick={() => window.print()}>{c.print}</button></div></div>}</section></div>;

  return <div className="quest-page"><section className="quest-flow animate-fade-up"><div className="quest-flow__summary"><p>{lang === "kz" ? "Тапсырма" : lang === "ru" ? "Задание" : "Task"} {taskNumber} / 20</p><p>{score} {lang === "en" ? "points" : lang === "kz" ? "балл" : "баллов"}</p></div><div className="quest-progress"><div className="quest-route-line" style={{ width: `${progress}%` }}/></div><div className="quest-route">{completed.map((done, index) => <span key={index} className={`quest-route__dot ${done ? "quest-route__dot--done" : ""}`}>{index + 1}</span>)}</div><div className="quest-card"><div className="quest-card__header"><div className="quest-card__icon"><QuestIcon type={stage.startsWith("map") || stage.startsWith("matching") ? "map" : "compass"}/></div><div><p>{typeLabel}</p><h2>{stage.startsWith("map") ? c.map : stage.startsWith("matching") ? (lang === "kz" ? "Сарыарқа нысандарын сәйкестендіріңіз" : lang === "ru" ? "Сопоставьте объекты Сарыарки" : "Match Saryarka places") : l(place.name)}</h2></div></div>
    {stage === "video" && <div className="quest-card__body"><div className="quest-video-placeholder"><Illustration seed={step.placeId} category={place.category}/><button onClick={playVideo} disabled={videoWatched} aria-label="Play video"><span>▶</span></button><div><div style={{ width: `${videoProgress}%` }}/></div></div><p className="quest-video__title">{lang === "kz" ? "Бейнені мұқият қараңыз" : lang === "ru" ? "Внимательно посмотрите видео" : "Watch the video carefully"}</p><p className="quest-video__hint">{lang === "kz" ? "Көргеннен кейін сұраққа жауап беріңіз." : lang === "ru" ? "После просмотра ответьте на вопрос." : "Answer the question after watching."}</p><div className="quest-actions"><button onClick={() => setStage("question")} disabled={!videoWatched} className="quest-button">{lang === "kz" ? "Сұраққа өту" : lang === "ru" ? "Перейти к вопросу" : "Go to question"}</button>{!videoWatched && <button onClick={() => { clearInterval(videoTimer.current); setVideoProgress(100); setVideoWatched(true); }} className="quest-skip">{lang === "kz" ? "Бейнені өткізіп жіберу" : lang === "ru" ? "Пропустить видео" : "Skip video"}</button>}</div></div>}
    {stage === "question" && <div className="quest-card__body">{step.kind === "match" && <div className="matching-clue"><span>{c.fact}</span><strong>{l(step.clue)}</strong><span>{c.place}</span></div>}<p className="quest-question">{l(step.question)}</p><div className={`quest-options ${step.kind === "match" ? "quest-options--match" : ""}`}>{l(step.options).map((option, index) => <button type="button" onClick={() => setSelected(index)} key={option} className={`quest-option ${selected === index ? "quest-option--selected" : ""}`}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div><button onClick={submit} disabled={selected === null} className="quest-button quest-submit">{lang === "kz" ? "Жауап беру" : lang === "ru" ? "Ответить" : "Answer"}</button></div>}
    {stage === "feedback" && <div className="quest-card__body"><div className={`quest-feedback ${lastCorrect ? "quest-feedback--correct" : "quest-feedback--incorrect"}`}><QuestIcon type={lastCorrect ? "medal" : "compass"}/><p>{lastCorrect ? (lang === "kz" ? "Дұрыс! +1 балл" : lang === "ru" ? "Правильно! +1 балл" : "Correct! +1 point") : (lang === "kz" ? "Дұрыс емес" : lang === "ru" ? "Неверный ответ" : "Not quite")}</p></div>{!lastCorrect && <p className="quest-correct-answer">{lang === "kz" ? "Дұрыс жауап:" : lang === "ru" ? "Правильный ответ:" : "Correct answer:"} <strong>{l(step.options)[step.correctIndex]}</strong></p>}<p className="quest-explanation">{l(step.explanation)}</p><button onClick={next} className="quest-button quest-submit">{stepIndex === 14 ? c.complete : (lang === "kz" ? "Келесі тапсырма" : lang === "ru" ? "Следующее задание" : "Next task")}</button></div>}
    {stage === "matching" && <div className="quest-card__body"><p className="quest-question">{lang === "kz" ? "Нысандарды тиісті сипаттамалармен сәйкестендіріңіз" : lang === "ru" ? "Сопоставьте каждый объект с подходящей характеристикой" : "Match each place with the right characteristic"}</p><p className="map-quiz__hint">{lang === "kz" ? "Алдымен нысанды, кейін сипаттаманы басыңыз. Байланысты өшіру үшін таңдалған нысанды қайта басыңыз." : lang === "ru" ? "Нажмите объект, затем характеристику. Чтобы отменить связь, повторно нажмите выбранный объект." : "Tap a place, then a characteristic. Tap the selected place again to remove its link."}</p><MatchingRound assignments={matchAssignments} cards={matchCards} selectedPlace={matchSelectedPlace} onSelectPlace={selectMatchPlace} onAssign={assignMatch} l={l}/><button disabled={!matchReady} onClick={checkMatching} className="quest-button quest-submit">{lang === "kz" ? "Жауап беру" : lang === "ru" ? "Ответить" : "Answer"}</button></div>}
    {stage === "matching-feedback" && <div className="quest-card__body"><div className={`quest-feedback ${matchScore === 5 ? "quest-feedback--correct" : "quest-feedback--incorrect"}`}><QuestIcon type="medal"/><p>{lang === "kz" ? `Сәйкестендіру: ${matchScore} / 5 дұрыс` : lang === "ru" ? `Сопоставление: ${matchScore} / 5 правильно` : `Matching: ${matchScore} / 5 correct`}</p></div><p className="quest-explanation">{lang === "kz" ? "Әр дұрыс жұп үшін 1 балл берілді." : lang === "ru" ? "За каждую верную пару начислен 1 балл." : "Each correct pair earned 1 point."}</p><button onClick={() => setStage("map")} className="quest-button quest-submit">{lang === "kz" ? "Картаға өту" : lang === "ru" ? "Перейти к карте" : "Go to the map"}</button></div>}
    {stage === "map" && <div className="quest-card__body"><p className="quest-question">{c.mapTitle}</p><p className="map-quiz__hint">{c.mapHint}</p><SaryarkaQuizMap assignments={mapAssignments} selected={selected} onSelect={setSelected} onDrop={(pointId, labelId) => { setMapPlace(pointId, labelId); setSelected(null); }} l={l}/><button disabled={!mapReady} onClick={checkMap} className="quest-button quest-submit">{c.checkMap}</button></div>}
    {stage === "map-feedback" && <div className="quest-card__body"><div className={`quest-feedback ${mapScore === 5 ? "quest-feedback--correct" : "quest-feedback--incorrect"}`}><QuestIcon type="map"/><p>{lang === "kz" ? `Карта: ${mapScore} / 5 дұрыс` : lang === "ru" ? `Карта: ${mapScore} / 5 правильно` : `Map: ${mapScore} / 5 correct`}</p></div><p className="quest-explanation">{lang === "kz" ? "Дұрыс орналастырулар ғана балл береді." : lang === "ru" ? "Баллы начислены только за верно размещённые названия." : "Points were awarded only for correctly placed names."}</p><button onClick={() => setStage("final")} className="quest-button quest-submit">{lang === "kz" ? "Нәтижені көру" : lang === "ru" ? "Посмотреть результат" : "See result"}</button></div>}
  </div></section></div>;
}
