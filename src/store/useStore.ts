import { create } from "zustand";

export type ChoiceKey = "A" | "B" | "C";
export type Theme = "dark" | "light";

export interface Answer {
  questionId: string;
  choice: ChoiceKey;
  responseTimeMs: number;
  timestamp: number;
}

interface WYRStore {
  // Auth
  isAuthenticated: boolean;
  user: { email: string; id: string; name?: string } | null;
  setAuth: (user: { email: string; id: string; name?: string } | null) => void;
  logout: () => void;

  // Theme
  theme: Theme;
  toggleTheme: () => void;

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
  getAnswerForQuestion: (questionId: string) => Answer | undefined;

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
  setAuth: (user) =>
    set({ user, isAuthenticated: !!user, showPaywall: false }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      answers: [],
      answeredCount: 0,
      currentIndex: 0,
    }),

  // Theme
  theme: "dark",
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    // Apply to DOM
    const html = document.documentElement;
    html.classList.add("theme-transition");
    if (next === "light") {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
    // Remove transition class after animation
    setTimeout(() => html.classList.remove("theme-transition"), 500);
    // Persist
    try {
      localStorage.setItem("wyr-theme", next);
    } catch {}
    set({ theme: next });
  },

  // Questions
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
  answerQuestion: (questionId, choice, responseTimeMs) => {
    const { answers, answeredCount, isAuthenticated } = get();

    const alreadyAnswered = answers.find((a) => a.questionId === questionId);
    if (alreadyAnswered) return;

    const newAnswer: Answer = {
      questionId,
      choice,
      responseTimeMs,
      timestamp: Date.now(),
    };

    const newCount = answeredCount + 1;

    set({
      answers: [...answers, newAnswer],
      answeredCount: newCount,
      showAnalytics: true,
    });

    // Paywall trigger: after 3 questions if not authenticated
    if (!isAuthenticated && newCount >= 3) {
      setTimeout(() => {
        if (!get().isAuthenticated) {
          set({ showPaywall: true });
        }
      }, 3500);
    }
  },
  getAnswerForQuestion: (questionId) =>
    get().answers.find((a) => a.questionId === questionId),

  // UI
  showAnalytics: false,
  setShowAnalytics: (show) => set({ showAnalytics: show }),
  showPaywall: false,
  setShowPaywall: (show) => set({ showPaywall: show }),
}));
