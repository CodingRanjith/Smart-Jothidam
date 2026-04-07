import Groq from 'groq-sdk';
import type { BirthDetails } from '../components/InputForm';
import type { PredictionResult, ChatMessage } from '../types';
import { calculateAstrologyDetails } from './astrologyCalculator';

// Version: 2.0 - Updated model and API key
// API Key is hardcoded here for development
const apiKey = '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';

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

const getSystemPrompt = (language?: string): string => {
  const isTamil = language === 'Tamil' || language === 'Tamil + English';
  const isBilingual = language === 'Tamil + English';
  
  const languageInstruction = isTamil 
    ? (isBilingual 
      ? `OUTPUT LANGUAGE: Write predictions in BOTH Tamil and English. For each category, write in Tamil first, followed by English in parentheses. Use Tamil script (தமிழ்) for Tamil text.`
      : `OUTPUT LANGUAGE: Write ALL predictions EXCLUSIVELY in Tamil language using Tamil script (தமிழ்). Do NOT use English. Use traditional Tamil terminology and Tamil astrology terms.`)
    : `OUTPUT LANGUAGE: Write predictions in English. Use traditional Tamil astrology terminology when referring to astrological concepts.`;

  return `You are a highly experienced traditional Tamil astrologer (Josiyar) with deep knowledge of:
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
9. If specific astrological details are missing, state that clearly rather than making assumptions.

${languageInstruction}

IMPORTANT: Ensure your response is valid JSON format with all category predictions included.`;
};

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
  calculatedDetails: any,
  language?: string
): string => {
  const isTamil = language === 'Tamil' || language === 'Tamil + English';
  const languageNote = isTamil 
    ? (language === 'Tamil + English' 
      ? 'Write each prediction in TAMIL first, then English in parentheses. Example: "வணிகம் நல்ல முடிவுகளை கொடுக்கும் (Business will yield good results)."'
      : 'Write ALL predictions EXCLUSIVELY in TAMIL language using Tamil script. Example: "வணிகம் நல்ல முடிவுகளை கொடுக்கும்."')
    : 'Write predictions in English.';
  
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
8. ${languageNote}

Format your response as valid JSON:
{
  "predictions": {
    "Career / Job": "2-3 sentence explanation based on verified data ${isTamil ? 'in Tamil' : 'in English'}",
    "Business": "2-3 sentence explanation based on verified data ${isTamil ? 'in Tamil' : 'in English'}",
    ... (include ALL ${CATEGORIES.length} categories)
  }
}

CRITICAL: Keep responses brief and ensure JSON is complete and valid. Base all explanations on the VERIFIED data provided above. ${isTamil ? 'Remember: Use Tamil script for Tamil text.' : ''}`;
};

const buildCouplePrompt = (
  person1: BirthDetails,
  person2: BirthDetails,
  calculatedDetails1: any,
  calculatedDetails2: any,
  language?: string
): string => {
  const isTamil = language === 'Tamil' || language === 'Tamil + English';
  const languageNote = isTamil 
    ? (language === 'Tamil + English' 
      ? 'Write each prediction in TAMIL first, then English in parentheses. Example: "வணிகம் நல்ல முடிவுகளை கொடுக்கும் (Business will yield good results)."'
      : 'Write ALL predictions EXCLUSIVELY in TAMIL language using Tamil script. Example: "வணிகம் நல்ல முடிவுகளை கொடுக்கும்."')
    : 'Write predictions in English.';
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
9. ${languageNote}

Format your response as valid JSON:
{
  "predictions": {
    "Career / Job": "2-3 sentence explanation based on verified data ${isTamil ? 'in Tamil' : 'in English'}",
    "Business": "2-3 sentence explanation based on verified data ${isTamil ? 'in Tamil' : 'in English'}",
    ... (include ALL ${COUPLE_CATEGORIES.length} categories including Compatibility Score, Emotional Bond, etc.)
  }
}

CRITICAL: Keep responses brief and ensure JSON is complete and valid. Base all explanations on the VERIFIED data provided above. ${isTamil ? 'Remember: Use Tamil script for Tamil text.' : ''}`;
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
    const language = details.language || 'English';
    const systemPrompt = getSystemPrompt(language);
    const userPrompt = buildSinglePersonPrompt(details, calculatedDetails, language);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
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
    const language = person1.language || person2.language || 'English';
    const systemPrompt = getSystemPrompt(language);
    const userPrompt = buildCouplePrompt(person1, person2, calculatedDetails1, calculatedDetails2, language);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
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

const buildChatContextPrompt = (
  type: 'single' | 'couple',
  birthDetails: BirthDetails | { person1: BirthDetails; person2: BirthDetails },
  result: PredictionResult,
  language?: string
): string => {
  const isCouple = type === 'couple' && 'person1' in birthDetails;
  
  let contextPrompt = `You are a helpful Tamil astrology assistant. Answer questions based on the following verified astrology data:\n\n`;
  
  if (isCouple && 'person1' in birthDetails) {
    const basicDetails = result.basicDetails as { person1: any; person2: any };
    contextPrompt += `COUPLE JOSIYAM DATA:\n`;
    contextPrompt += `\nPERSON 1:\n`;
    contextPrompt += `Name: ${birthDetails.person1.name}\n`;
    contextPrompt += `DOB: ${birthDetails.person1.dob}\n`;
    contextPrompt += `Time: ${birthDetails.person1.time}\n`;
    contextPrompt += `Place: ${birthDetails.person1.place}\n`;
    contextPrompt += `Rasi: ${basicDetails.person1?.rasi || 'N/A'}\n`;
    contextPrompt += `Nakshatra: ${basicDetails.person1?.nakshatra || 'N/A'}\n`;
    contextPrompt += `Lagnam: ${basicDetails.person1?.lagnam || 'N/A'}\n`;
    contextPrompt += `Dosham: ${basicDetails.person1?.dosham || 'N/A'}\n`;
    
    contextPrompt += `\nPERSON 2:\n`;
    contextPrompt += `Name: ${birthDetails.person2.name}\n`;
    contextPrompt += `DOB: ${birthDetails.person2.dob}\n`;
    contextPrompt += `Time: ${birthDetails.person2.time}\n`;
    contextPrompt += `Place: ${birthDetails.person2.place}\n`;
    contextPrompt += `Rasi: ${basicDetails.person2?.rasi || 'N/A'}\n`;
    contextPrompt += `Nakshatra: ${basicDetails.person2?.nakshatra || 'N/A'}\n`;
    contextPrompt += `Lagnam: ${basicDetails.person2?.lagnam || 'N/A'}\n`;
    contextPrompt += `Dosham: ${basicDetails.person2?.dosham || 'N/A'}\n`;
  } else if (!isCouple && 'name' in birthDetails) {
    const basicDetails = result.basicDetails as any;
    contextPrompt += `SINGLE PERSON JOSIYAM DATA:\n`;
    contextPrompt += `Name: ${birthDetails.name}\n`;
    contextPrompt += `DOB: ${birthDetails.dob}\n`;
    contextPrompt += `Time: ${birthDetails.time}\n`;
    contextPrompt += `Place: ${birthDetails.place}\n`;
    contextPrompt += `Rasi: ${basicDetails?.rasi || 'N/A'}\n`;
    contextPrompt += `Nakshatra: ${basicDetails?.nakshatra || 'N/A'}\n`;
    contextPrompt += `Nakshatra Paatham: ${basicDetails?.nakshatraPaatham || 'N/A'}\n`;
    contextPrompt += `Lagnam: ${basicDetails?.lagnam || 'N/A'}\n`;
    contextPrompt += `Chandran Position: ${basicDetails?.chandranPosition || 'N/A'}\n`;
    contextPrompt += `Suriyan Position: ${basicDetails?.suriyanPosition || 'N/A'}\n`;
    contextPrompt += `Dosham: ${basicDetails?.dosham || 'N/A'}\n`;
    contextPrompt += `Dasa Balance: ${basicDetails?.dasaBalance || 'N/A'}\n`;
    contextPrompt += `Rasi Lord: ${basicDetails?.rasiLord || 'N/A'}\n`;
    contextPrompt += `Nakshatra Lord: ${basicDetails?.nakshatraLord || 'N/A'}\n`;
  }
  
  contextPrompt += `\n\nPREDICTIONS:\n`;
  Object.entries(result.predictions || {}).forEach(([category, content]) => {
    contextPrompt += `${category}: ${content}\n`;
  });
  
  const isTamil = language === 'Tamil' || language === 'Tamil + English';
  const isBilingual = language === 'Tamil + English';
  
  contextPrompt += `\n\nINSTRUCTIONS:\n`;
  contextPrompt += `- Answer questions based ONLY on the astrology data provided above\n`;
  contextPrompt += `- Use traditional Tamil astrology terminology\n`;
  if (isTamil) {
    contextPrompt += `- Answer questions ${isBilingual ? 'in BOTH Tamil and English (Tamil first, then English in parentheses)' : 'EXCLUSIVELY in Tamil language using Tamil script (தமிழ்)'}\n`;
  } else {
    contextPrompt += `- Answer questions in English\n`;
  }
  contextPrompt += `- Be clear, concise, and helpful\n`;
  contextPrompt += `- If asked about something not in the data, politely say you can only answer based on the provided astrology information\n`;
  contextPrompt += `- Keep responses conversational and easy to understand\n`;
  
  return contextPrompt;
};

// Simple question-answering function for daily horoscope (no context needed)
export const askSimpleQuestion = async (
  question: string,
  language: string = 'English'
): Promise<string> => {
  try {
    const isBilingual = language === 'Tamil + English';
    const isTanglish = language === 'Tanglish';
    
    let languageInstruction = '';
    if (language === 'Tamil') {
      languageInstruction = 'Answer EXCLUSIVELY in Tamil language using Tamil script. Example: "வணிகம் நல்ல முடிவுகளை கொடுக்கும்."';
    } else if (language === 'English') {
      languageInstruction = 'Answer EXCLUSIVELY in English. Example: "Business will yield good results."';
    } else if (isBilingual) {
      languageInstruction = 'Answer in BOTH Tamil (first) and English (in parentheses). Example: "வணிகம் நல்ல முடிவுகளை கொடுக்கும் (Business will yield good results)."';
    } else if (isTanglish) {
      languageInstruction = 'Answer in Tanglish (mixed Tamil and English, commonly used in Tamil-speaking regions). Use Tamil script for Tamil words and English for English words naturally mixed. Example: "வணிகம் good results கிடைக்கும். Today is your lucky day."';
    } else {
      languageInstruction = 'Answer in English.';
    }
    
    const systemPrompt = `You are an expert Tamil astrologer (Josiyar) with deep knowledge of traditional Tamil astrology.
${languageInstruction}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    return response;
  } catch (error: any) {
    console.error('Error asking simple question:', error);
    throw new Error(error?.message || 'Failed to get answer. Please try again.');
  }
};

export const askQuestion = async (
  question: string,
  type: 'single' | 'couple',
  birthDetails: BirthDetails | { person1: BirthDetails; person2: BirthDetails },
  result: PredictionResult,
  chatHistory: ChatMessage[] = [],
  language?: string
): Promise<string> => {
  try {
    const lang = language || ('name' in birthDetails ? birthDetails.language : ('person1' in birthDetails ? birthDetails.person1.language : undefined)) || 'English';
    const systemPrompt = getSystemPrompt(lang);
    const contextPrompt = buildChatContextPrompt(type, birthDetails, result, lang);
    
    // Build messages array with system prompt, context, chat history, and current question
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { 
        role: 'system', 
        content: systemPrompt + '\n\n' + contextPrompt 
      }
    ];
    
    // Add chat history (last 10 messages to avoid token limits)
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    // Add current question
    messages.push({
      role: 'user',
      content: question
    });

    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
    return response;
  } catch (error: any) {
    console.error('Error asking question:', error);
    throw new Error(error?.message || 'Failed to get answer. Please try again.');
  }
};
