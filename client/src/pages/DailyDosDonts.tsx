import { useState } from 'react';
import Loader from '../components/Loader';
import { askSimpleQuestion } from '../services/groqApi';

interface DosDontsResult {
  date: string;
  rasi: string;
  language: string;
  dos: string[];
  donts: string[];
}

const TAMIL_RASI = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Tamil', label: 'Tamil / தமிழ்' },
  { value: 'Tamil + English', label: 'Tamil + English / தமிழ் + ஆங்கிலம்' },
  { value: 'Tanglish', label: 'Tanglish / டாங்கிளிஷ்' },
];

const DailyDosDonts = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedRasi, setSelectedRasi] = useState<string>('மேஷம்');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Tamil + English');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DosDontsResult | null>(null);
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
      
      if (selectedLanguage === 'Tamil') {
        languageInstruction = 'Write ALL items EXCLUSIVELY in TAMIL language using Tamil script. Example: "வணிகம் தொடங்குதல் நல்லது."';
      } else if (selectedLanguage === 'English') {
        languageInstruction = 'Write ALL items EXCLUSIVELY in English. Example: "Starting new business is good."';
      } else if (selectedLanguage === 'Tamil + English') {
        languageInstruction = 'Write each item in TAMIL first, then English in parentheses. Example: "வணிகம் தொடங்குதல் நல்லது (Starting new business is good)."';
      } else if (selectedLanguage === 'Tanglish') {
        languageInstruction = 'Write items in Tanglish (mixed Tamil and English). Use Tamil script for Tamil words and English for English words naturally mixed. Example: "வணிகம் start பண்ணலாம். Good results கிடைக்கும்."';
      }

      const prompt = `You are an expert Tamil astrologer (Josiyar). Provide daily guidance for Rasi: ${selectedRasi} on ${formattedDate}.

IMPORTANT INSTRUCTIONS:
1. Provide WHAT TO DO TODAY (Do's) - 8-10 specific positive actions/activities
2. Provide WHAT NOT TO DO TODAY (Don'ts) - 8-10 specific things to avoid
3. ${languageInstruction}
4. Base recommendations on traditional Tamil astrology principles for this Rasi and date
5. Include practical daily activities, auspicious timings, colors to wear, directions, etc.
6. Keep each item brief (1 sentence per item)
7. Make it specific and actionable

Format your response as valid JSON:
{
  "dos": [
    "First thing to do today",
    "Second thing to do today",
    "Third thing to do today",
    ... (8-10 items)
  ],
  "donts": [
    "First thing to avoid today",
    "Second thing to avoid today",
    "Third thing to avoid today",
    ... (8-10 items)
  ]
}

CRITICAL: All items must follow the language format specified above (${selectedLanguage}). Make sure the JSON is valid and complete. Provide 8-10 items for each section.`;

      const response = await askSimpleQuestion(prompt, selectedLanguage);
      
      try {
        // Try to parse as JSON
        let parsedData;
        if (typeof response === 'string') {
          // Extract JSON from response if it's wrapped in text
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } else {
          parsedData = response;
        }

        const dos = Array.isArray(parsedData.dos) ? parsedData.dos : [];
        const donts = Array.isArray(parsedData.donts) ? parsedData.donts : [];

        setResult({
          date: formattedDate,
          rasi: selectedRasi,
          language: selectedLanguage,
          dos: dos.length > 0 ? dos : ['Daily guidance will be available soon.'],
          donts: donts.length > 0 ? donts : ['Daily guidance will be available soon.']
        });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // If JSON parsing fails, create a structured response
        setResult({
          date: formattedDate,
          rasi: selectedRasi,
          language: selectedLanguage,
          dos: ['Daily guidance will be available soon. Please try again.'],
          donts: ['Daily guidance will be available soon. Please try again.']
        });
      }
    } catch (err) {
      console.error('Error getting daily dos and donts:', err);
      setError(err instanceof Error ? err.message : 'Failed to get daily guidance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-heading font-bold text-primary mb-4">
            நாளைய செயல்கள் / Daily Do's & Don'ts
          </h1>
          <p className="text-xl text-gray-700 italic">
            Know what to do and what to avoid today based on your Rasi
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
              {loading ? 'Getting Guidance...' : 'Get Daily Guidance / நாளைய வழிகாட்டுதல்'}
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
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-secondary border-4 border-primary rounded-xl p-6 shadow-2xl text-center">
              <h2 className="text-3xl font-heading font-bold text-primary mb-2">
                Daily Guidance / நாளைய வழிகாட்டுதல்
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

            {/* Do's Section */}
            <div className="bg-green-50 border-4 border-green-600 rounded-xl p-8 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="text-5xl mr-4">✅</div>
                <h2 className="text-3xl font-heading font-bold text-green-700">
                  What To Do Today / இன்று செய்ய வேண்டியவை
                </h2>
              </div>
              <ul className="space-y-4">
                {result.dos.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3 bg-white rounded-lg p-4 shadow-md border-l-4 border-green-600">
                    <span className="text-green-600 font-bold text-xl mt-1">{index + 1}.</span>
                    <span className="text-gray-800 leading-relaxed text-lg flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts Section */}
            <div className="bg-red-50 border-4 border-red-600 rounded-xl p-8 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="text-5xl mr-4">❌</div>
                <h2 className="text-3xl font-heading font-bold text-red-700">
                  What Not To Do Today / இன்று செய்யக் கூடாதவை
                </h2>
              </div>
              <ul className="space-y-4">
                {result.donts.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3 bg-white rounded-lg p-4 shadow-md border-l-4 border-red-600">
                    <span className="text-red-600 font-bold text-xl mt-1">{index + 1}.</span>
                    <span className="text-gray-800 leading-relaxed text-lg flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 text-center text-gray-600 italic bg-secondary border-2 border-primary rounded-xl p-6">
              <p>These recommendations are based on traditional Tamil astrology principles for your Rasi.</p>
              <p className="text-sm mt-2">Always use your judgment and consult a professional astrologer for important decisions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyDosDonts;

