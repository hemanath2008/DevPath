import { Link } from 'react-router-dom';
import { languageGroups, languages } from '../content/languages';

export function HomePage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <section className="card" style={{ padding: 28 }}>
        <div className="pill" style={{ width: 'fit-content' }}>All languages. One engine.</div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', lineHeight: 1.05, margin: '18px 0' }}>
          Learn Coding. Write Code. Run It. Understand It. In Any Language.
        </h1>
        <p className="muted" style={{ maxWidth: 760, fontSize: 18 }}>
          CodeEasy is a language-agnostic learning platform with a shared core for lessons,
          syntax, compiler workflows, practice, and progress tracking.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
          <Link className="btn" to="/learn">Start Learning</Link>
          <Link className="btn secondary" to="/compiler">Try Compiler</Link>
        </div>
      </section>

      <section className="grid two">
        <div className="card" style={{ padding: 20 }}>
          <h2>Popular languages</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {languageGroups.popular.map((id) => {
              const language = languages.find((item) => item.id === id)!;
              return (
                <span key={id} className="pill">{language.displayName}</span>
              );
            })}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2>What you can do</h2>
          <ul className="muted">
            <li>Learn from beginner-friendly roadmaps</li>
            <li>Search syntax examples across languages</li>
            <li>Run code in the browser-backed compiler</li>
            <li>Connect learning progress to Supabase</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
