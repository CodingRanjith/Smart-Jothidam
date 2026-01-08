import { useLocation, useNavigate } from 'react-router-dom';
import PersonCard from '../components/PersonCard';
import CategoryCard from '../components/CategoryCard';
import type { PredictionResult } from '../types';

interface ResultState {
  type: 'single' | 'couple';
  result: PredictionResult;
  personName?: string;
  person1Name?: string;
  person2Name?: string;
}

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState;

  if (!state || !state.result) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600 mb-4">No result data found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { type, result, personName, person1Name, person2Name } = state;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Your Josiyam Results
          </h1>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Calculate Another
          </button>
        </div>

        {/* Basic Astrology Details Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-primary mb-6 text-center border-b-4 border-accent pb-3">
            Basic Astrology Details
          </h2>
          {type === 'single' ? (
            <div className="max-w-2xl mx-auto">
              <PersonCard
                name={personName || 'Person'}
                details={result.basicDetails || {}}
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <PersonCard
                name={person1Name || 'Person 1'}
                details={result.basicDetails?.person1 || {}}
              />
              <PersonCard
                name={person2Name || 'Person 2'}
                details={result.basicDetails?.person2 || {}}
              />
            </div>
          )}
        </div>

        {/* Category-wise Predictions Section */}
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary mb-6 text-center border-b-4 border-accent pb-3">
            Category-wise Predictions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(result.predictions || {}).map(([category, content]) => (
              <CategoryCard
                key={category}
                title={category}
                content={typeof content === 'string' ? content : JSON.stringify(content)}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-8 py-3 rounded-xl font-heading font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            Calculate Another Josiyam
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
