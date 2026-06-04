"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, answers } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-void">
      <header className="border-b border-border/30">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")} className="text-ghost hover:text-text transition-colors text-sm cursor-pointer">← Dashboard</button>
          <h2 className="font-display text-lg font-bold">Account</h2>
          <div className="w-20" />
        </div>
      </header>
      <main className="max-w-xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>

          <div className="space-y-4">
            {/* Profile */}
            <div className="glass rounded-xl p-5">
              <p className="text-xs text-ghost/60 uppercase tracking-wider mb-2">Account</p>
              <p className="font-medium">{user?.email}</p>
              <p className="text-xs text-ghost/40 mt-1">ID: {user?.id}</p>
            </div>

            {/* Billing */}
            <div className="glass rounded-xl p-5">
              <p className="text-xs text-ghost/60 uppercase tracking-wider mb-2">Billing</p>
              <p className="text-sm text-ghost mb-3">Free Plan (Prototype)</p>
              <button className="px-4 py-2 rounded-lg text-sm bg-accent/10 text-accent border border-accent/20 cursor-pointer">
                Upgrade to Premium
              </button>
            </div>

            {/* Export */}
            <button onClick={() => {
              const data = JSON.stringify(answers, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "wyr-data.json"; a.click();
            }} className="w-full glass rounded-xl p-5 text-left hover:border-ghost/20 transition-colors cursor-pointer">
              <p className="text-xs text-ghost/60 uppercase tracking-wider mb-1">Data</p>
              <p className="text-sm">Export your answers as JSON</p>
            </button>

            {/* Logout */}
            <button onClick={() => { logout(); router.push("/"); }}
              className="w-full rounded-xl p-5 text-left border border-border/30 bg-surface hover:bg-surface-light transition-colors cursor-pointer">
              <p className="text-sm font-medium">Sign Out</p>
            </button>

            {/* Delete */}
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="w-full rounded-xl p-5 text-left border border-rose/20 bg-rose/5 hover:bg-rose/10 transition-colors cursor-pointer">
                <p className="text-sm font-medium text-rose">Delete Account</p>
                <p className="text-xs text-ghost/40 mt-1">This action cannot be undone</p>
              </button>
            ) : (
              <div className="rounded-xl p-5 border border-rose/30 bg-rose/10">
                <p className="text-sm font-medium text-rose mb-3">Are you sure?</p>
                <div className="flex gap-3">
                  <button onClick={() => { logout(); router.push("/"); }}
                    className="px-4 py-2 rounded-lg bg-rose text-white text-sm font-medium cursor-pointer">
                    Yes, delete
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-border/50 text-sm cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
