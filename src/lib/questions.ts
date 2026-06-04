import { supabase } from "./supabaseClient";
import type { Question } from "@/data/questions";

/** Fetch questions from Supabase, filtered for the current user.
 *  - If userId is provided, excludes questions answered in the last 7 days.
 *  - Questions answered 7+ days ago are resurfaced once for bias re-check.
 *  - If no userId (anonymous), returns all questions.
 */
export async function fetchQuestions(userId?: string): Promise<Question[]> {
  // Fetch all questions
  const { data: allQuestions, error } = await supabase
    .from("questions")
    .select("id, text, choice_a, choice_b, choice_c, category, severity")
    .order("created_at", { ascending: false });

  if (error || !allQuestions) {
    console.error("Failed to fetch questions:", error);
    return [];
  }

  const mapped: Question[] = allQuestions.map((q) => ({
    id: q.id,
    text: q.text,
    choiceA: q.choice_a,
    choiceB: q.choice_b,
    choiceC: q.choice_c || undefined,
    category: q.category,
    severity: q.severity,
  }));

  if (!userId) return mapped;

  // Fetch this user's answer history
  const { data: userAnswers, error: ansErr } = await supabase
    .from("answers")
    .select("question_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (ansErr || !userAnswers) return mapped;

  // Group answers by question_id — keep track of latest answer time and answer count
  const answerMap = new Map<string, { latestAt: Date; count: number }>();
  for (const a of userAnswers) {
    const existing = answerMap.get(a.question_id);
    const answeredAt = new Date(a.created_at);
    if (!existing) {
      answerMap.set(a.question_id, { latestAt: answeredAt, count: 1 });
    } else {
      existing.count++;
      if (answeredAt > existing.latestAt) existing.latestAt = answeredAt;
    }
  }

  const now = new Date();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  return mapped.filter((q) => {
    const record = answerMap.get(q.id);
    if (!record) return true; // Never answered — show it

    // Already answered twice (original + bias re-check) — hide permanently
    if (record.count >= 2) return false;

    // Answered once: only resurface if 7+ days have passed
    const msSinceAnswer = now.getTime() - record.latestAt.getTime();
    return msSinceAnswer >= SEVEN_DAYS_MS;
  });
}

/** Fetch a user's full answer history from Supabase (for restoring state on login) */
export async function fetchUserAnswers(userId: string) {
  const { data, error } = await supabase
    .from("answers")
    .select("question_id, choice, response_time_ms, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch user answers:", error);
    return [];
  }

  return data.map((a) => ({
    questionId: a.question_id as string,
    choice: a.choice as "A" | "B" | "C",
    responseTimeMs: a.response_time_ms as number,
    timestamp: new Date(a.created_at).getTime(),
  }));
}

/** Fetch real stats for a single question */
export async function fetchQuestionStats(questionId: string) {
  const { data, error } = await supabase
    .from("question_stats")
    .select("*")
    .eq("question_id", questionId)
    .single();

  if (error || !data) return null;

  const total = Number(data.total_responses) || 0;
  if (total === 0) return null;

  return {
    total,
    countA: Number(data.count_a) || 0,
    countB: Number(data.count_b) || 0,
    countC: Number(data.count_c) || 0,
    pctA: Math.round((Number(data.count_a) / total) * 100),
    pctB: Math.round((Number(data.count_b) / total) * 100),
    pctC: Math.round((Number(data.count_c) / total) * 100),
    avgTime: Number(data.avg_time) || 0,
    avgTimeA: Number(data.avg_time_a) || null,
    avgTimeB: Number(data.avg_time_b) || null,
    avgTimeC: Number(data.avg_time_c) || null,
  };
}

/** Fetch demographics for a question */
export async function fetchQuestionDemographics(questionId: string) {
  const { data, error } = await supabase
    .from("question_demographics")
    .select("*")
    .eq("question_id", questionId);

  if (error || !data || data.length === 0) return [];

  return data
    .map((d) => {
      const t = Number(d.total_responses) || 1;
      return {
        age: d.age_group as string,
        A: Math.round((Number(d.count_a) / t) * 100),
        B: Math.round((Number(d.count_b) / t) * 100),
      };
    })
    .sort((a, b) => a.age.localeCompare(b.age));
}

/** Fetch global stats for landing page */
export async function fetchGlobalStats() {
  const { data, error } = await supabase
    .from("global_stats")
    .select("*")
    .single();

  if (error || !data) {
    return { totalResponses: 0, totalQuestions: 0, totalUsers: 0 };
  }

  return {
    totalResponses: Number(data.total_responses) || 0,
    totalQuestions: Number(data.total_questions) || 0,
    totalUsers: Number(data.total_users) || 0,
  };
}
