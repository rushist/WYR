"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const categories = ["Ethics", "Identity", "Society", "Mortality", "Power", "Relationships", "Philosophy", "Experience", "Other"];

const OPTION_STYLES = {
  A: {
    border: "border-option-a/30 focus:border-option-a/60",
    label: "text-option-a",
    badge: "bg-option-a/10 text-option-a border-option-a/20",
  },
  B: {
    border: "border-option-b/30 focus:border-option-b/60",
    label: "text-option-b",
    badge: "bg-option-b/10 text-option-b border-option-b/20",
  },
  C: {
    border: "border-option-c/30 focus:border-option-c/60",
    label: "text-option-c",
    badge: "bg-option-c/10 text-option-c border-option-c/20",
  },
} as const;

export default function SubmitPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [showOptionC, setShowOptionC] = useState(false);
  const [category, setCategory] = useState(categories[0]);
  const [severity, setSeverity] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = text.trim() && optionA.trim() && optionB.trim() && (!showOptionC || optionC.trim());

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/submit-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          choice_a: optionA,
          choice_b: optionB,
          choice_c: showOptionC ? optionC : null,
          category,
          severity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit question");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOptionC = () => {
    setShowOptionC(false);
    setOptionC("");
  };

  return (
    <div className="min-h-screen bg-void">
      <header className="border-b border-border/30">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")} className="text-ghost hover:text-text transition-colors text-sm cursor-pointer">← Dashboard</button>
          <h2 className="font-display text-lg font-bold">Submit</h2>
          <div className="w-20" />
        </div>
      </header>
      <main className="max-w-xl mx-auto px-6 py-12">
        {!submitted ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold mb-2">Submit a Question</h1>
            <p className="text-ghost text-sm mb-10">Challenge the community with a difficult choice.</p>

            <div className="space-y-6">
              {/* Question text */}
              <div>
                <label className="text-xs text-ghost/60 uppercase tracking-wider block mb-2">Question</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Would you rather..." rows={3}
                  className="w-full px-5 py-4 rounded-xl bg-surface border border-border/50 text-text placeholder:text-ghost/30 focus:outline-none focus:border-accent/50 transition-colors resize-none" />
              </div>

              {/* Option fields */}
              <div className="space-y-3">
                <label className="text-xs text-ghost/60 uppercase tracking-wider block">Options</label>

                {/* Option A */}
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${OPTION_STYLES.A.badge}`}>
                    A
                  </span>
                  <input
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="First option..."
                    className={`flex-1 px-4 py-3 rounded-xl bg-surface border ${OPTION_STYLES.A.border} text-text placeholder:text-ghost/30 focus:outline-none transition-colors`}
                  />
                </div>

                {/* Option B */}
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${OPTION_STYLES.B.badge}`}>
                    B
                  </span>
                  <input
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Second option..."
                    className={`flex-1 px-4 py-3 rounded-xl bg-surface border ${OPTION_STYLES.B.border} text-text placeholder:text-ghost/30 focus:outline-none transition-colors`}
                  />
                </div>

                {/* Option C (optional) */}
                <AnimatePresence>
                  {showOptionC && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${OPTION_STYLES.C.badge}`}>
                          C
                        </span>
                        <input
                          type="text"
                          value={optionC}
                          onChange={(e) => setOptionC(e.target.value)}
                          placeholder="Third option..."
                          autoFocus
                          className={`flex-1 px-4 py-3 rounded-xl bg-surface border ${OPTION_STYLES.C.border} text-text placeholder:text-ghost/30 focus:outline-none transition-colors`}
                        />
                        <button
                          onClick={handleRemoveOptionC}
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-ghost/40 hover:text-rose hover:bg-rose/10 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add Option C button */}
                {!showOptionC && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowOptionC(true)}
                    className="flex items-center gap-2 text-sm text-ghost/50 hover:text-option-c transition-colors cursor-pointer group"
                  >
                    <span className="w-8 h-8 rounded-lg border border-dashed border-border/40 group-hover:border-option-c/40 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                    Add Option C
                  </motion.button>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-ghost/60 uppercase tracking-wider block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${category === cat ? "bg-accent/20 text-accent border border-accent/30" : "bg-surface border border-border/30 text-ghost hover:text-text"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="text-xs text-ghost/60 uppercase tracking-wider block mb-2">Severity ({severity}/5)</label>
                <input type="range" min={1} max={5} value={severity} onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-accent" />
                <div className="flex justify-between text-[10px] text-ghost/40 mt-1">
                  <span>Light</span><span>Heavy</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-rose/10 border border-rose/20 text-rose text-sm">
                  {errorMsg}
                </motion.div>
              )}

              {/* Submit */}
              <button onClick={handleSubmit} disabled={!isValid || isSubmitting}
                className="w-full py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                {isSubmitting ? "Validating..." : "Submit Question"}
              </button>

              <p className="text-xs text-ghost/40 text-center">Community prompts are reviewed by AI before appearing.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Question Submitted</h2>
            <p className="text-ghost text-sm mb-2">
              {showOptionC ? "3-option question" : "2-option question"} submitted successfully.
            </p>
            <p className="text-ghost/40 text-xs mb-8">It will appear in the feed after review.</p>
            <button onClick={() => router.push("/feed")} className="px-8 py-3 rounded-xl border border-accent/40 text-accent hover:bg-accent/10 transition-colors cursor-pointer">
              Back to Feed
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
