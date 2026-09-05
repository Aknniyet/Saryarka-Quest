import { useLang } from "../context/LangContext";
import SaryarkaMap from "../components/SaryarkaMap";
import "../styles/pages/shared.css";

export default function MapPage() {
  const { t } = useLang();
  return (
    <div className="page-container">
      <div className="page-intro">
        <span className="page-eyebrow">Saryarka atlas</span>
        <h1 className="page-heading mt-2">{t("map_title")}</h1>
        <p className="page-description">{t("map_subtitle")}</p>
      </div>
      <SaryarkaMap height="h-[460px] sm:h-[560px] lg:h-[680px]" />
    </div>
  );
}
