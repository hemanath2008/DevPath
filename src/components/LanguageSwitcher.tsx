import { useState } from 'react';
import { languages } from '../content/languages';

export function LanguageSwitcher() {
  const [language, setLanguage] = useState('python');

  return (
    <label className="pill">
      <span className="muted">Language</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        style={{ background: 'transparent', color: 'inherit', border: 'none', outline: 'none' }}
      >
        {languages.map((item) => (
          <option key={item.id} value={item.id}>
            {item.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}
