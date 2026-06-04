"use client";

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/data/questions";
import type { ChoiceKey } from "@/store/useStore";
import { fetchQuestionStats, fetchQuestionDemographics } from "@/lib/questions";
import {
  Target,
  Sparkles,
  Zap,
  HeartPulse,
  BrainCircuit,
  Users,
  Timer,
  TrendingUp,
  Shield,
  Landmark,
  Scale,
  Flame,
  Compass,
  Heart,
} from "lucide-react";
import {
  ResponsiveContainer,
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

/* ── dynamic personality engine ────────────────────────────────────── */
function getDynamicPersonality(
  question: Question,
  choice: ChoiceKey,
  withMajority: boolean
) {
  const category = (question.category || "General").toLowerCase();
  const choiceText = (
    choice === "A"
      ? question.choiceA
      : choice === "B"
      ? question.choiceB
      : question.choiceC || ""
  ).toLowerCase();
  const questionText = question.text.toLowerCase();

  // 1. Altruism vs Self-interest indicators
  const isSocialOrAltruistic =
    choiceText.includes("other") ||
    choiceText.includes("save") ||
    choiceText.includes("help") ||
    choiceText.includes("people") ||
    choiceText.includes("loved one") ||
    choiceText.includes("friend") ||
    choiceText.includes("family");

  const isSelfInterest =
    choiceText.includes("self") ||
    choiceText.includes("money") ||
    choiceText.includes("rich") ||
    choiceText.includes("million") ||
    choiceText.includes("alone") ||
    choiceText.includes("private");

  // 2. Category-specific mapping
  if (category.includes("ethics") || category.includes("philosophy")) {
    if (isSocialOrAltruistic) {
      return {
        label: "Altruist",
        desc: "You prioritize the collective good and empathy.",
        Icon: Heart,
        bg: "bg-rose/10 border-rose/20",
        text: "text-rose",
        iconContainer: "bg-rose/20 text-rose",
      };
    }
    if (isSelfInterest) {
      return {
        label: "Pragmatic Individualist",
        desc: "You prioritize self-preservation and tangible outcomes.",
        Icon: Scale,
        bg: "bg-amber/10 border-amber/20",
        text: "text-amber",
        iconContainer: "bg-amber/20 text-amber",
      };
    }
    return {
      label: "Moral Philosopher",
      desc: "You weigh complex ethical principles over simple comfort.",
      Icon: Compass,
      bg: "bg-emerald/10 border-emerald/20",
      text: "text-emerald",
      iconContainer: "bg-emerald/20 text-emerald",
    };
  }

  if (
    category.includes("survival") ||
    questionText.includes("die") ||
    questionText.includes("death") ||
    questionText.includes("survive")
  ) {
    if (
      choiceText.includes("know") ||
      choiceText.includes("truth") ||
      choiceText.includes("accept")
    ) {
      return {
        label: "Stoic",
        desc: "You face harsh realities head-on with courage.",
        Icon: Shield,
        bg: "bg-purple-400/10 border-purple-400/20",
        text: "text-purple-400",
        iconContainer: "bg-purple-400/20 text-purple-400",
      };
    }
    return {
      label: "Survivalist",
      desc: "Your primary focus is staying alive and minimizing risk.",
      Icon: Flame,
      bg: "bg-rose/10 border-rose/20",
      text: "text-rose",
      iconContainer: "bg-rose/20 text-rose",
    };
  }

  if (category.includes("technology") || category.includes("future")) {
    if (
      choiceText.includes("tech") ||
      choiceText.includes("ai") ||
      choiceText.includes("digital") ||
      choiceText.includes("future")
    ) {
      return {
        label: "Techno-Optimist",
        desc: "You embrace the future and digital evolution.",
        Icon: BrainCircuit,
        bg: "bg-blue-400/10 border-blue-400/20",
        text: "text-blue-400",
        iconContainer: "bg-blue-400/20 text-blue-400",
      };
    }
    return {
      label: "Traditionalist",
      desc: "You prefer the organic, tangible human experience.",
      Icon: Landmark,
      bg: "bg-emerald/10 border-emerald/20",
      text: "text-emerald",
      iconContainer: "bg-emerald/20 text-emerald",
    };
  }

  if (
    category.includes("money") ||
    category.includes("wealth") ||
    isSelfInterest
  ) {
    return {
      label: "Financial Realist",
      desc: "You value freedom, security, and economic stability.",
      Icon: Landmark,
      bg: "bg-amber/10 border-amber/20",
      text: "text-amber",
      iconContainer: "bg-amber/20 text-amber",
    };
  }

  // 3. Fallbacks based on choices and majority alignment
  if (!withMajority) {
    return {
      label: "Contrarian Rebel",
      desc: "You swim against the current, valuing your own unique perspective.",
      Icon: Zap,
      bg: "bg-rose/10 border-rose/20",
      text: "text-rose",
      iconContainer: "bg-rose/20 text-rose",
    };
  }

  if (isSocialOrAltruistic) {
    return {
      label: "Empath",
      desc: "You feel deeply for others and make connection-driven choices.",
      Icon: HeartPulse,
      bg: "bg-rose/10 border-rose/20",
      text: "text-rose",
      iconContainer: "bg-rose/20 text-rose",
    };
  }

  return {
    label: "Idealist",
    desc: "You stick to your core principles and values.",
    Icon: Sparkles,
    bg: "bg-emerald/10 border-emerald/20",
      text: "text-emerald",
      iconContainer: "bg-emerald/20 text-emerald",
  };
}

interface Stats {
  total: number;
  pctA: number;
  pctB: number;
  pctC: number;
  avgTime: number;
  avgTimeA: number | null;
  avgTimeB: number | null;
  avgTimeC: number | null;
}

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
  const hasThreeOptions = !!question.choiceC;

  // Real DB Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [demographics, setDemographics] = useState<
    { age: string; A: number; B: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [s, d] = await Promise.all([
        fetchQuestionStats(question.id),
        fetchQuestionDemographics(question.id),
      ]);
      if (s) {
        setStats({
          total: s.total,
          pctA: s.pctA,
          pctB: s.pctB,
          pctC: s.pctC,
          avgTime: s.avgTime,
          avgTimeA: s.avgTimeA,
          avgTimeB: s.avgTimeB,
          avgTimeC: s.avgTimeC,
        });
      }
      setDemographics(d);
      setLoading(false);
    }
    load();
  }, [question.id]);

  // Derived values (only when we have real stats)
  const userPct = stats
    ? userChoice === "A"
      ? stats.pctA
      : userChoice === "B"
      ? stats.pctB
      : stats.pctC
    : null;

  const majorityKey: ChoiceKey | null = stats
    ? stats.pctA >= stats.pctB && stats.pctA >= stats.pctC
      ? "A"
      : stats.pctB >= stats.pctC
      ? "B"
      : "C"
    : null;

  const withMajority = majorityKey ? userChoice === majorityKey : false;

  // Speed percentile (real)
  const speedPercentile = stats
    ? Math.min(99, Math.max(1, Math.round(100 - (responseTimeMs / stats.avgTime) * 50)))
    : null;

  // Controversy score (real)
  const controversyScore = useMemo(() => {
    if (!stats) return null;
    if (hasThreeOptions) {
      const ideal = 100 / 3;
      const deviation =
        Math.abs(stats.pctA - ideal) +
        Math.abs(stats.pctB - ideal) +
        Math.abs(stats.pctC - ideal);
      return Math.round(Math.max(0, 100 - deviation * 1.5));
    }
    return Math.round(100 - Math.abs(stats.pctA - 50) * 2);
  }, [stats, hasThreeOptions]);

  // Decision confidence (real)
  const confidence = stats
    ? Math.min(100, Math.round((stats.avgTime / responseTimeMs) * 100))
    : null;

  // Personality signal
  const personality = useMemo(() => {
    return getDynamicPersonality(question, userChoice, withMajority);
  }, [question, userChoice, withMajority]);

  // Hesitation Factor
  const hesitationText = useMemo(() => {
    if (!stats || (!stats.avgTimeA && !stats.avgTimeB)) return null;
    if (stats.avgTimeA && stats.avgTimeB) {
      const diff = stats.avgTimeA - stats.avgTimeB;
      if (Math.abs(diff) < 500) return "Both choices took similar time to decide";
      if (diff < 0)
        return `Choice A was ${(Math.abs(diff) / 1000).toFixed(1)}s faster — less hesitation`;
      return `Choice B was ${(Math.abs(diff) / 1000).toFixed(1)}s faster — less hesitation`;
    }
    return null;
  }, [stats]);

  // Generation Gap
  const genGap = useMemo(() => {
    if (demographics.length < 2) return null;
    const sortedByA = [...demographics].sort((a, b) => a.A - b.A);
    const minA = sortedByA[0];
    const maxA = sortedByA[sortedByA.length - 1];
    if (maxA.A - minA.A > 20) {
      return `${maxA.age} heavily prefers A (${maxA.A}%), while ${minA.age} leans B.`;
    }
    return "Consistent across generations.";
  }, [demographics]);

  // Vote split bars
  const voteBars: { key: ChoiceKey; label: string; pct: number }[] = stats
    ? [
        { key: "A", label: question.choiceA, pct: stats.pctA },
        { key: "B", label: question.choiceB, pct: stats.pctB },
        ...(hasThreeOptions && question.choiceC
          ? [{ key: "C" as ChoiceKey, label: question.choiceC, pct: stats.pctC }]
          : []),
      ]
    : [];

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

  const IconComponent = personality.Icon;

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-5 pb-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="glass rounded-xl p-4 animate-pulse"
            >
              <div className="h-3 bg-ghost/10 rounded w-1/3 mb-3" />
              <div className="h-5 bg-ghost/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── No data yet (first respondent) ──
  if (!stats) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full h-full overflow-y-auto pr-2 custom-scrollbar"
      >
        <div className="space-y-5 pb-6">
          <motion.div variants={item}>
            <p className="text-[10px] tracking-[0.25em] uppercase text-ghost/50 mb-1">
              Insights
            </p>
            <p className="text-sm font-medium text-accent">
              You&apos;re the first to answer! 🎯
            </p>
            <p className="text-xs text-ghost/50 mt-2">
              Metrics will appear as others respond to this question.
            </p>
          </motion.div>

          {/* Personality Signal still shows */}
          <motion.div variants={item}>
            <div className={`rounded-xl p-4 border ${personality.bg}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${personality.iconContainer}`}
                >
                  <IconComponent size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${personality.text}`}>
                    {personality.label}
                  </p>
                  <p className="text-xs text-ghost/60">{personality.desc}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <p className="text-xs text-ghost/40 text-center">
              Your speed: {(responseTimeMs / 1000).toFixed(1)}s
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

  // ── Full insights (real data) ──
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
                  <span
                    className={
                      isUser
                        ? `${TEXT_COLORS[bar.key]} font-medium`
                        : "text-ghost/70"
                    }
                  >
                    {bar.label}
                  </span>
                  <span
                    className={`font-mono ${
                      isUser ? TEXT_COLORS[bar.key] : "text-ghost/50"
                    }`}
                  >
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
                    className={`h-full rounded-full ${
                      !isUser ? "bg-ghost/20" : ""
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* You vs Humanity */}
        <motion.div variants={item} className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-accent" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-ghost/50 font-medium">
              You vs Humanity
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ghost/70">Agreed with you</span>
              <span className={`text-sm font-bold font-mono ${TEXT_COLORS[userChoice]}`}>
                {userPct}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ghost/70">Your speed vs average</span>
              <span className={`text-sm font-bold font-mono ${
                responseTimeMs < stats.avgTime ? "text-emerald" : "text-amber"
              }`}>
                {responseTimeMs < stats.avgTime
                  ? `${((1 - responseTimeMs / stats.avgTime) * 100).toFixed(0)}% faster`
                  : `${((responseTimeMs / stats.avgTime - 1) * 100).toFixed(0)}% slower`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ghost/70">Speed percentile</span>
              <span className="text-sm font-bold font-mono text-accent">
                Top {speedPercentile}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid: Speed + Controversy + Confidence */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Timer size={11} className="text-ghost/50" />
            </div>
            <p className="text-[9px] text-ghost/50 uppercase tracking-wider mb-1">
              Speed
            </p>
            <p className="font-mono text-lg font-bold">
              {(responseTimeMs / 1000).toFixed(1)}s
            </p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={11} className="text-ghost/50" />
            </div>
            <p className="text-[9px] text-ghost/50 uppercase tracking-wider mb-1">
              Controversy
            </p>
            <p
              className={`font-mono text-lg font-bold ${
                controversyScore! > 70
                  ? "text-rose"
                  : controversyScore! > 40
                  ? "text-amber"
                  : "text-emerald"
              }`}
            >
              {controversyScore}
            </p>
            <p className="text-[10px] text-ghost/40">
              {controversyScore! > 70
                ? "Very divisive"
                : controversyScore! > 40
                ? "Moderate"
                : "Consensus"}
            </p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-[9px] text-ghost/50 uppercase tracking-wider mb-1">
              Confidence
            </p>
            <p className="font-mono text-lg font-bold">{confidence}%</p>
            <p className="text-[10px] text-ghost/40">
              {confidence! > 70
                ? "Decisive"
                : confidence! > 40
                ? "Considered"
                : "Hesitant"}
            </p>
          </div>
        </motion.div>

        {/* Hesitation Factor & Generation Gap */}
        {(hesitationText || genGap) && (
          <motion.div variants={item} className="grid grid-cols-2 gap-3">
            {hesitationText && (
              <div className="glass rounded-xl p-3">
                <p className="text-[9px] text-ghost/50 uppercase tracking-wider mb-1">
                  Hesitation Factor
                </p>
                <p className="text-xs text-ghost/80 mt-1">{hesitationText}</p>
              </div>
            )}
            {genGap && (
              <div className="glass rounded-xl p-3">
                <p className="text-[9px] text-ghost/50 uppercase tracking-wider mb-1">
                  Generation Gap
                </p>
                <p className="text-xs text-ghost/80 mt-1">{genGap}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Personality Signal */}
        <motion.div variants={item}>
          <div className={`rounded-xl p-4 border ${personality.bg}`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${personality.iconContainer}`}
              >
                <IconComponent size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${personality.text}`}
                >
                  {personality.label}
                </p>
                <p className="text-xs text-ghost/60">{personality.desc}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Demographics — ONLY if we have real data */}
        {demographics.length > 0 && (
          <motion.div variants={item} className="glass rounded-xl p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-ghost/50 font-medium mb-3">
              By Age Group — Option A %
            </p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographics} barGap={2}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(63,63,70,0.2)"
                  />
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
        )}

        <motion.div variants={item} className="text-center">
          <p className="text-xs text-ghost/40">
            {stats.total.toLocaleString("en-US")} total responses
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
