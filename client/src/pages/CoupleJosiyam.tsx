import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputForm from '../components/InputForm';
import type { BirthDetails } from '../components/InputForm';
import Loader from '../components/Loader';
import { getCoupleJosiyam } from '../services/groqApi';

const CoupleJosiyam = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.initialData as { person1: BirthDetails; person2: BirthDetails } | undefined;

  const handleSubmit = async (details: BirthDetails | { person1: BirthDetails; person2: BirthDetails }) => {
    if ('person1' in details) {
      setLoading(true);
      try {
        const result = await getCoupleJosiyam(details.person1, details.person2);
        navigate('/result', { 
          state: { 
            type: 'couple',
            result,
            person1Name: details.person1.name,
            person2Name: details.person2.name,
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4 text-center">
            Couple Josiyam (Match / Life Together)
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Enter both persons' birth details for compatibility analysis and life together predictions
          </p>
          <InputForm onSubmit={handleSubmit} isCouple={true} initialData={initialData} />
        </div>
      </div>
    </div>
  );
};

export default CoupleJosiyam;
