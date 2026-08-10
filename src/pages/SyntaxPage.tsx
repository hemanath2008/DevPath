import { syntaxSearchSamples } from '../content/languages';

export function SyntaxPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <section className="card" style={{ padding: 24 }}>
        <h1>Syntax encyclopedia</h1>
        <p className="muted">Searchable examples across languages, backed by shared content components.</p>
      </section>
      <div className="grid two">
        {syntaxSearchSamples.map((item) => (
          <article key={`${item.language}-${item.topic}`} className="card" style={{ padding: 20 }}>
            <div className="pill">{item.language}</div>
            <h3>{item.topic}</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{item.snippet}</pre>
          </article>
        ))}
      </div>
    </div>
  );
}
