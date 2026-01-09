import Groq from 'groq-sdk';
import type { BirthDetails } from '../components/InputForm';
import type { PredictionResult } from '../types';
import { calculateAstrologyDetails } from './astrologyCalculator';

// Version: 2.0 - Updated model and API key
// API Key is hardcoded here for development
const apiKey = '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';

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are a highly experienced traditional Tamil astrologer (Josiyar) with deep knowledge of:
- Tamil Rasi system interpretation
- Nakshatra meanings and influences
- Dasa & Bhukti concepts
- Traditional remedies (Pariharam)
- Astrological predictions and interpretations

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. The astrology calculations are ALREADY COMPLETE and VERIFIED using Swiss Ephemeris with Lahiri Ayanamsa (Chitrapaksha).
2. Your task is ONLY to EXPLAIN and INTERPRET the provided verified astrology data.
3. DO NOT calculate, recalculate, modify, or question the provided astrology values.
4. DO NOT use default or tropical zodiac - all data is already in sidereal (Vedic) format.
5. Base ALL predictions STRICTLY on the provided calculated values - never invent or assume values.
6. Keep all predictions VERY BRIEF - maximum 2-3 sentences per category to ensure complete JSON responses.
7. Use traditional Tamil astrology terminology when explaining.
8. Be respectful, accurate, and clear - no exaggerated claims.
9. If specific astrological details are missing, state that clearly rather than making assumptions.`;

const CATEGORIES = [
  'Career / Job',
  'Business',
  'Finance / Wealth',
  'Education',
  'Marriage',
  'Love & Romance',
  'Family Life',
  'Children',
  'Health',
  'Mental Strength',
  'Spiritual Growth',
  'Foreign Travel',
  'Property & Assets',
  'Legal Issues',
  'Enemy / Competition',
  'Social Status',
  'Friends Circle',
  'Luck Factor',
  'Remedies (Pariharam)',
  'Overall Life Path',
];

const COUPLE_CATEGORIES = [
  ...CATEGORIES,
  'Compatibility Score',
  'Emotional Bond',
  'Financial Stability Together',
  'Family Harmony',
  'Long-term Growth',
];

const buildSinglePersonPrompt = (
  details: BirthDetails,
  calculatedDetails: any
): string => {
  return `VERIFIED ASTROLOGY DATA - DO NOT RECALCULATE:
====================================================
Calculation Method: Swiss Ephemeris-style algorithms
Ayanamsa: ${calculatedDetails.ayanamsa || 'Lahiri (Chitrapaksha)'}
Disclaimer: ${calculatedDetails.disclaimer || 'Calculated using professional astrology standards'}

Person Details:
Name: ${details.name}
Date of Birth: ${details.dob}
Time of Birth: ${details.time}
Place of Birth: ${details.place}
Gender: ${details.gender || 'Not specified'}

VERIFIED CALCULATED ASTROLOGY DETAILS (Use these EXACT values - DO NOT recalculate, modify, or question):
====================================================
Rasi (ராசி): ${calculatedDetails.rasi}
Nakshatra (நட்சத்திரம்): ${calculatedDetails.nakshatra}
Nakshatra Paatham: ${calculatedDetails.nakshatraPaatham}
Lagnam (லக்னம்): ${calculatedDetails.lagnam}
Chandran Position (Moon): ${calculatedDetails.chandranPosition}
Suriyan Position (Sun): ${calculatedDetails.suriyanPosition}
Dosham Presence: ${calculatedDetails.dosham}
Dasa Balance: ${calculatedDetails.dasaBalance}
Rasi Lord (அதிபதி): ${calculatedDetails.rasiLord}
Nakshatra Lord: ${calculatedDetails.nakshatraLord}

YOUR TASK - EXPLAIN ONLY:
====================================================
1. Based on the VERIFIED astrology data above, provide category-wise predictions.
2. DO NOT calculate, recalculate, or modify any astrology values.
3. Use ONLY the provided values - never assume or invent values.
4. Give predictions for ALL ${CATEGORIES.length} categories: ${CATEGORIES.join(', ')}.
5. Keep each prediction VERY BRIEF (2-3 sentences maximum per category).
6. Be traditional, accurate, and clear.
7. Provide remedies only if dosham is "Yes" or challenges exist based on the verified data.

Format your response as valid JSON:
{
  "predictions": {
    "Career / Job": "2-3 sentence explanation based on verified data",
    "Business": "2-3 sentence explanation based on verified data",
    ... (include ALL ${CATEGORIES.length} categories)
  }
}

CRITICAL: Keep responses brief and ensure JSON is complete and valid. Base all explanations on the VERIFIED data provided above.`;
};

const buildCouplePrompt = (
  person1: BirthDetails,
  person2: BirthDetails,
  calculatedDetails1: any,
  calculatedDetails2: any
): string => {
  return `VERIFIED ASTROLOGY DATA - DO NOT RECALCULATE:
====================================================
Calculation Method: Swiss Ephemeris-style algorithms
Ayanamsa: ${calculatedDetails1.ayanamsa || 'Lahiri (Chitrapaksha)'}
Disclaimer: ${calculatedDetails1.disclaimer || 'Calculated using professional astrology standards'}

PERSON 1 DETAILS:
Name: ${person1.name}
DOB: ${person1.dob}
Time: ${person1.time}
Place: ${person1.place}

PERSON 2 DETAILS:
Name: ${person2.name}
DOB: ${person2.dob}
Time: ${person2.time}
Place: ${person2.place}

VERIFIED CALCULATED ASTROLOGY DETAILS FOR PERSON 1 (Use these EXACT values - DO NOT recalculate):
====================================================
Rasi: ${calculatedDetails1.rasi}
Nakshatra: ${calculatedDetails1.nakshatra}
Nakshatra Paatham: ${calculatedDetails1.nakshatraPaatham}
Lagnam: ${calculatedDetails1.lagnam}
Chandran Position: ${calculatedDetails1.chandranPosition}
Suriyan Position: ${calculatedDetails1.suriyanPosition}
Dosham: ${calculatedDetails1.dosham}
Dasa Balance: ${calculatedDetails1.dasaBalance}
Rasi Lord: ${calculatedDetails1.rasiLord}
Nakshatra Lord: ${calculatedDetails1.nakshatraLord}

VERIFIED CALCULATED ASTROLOGY DETAILS FOR PERSON 2 (Use these EXACT values - DO NOT recalculate):
====================================================
Rasi: ${calculatedDetails2.rasi}
Nakshatra: ${calculatedDetails2.nakshatra}
Nakshatra Paatham: ${calculatedDetails2.nakshatraPaatham}
Lagnam: ${calculatedDetails2.lagnam}
Chandran Position: ${calculatedDetails2.chandranPosition}
Suriyan Position: ${calculatedDetails2.suriyanPosition}
Dosham: ${calculatedDetails2.dosham}
Dasa Balance: ${calculatedDetails2.dasaBalance}
Rasi Lord: ${calculatedDetails2.rasiLord}
Nakshatra Lord: ${calculatedDetails2.nakshatraLord}

YOUR TASK - EXPLAIN COMPATIBILITY ONLY:
====================================================
1. Based on the VERIFIED astrology data above, analyze compatibility using traditional Tamil astrology.
2. DO NOT calculate, recalculate, or modify any astrology values.
3. Use ONLY the provided values - never assume or invent values.
4. Give predictions for ALL ${COUPLE_CATEGORIES.length} categories: ${COUPLE_CATEGORIES.join(', ')}.
5. Keep each prediction VERY BRIEF (2-3 sentences maximum per category).
6. Include marriage harmony, family life, and future stability analysis.
7. Provide remedies if mismatches exist or if dosham is "Yes" for either person.
8. Be traditional, accurate, and clear.

Format your response as valid JSON:
{
  "predictions": {
    "Career / Job": "2-3 sentence explanation based on verified data",
    "Business": "2-3 sentence explanation based on verified data",
    ... (include ALL ${COUPLE_CATEGORIES.length} categories including Compatibility Score, Emotional Bond, etc.)
  }
}

CRITICAL: Keep responses brief and ensure JSON is complete and valid. Base all explanations on the VERIFIED data provided above.`;
};

export const getSinglePersonJosiyam = async (
  details: BirthDetails
): Promise<PredictionResult> => {
  try {
    // First, calculate astrology details using astrology calculator
    console.log('🔮 Calculating astrology details using astrology calculator...');
    const calculatedDetails = await calculateAstrologyDetails(details);
    console.log('✅ Astrology details calculated:', calculatedDetails);
    
    // Then, get predictions from AI based on calculated details
    console.log('🤖 Getting predictions from AI based on calculated details...');
    const userPrompt = buildSinglePersonPrompt(details, calculatedDetails);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 6144, // Increased to handle all categories (keep responses brief)
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response content:', response);
      // Try to extract valid JSON if partially truncated
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error('Failed to parse AI response. Response may have been truncated.');
        }
      } else {
        throw new Error('No valid JSON found in AI response.');
      }
    }

    console.log('✅ Returning results: Basic details from calculator, Predictions from AI');

    return {
      basicDetails: calculatedDetails, // ✅ Uses astrology calculator - NOT AI-generated
      predictions: parsed.predictions || {}, // ✅ Uses AI for predictions only
    };
  } catch (error: any) {
    console.error('Error fetching single person josiyam:', error);
    if (error?.message) {
      throw new Error(`Failed to calculate Josiyam: ${error.message}`);
    }
    throw new Error('Failed to calculate Josiyam. Please try again.');
  }
};

export const getCoupleJosiyam = async (
  person1: BirthDetails,
  person2: BirthDetails
): Promise<PredictionResult> => {
  try {
    // First, calculate astrology details for both persons using astrology calculator
    console.log('🔮 Calculating astrology details for Person 1 using astrology calculator...');
    const calculatedDetails1 = await calculateAstrologyDetails(person1);
    console.log('✅ Person 1 astrology details calculated:', calculatedDetails1);
    
    console.log('🔮 Calculating astrology details for Person 2 using astrology calculator...');
    const calculatedDetails2 = await calculateAstrologyDetails(person2);
    console.log('✅ Person 2 astrology details calculated:', calculatedDetails2);
    
    // Then, get predictions from AI based on calculated details
    console.log('🤖 Getting predictions from AI based on calculated details...');
    const userPrompt = buildCouplePrompt(person1, person2, calculatedDetails1, calculatedDetails2);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 8192, // Increased to handle all categories for couple (keep responses brief)
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response content:', response);
      // Try to extract valid JSON if partially truncated
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error('Failed to parse AI response. Response may have been truncated.');
        }
      } else {
        throw new Error('No valid JSON found in AI response.');
      }
    }

    console.log('✅ Returning results: Basic details from calculator, Predictions from AI');

    return {
      basicDetails: {
        person1: calculatedDetails1, // ✅ Uses astrology calculator - NOT AI-generated
        person2: calculatedDetails2, // ✅ Uses astrology calculator - NOT AI-generated
      },
      predictions: parsed.predictions || {}, // ✅ Uses AI for predictions only
    };
  } catch (error: any) {
    console.error('Error fetching couple josiyam:', error);
    if (error?.message) {
      throw new Error(`Failed to calculate Couple Josiyam: ${error.message}`);
    }
    throw new Error('Failed to calculate Couple Josiyam. Please try again.');
  }
};
