"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabaseClient";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth } = useStore();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuth({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.user_metadata?.full_name,
        });
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.user_metadata?.full_name,
        });
      } else {
        setAuth(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  return <>{children}</>;
}
