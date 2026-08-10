import { useState, useEffect } from 'react';
import { languages } from '../content/languages';

export function LanguageSwitcher() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('codeeasy_language') || 'python';
  });

  useEffect(() => {
    function handleGlobalChange() {
      const lang = localStorage.getItem('codeeasy_language') || 'python';
      setLanguage(lang);
    }
    window.addEventListener('codeeasy_language_changed', handleGlobalChange);
    return () => window.removeEventListener('codeeasy_language_changed', handleGlobalChange);
  }, []);

  function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLang = event.target.value;
    setLanguage(nextLang);
    localStorage.setItem('codeeasy_language', nextLang);
    window.dispatchEvent(new Event('codeeasy_language_changed'));
  }

  return (
    <label className="pill" style={{ cursor: 'pointer' }}>
      <span className="muted" style={{ fontSize: 13 }}>Language</span>
      <select
        value={language}
        onChange={handleSelectChange}
        style={{ background: 'transparent', color: 'inherit', border: 'none', outline: 'none', cursor: 'pointer', fontWeight: 600 }}
      >
        {languages.map((item) => (
          <option key={item.id} value={item.id} style={{ background: '#0d1127', color: '#f8fafc' }}>
            {item.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}

