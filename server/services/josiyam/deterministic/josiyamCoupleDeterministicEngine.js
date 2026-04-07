const {
  CALCULATION_VERSION,
  CATEGORY_KEYS,
  computeDeterministicSingleJosiyam,
} = require('./josiyamDeterministicEngine');

/** Version suffix for couple cache separation (same Lahiri base, merged rules). */
const COUPLE_CALCULATION_VERSION = `${CALCULATION_VERSION}-couple-v1`;

const COUPLE_EXTRA_KEYS = [
  'compatibility_score',
  'emotional_bond',
  'financial_stability',
  'family_harmony',
  'long_term_growth',
];

function cyclicDiff(a, b, mod) {
  const d = Math.abs(a - b);
  return Math.min(d, mod - d);
}

function cyclicSignDiff12(a, b) {
  return cyclicDiff(a, b, 12);
}

function clampInt(n, lo, hi) {
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

/**
 * @param {object} params
 * @param {{ dob: Date, birthTime: string, birthPlace: string }} params.partnerA
 * @param {{ dob: Date, birthTime: string, birthPlace: string }} params.partnerB
 * @param {string} params.profileHash
 * @param {string} [params.lang]
 */
async function computeDeterministicCoupleJosiyam({
  partnerA,
  partnerB,
  profileHash,
  lang,
}) {
  const detA = await computeDeterministicSingleJosiyam({
    dob: partnerA.dob,
    birthTime: partnerA.birthTime,
    birthPlace: partnerA.birthPlace,
    profileHash: `${profileHash}_A`,
    lang,
  });

  const detB = await computeDeterministicSingleJosiyam({
    dob: partnerB.dob,
    birthTime: partnerB.birthTime,
    birthPlace: partnerB.birthPlace,
    profileHash: `${profileHash}_B`,
    lang,
  });

  const moonA = detA.transparency?.intermediate?.moon || {};
  const moonB = detB.transparency?.intermediate?.moon || {};
  const rasiIdxA = moonA.signIndex ?? 0;
  const rasiIdxB = moonB.signIndex ?? 0;
  const nakIdxA = moonA.nakshatraIndex0 ?? 0;
  const nakIdxB = moonB.nakshatraIndex0 ?? 0;

  const venA = detA.transparency?.intermediate?.planets?.Venus?.signIndex ?? 0;
  const venB = detB.transparency?.intermediate?.planets?.Venus?.signIndex ?? 0;
  const moonSignA = detA.transparency?.intermediate?.planets?.Moon?.signIndex ?? rasiIdxA;
  const moonSignB = detB.transparency?.intermediate?.planets?.Moon?.signIndex ?? rasiIdxB;

  const moonDiff = cyclicSignDiff12(rasiIdxA, rasiIdxB);
  const nakDiff = cyclicDiff(nakIdxA, nakIdxB, 27);
  const venDiff = cyclicSignDiff12(venA, venB);

  const blend =
    ((rasiIdxA + rasiIdxB + nakIdxA + nakIdxB) % 9) - 4;

  const categories = {};

  CATEGORY_KEYS.forEach((categoryKey) => {
    const sA = detA.categories?.[categoryKey]?.score ?? 0;
    const sB = detB.categories?.[categoryKey]?.score ?? 0;
    let score = Math.round((sA + sB) / 2) + blend;
    score = clampInt(score, 0, 100);

    const domA = detA.transparency?.intermediate?.categoryScoring?.[categoryKey]
      ?.dominantPlanet;
    const domB = detB.transparency?.intermediate?.categoryScoring?.[categoryKey]
      ?.dominantPlanet;

    const rawInterpretation =
      `Couple deterministic blend for ${categoryKey}: average of partner scores (${sA}, ${sB}) ` +
      `with moon-rasi gap ${moonDiff}/6 and nakshatra gap ${nakDiff}/13. ` +
      `Dominant planets: A=${domA ?? '—'}, B=${domB ?? '—'}.`;

    categories[categoryKey] = {
      score,
      keywords: [
        `moonGap${moonDiff}`,
        `nakGap${nakDiff}`,
        String(domA || ''),
        String(domB || ''),
      ].filter(Boolean),
      rawInterpretation,
    };
  });

  const compatBase =
    72 -
    moonDiff * 9 -
    Math.min(nakDiff, 13) * 1.5 +
    (6 - venDiff) * 2;
  const compatibility_score = clampInt(compatBase, 0, 100);

  const emotional_bond = clampInt(
    65 - venDiff * 8 - moonDiff * 3 + ((nakIdxA + nakIdxB) % 5),
    0,
    100
  );

  const finA =
    detA.categories?.Finance?.score ?? 50;
  const finB =
    detB.categories?.Finance?.score ?? 50;
  const financial_stability = clampInt(
    (finA + finB) / 2 - moonDiff * 1.5,
    0,
    100
  );

  const famA = detA.categories?.Family?.score ?? 50;
  const famB = detB.categories?.Family?.score ?? 50;
  const family_harmony = clampInt(
    (famA + famB) / 2 + (6 - moonDiff) * 2 - nakDiff * 0.4,
    0,
    100
  );

  const jupA =
    detA.transparency?.intermediate?.planets?.Jupiter?.strength ?? 50;
  const jupB =
    detB.transparency?.intermediate?.planets?.Jupiter?.strength ?? 50;
  const satA =
    detA.transparency?.intermediate?.planets?.Saturn?.strength ?? 50;
  const satB =
    detB.transparency?.intermediate?.planets?.Saturn?.strength ?? 50;
  const long_term_growth = clampInt(
    (jupA + jupB + satA + satB) / 4 + (6 - moonDiff) * 1.2,
    0,
    100
  );

  const coupleScores = {
    compatibility_score,
    emotional_bond,
    financial_stability,
    family_harmony,
    long_term_growth,
  };

  COUPLE_EXTRA_KEYS.forEach((key) => {
    const score = coupleScores[key];
    categories[key] = {
      score,
      keywords: [
        `rasi${rasiIdxA}-${rasiIdxB}`,
        `moon${moonSignA}-${moonSignB}`,
        `venus${venA}-${venB}`,
      ],
      rawInterpretation:
        `Couple-specific deterministic score (${key}): derived from moon rasi gap ${moonDiff}, ` +
        `nakshatra gap ${nakDiff}, Venus gap ${venDiff}, and blended planetary strengths.`,
    };
  });

  const overallLifePath = {
    score: clampInt(
      [...CATEGORY_KEYS, ...COUPLE_EXTRA_KEYS].reduce(
        (acc, k) => acc + (categories[k]?.score ?? 0),
        0
      ) / (CATEGORY_KEYS.length + COUPLE_EXTRA_KEYS.length),
      0,
      100
    ),
    keywords: ['couple', `moonGap${moonDiff}`, `compat${compatibility_score}`],
    rawInterpretation:
      'Overall couple path is the average of 25 deterministic category scores for this pair.',
  };

  return {
    chart: {
      partnerA: detA.chart,
      partnerB: detB.chart,
      compatibilityMeta: {
        source: 'deterministic-v1',
        moonRasiGap: moonDiff,
        nakshatraGap: nakDiff,
        venusSignGap: venDiff,
      },
    },
    categories,
    overallLifePath,
    transparency: {
      calculationVersion: COUPLE_CALCULATION_VERSION,
      baseVersion: CALCULATION_VERSION,
      inputsUsed: {
        profileHash,
        lang: lang ?? 'en',
      },
      partners: {
        A: detA.transparency,
        B: detB.transparency,
      },
    },
  };
}

module.exports = {
  COUPLE_CALCULATION_VERSION,
  COUPLE_EXTRA_KEYS,
  computeDeterministicCoupleJosiyam,
};
