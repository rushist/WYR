import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

const AGE_GROUPS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];

export default function AgeGroupModal() {
  const { ageGroup, setAgeGroup, answers } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Show modal if they've answered at least 1 question but haven't set an age group
  useEffect(() => {
    if (!ageGroup && answers.length > 0) {
      setIsOpen(true);
    }
  }, [ageGroup, answers.length]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass rounded-2xl p-8 border border-border/50 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-ghost mb-2">Wait a second...</h2>
            <p className="text-ghost/70 text-sm">
              To show you accurate demographics and generational gaps, we need your age group. 
              No exact birthdays, just the range.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {AGE_GROUPS.map((age) => (
              <button
                key={age}
                onClick={() => {
                  setAgeGroup(age);
                  setIsOpen(false);
                }}
                className="py-3 px-4 rounded-xl border border-border/40 bg-surface/30 hover:bg-surface/60 hover:border-accent/40 text-ghost transition-all duration-200"
              >
                {age}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              setAgeGroup("Prefer not to say");
              setIsOpen(false);
            }}
            className="w-full mt-4 py-3 text-sm text-ghost/50 hover:text-ghost transition-colors"
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
