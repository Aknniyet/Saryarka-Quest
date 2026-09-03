import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import SaryarkaMap from "../components/SaryarkaMap";
import NatureCard from "../components/NatureCard";
import { animals } from "../data/animals";

export default function Home() {
  const { t } = useLang();

  return <div>
    <section className="texture-topo overflow-hidden px-5 py-12 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-steppe-light)] bg-white/80 px-4 py-2 font-mono text-[11px] font-bold tracking-[.16em] text-[var(--color-steppe-deep)] shadow-sm"><span className="h-2 w-2 rounded-full bg-[var(--color-gold)]" /> SARYARKA · CENTRAL KAZAKHSTAN</span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[.96] tracking-tight text-[var(--color-steppe-deep)] sm:text-6xl">GeoSaryArqa</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--color-ink-soft)] sm:text-xl">{t("hero_line1")}<br />{t("hero_line2")} {t("hero_line3")}</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="#map" className="rounded-full bg-[var(--color-steppe)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5">{t("hero_explore_map")}</a><Link to="/quest" className="rounded-full border border-[var(--color-line)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] shadow-sm transition hover:-translate-y-0.5">{t("hero_start_quest")}</Link></div>
        </div>
        <div className="relative mx-auto w-full max-w-2xl"><div className="absolute -inset-5 rounded-[3rem] bg-[var(--color-gold-light)]/40 blur-3xl" /><div className="relative overflow-hidden rounded-[2.25rem] border-[10px] border-white bg-white shadow-[0_24px_65px_rgba(52,83,42,.2)]"><img src="/saryarka-hero-atlas.png" alt="Steppe landscape of Saryarka" className="h-[340px] w-full object-cover sm:h-[440px]" /></div></div>
      </div>
    </section>
    <section id="map" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><span className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-[var(--color-steppe)]">Saryarka field atlas</span><h2 className="mt-2 font-display text-4xl font-semibold text-[var(--color-ink)]">{t("map_title")}</h2></div><p className="max-w-md text-sm leading-relaxed text-[var(--color-ink-soft)] sm:text-right">{t("map_subtitle")}</p></div><SaryarkaMap /></section>
    <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-20"><div className="grid items-center gap-8 lg:grid-cols-[.72fr_1.28fr]"><div><span className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-[var(--color-steppe)]">Living landscape</span><h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-[var(--color-ink)]">{t("nature_subtitle")}</h2><Link to="/nature" className="mt-7 inline-block text-base font-bold text-[var(--color-steppe)] hover:underline">{t("read_more")} →</Link></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{animals.slice(0, 4).map((animal) => <NatureCard key={animal.id} item={animal} type="animals" />)}</div></div></section>
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><div className="quest-topography rounded-[2.5rem] px-6 py-14 text-center text-white shadow-[0_16px_35px_rgba(52,83,42,.16)] sm:px-12"><p className="font-mono text-[11px] font-bold uppercase tracking-[.22em] text-[var(--color-gold-light)]">Interactive field journal</p><h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">GeoSaryArqa</h2><p className="mx-auto mt-4 max-w-xl text-lg text-white/80">{t("quest_hero_subtitle")}</p><Link to="/quest" className="mt-8 inline-flex rounded-full bg-[var(--color-gold)] px-7 py-3 text-sm font-bold text-[var(--color-ink)] shadow-lg transition hover:-translate-y-0.5">{t("quest_start")}</Link></div></section>
  </div>;
}
