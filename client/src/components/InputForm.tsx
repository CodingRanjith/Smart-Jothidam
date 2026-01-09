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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validate date format DD/MM/YYYY and check if it's a valid date
  const validateDate = (dateStr: string): { valid: boolean; error?: string } => {
    if (!dateStr || dateStr.trim() === '') {
      return { valid: false, error: 'Date of birth is required' };
    }

    // Check format DD/MM/YYYY
    const datePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateStr.match(datePattern);
    
    if (!match) {
      return { valid: false, error: 'Date must be in DD/MM/YYYY format (e.g., 15/08/1990)' };
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Check valid ranges
    if (day < 1 || day > 31) {
      return { valid: false, error: 'Day must be between 1 and 31' };
    }
    if (month < 1 || month > 12) {
      return { valid: false, error: 'Month must be between 1 and 12' };
    }
    if (year < 1900 || year > new Date().getFullYear()) {
      return { valid: false, error: `Year must be between 1900 and ${new Date().getFullYear()}` };
    }

    // Check if date is actually valid (e.g., not 32/13/2024)
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return { valid: false, error: 'Invalid date. Please check day, month, and year' };
    }

    // Check if date is not in the future
    if (date > new Date()) {
      return { valid: false, error: 'Date of birth cannot be in the future' };
    }

    return { valid: true };
  };

  // Validate time format HH:MM AM/PM
  const validateTime = (timeStr: string): { valid: boolean; error?: string } => {
    if (!timeStr || timeStr.trim() === '') {
      return { valid: false, error: 'Time of birth is required' };
    }

    // Check format HH:MM AM/PM
    const timePattern = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = timeStr.match(timePattern);
    
    if (!match) {
      return { valid: false, error: 'Time must be in HH:MM AM/PM format (e.g., 10:30 AM)' };
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    // Check valid ranges
    if (hours < 1 || hours > 12) {
      return { valid: false, error: 'Hour must be between 1 and 12' };
    }
    if (minutes < 0 || minutes > 59) {
      return { valid: false, error: 'Minutes must be between 0 and 59' };
    }

    return { valid: true };
  };

  // Validate name
  const validateName = (name: string): { valid: boolean; error?: string } => {
    if (!name || name.trim() === '') {
      return { valid: false, error: 'Name is required' };
    }
    if (name.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }
    if (name.trim().length > 100) {
      return { valid: false, error: 'Name must be less than 100 characters' };
    }
    return { valid: true };
  };

  // Validate place
  const validatePlace = (place: string): { valid: boolean; error?: string } => {
    if (!place || place.trim() === '') {
      return { valid: false, error: 'Place of birth is required' };
    }
    if (place.trim().length < 2) {
      return { valid: false, error: 'Place name must be at least 2 characters' };
    }
    if (place.trim().length > 100) {
      return { valid: false, error: 'Place name must be less than 100 characters' };
    }
    return { valid: true };
  };

  // Validate a person's details
  const validatePerson = (person: BirthDetails, prefix: string): { valid: boolean; errors: { [key: string]: string } } => {
    const personErrors: { [key: string]: string } = {};

    const nameValidation = validateName(person.name);
    if (!nameValidation.valid) {
      personErrors[`${prefix}_name`] = nameValidation.error || 'Invalid name';
    }

    const dateValidation = validateDate(person.dob);
    if (!dateValidation.valid) {
      personErrors[`${prefix}_dob`] = dateValidation.error || 'Invalid date';
    }

    const timeValidation = validateTime(person.time);
    if (!timeValidation.valid) {
      personErrors[`${prefix}_time`] = timeValidation.error || 'Invalid time';
    }

    const placeValidation = validatePlace(person.place);
    if (!placeValidation.valid) {
      personErrors[`${prefix}_place`] = placeValidation.error || 'Invalid place';
    }

    return {
      valid: Object.keys(personErrors).length === 0,
      errors: personErrors,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const person1Validation = validatePerson(person1, 'person1');
    let allErrors = { ...person1Validation.errors };

    if (isCouple) {
      const person2Validation = validatePerson(person2, 'person2');
      allErrors = { ...allErrors, ...person2Validation.errors };
    }

    // If there are errors, set them and prevent submission
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(allErrors)[0];
      const firstErrorElement = document.querySelector(`[data-error="${firstErrorKey}"]`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstErrorElement as HTMLElement).focus();
      }
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    // Submit the form
    if (isCouple) {
      onSubmit({ person1, person2 });
    } else {
      onSubmit(person1);
    }
  };

  const renderPersonForm = (
    person: BirthDetails,
    setPerson: React.Dispatch<React.SetStateAction<BirthDetails>>,
    label: string,
    personIndex: number = 1
  ) => {
    const prefix = personIndex === 1 ? 'person1' : 'person2';
    
    return (
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
            data-error={`${prefix}_name`}
            value={person.name}
            onChange={(e) => {
              setPerson({ ...person, name: e.target.value });
              // Clear error when user starts typing
              if (errors[`${prefix}_name`]) {
                const newErrors = { ...errors };
                delete newErrors[`${prefix}_name`];
                setErrors(newErrors);
              }
            }}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${
              errors[`${prefix}_name`] 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-primary focus:ring-accent'
            }`}
            placeholder="Enter full name"
          />
          {errors[`${prefix}_name`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_name`]}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Date of Birth *</label>
          <input
            type="date"
            required
            data-error={`${prefix}_dob`}
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
              // Clear error when user starts typing
              if (errors[`${prefix}_dob`]) {
                const newErrors = { ...errors };
                delete newErrors[`${prefix}_dob`];
                setErrors(newErrors);
              }
            }}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${
              errors[`${prefix}_dob`] 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-primary focus:ring-accent'
            }`}
          />
          {errors[`${prefix}_dob`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_dob`]}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Format: DD/MM/YYYY (e.g., 15/08/1990)</p>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Time of Birth *</label>
          <div className="flex gap-2 items-start">
            <div className="flex-1 relative">
              <input
                type="text"
                required
                inputMode="numeric"
                data-error={`${prefix}_time`}
                value={person.time || ''}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase().trim();
                  
                  // Remove any characters that aren't digits, colon, space, A, M, or P
                  value = value.replace(/[^0-9: AMP]/g, '');
                  
                  // Auto-format: convert "1030" to "10:30"
                  if (/^\d{3,4}$/.test(value)) {
                    if (value.length === 3) {
                      value = value.slice(0, 1) + ':' + value.slice(1);
                    } else if (value.length === 4) {
                      value = value.slice(0, 2) + ':' + value.slice(2);
                    }
                  }
                  
                  // Extract hour, minute, and AM/PM
                  const timeMatch = value.match(/(\d{1,2}):?(\d{0,2})\s*([AP]?M?)?/i);
                  
                  if (timeMatch) {
                    let hour = parseInt(timeMatch[1] || '12', 10);
                    let minute = parseInt(timeMatch[2] || '0', 10);
                    let ampm = timeMatch[3]?.toUpperCase() || '';
                    
                    // Validate hour (1-12)
                    if (hour > 12) hour = 12;
                    if (hour === 0) hour = 12;
                    
                    // Validate minute (0-59)
                    if (minute > 59) minute = 59;
                    if (isNaN(minute)) minute = 0;
                    
                    // Format hour and minute
                    const hourStr = hour.toString().padStart(2, '0');
                    const minuteStr = minute.toString().padStart(2, '0');
                    
                    // If we have complete time (HH:MM), add AM/PM if missing
                    if (timeMatch[1] && timeMatch[2] && timeMatch[2].length === 2) {
                      if (!ampm || (ampm !== 'AM' && ampm !== 'PM')) {
                        // Default to AM if not specified
                        ampm = person.time && person.time.includes('PM') ? 'PM' : 'AM';
                      }
                      setPerson({ ...person, time: `${hourStr}:${minuteStr} ${ampm}` });
                    } else {
                      // Partial input - keep as is for better UX
                      setPerson({ ...person, time: value });
                    }
                  } else {
                    // Keep partial input
                    setPerson({ ...person, time: value });
                  }
                  
                  // Clear error when user starts typing
                  if (errors[`${prefix}_time`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_time`];
                    setErrors(newErrors);
                  }
                }}
                onBlur={(e) => {
                  // Validate and format on blur
                  const timeValue = person.time || '';
                  const timeMatch = timeValue.match(/(\d{1,2}):?(\d{0,2})\s*([AP]?M?)?/i);
                  
                  if (timeMatch) {
                    let hour = parseInt(timeMatch[1] || '12', 10);
                    let minute = parseInt(timeMatch[2] || '0', 10);
                    let ampm = timeMatch[3]?.toUpperCase() || 'AM';
                    
                    // Fix hour
                    if (hour > 12) hour = 12;
                    if (hour === 0) hour = 12;
                    if (isNaN(hour)) hour = 12;
                    
                    // Fix minute
                    if (minute > 59) minute = 59;
                    if (isNaN(minute)) minute = 0;
                    
                    // Ensure AM/PM
                    if (ampm !== 'AM' && ampm !== 'PM') {
                      ampm = 'AM';
                    }
                    
                    const hourStr = hour.toString().padStart(2, '0');
                    const minuteStr = minute.toString().padStart(2, '0');
                    
                    setPerson({ ...person, time: `${hourStr}:${minuteStr} ${ampm}` });
                  } else if (timeValue.trim()) {
                    // If there's input but invalid format, try to fix it
                    const numbers = timeValue.replace(/\D/g, '');
                    if (numbers.length >= 3) {
                      const h = parseInt(numbers.slice(0, 2), 10);
                      const m = parseInt(numbers.slice(2, 4) || '0', 10);
                      const hour = (h > 12 ? 12 : (h === 0 ? 12 : h));
                      const minute = m > 59 ? 59 : m;
                      const currentAmpm = person.time?.includes('PM') ? 'PM' : 'AM';
                      setPerson({ ...person, time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${currentAmpm}` });
                    }
                  }
                }}
                placeholder="10:30 AM"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                  errors[`${prefix}_time`] 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-primary focus:ring-accent'
                }`}
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
                // Clear error when user changes AM/PM
                if (errors[`${prefix}_time`]) {
                  const newErrors = { ...errors };
                  delete newErrors[`${prefix}_time`];
                  setErrors(newErrors);
                }
              }}
              className={`px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white ${
                errors[`${prefix}_time`] 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-primary focus:ring-accent'
              }`}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          {errors[`${prefix}_time`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_time`]}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Type time like "10:30 AM" or "1030" (auto-formats)</p>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Place of Birth (City) *</label>
          <div className="relative">
            <input
              type="text"
              required
              data-error={`${prefix}_place`}
              list={`city-list-${label.replace(/\s+/g, '-')}`}
              value={person.place}
              onChange={(e) => {
                setPerson({ ...person, place: e.target.value });
                // Clear error when user starts typing
                if (errors[`${prefix}_place`]) {
                  const newErrors = { ...errors };
                  delete newErrors[`${prefix}_place`];
                  setErrors(newErrors);
                }
              }}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors[`${prefix}_place`] 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-primary focus:ring-accent'
              }`}
              placeholder="Select or type city name"
            />
            <datalist id={`city-list-${label.replace(/\s+/g, '-')}`}>
              {MAJOR_CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
          {errors[`${prefix}_place`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_place`]}</p>
          )}
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderPersonForm(person1, setPerson1, isCouple ? 'Person 1 (Male)' : 'Personal Details', 1)}
      {isCouple && renderPersonForm(person2, setPerson2, 'Person 2 (Female)', 2)}
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
