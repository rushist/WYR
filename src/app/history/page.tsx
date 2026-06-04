"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { questions, getPercents } from "@/data/questions";

export default function HistoryPage() {
  const router = useRouter();
  const { answers } = useStore();
  const sortedAnswers = [...answers].reverse();

  const choiceColors = {
    A: "bg-option-a/10 text-option-a border-option-a/20",
    B: "bg-option-b/10 text-option-b border-option-b/20",
    C: "bg-option-c/10 text-option-c border-option-c/20",
  } as const;

  return (
    <div className="min-h-screen bg-void">
      <header className="border-b border-border/30">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")} className="text-ghost hover:text-text transition-colors text-sm cursor-pointer">← Dashboard</button>
          <h2 className="font-display text-lg font-bold">History</h2>
          <div className="w-20" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Your Decisions</h1>
          <p className="text-ghost text-sm">{sortedAnswers.length} answered</p>
        </motion.div>
        {sortedAnswers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ghost mb-4">No answers yet.</p>
            <button onClick={() => router.push("/feed")} className="px-6 py-3 rounded-xl bg-accent text-white font-medium cursor-pointer">Start Answering</button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAnswers.map((answer, i) => {
              const q = questions.find((x) => x.id === answer.questionId);
              if (!q) return null;
              const percents = getPercents(q);
              const pct = answer.choice === "A" ? percents.a : answer.choice === "B" ? percents.b : (percents.c ?? 0);
              const choiceText = answer.choice === "A" ? q.choiceA : answer.choice === "B" ? q.choiceB : (q.choiceC ?? "");
              const sec = Math.floor((Date.now() - answer.timestamp) / 1000);
              const timeAgo = sec < 60 ? "just now" : sec < 3600 ? `${Math.floor(sec/60)}m ago` : `${Math.floor(sec/3600)}h ago`;
              return (
                <motion.div key={answer.questionId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="font-medium text-sm leading-relaxed flex-1">{q.text}</p>
                    <span className="text-[10px] text-ghost/40 whitespace-nowrap">{timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full border ${choiceColors[answer.choice]}`}>{choiceText}</span>
                    <span className="text-xs text-ghost/50">{pct}% agreed</span>
                    <span className="text-xs text-ghost/30">·</span>
                    <span className="text-xs text-ghost/50 font-mono">{(answer.responseTimeMs / 1000).toFixed(1)}s</span>
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
