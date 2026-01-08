import Groq from 'groq-sdk';
import type { BirthDetails } from '../components/InputForm';
import type { PredictionResult } from '../types';

// WARNING: Using dangerouslyAllowBrowser exposes your API key in the client bundle.
// For production, consider creating a backend API to proxy Groq requests.
const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';

// Debug: Check if API key is loaded (remove in production)
if (!apiKey) {
  console.error('VITE_GROQ_API_KEY is not set. Please check your .env file and restart the dev server.');
}

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are a highly experienced traditional Tamil astrologer (Josiyar) with deep knowledge of:
- Tamil Rasi system
- Nakshatra calculations
- Dasa & Bhukti concepts
- Traditional remedies (Pariharam)
You must give predictions strictly based on the provided birth details.
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

const buildSinglePersonPrompt = (details: BirthDetails): string => {
  return `Person Details:
Name: ${details.name}
Date of Birth: ${details.dob}
Time of Birth: ${details.time}
Place of Birth: ${details.place}
Gender: ${details.gender || 'Not specified'}

Tasks:
1. Calculate Tamil Rasi astrology details.
2. Show basic astrology details with minimum 10 fields: Rasi, Nakshatra, Nakshatra Paatham, Lagnam, Chandran Position, Suriyan Position, Dosham Presence (Yes/No), Dasa Balance, Rasi Lord, Nakshatra Lord.
3. Give category-wise predictions for these ${CATEGORIES.length} categories: ${CATEGORIES.join(', ')}.
4. Each category should be clear, practical, and traditional.
5. Provide remedies only if dosham or challenges exist.

Format your response as JSON with this structure:
{
  "basicDetails": {
    "rasi": "...",
    "nakshatra": "...",
    "nakshatraPaatham": "...",
    "lagnam": "...",
    "chandranPosition": "...",
    "suriyanPosition": "...",
    "dosham": "Yes/No",
    "dasaBalance": "...",
    "rasiLord": "...",
    "nakshatraLord": "..."
  },
  "predictions": {
    "Career / Job": "...",
    "Business": "...",
    ...
  }
}`;
};

const buildCouplePrompt = (
  person1: BirthDetails,
  person2: BirthDetails
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

Tasks:
1. Calculate astrology details for both persons.
2. Show individual basic details first with minimum 10 fields each: Rasi, Nakshatra, Nakshatra Paatham, Lagnam, Chandran Position, Suriyan Position, Dosham Presence (Yes/No), Dasa Balance, Rasi Lord, Nakshatra Lord.
3. Analyze compatibility using traditional Tamil astrology.
4. Give minimum ${COUPLE_CATEGORIES.length} category-wise predictions: ${COUPLE_CATEGORIES.join(', ')}.
5. Include marriage harmony, family life, and future stability.
6. Provide remedies if mismatches or dosham exist.

Format your response as JSON with this structure:
{
  "basicDetails": {
    "person1": {
      "rasi": "...",
      "nakshatra": "...",
      ...
    },
    "person2": {
      "rasi": "...",
      "nakshatra": "...",
      ...
    }
  },
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
    const userPrompt = buildSinglePersonPrompt(details);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(response);

    return {
      basicDetails: parsed.basicDetails || {},
      predictions: parsed.predictions || {},
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
    const userPrompt = buildCouplePrompt(person1, person2);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 5000,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(response);

    return {
      basicDetails: parsed.basicDetails || { person1: {}, person2: {} },
      predictions: parsed.predictions || {},
    };
  } catch (error) {
    console.error('Error fetching couple josiyam:', error);
    throw new Error('Failed to calculate Couple Josiyam. Please try again.');
  }
};
