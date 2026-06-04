"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function PaywallPage() {
  const router = useRouter();
  const { setShowPaywall } = useStore();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg w-full text-center"
      >
        {/* Blurred preview cards */}
        <div className="relative mb-12">
          <div className="grid grid-cols-2 gap-3 blur-[6px] opacity-40">
            {[
              { label: "Your moral alignment", val: "72% Utilitarian" },
              { label: "Decision speed", val: "1.8s avg" },
              { label: "Rarest choice", val: "Top 3%" },
              { label: "Behavioral cluster", val: "Pragmatist" },
            ].map((item) => (
              <div
                key={item.label}
                className="glass rounded-xl p-4 text-left"
              >
                <p className="text-[10px] text-ghost/50 mb-1">{item.label}</p>
                <p className="font-display font-bold text-lg">{item.val}</p>
              </div>
            ))}
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-surface border border-border/50 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-ghost"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>
        </div>

        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-4">
          Premium
        </p>

        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Find where you stand.
        </h1>

        <p className="text-ghost text-sm mb-10 max-w-sm mx-auto leading-relaxed">
          Unlock your moral map, behavioral insights, and see how your patterns
          compare with millions.
        </p>

        {/* Pricing */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 rounded-xl border border-border/50 p-5 bg-surface/50">
            <p className="text-xs text-ghost mb-1">Monthly</p>
            <p className="font-display text-3xl font-bold">₹149</p>
            <p className="text-xs text-ghost/60">/month</p>
          </div>
          <div className="flex-1 rounded-xl border border-accent/50 p-5 bg-accent/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent text-[9px] font-bold px-2 py-0.5 rounded-bl-lg text-white">
              BEST VALUE
            </div>
            <p className="text-xs text-ghost mb-1">Yearly</p>
            <p className="font-display text-3xl font-bold">₹1499</p>
            <p className="text-xs text-ghost/60">/year</p>
          </div>
        </div>

        {/* Auth */}
        <div className="space-y-3">
          <button
            onClick={() => {
              setShowPaywall(false);
              router.push("/auth");
            }}
            className="w-full py-4 rounded-xl bg-white text-void font-semibold
                       hover:bg-white/90 transition-colors flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => {
              setShowPaywall(false);
              router.push("/auth?method=email");
            }}
            className="w-full py-4 rounded-xl border border-border/50 bg-surface
                       hover:bg-surface-light transition-colors font-medium cursor-pointer"
          >
            Continue with Email
          </button>
        </div>

        <button
          onClick={() => router.push("/feed")}
          className="mt-6 text-xs text-ghost/40 hover:text-ghost/60 transition-colors cursor-pointer"
        >
          ← back to questions
        </button>
      </motion.div>
    </div>
  );
}
