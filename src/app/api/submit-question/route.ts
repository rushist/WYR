import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const VALIDATION_PROMPT = `You are a moderator for a "Would You Rather" game.
A user has submitted a new question. Your job is to check if it is SPAM or GIBBERISH.
Rules:
1. It is OKAY if the question is inappropriate, edgy, or dark. Do not reject for content alone.
2. REJECT (mark as INVALID) if the text is pure spam, gibberish (e.g. "asdfasdf"), or completely lacks a coherent hypothetical choice.
3. ACCEPT (mark as VALID) if it is a legible question with distinct options.

Reply with ONLY the word "VALID" or "INVALID". Nothing else.`;

function generateQuestionId(): string {
  return "u_" + Math.random().toString(36).substring(2, 14);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, choice_a, choice_b, choice_c, category, severity } = body;

    if (!text || !choice_a || !choice_b) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // AI Spam Validation
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const submissionText = `Question: ${text}\nOption A: ${choice_a}\nOption B: ${choice_b}\nOption C: ${choice_c || 'None'}`;
    
    const result = await model.generateContent(`${VALIDATION_PROMPT}\n\n${submissionText}`);
    const aiResponse = result.response.text().trim().toUpperCase();

    if (aiResponse.includes("INVALID")) {
      return NextResponse.json({ error: "Question failed validation. Please ensure it is a coherent hypothetical scenario." }, { status: 400 });
    }

    // Insert into Supabase
    const newQuestion = {
      id: generateQuestionId(),
      text,
      choice_a,
      choice_b,
      choice_c: choice_c || null,
      category: category || "General",
      severity: Math.max(1, Math.min(5, severity || 3)),
      source: "user",
    };

    const { error } = await supabase.from("questions").insert(newQuestion);

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, question: newQuestion });

  } catch (err: any) {
    console.error("Submission error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
