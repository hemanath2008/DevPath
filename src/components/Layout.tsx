import { Link, NavLink } from 'react-router-dom';
import { ReactNode, useMemo, useState } from 'react';
import { languageGroups, languages } from '../content/languages';
import { LanguageSwitcher } from './LanguageSwitcher';
import { supabase } from '../lib/supabase';

type Props = {
  children: ReactNode;
};

const navItems = [
  ['/', 'Home'],
  ['/learn', 'Learn'],
  ['/compiler', 'Compiler'],
  ['/syntax', 'Syntax'],
  ['/practice', 'Practice'],
  ['/tutor', 'AI Tutor'],
  ['/projects', 'Projects'],
  ['/dashboard', 'Dashboard'],
];

export function Layout({ children }: Props) {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useMemo(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSessionEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <div className="app-shell">
      <header className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <Link to="/" style={{ fontSize: 24, fontWeight: 900 }}>
              CodeEasy
            </Link>
            <div className="muted" style={{ fontSize: 14 }}>
              Learn coding. Write code. Run it. Understand it.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <LanguageSwitcher />
            <Link className="btn secondary" to="/auth">
              {sessionEmail ? `Signed in as ${sessionEmail}` : 'Sign in'}
            </Link>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          {navItems.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                padding: '8px 12px',
                borderRadius: 999,
                background: isActive ? 'rgba(109, 124, 255, 0.18)' : 'transparent',
                border: '1px solid rgba(148, 163, 184, 0.16)',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
