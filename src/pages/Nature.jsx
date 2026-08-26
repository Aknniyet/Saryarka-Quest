import { useState } from "react";
import { useLang } from "../context/LangContext";
import { animals } from "../data/animals";
import { plants } from "../data/plants";
import NatureCard from "../components/NatureCard";

export default function Nature() {
  const { t } = useLang();
  const [tab, setTab] = useState("animals");

  const list = tab === "animals" ? animals : plants;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-6">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-steppe)]">Flora & fauna</span>
        <h1 className="page-heading mt-2">{t("nature_title")}</h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">{t("nature_subtitle")}</p>
      </div>

      <div className="mb-8 inline-flex rounded-full border border-[var(--color-line)] bg-white p-1">
        <button
          onClick={() => setTab("animals")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "animals" ? "bg-[var(--color-steppe)] text-white" : "text-[var(--color-ink-soft)]"
          }`}
        >
          🦌 {t("animals")}
        </button>
        <button
          onClick={() => setTab("plants")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "plants" ? "bg-[var(--color-steppe)] text-white" : "text-[var(--color-ink-soft)]"
          }`}
        >
          🌿 {t("plants")}
        </button>
      </div>

      {tab === "animals" && (
        <section className="mb-10 grid overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-[#f6f2e9] shadow-[0_18px_45px_rgba(49,67,45,0.09)] md:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col justify-center px-7 py-9 sm:px-10">
            <span className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-steppe)]">
              Жануарлар картасы
            </span>
            <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
              Сарыарқаның жануарлар әлемі
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-[var(--color-ink-soft)]">
              Қорықтар мен далалы аймақтарда мекендейтін жануарларды бір картадан таныңыз.
            </p>
          </div>
          <div className="bg-[#253a2b] p-4 sm:p-5">
            <img
              src="/saryarka-animals-map.png"
              alt="Сарыарқа аңдары картасы"
              className="mx-auto h-full max-h-[460px] w-full rounded-[1.4rem] object-cover object-center"
            />
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((item) => (
          <NatureCard key={item.id} item={item} type={tab} />
        ))}
      </div>
    </div>
  );
}
