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
}

export interface PredictionResult {
  basicDetails: AstrologyDetails | { person1: AstrologyDetails; person2: AstrologyDetails };
  predictions: Record<string, string>;
}
