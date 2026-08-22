import { useLang } from "../context/LangContext";

export default function About() {
  const { t } = useLang();
  const tasks = ["about_task1", "about_task2", "about_task3", "about_task4", "about_task5", "about_task6"];

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-steppe)]">About the project</span>
      <h1 className="page-heading mt-2">{t("about_title")}</h1>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-[var(--color-steppe-deep)]">{t("about_goal_title")}</h2>
        <p className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">{t("about_goal_text")}</p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-[var(--color-steppe-deep)]">{t("about_tasks_title")}</h2>
        <ul className="mt-3 space-y-2">
          {tasks.map((k) => (
            <li key={k} className="flex gap-2 text-[var(--color-ink-soft)]">
              <span className="text-[var(--color-steppe)]">✦</span>
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-6">
        <h2 className="font-display text-xl font-semibold text-[var(--color-steppe-deep)]">{t("about_project_title")}</h2>
        <p className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">{t("about_project_text")}</p>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-cream-dim)] p-6">
        <h2 className="font-display text-xl font-semibold text-[var(--color-steppe-deep)]">{t("about_author_title")}</h2>
        <p className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">{t("about_author_text")}</p>
      </section>
    </div>
  );
}
