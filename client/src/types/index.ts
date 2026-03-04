export interface AstrologyDetails {
  rasi?: string;
  nakshatra?: string;
  nakshatraPaatham?: string;
  lagnam?: string;
  chandranPosition?: string;
  suriyanPosition?: string;
  dosham?: string;
  dasaBalance?: string;
  rasiLord?: string;
  nakshatraLord?: string;
  ascendantLord?: string;
  disclaimer?: string;
  ayanamsa?: string;
  // Extended panchangam (single/couple "view more" details)
  weekday?: string;
  weekdayTamil?: string;
  tamilDate?: string;
  tithi?: string;
  tithiPaksha?: string;
  yoga?: string;
  karana?: string;
  god?: string;
  animalSign?: string;
  tree?: string;
  ganam?: string;
  bird?: string;
  yoni?: string;
  gothram?: string;
  bhutham?: string;
  // English equivalents for bilingual display
  rasiEnglish?: string;
  nakshatraEnglish?: string;
  lagnamEnglish?: string;
  rasiLordEnglish?: string;
  nakshatraLordEnglish?: string;
  ascendantLordEnglish?: string;
}

export interface PredictionResult {
  basicDetails: AstrologyDetails | { person1: AstrologyDetails; person2: AstrologyDetails };
  predictions: Record<string, string>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}