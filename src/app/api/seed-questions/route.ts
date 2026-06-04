import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { seedQuestions } from "@/data/questions";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  // Verify admin secret
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = seedQuestions.map((q) => ({
    id: q.id,
    text: q.text,
    choice_a: q.choiceA,
    choice_b: q.choiceB,
    choice_c: q.choiceC || null,
    category: q.category,
    severity: q.severity,
    source: "manual",
  }));

  const { data, error } = await supabase
    .from("questions")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    seeded: rows.length,
  });
}
