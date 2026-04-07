import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold text-primary mb-4">
            Smart Josiyam AI
          </h1>
          <p className="text-xl text-gray-700 italic mb-8">
            Traditional Tamil Astrology with Modern AI
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get detailed Tamil Rasi-based predictions powered by AI. 
            Everything is data-driven, not random predictions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          <Link
            to="/single-josiyam"
            className="bg-secondary border-4 border-primary rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🔮</div>
              <h2 className="text-3xl font-heading font-bold text-primary mb-4">
                Single Person Josiyam
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Get comprehensive astrology predictions for yourself. 
                Includes Rasi, Nakshatra, Dasa, and 20+ category predictions.
              </p>
              <button className="mt-6 bg-primary text-white px-8 py-3 rounded-lg font-heading font-bold hover:bg-primary/90 transition-colors">
                Get Started
              </button>
            </div>
          </Link>

          <Link
            to="/couple-josiyam"
            className="bg-secondary border-4 border-primary rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">💑</div>
              <h2 className="text-3xl font-heading font-bold text-primary mb-4">
                Couple Josiyam
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Match and compatibility analysis for couples. 
                Includes individual charts, compatibility score, and life together predictions.
              </p>
              <button className="mt-6 bg-primary text-white px-8 py-3 rounded-lg font-heading font-bold hover:bg-primary/90 transition-colors">
                Get Started
              </button>
            </div>
          </Link>
        </div>

        {/* New Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          <Link
            to="/daily-horoscope"
            className="bg-secondary border-4 border-green-600 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex flex-col justify-between"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📅</div>
              <h2 className="text-xl font-heading font-bold text-green-600 mb-3">
                Daily Horoscope / தினசரி ஜோதிடம்
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                Get your daily predictions based on your Rasi. 
                Select date and Rasi to get personalized daily horoscope for all aspects of life.
              </p>
            </div>
            <button className="mt-4 w-full bg-green-600 text-white px-6 py-2 rounded-lg font-heading font-bold hover:bg-green-700 transition-colors text-sm">
              Get Daily Plan
            </button>
          </Link>

          <Link
            to="/daily-dos-donts"
            className="bg-secondary border-4 border-blue-600 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex flex-col justify-between"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">✅❌</div>
              <h2 className="text-xl font-heading font-bold text-blue-600 mb-3">
                Do's & Don'ts / செய்ய வேண்டியவை
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                Know what to do and what to avoid today based on your Rasi. 
                Get daily guidance with actionable do's and don'ts.
              </p>
            </div>
            <button className="mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-heading font-bold hover:bg-blue-700 transition-colors text-sm">
              Get Guidance
            </button>
          </Link>

          <Link
            to="/tamil-calendar"
            className="bg-secondary border-4 border-purple-600 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex flex-col justify-between"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📆</div>
              <h2 className="text-xl font-heading font-bold text-purple-600 mb-3">
                Tamil Calendar / தமிழ் நாட்காட்டி
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                View traditional Tamil calendar with Tamil months, dates, and auspicious days. 
                Navigate through months and see Tamil dates alongside English dates.
              </p>
            </div>
            <button className="mt-4 w-full bg-purple-600 text-white px-6 py-2 rounded-lg font-heading font-bold hover:bg-purple-700 transition-colors text-sm">
              Open Calendar
            </button>
          </Link>

          <Link
            to="/calculator"
            className="bg-secondary border-4 border-accent rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex flex-col justify-between"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🧮</div>
              <h2 className="text-xl font-heading font-bold text-primary mb-3">
                Joshiyam Calculator
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                Instant astrology calculations with AI explanations. 
                Enter birth details and get immediate calculations with detailed AI-powered explanations.
              </p>
            </div>
            <button className="mt-4 w-full bg-accent text-white px-6 py-2 rounded-lg font-heading font-bold hover:bg-accent/90 transition-colors text-sm">
              Try Calculator
            </button>
          </Link>

          <Link
            to="/chat"
            className="bg-secondary border-4 border-accent rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex flex-col justify-between"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <h2 className="text-xl font-heading font-bold text-primary mb-3">
                Astrology Chat
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                Chat with AI about Tamil astrology. 
                Ask questions about Rasi, Nakshatra, Dasa, remedies, and any astrology-related topics.
              </p>
            </div>
            <button className="mt-4 w-full bg-accent text-white px-6 py-2 rounded-lg font-heading font-bold hover:bg-accent/90 transition-colors text-sm">
              Start Chatting
            </button>
          </Link>
        </div>

        <div className="mt-12 bg-secondary border-2 border-primary rounded-xl p-6 max-w-3xl mx-auto">
          <h3 className="text-2xl font-heading font-bold text-primary mb-4 text-center">
            What You'll Get
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-start space-x-2">
              <span className="text-accent text-xl">✓</span>
              <span>Basic Astrology Details (10+ fields)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-accent text-xl">✓</span>
              <span>Rasi & Nakshatra Calculations</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-accent text-xl">✓</span>
              <span>Dasa Balance & Dosham Analysis</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-accent text-xl">✓</span>
              <span>20+ Category Predictions</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-accent text-xl">✓</span>
              <span>Traditional Remedies (if needed)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-accent text-xl">✓</span>
              <span>Data-Driven Predictions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
