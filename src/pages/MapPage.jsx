import { useLang } from "../context/LangContext";
import SaryarkaMap from "../components/SaryarkaMap";

export default function MapPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-6">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-steppe)]">Saryarka atlas</span>
        <h1 className="page-heading mt-2">{t("map_title")}</h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">{t("map_subtitle")}</p>
      </div>
      <SaryarkaMap height="h-[460px] sm:h-[560px] lg:h-[680px]" />
    </div>
  );
}
