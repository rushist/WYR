"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/data/questions";
import { getPercents } from "@/data/questions";
import type { ChoiceKey } from "@/store/useStore";

const BAR_COLORS: Record<ChoiceKey, { active: string; inactive: string; text: string }> = {
  A: {
    active: "bg-gradient-to-r from-option-a to-blue-400",
    inactive: "bg-ghost/20",
    text: "text-option-a",
  },
  B: {
    active: "bg-gradient-to-r from-option-b to-red-400",
    inactive: "bg-ghost/20",
    text: "text-option-b",
  },
  C: {
    active: "bg-gradient-to-r from-option-c to-amber-300",
    inactive: "bg-ghost/20",
    text: "text-option-c",
  },
};

interface AnalyticsOverlayProps {
  question: Question;
  userChoice: ChoiceKey;
  responseTimeMs: number;
  onDismiss: () => void;
}

export default function AnalyticsOverlay({
  question,
  userChoice,
  responseTimeMs,
  onDismiss,
}: AnalyticsOverlayProps) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const percents = getPercents(question);
  const hasThreeOptions = !!question.choiceC;

  const bars: { key: ChoiceKey; label: string; pct: number }[] = [
    { key: "A", label: question.choiceA, pct: percents.a },
    { key: "B", label: question.choiceB, pct: percents.b },
  ];
  if (hasThreeOptions && question.choiceC) {
    bars.push({ key: "C", label: question.choiceC, pct: percents.c! });
  }

  const userPct = userChoice === "A" ? percents.a : userChoice === "B" ? percents.b : (percents.c ?? 0);

  // Find majority
  const allPcts = [percents.a, percents.b, ...(percents.c !== undefined ? [percents.c] : [])];
  const maxPct = Math.max(...allPcts);
  const majorityKey: ChoiceKey = percents.a === maxPct ? "A" : percents.b === maxPct ? "B" : "C";
  const withMajority = userChoice === majorityKey;

  // Simulated speed percentile
  const speedPercentile = Math.min(
    99,
    Math.max(5, Math.round(100 - responseTimeMs / 100))
  );

  const insight = withMajority
    ? `You sided with the ${userPct}% majority.`
    : `You're in the ${userPct}% minority. You think differently.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto mt-8 px-6"
    >
      <div className="glass rounded-2xl p-6 space-y-5">
        {/* Distribution bars */}
        <div className="space-y-3">
          {bars.map((bar, i) => {
            const colors = BAR_COLORS[bar.key];
            const isUserChoice = userChoice === bar.key;

            return (
              <div key={bar.key} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span
                    className={
                      isUserChoice ? `${colors.text} font-medium` : "text-ghost"
                    }
                  >
                    {bar.label}
                  </span>
                  <span className={`font-mono text-sm ${isUserChoice ? colors.text : ""}`}>
                    {bar.pct}%
                  </span>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.pct}%` }}
                    transition={{
                      duration: 1.2,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.1 + i * 0.1,
                    }}
                    className={`h-full rounded-full ${
                      isUserChoice ? colors.active : colors.inactive
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="text-center">
            <p className="text-xs text-ghost/60 mb-0.5">Speed</p>
            <p className="text-sm font-mono">
              {(responseTimeMs / 1000).toFixed(1)}s
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-ghost/60 mb-0.5">Faster than</p>
            <p className={`text-sm font-mono ${BAR_COLORS[userChoice].text}`}>{speedPercentile}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-ghost/60 mb-0.5">Responses</p>
            <p className="text-sm font-mono">
              {(question.totalResponses + 1).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Insight */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-ghost text-center italic"
        >
          {insight}
        </motion.p>
      </div>

      {/* Continue hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2 }}
        className="text-center text-xs text-ghost mt-4"
      >
        scroll for next question
      </motion.p>
    </motion.div>
  );
}
