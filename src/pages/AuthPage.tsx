import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Sign in or create an account with Supabase Auth.');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(mode: 'signIn' | 'signUp') {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Supabase is not configured in this environment.');
      return;
    }

    setBusy(true);
    setMessage(mode === 'signIn' ? 'Signing in…' : 'Creating account…');
    try {
      if (mode === 'signIn') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Signed in.');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('If email confirmations are enabled, check your inbox. Otherwise you are signed in.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Supabase is not configured in this environment.');
      return;
    }

    await supabase.auth.signOut();
    setMessage('Signed out.');
  }

  return (
    <section className="card" style={{ padding: 24, maxWidth: 520 }}>
      <h1>Auth</h1>
      <p className="muted">{message}</p>
      <form className="grid" style={{ gap: 12 }} onSubmit={(event) => event.preventDefault()}>
        <label className="grid">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label className="grid">
          <span>Password</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={6} />
        </label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn" disabled={busy} type="button" onClick={() => handleSubmit('signIn')}>
            {busy ? 'Working…' : 'Sign in'}
          </button>
          <button className="btn secondary" disabled={busy} type="button" onClick={() => handleSubmit('signUp')}>
            {busy ? 'Working…' : 'Sign up'}
          </button>
          <button className="btn secondary" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </form>
    </section>
  );
}
