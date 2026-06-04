"use client";

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { fetchQuestionStats } from "@/lib/questions";
import {
  Zap,
  BrainCircuit,
  Target,
  Sparkles,
  Activity,
  Scale,
  ShieldAlert,
  Swords,
  Eye,
  HelpCircle,
} from "lucide-react";

const PERSONALITY_ARCHETYPES = [
  { id: 1, name: "Instinctive Rebel", desc: "You make split-second decisions that defy the crowd.", Icon: Zap, color: "text-rose bg-rose/10 border-rose/20" },
  { id: 2, name: "Measured Rebel", desc: "You take your time, but ultimately walk your own path.", Icon: Swords, color: "text-rose bg-rose/10 border-rose/20" },
  { id: 3, name: "Analytical Rebel", desc: "You deeply overthink things, just to disagree with everyone.", Icon: BrainCircuit, color: "text-rose bg-rose/10 border-rose/20" },
  { id: 4, name: "Instinctive Independent", desc: "Fast on your feet, sometimes agreeing, sometimes not.", Icon: Activity, color: "text-amber bg-amber/10 border-amber/20" },
  { id: 5, name: "Measured Independent", desc: "A balanced thinker who weighs options without bias.", Icon: Scale, color: "text-amber bg-amber/10 border-amber/20" },
  { id: 6, name: "Analytical Independent", desc: "You analyze everything carefully before choosing a side.", Icon: Eye, color: "text-amber bg-amber/10 border-amber/20" },
  { id: 7, name: "Instinctive Conformist", desc: "You instantly know what the popular opinion is.", Icon: Sparkles, color: "text-emerald bg-emerald/10 border-emerald/20" },
  { id: 8, name: "Measured Conformist", desc: "You think it through and usually agree with the majority.", Icon: Target, color: "text-emerald bg-emerald/10 border-emerald/20" },
  { id: 9, name: "Analytical Conformist", desc: "You methodically prove that the majority was right all along.", Icon: ShieldAlert, color: "text-emerald bg-emerald/10 border-emerald/20" },
  { id: 10, name: "The Enigma", desc: "Your choices and speeds are completely unpredictable.", Icon: HelpCircle, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
];

interface AnswerStat {
  questionId: string;
  majorityKey: string | null;
  pct: number | null;
}

export default function HistoryPage() {
  const router = useRouter();
  const { answers, questions, loadQuestions } = useStore();
  const sortedAnswers = [...answers].reverse();

  // Load questions if needed
  useEffect(() => {
    if (questions.length === 0) loadQuestions();
  }, [questions.length, loadQuestions]);

  // Fetch real stats for all answered questions
  const [answerStats, setAnswerStats] = useState<Map<string, AnswerStat>>(new Map());
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    if (answers.length === 0) return;

    async function loadStats() {
      const statMap = new Map<string, AnswerStat>();

      for (const ans of answers) {
        const stats = await fetchQuestionStats(ans.questionId);
        if (stats && stats.total > 0) {
          const majorityKey =
            stats.pctA >= stats.pctB && stats.pctA >= stats.pctC
              ? "A"
              : stats.pctB >= stats.pctC
              ? "B"
              : "C";

          const pct =
            ans.choice === "A"
              ? stats.pctA
              : ans.choice === "B"
              ? stats.pctB
              : stats.pctC;

          statMap.set(ans.questionId, { questionId: ans.questionId, majorityKey, pct });
        } else {
          statMap.set(ans.questionId, { questionId: ans.questionId, majorityKey: null, pct: null });
        }
      }

      setAnswerStats(statMap);
      setStatsLoaded(true);
    }

    loadStats();
  }, [answers]);

  const choiceColors = {
    A: "bg-option-a/10 text-option-a border-option-a/20",
    B: "bg-option-b/10 text-option-b border-option-b/20",
    C: "bg-option-c/10 text-option-c border-option-c/20",
  } as const;

  // Personality based on real data
  const personality = useMemo(() => {
    if (answers.length < 3 || !statsLoaded) return null;

    let majorityMatches = 0;
    let totalTime = 0;
    const times: number[] = [];
    let checked = 0;

    answers.forEach((ans) => {
      const stat = answerStats.get(ans.questionId);
      if (!stat || stat.majorityKey === null) return;

      if (ans.choice === stat.majorityKey) majorityMatches++;
      totalTime += ans.responseTimeMs;
      times.push(ans.responseTimeMs);
      checked++;
    });

    if (checked < 3) return null;

    const conformityPct = majorityMatches / checked;
    const avgTime = totalTime / checked;

    // Enigma detection
    const variance =
      times.reduce((acc, t) => acc + Math.pow(t - avgTime, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > 4000) return PERSONALITY_ARCHETYPES[9];

    // Conformity axis
    let conformityTier = "";
    if (conformityPct > 0.65) conformityTier = "Conformist";
    else if (conformityPct > 0.35) conformityTier = "Independent";
    else conformityTier = "Rebel";

    // Speed axis
    let speedTier = "";
    if (avgTime < 2000) speedTier = "Instinctive";
    else if (avgTime < 4500) speedTier = "Measured";
    else speedTier = "Analytical";

    const name = `${speedTier} ${conformityTier}`;
    return PERSONALITY_ARCHETYPES.find((p) => p.name === name) || PERSONALITY_ARCHETYPES[4];
  }, [answers, answerStats, statsLoaded]);

  return (
    <div className="min-h-screen bg-void">
      <header className="border-b border-border/30">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-ghost hover:text-text transition-colors text-sm cursor-pointer"
          >
            ← Dashboard
          </button>
          <h2 className="font-display text-lg font-bold">History</h2>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            Your Decisions
          </h1>
          <p className="text-ghost text-sm">
            {sortedAnswers.length} answered
          </p>
        </motion.div>

        {personality && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-10 p-6 rounded-2xl border ${personality.color} flex items-start gap-5`}
          >
            <div className="p-3 bg-void/50 rounded-xl">
              <personality.Icon size={32} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase opacity-60 font-semibold mb-1">
                Your Personality Profile
              </p>
              <h3 className="text-2xl font-bold font-display mb-1">
                {personality.name}
              </h3>
              <p className="text-sm opacity-80">{personality.desc}</p>
            </div>
          </motion.div>
        )}

        {!personality && sortedAnswers.length > 0 && (
          <div className="mb-10 p-6 rounded-2xl border border-border/30 bg-surface/20">
            <p className="text-ghost text-sm text-center">
              {statsLoaded
                ? `Answer ${3 - answers.length} more questions to unlock your personality profile.`
                : "Analyzing your responses..."}
            </p>
          </div>
        )}

        {sortedAnswers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ghost mb-4">No answers yet.</p>
            <button
              onClick={() => router.push("/feed")}
              className="px-6 py-3 rounded-xl bg-accent text-white font-medium cursor-pointer"
            >
              Start Answering
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAnswers.map((answer, i) => {
              const q = questions.find((x) => x.id === answer.questionId);
              if (!q) return null;

              const stat = answerStats.get(answer.questionId);
              const pct = stat?.pct;
              const choiceText =
                answer.choice === "A"
                  ? q.choiceA
                  : answer.choice === "B"
                  ? q.choiceB
                  : q.choiceC ?? "";

              const sec = Math.floor(
                (Date.now() - answer.timestamp) / 1000
              );
              const timeAgo =
                sec < 60
                  ? "just now"
                  : sec < 3600
                  ? `${Math.floor(sec / 60)}m ago`
                  : `${Math.floor(sec / 3600)}h ago`;

              return (
                <motion.div
                  key={answer.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="font-medium text-sm leading-relaxed flex-1">
                      {q.text}
                    </p>
                    <span className="text-[10px] text-ghost/40 whitespace-nowrap">
                      {timeAgo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${
                        choiceColors[answer.choice]
                      }`}
                    >
                      {choiceText}
                    </span>
                    {pct !== null && pct !== undefined ? (
                      <span className="text-xs text-ghost/50">
                        {pct}% agreed
                      </span>
                    ) : (
                      <span className="text-xs text-ghost/30">
                        awaiting data
                      </span>
                    )}
                    <span className="text-xs text-ghost/30">·</span>
                    <span className="text-xs text-ghost/50 font-mono">
                      {(answer.responseTimeMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
