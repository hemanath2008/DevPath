export type LanguageConfig = {
  id: string;
  displayName: string;
  fileExtension: string;
  commentSyntax: string;
  executionRuntime: string;
  compiled: boolean;
  tier: 1 | 2 | 3;
  sortOrder: number;
  supportsStdin: boolean;
  supportsPackages: boolean;
  roadmapTopics: string[];
};

export const languageGroups = {
  popular: ['python', 'c', 'cpp', 'java', 'javascript', 'sql'],
  available: ['typescript', 'csharp', 'go', 'rust', 'kotlin', 'swift', 'php', 'ruby'],
  more: ['r', 'dart', 'scala', 'perl', 'matlab', 'bash', 'assembly', 'haskell'],
} as const;

export const languages: LanguageConfig[] = [
  {
    id: 'python',
    displayName: 'Python',
    fileExtension: '.py',
    commentSyntax: '#',
    executionRuntime: 'python-3.11',
    compiled: false,
    tier: 1,
    sortOrder: 1,
    supportsStdin: true,
    supportsPackages: true,
    roadmapTopics: ['basics', 'control-flow', 'functions', 'collections', 'modules', 'oop'],
  },
  {
    id: 'c',
    displayName: 'C',
    fileExtension: '.c',
    commentSyntax: '//',
    executionRuntime: 'gcc-13',
    compiled: true,
    tier: 1,
    sortOrder: 2,
    supportsStdin: true,
    supportsPackages: false,
    roadmapTopics: ['basics', 'control-flow', 'functions', 'arrays', 'pointers', 'memory'],
  },
  {
    id: 'cpp',
    displayName: 'C++',
    fileExtension: '.cpp',
    commentSyntax: '//',
    executionRuntime: 'g++-13',
    compiled: true,
    tier: 1,
    sortOrder: 3,
    supportsStdin: true,
    supportsPackages: true,
    roadmapTopics: ['basics', 'control-flow', 'functions', 'stl', 'oop', 'algorithms'],
  },
  {
    id: 'java',
    displayName: 'Java',
    fileExtension: '.java',
    commentSyntax: '//',
    executionRuntime: 'openjdk-21',
    compiled: true,
    tier: 1,
    sortOrder: 4,
    supportsStdin: true,
    supportsPackages: true,
    roadmapTopics: ['basics', 'control-flow', 'methods', 'collections', 'oop', 'streams'],
  },
  {
    id: 'javascript',
    displayName: 'JavaScript',
    fileExtension: '.js',
    commentSyntax: '//',
    executionRuntime: 'node-22',
    compiled: false,
    tier: 1,
    sortOrder: 5,
    supportsStdin: true,
    supportsPackages: true,
    roadmapTopics: ['basics', 'control-flow', 'functions', 'arrays', 'objects', 'async'],
  },
  {
    id: 'sql',
    displayName: 'SQL',
    fileExtension: '.sql',
    commentSyntax: '--',
    executionRuntime: 'postgres-16',
    compiled: false,
    tier: 1,
    sortOrder: 6,
    supportsStdin: false,
    supportsPackages: false,
    roadmapTopics: ['select', 'filtering', 'joins', 'grouping', 'subqueries', 'transactions'],
  },
];

export const learningRoadmap = [
  'What is programming?',
  'Variables and data types',
  'Input and output',
  'Conditionals',
  'Loops',
  'Functions',
  'Collections and strings',
  'Problem solving',
];

export const syntaxSearchSamples = [
  { language: 'Python', topic: 'for loop', snippet: 'for item in items:\n    print(item)' },
  { language: 'C++', topic: 'vector', snippet: 'std::vector<int> values = {1, 2, 3};' },
  { language: 'Go', topic: 'goroutines', snippet: 'go func() { fmt.Println("hi") }()' },
  { language: 'SQL', topic: 'JOIN', snippet: 'SELECT * FROM users JOIN orders ON users.id = orders.user_id;' },
];
