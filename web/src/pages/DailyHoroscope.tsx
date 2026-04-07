import { useState } from 'react';
import Loader from '../components/Loader';
import { askSimpleQuestion } from '../services/groqApi';

interface DailyPlanResult {
  date: string;
  rasi: string;
  language: string;
  predictions: {
    [key: string]: string;
  };
}

const TAMIL_RASI = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];

const DAILY_CATEGORIES = [
  'Today\'s Overview',
  'Career / Work',
  'Business / Investments',
  'Finance / Money',
  'Health',
  'Relationships / Love',
  'Family',
  'Education / Learning',
  'Travel',
  'Legal Matters',
  'Lucky Numbers',
  'Lucky Color',
  'Lucky Time',
  'Remedies / Pariharam'
];

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Tamil', label: 'Tamil / தமிழ்' },
  { value: 'Tamil + English', label: 'Tamil + English / தமிழ் + ஆங்கிலம்' },
  { value: 'Tanglish', label: 'Tanglish / டாங்கிளிஷ்' },
];

const DailyHoroscope = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedRasi, setSelectedRasi] = useState<string>('மேஷம்');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Tamil + English');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DailyPlanResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const dateObj = new Date(selectedDate);
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Build language-specific instructions
      let languageInstruction = '';
      let formatExample = '';
      
      if (selectedLanguage === 'Tamil') {
        languageInstruction = 'Write ALL predictions EXCLUSIVELY in TAMIL language using Tamil script. Example: "வணிகம் நல்ல முடிவுகளை கொடுக்கும்."';
        formatExample = '"வணிகம் நல்ல முடிவுகளை கொடுக்கும்."';
      } else if (selectedLanguage === 'English') {
        languageInstruction = 'Write ALL predictions EXCLUSIVELY in English. Example: "Business will yield good results."';
        formatExample = '"Business will yield good results."';
      } else if (selectedLanguage === 'Tamil + English') {
        languageInstruction = 'Write each prediction in TAMIL first, then English in parentheses. Example: "வணிகம் நல்ல முடிவுகளை கொடுக்கும் (Business will yield good results)."';
        formatExample = '"வணிகம் நல்ல முடிவுகளை கொடுக்கும் (Business will yield good results)."';
      } else if (selectedLanguage === 'Tanglish') {
        languageInstruction = 'Write predictions in Tanglish (mixed Tamil and English, commonly used in Tamil-speaking regions). Use Tamil script for Tamil words and English for English words naturally mixed. Example: "வணிகம் good results கிடைக்கும். Today is your lucky day."';
        formatExample = '"வணிகம் good results கிடைக்கும். Today is your lucky day."';
      }

      const prompt = `You are an expert Tamil astrologer (Josiyar). Provide daily predictions (தினசரி ஜோதிடம்) for Rasi: ${selectedRasi} on ${formattedDate}.

IMPORTANT INSTRUCTIONS:
1. Provide predictions for ALL these categories: ${DAILY_CATEGORIES.join(', ')}
2. ${languageInstruction}
3. Example format: ${formatExample}
4. Keep each prediction brief (2-3 sentences maximum per category)
5. Be specific to the date and Rasi provided
6. Include traditional Tamil astrology terminology

Format your response as valid JSON:
{
  "predictions": {
    "Today's Overview": "prediction",
    "Career / Work": "prediction",
    "Business / Investments": "prediction",
    "Finance / Money": "prediction",
    "Health": "prediction",
    "Relationships / Love": "prediction",
    "Family": "prediction",
    "Education / Learning": "prediction",
    "Travel": "prediction",
    "Legal Matters": "prediction",
    "Lucky Numbers": "numbers separated by comma (e.g., 3, 7, 14, 28)",
    "Lucky Color": "color name",
    "Lucky Time": "time range (e.g., 10:00 AM - 12:00 PM)",
    "Remedies / Pariharam": "traditional remedies"
  }
}

CRITICAL: All predictions must follow the language format specified above (${selectedLanguage}). Make sure the JSON is valid and complete.`;

      const response = await askSimpleQuestion(prompt, selectedLanguage);
      
      try {
        // Try to parse as JSON (askSimpleQuestion returns a string)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as { predictions?: { [key: string]: string } } | { [key: string]: string };
          const predictions: { [key: string]: string } = 'predictions' in parsed && typeof parsed.predictions === 'object'
            ? (parsed.predictions ?? {})
            : (parsed as { [key: string]: string });

          setResult({
            date: formattedDate,
            rasi: selectedRasi,
            language: selectedLanguage,
            predictions: predictions || {}
          });
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        const predictions: { [key: string]: string } = {};
        DAILY_CATEGORIES.forEach((category, index) => {
          const lines = response.split('\n').filter(line => line.trim());
          predictions[category] = lines[index] || `${category}: ${response.substring(0, 100)}...`;
        });
        setResult({
          date: formattedDate,
          rasi: selectedRasi,
          language: selectedLanguage,
          predictions
        });
      }
    } catch (err) {
      console.error('Error getting daily horoscope:', err);
      setError(err instanceof Error ? err.message : 'Failed to get daily predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-heading font-bold text-primary mb-4">
            தினசரி ஜோதிடம் / Daily Horoscope
          </h1>
          <p className="text-xl text-gray-700 italic">
            Get your daily predictions based on your Rasi
          </p>
        </div>

        <div className="bg-secondary border-4 border-primary rounded-xl p-8 shadow-2xl mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Date Picker */}
              <div>
                <label className="block font-semibold mb-2 text-gray-700">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-lg"
                />
              </div>

              {/* Rasi Selector */}
              <div>
                <label className="block font-semibold mb-2 text-gray-700">
                  Select Rasi (ராசி) <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRasi}
                  onChange={(e) => setSelectedRasi(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-lg bg-white"
                >
                  {TAMIL_RASI.map((rasi) => (
                    <option key={rasi} value={rasi}>
                      {rasi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block font-semibold mb-2 text-gray-700">
                  Select Language / மொழி <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-lg bg-white"
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-heading font-bold text-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Getting Predictions...' : 'Get Daily Predictions / தினசரி ஜோதிடம்'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 rounded-xl p-6 mb-8">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        )}

        {result && !loading && (
          <div className="bg-secondary border-4 border-primary rounded-xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-heading font-bold text-primary mb-2">
                Daily Predictions / தினசரி ஜோதிடம்
              </h2>
              <p className="text-xl text-gray-700">
                <span className="font-semibold">Date:</span> {result.date}
              </p>
              <p className="text-xl text-gray-700">
                <span className="font-semibold">Rasi (ராசி):</span> {result.rasi}
              </p>
              <p className="text-xl text-gray-700">
                <span className="font-semibold">Language / மொழி:</span> {LANGUAGE_OPTIONS.find(l => l.value === result.language)?.label || result.language}
              </p>
            </div>

            <div className="space-y-6">
              {DAILY_CATEGORIES.map((category) => {
                const prediction = result.predictions[category] || 'Prediction not available';
                return (
                  <div
                    key={category}
                    className="bg-white border-2 border-accent rounded-lg p-6 shadow-lg"
                  >
                    <h3 className="text-xl font-heading font-bold text-primary mb-3 border-b-2 border-primary pb-2">
                      {category}
                    </h3>
                    <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                      {prediction}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center text-gray-600 italic">
              <p>These predictions are based on traditional Tamil astrology principles.</p>
              <p className="text-sm mt-2">Always consult a professional astrologer for important life decisions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyHoroscope;

