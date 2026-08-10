import { useState, useEffect } from 'react';
import { languages } from '../content/languages';
import { getPracticeQuestions, submitPracticeAttempt } from '../lib/db';
import type { MockPracticeQuestion } from '../lib/db';
import { runCodeWithPiston } from '../services/executionGateway/piston';

export function PracticePage() {
  const [questions, setQuestions] = useState<MockPracticeQuestion[]>([]);
  const [activeLang, setActiveLang] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<MockPracticeQuestion | null>(null);

  // Editor states
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [running, setRunning] = useState(false);

  // Test cases status state: 'not_run' | 'running' | 'passed' | 'failed'
  const [testResults, setTestResults] = useState<{ [index: number]: 'not_run' | 'running' | 'passed' | 'failed' }>({});
  const [unlockedHints, setUnlockedHints] = useState<boolean[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeOnError, setShakeOnError] = useState(false);

  useEffect(() => {
    getPracticeQuestions().then((data) => setQuestions(data));
  }, []);

  // When a question is selected, load starter code and prepare states
  function handleSelectQuestion(question: MockPracticeQuestion) {
    setSelectedQuestion(question);
    setCode(question.starterCode);
    setCustomInput(question.testCases[0]?.input || '');
    setConsoleOutput('');
    setTestResults({});
    setUnlockedHints(new Array(question.hints.length).fill(false));
    setShowConfetti(false);
  }

  // Filtered listing
  const filteredQuestions = questions.filter((item) => {
    const matchesLang = activeLang === 'all' || item.languageId === activeLang;
    const matchesDiff = activeDifficulty === 'all' || item.difficulty === activeDifficulty;
    return matchesLang && matchesDiff;
  });

  // Run user code manually on Custom Stdin
  async function handleRunDraft() {
    if (!selectedQuestion) return;
    setRunning(true);
    setConsoleOutput('Running draft code...');
    try {
      const res = await runCodeWithPiston({
        language: selectedQuestion.languageId,
        code: code,
        stdin: customInput
      });
      const output = [res.stdout, res.stderr, res.output].filter(Boolean).join('\n');
      setConsoleOutput(output || 'Code executed successfully with empty output.');
    } catch (e) {
      setConsoleOutput(e instanceof Error ? e.message : 'Execution failed');
    } finally {
      setRunning(false);
    }
  }

  // Run compiler code sequentially across all test cases
  async function handleRunAllTests() {
    if (!selectedQuestion) return;
    setRunning(true);
    setConsoleOutput('Executing validation test suite...');
    
    const nextResults: { [index: number]: 'not_run' | 'running' | 'passed' | 'failed' } = {};
    let passedAll = true;
    let scoreCount = 0;

    for (let i = 0; i < selectedQuestion.testCases.length; i++) {
      const tc = selectedQuestion.testCases[i];
      setTestResults(prev => ({ ...prev, [i]: 'running' }));

      try {
        const res = await runCodeWithPiston({
          language: selectedQuestion.languageId,
          code: code,
          stdin: tc.input
        });

        // Strip spaces to ensure white-spaces do not break validation checks
        const actual = (res.stdout || res.output || '').trim();
        const expected = tc.expectedOutput.trim();

        if (actual === expected) {
          nextResults[i] = 'passed';
          setTestResults(prev => ({ ...prev, [i]: 'passed' }));
          scoreCount++;
        } else {
          nextResults[i] = 'failed';
          setTestResults(prev => ({ ...prev, [i]: 'failed' }));
          passedAll = false;
          setConsoleOutput(prev => prev + `\n\n[Test Case #${i + 1} Failed]\nInput: ${tc.input.trim()}\nExpected: ${expected}\nActual: ${actual}`);
        }
      } catch (err) {
        nextResults[i] = 'failed';
        setTestResults(prev => ({ ...prev, [i]: 'failed' }));
        passedAll = false;
        setConsoleOutput(prev => prev + `\n\n[Test Case #${i + 1} Error]: ${err instanceof Error ? err.message : 'Runner crashed'}`);
      }
    }

    setRunning(false);
    const scorePercent = Math.round((scoreCount / selectedQuestion.testCases.length) * 100);

    if (passedAll) {
      setShowConfetti(true);
      setConsoleOutput(prev => prev + `\n\n🎉 SUCCESS! All test cases passed. You earned +100 XP!`);
      // Update DB and award XP
      await submitPracticeAttempt(selectedQuestion.id, selectedQuestion.title, selectedQuestion.languageId, code, true, scorePercent);
    } else {
      setShakeOnError(true);
      setTimeout(() => setShakeOnError(false), 500);
      setConsoleOutput(prev => prev + `\n\n✗ Test suite failed. Review the output difference above and try again.`);
      await submitPracticeAttempt(selectedQuestion.id, selectedQuestion.title, selectedQuestion.languageId, code, false, scorePercent);
    }
  }

  // Unlock hint helper
  function toggleHint(index: number) {
    const next = [...unlockedHints];
    next[index] = !next[index];
    setUnlockedHints(next);
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* NATIVE CONFETTI FLOATING PARTICLES OVERLAY */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          {Array.from({ length: 50 }).map((_, i) => {
            const left = Math.random() * 100;
            const size = Math.random() * 10 + 6;
            const animationDelay = Math.random() * 3;
            const animationDuration = Math.random() * 2 + 2;
            const color = ['#6366f1', '#a855f7', '#22c55e', '#facc15', '#f43f5e'][Math.floor(Math.random() * 5)];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: `${left}%`,
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  background: color,
                  opacity: Math.random() * 0.7 + 0.3,
                  animation: `fall ${animationDuration}s linear ${animationDelay}s infinite`
                }}
              />
            );
          })}
          <style>{`
            @keyframes fall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <div className="grid" style={{ gap: 20 }}>
        {/* Workspace views selection */}
        {!selectedQuestion ? (
          <div>
            {/* Header filters */}
            <section className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h1 style={{ marginBottom: 6 }}>Practice Coding Challenges</h1>
              <p className="muted" style={{ marginBottom: 20 }}>Write working programs, compile code inputs, and satisfy multiple strict edge test cases.</p>
              
              <div className="grid two" style={{ gap: 16 }}>
                <label className="grid">
                  <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Language</span>
                  <select value={activeLang} onChange={(e) => setActiveLang(e.target.value)}>
                    <option value="all">All Languages</option>
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.displayName}</option>
                    ))}
                  </select>
                </label>
                <label className="grid">
                  <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Difficulty</span>
                  <select value={activeDifficulty} onChange={(e) => setActiveDifficulty(e.target.value)}>
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>
              </div>
            </section>

            {/* List catalog of questions */}
            <div className="grid three" style={{ gap: 20 }}>
              {filteredQuestions.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center' }}>
                  <h3 className="muted">No practice challenges match selection criteria</h3>
                  <p className="muted">Try selecting a different programming language or level.</p>
                </div>
              ) : (
                filteredQuestions.map((q) => {
                  const langConfig = languages.find(l => l.id === q.languageId);
                  return (
                    <article key={q.id} className="card glow animate-fade-in" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span className="pill">{langConfig?.displayName || q.languageId}</span>
                          <span className="muted" style={{ fontSize: 12, textTransform: 'capitalize' }}>{q.difficulty}</span>
                        </div>
                        <h3 style={{ fontSize: 18, marginBottom: 8 }}>{q.title}</h3>
                        <p className="muted" style={{ fontSize: 14, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {q.prompt.replace(/\*\*|\*/g, '')}
                        </p>
                      </div>
                      <button className="btn" onClick={() => handleSelectQuestion(q)} style={{ width: '100%' }}>
                        Solve Challenge (+100 XP)
                      </button>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Split View Workspace */
          <div className={`practice-container ${shakeOnError ? 'animate-shake' : ''}`}>
            
            {/* Left Hand: Description, Tests, Hints */}
            <div className="grid" style={{ gap: 20, contentVisibility: 'auto' }}>
              <section className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span className="pill">{languages.find(l => l.id === selectedQuestion.languageId)?.displayName}</span>
                  <button className="btn secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setSelectedQuestion(null)}>
                    ➔ Catalog
                  </button>
                </div>
                <h2>{selectedQuestion.title}</h2>
                
                {/* Parse prompt formatting */}
                <div className="muted" style={{ fontSize: 15, lineHeight: 1.6 }}>
                  {selectedQuestion.prompt.split('\n').map((line: string, idx: number) => (
                    <p key={idx} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>') }} />
                  ))}
                </div>
              </section>

              {/* Validation Status Test Cases */}
              <section className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 12 }}>Validation Test Cases</h3>
                <div className="grid" style={{ gap: 10 }}>
                  {selectedQuestion.testCases.map((tc: any, idx: number) => {
                    const status = testResults[idx] || 'not_run';
                    let statusLabel = 'Not tested';
                    let pillClass = 'pill';
                    if (status === 'running') {
                      statusLabel = 'Running…';
                    } else if (status === 'passed') {
                      statusLabel = 'Passed';
                      pillClass = 'pill success';
                    } else if (status === 'failed') {
                      statusLabel = 'Failed';
                      pillClass = 'pill error';
                    }

                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                        <div>
                          <strong style={{ fontSize: 14 }}>Test Case #{idx + 1}</strong>
                          {tc.isHidden && <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>(Hidden Case)</span>}
                        </div>
                        <span className={pillClass} style={{ fontSize: 12, padding: '2px 8px' }}>{statusLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Collapsible Hints Drawer */}
              {selectedQuestion.hints.length > 0 && (
                <section className="card" style={{ padding: 20 }}>
                  <h3 style={{ marginBottom: 12 }}>Hints & Tips</h3>
                  <div className="grid" style={{ gap: 10 }}>
                    {selectedQuestion.hints.map((hint: string, idx: number) => {
                      const isUnlocked = unlockedHints[idx];
                      return (
                        <div key={idx} className="card" style={{ padding: 12, borderStyle: isUnlocked ? 'solid' : 'dashed', borderColor: isUnlocked ? 'rgba(99, 102, 241, 0.3)' : 'rgba(148, 163, 184, 0.2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Hint #{idx + 1}</span>
                            <button className="btn secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => toggleHint(idx)}>
                              {isUnlocked ? 'Hide Hint' : 'Reveal Hint'}
                            </button>
                          </div>
                          {isUnlocked && (
                            <p className="muted animate-fade-in" style={{ margin: '8px 0 0 0', fontSize: 13 }}>{hint}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right Hand: Text Editor & Output */}
            <div className="grid animate-fade-in" style={{ gap: 20 }}>
              {/* Code input text area */}
              <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h3 style={{ marginBottom: 12 }}>Editor Workspace</h3>
                <textarea
                  className="editor-textarea"
                  style={{ flex: 1, minHeight: 320 }}
                  rows={20}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="btn" style={{ flex: 1 }} onClick={handleRunAllTests} disabled={running}>
                    {running ? 'Running Validation Suite…' : '✓ Run Validation Suite'}
                  </button>
                  <button className="btn secondary" onClick={handleRunDraft} disabled={running}>
                    Test Custom Stdin
                  </button>
                </div>
              </section>

              {/* Console Input / Output Tabs */}
              <section className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 12 }}>Interactive Stdin</h3>
                <textarea
                  rows={3}
                  placeholder="Insert lines of input test data here..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, background: '#080a15', borderRadius: 8, padding: 10, border: '1px solid rgba(148, 163, 184, 0.15)' }}
                />

                <h3 style={{ marginTop: 20, marginBottom: 10 }}>Runner Output Console</h3>
                <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 180, overflowY: 'auto', background: '#02040a', border: '1px solid rgba(148, 163, 184, 0.1)', color: '#a7f3d0' }}>
                  {consoleOutput || 'Run validation suites or draft evaluations to stream outputs.'}
                </pre>
              </section>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
