import { useState, useEffect, useRef } from 'react';
import { languages } from '../content/languages';
import { getLocalChatHistory, saveLocalChatHistory, ChatMessage } from '../lib/db';

// Env-configured Gemini API key (set in .env as VITE_GEMINI_API_KEY)
const ENV_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export function AiTutorPage() {
  const [activeLang, setActiveLang] = useState('python');
  // Priority: localStorage override → env variable → empty (simulation mode)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('codeeasy_gemini_key') || ENV_GEMINI_KEY || '';
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const isEnvKeyActive = !!(ENV_GEMINI_KEY && apiKey === ENV_GEMINI_KEY);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on language change
  useEffect(() => {
    setChatHistory(getLocalChatHistory(activeLang));
  }, [activeLang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  function handleSaveKey(key: string) {
    setApiKey(key);
    localStorage.setItem('codeeasy_gemini_key', key);
    setShowKeyInput(false);
  }

  function handleClearChat() {
    localStorage.removeItem(`codeeasy_chat_history_${activeLang}`);
    setChatHistory([
      {
        role: 'assistant',
        content: `Chat history reset. Ask me anything about **${activeLang.toUpperCase()}**!`,
        timestamp: new Date().toISOString()
      }
    ]);
  }

  // Pre-configured templates helper
  function triggerPreset(presetType: string) {
    let text = '';
    if (presetType === 'bug') {
      text = 'Can you review this code block and find logical errors or syntax bugs?\n\n```' + activeLang + '\n# Paste code here\n```';
    } else if (presetType === 'explain') {
      text = 'Explain how variable declaration and memory allocation works in ' + activeLang + '.';
    } else if (presetType === 'optimize') {
      text = 'How can I optimize execution speeds and reduce complexity in ' + activeLang + '?';
    }
    setUserInput(text);
  }

  // AI query handler
  async function handleSend() {
    if (!userInput.trim() || generating) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };

    const nextHistory = [...chatHistory, userMsg];
    setChatHistory(nextHistory);
    saveLocalChatHistory(activeLang, nextHistory);
    setUserInput('');
    setGenerating(true);

    if (apiKey.trim()) {
      // --- REAL GEMINI API CALL ---
      try {
        // Map roles to Gemini roles ('user' -> 'user', 'assistant' -> 'model')
        const contents = nextHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        // Insert a system context as part of the first user prompt if history is short
        const systemRule = `You are a friendly, expert AI tutor in CodeEasy. The user is learning ${activeLang}. Provide short, clear, premium formatted explanations, code examples inside markdown blocks, and practical review tips.`;
        if (contents.length > 0 && contents[0].parts.length > 0) {
          contents[0].parts[0].text = `${systemRule}\n\nUser: ${contents[0].parts[0].text}`;
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
          }
        );

        if (!response.ok) {
          // Read the full error body so we can show the exact Google error message
          let errorDetail = `Status ${response.status}`;
          try {
            const errBody = await response.json();
            errorDetail = `Status ${response.status} — ${errBody?.error?.message || JSON.stringify(errBody)}`;
          } catch (_) { /* ignore JSON parse failures */ }
          throw new Error(`Gemini API Error: ${errorDetail}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini returned an empty reply. Please check your prompt.';

        const botMsg: ChatMessage = {
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString()
        };

        const updatedHistory = [...nextHistory, botMsg];
        setChatHistory(updatedHistory);
        saveLocalChatHistory(activeLang, updatedHistory);
      } catch (err) {
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: `⚠️ **Gemini API Error**: ${err instanceof Error ? err.message : 'API Request failed.'}\nPlease verify that your API key is correct and you have internet access.`,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, errorMsg]);
      } finally {
        setGenerating(false);
      }
    } else {
      // --- SIMULATED/MOCK AI TUTOR RESPONSES ---
      setTimeout(() => {
        let mockReply = '';
        const lowercaseInput = userInput.toLowerCase();

        if (lowercaseInput.includes('bug') || lowercaseInput.includes('error')) {
          mockReply = `In **${activeLang}**, common logical bugs often center around variable scope or off-by-one errors. 

For instance, in loops:
\`\`\`${activeLang}
# Make sure your loop indices do not trigger out of bounds errors!
\`\`\`
Could you paste the specific block of code you want me to debug?`;
        } else if (lowercaseInput.includes('explain') || lowercaseInput.includes('how')) {
          mockReply = `Here is a quick overview of how core concepts work in **${activeLang}**:
          
1. **Dynamic Execution**: Variable types are evaluated during runtime.
2. **Standard Library**: Packed with modular built-ins to reduce syntax boilerplate.

Example structure:
\`\`\`${activeLang}
# Core snippet
print("Understanding language fundamentals.")
\`\`\`
What specific statement syntax or logic blocks can I expand on?`;
        } else if (lowercaseInput.includes('optimize') || lowercaseInput.includes('fast')) {
          mockReply = `To optimize code written in **${activeLang}**:
* **Use Local Variables**: Accessing local scopes is faster than global dictionary lookups.
* **Leverage Built-ins**: Standard libraries are optimized natively (often in C).
* **Memory Management**: Reuse objects instead of re-allocating them in loops.

Would you like me to analyze a specific algorithm's complexity for you?`;
        } else {
          mockReply = `That is an interesting question about **${activeLang}**! 

To help you learn, here is how you declare variables and comments in ${activeLang}:
\`\`\`${activeLang}
# Storing variables
value = 100
\`\`\`
*To unlock real live responses from Google's Gemini models directly in this panel, paste your Gemini API Key in the settings drawer at the top.*`;
        }

        const botMsg: ChatMessage = {
          role: 'assistant',
          content: mockReply,
          timestamp: new Date().toISOString()
        };

        const updatedHistory = [...nextHistory, botMsg];
        setChatHistory(updatedHistory);
        saveLocalChatHistory(activeLang, updatedHistory);
        setGenerating(false);
      }, 1000);
    }
  }

  // Parse markdown code blocks in UI
  function renderMessageContent(content: string) {
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // Code block
        const lines = part.split('\n');
        const lang = lines[0].trim();
        const codeLines = lines.slice(1).join('\n');
        return (
          <div key={index} style={{ margin: '8px 0' }}>
            {lang && <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.2)', padding: '2px 6px', borderRadius: '4px 4px 0 0', display: 'inline-block', border: '1px solid rgba(99,102,241,0.15)', borderBottom: 'none', color: '#818cf8', fontWeight: 600 }}>{lang}</span>}
            <pre style={{ margin: 0, borderRadius: lang ? '0 12px 12px 12px' : '12px' }}>
              <code>{codeLines}</code>
            </pre>
          </div>
        );
      } else {
        // Inline code / text
        return (
          <span key={index} style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{
            __html: part
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/`([^`]+)`/g, '<code class="inline-code" style="background:rgba(99,102,241,0.15);padding:2px 6px;border-radius:4px;">$1</code>')
          }} />
        );
      }
    });
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* Header and API Key configuration drawer */}
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>AI Programming Tutor</h1>
            <p className="muted" style={{ margin: 0 }}>Select a language context and ask queries. Real-time Gemini API integration supported.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn secondary" onClick={() => setShowKeyInput(!showKeyInput)}>
              🔑 {isEnvKeyActive ? 'API Key (Pre-configured)' : apiKey ? 'Update API Key' : 'Configure Gemini API Key'}
            </button>
            <button className="btn secondary" onClick={handleClearChat}>
              ✕ Clear Chat
            </button>
          </div>
        </div>

        {/* API Key Modal / Expand Drawer */}
        {showKeyInput && (
          <div className="card animate-fade-in" style={{ padding: 16, marginTop: 16, background: 'rgba(15, 23, 42, 0.6)' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Google Gemini API Key</h4>
            {isEnvKeyActive && (
              <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 8 }}>
                <span style={{ color: '#4ade80', fontSize: 13 }}>✅ API key is pre-configured via environment variable. The chatbot is ready to use!</span>
              </div>
            )}
            <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
              {isEnvKeyActive
                ? 'You can optionally override the pre-configured key by pasting a different one below.'
                : 'Get a free API key from the Google AI Studio. The key is saved locally in your browser storage and never sent elsewhere.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="password"
                placeholder={isEnvKeyActive ? 'Override with a different key (optional)...' : 'Paste AI Studio Key here...'}
                defaultValue={isEnvKeyActive ? '' : apiKey}
                id="gemini-key-input"
                style={{ flex: 1 }}
              />
              <button
                className="btn"
                onClick={() => {
                  const val = (document.getElementById('gemini-key-input') as HTMLInputElement)?.value || '';
                  handleSaveKey(val || ENV_GEMINI_KEY || '');
                }}
              >
                {isEnvKeyActive ? 'Override Key' : 'Save Key'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Main chat window layout */}
      <div className="grid" style={{ gridTemplateColumns: '260px 1fr', gap: 20 }}>
        
        {/* Left Side: Presets & Language selection */}
        <div className="grid" style={{ gap: 16, alignContent: 'start' }}>
          <section className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>Tutor Context</h3>
            <select
              value={activeLang}
              onChange={(e) => setActiveLang(e.target.value)}
              style={{ width: '100%' }}
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.displayName}</option>
              ))}
            </select>
          </section>

          <section className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>Quick Prompts</h3>
            <div className="grid" style={{ gap: 10 }}>
              <button className="btn secondary" style={{ fontSize: 13, justifyContent: 'start' }} onClick={() => triggerPreset('bug')}>
                🔍 Find logical bugs
              </button>
              <button className="btn secondary" style={{ fontSize: 13, justifyContent: 'start' }} onClick={() => triggerPreset('explain')}>
                📖 Explain declaration
              </button>
              <button className="btn secondary" style={{ fontSize: 13, justifyContent: 'start' }} onClick={() => triggerPreset('optimize')}>
                ⚡ Speed optimizations
              </button>
            </div>
          </section>

          <div style={{ padding: 10, textAlign: 'center' }}>
            <span className={`pill ${apiKey ? 'success' : 'warning'}`} style={{ fontSize: 11 }}>
              {isEnvKeyActive ? '🚀 GEMINI READY' : apiKey ? '✅ GEMINI ACTIVE' : '⚠️ SIMULATION MODE'}
            </span>
          </div>
        </div>

        {/* Right Side: Chat Bubbles timelines */}
        <section className="card chat-container">
          <div className="chat-history">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4, fontWeight: 700 }}>
                  {msg.role === 'user' ? 'YOU' : `${activeLang.toUpperCase()} TUTOR`}
                </div>
                <div>{renderMessageContent(msg.content)}</div>
              </div>
            ))}
            {generating && (
              <div className="chat-message assistant animate-pulse" style={{ opacity: 0.8 }}>
                <span className="muted">Tutor is analyzing code concepts...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* User inputs bar */}
          <div className="chat-input-bar">
            <textarea
              placeholder={`Ask a question about ${activeLang}...`}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              style={{ flex: 1, resize: 'none', height: 48, minHeight: 48, borderRadius: 10 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button className="btn" onClick={handleSend} disabled={generating || !userInput.trim()}>
              Send ➔
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
