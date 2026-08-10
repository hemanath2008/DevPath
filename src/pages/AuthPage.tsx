import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Sign in or create an account with Supabase Auth.');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('Working…');
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      setMessage('If email confirmations are enabled, check your inbox. Otherwise you are signed in.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMessage('Signed out.');
  }

  return (
    <section className="card" style={{ padding: 24, maxWidth: 520 }}>
      <h1>Auth</h1>
      <p className="muted">{message}</p>
      <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
        <label className="grid">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label className="grid">
          <span>Password</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={6} />
        </label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn" disabled={busy} type="submit">
            {busy ? 'Saving…' : 'Sign up / Sign in'}
          </button>
          <button className="btn secondary" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </form>
    </section>
  );
}
