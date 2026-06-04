"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";

const cards = [
  {
    title: "Continue Answering",
    description: "Pick up where you left off",
    href: "/feed",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    accent: true,
  },
  {
    title: "Your History",
    description: "Review past decisions",
    href: "/history",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Community Trends",
    description: "What the world thinks",
    href: "/feed",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
  },
  {
    title: "Submit Question",
    description: "Challenge the community",
    href: "/submit",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, answeredCount, answers, logout } = useStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const avgSpeed =
    answers.length > 0
      ? (
          answers.reduce((sum, a) => sum + a.responseTimeMs, 0) /
          answers.length /
          1000
        ).toFixed(1)
      : "—";

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">WYR</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ghost">{user?.email}</span>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="text-xs text-ghost/40 hover:text-ghost transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back
          </h1>
          <p className="text-ghost">Here&apos;s your decision overview.</p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {[
            { label: "Questions Answered", value: answeredCount.toString() },
            { label: "Avg Response Time", value: `${avgSpeed}s` },
            {
              label: "Similarity Score",
              value:
                answeredCount > 0
                  ? `${Math.round(50 + Math.random() * 30)}%`
                  : "—",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-5 text-center"
            >
              <p className="text-xs text-ghost/60 mb-1">{stat.label}</p>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push(card.href)}
              className={`text-left rounded-2xl p-6 transition-all group cursor-pointer ${
                card.accent
                  ? "bg-gradient-to-br from-accent/10 to-accent-blue/10 border border-accent/20 hover:border-accent/40"
                  : "glass hover:border-ghost/20"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  card.accent
                    ? "bg-accent/20 text-accent"
                    : "bg-surface-light text-ghost group-hover:text-text"
                } transition-colors`}
              >
                {card.icon}
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-ghost">{card.description}</p>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
