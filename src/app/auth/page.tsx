"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Suspense } from "react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMethod = searchParams.get("method") as "google" | "email" | null;

  const [selectedMethod, setSelectedMethod] = useState<"google" | "email" | null>(initialMethod);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("Check your email for a confirmation link!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Top metadata */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] tracking-[0.2em] uppercase text-ghost/70 font-medium">
              {selectedMethod === "email" ? "Credentials" : "Gateway"}
            </span>
            <span className="text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-option-c/10 text-option-c border border-option-c/20 font-semibold">
              Secure
            </span>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < 3 ? "bg-accent" : "bg-border/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Heading formatted as Question Text */}
        <h2 className="font-display text-[clamp(1.5rem,5vw,3rem)] font-bold leading-[1.15] text-center mb-14 tracking-tight">
          {selectedMethod === "email"
            ? isSignUp
              ? "Would you rather sign up with…"
              : "Would you rather sign in with…"
            : "Would you rather sign in with…"}
        </h2>

        {/* Error / Success messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose/10 border border-rose/20 text-rose text-sm text-center font-medium"
          >
            {error}
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-emerald/10 border border-emerald/20 text-emerald text-sm text-center font-medium"
          >
            {successMsg}
          </motion.div>
        )}

        {/* Auth options in the same format as Choice Cards */}
        {!selectedMethod ? (
          <div className="grid gap-4 grid-cols-1">
            {/* Google card (Option A styling) */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                setSelectedMethod("google");
                handleGoogleSignIn();
              }}
              className="relative w-full rounded-2xl px-8 py-6 text-left text-lg font-medium
                         transition-all duration-500 overflow-hidden cursor-pointer
                         border border-border/40 bg-surface hover:border-option-a/50 hover:bg-surface-light/30
                         flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg group-hover:text-option-a transition-colors">Google</div>
                  <div className="text-xs text-ghost/50 font-normal">One-tap secure sign in</div>
                </div>
              </div>
              <span className="text-xs font-mono text-ghost/30 group-hover:text-option-a/50 transition-colors relative z-10">Option A</span>
            </motion.button>

            {/* Email card (Option B styling) */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setSelectedMethod("email")}
              className="relative w-full rounded-2xl px-8 py-6 text-left text-lg font-medium
                         transition-all duration-500 overflow-hidden cursor-pointer
                         border border-border/40 bg-surface hover:border-option-b/50 hover:bg-surface-light/30
                         flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg group-hover:text-option-b transition-colors">Email & Password</div>
                  <div className="text-xs text-ghost/50 font-normal">Traditional login / signup</div>
                </div>
              </div>
              <span className="text-xs font-mono text-ghost/30 group-hover:text-option-b/50 transition-colors relative z-10">Option B</span>
            </motion.button>
          </div>
        ) : selectedMethod === "email" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-ghost/50 font-semibold block mb-2 px-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  className="w-full px-5 py-3.5 rounded-xl bg-surface border border-border/50
                             text-text placeholder:text-ghost/20 text-center text-lg
                             focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-ghost/50 font-semibold block mb-2 px-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 rounded-xl bg-surface border border-border/50
                             text-text placeholder:text-ghost/20 text-center text-lg
                             focus:outline-none focus:border-accent/50 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                />
              </div>
            </div>

            <button
              onClick={handleEmailAuth}
              disabled={!email || !password || loading}
              className="w-full py-4 rounded-xl bg-accent text-white font-semibold
                         hover:bg-accent/90 transition-colors disabled:opacity-30
                         disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-accent/20"
            >
              {loading ? "Verifying..." : isSignUp ? "Create Account" : "Sign In"}
            </button>

            <div className="flex items-center justify-between pt-4 border-t border-border/30 text-xs">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-accent hover:text-accent/80 transition-colors cursor-pointer font-medium"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>

              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-ghost/50 hover:text-ghost transition-colors cursor-pointer"
              >
                ← Back
              </button>
            </div>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-ghost">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
