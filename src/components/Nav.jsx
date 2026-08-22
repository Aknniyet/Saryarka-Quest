import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { LANGS } from "../i18n/translations";

const links = [
  { to: "/", key: "nav_home" },
  { to: "/map", key: "nav_map" },
  { to: "/places", key: "nav_places" },
  { to: "/nature", key: "nav_nature" },
  { to: "/quest", key: "nav_quest" },
  { to: "/about", key: "nav_about" },
];

export default function Nav() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-cream)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <img
            src="/saryarka-quest-logo.png"
            alt="Saryarka Quest"
            className="h-11 w-11 rounded-full object-cover shadow-sm"
          />
          <span className="font-display text-lg font-semibold tracking-tight text-[var(--color-steppe-deep)]">
            SARYARKA QUEST
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-steppe-mist)] text-[var(--color-steppe-deep)]"
                    : "text-[var(--color-ink-soft)] hover:bg-[var(--color-cream-dim)] hover:text-[var(--color-ink)]"
                }`
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-[var(--color-line)] bg-white p-1 font-mono text-xs font-medium sm:flex">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  lang === l.code
                    ? "bg-[var(--color-steppe)] text-white"
                    : "text-[var(--color-ink-soft)] hover:bg-[var(--color-cream-dim)]"
                }`}
                aria-pressed={lang === l.code}
              >
                {l.code === "kz" ? "ҚАЗ" : l.label}
              </button>
            ))}
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-line)] bg-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-[var(--color-ink)] transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-[var(--color-ink)] transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-[var(--color-ink)] transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-cream)] px-5 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-[var(--color-steppe-mist)] text-[var(--color-steppe-deep)]" : "text-[var(--color-ink-soft)]"
                  }`
                }
              >
                {t(l.key)}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-white p-1 font-mono text-xs font-medium w-fit">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded-full px-2.5 py-1 ${lang === l.code ? "bg-[var(--color-steppe)] text-white" : "text-[var(--color-ink-soft)]"}`}
              >
                {l.code === "kz" ? "ҚАЗ" : l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
