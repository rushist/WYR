"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import QuestionCard from "@/components/QuestionCard";
import { questions } from "@/data/questions";
import type { ChoiceKey } from "@/store/useStore";

export default function LandingPage() {
  const router = useRouter();
  const [answered, setAnswered] = useState<ChoiceKey | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const previewQuestion = questions[0];

  const stats = [
    { label: "responses recorded", value: "2.4M" },
    { label: "questions active", value: "340+" },
    { label: "countries", value: "187" },
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Floating stats */}
        <div className="absolute top-8 left-0 right-0 flex justify-center gap-8 md:gap-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.8 }}
              className="text-center"
            >
              <p className="font-mono text-sm md:text-base text-accent font-semibold">
                {stat.value}
              </p>
              <p className="text-[10px] md:text-xs text-ghost/50 tracking-wider uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 max-w-3xl"
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            Impossible
            <br />
            <span className="text-gradient">Choices.</span>
          </h1>
          <p className="text-ghost text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            See how the world thinks. Answer questions that reveal who you
            really are.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/feed")}
          className="px-10 py-4 rounded-full bg-gradient-to-r from-accent to-accent-blue
                     text-white font-semibold text-lg shadow-lg shadow-accent/20
                     hover:shadow-accent/40 transition-shadow mb-8 cursor-pointer"
        >
          Start Answering
        </motion.button>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          onClick={() =>
            feedRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          className="cursor-pointer"
        >
          <p className="text-xs text-ghost/40 mb-2">or try one now</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 border border-ghost/20 rounded-full mx-auto flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-2 bg-ghost/40 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Live question preview */}
      <section
        ref={feedRef}
        className="min-h-screen flex flex-col items-center justify-center py-20"
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs tracking-[0.3em] uppercase text-ghost/40 mb-12"
        >
          Your first question
        </motion.p>

        <QuestionCard
          question={previewQuestion}
          onAnswer={(choice) => setAnswered(choice)}
          answered={answered}
        />

        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-12"
          >
            <button
              onClick={() => router.push("/feed")}
              className="px-8 py-3 rounded-full border border-accent/40 text-accent
                         hover:bg-accent/10 transition-colors text-sm font-medium"
            >
              Keep going →
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
