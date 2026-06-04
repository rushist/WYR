"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import type { ChoiceKey } from "@/store/useStore";
import QuestionCard from "@/components/QuestionCard";
import InsightsPanel from "@/components/InsightsPanel";
import PaywallModal from "@/components/PaywallModal";
import AgeGroupModal from "@/components/AgeGroupModal";

export default function FeedPage() {
  const {
    questions,
    questionsLoading,
    loadQuestions,
    currentIndex,
    nextQuestion,
    answerQuestion,
    getMostRecentAnswer,
    showAnalytics,
    answeredCount,
  } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollLock = useRef(false);

  // Load questions from DB on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  console.log("FEED QUESTIONS LOADED IN CLIENT:", questions);

  const currentQuestion = questions.length > 0
    ? questions[currentIndex % questions.length]
    : null;

  const existingAnswer = currentQuestion
    ? getMostRecentAnswer(currentQuestion.id)
    : undefined;
  const isAnswered = !!existingAnswer;
  const showInsights = isAnswered && showAnalytics;

  const handleAnswer = useCallback(
    (choice: ChoiceKey, responseTimeMs: number) => {
      if (currentQuestion) {
        answerQuestion(currentQuestion.id, choice, responseTimeMs);
      }
    },
    [currentQuestion?.id, answerQuestion]
  );

  const handleNext = useCallback(() => {
    if (!scrollLock.current) {
      scrollLock.current = true;
      nextQuestion();
      setTimeout(() => {
        scrollLock.current = false;
      }, 800);
    }
  }, [nextQuestion]);

  // Scroll/wheel to next question
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollLock.current) return;
      if (!existingAnswer) return;
      if (e.deltaY > 30) {
        handleNext();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [existingAnswer, handleNext]);

  // Touch swipe support
  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (scrollLock.current) return;
      if (!existingAnswer) return;
      const deltaY = startY - e.changedTouches[0].clientY;
      if (deltaY > 60) {
        handleNext();
      }
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [existingAnswer, handleNext]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        if (existingAnswer && !scrollLock.current) {
          e.preventDefault();
          handleNext();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [existingAnswer, handleNext]);

  // Loading state
  if (questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-ghost/60 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-ghost/60 text-lg">No questions yet.</p>
          <p className="text-ghost/40 text-sm">Run the seed or scrape endpoint to populate questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Subtle background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-void" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      {/* Progress indicator */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-3 glass rounded-full px-5 py-2.5">
          <span className="text-xs text-ghost/60">#{currentIndex + 1}</span>
          <div className="w-px h-3 bg-border/50" />
          <span className="text-xs text-ghost/60">{answeredCount} answered</span>
        </div>
      </div>

      {/* Main split layout */}
      <div className="w-full max-w-7xl mx-auto px-8 py-20 flex items-start justify-center gap-8">
        {/* Left: Question card */}
        <motion.div
          animate={{
            width: showInsights ? "55%" : "100%",
            maxWidth: showInsights ? "700px" : "700px",
            x: showInsights ? -40 : 0,
          }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
          style={{ minHeight: "60vh" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <QuestionCard
                question={currentQuestion}
                onAnswer={handleAnswer}
                answered={existingAnswer?.choice ?? null}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Right: Insights panel */}
        <AnimatePresence>
          {showInsights && existingAnswer && (
            <motion.div
              key={`insights-${currentQuestion.id}`}
              initial={{ opacity: 0, x: 120, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "40%" }}
              exit={{ opacity: 0, x: 80, width: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="overflow-hidden"
              style={{ maxHeight: "85vh", maxWidth: "420px" }}
            >
              <InsightsPanel
                question={currentQuestion}
                userChoice={existingAnswer.choice}
                responseTimeMs={existingAnswer.responseTimeMs}
                onNext={handleNext}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll hint */}
      {isAnswered && !showAnalytics && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 text-xs text-ghost"
        >
          scroll for next question
        </motion.p>
      )}

      {/* Modals */}
      <PaywallModal />
      <AgeGroupModal />
    </div>
  );
}
