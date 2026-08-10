import { useState, useEffect } from 'react';
import { languages, mockTopics } from '../content/languages';
import { getLessons, getQuizQuestions, getProgress, completeTopic, ProgressEntry, MockLesson, MockQuizQuestion } from '../lib/db';

export function LearnPage() {
  const [activeLang, setActiveLang] = useState(() => {
    return localStorage.getItem('codeeasy_language') || 'python';
  });
  const [lessons, setLessons] = useState<MockLesson[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  
  // Quiz state
  const [quizzes, setQuizzes] = useState<MockQuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0); // number of correct answers
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync language selection globally
  function handleLangChange(langId: string) {
    setActiveLang(langId);
    localStorage.setItem('codeeasy_language', langId);
    setSelectedTopicId(null);
    resetQuiz();
    // Dispatch event to update components (like LanguageSwitcher)
    window.dispatchEvent(new Event('codeeasy_language_changed'));
  }

  // Monitor language change events
  useEffect(() => {
    function handleGlobalChange() {
      const lang = localStorage.getItem('codeeasy_language') || 'python';
      if (lang !== activeLang) {
        setActiveLang(lang);
        setSelectedTopicId(null);
        resetQuiz();
      }
    }
    window.addEventListener('codeeasy_language_changed', handleGlobalChange);
    return () => window.removeEventListener('codeeasy_language_changed', handleGlobalChange);
  }, [activeLang]);

  // Load lessons and progress
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getLessons(activeLang),
      getProgress(activeLang)
    ]).then(([lessonsData, progressData]) => {
      setLessons(lessonsData);
      setProgress(progressData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [activeLang]);

  // Load quizzes when topic is selected
  useEffect(() => {
    if (selectedTopicId) {
      getQuizQuestions(activeLang, selectedTopicId).then(data => {
        setQuizzes(data);
        resetQuiz();
      });
    }
  }, [selectedTopicId, activeLang]);

  function resetQuiz() {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
  }

  // Calculate completion statistics
  const currentLangConfig = languages.find(l => l.id === activeLang);
  const allowedTopics = currentLangConfig?.roadmapTopics || [];
  const completedTopicsCount = progress.filter(p => allowedTopics.includes(p.topic_id) && p.status === 'completed').length;
  const totalTopicsCount = allowedTopics.length || 1;
  const progressPercent = Math.round((completedTopicsCount / totalTopicsCount) * 100);

  // Handle quiz submission
  function handleAnswerSelect(option: string) {
    if (quizSubmitted) return;
    setSelectedAnswer(option);
  }

  async function handleQuizSubmit() {
    if (!selectedAnswer || quizSubmitted) return;
    
    const isCorrect = selectedAnswer === quizzes[currentQuizIndex].correctAnswer;
    setQuizSubmitted(true);
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  }

  async function handleNextQuiz() {
    if (currentQuizIndex + 1 < quizzes.length) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
    } else {
      // Quiz completed!
      setQuizFinished(true);
      const passRatio = (quizScore + (selectedAnswer === quizzes[currentQuizIndex].correctAnswer ? 1 : 0)) / quizzes.length;
      if (passRatio >= 0.6 && selectedTopicId) {
        // Complete the topic
        await completeTopic(activeLang, selectedTopicId, 50);
        // Refresh progress entries
        const newProgress = await getProgress(activeLang);
        setProgress(newProgress);
      }
    }
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* Page Header & Stats */}
      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>Learn Coding</h1>
            <p className="muted" style={{ margin: 0 }}>Follow the roadmap, read simple lessons, and solve challenge quizzes.</p>
          </div>
          <div style={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>{currentLangConfig?.displayName} Progress</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Language Tabs */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, overflowX: 'auto', paddingBottom: 6 }}>
          {languages.map((lang) => (
            <button
              key={lang.id}
              className={`btn ${activeLang === lang.id ? '' : 'secondary'}`}
              style={{ padding: '8px 16px', fontSize: 14, borderRadius: 20 }}
              onClick={() => handleLangChange(lang.id)}
            >
              {lang.displayName}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid View */}
      <div className="grid" style={{ gridTemplateColumns: selectedTopicId ? '320px 1fr' : '1fr', gap: 20 }}>
        
        {/* Roadmap Topics List */}
        <div className="grid" style={{ gap: 16 }}>
          <h2>Learning Roadmap</h2>
          {loading ? (
            <p className="muted">Loading roadmap...</p>
          ) : allowedTopics.length === 0 ? (
            <p className="muted">No topics registered for this language.</p>
          ) : (
            allowedTopics.map((topicId, idx) => {
              const topicMeta = mockTopics.find(t => t.id === topicId) || { title: topicId, description: '' };
              const isCompleted = progress.some(p => p.topic_id === topicId && p.status === 'completed');
              const isActive = selectedTopicId === topicId;

              return (
                <div
                  key={topicId}
                  className={`card glow`}
                  style={{
                    padding: 16,
                    cursor: 'pointer',
                    borderColor: isActive ? '#6366f1' : isCompleted ? 'rgba(34, 197, 94, 0.4)' : undefined,
                    background: isActive ? 'rgba(99, 102, 241, 0.08)' : undefined
                  }}
                  onClick={() => setSelectedTopicId(topicId)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>STEP {idx + 1}</span>
                    {isCompleted && <span className="pill success" style={{ padding: '2px 8px', fontSize: 11 }}>Completed</span>}
                  </div>
                  <h3 style={{ margin: '6px 0 4px 0', fontSize: 17 }}>{topicMeta.title}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>{topicMeta.description || 'Explore language variables, declarations, and basics.'}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Lesson Workspace Panel */}
        {selectedTopicId && (
          <div className="card animate-fade-in" style={{ padding: 24 }}>
            {(() => {
              const topicMeta = mockTopics.find(t => t.id === selectedTopicId);
              const lesson = lessons.find(l => l.topicId === selectedTopicId);
              const isCompleted = progress.some(p => p.topic_id === selectedTopicId && p.status === 'completed');

              if (!lesson) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <h3>Lesson Coming Soon</h3>
                    <p className="muted">We are currently drafting this lesson. Try selecting a different topic.</p>
                    <button className="btn secondary" onClick={() => setSelectedTopicId(null)}>Back to Roadmap</button>
                  </div>
                );
              }

              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <span className="pill" style={{ marginBottom: 8 }}>{currentLangConfig?.displayName} Lesson</span>
                      <h1 style={{ margin: 0 }}>{lesson.title}</h1>
                    </div>
                    <button className="btn secondary" onClick={() => setSelectedTopicId(null)} style={{ padding: '6px 12px', fontSize: 13 }}>✕ Close</button>
                  </div>

                  <hr style={{ border: '0', borderTop: '1px solid rgba(148, 163, 184, 0.12)', margin: '20px 0' }} />

                  {/* Render Markdown-like content manually or using pre */}
                  <div className="lesson-body">
                    {lesson.content.split('\n\n').map((paragraph, index) => {
                      if (paragraph.startsWith('###')) {
                        return <h3 key={index}>{paragraph.replace('###', '').trim()}</h3>;
                      }
                      if (paragraph.startsWith('####')) {
                        return <h4 key={index} style={{ color: '#818cf8', marginTop: 16 }}>{paragraph.replace('####', '').trim()}</h4>;
                      }
                      if (paragraph.startsWith('#####')) {
                        return <h5 key={index} style={{ margin: '12px 0 6px 0', fontSize: 15 }}>{paragraph.replace('#####', '').trim()}</h5>;
                      }
                      if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                        return (
                          <ul key={index} className="muted" style={{ paddingLeft: 20 }}>
                            {paragraph.split('\n').map((li, idx) => (
                              <li key={idx} style={{ marginBottom: 4 }}>{li.replace(/^[\*\-]\s+/, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (paragraph.startsWith('```')) {
                        const lines = paragraph.split('\n');
                        const codeLines = lines.slice(1, lines.length - (lines[lines.length - 1] === '```' ? 1 : 0)).join('\n');
                        return (
                          <pre key={index}>
                            <code>{codeLines}</code>
                          </pre>
                        );
                      }
                      return <p key={index} className="muted" dangerouslySetInnerHTML={{ __html: paragraph.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>') }} />;
                    })}
                  </div>

                  {/* Interactive Challenge Quiz Section */}
                  <hr style={{ border: '0', borderTop: '1px solid rgba(148, 163, 184, 0.12)', margin: '30px 0' }} />

                  <div className="card" style={{ padding: 20, background: 'rgba(99, 102, 241, 0.04)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 style={{ margin: 0, color: '#818cf8' }}>⚡ Lesson Challenge Quiz</h3>
                      {isCompleted && <span className="pill success">✓ Topic Mastered (+50 XP Earned)</span>}
                    </div>

                    {quizzes.length === 0 ? (
                      <p className="muted" style={{ margin: 0 }}>No quiz questions available for this lesson. Read and proceed!</p>
                    ) : quizFinished ? (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <h4 style={{ color: '#4ade80' }}>🎉 Challenge Complete!</h4>
                        <p className="muted">You scored {quizScore} out of {quizzes.length} questions correctly.</p>
                        {quizScore / quizzes.length >= 0.6 ? (
                          <p style={{ color: '#4ade80', fontWeight: 'bold' }}>✓ Passed! You earned 50 XP and unlocked the next topic.</p>
                        ) : (
                          <p style={{ color: '#f87171' }}>✗ You need at least 60% to pass. Try again to unlock XP!</p>
                        )}
                        <button className="btn" onClick={resetQuiz} style={{ marginTop: 10 }}>Restart Quiz</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14 }}>
                          <span>Question {currentQuizIndex + 1} of {quizzes.length}</span>
                          <span className="muted">Difficulty: {quizzes[currentQuizIndex].difficulty}</span>
                        </div>
                        <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>{quizzes[currentQuizIndex].prompt}</p>

                        <div className="grid" style={{ gap: 10 }}>
                          {quizzes[currentQuizIndex].options.map((option) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectAnswer = option === quizzes[currentQuizIndex].correctAnswer;
                            let cardClass = 'quiz-option-card';
                            
                            if (isSelected) cardClass += ' selected';
                            if (quizSubmitted) {
                              if (isCorrectAnswer) cardClass += ' correct';
                              else if (isSelected) cardClass += ' incorrect';
                            }

                            return (
                              <div
                                key={option}
                                className={cardClass}
                                onClick={() => handleAnswerSelect(option)}
                              >
                                <span style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  border: '2px solid',
                                  borderColor: isSelected ? '#6366f1' : 'rgba(148, 163, 184, 0.4)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12
                                }}>
                                  {isSelected && '✓'}
                                </span>
                                <span>{option}</span>
                              </div>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="animate-fade-in" style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <strong style={{ color: selectedAnswer === quizzes[currentQuizIndex].correctAnswer ? '#4ade80' : '#f87171' }}>
                              {selectedAnswer === quizzes[currentQuizIndex].correctAnswer ? '✓ Correct! ' : '✗ Incorrect. '}
                            </strong>
                            <span className="muted" style={{ fontSize: 14 }}>{quizzes[currentQuizIndex].explanation}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                          {!quizSubmitted ? (
                            <button
                              className="btn"
                              onClick={handleQuizSubmit}
                              disabled={!selectedAnswer}
                            >
                              Submit Answer
                            </button>
                          ) : (
                            <button className="btn" onClick={handleNextQuiz}>
                              {currentQuizIndex + 1 < quizzes.length ? 'Next Question ➔' : 'Finish Quiz'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
