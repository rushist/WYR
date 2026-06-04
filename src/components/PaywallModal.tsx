"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";

export default function PaywallModal() {
  const { showPaywall, setShowPaywall } = useStore();
  const router = useRouter();

  if (!showPaywall) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-void/80 backdrop-blur-xl"
        onClick={() => setShowPaywall(false)}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative glass-strong rounded-3xl p-10 max-w-md w-full text-center"
      >
        {/* Decorative glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent/20 rounded-full blur-[80px]" />

        <div className="relative">
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-4">
            You&apos;ve answered 3 questions
          </p>

          <h2 className="font-display text-3xl font-bold mb-3">
            Find where you stand.
          </h2>

          <p className="text-ghost text-sm mb-8 leading-relaxed">
            Unlock your moral map, see your behavioral patterns, and compare
            yourself with millions of responses.
          </p>

          {/* Pricing */}
          <div className="flex gap-3 mb-8">
            <div className="flex-1 rounded-xl border border-border/50 p-4 bg-surface/50">
              <p className="text-xs text-ghost mb-1">Monthly</p>
              <p className="font-display text-2xl font-bold">₹149</p>
              <p className="text-xs text-ghost/60">/month</p>
            </div>
            <div className="flex-1 rounded-xl border border-accent/50 p-4 bg-accent/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                SAVE 16%
              </div>
              <p className="text-xs text-ghost mb-1">Yearly</p>
              <p className="font-display text-2xl font-bold">₹1499</p>
              <p className="text-xs text-ghost/60">/year</p>
            </div>
          </div>

          {/* Auth buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowPaywall(false);
                router.push("/auth");
              }}
              className="w-full py-4 rounded-xl bg-white text-void font-semibold
                         hover:bg-white/90 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => {
                setShowPaywall(false);
                router.push("/auth?method=email");
              }}
              className="w-full py-4 rounded-xl border border-border/50 bg-surface
                         hover:bg-surface-light transition-colors font-medium"
            >
              Continue with Email
            </button>
          </div>

          <button
            onClick={() => setShowPaywall(false)}
            className="mt-4 text-xs text-ghost/40 hover:text-ghost/60 transition-colors"
          >
            maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
