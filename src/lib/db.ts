import { supabase } from './supabase';
import {
  mockLessons,
  mockQuizQuestions,
  mockSyntaxExamples,
  mockPracticeQuestions,
  mockProjects,
  MockLesson,
  MockQuizQuestion,
  MockSyntaxExample,
  MockPracticeQuestion,
  MockProject
} from '../content/mockData';

export type UserProfile = {
  id: string;
  display_name: string;
  xp: number;
  streak: number;
  preferred_programming_language_id?: string;
  created_at?: string;
};

export type ProgressEntry = {
  language_id: string;
  topic_id: string;
  status: 'not_started' | 'started' | 'completed';
  progress_percent: number;
};

export type SavedProgram = {
  id: number;
  language_id: string;
  title: string;
  description: string;
  code: string;
  updated_at: string;
};

// Local storage keys
const LS_PROFILE_KEY = 'codeeasy_profile';
const LS_PROGRESS_KEY = 'codeeasy_progress';
const LS_SAVED_PROGRAMS_KEY = 'codeeasy_saved_programs';
const LS_ATTEMPTS_KEY = 'codeeasy_attempts';
const LS_CHAT_KEY = 'codeeasy_chat_history';

// Helper to determine if Supabase is active
function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && !url.includes('example.co'));
}

// ----------------------------------------------------
// PROFILE SERVICES
// ----------------------------------------------------
export async function getProfile(): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist yet, create it
          const newProfile: UserProfile = {
            id: user.id,
            display_name: user.email?.split('@')[0] ?? 'Coder',
            xp: 0,
            streak: 1
          };
          await supabase.from('profiles').insert(newProfile);
          return newProfile;
        } else if (!error && data) {
          return data as UserProfile;
        }
      }
    } catch (e) {
      console.warn('Supabase profile fetch failed, falling back to localStorage.', e);
    }
  }

  // Local storage fallback
  const saved = localStorage.getItem(LS_PROFILE_KEY);
  if (saved) {
    return JSON.parse(saved) as UserProfile;
  }
  const defaultProfile: UserProfile = {
    id: 'local-guest',
    display_name: 'Guest Explorer',
    xp: 0,
    streak: 1
  };
  localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
}

export async function addXP(amount: number): Promise<UserProfile> {
  const current = await getProfile();
  const nextXP = current.xp + amount;
  const updated: UserProfile = {
    ...current,
    xp: nextXP,
    // Daily streak increment mock logic
    streak: current.streak === 0 ? 1 : current.streak
  };

  if (isSupabaseConfigured() && current.id !== 'local-guest') {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ xp: nextXP, streak: updated.streak })
        .eq('id', current.id);
      if (!error) return updated;
    } catch (e) {
      console.error(e);
    }
  }

  localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(updated));
  return updated;
}

// ----------------------------------------------------
// PROGRESS SERVICES
// ----------------------------------------------------
export async function getProgress(languageId: string): Promise<ProgressEntry[]> {
  const profile = await getProfile();

  if (isSupabaseConfigured() && profile.id !== 'local-guest') {
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', profile.id)
        .eq('language_id', languageId);
      if (!error && data) {
        return data as ProgressEntry[];
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // Local fallback
  const saved = localStorage.getItem(LS_PROGRESS_KEY);
  const list: ProgressEntry[] = saved ? JSON.parse(saved) : [];
  return list.filter((item) => item.language_id === languageId);
}

export async function completeTopic(languageId: string, topicId: string, xpReward = 50): Promise<void> {
  const profile = await getProfile();
  const progress: ProgressEntry = {
    language_id: languageId,
    topic_id: topicId,
    status: 'completed',
    progress_percent: 100
  };

  if (isSupabaseConfigured() && profile.id !== 'local-guest') {
    try {
      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: profile.id,
          language_id: languageId,
          topic_id: topicId,
          status: 'completed',
          progress_percent: 100,
          xp_earned: xpReward
        }, { onConflict: 'user_id,language_id,topic_id' });

      if (!error) {
        await addXP(xpReward);
        return;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Local fallback
  const saved = localStorage.getItem(LS_PROGRESS_KEY);
  const list: ProgressEntry[] = saved ? JSON.parse(saved) : [];
  const index = list.findIndex(
    (item) => item.language_id === languageId && item.topic_id === topicId
  );
  if (index !== -1) {
    list[index] = progress;
  } else {
    list.push(progress);
  }
  localStorage.setItem(LS_PROGRESS_KEY, JSON.stringify(list));
  await addXP(xpReward);
}

// ----------------------------------------------------
// LESSONS & DATA ACCESS
// ----------------------------------------------------
export async function getLessons(languageId: string): Promise<MockLesson[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('language_id', languageId)
        .eq('is_published', true)
        .order('order_index', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          languageId: item.language_id,
          topicId: item.topic_id,
          title: item.title,
          slug: item.slug,
          content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
          orderIndex: item.order_index
        }));
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return mockLessons.filter((item) => item.languageId === languageId);
}

export async function getQuizQuestions(languageId: string, topicId: string): Promise<MockQuizQuestion[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('language_id', languageId)
        .eq('topic_id', topicId)
        .eq('is_published', true);
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          languageId: item.language_id,
          topicId: item.topic_id,
          prompt: item.prompt,
          options: Array.isArray(item.options) ? item.options : JSON.parse(item.options ?? '[]'),
          correctAnswer: item.correct_answer,
          explanation: item.explanation,
          difficulty: item.difficulty
        }));
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return mockQuizQuestions.filter(
    (item) => item.languageId === languageId && item.topicId === topicId
  );
}

export async function getSyntaxExamples(): Promise<MockSyntaxExample[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('syntax_examples')
        .select('*')
        .eq('is_published', true);
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          languageId: item.language_id,
          topicId: item.topic_id,
          title: item.title,
          codeExample: item.code_example,
          explanation: item.explanation,
          output: item.output
        }));
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return mockSyntaxExamples;
}

export async function getPracticeQuestions(languageId?: string): Promise<MockPracticeQuestion[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('practice_questions')
        .select('*, test_cases(*)');
      if (languageId) {
        query = query.eq('language_id', languageId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          languageId: item.language_id,
          topicId: item.topic_id,
          title: item.title,
          prompt: item.prompt,
          difficulty: item.difficulty,
          starterCode: item.starter_code,
          expectedOutput: item.expected_output,
          hints: item.hints ?? [],
          testCases: (item.test_cases ?? []).map((tc: any) => ({
            input: tc.input,
            expectedOutput: tc.expected_output,
            isHidden: tc.is_hidden
          }))
        }));
      }
    } catch (e) {
      console.warn(e);
    }
  }

  if (languageId) {
    return mockPracticeQuestions.filter((item) => item.languageId === languageId);
  }
  return mockPracticeQuestions;
}

export async function getProjects(): Promise<MockProject[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_languages(language_id)');
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          description: item.description,
          level: item.level,
          overview: item.overview,
          languageIds: (item.project_languages ?? []).map((pl: any) => pl.language_id),
          milestones: [] // Add mock steps if not fully supported in SQL
        }));
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return mockProjects;
}

// ----------------------------------------------------
// PRACTICE ATTEMPTS LOGGING
// ----------------------------------------------------
export type PracticeAttempt = {
  id: number;
  question_title: string;
  language_id: string;
  passed: boolean;
  score: number;
  created_at: string;
};

export async function submitPracticeAttempt(
  questionId: number,
  questionTitle: string,
  languageId: string,
  code: string,
  passed: boolean,
  score: number
): Promise<void> {
  const profile = await getProfile();
  const xpAward = passed ? 100 : 10;

  if (isSupabaseConfigured() && profile.id !== 'local-guest') {
    try {
      await supabase.from('practice_attempts').insert({
        user_id: profile.id,
        practice_question_id: questionId,
        language_id: languageId,
        submitted_code: code,
        passed,
        score
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Local fallback
  const saved = localStorage.getItem(LS_ATTEMPTS_KEY);
  const list: PracticeAttempt[] = saved ? JSON.parse(saved) : [];
  list.unshift({
    id: Date.now(),
    question_title: questionTitle,
    language_id: languageId,
    passed,
    score,
    created_at: new Date().toISOString()
  });
  localStorage.setItem(LS_ATTEMPTS_KEY, JSON.stringify(list.slice(0, 50))); // Cap at 50

  await addXP(xpAward);
}

export async function getRecentAttempts(): Promise<PracticeAttempt[]> {
  const profile = await getProfile();
  if (isSupabaseConfigured() && profile.id !== 'local-guest') {
    try {
      const { data, error } = await supabase
        .from('practice_attempts')
        .select('*, practice_questions(title)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          question_title: item.practice_questions?.title ?? 'Practice Question',
          language_id: item.language_id,
          passed: item.passed,
          score: Number(item.score),
          created_at: item.created_at
        }));
      }
    } catch (e) {
      console.warn(e);
    }
  }

  const saved = localStorage.getItem(LS_ATTEMPTS_KEY);
  return saved ? JSON.parse(saved) : [];
}

// ----------------------------------------------------
// CHAT / AI CHAT PERSISTENCE
// ----------------------------------------------------
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export function getLocalChatHistory(languageId: string): ChatMessage[] {
  const saved = localStorage.getItem(`${LS_CHAT_KEY}_${languageId}`);
  if (saved) return JSON.parse(saved);

  // Return a friendly default starting prompt
  return [
    {
      role: 'assistant',
      content: `Hello! I am your AI Tutor specializing in **${languageId.toUpperCase()}**. You can ask me syntax questions, paste code blocks to debug, or request optimal programming patterns. How can I help you today?`,
      timestamp: new Date().toISOString()
    }
  ];
}

export function saveLocalChatHistory(languageId: string, messages: ChatMessage[]) {
  localStorage.setItem(`${LS_CHAT_KEY}_${languageId}`, JSON.stringify(messages));
}
