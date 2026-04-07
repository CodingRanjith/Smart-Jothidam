const crypto = require('crypto');

const JosiyamResult = require('../../models/josiyamResultModel');
const {
  CALCULATION_VERSION,
  computeDeterministicSingleJosiyam,
} = require('./deterministic/josiyamDeterministicEngine');
const {
  COUPLE_CALCULATION_VERSION,
  computeDeterministicCoupleJosiyam,
} = require('./deterministic/josiyamCoupleDeterministicEngine');
const {
  generateJosiyamNarrativeWithGroq,
} = require('./groq/groqNarrativeService');
const {
  generateCoupleJosiyamNarrativeWithGroq,
} = require('./groq/groqCoupleNarrativeService');
const {
  buildSinglePersonApiPayload,
  buildCoupleApiPayload,
} = require('./josiyamApiMapper');

function normalizeDobForHash(dob) {
  try {
    if (!(dob instanceof Date)) return '';
    return dob.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function normalizeBirthTimeForHash(birthTime) {
  return birthTime ? String(birthTime).trim() : '';
}

function normalizeBirthPlaceForHash(birthPlace) {
  return birthPlace ? String(birthPlace).trim().toLowerCase() : '';
}

function sha256Hex(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

function computeInputHash({ dob, birthTime, birthPlace }) {
  const dobPart = normalizeDobForHash(dob);
  const timePart = normalizeBirthTimeForHash(birthTime);
  const placePart = normalizeBirthPlaceForHash(birthPlace);
  return sha256Hex(`${dobPart}|${timePart}|${placePart}`);
}

function computeCoupleInputHash(partnerA, partnerB, language) {
  const hA = computeInputHash({
    dob: partnerA.dateOfBirth,
    birthTime: partnerA.birthTime,
    birthPlace: partnerA.birthPlace,
  });
  const hB = computeInputHash({
    dob: partnerB.dateOfBirth,
    birthTime: partnerB.birthTime,
    birthPlace: partnerB.birthPlace,
  });
  const lang = (language ?? 'ta-IN').toString().trim().toLowerCase();
  return sha256Hex(`${hA}|${hB}|${lang}`);
}

function languageToGroqLang(language) {
  const s = (language ?? 'ta-IN').toString().trim().toLowerCase();
  if (s.startsWith('ta')) return 'ta';
  if (s.startsWith('en')) return 'en';
  if (s.startsWith('tl')) return 'tl';
  return 'ta';
}

/**
 * @param {object} params
 * @param {string} params.userId
 * @param {Date} params.dateOfBirth
 * @param {string} params.birthTime
 * @param {string} params.birthPlace
 * @param {string} [params.language]
 */
async function calculateSingle({
  userId,
  dateOfBirth,
  birthTime,
  birthPlace,
  language = 'ta-IN',
}) {
  const inputHash = computeInputHash({
    dob: dateOfBirth,
    birthTime,
    birthPlace,
  });

  const cached = await JosiyamResult.findOne({
    userId,
    type: 'single',
    inputHash,
    calculationVersion: CALCULATION_VERSION,
  });

  if (
    cached &&
    cached.chart &&
    Array.isArray(cached.categories) &&
    cached.categories.length === 20 &&
    cached.summary
  ) {
    return {
      resultId: cached._id.toString(),
      chart: cached.chart,
      categories: cached.categories,
      summary: cached.summary,
    };
  }

  const groqLang = languageToGroqLang(language);

  const deterministic = await computeDeterministicSingleJosiyam({
    dob: dateOfBirth,
    birthTime,
    birthPlace,
    profileHash: inputHash,
    lang: groqLang,
  });

  let aiNarrative = await generateJosiyamNarrativeWithGroq({
    lang: groqLang,
    chart: deterministic.chart,
    categories: deterministic.categories,
    overallLifePath: deterministic.overallLifePath,
  });

  if (!aiNarrative) {
    aiNarrative = {
      summary: deterministic.overallLifePath?.rawInterpretation || 'Josiyam computed.',
      categories: {},
      language: groqLang,
    };
  }

  const data = buildSinglePersonApiPayload(deterministic, aiNarrative, language);

  const doc = new JosiyamResult({
    userId,
    type: 'single',
    inputHash,
    calculationVersion: CALCULATION_VERSION,
    language,
    input: {
      dateOfBirth: normalizeDobForHash(dateOfBirth),
      birthTime,
      birthPlace,
      language,
    },
    chart: data.chart,
    categories: data.categories,
    summary: data.summary,
    deterministic,
  });

  try {
    await doc.save();
  } catch (e) {
    if (e?.code === 11000) {
      const again = await JosiyamResult.findOne({
        userId,
        type: 'single',
        inputHash,
        calculationVersion: CALCULATION_VERSION,
      });
      if (again && again.chart && again.categories?.length === 20) {
        return {
          resultId: again._id.toString(),
          chart: again.chart,
          categories: again.categories,
          summary: again.summary,
        };
      }
    }
    throw e;
  }

  return {
    resultId: doc._id.toString(),
    ...data,
  };
}

/**
 * @param {object} params
 * @param {string} params.userId
 * @param {{ dateOfBirth: Date, birthTime: string, birthPlace: string }} params.partnerA
 * @param {{ dateOfBirth: Date, birthTime: string, birthPlace: string }} params.partnerB
 * @param {string} [params.language]
 */
async function calculateCouple({
  userId,
  partnerA,
  partnerB,
  language = 'ta-IN',
}) {
  const inputHash = computeCoupleInputHash(partnerA, partnerB, language);

  const cached = await JosiyamResult.findOne({
    userId,
    type: 'couple',
    inputHash,
    calculationVersion: COUPLE_CALCULATION_VERSION,
  });

  if (
    cached &&
    cached.chart &&
    Array.isArray(cached.categories) &&
    cached.categories.length === 25 &&
    cached.summary
  ) {
    return {
      resultId: cached._id.toString(),
      chart: cached.chart,
      categories: cached.categories,
      summary: cached.summary,
    };
  }

  const groqLang = languageToGroqLang(language);

  const deterministic = await computeDeterministicCoupleJosiyam({
    partnerA: {
      dob: partnerA.dateOfBirth,
      birthTime: partnerA.birthTime,
      birthPlace: partnerA.birthPlace,
    },
    partnerB: {
      dob: partnerB.dateOfBirth,
      birthTime: partnerB.birthTime,
      birthPlace: partnerB.birthPlace,
    },
    profileHash: inputHash,
    lang: groqLang,
  });

  let aiNarrative = await generateCoupleJosiyamNarrativeWithGroq({
    lang: groqLang,
    chart: deterministic.chart,
    categories: deterministic.categories,
    overallLifePath: deterministic.overallLifePath,
  });

  if (!aiNarrative) {
    aiNarrative = {
      summary:
        deterministic.overallLifePath?.rawInterpretation ||
        'Couple josiyam computed.',
      categories: {},
      language: groqLang,
    };
  }

  const data = buildCoupleApiPayload(deterministic, aiNarrative, language);

  const doc = new JosiyamResult({
    userId,
    type: 'couple',
    inputHash,
    calculationVersion: COUPLE_CALCULATION_VERSION,
    language,
    input: {
      partnerA: {
        dateOfBirth: normalizeDobForHash(partnerA.dateOfBirth),
        birthTime: partnerA.birthTime,
        birthPlace: partnerA.birthPlace,
      },
      partnerB: {
        dateOfBirth: normalizeDobForHash(partnerB.dateOfBirth),
        birthTime: partnerB.birthTime,
        birthPlace: partnerB.birthPlace,
      },
      language,
    },
    chart: data.chart,
    categories: data.categories,
    summary: data.summary,
    deterministic,
  });

  try {
    await doc.save();
  } catch (e) {
    if (e?.code === 11000) {
      const again = await JosiyamResult.findOne({
        userId,
        type: 'couple',
        inputHash,
        calculationVersion: COUPLE_CALCULATION_VERSION,
      });
      if (again && again.chart && again.categories?.length === 25) {
        return {
          resultId: again._id.toString(),
          chart: again.chart,
          categories: again.categories,
          summary: again.summary,
        };
      }
    }
    throw e;
  }

  return {
    resultId: doc._id.toString(),
    ...data,
  };
}

module.exports = {
  calculateSingle,
  calculateCouple,
  computeInputHash,
  computeCoupleInputHash,
  CALCULATION_VERSION,
  COUPLE_CALCULATION_VERSION,
};
