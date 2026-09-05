import { useLang } from "../context/LangContext";
import "../styles/components/layout.css";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <div className="site-footer__content">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <div className="site-footer__logo">
              <img
                src="/geosaryarqa-logo.png"
                alt="GeoSaryArqa"
              />
            </div>

            <span className="site-footer__name">GEOSARYARQA</span>
          </div>
          <p className="site-footer__tagline">{t("footer_tagline")}</p>
        </div>
        <div className="site-footer__rights">
          {t("footer_rights")} · © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
