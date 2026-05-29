// Claude API integration. Runs only in the main process so the API key is
// never exposed to the renderer. All functions throw on failure; callers
// (IPC handlers) decide how to surface errors / fall back to cache.
import Anthropic from "@anthropic-ai/sdk";

// Claude Sonnet 4.6 — current as of May 2026. The original
// `claude-sonnet-4-20250514` was retired and returns a 404 not_found_error.
const MODEL = "claude-sonnet-4-6";

function getClient(apiKey) {
  if (!apiKey) throw new Error("No Anthropic API key configured.");
  return new Anthropic({ apiKey });
}

// Robustly pull JSON out of a model response that may contain stray text or
// markdown fences. Tolerant of responses truncated at max_tokens: if the JSON
// is incomplete, salvage the complete leading objects/array elements instead of
// throwing (a truncated quiz used to crash the renderer with a black screen).
function parseJson(text) {
  let t = (text || "").trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  }
  try {
    return JSON.parse(t);
  } catch {
    // First, a balanced-slice attempt for trailing junk after valid JSON.
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(t.slice(start, end + 1));
      } catch {
        /* fall through to salvage */
      }
    }
    const salvaged = salvageTruncatedJson(t);
    if (salvaged) return salvaged;
    throw new Error("Could not parse JSON from model response.");
  }
}

// Recover usable data from JSON truncated mid-stream (stop_reason: max_tokens).
// Closes any open structure by trimming back to the last balanced point and
// appending the missing closing brackets. Returns null if nothing is salvageable.
function salvageTruncatedJson(t) {
  const start = t.indexOf("{");
  if (start === -1) return null;
  const s = t.slice(start);
  const stack = [];
  let inStr = false;
  let esc = false;
  let lastSafe = -1; // index (exclusive) of a point where stack depth is 1 (inside root obj, between elements)
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") {
      stack.pop();
      // After closing an element inside the questions array, this is a safe cut point.
      if (stack.length === 2) lastSafe = i + 1;
    }
  }
  // Build candidate from the last complete array element, then close brackets.
  const tryParse = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };
  if (lastSafe > 0) {
    let candidate = s.slice(0, lastSafe);
    // Close the array and the root object.
    const repaired = candidate + "]}";
    const parsed = tryParse(repaired);
    if (parsed) return parsed;
  }
  return null;
}

// Coerce model quiz output into the exact shape the renderer expects, dropping
// any malformed entries. Tolerates case/whitespace drift in `type` and missing
// fields so a single bad question can never crash the UI.
export function normalizeQuiz(data) {
  const raw = Array.isArray(data) ? data : data?.questions;
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const q = raw[i];
    if (!q || typeof q !== "object") continue;
    const question = typeof q.question === "string" ? q.question : "";
    if (!question) continue;
    const type = String(q.type || "").toLowerCase().includes("short") ? "short_answer" : "mcq";
    const id = q.id != null ? q.id : i + 1;
    if (type === "mcq") {
      const options = Array.isArray(q.options) ? q.options.map((o) => String(o)) : [];
      if (options.length < 2) continue; // not a usable MCQ
      let ci = Number.isInteger(q.correct_index) ? q.correct_index : 0;
      if (ci < 0 || ci >= options.length) ci = 0;
      out.push({
        id,
        type: "mcq",
        question,
        options,
        correct_index: ci,
        explanation: typeof q.explanation === "string" ? q.explanation : "",
      });
    } else {
      out.push({
        id,
        type: "short_answer",
        question,
        model_answer: typeof q.model_answer === "string" ? q.model_answer : "",
        grading_rubric: typeof q.grading_rubric === "string" ? q.grading_rubric : "",
      });
    }
  }
  return out;
}

export async function testConnection(apiKey) {
  const client = getClient(apiKey);
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16,
    messages: [{ role: "user", content: "Reply with the single word: ok" }],
  });
  return { ok: true, sample: res.content[0]?.text ?? "" };
}

export async function generateQuiz(apiKey, topicTitle, keyConcepts, quizPrompt) {
  const client = getClient(apiKey);
  const systemPrompt = `You are an expert ML/AI educator creating exam-quality questions.
Return ONLY valid JSON — no markdown, no explanation.
Format:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 2,
      "explanation": "..."
    },
    {
      "id": 6,
      "type": "short_answer",
      "question": "...",
      "model_answer": "...",
      "grading_rubric": "..."
    }
  ]
}
Generate 5 MCQ and 3 short answer questions.`;

  const userPrompt = `Topic: ${topicTitle}
Key concepts: ${(keyConcepts || []).join(", ")}
Additional focus: ${quizPrompt || ""}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096, // 2000 was too low — 8 questions with explanations truncate
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return parseJson(response.content[0].text);
}

export async function gradeShortAnswer(apiKey, question, modelAnswer, rubric, userAnswer) {
  const client = getClient(apiKey);
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: `You are grading a short answer ML exam question.
Return ONLY JSON: { "score": 0-2, "feedback": "one sentence" }
Scoring: 2=correct, 1=partially correct, 0=incorrect`,
    messages: [
      {
        role: "user",
        content: `Question: ${question}
Model answer: ${modelAnswer}
Rubric: ${rubric}
Student answer: ${userAnswer}`,
      },
    ],
  });
  return parseJson(response.content[0].text);
}

export async function reviewProject(apiKey, projectSpec, userCode, selfNotes) {
  const client = getClient(apiKey);
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `You are a senior ML engineer reviewing a bootcamp project submission.
Be specific, technical, and constructive. Return JSON:
{
  "score": 0-100,
  "strengths": ["...", "..."],
  "gaps": ["...", "..."],
  "improvements": ["...", "..."],
  "verdict": "one paragraph summary"
}`,
    messages: [
      {
        role: "user",
        content: `Project: ${projectSpec.title}
Objectives: ${projectSpec.description}
Evaluation criteria: ${JSON.stringify(projectSpec.evaluation_criteria)}

Student code:
\`\`\`python
${userCode}
\`\`\`

Student's self-notes: ${selfNotes}`,
      },
    ],
  });
  return parseJson(response.content[0].text);
}
