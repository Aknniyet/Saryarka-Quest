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
  kz: { title: "СЕРТИФИКАТ", awarded: "Осы сертификат", completed: "Saryarka Quest білім беру маршрутын сәтті аяқтағаны үшін беріледі", download: "Сертификатты жүктеу", date: "Берілген күні" },
  ru: { title: "СЕРТИФИКАТ", awarded: "Настоящий сертификат выдан", completed: "за успешное прохождение образовательного маршрута Saryarka Quest", download: "Скачать сертификат", date: "Дата выдачи" },
  en: { title: "CERTIFICATE", awarded: "This certificate is awarded to", completed: "for successfully completing the Saryarka Quest learning route", download: "Download certificate", date: "Issued" },
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

function svgEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
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
  function downloadCertificate() {
    const date = new Date().toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-GB");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1131" viewBox="0 0 1600 1131"><rect width="1600" height="1131" fill="#fffdf7"/><rect x="35" y="35" width="1530" height="1061" rx="28" fill="none" stroke="#c08a44" stroke-width="8"/><rect x="58" y="58" width="1484" height="1015" rx="20" fill="none" stroke="#34532a" stroke-width="2"/><path d="M70 850 C300 690 420 1010 700 850 S1100 670 1530 860" fill="none" stroke="#d6a339" stroke-width="7" opacity=".45"/><circle cx="800" cy="175" r="62" fill="#34532a"/><path d="M755 196 800 132l45 64Z" fill="#fffdf7"/><text x="800" y="270" text-anchor="middle" font-family="Georgia,serif" font-size="31" font-weight="700" fill="#34532a" letter-spacing="6">SARYARKA QUEST</text><text x="800" y="390" text-anchor="middle" font-family="Georgia,serif" font-size="78" font-weight="700" fill="#232b1e">${svgEscape(copy.title)}</text><path d="M670 430h260" stroke="#d6a339" stroke-width="5"/><text x="800" y="510" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="#4c5642">${svgEscape(copy.awarded)}</text><text x="800" y="590" text-anchor="middle" font-family="Georgia,serif" font-size="56" font-weight="700" fill="#34532a">${svgEscape(certName)}</text><text x="800" y="675" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" fill="#4c5642">${svgEscape(copy.completed)}</text><text x="800" y="750" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" fill="#4c5642">${score} / ${TOTAL_POINTS} · ${svgEscape(rank)}</text><text x="800" y="1000" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#4c5642">${svgEscape(copy.date)}: ${date}</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `Saryarka-Quest-${certName.trim().replace(/\s+/g, "-") || "certificate"}.svg`; link.click(); URL.revokeObjectURL(url);
  }
  const routeStatus = useMemo(() => questSteps.map((_, index) => index < results.length ? "done" : index === stepIndex && !["final", "certificate"].includes(stage) ? "current" : "todo"), [results, stepIndex, stage]);

  return <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8">
    {stage === "intro" && <section className="quest-topography animate-fade-up overflow-hidden rounded-[32px] border border-white/10 p-7 text-white shadow-xl sm:p-12">
      <div className="mx-auto max-w-2xl text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10"><QuestIcon type="compass" className="h-8 w-8 text-[var(--color-gold-light)]" /></div><p className="mt-5 font-mono text-xs font-semibold tracking-[.24em] text-[var(--color-gold-light)]">FIELD JOURNAL · SARYARKA</p><h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Saryarka Quest</h1><p className="mx-auto mt-4 max-w-lg text-white/75">{t("quest_hero_subtitle")}</p></div>
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

    {stage === "certificate" && <section className="animate-fade-up">{!certCreated ? <div className="rounded-[28px] border border-[var(--color-line)] bg-white p-8 text-center shadow-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-steppe-mist)] text-[var(--color-steppe-deep)]"><QuestIcon type="medal" className="h-7 w-7" /></div><h1 className="mt-5 font-display text-2xl font-semibold">{t("cert_enter_name")}</h1><input value={certName} onChange={(event) => setCertName(event.target.value)} placeholder={t("cert_name_placeholder")} className="mx-auto mt-5 block w-full max-w-sm rounded-xl border border-[var(--color-line)] px-4 py-3 text-center outline-none focus:border-[var(--color-steppe)]"/><button onClick={() => certName.trim() && setCertCreated(true)} disabled={!certName.trim()} className="mt-5 rounded-full bg-[var(--color-steppe)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">{t("cert_create")}</button><p className="mt-4 text-xs text-[var(--color-ink-soft)]">KZ · RU · EN — language follows the site language.</p></div> : <div><div id="certificate-print" className="relative overflow-hidden rounded-[28px] border-4 border-double border-[var(--color-gold)] bg-[#fffdf7] px-6 py-10 text-center shadow-md sm:px-14"><img src="/saryarka-quest-logo.png" alt="Saryarka Quest" className="mx-auto h-16 w-16 rounded-full object-cover"/><p className="mt-4 font-mono text-[11px] font-bold tracking-[.25em] text-[var(--color-steppe-deep)]">SARYARKA QUEST</p><h1 className="mt-5 font-display text-4xl font-bold tracking-wide text-[var(--color-ink)]">{copy.title}</h1><div className="mx-auto mt-4 h-1 w-20 bg-[var(--color-gold)]"/><p className="mt-7 text-sm text-[var(--color-ink-soft)]">{copy.awarded}</p><p className="mt-2 font-display text-3xl font-semibold text-[var(--color-steppe-deep)]">{certName}</p><p className="mx-auto mt-7 max-w-lg text-sm leading-relaxed text-[var(--color-ink-soft)]">{copy.completed}</p><div className="mx-auto mt-7 w-fit rounded-full bg-[var(--color-gold-light)] px-5 py-2 text-sm font-semibold text-[#7a5a12]">{score} / {TOTAL_POINTS} · {rank}</div><p className="mt-10 font-mono text-[11px] text-[var(--color-ink-soft)]">{copy.date}: {new Date().toLocaleDateString()}</p></div><div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden"><button onClick={downloadCertificate} className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-white">{copy.download} (SVG)</button><button onClick={() => window.print()} className="rounded-full bg-[var(--color-steppe)] px-6 py-3 text-sm font-semibold text-white">{t("cert_print")}</button><button onClick={restartQuest} className="rounded-full bg-[var(--color-cream-dim)] px-6 py-3 text-sm font-semibold">{t("try_again")}</button></div></div>}</section>}
  </div>;
}
