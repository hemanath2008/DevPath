export type MockLesson = {
  id: number;
  languageId: string;
  topicId: string;
  title: string;
  slug: string;
  content: string;
  orderIndex: number;
};

export type MockQuizQuestion = {
  id: number;
  languageId: string;
  topicId: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

export type MockSyntaxExample = {
  id: number;
  languageId: string;
  topicId: string;
  title: string;
  codeExample: string;
  explanation: string;
  output: string;
};

export type MockTestCase = {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
};

export type MockPracticeQuestion = {
  id: number;
  languageId: string;
  topicId: string;
  title: string;
  prompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  starterCode: string;
  expectedOutput: string;
  hints: string[];
  testCases: MockTestCase[];
};

export type MockProjectMilestone = {
  title: string;
  description: string;
  starterCode?: string;
  solutionHint?: string;
};

export type MockProject = {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  overview: string;
  languageIds: string[];
  milestones: MockProjectMilestone[];
};

export const mockTopics = [
  { id: 'basics', title: 'Basics & Variables', description: 'Understanding syntax, variables, data types, and base console input/output.' },
  { id: 'control-flow', title: 'Control Flow & Loops', description: 'Implementing branch choices and loops for iterative execution.' },
  { id: 'functions', title: 'Functions & Methods', description: 'Encapsulating behavior in clean modular blocks with return types.' },
  { id: 'collections', title: 'Collections & Lists', description: 'Storing arrays, dictionaries, vectors, and lists.' },
  { id: 'oop', title: 'Object-Oriented Programming', description: 'Structuring code via classes, inheritance, encapsulation, and interfaces.' },
  { id: 'select', title: 'Database Selects', description: 'Reading records, choosing columns, and sorting data.' },
  { id: 'joins', title: 'Relational Joins', description: 'Linking database records across primary and foreign key tables.' }
];

export const mockLessons: MockLesson[] = [
  // --- PYTHON LESSONS ---
  {
    id: 1,
    languageId: 'python',
    topicId: 'basics',
    title: 'Python Variables and Print Output',
    slug: 'python-variables-print',
    orderIndex: 1,
    content: `### Welcome to Python!

Python is a dynamic, high-level, human-readable language. In Python, variables are initialized simply by assigning a value. No types need to be declared!

#### Creating Variables
\`\`\`python
# This is a comment
name = "DevPath Explorer"
age = 21
is_active = True
gpa = 3.98
\`\`\`

#### Printing Output
You print out values using the \`print()\` function:
\`\`\`python
print("Hello, world!")
print(f"Name: {name}, Age: {age}") # F-string interpolation
\`\`\`

#### Basic Arithmetic
\`\`\`python
x = 10
y = 3
sum_val = x + y      # 13
quotient = x / y     # 3.3333...
floor_div = x // y   # 3
remainder = x % y    # 1
power = x ** y       # 1000
\`\`\``
  },
  {
    id: 2,
    languageId: 'python',
    topicId: 'control-flow',
    title: 'Conditionals and Loops in Python',
    slug: 'python-conditionals-loops',
    orderIndex: 2,
    content: `### Control Flow in Python

Python relies on **indentation** (4 spaces) rather than curly braces to define code blocks.

#### Conditionals (\`if\`, \`elif\`, \`else\`)
\`\`\`python
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
else:
    print("Grade: C")
\`\`\`

#### Loops
Python supports \`for\` and \`while\` loops.

##### The \`for\` Loop
Often combined with \`range()\` to run a set number of times, or used to iterate over collections:
\`\`\`python
# Loop 5 times (0 to 4)
for i in range(5):
    print(f"Index: {i}")

# Iterate over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"Fruit: {fruit}")
\`\`\`

##### The \`while\` Loop
\`\`\`python
count = 5
while count > 0:
    print(count)
    count -= 1
\`\`\``
  },

  // --- JAVASCRIPT LESSONS ---
  {
    id: 10,
    languageId: 'javascript',
    topicId: 'basics',
    title: 'JavaScript Variables, Let, Const, and Console',
    slug: 'js-variables-console',
    orderIndex: 1,
    content: `### Welcome to JavaScript!

JavaScript is the scripting language of the web. Modern JS uses \`let\` and \`const\` to manage variables scope.

#### Declarations
* \`const\`: Declares a read-only reference variable that cannot be reassigned.
* \`let\`: Declares a reassignable block-scoped variable.
* \`var\`: Older function-scoped variable (generally avoided now).

\`\`\`javascript
const pi = 3.14159;
let score = 0;
score += 10; // Allowed!

let name = "Alex";
let isAdmin = false;
\`\`\`

#### Console Logging
Use the globally available \`console.log()\` to write to standard output:
\`\`\`javascript
console.log("Hello, developer!");
console.log(`Pi value is: ${pi}`); // Template literal expression
\`\`\``
  },
  {
    id: 11,
    languageId: 'javascript',
    topicId: 'control-flow',
    title: 'Conditionals, For, and While Loops in JavaScript',
    slug: 'js-conditionals-loops',
    orderIndex: 2,
    content: `### Control Flow in JavaScript

JavaScript uses curly braces \`{}\` to define scopes and brackets for conditions.

#### Conditionals
\`\`\`javascript
const score = 75;

if (score >= 90) {
  console.log("Passed with distinction!");
} else if (score >= 50) {
  console.log("Passed!");
} else {
  console.log("Failed.");
}
\`\`\`

#### Loops

##### For Loops
Classic structure: \`for (initialization; condition; increment)\`:
\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log("Iteration: " + i);
}
\`\`\`

##### For...of Loop (Arrays)
\`\`\`javascript
const languages = ["Python", "JS", "C++"];
for (const lang of languages) {
  console.log(lang);
}
\`\`\`

##### While Loops
\`\`\`javascript
let energy = 3;
while (energy > 0) {
  console.log("Running...");
  energy--;
}
\`\`\``
  },

  // --- SQL LESSONS ---
  {
    id: 20,
    languageId: 'sql',
    topicId: 'select',
    title: 'SQL Select Queries, Sorting, and Filtering',
    slug: 'sql-select-basics',
    orderIndex: 1,
    content: `### Introduction to SQL

SQL (Structured Query Language) is used to communicate with databases. A query selects data from columns in a table.

#### Selecting Data
Use the \`SELECT\` statement:
\`\`\`sql
-- Select all columns from user profiles
SELECT * FROM profiles;

-- Select specific columns
SELECT id, display_name, xp FROM profiles;
\`\`\`

#### Filtering Results
Use the \`WHERE\` statement:
\`\`\`sql
SELECT * FROM profiles
WHERE xp >= 500;

-- String filtering
SELECT * FROM profiles
WHERE display_name = 'Alex';
\`\`\`

#### Ordering results
Use the \`ORDER BY\` clause:
\`\`\`sql
SELECT display_name, xp FROM profiles
ORDER BY xp DESC; -- Descending XP
\`\`\``
  }
];

export const mockQuizQuestions: MockQuizQuestion[] = [
  // --- PYTHON QUIZZES ---
  {
    id: 1,
    languageId: 'python',
    topicId: 'basics',
    prompt: 'Which operator is used to calculate the remainder of division in Python?',
    options: ['/', '//', '%', '^'],
    correctAnswer: '%',
    explanation: 'The "%" (modulo) operator calculates the remainder left over when one integer is divided by another.',
    difficulty: 'beginner'
  },
  {
    id: 2,
    languageId: 'python',
    topicId: 'basics',
    prompt: 'How do you print a formatted string containing a variable "score" in Python?',
    options: [
      'print("Score is {score}")',
      'print(f"Score is {score}")',
      'print("Score is " + f(score))',
      'echo("Score is " + score)'
    ],
    correctAnswer: 'print(f"Score is {score}")',
    explanation: 'F-strings prefixed with an "f" allow you to embed variables directly in curly braces.',
    difficulty: 'beginner'
  },
  {
    id: 3,
    languageId: 'python',
    topicId: 'control-flow',
    prompt: 'What keyword replaces "else if" in Python conditionals?',
    options: ['elseif', 'else_if', 'elif', 'otherwise'],
    correctAnswer: 'elif',
    explanation: 'Python uses "elif" to handle multiple conditional branches cleanly.',
    difficulty: 'beginner'
  },

  // --- JAVASCRIPT QUIZZES ---
  {
    id: 10,
    languageId: 'javascript',
    topicId: 'basics',
    prompt: 'What is the main difference between let and const in JavaScript?',
    options: [
      'let is block scoped, while const is global.',
      'const variables cannot be reassigned, whereas let variables can.',
      'let variables cannot be garbage collected.',
      'const variables are function-scoped only.'
    ],
    correctAnswer: 'const variables cannot be reassigned, whereas let variables can.',
    explanation: 'Variables declared with "const" prevent re-assignment to ensure data references remain unchanged.',
    difficulty: 'beginner'
  },

  // --- SQL QUIZZES ---
  {
    id: 20,
    languageId: 'sql',
    topicId: 'select',
    prompt: 'Which SQL keyword is used to filter query results?',
    options: ['SELECT', 'WHERE', 'ORDER BY', 'GROUP BY'],
    correctAnswer: 'WHERE',
    explanation: 'The WHERE clause specifies search criteria to filter rows returned by a query.',
    difficulty: 'beginner'
  }
];

export const mockSyntaxExamples: MockSyntaxExample[] = [
  // PYTHON
  {
    id: 1,
    languageId: 'python',
    topicId: 'basics',
    title: 'Variable Declaration',
    codeExample: `x = 42\nname = "Pythonic"\nscore = 9.81\nis_ready = True`,
    explanation: 'No keywords or types are specified. Dynamic assignment sets variable types automatically.',
    output: ''
  },
  {
    id: 2,
    languageId: 'python',
    topicId: 'control-flow',
    title: 'For Loop over Lists',
    codeExample: `items = [10, 20, 30]\nfor item in items:\n    print(f"Item: {item}")`,
    explanation: 'Loops through items of a list using Python\'s dynamic iterator model.',
    output: 'Item: 10\nItem: 20\nItem: 30'
  },
  {
    id: 3,
    languageId: 'python',
    topicId: 'functions',
    title: 'Defining Functions',
    codeExample: `def greet(name, prefix="Hello"):\n    return f"{prefix}, {name}!"\n\nmessage = greet("CodeEasy")\nprint(message)`,
    explanation: 'Uses the "def" keyword, supports default arguments, and returns values.',
    output: 'Hello, CodeEasy!'
  },

  // JAVASCRIPT
  {
    id: 10,
    languageId: 'javascript',
    topicId: 'basics',
    title: 'Variable Declaration',
    codeExample: `const maxLimits = 100;\nlet currentCounts = 5;\ncurrentCounts++;\nconsole.log(currentCounts);`,
    explanation: 'Declares constant limits and mutable block-scoped loop indices.',
    output: '6'
  },
  {
    id: 11,
    languageId: 'javascript',
    topicId: 'control-flow',
    title: 'For...Of Iteration',
    codeExample: `const list = [10, 20, 30];\nfor (const val of list) {\n  console.log("Val:", val);\n}`,
    explanation: 'Iterates through values inside an iterable JavaScript Array container.',
    output: 'Val: 10\nVal: 20\nVal: 30'
  },
  {
    id: 12,
    languageId: 'javascript',
    topicId: 'functions',
    title: 'Arrow Function Declaration',
    codeExample: `const greet = (name) => \`Hello, \${name}!\`;\nconsole.log(greet("Web Developer"));`,
    explanation: 'Shorthand expression for standard JS functions utilizing arrow delimiters.',
    output: 'Hello, Web Developer!'
  },

  // C++
  {
    id: 30,
    languageId: 'cpp',
    topicId: 'basics',
    title: 'Variable Declaration',
    codeExample: `#include <iostream>\n#include <string>\n\nint main() {\n    int x = 42;\n    std::string name = "C++";\n    double score = 9.81;\n    bool is_ready = true;\n    std::cout << name << " value: " << x << std::endl;\n}`,
    explanation: 'Statically typed variable setup. Every declaration must declare a type (int, double, string, etc.).',
    output: 'C++ value: 42'
  },
  {
    id: 31,
    languageId: 'cpp',
    topicId: 'control-flow',
    title: 'Standard Range-based For Loop',
    codeExample: `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> items = {10, 20, 30};\n    for (int item : items) {\n        std::cout << "Item: " << item << "\\n";\n    }\n}`,
    explanation: 'Iterates through standard vector containers using C++11 range-based for syntax.',
    output: 'Item: 10\nItem: 20\nItem: 30'
  },

  // SQL
  {
    id: 50,
    languageId: 'sql',
    topicId: 'select',
    title: 'Select Columns',
    codeExample: `SELECT id, name, price\nFROM products\nWHERE in_stock = true\nORDER BY price ASC;`,
    explanation: 'Selects specific fields from table rows filtering by condition and sorting in ascending order.',
    output: ''
  },
  {
    id: 51,
    languageId: 'sql',
    topicId: 'joins',
    title: 'Inner Join Queries',
    codeExample: `SELECT users.display_name, orders.amount\nFROM users\nINNER JOIN orders ON users.id = orders.user_id;`,
    explanation: 'Combines columns from both tables matching overlapping primary-foreign key fields.',
    output: ''
  }
];

export const mockPracticeQuestions: MockPracticeQuestion[] = [
  // --- PYTHON EXERCISES ---
  {
    id: 1,
    languageId: 'python',
    topicId: 'basics',
    title: 'Double the Number',
    prompt: 'Write a program that reads an integer from **standard input** (stdin) and prints its value multiplied by 2.',
    difficulty: 'beginner',
    starterCode: `# Read integer input from stdin\nimport sys\nline = sys.stdin.readline().strip()\n\nif line:\n    num = int(line)\n    # Your code here:\n    # Print twice the number\n`,
    expectedOutput: '20',
    hints: ['Convert the input string to an integer using int()', 'Multiply it by 2 and output with print()'],
    testCases: [
      { input: '10\n', expectedOutput: '20', isHidden: false },
      { input: '-3\n', expectedOutput: '-6', isHidden: false },
      { input: '0\n', expectedOutput: '0', isHidden: true }
    ]
  },
  {
    id: 2,
    languageId: 'python',
    topicId: 'control-flow',
    title: 'Sum of First N Numbers',
    prompt: 'Write a program that reads a positive integer **N** from standard input and prints the sum of all numbers from 1 to N inclusive.',
    difficulty: 'beginner',
    starterCode: `import sys\nline = sys.stdin.readline().strip()\nif line:\n    n = int(line)\n    # Calculate sum from 1 to N\n    # Output result\n`,
    expectedOutput: '15',
    hints: ['You can use a loop or the formula (n * (n + 1)) / 2', 'Remember to print the final sum as an integer'],
    testCases: [
      { input: '5\n', expectedOutput: '15', isHidden: false },
      { input: '1\n', expectedOutput: '1', isHidden: false },
      { input: '100\n', expectedOutput: '5050', isHidden: true }
    ]
  },

  // --- JAVASCRIPT EXERCISES ---
  {
    id: 10,
    languageId: 'javascript',
    topicId: 'basics',
    title: 'JS Square Number',
    prompt: 'Write a script that reads input string numbers and logs their square to the console.',
    difficulty: 'beginner',
    starterCode: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n  const num = Number(input);\n  // Calculate and print square\n  console.log(num * num);\n}`,
    expectedOutput: '25',
    hints: ['Cast input to number', 'Multiply the number by itself'],
    testCases: [
      { input: '5\n', expectedOutput: '25', isHidden: false },
      { input: '12\n', expectedOutput: '144', isHidden: false },
      { input: '-4\n', expectedOutput: '16', isHidden: true }
    ]
  },

  // --- C EXERCISES ---
  {
    id: 20,
    languageId: 'c',
    topicId: 'basics',
    title: 'C Absolute Value',
    prompt: 'Write a program in C that reads a signed integer and outputs its absolute value.',
    difficulty: 'beginner',
    starterCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int x;\n    if (scanf("%d", &x) == 1) {\n        // Calculate absolute value and print\n    }\n    return 0;\n}`,
    expectedOutput: '45',
    hints: ['If x is less than 0, negate it: -x', 'Print it out using printf("%d\\n", val)'],
    testCases: [
      { input: '-45\n', expectedOutput: '45', isHidden: false },
      { input: '900\n', expectedOutput: '900', isHidden: false },
      { input: '0\n', expectedOutput: '0', isHidden: true }
    ]
  }
];

export const mockProjects: MockProject[] = [
  {
    id: 1,
    title: 'CLI Task Manager',
    slug: 'cli-task-manager',
    description: 'Create a fully functional Command Line Task Manager that can append, list, and complete tasks.',
    level: 'beginner',
    overview: 'Learn how to read user entries, process custom command strings, manage dynamic item lists, and log summaries to standard output.',
    languageIds: ['python', 'javascript', 'cpp'],
    milestones: [
      {
        title: 'Define Task List Datastructures',
        description: 'Initialize a tasks array list and add functions to add and view tasks.',
        starterCode: `# Task structure template\ntasks = []\n\ndef add_task(title):\n    tasks.append({"title": title, "completed": False})\n\ndef list_tasks():\n    for i, t in enumerate(tasks):\n        status = "[x]" if t["completed"] else "[ ]"\n        print(f"{i}: {status} {t['title']}")`,
        solutionHint: 'Verify that enumerate is used correctly, and double check index parameters.'
      },
      {
        title: 'Parse User Commands',
        description: 'Parse command line tokens such as `add "buy milk"`, `list`, or `done 0` in an infinite loop.',
        starterCode: `def start_loop():\n    while True:\n        cmd = input("> ").strip()\n        if cmd == "exit":\n            break\n        # Add parsing logic here`,
        solutionHint: 'Use .split(" ", 1) on the commands to separate keys from argument descriptors.'
      }
    ]
  },
  {
    id: 2,
    title: 'Secure Password Generator',
    slug: 'password-generator',
    description: 'Design a script that automatically creates customizable passwords with parameters for numbers, capitalization, and symbols.',
    level: 'beginner',
    overview: 'Explore random number generation algorithms, char codes mapping, password difficulty ratings, and string assembly routines.',
    languageIds: ['python', 'javascript'],
    milestones: [
      {
        title: 'Define String Pools',
        description: 'Store pools of alphabets, numerals, and punctuation characters to select characters from.',
        starterCode: `import random\nimport string\n\nletters = string.ascii_letters\ndigits = string.digits\nsymbols = string.punctuation`
      },
      {
        title: 'Assemble Random Password',
        description: 'Sample characters randomly from dynamic active pools to build a final string of user-specified length.',
        starterCode: `def generate_password(length=12):\n    pool = letters + digits\n    return "".join(random.choice(pool) for _ in range(length))`
      }
    ]
  }
];
