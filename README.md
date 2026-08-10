# CodeEasy (DevPath) - Language-Agnostic Coding Platform

CodeEasy is a premium, modern, language-agnostic learning platform that allows developers to learn concepts, compare syntax, solve coding challenges, build guided projects, and chat with an AI tutor across multiple languages (Python, JavaScript, C, C++, Java, and SQL).

---

## ⚡ Key Features

1. **Structured Learning Stepper & Quizzes**
   * Curated roadmap modules detailing coding fundamentals.
   * Markdown lesson viewer with syntax-highlighted code blocks.
   * Multiple-choice checkpoints at the end of each lesson awarding **50 XP** on completion.

2. **Side-by-Side Syntax Comparer**
   * Search and filter code syntax patterns by keyword.
   * **Side-by-Side Comparison**: Compare how syntax structures (like declaring variables, for loops, or functions) look across different languages side-by-side in real-time.

3. **Practice Arena & Real-Time Test Runner**
   * Dynamic catalog of coding challenges filtering by language and difficulty level.
   * Split-screen code workspace with starter templates, standard input (stdin) editor, hints dropdowns, and an output console.
   * Sequential validation runner invoking the **Piston API** to evaluate the code against hidden test cases. Launches confetti and awards **100 XP** upon passing.

4. **API-Backed Gemini AI Tutor**
   * Multi-prompt preset panels (Logical debugging, Code explanations, Complexity analysis).
   * Browser-secure Gemini API client calling Google AI services when supplied with a user API Key (keys are saved strictly in local storage).
   * Context-aware code simulator fallback if no API key is set up.

5. **Guided Project Builder**
   * Multi-stage build tasks (e.g. CLI Task Manager, Secure Password Generator).
   * One-click "Load in Compiler" redirection mapping starter templates directly into the compiler.

6. **Interactive Dashboard Statistics**
   * XP levelling status bar (100 XP per level).
   * Daily streaks calculation.
   * Completion percentages per programming language roadmap.
   * Historical attempts log.

---

## 🏗️ Technical Architecture

CodeEasy is built as a single-page application (SPA) with a resilient data-fetching architecture:
* **Frontend**: React + TypeScript powered by Vite.
* **Styling**: Vanilla CSS featuring customized glassmorphism cards, glowing active states, and custom layout grids.
* **Resilient Database Layer**: Safely queries **Supabase** if keys are supplied. Otherwise, it automatically falls back to browser-backed **LocalStorage**, preserving streak counters, XP increments, and compiler attempts.
* **Execution Gateway**: Leverages the **EMKC Piston API** to build and run codes securely in the browser.

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Copy `.env.example` to `.env.local` and set your Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(If you do not have Supabase configured, the application will automatically run using the localStorage fallback database).*

### 2. Configure Database Tables
If using Supabase, navigate to your Supabase SQL Editor and run the queries defined inside:
```bash
supabase/schema.sql
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```
