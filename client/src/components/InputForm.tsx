import { useState } from 'react';

export interface BirthDetails {
  name: string;
  dob: string;
  time: string;
  place: string;
  gender?: string;
}

// Major cities list (focusing on Indian cities for Tamil astrology)
const MAJOR_CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
  'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Hosur',
  'Nagercoil', 'Kanchipuram', 'Karaikudi', 'Udhagamandalam', 'Cuddalore',
  'Bangalore', 'Mumbai', 'Delhi', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar',
  'Amritsar', 'Noida', 'Ranchi', 'Chandigarh', 'Jabalpur', 'Gwalior',
  'Jodhpur', 'Raipur', 'Kota', 'Guwahati', 'Thiruvananthapuram', 'Kochi',
  'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Gulbarga', 'Davangere',
  'Other'
];

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
          <label className="block text-gray-700 font-semibold mb-2">Date of Birth *</label>
          <input
            type="date"
            required
            value={person.dob ? (() => {
              // Convert DD/MM/YYYY to YYYY-MM-DD for date input
              const parts = person.dob.split('/');
              if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
              return person.dob.includes('-') ? person.dob : '';
            })() : ''}
            onChange={(e) => {
              const dateValue = e.target.value;
              // Convert YYYY-MM-DD to DD/MM/YYYY format for storage
              if (dateValue) {
                const [year, month, day] = dateValue.split('-');
                const formattedDate = `${day}/${month}/${year}`;
                setPerson({ ...person, dob: formattedDate });
              } else {
                setPerson({ ...person, dob: '' });
              }
            }}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Time of Birth *</label>
          <input
            type="time"
            required
            value={person.time ? (() => {
              // Convert HH:MM AM/PM to 24-hour format for time input
              const match = person.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
              if (match) {
                let hour24 = parseInt(match[1], 10);
                const minutes = match[2];
                const ampm = match[3].toUpperCase();
                if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
                if (ampm === 'AM' && hour24 === 12) hour24 = 0;
                return `${hour24.toString().padStart(2, '0')}:${minutes}`;
              }
              // If already in 24-hour format, return as is
              return person.time.includes('AM') || person.time.includes('PM') ? '' : person.time;
            })() : ''}
            onChange={(e) => {
              const timeValue = e.target.value;
              // Convert 24-hour format to 12-hour format with AM/PM
              if (timeValue) {
                const [hours, minutes] = timeValue.split(':');
                const hour24 = parseInt(hours, 10);
                const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                const formattedTime = `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                setPerson({ ...person, time: formattedTime });
              } else {
                setPerson({ ...person, time: '' });
              }
            }}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Place of Birth (City) *</label>
          <select
            required
            value={person.place}
            onChange={(e) => setPerson({ ...person, place: e.target.value })}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select City</option>
            {MAJOR_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
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
