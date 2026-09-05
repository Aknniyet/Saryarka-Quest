import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import SaryarkaMap from "../components/SaryarkaMap";
import NatureCard from "../components/NatureCard";
import { animals } from "../data/animals";
import "../styles/pages/home.css";
import "../styles/pages/shared.css";

export default function Home() {
  const { t } = useLang();

  return <div>
    <section className="home-hero">
      <div className="home-hero__grid">
        <div className="home-hero__copy">
          <span className="home-hero__badge"><span className="home-hero__badge-dot" /> SARYARKA · CENTRAL KAZAKHSTAN</span>
          <h1 className="home-hero__title">GeoSaryArqa</h1>
          <p className="home-hero__text">{t("hero_line1")}<br />{t("hero_line2")} {t("hero_line3")}</p>
          <div className="home-actions"><a href="#map" className="home-button home-button--primary">{t("hero_explore_map")}</a><Link to="/quest" className="home-button home-button--secondary">{t("hero_start_quest")}</Link></div>
        </div>
        <div className="home-hero__visual"><div className="home-hero__glow" /><div className="home-hero__image-frame"><img src="/saryarka-hero-atlas.png" alt="Steppe landscape of Saryarka" className="home-hero__image" /></div></div>
      </div>
    </section>
    <section id="map" className="home-section home-section--map"><div className="home-section__heading"><div><span className="page-eyebrow">Saryarka field atlas</span><h2 className="home-section__title">{t("map_title")}</h2></div><p className="home-section__description">{t("map_subtitle")}</p></div><SaryarkaMap /></section>
    <section className="home-section home-section--nature"><div className="home-nature"><div><span className="page-eyebrow">Living landscape</span><h2 className="home-nature__title">{t("nature_subtitle")}</h2><Link to="/nature" className="home-nature__link">{t("read_more")} →</Link></div><div className="home-nature__grid">{animals.slice(0, 4).map((animal) => <NatureCard key={animal.id} item={animal} type="animals" />)}</div></div></section>
    <section className="home-section home-section--quest"><div className="home-quest"><p className="page-eyebrow text-[var(--color-gold-light)]">Interactive field journal</p><h2 className="home-quest__title">GeoSaryArqa</h2><p className="home-quest__text">{t("quest_hero_subtitle")}</p><Link to="/quest" className="home-quest__button">{t("quest_start")}</Link></div></section>
  </div>;
}
