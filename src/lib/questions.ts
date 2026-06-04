import { supabase } from "./supabaseClient";
import type { Question } from "@/data/questions";

/** Fetch all questions from Supabase */
export async function fetchQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, text, choice_a, choice_b, choice_c, category, severity")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch questions:", error);
    return [];
  }

  return data.map((q) => ({
    id: q.id,
    text: q.text,
    choiceA: q.choice_a,
    choiceB: q.choice_b,
    choiceC: q.choice_c || undefined,
    category: q.category,
    severity: q.severity,
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
