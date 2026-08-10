import { useState } from 'react';
import { languages } from '../content/languages';
import { runCodeWithPiston } from '../services/executionGateway/piston';

const starterCode: Record<string, string> = {
  python: 'print("Hello, CodeEasy!")\n',
  javascript: 'console.log("Hello, CodeEasy!");\n',
  c: '#include <stdio.h>\nint main(){printf("Hello, CodeEasy!\\n");return 0;}\n',
  cpp: '#include <iostream>\nint main(){std::cout << "Hello, CodeEasy!\\n";}\n',
  java: 'public class Main { public static void main(String[] args) { System.out.println("Hello, CodeEasy!"); } }\n',
  sql: 'SELECT 1;\n',
};

export function CompilerPage() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(starterCode.python);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    setOutput('');
    try {
      const result = await runCodeWithPiston({ language, code, stdin: input });
      setOutput([result.stdout, result.stderr, result.output].filter(Boolean).join('\n'));
    } catch (error) {
      setOutput(error instanceof Error ? error.message : 'Execution failed');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <section className="card" style={{ padding: 24 }}>
        <h1>Compiler</h1>
        <p className="muted">Run code through a real execution gateway using the selected language.</p>
        <div className="grid two" style={{ marginTop: 16 }}>
          <label className="grid">
            <span>Language</span>
            <select value={language} onChange={(event) => {
              const next = event.target.value;
              setLanguage(next);
              setCode(starterCode[next] ?? code);
            }}>
              {languages.map((item) => (
                <option key={item.id} value={item.id}>{item.displayName}</option>
              ))}
            </select>
          </label>
          <label className="grid">
            <span>Input</span>
            <textarea rows={4} value={input} onChange={(event) => setInput(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="grid two">
        <div className="card" style={{ padding: 20 }}>
          <h3>Code</h3>
          <textarea
            rows={18}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            style={{ width: '100%', resize: 'vertical', background: '#08101f', color: 'inherit', borderRadius: 12, padding: 12 }}
          />
          <button className="btn" onClick={handleRun} disabled={running} style={{ marginTop: 12 }}>
            {running ? 'Running…' : 'Run'}
          </button>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3>Output</h3>
          <pre style={{ whiteSpace: 'pre-wrap', minHeight: 240 }}>{output || 'Run code to see output here.'}</pre>
        </div>
      </section>
    </div>
  );
}
