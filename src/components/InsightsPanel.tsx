"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/data/questions";
import { getPercents } from "@/data/questions";
import type { ChoiceKey } from "@/store/useStore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* ── option colors (hex for recharts) ───────────────────────── */
const COLORS: Record<ChoiceKey, string> = {
  A: "#3b82f6",
  B: "#ef4444",
  C: "#f59e0b",
};
const TEXT_COLORS: Record<ChoiceKey, string> = {
  A: "text-option-a",
  B: "text-option-b",
  C: "text-option-c",
};
const BG_COLORS: Record<ChoiceKey, string> = {
  A: "bg-option-a/10 border-option-a/20",
  B: "bg-option-b/10 border-option-b/20",
  C: "bg-option-c/10 border-option-c/20",
};

/* ── personality signals ────────────────────────────────────── */
const PERSONALITIES = [
  { label: "Pragmatist", desc: "You chose the practical path" },
  { label: "Idealist", desc: "You follow your principles" },
  { label: "Contrarian", desc: "You swim against the current" },
  { label: "Empath", desc: "You feel deeply for others" },
  { label: "Strategist", desc: "You weigh every outcome" },
];

interface InsightsPanelProps {
  question: Question;
  userChoice: ChoiceKey;
  responseTimeMs: number;
  onNext: () => void;
}

export default function InsightsPanel({
  question,
  userChoice,
  responseTimeMs,
  onNext,
}: InsightsPanelProps) {
  const percents = getPercents(question);
  const hasThreeOptions = !!question.choiceC;
  const userPct =
    userChoice === "A"
      ? percents.a
      : userChoice === "B"
      ? percents.b
      : (percents.c ?? 0);

  // Majority check
  const allPcts = [
    percents.a,
    percents.b,
    ...(percents.c !== undefined ? [percents.c] : []),
  ];
  const maxPct = Math.max(...allPcts);
  const majorityKey: ChoiceKey =
    percents.a === maxPct ? "A" : percents.b === maxPct ? "B" : "C";
  const withMajority = userChoice === majorityKey;

  // Speed percentile
  const speedPercentile = Math.min(
    99,
    Math.max(5, Math.round(100 - responseTimeMs / 100))
  );

  // Controversy score: how evenly split (50/50 = 100, 100/0 = 0)
  const controversyScore = useMemo(() => {
    if (hasThreeOptions) {
      // For 3 options, perfect split is 33/33/33
      const ideal = 100 / 3;
      const deviation =
        Math.abs(percents.a - ideal) +
        Math.abs(percents.b - ideal) +
        Math.abs((percents.c ?? 0) - ideal);
      return Math.round(Math.max(0, 100 - deviation * 1.5));
    }
    return Math.round(100 - Math.abs(percents.a - 50) * 2);
  }, [percents, hasThreeOptions]);

  // Decision confidence (inverse of time, capped)
  const confidence = Math.min(100, Math.round((3000 / responseTimeMs) * 100));

  // Personality signal (seeded by question id)
  const personality = useMemo(() => {
    const seed =
      question.id.charCodeAt(question.id.length - 1) +
      (withMajority ? 0 : 2);
    return PERSONALITIES[seed % PERSONALITIES.length];
  }, [question.id, withMajority]);

  // Simulated trend data (7 data points over "weeks")
  const trendData = useMemo(() => {
    const base = percents.a;
    return Array.from({ length: 7 }, (_, i) => {
      const noise = Math.sin(i * 1.7 + question.id.length) * 8;
      return {
        week: `W${i + 1}`,
        value: Math.round(Math.max(5, Math.min(95, base + noise + (i - 3) * 1.2))),
      };
    });
  }, [percents.a, question.id]);

  // Simulated demographic data
  const demoData = useMemo(() => {
    const b = percents.a;
    return [
      {
        age: "18-24",
        A: Math.round(b + Math.sin(1) * 12),
        B: Math.round(100 - b - Math.sin(1) * 12),
      },
      {
        age: "25-34",
        A: Math.round(b + Math.sin(2) * 8),
        B: Math.round(100 - b - Math.sin(2) * 8),
      },
      {
        age: "35-44",
        A: Math.round(b - Math.sin(3) * 6),
        B: Math.round(100 - b + Math.sin(3) * 6),
      },
      {
        age: "45+",
        A: Math.round(b - 10),
        B: Math.round(100 - b + 10),
      },
    ];
  }, [percents.a]);

  // Vote split bars
  const voteBars: { key: ChoiceKey; label: string; pct: number }[] = [
    { key: "A", label: question.choiceA, pct: percents.a },
    { key: "B", label: question.choiceB, pct: percents.b },
  ];
  if (hasThreeOptions && question.choiceC) {
    voteBars.push({ key: "C", label: question.choiceC, pct: percents.c! });
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full h-full overflow-y-auto pr-2 custom-scrollbar"
    >
      <div className="space-y-5 pb-6">
        {/* Section title */}
        <motion.div variants={item}>
          <p className="text-[10px] tracking-[0.25em] uppercase text-ghost/50 mb-1">
            Insights
          </p>
          <p
            className={`text-sm font-medium ${
              withMajority ? "text-emerald" : TEXT_COLORS[userChoice]
            }`}
          >
            {withMajority
              ? `You sided with the ${userPct}% majority`
              : `You're in the ${userPct}% minority — you think differently`}
          </p>
        </motion.div>

        {/* Vote Split Bars */}
        <motion.div variants={item} className="glass rounded-xl p-4 space-y-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-ghost/50 font-medium">
            Vote Split
          </p>
          {voteBars.map((bar) => {
            const isUser = userChoice === bar.key;
            return (
              <div key={bar.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={isUser ? `${TEXT_COLORS[bar.key]} font-medium` : "text-ghost/70"}>
                    {bar.label}
                  </span>
                  <span className={`font-mono ${isUser ? TEXT_COLORS[bar.key] : "text-ghost/50"}`}>
                    {bar.pct}%
                  </span>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{
                      width: `${bar.pct}%`,
                      backgroundColor: isUser ? COLORS[bar.key] : undefined,
                    }}
                    className={`h-full rounded-full ${!isUser ? "bg-ghost/20" : ""}`}
                  />
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Metrics Grid: Speed + Controversy + Confidence */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {/* Speed */}
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-[9px] text-ghost/50 uppercase tracking-wider mb-1">Speed</p>
            <p className="font-mono text-lg font-bold">
              {(responseTimeMs / 1000).toFixed(1)}s
            </p>
            <p className={`text-[10px] font-mono ${TEXT_COLORS[userChoice]}`}>
              Top {speedPercentile}%
            </p>
          </div>

          {/* Controversy */}
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-[9px] text-ghost/50 uppercase tracking-wider mb-1">Controversy</p>
            <p
              className={`font-mono text-lg font-bold ${
                controversyScore > 70
                  ? "text-rose"
                  : controversyScore > 40
                  ? "text-amber"
                  : "text-emerald"
              }`}
            >
              {controversyScore}
            </p>
            <p className="text-[10px] text-ghost/40">
              {controversyScore > 70
                ? "Very divisive"
                : controversyScore > 40
                ? "Moderate"
                : "Consensus"}
            </p>
          </div>

          {/* Confidence */}
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-[9px] text-ghost/50 uppercase tracking-wider mb-1">Confidence</p>
            <p className="font-mono text-lg font-bold">{confidence}%</p>
            <p className="text-[10px] text-ghost/40">
              {confidence > 70 ? "Decisive" : confidence > 40 ? "Considered" : "Hesitant"}
            </p>
          </div>
        </motion.div>

        {/* Personality Signal */}
        <motion.div variants={item}>
          <div className={`rounded-xl p-4 border ${BG_COLORS[userChoice]}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                userChoice === "A" ? "bg-option-a/20" : userChoice === "B" ? "bg-option-b/20" : "bg-option-c/20"
              }`}>
                {personality.label === "Contrarian" ? "⚡" : personality.label === "Empath" ? "💜" : personality.label === "Pragmatist" ? "🎯" : personality.label === "Idealist" ? "✨" : "♟️"}
              </div>
              <div>
                <p className={`text-sm font-semibold ${TEXT_COLORS[userChoice]}`}>
                  {personality.label}
                </p>
                <p className="text-xs text-ghost/60">{personality.desc}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trend Sparkline */}
        <motion.div variants={item} className="glass rounded-xl p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-ghost/50 font-medium mb-3">
            Trend — Option A % over time
          </p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[userChoice]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS[userChoice]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.2)" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 9, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS[userChoice]}
                  strokeWidth={2}
                  fill="url(#trendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Demographics */}
        <motion.div variants={item} className="glass rounded-xl p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-ghost/50 font-medium mb-3">
            By Age Group — Option A %
          </p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.2)" />
                <XAxis
                  dataKey="age"
                  tick={{ fontSize: 9, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, 100]} />
                <Bar dataKey="A" fill={COLORS.A} radius={[4, 4, 0, 0]} />
                <Bar dataKey="B" fill={COLORS.B} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Total responses */}
        <motion.div variants={item} className="text-center">
          <p className="text-xs text-ghost/40">
            {(question.totalResponses + 1).toLocaleString()} total responses
          </p>
        </motion.div>

        {/* Next button */}
        <motion.div variants={item}>
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl border border-border/40 bg-surface hover:bg-surface-light
                       transition-colors text-sm font-medium text-ghost hover:text-text cursor-pointer"
          >
            Next Question →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
