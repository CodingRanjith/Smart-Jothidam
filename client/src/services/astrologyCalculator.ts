import type { BirthDetails } from '../components/InputForm';
import type { AstrologyDetails } from '../types';

// Helper function to parse date and time
const parseBirthDateTime = (dob: string, time: string, place: string) => {
  // Parse DD/MM/YYYY format
  const [day, month, year] = dob.split('/').map(Number);
  
  // Parse HH:MM AM/PM format
  const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hours = 0;
  let minutes = 0;
  
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  }
  
  return {
    year,
    month,
    day,
    hours,
    minutes,
    place,
  };
};

// Tamil Rasi names
const TAMIL_RASI = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];

// Tamil Nakshatra names
const TAMIL_NAKSHATRA = [
  'அசுவினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிஷம்', 'திருவாதிரை',
  'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்',
  'அத்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை',
  'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
  'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
];

// Rasi Lords
const RASI_LORDS = [
  'சுக்கிரன்', 'சுக்கிரன்', 'புதன்', 'சந்திரன்', 'சூரியன்', 'புதன்',
  'சுக்கிரன்', 'செவ்வாய்', 'குரு', 'சனி', 'சனி', 'குரு'
];

// Nakshatra Lords
const NAKSHATRA_LORDS = [
  'கேது', 'சுக்கிரன்', 'சூரியன்', 'சந்திரன்', 'செவ்வாய்', 'ராகு',
  'குரு', 'சனி', 'ராகு', 'சூரியன்', 'சூரியன்', 'சந்திரன்',
  'சந்திரன்', 'செவ்வாய்', 'ராகு', 'சுக்கிரன்', 'செவ்வாய்', 'ராகு',
  'கேது', 'சனி', 'சனி', 'குரு', 'சனி', 'குரு',
  'சனி', 'சனி', 'கேது'
];

// Calculate Rasi from longitude (0-360 degrees)
const calculateRasi = (longitude: number): number => {
  return Math.floor(longitude / 30);
};

// Calculate Nakshatra from longitude (0-360 degrees)
const calculateNakshatra = (longitude: number): { nakshatra: number; paatham: number } => {
  const nakshatra = Math.floor(longitude / (360 / 27));
  const remainder = longitude % (360 / 27);
  const paatham = Math.floor(remainder / (360 / 27 / 4)) + 1;
  return { nakshatra, paatham };
};

// Simplified calculation - In production, use proper ephemeris API
// This is a placeholder that uses approximate calculations
export const calculateAstrologyDetails = async (
  details: BirthDetails
): Promise<AstrologyDetails> => {
  try {
    const { year, month, day, hours, minutes, place } = parseBirthDateTime(
      details.dob,
      details.time,
      details.place
    );

    // For now, using a simplified calculation
    // In production, integrate with proper astrology API like:
    // - Swiss Ephemeris API
    // - AstroAPI
    // - Or use a backend service with proper calculations

    // Approximate calculations (these should be replaced with proper ephemeris)
    const julianDay = calculateJulianDay(year, month, day, hours, minutes);
    
    // Simplified planetary positions (replace with actual calculations)
    const moonLongitude = calculateMoonLongitude(julianDay);
    const sunLongitude = calculateSunLongitude(julianDay);
    const lagnamLongitude = calculateLagnam(julianDay, hours, minutes, place);

    const moonRasi = calculateRasi(moonLongitude);
    const sunRasi = calculateRasi(sunLongitude);
    const lagnamRasi = calculateRasi(lagnamLongitude);
    
    const moonNakshatra = calculateNakshatra(moonLongitude);
    
    // Check for Dosham (simplified - should use proper calculations)
    const dosham = checkDosham(moonRasi, lagnamRasi);
    
    // Calculate Dasa Balance (simplified)
    const dasaBalance = calculateDasaBalance(moonNakshatra.nakshatra, year, month, day);

    return {
      rasi: TAMIL_RASI[moonRasi] || 'Unknown',
      nakshatra: TAMIL_NAKSHATRA[moonNakshatra.nakshatra] || 'Unknown',
      nakshatraPaatham: `${moonNakshatra.paatham}/4`,
      lagnam: TAMIL_RASI[lagnamRasi] || 'Unknown',
      chandranPosition: `${TAMIL_RASI[moonRasi]} (${Math.round(moonLongitude % 30)}°)`,
      suriyanPosition: `${TAMIL_RASI[sunRasi]} (${Math.round(sunLongitude % 30)}°)`,
      dosham: dosham ? 'Yes' : 'No',
      dasaBalance: dasaBalance,
      rasiLord: RASI_LORDS[moonRasi] || 'Unknown',
      nakshatraLord: NAKSHATRA_LORDS[moonNakshatra.nakshatra] || 'Unknown',
    };
  } catch (error) {
    console.error('Error calculating astrology details:', error);
    throw new Error('Failed to calculate astrology details');
  }
};

// Helper functions (simplified - should use proper ephemeris)
function calculateJulianDay(year: number, month: number, day: number, hours: number, minutes: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn + (hours + minutes / 60) / 24;
}

function calculateMoonLongitude(jd: number): number {
  // Simplified calculation - replace with proper ephemeris
  const T = (jd - 2451545.0) / 36525.0;
  const L = 218.3164477 + 481267.88123421 * T;
  return (L % 360 + 360) % 360;
}

function calculateSunLongitude(jd: number): number {
  // Simplified calculation - replace with proper ephemeris
  const T = (jd - 2451545.0) / 36525.0;
  const L = 280.46646 + 36000.76983 * T;
  return (L % 360 + 360) % 360;
}

function calculateLagnam(_jd: number, hours: number, minutes: number, _place: string): number {
  // Simplified calculation - should use proper timezone and latitude/longitude
  const localTime = hours + minutes / 60;
  const lagnamOffset = (localTime - 6) * 15; // Approximate
  return (lagnamOffset % 360 + 360) % 360;
}

function checkDosham(_moonRasi: number, _lagnamRasi: number): boolean {
  // Simplified dosham check
  // In production, check for Mangal Dosha, Rahu-Ketu Dosha, etc.
  return false; // Placeholder
}

function calculateDasaBalance(nakshatra: number, _year: number, _month: number, _day: number): string {
  // Simplified Dasa calculation
  // In production, use proper Dasa calculations based on Nakshatra
  // Dasa years: [7, 10, 18, 16, 19, 17, 7, 20, 16] (to be used in proper implementation)
  const dasaNames = ['கேது', 'சுக்கிரன்', 'சூரியன்', 'சந்திரன்', 'செவ்வாய்', 'ராகு', 'குரு', 'சனி', 'புதன்'];
  
  // This is a placeholder - proper calculation needed
  return `${dasaNames[nakshatra % dasaNames.length]} Dasa - Balance calculation needed`;
}
