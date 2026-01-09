import { useLocation, useNavigate } from 'react-router-dom';
import PersonCard from '../components/PersonCard';
import CategoryCard from '../components/CategoryCard';
import type { PredictionResult } from '../types';
import type { BirthDetails } from '../components/InputForm';

interface ResultState {
  type: 'single' | 'couple';
  result: PredictionResult;
  personName?: string;
  person1Name?: string;
  person2Name?: string;
  birthDetails?: BirthDetails | { person1: BirthDetails; person2: BirthDetails };
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

  const { type, result, personName, person1Name, person2Name, birthDetails } = state;

  const handleEdit = () => {
    if (type === 'single' && birthDetails && 'name' in birthDetails) {
      navigate('/single-josiyam', { state: { initialData: birthDetails } });
    } else if (type === 'couple' && birthDetails && 'person1' in birthDetails) {
      navigate('/couple-josiyam', { state: { initialData: birthDetails } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Your Josiyam Results
          </h1>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleEdit}
              className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition-colors font-semibold"
            >
              Edit Details
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Calculate Another
            </button>
          </div>
        </div>

        {/* Input Details Section */}
        {birthDetails && (
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6 text-center border-b-4 border-accent pb-3">
              Entered Details
            </h2>
            {type === 'single' && 'name' in birthDetails ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-secondary border-2 border-primary rounded-xl p-6 shadow-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Name:</span>
                      <span className="text-primary font-medium">{birthDetails.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Date of Birth:</span>
                      <span className="text-primary font-medium">{birthDetails.dob}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Time of Birth:</span>
                      <span className="text-primary font-medium">{birthDetails.time}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Place of Birth:</span>
                      <span className="text-primary font-medium">{birthDetails.place}</span>
                    </div>
                    {birthDetails.gender && (
                      <div className="flex justify-between items-center py-2 border-b border-primary/20">
                        <span className="font-semibold text-gray-700">Gender:</span>
                        <span className="text-primary font-medium">{birthDetails.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : type === 'couple' && 'person1' in birthDetails ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-secondary border-2 border-primary rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-heading font-bold text-primary mb-4 border-b-2 border-accent pb-2">
                    Person 1
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Name:</span>
                      <span className="text-primary font-medium">{birthDetails.person1.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Date of Birth:</span>
                      <span className="text-primary font-medium">{birthDetails.person1.dob}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Time of Birth:</span>
                      <span className="text-primary font-medium">{birthDetails.person1.time}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Place of Birth:</span>
                      <span className="text-primary font-medium">{birthDetails.person1.place}</span>
                    </div>
                    {birthDetails.person1.gender && (
                      <div className="flex justify-between items-center py-2 border-b border-primary/20">
                        <span className="font-semibold text-gray-700">Gender:</span>
                        <span className="text-primary font-medium">{birthDetails.person1.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-secondary border-2 border-primary rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-heading font-bold text-primary mb-4 border-b-2 border-accent pb-2">
                    Person 2
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Name:</span>
                      <span className="text-primary font-medium">{birthDetails.person2.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Date of Birth:</span>
                      <span className="text-primary font-medium">{birthDetails.person2.dob}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Time of Birth:</span>
                      <span className="text-primary font-medium">{birthDetails.person2.time}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/20">
                      <span className="font-semibold text-gray-700">Place of Birth:</span>
                      <span className="text-primary font-medium">{birthDetails.person2.place}</span>
                    </div>
                    {birthDetails.person2.gender && (
                      <div className="flex justify-between items-center py-2 border-b border-primary/20">
                        <span className="font-semibold text-gray-700">Gender:</span>
                        <span className="text-primary font-medium">{birthDetails.person2.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

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
