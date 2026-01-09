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
  initialData?: BirthDetails | { person1: BirthDetails; person2: BirthDetails };
}

const InputForm = ({ onSubmit, isCouple = false, initialData }: InputFormProps) => {
  const getInitialPerson1 = (): BirthDetails => {
    if (initialData) {
      if ('name' in initialData) {
        return initialData;
      } else if ('person1' in initialData) {
        return initialData.person1;
      }
    }
    return {
      name: '',
      dob: '',
      time: '',
      place: '',
      gender: '',
    };
  };

  const getInitialPerson2 = (): BirthDetails => {
    if (initialData && 'person2' in initialData) {
      return initialData.person2;
    }
    return {
      name: '',
      dob: '',
      time: '',
      place: '',
      gender: '',
    };
  };

  const [person1, setPerson1] = useState<BirthDetails>(getInitialPerson1());
  const [person2, setPerson2] = useState<BirthDetails>(getInitialPerson2());

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
          <div className="flex gap-2 items-center">
            <div className="flex-1 flex gap-2">
              <input
                type="number"
                required
                min="1"
                max="12"
                placeholder="HH"
                value={person.time ? (() => {
                  const match = person.time.match(/(\d{1,2}):/);
                  return match ? match[1] : '';
                })() : ''}
                onChange={(e) => {
                  const hour = e.target.value;
                  const match = person.time ? person.time.match(/:(\d{2})\s*(AM|PM)/i) : null;
                  const minutes = match ? match[1] : '00';
                  const ampm = match ? match[2].toUpperCase() : 'AM';
                  if (hour) {
                    setPerson({ ...person, time: `${hour.padStart(2, '0')}:${minutes} ${ampm}` });
                  } else {
                    setPerson({ ...person, time: `:${minutes} ${ampm}` });
                  }
                }}
                className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="self-center text-gray-600 font-bold">:</span>
              <input
                type="number"
                required
                min="0"
                max="59"
                placeholder="MM"
                value={person.time ? (() => {
                  const match = person.time.match(/:(\d{2})/);
                  return match ? match[1] : '';
                })() : ''}
                onChange={(e) => {
                  const minutes = e.target.value.padStart(2, '0');
                  const match = person.time ? person.time.match(/(\d{1,2}):/i) : null;
                  const hour = match ? match[1].padStart(2, '0') : '12';
                  const ampmMatch = person.time ? person.time.match(/(AM|PM)/i) : null;
                  const ampm = ampmMatch ? ampmMatch[1].toUpperCase() : 'AM';
                  setPerson({ ...person, time: `${hour}:${minutes} ${ampm}` });
                }}
                className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <select
              required
              value={person.time ? (() => {
                const match = person.time.match(/(AM|PM)/i);
                return match ? match[1].toUpperCase() : 'AM';
              })() : 'AM'}
              onChange={(e) => {
                const ampm = e.target.value;
                const match = person.time ? person.time.match(/(\d{1,2}):(\d{2})/i) : null;
                if (match) {
                  const hour = match[1].padStart(2, '0');
                  const minutes = match[2];
                  setPerson({ ...person, time: `${hour}:${minutes} ${ampm}` });
                } else {
                  setPerson({ ...person, time: `12:00 ${ampm}` });
                }
              }}
              className="px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Place of Birth (City) *</label>
          <div className="relative">
            <input
              type="text"
              required
              list={`city-list-${label.replace(/\s+/g, '-')}`}
              value={person.place}
              onChange={(e) => setPerson({ ...person, place: e.target.value })}
              className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Select or type city name"
            />
            <datalist id={`city-list-${label.replace(/\s+/g, '-')}`}>
              {MAJOR_CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
          <p className="text-xs text-gray-500 mt-1">Select from list or type your city name</p>
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
