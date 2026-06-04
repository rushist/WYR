"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/data/questions";
import { getPercents } from "@/data/questions";
import type { ChoiceKey } from "@/store/useStore";

/* ── colour system for each option slot ─────────────────────────── */
const OPTION_THEME = {
  A: {
    border: "border-option-a/50",
    borderActive: "border-option-a",
    bg: "bg-option-a/10",
    bgFill: "bg-option-a/15",
    text: "text-option-a",
    hoverBorder: "hover:border-option-a/40",
    glowClass: "glow-blue",
    label: "A",
  },
  B: {
    border: "border-option-b/50",
    borderActive: "border-option-b",
    bg: "bg-option-b/10",
    bgFill: "bg-option-b/15",
    text: "text-option-b",
    hoverBorder: "hover:border-option-b/40",
    glowClass: "glow-red",
    label: "B",
  },
  C: {
    border: "border-option-c/50",
    borderActive: "border-option-c",
    bg: "bg-option-c/10",
    bgFill: "bg-option-c/15",
    text: "text-option-c",
    hoverBorder: "hover:border-option-c/40",
    glowClass: "glow-amber",
    label: "C",
  },
} as const;

interface QuestionCardProps {
  question: Question;
  onAnswer: (choice: ChoiceKey, responseTimeMs: number) => void;
  answered?: ChoiceKey | null;
}

export default function QuestionCard({
  question,
  onAnswer,
  answered,
}: QuestionCardProps) {
  const mountTime = useRef(Date.now());
  const [hovering, setHovering] = useState<ChoiceKey | null>(null);

  const handleAnswer = (choice: ChoiceKey) => {
    if (answered) return;
    const responseTime = Date.now() - mountTime.current;
    onAnswer(choice, responseTime);
  };

  const severityDots = Array.from(
    { length: 5 },
    (_, i) => i < question.severity
  );

  const percents = getPercents(question);
  const hasThreeOptions = !!question.choiceC;

  const choices: { key: ChoiceKey; text: string; pct: number }[] = [
    { key: "A", text: question.choiceA, pct: percents.a },
    { key: "B", text: question.choiceB, pct: percents.b },
  ];
  if (hasThreeOptions && question.choiceC) {
    choices.push({ key: "C", text: question.choiceC, pct: percents.c! });
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      {/* Top metadata */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] tracking-[0.2em] uppercase text-ghost/70 font-medium">
            {question.category}
          </span>
          {hasThreeOptions && (
            <span className="text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-option-c/10 text-option-c border border-option-c/20 font-semibold">
              3 options
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {severityDots.map((active, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  active ? "bg-accent" : "bg-border/50"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-ghost/50">
            {question.totalResponses.toLocaleString()} responses
          </span>
        </div>
      </div>

      {/* Question text */}
      <h2 className="font-display text-[clamp(1.5rem,5vw,3rem)] font-bold leading-[1.15] text-center mb-14 tracking-tight">
        {question.text}
      </h2>

      {/* Choice buttons */}
      <div className="grid gap-4 grid-cols-1">
        {choices.map((choice, idx) => {
          const theme = OPTION_THEME[choice.key];
          const isChosen = answered === choice.key;
          const isOther = answered !== null && answered !== choice.key;

          return (
            <motion.button
              key={choice.key}
              onClick={() => handleAnswer(choice.key)}
              onHoverStart={() => !answered && setHovering(choice.key)}
              onHoverEnd={() => setHovering(null)}
              disabled={!!answered}
              whileHover={!answered ? { scale: 1.015 } : undefined}
              whileTap={!answered ? { scale: 0.985 } : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`
                relative w-full rounded-2xl px-8 py-6 text-left text-lg font-medium
                transition-all duration-500 overflow-hidden cursor-pointer
                ${
                  answered
                    ? isChosen
                      ? `border-2 ${theme.borderActive} ${theme.bg} ${theme.glowClass}`
                      : "border border-border/20 bg-surface/30 opacity-40"
                    : `border border-border/40 bg-surface ${theme.hoverBorder} hover:bg-surface-light/30`
                }
              `}
            >
              {/* Fill bar — FADES IN at final width (no slide) */}
              {answered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                  style={{ width: `${choice.pct}%` }}
                  className={`absolute inset-y-0 left-0 rounded-2xl ${
                    isChosen
                      ? theme.bgFill
                      : "bg-ghost/5"
                  }`}
                />
              )}

              {/* Hover glow */}
              {!answered && hovering === choice.key && (
                <motion.div
                  layoutId="choice-glow"
                  className={`absolute inset-0 rounded-2xl ${theme.bg} border ${theme.border}`}
                  transition={{ duration: 0.3 }}
                />
              )}

              <span className="relative z-10 flex items-center justify-between gap-4">
                <span className="flex items-center gap-3">
                  <span
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0
                      transition-colors duration-300
                      ${
                        answered
                          ? isChosen
                            ? `${theme.bg} ${theme.text}`
                            : "bg-surface-light/30 text-ghost/30"
                          : hovering === choice.key
                            ? `${theme.bg} ${theme.text}`
                            : "bg-surface-light/50 text-ghost/60"
                      }
                    `}
                  >
                    {theme.label}
                  </span>
                  <span className={isOther ? "text-ghost/40" : ""}>
                    {choice.text}
                  </span>
                </span>
                {answered && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`text-sm font-mono whitespace-nowrap ${
                      isChosen ? theme.text : "text-ghost/40"
                    }`}
                  >
                    {choice.pct}%
                  </motion.span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
