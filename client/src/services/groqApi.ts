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

IMPORTANT: The astrology calculations (Rasi, Nakshatra, Lagnam, etc.) are already calculated and provided to you.
Your task is ONLY to provide predictions and interpretations based on these calculated values.
DO NOT attempt to recalculate or modify the provided astrology details.
Focus on giving accurate, traditional predictions based on the calculated astrology details.

You must give predictions strictly based on the provided calculated astrology details.
No random or exaggerated claims.
Tone must be respectful, traditional, and clear.
Explain predictions in simple English with Tamil astrology terms.`;

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
  return `Person Details:
Name: ${details.name}
Date of Birth: ${details.dob}
Time of Birth: ${details.time}
Place of Birth: ${details.place}
Gender: ${details.gender || 'Not specified'}

CALCULATED ASTROLOGY DETAILS (Use these exact values - DO NOT recalculate):
Rasi (ராசி): ${calculatedDetails.rasi}
Nakshatra (நட்சத்திரம்): ${calculatedDetails.nakshatra}
Nakshatra Paatham: ${calculatedDetails.nakshatraPaatham}
Lagnam (லக்னம்): ${calculatedDetails.lagnam}
Chandran Position: ${calculatedDetails.chandranPosition}
Suriyan Position: ${calculatedDetails.suriyanPosition}
Dosham Presence: ${calculatedDetails.dosham}
Dasa Balance: ${calculatedDetails.dasaBalance}
Rasi Lord (அதிபதி): ${calculatedDetails.rasiLord}
Nakshatra Lord: ${calculatedDetails.nakshatraLord}

Tasks:
1. Use the CALCULATED ASTROLOGY DETAILS provided above. DO NOT recalculate or change these values.
2. Based on these calculated astrology details, give category-wise predictions for these ${CATEGORIES.length} categories: ${CATEGORIES.join(', ')}.
3. Each category should be clear, practical, and traditional.
4. Provide remedies only if dosham is "Yes" or challenges exist based on the calculated details.

Format your response as JSON with this structure:
{
  "predictions": {
    "Career / Job": "...",
    "Business": "...",
    ...
  }
}`;
};

const buildCouplePrompt = (
  person1: BirthDetails,
  person2: BirthDetails,
  calculatedDetails1: any,
  calculatedDetails2: any
): string => {
  return `Male Details:
Name: ${person1.name}
DOB: ${person1.dob}
Time: ${person1.time}
Place: ${person1.place}

Female Details:
Name: ${person2.name}
DOB: ${person2.dob}
Time: ${person2.time}
Place: ${person2.place}

CALCULATED ASTROLOGY DETAILS FOR PERSON 1 (Use these exact values - DO NOT recalculate):
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

CALCULATED ASTROLOGY DETAILS FOR PERSON 2 (Use these exact values - DO NOT recalculate):
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

Tasks:
1. Use the CALCULATED ASTROLOGY DETAILS provided above. DO NOT recalculate or change these values.
2. Analyze compatibility using traditional Tamil astrology based on these calculated details.
3. Give minimum ${COUPLE_CATEGORIES.length} category-wise predictions: ${COUPLE_CATEGORIES.join(', ')}.
4. Include marriage harmony, family life, and future stability.
5. Provide remedies if mismatches exist or if dosham is "Yes" for either person.

Format your response as JSON with this structure:
{
  "predictions": {
    "Career / Job": "...",
    "Compatibility Score": "...",
    ...
  }
}`;
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
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(response);

    console.log('✅ Returning results: Basic details from calculator, Predictions from AI');

    return {
      basicDetails: calculatedDetails, // ✅ Uses astrology calculator - NOT AI-generated
      predictions: parsed.predictions || {}, // ✅ Uses AI for predictions only
    };
  } catch (error) {
    console.error('Error fetching single person josiyam:', error);
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
      max_tokens: 5000,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(response);

    console.log('✅ Returning results: Basic details from calculator, Predictions from AI');

    return {
      basicDetails: {
        person1: calculatedDetails1, // ✅ Uses astrology calculator - NOT AI-generated
        person2: calculatedDetails2, // ✅ Uses astrology calculator - NOT AI-generated
      },
      predictions: parsed.predictions || {}, // ✅ Uses AI for predictions only
    };
  } catch (error) {
    console.error('Error fetching couple josiyam:', error);
    throw new Error('Failed to calculate Couple Josiyam. Please try again.');
  }
};
