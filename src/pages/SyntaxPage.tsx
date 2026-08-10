import { useState, useEffect } from 'react';
import { languages } from '../content/languages';
import { getSyntaxExamples } from '../lib/db';
import type { MockSyntaxExample } from '../lib/db';

export function SyntaxPage() {
  const [examples, setExamples] = useState<MockSyntaxExample[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<string>('all');
  
  // Comparative view state
  const [compareMode, setCompareMode] = useState(false);
  const [compareTopic, setCompareTopic] = useState('basics');
  const [selectedCompareLangs, setSelectedCompareLangs] = useState<string[]>(['python', 'javascript']);

  useEffect(() => {
    getSyntaxExamples().then((data) => setExamples(data));
  }, []);

  // Filtered list for standard view
  const filteredExamples = examples.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.codeExample.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLang = selectedLang === 'all' || item.languageId.toLowerCase() === selectedLang.toLowerCase();
    
    return matchesSearch && matchesLang;
  });

  // Topics available for comparison
  const topicsList = [
    { id: 'basics', title: 'Variable Declaration' },
    { id: 'control-flow', title: 'Loops & Iteration' },
    { id: 'functions', title: 'Functions & Methods' }
  ];

  function toggleCompareLang(langId: string) {
    if (selectedCompareLangs.includes(langId)) {
      if (selectedCompareLangs.length > 1) {
        setSelectedCompareLangs(selectedCompareLangs.filter(id => id !== langId));
      }
    } else {
      setSelectedCompareLangs([...selectedCompareLangs, langId]);
    }
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* Header Panel */}
      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>Syntax Encyclopedia</h1>
            <p className="muted" style={{ margin: 0 }}>Lookup code structure or compare syntax patterns across languages side-by-side.</p>
          </div>
          <div>
            <button
              className="btn"
              onClick={() => setCompareMode(!compareMode)}
              style={{ background: compareMode ? '#6366f1' : 'rgba(99, 102, 241, 0.15)' }}
            >
              {compareMode ? '➔ Standard View' : '⚡ Compare Languages'}
            </button>
          </div>
        </div>
      </section>

      {/* Main Comparative View */}
      {compareMode ? (
        <div className="grid" style={{ gap: 20 }}>
          <section className="card" style={{ padding: 20 }}>
            <h3>Comparison Setup</h3>
            <div className="grid two" style={{ gap: 20, alignItems: 'start' }}>
              <div>
                <span className="muted" style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>1. Select Topic</span>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {topicsList.map(topic => (
                    <button
                      key={topic.id}
                      className={`btn ${compareTopic === topic.id ? '' : 'secondary'}`}
                      style={{ padding: '6px 14px', fontSize: 13 }}
                      onClick={() => setCompareTopic(topic.id)}
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="muted" style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>2. Select Languages (Min. 2)</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {languages.map(lang => {
                    const isChecked = selectedCompareLangs.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        className={`btn ${isChecked ? '' : 'secondary'}`}
                        style={{ padding: '6px 12px', fontSize: 13, border: isChecked ? '1px solid #818cf8' : undefined }}
                        onClick={() => toggleCompareLang(lang.id)}
                      >
                        {lang.displayName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Matrix columns display */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${selectedCompareLangs.length}, minmax(0, 1fr))`, gap: 16 }}>
            {selectedCompareLangs.map(langId => {
              const langConfig = languages.find(l => l.id === langId);
              const example = examples.find(ex => ex.languageId === langId && ex.topicId === compareTopic);

              return (
                <article key={langId} className="card animate-fade-in" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="pill" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{langConfig?.displayName || langId}</span>
                  </div>

                  {example ? (
                    <div>
                      <h4 style={{ margin: '0 0 10px 0' }}>{example.title}</h4>
                      <pre style={{ overflowX: 'auto', background: '#080a15', borderRadius: 8, padding: 12, fontSize: 13 }}>
                        <code>{example.codeExample}</code>
                      </pre>
                      <p className="muted" style={{ fontSize: 14, marginTop: 12 }}>{example.explanation}</p>
                      {example.output && (
                        <div style={{ marginTop: 12 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#818cf8' }}>Expected Console Output:</span>
                          <pre style={{ margin: '4px 0 0 0', padding: 8, background: '#03050c', border: 'none', color: '#10b981', fontSize: 12 }}>
                            <code>{example.output}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="muted" style={{ margin: 0, padding: '24px 0', textAlign: 'center' }}>No example listed for this language topic yet.</p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard Filterable Syntax Cards View */
        <div className="grid" style={{ gap: 20 }}>
          {/* Filters card */}
          <section className="card" style={{ padding: 16 }}>
            <div className="grid two" style={{ gap: 16 }}>
              <input
                type="text"
                placeholder="Search syntax title, keywords or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.displayName}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Cards Grid */}
          <div className="grid three" style={{ gap: 20 }}>
            {filteredExamples.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center' }}>
                <h3 className="muted">No syntax records found</h3>
                <p className="muted">Try refining your keyword query or changing the language selection.</p>
              </div>
            ) : (
              filteredExamples.map((item) => {
                const langConfig = languages.find(l => l.id === item.languageId);
                return (
                  <article key={item.id} className="card glow animate-fade-in" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span className="pill">{langConfig?.displayName || item.languageId}</span>
                        <span className="muted" style={{ fontSize: 12, textTransform: 'capitalize' }}>{item.topicId.replace('-', ' ')}</span>
                      </div>
                      <h3 style={{ fontSize: 18, marginBottom: 8 }}>{item.title}</h3>
                      <pre style={{ background: '#080a15', borderRadius: 8, padding: 12, fontSize: 13 }}>
                        <code>{item.codeExample}</code>
                      </pre>
                      <p className="muted" style={{ fontSize: 14, margin: '12px 0 0 0' }}>{item.explanation}</p>
                    </div>

                    {item.output && (
                      <div style={{ marginTop: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#818cf8' }}>Expected Console Output:</span>
                        <pre style={{ margin: '4px 0 0 0', padding: 8, background: '#03050c', border: 'none', color: '#10b981', fontSize: 12 }}>
                          <code>{item.output}</code>
                        </pre>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
