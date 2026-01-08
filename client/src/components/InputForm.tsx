import { useState } from 'react';

export interface BirthDetails {
  name: string;
  dob: string;
  time: string;
  place: string;
  gender?: string;
}

interface InputFormProps {
  onSubmit: (details: BirthDetails | { person1: BirthDetails; person2: BirthDetails }) => void;
  isCouple?: boolean;
}

const InputForm = ({ onSubmit, isCouple = false }: InputFormProps) => {
  const [person1, setPerson1] = useState<BirthDetails>({
    name: '',
    dob: '',
    time: '',
    place: '',
    gender: '',
  });

  const [person2, setPerson2] = useState<BirthDetails>({
    name: '',
    dob: '',
    time: '',
    place: '',
    gender: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCouple) {
      onSubmit({ person1, person2 });
    } else {
      onSubmit(person1);
    }
  };

  const renderPersonForm = (
    person: BirthDetails,
    setPerson: React.Dispatch<React.SetStateAction<BirthDetails>>,
    label: string
  ) => (
    <div className="bg-secondary border-2 border-primary rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-heading font-bold text-primary mb-4 border-b-2 border-accent pb-2">
        {label}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
          <input
            type="text"
            required
            value={person.name}
            onChange={(e) => setPerson({ ...person, name: e.target.value })}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter full name"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Date of Birth (DD/MM/YYYY) *</label>
          <input
            type="text"
            required
            value={person.dob}
            onChange={(e) => setPerson({ ...person, dob: e.target.value })}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="DD/MM/YYYY"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Time of Birth (HH:MM AM/PM) *</label>
          <input
            type="text"
            required
            value={person.time}
            onChange={(e) => setPerson({ ...person, time: e.target.value })}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="HH:MM AM/PM"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Place of Birth (City, State, Country) *</label>
          <input
            type="text"
            required
            value={person.place}
            onChange={(e) => setPerson({ ...person, place: e.target.value })}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="City, State, Country"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Gender (Optional)</label>
          <select
            value={person.gender || ''}
            onChange={(e) => setPerson({ ...person, gender: e.target.value })}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderPersonForm(person1, setPerson1, isCouple ? 'Person 1 (Male)' : 'Personal Details')}
      {isCouple && renderPersonForm(person2, setPerson2, 'Person 2 (Female)')}
      <button
        type="submit"
        className="w-full bg-primary text-white py-3 px-6 rounded-xl font-heading font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg"
      >
        Calculate Josiyam
      </button>
    </form>
  );
};

export default InputForm;
