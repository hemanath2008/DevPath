import { useState, useEffect } from 'react';
import { languages } from '../content/languages';
import { getProfile, getRecentAttempts, getProgress, UserProfile, PracticeAttempt, ProgressEntry } from '../lib/db';

export function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [langProgress, setLangProgress] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const userProfile = await getProfile();
        setProfile(userProfile);

        const recentAttempts = await getRecentAttempts();
        setAttempts(recentAttempts);

        // Fetch progress for each language to build completion map
        const progressMap: { [id: string]: number } = {};
        for (const lang of languages) {
          const progList: ProgressEntry[] = await getProgress(lang.id);
          const allowedTopics = lang.roadmapTopics || [];
          const completedCount = progList.filter(p => allowedTopics.includes(p.topic_id) && p.status === 'completed').length;
          const totalCount = allowedTopics.length || 1;
          progressMap[lang.id] = Math.round((completedCount / totalCount) * 100);
        }
        setLangProgress(progressMap);
      } catch (err) {
        console.error('Error loading dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <h3>Loading Dashboard...</h3>
        <p className="muted">Gathering user metrics, XP records, and achievements...</p>
      </div>
    );
  }

  // XP progression math: 100 XP per level
  const xp = profile?.xp ?? 0;
  const level = Math.floor(xp / 100) + 1;
  const currentXPInLevel = xp % 100;
  const nextLevelXPNeeded = 100;
  const levelProgressPercent = Math.round((currentXPInLevel / nextLevelXPNeeded) * 100);

  // User Rank Title helper
  let userRank = 'Novice Coder';
  if (level >= 15) userRank = 'Grandmaster';
  else if (level >= 10) userRank = 'Lead Engineer';
  else if (level >= 6) userRank = 'Senior Dev';
  else if (level >= 3) userRank = 'Junior Scholar';

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* Welcome Card & XP Gauge */}
      <section className="card" style={{ padding: 24 }}>
        <div className="grid two" style={{ gap: 24, alignItems: 'center' }}>
          <div>
            <div className="pill" style={{ marginBottom: 10 }}>STUDENT PROFILE</div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: 32 }}>{profile?.display_name}</h1>
            <p className="muted" style={{ margin: '0 0 16px 0', fontSize: 16 }}>Rank: <strong style={{ color: '#818cf8' }}>{userRank}</strong> (Level {level})</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span className="muted">Level {level} Progress</span>
              <strong>{currentXPInLevel} / {nextLevelXPNeeded} XP</strong>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${levelProgressPercent}%` }} />
            </div>
            <span className="muted" style={{ fontSize: 11, textAlign: 'right' }}>{100 - currentXPInLevel} XP needed for Level {level + 1}</span>
          </div>
        </div>
      </section>

      {/* Grid boxes for Stats cards */}
      <div className="grid three" style={{ gap: 20 }}>
        <div className="card stat-box" style={{ background: 'rgba(99, 102, 241, 0.04)' }}>
          <div className="stat-value">{xp}</div>
          <span className="muted" style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Total Earned XP</span>
        </div>

        <div className="card stat-box" style={{ background: 'rgba(168, 85, 247, 0.04)' }}>
          <div className="stat-value">🔥 {profile?.streak ?? 0} Days</div>
          <span className="muted" style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Daily Active Streak</span>
        </div>

        <div className="card stat-box" style={{ background: 'rgba(34, 197, 94, 0.04)' }}>
          <div className="stat-value">{attempts.filter(a => a.passed).length}</div>
          <span className="muted" style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Solved Practices</span>
        </div>
      </div>

      {/* Languages completion map & Attempts logs */}
      <div className="grid two" style={{ gap: 20 }}>
        
        {/* Languages progress bar list */}
        <section className="card" style={{ padding: 20 }}>
          <h2 style={{ marginBottom: 16, fontSize: 20 }}>Language Roadmap Completion</h2>
          <div className="grid" style={{ gap: 16 }}>
            {languages.map(lang => {
              const completedPercent = langProgress[lang.id] || 0;
              return (
                <div key={lang.id} className="grid" style={{ gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <strong>{lang.displayName}</strong>
                    <span className="muted" style={{ fontSize: 12 }}>{completedPercent}% Done</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: 8 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${completedPercent}%`,
                        background: completedPercent === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : undefined
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* History Attempts Log */}
        <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: 16, fontSize: 20 }}>Recent Submissions Log</h2>
          {attempts.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, textAlign: 'center' }}>
              <p className="muted" style={{ margin: 0 }}>No submissions found in this browser context yet.</p>
              <p className="muted" style={{ fontSize: 12 }}>Solve coding exercises in the Practice Arena to record logs!</p>
            </div>
          ) : (
            <div className="grid" style={{ gap: 10, maxHeight: 300, overflowY: 'auto', paddingRight: 6 }}>
              {attempts.map(att => (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 10,
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>{att.question_title}</h4>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="pill" style={{ padding: '1px 6px', fontSize: 10 }}>{att.language_id}</span>
                      <span className="muted" style={{ fontSize: 11 }}>{new Date(att.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`pill ${att.passed ? 'success' : 'error'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                    {att.passed ? `Passed (${att.score}%)` : `Failed (${att.score}%)`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
