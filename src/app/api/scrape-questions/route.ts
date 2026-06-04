import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CATEGORIES = [
  "Ethics", "Identity", "Mortality", "Power", "Society", "Time",
  "Privacy", "Trust", "Empathy", "Philosophy", "Values",
  "Relationships", "Experience", "Emotion", "Legacy", "Survival",
  "Money", "Health", "Fantasy", "General",
];

const GEMINI_PROMPT = `You are a question formatter for a "Would You Rather" app. 
I will give you raw post titles from Reddit's r/WouldYouRather subreddit.

For each title, extract a clean "Would you rather" question with EXACTLY 2 choices (A and B). 
If the title clearly has 3 distinct choices, you may include a third choice C.

Rules:
- Clean up abbreviations: "WYR" → "Would you rather"
- Make the question text a proper sentence ending with "?"
- Extract short, punchy choice labels (max 6 words each)
- Assign a category from this list: ${CATEGORIES.join(", ")}
- Assign a severity from 1-5 (1=lighthearted, 5=existential/disturbing)
- SKIP titles that are vague, have too many options (4+), are meta/announcement posts, or are just polls without clear choices in the title
- SKIP titles that are NSFW or overly crude

Return ONLY a JSON array. Each element:
{
  "text": "Would you rather ...?",
  "choiceA": "Short choice A",
  "choiceB": "Short choice B",
  "choiceC": "Short choice C or null",
  "category": "Category",
  "severity": 3
}

If a title should be skipped, do NOT include it. Return valid JSON only, no markdown fences.`;

async function fetchRedditRSS(): Promise<{ title: string; redditId: string }[]> {
  const res = await fetch("https://www.reddit.com/r/WouldYouRather/.rss", {
    headers: {
      "User-Agent": "WYR-App/1.0 (question scraper)",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Reddit RSS returned ${res.status}`);
  }

  const xml = await res.text();
  const entries: { title: string; redditId: string }[] = [];

  // Parse XML entries with regex (lightweight, no XML parser needed)
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
    const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
    if (titleMatch && idMatch) {
      entries.push({
        title: titleMatch[1].trim(),
        redditId: idMatch[1].trim(),
      });
    }
  }

  return entries;
}

async function formatWithGemini(
  titles: string[]
): Promise<
  {
    text: string;
    choiceA: string;
    choiceB: string;
    choiceC: string | null;
    category: string;
    severity: number;
  }[]
> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

  const titlesBlock = titles
    .map((t, i) => `${i + 1}. ${t}`)
    .join("\n");

  const result = await model.generateContent(
    `${GEMINI_PROMPT}\n\nHere are the titles:\n${titlesBlock}`
  );

  const responseText = result.response.text();

  // Strip markdown code fences if present
  const cleaned = responseText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini response:", cleaned);
    return [];
  }
}

function generateQuestionId(): string {
  return "r_" + Math.random().toString(36).substring(2, 14);
}

export async function POST(request: Request) {
  // Verify admin secret (also allow cron secret for automated runs)
  const secret =
    request.headers.get("x-admin-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.ADMIN_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch RSS
    const entries = await fetchRedditRSS();
    if (entries.length === 0) {
      return NextResponse.json({ success: true, message: "No entries found", added: 0 });
    }

    // 2. Check which reddit_ids we already have
    const redditIds = entries.map((e) => e.redditId);
    const { data: existing } = await supabase
      .from("questions")
      .select("reddit_id")
      .in("reddit_id", redditIds);

    const existingIds = new Set((existing || []).map((e) => e.reddit_id));
    const newEntries = entries.filter((e) => !existingIds.has(e.redditId));

    if (newEntries.length === 0) {
      return NextResponse.json({ success: true, message: "All posts already scraped", added: 0 });
    }

    // 3. Format with Gemini
    const titles = newEntries.map((e) => e.title);
    const formatted = await formatWithGemini(titles);

    if (formatted.length === 0) {
      return NextResponse.json({ success: true, message: "No valid questions after formatting", added: 0 });
    }

    // 4. Map to DB rows with reddit_ids
    // We try to match formatted questions back to reddit entries by title similarity
    const rows = formatted.map((q, i) => ({
      id: generateQuestionId(),
      text: q.text,
      choice_a: q.choiceA,
      choice_b: q.choiceB,
      choice_c: q.choiceC || null,
      category: CATEGORIES.includes(q.category) ? q.category : "General",
      severity: Math.max(1, Math.min(5, q.severity)),
      source: "reddit",
      reddit_id: newEntries[i]?.redditId || `r_${Date.now()}_${i}`,
    }));

    // 5. Insert
    const { error } = await supabase.from("questions").insert(rows);

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      scraped: entries.length,
      new: newEntries.length,
      added: rows.length,
    });
  } catch (err: any) {
    console.error("Scrape error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET handler for Vercel Cron
export async function GET(request: Request) {
  // Vercel Cron sends the CRON_SECRET as Authorization header
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reuse POST logic
  return POST(request);
}
