import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { fetchQuestions, fetchUserAnswers } from "@/lib/questions";
import type { Question } from "@/data/questions";

export type ChoiceKey = "A" | "B" | "C";
export type Theme = "dark" | "light";

export interface Answer {
  questionId: string;
  choice: ChoiceKey;
  responseTimeMs: number;
  timestamp: number;
}

interface WYRStore {
  // Auth & Profile
  isAuthenticated: boolean;
  user: { email: string; id: string; name?: string } | null;
  ageGroup: string | null;
  setAuth: (user: { email: string; id: string; name?: string } | null) => Promise<void>;
  setAgeGroup: (age: string) => void;
  logout: () => void;

  // Theme
  theme: Theme;
  toggleTheme: () => void;

  // Questions from DB
  questions: Question[];
  questionsLoading: boolean;
  loadQuestions: () => Promise<void>;

  // Question navigation
  currentIndex: number;
  nextQuestion: () => void;
  setCurrentIndex: (i: number) => void;

  // Answers
  answers: Answer[];
  answeredCount: number;
  answerQuestion: (
    questionId: string,
    choice: ChoiceKey,
    responseTimeMs: number
  ) => void;
  getMostRecentAnswer: (questionId: string) => Answer | undefined;
  shouldResurfaceQuestion: (questionId: string) => boolean;

  // UI state
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
}

export const useStore = create<WYRStore>((set, get) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  ageGroup: null,
  setAuth: async (user) => {
    set({ user, isAuthenticated: !!user, showPaywall: false });
    if (user) {
      // Restore answer history from Supabase
      const pastAnswers = await fetchUserAnswers(user.id);
      if (pastAnswers.length > 0) {
        set({ answers: pastAnswers, answeredCount: pastAnswers.length });
      }
      // Reload questions filtered for this user
      get().loadQuestions();
    }
  },
  setAgeGroup: (ageGroup) => {
    set({ ageGroup });
    const { user } = get();
    if (user) {
      supabase.from("profiles").upsert({ id: user.id, age_group: ageGroup }).then();
    }
  },
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      ageGroup: null,
      answers: [],
      answeredCount: 0,
      currentIndex: 0,
    }),

  // Theme
  theme: "dark",
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    const html = document.documentElement;
    html.classList.add("theme-transition");
    if (next === "light") {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
    setTimeout(() => html.classList.remove("theme-transition"), 500);
    try {
      localStorage.setItem("wyr-theme", next);
    } catch {}
    set({ theme: next });
  },

  // Questions from DB
  questions: [],
  questionsLoading: true,
  loadQuestions: async () => {
    set({ questionsLoading: true });
    const { user } = get();
    const questions = await fetchQuestions(user?.id);
    set({ questions, questionsLoading: false });
  },

  // Navigation
  currentIndex: 0,
  nextQuestion: () =>
    set((s) => ({
      currentIndex: s.currentIndex + 1,
      showAnalytics: false,
    })),
  setCurrentIndex: (i) => set({ currentIndex: i }),

  // Answers
  answers: [],
  answeredCount: 0,
  answerQuestion: async (questionId, choice, responseTimeMs) => {
    const { answers, answeredCount, isAuthenticated, user, ageGroup } = get();

    const recentAnswer = get().getMostRecentAnswer(questionId);
    if (recentAnswer && Date.now() - recentAnswer.timestamp < 1000 * 60 * 60) {
      return;
    }

    const newAnswer: Answer = {
      questionId,
      choice,
      responseTimeMs,
      timestamp: Date.now(),
    };

    const newCount = answeredCount + 1;

    // Optimistic UI update
    set({
      answers: [...answers, newAnswer],
      answeredCount: newCount,
      showAnalytics: true,
    });

    // Save to Supabase (Background)
    supabase.from("answers").insert({
      question_id: questionId,
      user_id: user?.id || null,
      choice: choice,
      response_time_ms: responseTimeMs,
      age_group: ageGroup || null,
    }).then(({ error }) => {
      if (error) console.error("Failed to save answer to Supabase:", error);
    });

    // Paywall trigger
    if (!isAuthenticated && newCount >= 3) {
      setTimeout(() => {
        if (!get().isAuthenticated) {
          set({ showPaywall: true });
        }
      }, 3500);
    }
  },

  getMostRecentAnswer: (questionId) => {
    const { answers } = get();
    const matches = answers.filter((a) => a.questionId === questionId);
    if (matches.length === 0) return undefined;
    return matches[matches.length - 1];
  },

  shouldResurfaceQuestion: (questionId) => {
    const { answers } = get();
    const matches = answers.filter((a) => a.questionId === questionId);
    if (matches.length === 0) return false;
    // Already answered twice — never resurface again
    if (matches.length >= 2) return false;
    // Answered once — resurface after 7 days for bias re-check
    const latestAnswer = matches[matches.length - 1];
    const daysPassed = (Date.now() - latestAnswer.timestamp) / (1000 * 60 * 60 * 24);
    return daysPassed >= 7;
  },

  // UI
  showAnalytics: false,
  setShowAnalytics: (show) => set({ showAnalytics: show }),
  showPaywall: false,
  setShowPaywall: (show) => set({ showPaywall: show }),
}));
