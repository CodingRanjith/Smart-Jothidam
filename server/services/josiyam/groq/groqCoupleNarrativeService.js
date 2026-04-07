function normalizeLang(lang) {
  const s = (lang ?? 'en').toString().trim().toLowerCase();
  if (s === 'ta' || s.startsWith('ta-')) return 'ta';
  if (s.startsWith('tl') || s === 'tanglish') return 'tl';
  return 'en';
}

function buildPrompt({ lang, chart, categories, overallLifePath }) {
  const langInstruction =
    lang === 'ta'
      ? 'Write in Tamil.'
      : lang === 'tl'
        ? 'Write in Tanglish (Tamil written using English letters).'
        : 'Write in English.';

  const categoryLines = Object.entries(categories).map(([key, v]) => {
    const score = v?.score ?? null;
    const keywords = Array.isArray(v?.keywords) ? v.keywords.join(', ') : '';
    const raw = v?.rawInterpretation ?? '';
    return { key, score, keywords, raw };
  });

  return `
You are a skilled Jyotish astrologer focusing on couple/marriage compatibility.
${langInstruction}

Task:
Given the deterministic couple Josiyam inputs below, produce:
1) One overall summary paragraph (4-7 sentences) about this pair's compatibility and shared path.
2) Short per-category explanations for all 25 categories (1-3 sentences each). Categories include 5 couple-specific keys
   (compatibility_score, emotional_bond, financial_stability, family_harmony, long_term_growth) plus 20 life-area categories.

Rules:
- Output MUST be valid JSON only (no markdown, no backticks, no extra keys).
- Do not invent random numbers; refer to provided scores/keywords/raw text.
- Keep each category text concise and tied to the deterministic inputs.

Input chart:
${JSON.stringify(chart)}

Input categories (deterministic):
${JSON.stringify(categoryLines)}

Overall couple path raw interpretation:
${JSON.stringify(overallLifePath)}

Return JSON schema:
{
  "language":"${lang}",
  "summary":"<overall paragraph>",
  "categories": {
    "<exactCategoryKey>":"<short text>"
  }
}
Use the EXACT category keys from the deterministic input (same spelling/casing as keys in categories).
`;
}

function extractJson(text) {
  if (!text) throw new Error('Empty Groq response');
  const s = String(text).trim();

  const withoutFences = s
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');

  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');
  const candidate =
    start !== -1 && end !== -1 ? withoutFences.slice(start, end + 1) : withoutFences;

  return JSON.parse(candidate);
}

async function generateCoupleJosiyamNarrativeWithGroq({
  lang,
  chart,
  categories,
  overallLifePath,
}) {
  const normalizedLang = normalizeLang(lang);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GROQ_CHAT_MODEL || 'llama-3.1-70b-versatile';

  const prompt = buildPrompt({
    lang: normalizedLang,
    chart,
    categories,
    overallLifePath,
  });

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 1400,
      messages: [
        {
          role: 'system',
          content: 'You produce strict JSON. Follow the user schema exactly.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    const err = new Error(`Groq request failed: ${resp.status} ${resp.statusText}`);
    err.groqBody = text;
    throw err;
  }

  const json = await resp.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = extractJson(content);
  if (!parsed?.summary || !parsed?.categories) return null;

  return {
    includeNarrative: true,
    language: parsed.language || normalizedLang,
    summary: parsed.summary,
    categories: parsed.categories,
    cachedAt: new Date(),
  };
}

module.exports = {
  generateCoupleJosiyamNarrativeWithGroq,
};
