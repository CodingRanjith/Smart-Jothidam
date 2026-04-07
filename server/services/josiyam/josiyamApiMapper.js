const { CATEGORY_KEYS } = require('./deterministic/josiyamDeterministicEngine');
const {
  COUPLE_EXTRA_KEYS,
} = require('./deterministic/josiyamCoupleDeterministicEngine');

const RASI_ENGLISH_TO_TAMIL = {
  Aries: 'Mesha',
  Taurus: 'Vrishabha',
  Gemini: 'Mithuna',
  Cancer: 'Karka',
  Leo: 'Simha',
  Virgo: 'Kanya',
  Libra: 'Tula',
  Scorpio: 'Vrishchika',
  Sagittarius: 'Dhanu',
  Capricorn: 'Makara',
  Aquarius: 'Kumbha',
  Pisces: 'Meena',
};

const CATEGORY_TO_HOUSE = {
  Career: 10,
  Business: 7,
  Finance: 2,
  Education: 4,
  Marriage: 7,
  Love: 5,
  Family: 4,
  Children: 5,
  Health: 1,
  'Mental strength': 1,
  Spiritual: 9,
  'Foreign travel': 12,
  Property: 4,
  Legal: 6,
  Enemy: 6,
  'Social status': 10,
  Friends: 11,
  Luck: 9,
  Remedies: 12,
  'Overall life path': 1,
  compatibility_score: 7,
  emotional_bond: 5,
  financial_stability: 2,
  family_harmony: 4,
  long_term_growth: 9,
};

function toTamilRasi(englishSign) {
  return RASI_ENGLISH_TO_TAMIL[englishSign] || englishSign;
}

function categoryKeyToApiKey(categoryKey) {
  return categoryKey.toLowerCase().replace(/\s+/g, '_');
}

function stripNakshatraPada(nakshatraField) {
  const s = String(nakshatraField ?? '');
  const m = s.match(/^([A-Za-z]+)/);
  return m ? m[1] : s;
}

function score100ToFive(score100) {
  const s = Number(score100) || 0;
  return Math.max(1, Math.min(5, Math.round((s / 100) * 4) + 1));
}

function trendFromScore100(score100) {
  const s = Number(score100) || 0;
  if (s >= 55) return 'positive';
  if (s <= 45) return 'negative';
  return 'neutral';
}

function buildChartForApi(deterministicChart) {
  const rasi = toTamilRasi(deterministicChart?.rasi);
  const lagnam = toTamilRasi(deterministicChart?.lagnam);
  const nakshatra = stripNakshatraPada(deterministicChart?.nakshatra);
  return {
    rasi,
    nakshatra,
    lagnam,
    ayanamsa: 'Lahiri',
  };
}

/**
 * @param {object} deterministic - output of computeDeterministicSingleJosiyam
 * @param {object|null} aiNarrative - output of generateJosiyamNarrativeWithGroq
 * @param {string} language - BCP-47 e.g. ta-IN
 */
function buildSinglePersonApiPayload(deterministic, aiNarrative, language) {
  const chart = buildChartForApi(deterministic.chart);
  const groqCategories = aiNarrative?.categories && typeof aiNarrative.categories === 'object'
    ? aiNarrative.categories
    : {};
  const intermediate = deterministic?.transparency?.intermediate?.categoryScoring || {};

  const categories = CATEGORY_KEYS.map((categoryKey) => {
    const cat = deterministic.categories?.[categoryKey] || {};
    const score100 = cat.score ?? 0;
    const inter = intermediate[categoryKey] || {};
    const lord = inter.dominantPlanet || 'Jupiter';
    const rawInterpretation = cat.rawInterpretation || '';

    const groqLine = groqCategories[categoryKey];
    const aiText =
      (groqLine && String(groqLine).trim()) ||
      rawInterpretation.slice(0, 400);

    return {
      key: categoryKeyToApiKey(categoryKey),
      score: score100ToFive(score100),
      trend: trendFromScore100(score100),
      aiText,
      raw: {
        house: CATEGORY_TO_HOUSE[categoryKey] ?? 1,
        lord,
        notes: rawInterpretation.slice(0, 500),
      },
    };
  });

  const summaryText =
    (aiNarrative?.summary && String(aiNarrative.summary).trim()) ||
    'Summary could not be generated.';

  return {
    chart,
    categories,
    summary: {
      aiText: summaryText,
      language,
    },
  };
}

const COUPLE_CATEGORY_ORDER = [...COUPLE_EXTRA_KEYS, ...CATEGORY_KEYS];

/**
 * @param {object} deterministic - output of computeDeterministicCoupleJosiyam
 * @param {object|null} aiNarrative - output of generateCoupleJosiyamNarrativeWithGroq
 * @param {string} language - BCP-47 e.g. ta-IN
 */
function buildCoupleApiPayload(deterministic, aiNarrative, language) {
  const partnerA = buildChartForApi(deterministic.chart?.partnerA);
  const partnerB = buildChartForApi(deterministic.chart?.partnerB);
  const meta = deterministic.chart?.compatibilityMeta || {
    source: 'deterministic-v1',
  };

  const chart = {
    ayanamsa: 'Lahiri',
    partnerA,
    partnerB,
    compatibilityMeta: meta,
  };

  const groqCategories =
    aiNarrative?.categories && typeof aiNarrative.categories === 'object'
      ? aiNarrative.categories
      : {};

  const categories = COUPLE_CATEGORY_ORDER.map((categoryKey) => {
    const cat = deterministic.categories?.[categoryKey] || {};
    const score100 = cat.score ?? 0;
    const rawInterpretation = cat.rawInterpretation || '';

    const groqLine = groqCategories[categoryKey];
    const aiText =
      (groqLine && String(groqLine).trim()) ||
      rawInterpretation.slice(0, 400);

    const apiKey = categoryKeyToApiKey(categoryKey);

    return {
      key: apiKey,
      score: score100ToFive(score100),
      trend: trendFromScore100(score100),
      aiText,
      raw: {
        house: CATEGORY_TO_HOUSE[categoryKey] ?? 1,
        notes: rawInterpretation.slice(0, 500),
      },
    };
  });

  const summaryText =
    (aiNarrative?.summary && String(aiNarrative.summary).trim()) ||
    'Summary could not be generated.';

  return {
    chart,
    categories,
    summary: {
      aiText: summaryText,
      language,
    },
  };
}

module.exports = {
  buildSinglePersonApiPayload,
  buildCoupleApiPayload,
  CATEGORY_KEYS,
  COUPLE_CATEGORY_ORDER,
};
