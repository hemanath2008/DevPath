import { languageGroups, languages, learningRoadmap } from '../content/languages';

function LanguageGroup({ title, ids }: { title: string; ids: readonly string[] }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {ids.map((id) => {
          const language = languages.find((item) => item.id === id)!;
          return <span key={id} className="pill">{language.displayName}</span>;
        })}
      </div>
    </div>
  );
}

export function LearnPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <section className="card" style={{ padding: 24 }}>
        <h1>Learn</h1>
        <p className="muted">Start with one language, then reuse the same learning model everywhere.</p>
      </section>

      <div className="grid three">
        <LanguageGroup title="Popular" ids={languageGroups.popular} />
        <LanguageGroup title="Also available" ids={languageGroups.available} />
        <LanguageGroup title="More" ids={languageGroups.more} />
      </div>

      <section className="card" style={{ padding: 24 }}>
        <h2>Shared roadmap</h2>
        <ol className="muted">
          {learningRoadmap.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
