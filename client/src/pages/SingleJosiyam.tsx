import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputForm from '../components/InputForm';
import type { BirthDetails } from '../components/InputForm';
import Loader from '../components/Loader';
import { getSinglePersonJosiyam } from '../services/groqApi';

const SingleJosiyam = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.initialData as BirthDetails | undefined;

  const handleSubmit = async (details: BirthDetails | { person1: BirthDetails; person2: BirthDetails }) => {
    if ('name' in details) {
      setLoading(true);
      try {
        const result = await getSinglePersonJosiyam(details);
        navigate('/result', { 
          state: { 
            type: 'single',
            result,
            personName: details.name,
            birthDetails: details,
          } 
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container mx-auto px-4 py-12">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4 text-center">
            Single Person Josiyam
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Enter your birth details to get comprehensive Tamil astrology predictions
          </p>
          <InputForm onSubmit={handleSubmit} isCouple={false} initialData={initialData} />
        </div>
      </div>
    </div>
  );
};

export default SingleJosiyam;
