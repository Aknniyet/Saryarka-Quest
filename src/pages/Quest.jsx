import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { questSteps, normalizeAnswer } from "../data/quest";
import { getPlace } from "../data/places";
import Illustration from "../components/Illustration";
import { fixText } from "../i18n/translations";

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
  const [videoPlaying, setVideoPlaying] = useState(false);
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
    const artwork = await loadCertificateImage(certificateArtwork);
    const canvas = document.createElement("canvas");
    canvas.width = 1600; canvas.height = 1131;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fffdf7"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#c08a44"; ctx.lineWidth = 9; ctx.strokeRect(38, 38, 1524, 1055);
    ctx.strokeStyle = "#34532a"; ctx.lineWidth = 2; ctx.strokeRect(62, 62, 1476, 1007);
    if (artwork) ctx.drawImage(artwork, 55, 115, 1490, 838);
    ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = "#d6a339"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(70, 870); ctx.bezierCurveTo(300, 700, 420, 1020, 700, 860); ctx.bezierCurveTo(1000, 690, 1220, 760, 1530, 870); ctx.stroke(); ctx.restore();
    ctx.fillStyle = "#34532a"; ctx.beginPath(); ctx.arc(800, 175, 62, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fffdf7"; ctx.beginPath(); ctx.moveTo(755, 196); ctx.lineTo(800, 132); ctx.lineTo(845, 196); ctx.closePath(); ctx.fill();
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

  return <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8">
    {stage === "intro" && <section className="quest-topography animate-fade-up overflow-hidden rounded-[32px] border border-white/10 p-7 text-white shadow-xl sm:p-12">
      <div className="mx-auto max-w-2xl text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10"><QuestIcon type="compass" className="h-8 w-8 text-[var(--color-gold-light)]" /></div><p className="mt-5 font-mono text-xs font-semibold tracking-[.24em] text-[var(--color-gold-light)]">FIELD JOURNAL · SARYARKA</p><h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">GeoSaryArqa</h1><p className="mx-auto mt-4 max-w-lg text-white/75">{t("quest_hero_subtitle")}</p></div>
      <div className="mt-9 grid gap-3 sm:grid-cols-4">{[["route", "quest_stat_tasks"], ["film", "quest_stat_video"], ["medal", "quest_stat_points"], ["leaf", "quest_stat_facts"]].map(([icon, label]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.08] p-4"><QuestIcon type={icon} className="h-5 w-5 text-[var(--color-gold-light)]" /><p className="mt-4 text-sm font-medium">{t(label)}</p></div>)}</div>
      <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row"><p className="max-w-xl text-sm leading-relaxed text-white/70">{t("quest_rule1")} · {t("quest_rule2")} · {t("quest_rule3")}</p><button onClick={beginQuest} className="rounded-full bg-[var(--color-gold)] px-7 py-3 text-sm font-bold text-[var(--color-ink)] shadow-md transition hover:-translate-y-0.5">{t("quest_start")}</button></div>
    </section>}

    {["video", "question", "feedback"].includes(stage) && step && <section className="animate-fade-up"><div className="mb-5 flex items-center justify-between"><p className="font-mono text-xs font-bold tracking-wider text-[var(--color-steppe-deep)]">{t("task_of")} {stepIndex + 1} / {questSteps.length}</p><p className="text-sm font-semibold text-[var(--color-ink-soft)]">{score} {t("points_short")}</p></div><div className="mb-7 h-1.5 overflow-hidden rounded-full bg-[var(--color-cream-dim)]"><div className="quest-route-line h-full rounded-full transition-all duration-500" style={{ width: `${((stepIndex + (stage === "feedback" ? 1 : .5)) / questSteps.length) * 100}%` }} /></div>
      <div className="mb-6 flex flex-wrap items-center gap-2">{questSteps.map((item, index) => <div key={item.placeId} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${routeStatus[index] === "current" ? "border-[var(--color-steppe)] bg-[var(--color-steppe-mist)] font-bold text-[var(--color-steppe-deep)]" : "border-[var(--color-line)] text-[var(--color-ink-soft)]"}`}><span className={`h-1.5 w-1.5 rounded-full ${routeStatus[index] === "done" ? "bg-[var(--color-lake)]" : routeStatus[index] === "current" ? "bg-[var(--color-steppe)]" : "bg-[var(--color-line)]"}`} />{l(getPlace(item.placeId).name)}</div>)}</div>
      <div className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-white shadow-sm"><div className="flex items-center gap-4 border-b border-[var(--color-line)] bg-[var(--color-cream)] px-6 py-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-steppe-mist)] text-[var(--color-steppe-deep)]"><QuestIcon type="route" className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">{t("task_label")} {stepIndex + 1}</p><h2 className="font-display text-xl font-semibold">{l(place.name)}</h2></div></div>
        {stage === "video" && <div className="p-6"><div className="relative overflow-hidden rounded-2xl"><Illustration seed={step.placeId} category={place.category} className="h-52 w-full sm:h-64" /><button onClick={playVideo} disabled={videoWatched} aria-label="Play" className="absolute inset-0 grid place-items-center bg-[var(--color-ink)]/15 transition hover:bg-[var(--color-ink)]/25 disabled:bg-transparent"><span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[var(--color-steppe-deep)] shadow-lg"><QuestIcon type="play" className="h-7 w-7" /></span></button><div className="absolute inset-x-0 bottom-0 h-1 bg-black/20"><div className="h-full bg-[var(--color-gold)]" style={{ width: `${videoProgress}%` }} /></div></div><p className="mt-4 font-medium">{l(step.videoLabel)}</p><p className="mt-1 text-sm text-[var(--color-ink-soft)]">{t("watch_hint")}</p><div className="mt-5 flex gap-3"><button onClick={() => setStage("question")} disabled={!videoWatched} className="rounded-full bg-[var(--color-steppe)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{t("go_to_question")}</button>{!videoWatched && <button onClick={() => { clearInterval(intervalRef.current); setVideoProgress(100); setVideoWatched(true); setVideoPlaying(false); }} className="text-sm font-medium text-[var(--color-ink-soft)] underline">{t("skip_video")}</button>}</div></div>}
        {stage === "question" && <div className="p-6"><p className="font-display text-xl font-semibold leading-relaxed">{l(step.question)}</p>{step.type === "choice" ? <div className="mt-5 grid gap-2">{l(step.options).map((option, index) => <button type="button" onClick={() => setSelectedOption(index)} key={option} className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition ${selectedOption === index ? "border-[var(--color-steppe)] bg-[var(--color-steppe-mist)]" : "border-[var(--color-line)] hover:border-[var(--color-steppe-light)]"}`}><span className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${selectedOption === index ? "border-[var(--color-steppe)] bg-[var(--color-steppe)] text-white" : "border-[var(--color-line)]"}`}>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div> : <input value={textAnswer} onChange={(event) => setTextAnswer(event.target.value)} placeholder={t("your_answer_placeholder")} className="mt-5 w-full rounded-xl border border-[var(--color-line)] px-4 py-3 outline-none focus:border-[var(--color-steppe)]" />}<button onClick={submitAnswer} disabled={step.type === "choice" ? selectedOption === null : !textAnswer.trim()} className="mt-6 rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{t("answer")}</button></div>}
        {stage === "feedback" && <div className="p-6"><div className={`flex items-center gap-3 rounded-2xl p-5 ${lastCorrect ? "bg-[var(--color-steppe-mist)] text-[var(--color-steppe-deep)]" : "bg-[var(--color-sand-mist)] text-[#7a5a12]"}`}><QuestIcon type={lastCorrect ? "check" : "compass"} className="h-6 w-6" /><p className="font-semibold">{lastCorrect ? t("correct") : t("incorrect")}{lastCorrect && ` +${POINTS_PER_QUESTION}`}</p></div>{!lastCorrect && <p className="mt-4 text-sm">{t("correct_answer_was")} <strong>{step.type === "choice" ? l(step.options)[step.correctIndex] : l(step.correctDisplay)}</strong></p>}<p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">{l(step.explanation)}</p><button onClick={nextStep} className="mt-6 rounded-full bg-[var(--color-steppe)] px-6 py-2.5 text-sm font-semibold text-white">{stepIndex + 1 < questSteps.length ? t("next_task") : t("see_result")}</button></div>}
      </div></section>}

    {stage === "final" && <section className="quest-topography animate-fade-up rounded-[32px] p-8 text-center text-white shadow-xl sm:p-12"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10"><QuestIcon type="medal" className="h-8 w-8 text-[var(--color-gold-light)]" /></div><h1 className="mt-5 font-display text-4xl font-semibold">{t("quest_finished")}</h1><p className="mt-5 text-sm text-white/70">{t("your_result")}</p><p className="font-display text-5xl font-semibold text-[var(--color-gold-light)]">{score} / {TOTAL_POINTS}</p><div className="mx-auto mt-5 w-fit rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold">{rank}</div><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={() => setStage("certificate")} className="rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-bold text-[var(--color-ink)]">{t("get_certificate")}</button><button onClick={restartQuest} className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold">{t("try_again")}</button><Link to="/map" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold">{t("back_to_map_btn")}</Link></div></section>}

    {stage === "certificate" && <section className="animate-fade-up">{!certCreated ? <div className="rounded-[28px] border border-[var(--color-line)] bg-white p-8 text-center shadow-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-steppe-mist)] text-[var(--color-steppe-deep)]"><QuestIcon type="medal" className="h-7 w-7" /></div><h1 className="mt-5 font-display text-2xl font-semibold">{t("cert_enter_name")}</h1><input value={certName} onChange={(event) => setCertName(event.target.value)} placeholder={t("cert_name_placeholder")} className="mx-auto mt-5 block w-full max-w-sm rounded-xl border border-[var(--color-line)] px-4 py-3 text-center outline-none focus:border-[var(--color-steppe)]"/><button onClick={() => certName.trim() && setCertCreated(true)} disabled={!certName.trim()} className="mt-5 rounded-full bg-[var(--color-steppe)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">{t("cert_create")}</button><p className="mt-4 text-xs text-[var(--color-ink-soft)]">KZ · RU · EN — language follows the site language.</p></div> : <div><div id="certificate-print" className="relative overflow-hidden rounded-[28px] border-4 border-double border-[var(--color-gold)] bg-[#fffdf7] px-6 py-10 text-center shadow-md sm:px-14"><img src={certificateArtwork} alt="Saryarka nature and explorer illustration" className="pointer-events-none absolute inset-0 h-full w-full object-fill"/><div className="relative z-10"><div className="mx-auto h-16 w-16 overflow-hidden rounded-full"><img src="/geosaryarqa-logo.png" alt="GeoSaryArqa" className="h-full w-full scale-[1.25] object-cover"/></div><p className="mt-4 font-mono text-[11px] font-bold tracking-[.25em] text-[var(--color-steppe-deep)]">GEOSARYARQA</p><h1 className="mt-5 font-display text-4xl font-bold tracking-wide text-[var(--color-ink)]">{copy.title}</h1><div className="mx-auto mt-4 h-1 w-20 bg-[var(--color-gold)]"/><p className="mt-7 text-sm text-[var(--color-ink-soft)]">{copy.awarded}</p><p className="mt-2 font-display text-3xl font-semibold text-[var(--color-steppe-deep)]">{certName}</p><p className="mx-auto mt-7 max-w-lg text-sm leading-relaxed text-[var(--color-ink-soft)]">{copy.completed}</p><div className="mx-auto mt-7 w-fit rounded-full bg-[var(--color-gold-light)] px-5 py-2 text-sm font-semibold text-[#7a5a12]">{score} / {TOTAL_POINTS} · {rank}</div><p className="mt-10 font-mono text-[11px] text-[var(--color-ink-soft)]">{copy.date}: {new Date().toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-GB")}</p></div></div><div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden"><button onClick={downloadCertificate} className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-white">{copy.download} (PDF)</button><button onClick={() => window.print()} className="rounded-full bg-[var(--color-steppe)] px-6 py-3 text-sm font-semibold text-white">{t("cert_print")}</button><button onClick={restartQuest} className="rounded-full bg-[var(--color-cream-dim)] px-6 py-3 text-sm font-semibold">{t("try_again")}</button></div></div>}</section>}
  </div>;
}
