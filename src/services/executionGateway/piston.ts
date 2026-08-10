export type ExecutionRequest = {
  language: string;
  version?: string;
  code: string;
  stdin?: string;
};

export type ExecutionResponse = {
  stdout: string;
  stderr: string;
  output: string;
  code: number | null;
  signal: string | null;
  language: string;
  version: string;
};

const versionMap: Record<string, string> = {
  python: '3.11.10',
  javascript: '18.15.0',
  c: '10.2.0',
  cpp: '10.2.0',
  java: '17.0.0',
  go: '1.22.0',
  rust: '1.70.0',
  typescript: '5.0.3',
  csharp: '6.12.0',
};

export async function runCodeWithPiston(request: ExecutionRequest): Promise<ExecutionResponse> {
  const response = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      language: request.language,
      version: request.version ?? versionMap[request.language] ?? 'latest',
      files: [{ content: request.code }],
      stdin: request.stdin ?? '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Execution failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    run?: {
      stdout?: string;
      stderr?: string;
      output?: string;
      code?: number | null;
      signal?: string | null;
    };
    language?: string;
    version?: string;
  };

  return {
    stdout: data.run?.stdout ?? '',
    stderr: data.run?.stderr ?? '',
    output: data.run?.output ?? '',
    code: data.run?.code ?? null,
    signal: data.run?.signal ?? null,
    language: data.language ?? request.language,
    version: data.version ?? request.version ?? versionMap[request.language] ?? 'latest',
  };
}
