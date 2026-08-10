import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { languages } from '../content/languages';
import { getProjects, MockProject } from '../lib/db';

export function ProjectsPage() {
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(null);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects().then(data => setProjects(data));
  }, []);

  function handleOpenInCompiler(starterCode?: string, languageId?: string) {
    if (!starterCode) return;
    // Save template dynamically to local storage and navigate
    localStorage.setItem('codeeasy_compiler_preset_code', starterCode);
    if (languageId) {
      localStorage.setItem('codeeasy_compiler_preset_lang', languageId);
      localStorage.setItem('codeeasy_language', languageId); // Sync global language choice
      window.dispatchEvent(new Event('codeeasy_language_changed'));
    }
    navigate('/compiler');
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* Header card */}
      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>Guided Builder Projects</h1>
            <p className="muted" style={{ margin: 0 }}>Combine lessons into functional command-line programs, parsers, and utilities.</p>
          </div>
          {selectedProject && (
            <button className="btn secondary" onClick={() => setSelectedProject(null)}>
              ➔ Project Catalog
            </button>
          )}
        </div>
      </section>

      {/* Catalog listing */}
      {!selectedProject ? (
        <div className="grid two" style={{ gap: 20 }}>
          {projects.map(proj => (
            <article key={proj.id} className="card glow animate-fade-in" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {proj.languageIds.map(langId => {
                      const langConfig = languages.find(l => l.id === langId);
                      return <span key={langId} className="pill" style={{ padding: '2px 8px', fontSize: 11 }}>{langConfig?.displayName || langId}</span>;
                    })}
                  </div>
                  <span className="muted" style={{ fontSize: 12, textTransform: 'capitalize', fontWeight: 'bold' }}>{proj.level}</span>
                </div>

                <h3 style={{ fontSize: 20, marginBottom: 8 }}>{proj.title}</h3>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{proj.description}</p>
              </div>

              <button className="btn" onClick={() => {
                setSelectedProject(proj);
                setActiveMilestoneIndex(0);
              }} style={{ width: 'fit-content' }}>
                Open Project Guide
              </button>
            </article>
          ))}
        </div>
      ) : (
        /* Dynamic project detail with active milestone sidebar */
        <div className="grid" style={{ gridTemplateColumns: '320px 1fr', gap: 20 }}>
          
          {/* Sidebar steps list */}
          <div className="grid" style={{ gap: 12, alignContent: 'start' }}>
            <section className="card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Project Milestones</h3>
              <div className="grid" style={{ gap: 10 }}>
                {selectedProject.milestones.map((ms, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      padding: 12,
                      cursor: 'pointer',
                      background: activeMilestoneIndex === idx ? 'rgba(99, 102, 241, 0.08)' : undefined,
                      borderColor: activeMilestoneIndex === idx ? '#6366f1' : undefined
                    }}
                    onClick={() => setActiveMilestoneIndex(idx)}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: activeMilestoneIndex === idx ? '#818cf8' : '#94a3b8' }}>MILESTONE {idx + 1}</span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: 14 }}>{ms.title}</h4>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Active step details */}
          <section className="card animate-fade-in" style={{ padding: 24 }}>
            {selectedProject.milestones[activeMilestoneIndex] ? (
              <div>
                <span className="pill" style={{ marginBottom: 10 }}>MILESTONE {activeMilestoneIndex + 1} OF {selectedProject.milestones.length}</span>
                <h2 style={{ fontSize: 24, marginBottom: 10 }}>{selectedProject.milestones[activeMilestoneIndex].title}</h2>
                
                <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
                  {selectedProject.milestones[activeMilestoneIndex].description}
                </p>

                {selectedProject.milestones[activeMilestoneIndex].starterCode && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>Starter Code Template:</span>
                      <button
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => handleOpenInCompiler(
                          selectedProject.milestones[activeMilestoneIndex].starterCode,
                          selectedProject.languageIds[0]
                        )}
                      >
                        ⚡ Load in Compiler
                      </button>
                    </div>
                    <pre style={{ margin: 0, background: '#080a15', fontSize: 13, border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                      <code>{selectedProject.milestones[activeMilestoneIndex].starterCode}</code>
                    </pre>
                  </div>
                )}

                {selectedProject.milestones[activeMilestoneIndex].solutionHint && (
                  <div className="card" style={{ marginTop: 24, padding: 16, background: 'rgba(99, 102, 241, 0.04)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
                    <h4 style={{ margin: '0 0 6px 0', color: '#818cf8' }}>💡 Implementation Tip</h4>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                      {selectedProject.milestones[activeMilestoneIndex].solutionHint}
                    </p>
                  </div>
                )}

                {/* Navigation controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
                  <button
                    className="btn secondary"
                    disabled={activeMilestoneIndex === 0}
                    onClick={() => setActiveMilestoneIndex(prev => prev - 1)}
                  >
                    ◀ Previous Milestone
                  </button>

                  {activeMilestoneIndex + 1 < selectedProject.milestones.length ? (
                    <button
                      className="btn"
                      onClick={() => setActiveMilestoneIndex(prev => prev + 1)}
                    >
                      Next Milestone ▶
                    </button>
                  ) : (
                    <button
                      className="btn"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      onClick={() => {
                        alert('Congratulations on completing this guided project builder! Head over to the Dashboard to review your attempts.');
                        setSelectedProject(null);
                      }}
                    >
                      ✓ Complete Project!
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <p className="muted">Select a milestone step from the list to view its guide.</p>
            )}
          </section>

        </div>
      )}
    </div>
  );
}
