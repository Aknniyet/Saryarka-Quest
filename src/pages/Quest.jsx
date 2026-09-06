import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { questSteps, normalizeAnswer } from "../data/quest";
import { getPlace } from "../data/places";
import Illustration from "../components/Illustration";
import { fixText } from "../i18n/translations";
import "../styles/pages/quest.css";

const POINTS_PER_QUESTION = 10;
const TOTAL_POINTS = questSteps.length * POINTS_PER_QUESTION;
const VIDEO_DURATION_MS = 5000;
const STORAGE_KEY = "sq_quest_progress_v2";

const certificateCopy = {
  kz: { title: "СЕРТИФИКАТ", awarded: "Осы сертификат", completed: "GeoSaryArqa білім беру маршрутын сәтті аяқтағаны үшін беріледі", download: "Сертификатты жүктеу", date: "Берілген күні" },
  ru: { title: "СЕРТИФИКАТ", awarded: "Настоящий сертификат выдан", completed: "за успешное прохождение образовательного маршрута GeoSaryArqa", download: "Скачать сертификат", date: "Дата выдачи" },
  en: { title: "CERTIFICATE", awarded: "This certificate is awarded to", completed: "for successfully completing the GeoSaryArqa learning route", download: "Download certificate", date: "Issued" },
};

function QuestIcon({ type, className = "" }) {
  const paths = {
    route: <><path d="M3 17c5-10 10 5 18-10" /><circle cx="3" cy="17" r="1.5" /><circle cx="21" cy="7" r="1.5" /></>,
    film: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 5v14M17 5v14M3 10h18" /></>,
    compass: <><circle cx="12" cy="12" r="8" /><path d="m15.5 8.5-2.2 5-4.8 2 2.2-5z" /></>,
    leaf: <><path d="M20 4C11 4 5 8.5 5 16c0 2.2 1.8 4 4 4 7.5 0 11-6.2 11-16Z" /><path d="M4 20c3-4 6-6 11-9" /></>,
    play: <path d="m10 8 6 4-6 4Z" fill="currentColor" stroke="none" />,
    medal: <><circle cx="12" cy="9" r="5" /><path d="m8.5 14.5-1 6 4.5-2 4.5 2-1-6" /></>,
    check: <path d="m5 12 4.2 4L19 7" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[type] || paths.compass}</svg>;
}

function rankFor(percent, lang) {
  const labels = {
    kz: ["Алғашқы қадам", "Сарыарқа зерттеушісі", "Сарыарқа білгірі", "Saryarka Explorer"],
    ru: ["Первый маршрут", "Исследователь Сарыарки", "Знаток Сарыарки", "Saryarka Explorer"],
    en: ["First route", "Saryarka Researcher", "Saryarka Expert", "Saryarka Explorer"],
  }[lang];
  const index = percent >= 100 ? 3 : percent >= 70 ? 2 : percent >= 40 ? 1 : 0;
  return labels[index];
}

function readSavedProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}

const certificateArtwork = "/certificate-side-illustration.png";
const certificateLogo = "/geosaryarqa-logo.png";

function loadCertificateImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function pdfFromJpeg(jpegDataUrl, width, height) {
  const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(",")[1]), (char) => char.charCodeAt(0));
  const encoder = new TextEncoder();
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const content = encoder.encode(`q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`);
  const chunks = [];
  const offsets = [0];
  let offset = 0;
  const add = (part) => { const bytes = typeof part === "string" ? encoder.encode(part) : part; chunks.push(bytes); offset += bytes.length; };
  add("%PDF-1.4\n%âãÏÓ\n");
  const object = (number, value) => { offsets[number] = offset; add(`${number} 0 obj\n${value}\nendobj\n`); };
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
  const xref = offset;
  add("xref\n0 6\n0000000000 65535 f \n");
  for (let index = 1; index <= 5; index += 1) add(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: "application/pdf" });
}

export default function Quest() {
  const { t, l, lang } = useLang();
  const saved = useRef(readSavedProgress()).current;
  const [hydrated, setHydrated] = useState(false);
  const [stage, setStage] = useState(saved?.stage || "intro");
  const [stepIndex, setStepIndex] = useState(saved?.stepIndex || 0);
  const [score, setScore] = useState(saved?.score || 0);
  const [results, setResults] = useState(saved?.results || []);
  const [videoProgress, setVideoProgress] = useState(saved?.videoProgress || 0);
  const [, setVideoPlaying] = useState(false);
  const [videoWatched, setVideoWatched] = useState(saved?.videoWatched || false);
  const [selectedOption, setSelectedOption] = useState(saved?.selectedOption ?? null);
  const [textAnswer, setTextAnswer] = useState(saved?.textAnswer || "");
  const [lastCorrect, setLastCorrect] = useState(saved?.lastCorrect || false);
  const [certName, setCertName] = useState(saved?.certName || "");
  const [certCreated, setCertCreated] = useState(saved?.certCreated || false);
  const intervalRef = useRef(null);
  const step = questSteps[stepIndex];
  const place = step ? getPlace(step.placeId) : null;
  const copy = certificateCopy[lang];
  const percent = Math.round((score / TOTAL_POINTS) * 100);
  const rank = rankFor(percent, lang);

  useEffect(() => { setHydrated(true); return () => clearInterval(intervalRef.current); }, []);
  useEffect(() => {
    if (!hydrated) return;
    const progress = { stage, stepIndex, score, results, videoProgress, videoWatched, selectedOption, textAnswer, lastCorrect, certName, certCreated };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hydrated, stage, stepIndex, score, results, videoProgress, videoWatched, selectedOption, textAnswer, lastCorrect, certName, certCreated]);

  const clearProgress = () => localStorage.removeItem(STORAGE_KEY);
  const resetStep = () => { clearInterval(intervalRef.current); setVideoProgress(0); setVideoPlaying(false); setVideoWatched(false); setSelectedOption(null); setTextAnswer(""); };
  function restartQuest() { clearProgress(); setStepIndex(0); setScore(0); setResults([]); setCertCreated(false); setCertName(""); resetStep(); setStage("intro"); }
  function beginQuest() { setStage("video"); }
  function playVideo() {
    if (videoWatched) return;
    setVideoPlaying(true);
    const start = Date.now() - (videoProgress / 100) * VIDEO_DURATION_MS;
    intervalRef.current = setInterval(() => {
      const value = Math.min(100, ((Date.now() - start) / VIDEO_DURATION_MS) * 100);
      setVideoProgress(value);
      if (value >= 100) { clearInterval(intervalRef.current); setVideoPlaying(false); setVideoWatched(true); }
    }, 80);
  }
  function submitAnswer() {
    const correct = step.type === "choice" ? selectedOption === step.correctIndex : step.acceptedAnswers.some((answer) => normalizeAnswer(fixText(answer)) === normalizeAnswer(textAnswer));
    setLastCorrect(correct); if (correct) setScore((value) => value + POINTS_PER_QUESTION); setResults((value) => [...value, correct]); setStage("feedback");
  }
  function nextStep() { if (stepIndex + 1 < questSteps.length) { setStepIndex((value) => value + 1); resetStep(); setStage("video"); } else setStage("final"); }
  async function downloadCertificate() {
    const date = new Date().toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-GB");
    await document.fonts?.ready;
    const [artwork, logo] = await Promise.all([
      loadCertificateImage(certificateArtwork),
      loadCertificateImage(certificateLogo),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = 1600; canvas.height = 1131;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fffdf7"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#c08a44"; ctx.lineWidth = 9; ctx.strokeRect(38, 38, 1524, 1055);
    ctx.strokeStyle = "#34532a"; ctx.lineWidth = 2; ctx.strokeRect(62, 62, 1476, 1007);
    if (artwork) ctx.drawImage(artwork, 55, 115, 1490, 838);
    ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = "#d6a339"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(70, 870); ctx.bezierCurveTo(300, 700, 420, 1020, 700, 860); ctx.bezierCurveTo(1000, 690, 1220, 760, 1530, 870); ctx.stroke(); ctx.restore();
    if (logo) ctx.drawImage(logo, 730, 105, 140, 140);
    ctx.textAlign = "center";
    ctx.fillStyle = "#34532a"; ctx.font = "700 31px 'Noto Serif', Georgia, serif"; ctx.letterSpacing = "6px"; ctx.fillText("GEOSARYARQA", 800, 270); ctx.letterSpacing = "0px";
    ctx.fillStyle = "#232b1e"; ctx.font = "700 78px 'Noto Serif', Georgia, serif"; ctx.fillText(copy.title, 800, 390);
    ctx.strokeStyle = "#d6a339"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(670, 430); ctx.lineTo(930, 430); ctx.stroke();
    ctx.fillStyle = "#4c5642"; ctx.font = "28px 'Noto Sans', Arial, sans-serif"; ctx.fillText(copy.awarded, 800, 510);
    ctx.fillStyle = "#34532a"; ctx.font = "700 56px 'Noto Serif', Georgia, serif"; ctx.fillText(certName, 800, 590);
    ctx.fillStyle = "#4c5642"; ctx.font = "27px 'Noto Sans', Arial, sans-serif"; ctx.fillText(copy.completed, 800, 675);
    ctx.fillStyle = "#7a5a12"; ctx.font = "700 25px 'Noto Sans', Arial, sans-serif"; ctx.fillText(`${score} / ${TOTAL_POINTS} · ${rank}`, 800, 750);
    ctx.fillStyle = "#4c5642"; ctx.font = "22px 'Noto Sans', Arial, sans-serif"; ctx.fillText(`${copy.date}: ${date}`, 800, 1000);
    const pdf = pdfFromJpeg(canvas.toDataURL("image/jpeg", 0.94), canvas.width, canvas.height);
    const url = URL.createObjectURL(pdf);
    const link = document.createElement("a"); link.href = url; link.download = `GeoSaryArqa-${certName.trim().replace(/\s+/g, "-") || "certificate"}.pdf`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  }
  const routeStatus = useMemo(() => questSteps.map((_, index) => index < results.length ? "done" : index === stepIndex && !["final", "certificate"].includes(stage) ? "current" : "todo"), [results, stepIndex, stage]);

  return <div className="quest-page">
    {stage === "intro" && <section className="quest-intro quest-topography animate-fade-up">
      <div className="quest-intro__heading"><div className="quest-intro__icon"><QuestIcon type="compass" /></div><p className="quest-intro__eyebrow">FIELD JOURNAL · SARYARKA</p><h1>GeoSaryArqa</h1><p className="quest-intro__subtitle">{t("quest_hero_subtitle")}</p></div>
      <div className="quest-intro__stats">{[["route", "quest_stat_tasks"], ["film", "quest_stat_video"], ["medal", "quest_stat_points"], ["leaf", "quest_stat_facts"]].map(([icon, label]) => <div key={label} className="quest-stat"><QuestIcon type={icon} /><p>{t(label)}</p></div>)}</div>
      <div className="quest-intro__footer"><p>{t("quest_rule1")} · {t("quest_rule2")} · {t("quest_rule3")}</p><button onClick={beginQuest} className="quest-button quest-button--gold">{t("quest_start")}</button></div>
    </section>}

    {["video", "question", "feedback"].includes(stage) && step && <section className="quest-flow animate-fade-up"><div className="quest-flow__summary"><p>{t("task_of")} {stepIndex + 1} / {questSteps.length}</p><p>{score} {t("points_short")}</p></div><div className="quest-progress"><div className="quest-route-line" style={{ width: `${((stepIndex + (stage === "feedback" ? 1 : .5)) / questSteps.length) * 100}%` }} /></div>
      <div className="quest-route">{questSteps.map((item, index) => <div key={`${item.placeId}-${index}`} className={`quest-route__place quest-route__place--${routeStatus[index]}`}><span />{l(getPlace(item.placeId).name)}</div>)}</div>
      <div className="quest-card"><div className="quest-card__header"><div className="quest-card__icon"><QuestIcon type="route" /></div><div><p>{t("task_label")} {stepIndex + 1}</p><h2>{l(place.name)}</h2></div></div>
        {stage === "video" && <div className="quest-card__body">{step.videoUrl ? <div className="quest-video"><iframe src={step.videoUrl} title={l(step.videoLabel)} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div> : <div className="quest-video-placeholder"><Illustration seed={step.placeId} category={place.category} /><button onClick={playVideo} disabled={videoWatched} aria-label="Play"><span><QuestIcon type="play" /></span></button><div><div style={{ width: `${videoProgress}%` }} /></div></div>}<p className="quest-video__title">{l(step.videoLabel)}</p><p className="quest-video__hint">{t("watch_hint")}</p><div className="quest-actions"><button onClick={() => setStage("question")} disabled={!step.videoUrl && !videoWatched} className="quest-button">{t("go_to_question")}</button>{!step.videoUrl && !videoWatched && <button onClick={() => { clearInterval(intervalRef.current); setVideoProgress(100); setVideoWatched(true); setVideoPlaying(false); }} className="quest-skip">{t("skip_video")}</button>}</div></div>}
        {stage === "question" && <div className="quest-card__body"><p className="quest-question">{l(step.question)}</p>{step.type === "choice" ? <div className="quest-options">{l(step.options).map((option, index) => <button type="button" onClick={() => setSelectedOption(index)} key={option} className={`quest-option ${selectedOption === index ? "quest-option--selected" : ""}`}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div> : <input value={textAnswer} onChange={(event) => setTextAnswer(event.target.value)} placeholder={t("your_answer_placeholder")} className="quest-text-answer" />}<button onClick={submitAnswer} disabled={step.type === "choice" ? selectedOption === null : !textAnswer.trim()} className="quest-button quest-submit">{t("answer")}</button></div>}
        {stage === "feedback" && <div className="quest-card__body"><div className={`quest-feedback ${lastCorrect ? "quest-feedback--correct" : "quest-feedback--incorrect"}`}><QuestIcon type={lastCorrect ? "check" : "compass"} /><p>{lastCorrect ? t("correct") : t("incorrect")}{lastCorrect && ` +${POINTS_PER_QUESTION}`}</p></div>{!lastCorrect && <p className="quest-correct-answer">{t("correct_answer_was")} <strong>{step.type === "choice" ? l(step.options)[step.correctIndex] : l(step.correctDisplay)}</strong></p>}<p className="quest-explanation">{l(step.explanation)}</p><button onClick={nextStep} className="quest-button quest-submit">{stepIndex + 1 < questSteps.length ? t("next_task") : t("see_result")}</button></div>}
      </div></section>}

    {stage === "final" && <section className="quest-final quest-topography animate-fade-up"><div className="quest-final__icon"><QuestIcon type="medal" /></div><h1>{t("quest_finished")}</h1><p>{t("your_result")}</p><strong>{score} / {TOTAL_POINTS}</strong><div className="quest-final__rank">{rank}</div><div className="quest-final__actions"><button onClick={() => setStage("certificate")} className="quest-button quest-button--gold">{t("get_certificate")}</button><button onClick={restartQuest} className="quest-button quest-button--outline">{t("try_again")}</button><Link to="/map" className="quest-button quest-button--outline">{t("back_to_map_btn")}</Link></div></section>}

    {stage === "certificate" && <section className="quest-certificate animate-fade-up">{!certCreated ? <div className="quest-certificate__form"><div className="quest-certificate__form-icon"><QuestIcon type="medal" /></div><h1>{t("cert_enter_name")}</h1><input value={certName} onChange={(event) => setCertName(event.target.value)} placeholder={t("cert_name_placeholder")} /><button onClick={() => certName.trim() && setCertCreated(true)} disabled={!certName.trim()} className="quest-button quest-submit">{t("cert_create")}</button><p>KZ · RU · EN — language follows the site language.</p></div> : <div><div id="certificate-print" className="quest-certificate__preview"><img src={certificateArtwork} alt="Saryarka nature and explorer illustration" className="quest-certificate__artwork"/><div className="quest-certificate__content"><div className="quest-certificate__logo"><img src={certificateLogo} alt="GeoSaryArqa" /></div><p className="quest-certificate__brand">GEOSARYARQA</p><h1>{copy.title}</h1><div className="quest-certificate__line"/><p>{copy.awarded}</p><strong>{certName}</strong><p>{copy.completed}</p><div className="quest-certificate__score">{score} / {TOTAL_POINTS} · {rank}</div><p className="quest-certificate__date">{copy.date}: {new Date().toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-GB")}</p></div></div><div className="quest-certificate__actions"><button onClick={downloadCertificate} className="quest-button quest-button--ink">{copy.download} (PDF)</button><button onClick={() => window.print()} className="quest-button">{t("cert_print")}</button><button onClick={restartQuest} className="quest-button quest-button--muted">{t("try_again")}</button></div></div>}</section>}
  </div>;
}
