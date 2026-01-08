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

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
