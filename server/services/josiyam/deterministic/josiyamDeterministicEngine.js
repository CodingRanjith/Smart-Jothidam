const crypto = require('crypto');

// Version string used for Mongo cache separation.
const CALCULATION_VERSION = '1.0.0-lahiri-v1';

const RASI_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const NAKSHATRA_NAMES = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'PurvaPhalguni',
  'UttaraPhalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'PurvaAshadha',
  'UttaraAshadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'PurvaBhadrapada',
  'UttaraBhadrapada',
  'Revati',
];

const CATEGORY_KEYS = [
  'Career',
  'Business',
  'Finance',
  'Education',
  'Marriage',
  'Love',
  'Family',
  'Children',
  'Health',
  'Mental strength',
  'Spiritual',
  'Foreign travel',
  'Property',
  'Legal',
  'Enemy',
  'Social status',
  'Friends',
  'Luck',
  'Remedies',
  'Overall life path',
];

const NAKSHATRA_SPAN_DEG = 360 / 27; // 13°20'
const NAKSHATRA_PADA_SPAN_DEG = NAKSHATRA_SPAN_DEG / 4; // 3°20'

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function normalizeDegrees(deg) {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

function sha256Hex(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

function parseBirthTimeHHmm(birthTime) {
  if (!birthTime) return null;
  // Use explicit [0-9] ranges to avoid escaping ambiguities.
  const m = String(birthTime).trim().match(/^([01][0-9]|2[0-3]):([0-5][0-9])$/);
  if (!m) return null;
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

function parseBirthPlaceCoordinates(birthPlace) {
  const place = String(birthPlace ?? '').trim();
  // Support explicit coordinates in the form: "lat,lon"
  const coord = place.match(
    /^\\s*(-?\\d+(?:\\.\\d+)?)\\s*,\\s*(-?\\d+(?:\\.\\d+)?)\\s*$/
  );
  if (coord) {
    const lat = Number(coord[1]);
    const lon = Number(coord[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon, method: 'parsed_coordinates' };
    }
  }

  // Deterministic fallback when we only have a city/country string:
  // create repeatable pseudo-coordinates from a hash.
  const h = sha256Hex(place || 'unknown_place');
  const latPart = parseInt(h.slice(0, 6), 16); // 0..2^24
  const lonPart = parseInt(h.slice(6, 12), 16);
  const lat = (latPart % 121) - 60; // [-60..60]
  const lon = (lonPart % 361) - 180; // [-180..180]

  return { lat, lon, method: 'hashed_deterministic_coordinates' };
}

function getTimezoneOffsetMinutesFromLongitude(lon) {
  // Deterministic heuristic: timezone offset ~= round(lon/15) hours.
  const offsetHours = Math.round(lon / 15);
  const clamped = Math.max(-12, Math.min(14, offsetHours));
  return clamped * 60;
}

function toJulianDayUTC(date) {
  const year0 = date.getUTCFullYear();
  const month0 = date.getUTCMonth() + 1; // 1..12
  const day0 = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();

  let y = year0;
  let m = month0;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  const fracDay =
    (hour + (minute + second / 60) / 60) / 24;

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day0 +
    B -
    1524.5 +
    fracDay;

  return jd;
}

function decimalYearUTC(date) {
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const daysInYear = (end - start) / 86400000;
  const passed = (date.getTime() - start) / 86400000;
  return year + passed / daysInYear;
}

function computeLahiriAyanamsaDeg(jdUtc) {
  // Lahiri-style deterministic approximation:
  // ayanamsaDeg = base(22°27'37") + 50.2564 arcsec/year * (decimalYear-1900)
  // We compute decimalYear from jdUtc's corresponding UTC date outside this function.
  // For determinism, we pass in jdUtc but compute year-based value separately in computeDeterministicSingleJosiyam.
  throw new Error('computeLahiriAyanamsaDeg should be called with decimalYear');
}

function computeAscendantLongitudeTropicalDegrees({ lstDeg, latitudeDeg, obliquityDeg }) {
  // Approx formula for ascendant longitude (tropical) using LST and latitude.
  // Then we shift by ayanamsa to get sidereal lagnam.
  const theta = degToRad(lstDeg);
  const phi = degToRad(latitudeDeg);
  const epsilon = degToRad(obliquityDeg);

  const y = Math.sin(theta);
  const x =
    Math.cos(theta) * Math.cos(epsilon) - Math.tan(phi) * Math.sin(epsilon);

  const lambda = radToDeg(Math.atan2(y, x));
  return normalizeDegrees(lambda);
}

function cyclicSignDiff(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 12 - diff);
}

function signAlignmentStrength(pSignIndex, lSignIndex) {
  const d = cyclicSignDiff(pSignIndex, lSignIndex);
  // diff in [0..6]. Strength in [100..0].
  return Math.round(((6 - d) / 6) * 100);
}

function formatCategoryInterpretation({
  categoryKey,
  score,
  dominantPlanet,
  lagnam,
  nakshatra,
  explanation,
}) {
  return (
    `${categoryKey} (score ${score}/100): ` +
    `Deterministically derived using ${dominantPlanet} emphasis for your ${lagnam} lagnam and ${nakshatra} nakshatra. ` +
    `${explanation}`
  );
}

async function computeDeterministicSingleJosiyam({
  dob,
  birthTime,
  birthPlace,
  profileHash, // kept for transparency / future versions
  lang,
}) {
  const parsedTime = parseBirthTimeHHmm(birthTime);
  if (!parsedTime) {
    // Deterministic engine should still be safe; caller already validated birthTime,
    // but keep a fallback.
    throw new Error('Invalid birthTime HH:mm format');
  }

  const coords = parseBirthPlaceCoordinates(birthPlace);
  const tzOffsetMinutes = getTimezoneOffsetMinutesFromLongitude(coords.lon);

  const y = dob instanceof Date ? dob.getUTCFullYear() : new Date(dob).getUTCFullYear();
  const m = dob instanceof Date ? dob.getUTCMonth() + 1 : new Date(dob).getUTCMonth() + 1;
  const d = dob instanceof Date ? dob.getUTCDate() : new Date(dob).getUTCDate();

  // Assumption: use profile dob (UTC calendar day) as the local calendar day.
  // Then apply birthTime as local time and convert to UTC using a deterministic timezone heuristic.
  const localMillisAsUTC = Date.UTC(
    y,
    m - 1,
    d,
    parsedTime.hour,
    parsedTime.minute,
    0,
    0
  );
  const utcMillis = localMillisAsUTC - tzOffsetMinutes * 60 * 1000;
  const utcDate = new Date(utcMillis);

  const jd = toJulianDayUTC(utcDate);
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000

  // Lahiri ayanamsa approximation:
  const decimalYear = decimalYearUTC(utcDate);
  const yearsSince1900 = decimalYear - 1900;
  const baseAyanamsaDeg = 22 + 27 / 60 + 37 / 3600; // 22°27'37"
  const ayanamsaDeg = baseAyanamsaDeg + (50.2564 * yearsSince1900) / 3600;

  // Obliquity approximation (degrees):
  const obliquityDeg =
    23.43929111111111 -
    0.013004166666666667 * T -
    1.638888888888889e-7 * T * T +
    5.036111111111111e-7 * T * T * T;

  // GMST and LST
  const gmstDeg = normalizeDegrees(
    280.46061837 +
      360.98564736629 * (jd - 2451545.0) +
      0.000387933 * T * T -
      (T * T * T) / 38710000
  );
  const lstDeg = normalizeDegrees(gmstDeg + coords.lon);

  const ascTropicalDeg = computeAscendantLongitudeTropicalDegrees({
    lstDeg,
    latitudeDeg: coords.lat,
    obliquityDeg,
  });
  const ascSiderealDeg = normalizeDegrees(ascTropicalDeg - ayanamsaDeg);
  const lagnamIndex = Math.floor(ascSiderealDeg / 30);
  const lagnam = RASI_SIGNS[lagnamIndex];

  // Planet longitudes (tropical, approximate)
  // Sun: mean longitude + equation of center
  const sunMeanLong =
    280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const sunMeanAnomaly =
    357.52911 + 35999.05029 * T - 0.0001537 * T * T;

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(degToRad(sunMeanAnomaly)) +
    (0.019993 - 0.000101 * T) * Math.sin(degToRad(2 * sunMeanAnomaly)) +
    0.000289 * Math.sin(degToRad(3 * sunMeanAnomaly));

  const sunTropicalDeg = normalizeDegrees(sunMeanLong + C);
  const sunSiderealDeg = normalizeDegrees(sunTropicalDeg - ayanamsaDeg);
  const sunSignIndex = Math.floor(sunSiderealDeg / 30);

  // Moon: simplified perturbation series (deterministic, not full VSOP/ELP)
  const Lm =
    218.3164477 +
    481267.88123421 * T -
    0.0015786 * T * T +
    (T * T * T) / 538841 -
    (T * T * T * T) / 65194000;

  const Mm =
    134.9633964 +
    477198.8675055 * T +
    0.0087414 * T * T +
    (T * T * T) / 69699 -
    (T * T * T * T) / 14712000;

  const D =
    297.8501921 +
    445267.1114034 * T -
    0.0018819 * T * T +
    (T * T * T) / 545868 -
    (T * T * T * T) / 113065000;

  const moonTropicalDeg = normalizeDegrees(
    Lm +
      6.289 * Math.sin(degToRad(Mm)) +
      1.274 * Math.sin(degToRad(2 * D - Mm)) +
      0.658 * Math.sin(degToRad(2 * D)) +
      0.214 * Math.sin(degToRad(3 * Mm)) +
      0.110 * Math.sin(degToRad(D))
  );
  const moonSiderealDeg = normalizeDegrees(moonTropicalDeg - ayanamsaDeg);
  const rasiIndex = Math.floor(moonSiderealDeg / 30);
  const rasi = RASI_SIGNS[rasiIndex];

  const nakshatraIndex0 = Math.floor(moonSiderealDeg / NAKSHATRA_SPAN_DEG);
  const nakshatraIndex = Math.min(Math.max(nakshatraIndex0, 0), 26);
  const nakshatraName = NAKSHATRA_NAMES[nakshatraIndex];
  const nakshatraDegIn = moonSiderealDeg - nakshatraIndex * NAKSHATRA_SPAN_DEG;
  const nakshatraPada = Math.min(
    4,
    Math.floor(nakshatraDegIn / NAKSHATRA_PADA_SPAN_DEG) + 1
  );

  // Additional planet mean longitudes (tropical approximate), then shift by ayanamsa.
  const planetMeanTropical = {
    Mercury: 252.250906 + 149472.6746358 * T,
    Venus: 181.979801 + 58517.8156760 * T,
    Mars: 355.433000 + 19140.2993039 * T,
    Jupiter: 34.351519 + 3034.9056606 * T,
    Saturn: 50.077444 + 1222.1138488 * T,
    // Rahu/Ketu from mean longitude of ascending node of the Moon:
  };

  const omega =
    125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  const rahuTropicalDeg = normalizeDegrees(omega);
  const rahuSiderealDeg = normalizeDegrees(rahuTropicalDeg - ayanamsaDeg);
  const ketuSiderealDeg = normalizeDegrees(rahuSiderealDeg + 180);

  const planetSiderealDeg = {
    Sun: sunSiderealDeg,
    Moon: moonSiderealDeg,
    Mercury: normalizeDegrees(planetMeanTropical.Mercury - ayanamsaDeg),
    Venus: normalizeDegrees(planetMeanTropical.Venus - ayanamsaDeg),
    Mars: normalizeDegrees(planetMeanTropical.Mars - ayanamsaDeg),
    Jupiter: normalizeDegrees(planetMeanTropical.Jupiter - ayanamsaDeg),
    Saturn: normalizeDegrees(planetMeanTropical.Saturn - ayanamsaDeg),
    Rahu: rahuSiderealDeg,
    Ketu: ketuSiderealDeg,
  };

  const planetSignIndex = {};
  const planetStrength = {};
  Object.keys(planetSiderealDeg).forEach((p) => {
    const sidDeg = planetSiderealDeg[p];
    const signIdx = Math.floor(sidDeg / 30);
    planetSignIndex[p] = signIdx;
    planetStrength[p] = signAlignmentStrength(signIdx, lagnamIndex);
  });

  // Fixed planet-weight mapping for 20 categories.
  // Scores are deterministic (weighted combination of planet strengths around lagnam).
  const categoryWeights = {
    Career: { Saturn: 0.35, Jupiter: 0.25, Mars: 0.2, Rahu: 0.2 },
    Business: { Mercury: 0.35, Venus: 0.25, Jupiter: 0.2, Rahu: 0.2 },
    Finance: { Jupiter: 0.3, Venus: 0.25, Saturn: 0.25, Rahu: 0.2 },
    Education: { Jupiter: 0.45, Mercury: 0.25, Saturn: 0.2, Moon: 0.1 },
    Marriage: { Venus: 0.45, Jupiter: 0.25, Moon: 0.15, Saturn: 0.15 },
    Love: { Venus: 0.4, Moon: 0.3, Rahu: 0.2, Mars: 0.1 },
    Family: { Moon: 0.4, Venus: 0.2, Jupiter: 0.2, Saturn: 0.2 },
    Children: { Jupiter: 0.35, Moon: 0.35, Venus: 0.2, Mars: 0.1 },
    Health: { Mars: 0.35, Saturn: 0.25, Moon: 0.25, Rahu: 0.15 },
    'Mental strength': { Saturn: 0.4, Mars: 0.2, Mercury: 0.2, Rahu: 0.2 },
    Spiritual: { Jupiter: 0.4, Saturn: 0.3, Moon: 0.15, Rahu: 0.15 },
    'Foreign travel': { Rahu: 0.5, Jupiter: 0.2, Saturn: 0.2, Mars: 0.1 },
    Property: { Saturn: 0.4, Venus: 0.2, Jupiter: 0.25, Rahu: 0.15 },
    Legal: { Saturn: 0.45, Mercury: 0.25, Jupiter: 0.15, Rahu: 0.15 },
    Enemy: { Mars: 0.3, Saturn: 0.3, Rahu: 0.25, Moon: 0.15 },
    'Social status': { Jupiter: 0.35, Sun: 0.25, Saturn: 0.2, Venus: 0.2 },
    Friends: { Mercury: 0.3, Venus: 0.3, Moon: 0.2, Jupiter: 0.2 },
    Luck: { Rahu: 0.3, Jupiter: 0.3, Sun: 0.2, Moon: 0.2 },
    Remedies: { Saturn: 0.3, Mars: 0.2, Rahu: 0.3, Jupiter: 0.2 },
    'Overall life path': { Jupiter: 0.25, Saturn: 0.25, Rahu: 0.2, Venus: 0.15, Moon: 0.15 },
  };

  function computeCategoryScore(categoryKey) {
    const weights = categoryWeights[categoryKey] || {};
    const planets = Object.keys(weights);
    const totalW = planets.reduce((acc, p) => acc + weights[p], 0) || 1;

    const contributions = planets.map((p) => ({
      planet: p,
      weight: weights[p],
      strength: planetStrength[p] ?? 0,
      weighted: (weights[p] * (planetStrength[p] ?? 0)) / totalW,
    }));

    const dominant = contributions
      .slice()
      .sort((a, b) => b.weighted - a.weighted)[0];

    const weightedAvg = contributions.reduce((acc, c) => acc + c.weighted, 0);

    // Deterministic adjustment: depends only on nakshatra and lagnam indices.
    const adjustment =
      (((nakshatraIndex + lagnamIndex) % 5) - 2) * 1.75; // range ~[-3.5..3.5]

    let score = Math.round(weightedAvg + adjustment);
    score = Math.max(0, Math.min(100, score));

    return { score, dominantPlanet: dominant?.planet || 'Rahu' };
  }

  function buildRemediesText() {
    const candidates = ['Saturn', 'Mars', 'Rahu', 'Jupiter', 'Venus', 'Moon'];
    const sorted = candidates
      .slice()
      .sort((a, b) => (planetStrength[a] ?? 0) - (planetStrength[b] ?? 0));
    const weakest = sorted[0];

    const remedyMap = {
      Saturn: 'Shani-focused remedy: Satya + discipline + Shani mantra on Saturdays.',
      Mars: 'Mars-focused remedy: Hanuman support/prayer + courage discipline (Tuesdays).',
      Rahu: 'Rahu-focused remedy: Ganesha prayer + meditation on Wednesdays/Saturdays.',
      Jupiter: 'Jupiter-focused remedy: Guru-seva + wisdom prayer (Thursdays).',
      Venus: 'Venus-focused remedy: Lakshmi support + kindness/creativity practice (Fridays).',
      Moon: 'Moon-focused remedy: calm routine + Chandra mantra (Mondays).',
    };

    return (
      `Deterministic remedies based on weakest thematic planet (${weakest} strength). ` +
      (remedyMap[weakest] || remedyMap.Rahu)
    );
  }

  const categories = {};
  const intermediateCategory = {};

  CATEGORY_KEYS.forEach((categoryKey) => {
    const { score, dominantPlanet } = computeCategoryScore(categoryKey);

    const commonExplanation =
      `dominant=${dominantPlanet}, lagnam=${lagnam}, nakshatra=${nakshatraName} (pada ${nakshatraPada}).`;

    let rawInterpretation;
    if (categoryKey === 'Remedies') {
      rawInterpretation = buildRemediesText();
    } else {
      rawInterpretation = formatCategoryInterpretation({
        categoryKey,
        score,
        dominantPlanet,
        lagnam,
        nakshatra: `${nakshatraName} (pada ${nakshatraPada})`,
        explanation: `Model uses deterministic planet-sign alignment to lagnam; ${commonExplanation}`,
      });
    }

    const keywords = [
      dominantPlanet,
      lagnam,
      nakshatraName,
      `Pada${nakshatraPada}`,
    ];

    categories[categoryKey] = {
      score,
      keywords,
      rawInterpretation,
    };

    intermediateCategory[categoryKey] = {
      score,
      dominantPlanet,
      adjustmentBasis: { nakshatraIndex, lagnamIndex },
      weights: categoryWeights[categoryKey],
    };
  });

  const overallLifePathScore = Math.round(
    CATEGORY_KEYS.reduce((acc, k) => acc + (categories[k]?.score ?? 0), 0) /
      CATEGORY_KEYS.length
  );

  const overallDominant = Object.keys(planetStrength).reduce((best, p) => {
    if (!best) return p;
    return (planetStrength[p] ?? 0) > (planetStrength[best] ?? 0) ? p : best;
  }, null);

  const overallLifePath = {
    score: overallLifePathScore,
    keywords: [overallDominant, lagnam, nakshatraName],
    rawInterpretation: `Overall life path is a deterministic aggregate (average of 20 category scores). Dominant thematic planet by sign-alignment is ${overallDominant}.`,
  };

  return {
    chart: {
      rasi,
      nakshatra: `${nakshatraName} (pada ${nakshatraPada})`,
      lagnam,
      ayanamsa: Number(ayanamsaDeg.toFixed(6)),
    },
    categories,
    overallLifePath,
    transparency: {
      calculationVersion: CALCULATION_VERSION,
      inputsUsed: {
        profileHash,
        dob: dob instanceof Date ? dob.toISOString() : String(dob ?? ''),
        birthTime,
        birthPlace,
        lang: lang ?? 'en',
      },
      intermediate: {
        coords,
        timezoneAssumptionMinutes: tzOffsetMinutes,
        utcDateTime: utcDate.toISOString(),
        jd,
        julianCenturiesFromJ2000: T,
        ayanamsaDeg,
        obliquityDeg,
        gmstDeg,
        lstDeg,
        ascendant: {
          tropicalDeg: ascTropicalDeg,
          siderealDeg: ascSiderealDeg,
          lagnamIndex,
        },
        sun: {
          tropicalDeg: sunTropicalDeg,
          siderealDeg: sunSiderealDeg,
          signIndex: sunSignIndex,
        },
        moon: {
          tropicalDeg: moonTropicalDeg,
          siderealDeg: moonSiderealDeg,
          signIndex: rasiIndex,
          nakshatraIndex0,
          nakshatraName,
          nakshatraPada,
        },
        planets: {
          Sun: { siderealDeg: planetSiderealDeg.Sun, signIndex: planetSignIndex.Sun, strength: planetStrength.Sun },
          Moon: { siderealDeg: planetSiderealDeg.Moon, signIndex: planetSignIndex.Moon, strength: planetStrength.Moon },
          Mercury: { siderealDeg: planetSiderealDeg.Mercury, signIndex: planetSignIndex.Mercury, strength: planetStrength.Mercury },
          Venus: { siderealDeg: planetSiderealDeg.Venus, signIndex: planetSignIndex.Venus, strength: planetStrength.Venus },
          Mars: { siderealDeg: planetSiderealDeg.Mars, signIndex: planetSignIndex.Mars, strength: planetStrength.Mars },
          Jupiter: { siderealDeg: planetSiderealDeg.Jupiter, signIndex: planetSignIndex.Jupiter, strength: planetStrength.Jupiter },
          Saturn: { siderealDeg: planetSiderealDeg.Saturn, signIndex: planetSignIndex.Saturn, strength: planetStrength.Saturn },
          Rahu: { siderealDeg: planetSiderealDeg.Rahu, signIndex: planetSignIndex.Rahu, strength: planetStrength.Rahu },
          Ketu: { siderealDeg: planetSiderealDeg.Ketu, signIndex: planetSignIndex.Ketu, strength: planetStrength.Ketu },
        },
        categoryScoring: intermediateCategory,
      },
    },
  };
}

module.exports = {
  CALCULATION_VERSION,
  CATEGORY_KEYS,
  computeDeterministicSingleJosiyam,
};

