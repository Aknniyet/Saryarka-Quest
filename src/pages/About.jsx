import { useLang } from "../context/LangContext";
import "../styles/pages/shared.css";
import "../styles/pages/about.css";

export default function About() {
  const { t } = useLang();
  const tasks = ["about_task1", "about_task2", "about_task3", "about_task4", "about_task5", "about_task6"];

  return (
    <div className="page-container page-container--narrow">
      <span className="page-eyebrow">About the project</span>
      <h1 className="page-heading mt-2">{t("about_title")}</h1>

      <section className="about-section">
        <h2 className="about-section__title">{t("about_goal_title")}</h2>
        <p className="about-section__text">{t("about_goal_text")}</p>
      </section>

      <section className="about-section">
        <h2 className="about-section__title">{t("about_tasks_title")}</h2>
        <ul className="about-task-list">
          {tasks.map((k) => (
            <li key={k} className="about-task">
              <span className="about-task__mark">✦</span>
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section about-section--card">
        <h2 className="about-section__title">{t("about_project_title")}</h2>
        <p className="about-section__text">{t("about_project_text")}</p>
      </section>

      <section className="about-section about-section--author">
        <h2 className="about-section__title">{t("about_author_title")}</h2>
        <p className="about-section__text">{t("about_author_text")}</p>
      </section>
    </div>
  );
}
