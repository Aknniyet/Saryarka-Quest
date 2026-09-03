import { useLang } from "../context/LangContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-cream-dim)]">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-sm">
              <img
                src="/geosaryarqa-logo.png"
                alt="GeoSaryArqa"
                className="h-full w-full scale-[1.25] object-cover"
              />
            </div>

            <span className="font-display text-base font-semibold text-[var(--color-steppe-deep)]">GEOSARYARQA</span>
          </div>
          <p className="text-sm text-[var(--color-ink-soft)]">{t("footer_tagline")}</p>
        </div>
        <div className="mt-4 border-t border-[var(--color-line)] pt-4 text-xs text-[var(--color-ink-soft)]">
          {t("footer_rights")} · © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
