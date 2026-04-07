import { useState, useRef, useEffect } from 'react';

export interface BirthDetails {
  name: string;
  dob: string;
  time: string;
  place: string;
  gender?: string;
  language?: string;
}

// City data with state and country information
interface CityData {
  name: string;
  state: string;
  country: string;
}

const CITIES_DATA: CityData[] = [
  // Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  { name: 'Coimbatore', state: 'Tamil Nadu', country: 'India' },
  { name: 'Madurai', state: 'Tamil Nadu', country: 'India' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India' },
  { name: 'Salem', state: 'Tamil Nadu', country: 'India' },
  { name: 'Tirunelveli', state: 'Tamil Nadu', country: 'India' },
  { name: 'Erode', state: 'Tamil Nadu', country: 'India' },
  { name: 'Vellore', state: 'Tamil Nadu', country: 'India' },
  { name: 'Thoothukudi', state: 'Tamil Nadu', country: 'India' },
  { name: 'Dindigul', state: 'Tamil Nadu', country: 'India' },
  { name: 'Thanjavur', state: 'Tamil Nadu', country: 'India' },
  { name: 'Hosur', state: 'Tamil Nadu', country: 'India' },
  { name: 'Nagercoil', state: 'Tamil Nadu', country: 'India' },
  { name: 'Kanchipuram', state: 'Tamil Nadu', country: 'India' },
  { name: 'Karaikudi', state: 'Tamil Nadu', country: 'India' },
  { name: 'Udhagamandalam', state: 'Tamil Nadu', country: 'India' },
  { name: 'Cuddalore', state: 'Tamil Nadu', country: 'India' },
  { name: 'Tirupattur', state: 'Tamil Nadu', country: 'India' },
  { name: 'Tirupur', state: 'Tamil Nadu', country: 'India' },
  { name: 'Tirupparangunram', state: 'Tamil Nadu', country: 'India' },
  
  // Andhra Pradesh
  { name: 'Tirupati', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Tirupati NMA', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Guntur', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Nellore', state: 'Andhra Pradesh', country: 'India' },
  
  // Karnataka
  { name: 'Bangalore', state: 'Karnataka', country: 'India' },
  { name: 'Mysore', state: 'Karnataka', country: 'India' },
  { name: 'Mangalore', state: 'Karnataka', country: 'India' },
  { name: 'Hubli', state: 'Karnataka', country: 'India' },
  { name: 'Belgaum', state: 'Karnataka', country: 'India' },
  { name: 'Gulbarga', state: 'Karnataka', country: 'India' },
  { name: 'Davangere', state: 'Karnataka', country: 'India' },
  
  // Kerala
  { name: 'Thiruvananthapuram', state: 'Kerala', country: 'India' },
  { name: 'Kochi', state: 'Kerala', country: 'India' },
  { name: 'Kozhikode', state: 'Kerala', country: 'India' },
  { name: 'Thrissur', state: 'Kerala', country: 'India' },
  
  // Other Major Indian Cities
  { name: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { name: 'Pune', state: 'Maharashtra', country: 'India' },
  { name: 'Nagpur', state: 'Maharashtra', country: 'India' },
  { name: 'Nashik', state: 'Maharashtra', country: 'India' },
  { name: 'Delhi', state: 'Delhi', country: 'India' },
  { name: 'Kolkata', state: 'West Bengal', country: 'India' },
  { name: 'Hyderabad', state: 'Telangana', country: 'India' },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  { name: 'Surat', state: 'Gujarat', country: 'India' },
  { name: 'Rajkot', state: 'Gujarat', country: 'India' },
  { name: 'Jaipur', state: 'Rajasthan', country: 'India' },
  { name: 'Jodhpur', state: 'Rajasthan', country: 'India' },
  { name: 'Kota', state: 'Rajasthan', country: 'India' },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Kanpur', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Agra', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Varanasi', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Allahabad', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Indore', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Bhopal', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Gwalior', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Patna', state: 'Bihar', country: 'India' },
  { name: 'Vadodara', state: 'Gujarat', country: 'India' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Ludhiana', state: 'Punjab', country: 'India' },
  { name: 'Amritsar', state: 'Punjab', country: 'India' },
  { name: 'Noida', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Ranchi', state: 'Jharkhand', country: 'India' },
  { name: 'Chandigarh', state: 'Chandigarh', country: 'India' },
  { name: 'Raipur', state: 'Chhattisgarh', country: 'India' },
  { name: 'Guwahati', state: 'Assam', country: 'India' },
  { name: 'Srinagar', state: 'Jammu and Kashmir', country: 'India' },
  { name: 'Thane', state: 'Maharashtra', country: 'India' },
  { name: 'Faridabad', state: 'Haryana', country: 'India' },
  { name: 'Meerut', state: 'Uttar Pradesh', country: 'India' },
];

interface InputFormProps {
  onSubmit: (details: BirthDetails | { person1: BirthDetails; person2: BirthDetails }) => void;
  isCouple?: boolean;
  initialData?: BirthDetails | { person1: BirthDetails; person2: BirthDetails };
}

// Place Autocomplete Component
interface PlaceAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  dataError?: string;
}

const PlaceAutocomplete = ({ label, value, onChange, error, required, dataError }: PlaceAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<CityData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter cities based on input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);
    onChange(input);

    if (input.length > 0) {
      const filtered = CITIES_DATA.filter(city =>
        city.name.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (city: CityData) => {
    setInputValue(city.name);
    onChange(city.name);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div>
      <label className={`block font-semibold mb-2 ${error || isFocused ? 'text-red-500' : 'text-gray-700'}`}>
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          required={required}
          data-error={dataError}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (inputValue.length > 0) {
              const filtered = CITIES_DATA.filter(city =>
                city.name.toLowerCase().includes(inputValue.toLowerCase())
              ).slice(0, 10);
              setSuggestions(filtered);
              if (filtered.length > 0) {
                setShowSuggestions(true);
              }
            }
          }}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }, 200);
          }}
          className={`w-full px-4 py-2 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 ${
            error || isFocused
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
          }`}
          placeholder="Enter Place Name..."
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              onChange('');
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl font-bold leading-none w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            ×
          </button>
        )}
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
            style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
          >
            {suggestions.map((city, index) => (
              <button
                key={`${city.name}-${city.state}-${index}`}
                type="button"
                onClick={() => selectSuggestion(city)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center gap-3 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                {/* India Flag Emoji */}
                <span className="text-xl flex-shrink-0" style={{ fontSize: '20px' }}>🇮🇳</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate text-sm">{city.name}</div>
                  <div className="text-xs text-gray-500 truncate">{city.state}, {city.country}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

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
      language: 'English',
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
      language: 'English',
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

  // Validate time format HH:MM:SS AM/PM or HH:MM AM/PM
  const validateTime = (timeStr: string): { valid: boolean; error?: string } => {
    if (!timeStr || timeStr.trim() === '') {
      return { valid: false, error: 'Time of birth is required' };
    }

    // Check format HH:MM:SS AM/PM or HH:MM AM/PM
    const timePattern = /^(\d{1,2}):(\d{2})(:(\d{2}))?\s*(AM|PM)$/i;
    const match = timeStr.match(timePattern);
    
    if (!match) {
      return { valid: false, error: 'Time must be in HH:MM:SS AM/PM format (e.g., 10:30:45 AM)' };
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[4] ? parseInt(match[4], 10) : 0;

    // Check valid ranges
    if (hours < 1 || hours > 12) {
      return { valid: false, error: 'Hour must be between 1 and 12' };
    }
    if (minutes < 0 || minutes > 59) {
      return { valid: false, error: 'Minutes must be between 0 and 59' };
    }
    if (seconds < 0 || seconds > 59) {
      return { valid: false, error: 'Seconds must be between 0 and 59' };
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

  // Generate arrays for dropdowns
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 150 }, (_, i) => currentYear - i); // 150 years back
  const months = [
    { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' }
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const renderPersonForm = (
    person: BirthDetails,
    setPerson: React.Dispatch<React.SetStateAction<BirthDetails>>,
    label: string,
    personIndex: number = 1
  ) => {
    const prefix = personIndex === 1 ? 'person1' : 'person2';
    
    // Parse date
    const dobParts = person.dob ? person.dob.split('/') : ['', '', ''];
    const selectedDay = dobParts[0] || '';
    const selectedMonth = dobParts[1] || '';
    const selectedYear = dobParts[2] || '';

    // Parse time (handle both HH:MM:SS and HH:MM formats)
    const timeMatch = person.time?.match(/^(\d{1,2}):(\d{2})(:(\d{2}))?\s*(AM|PM)/i);
    const selectedHour = timeMatch ? timeMatch[1] : '';
    const selectedMinute = timeMatch ? timeMatch[2] : '';
    const selectedAmPm = timeMatch ? timeMatch[5]?.toUpperCase() : 'AM';
    
    return (
    <div className="bg-secondary border-2 border-primary rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-heading font-bold text-primary mb-4 border-b-2 border-accent pb-2">
        {label}
      </h3>
      <div className="space-y-4">
        {/* Name with Clear Button */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Name *</label>
          <div className="relative">
            <input
              type="text"
              required
              data-error={`${prefix}_name`}
              value={person.name}
              onChange={(e) => {
                setPerson({ ...person, name: e.target.value });
                if (errors[`${prefix}_name`]) {
                  const newErrors = { ...errors };
                  delete newErrors[`${prefix}_name`];
                  setErrors(newErrors);
                }
              }}
              className={`w-full px-4 py-2 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors[`${prefix}_name`] 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-primary focus:ring-accent'
              }`}
              placeholder="Enter full name"
            />
            {person.name && (
              <button
                type="button"
                onClick={() => {
                  setPerson({ ...person, name: '' });
                  if (errors[`${prefix}_name`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_name`];
                    setErrors(newErrors);
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            )}
          </div>
          {errors[`${prefix}_name`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_name`]}</p>
          )}
        </div>
        {/* Gender - Radio Buttons */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Gender *</label>
          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`${prefix}_gender`}
                value="Male"
                checked={person.gender === 'Male'}
                onChange={(e) => {
                  setPerson({ ...person, gender: e.target.value });
                  if (errors[`${prefix}_gender`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_gender`];
                    setErrors(newErrors);
                  }
                }}
                className="w-4 h-4 text-primary focus:ring-primary border-primary"
              />
              <span className="text-gray-700">Male</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`${prefix}_gender`}
                value="Female"
                checked={person.gender === 'Female'}
                onChange={(e) => {
                  setPerson({ ...person, gender: e.target.value });
                  if (errors[`${prefix}_gender`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_gender`];
                    setErrors(newErrors);
                  }
                }}
                className="w-4 h-4 text-primary focus:ring-primary border-primary"
              />
              <span className="text-gray-700">Female</span>
            </label>
          </div>
        </div>

        {/* Birth Date - Separate Dropdowns */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Birth Date *</label>
          <div className="flex gap-2">
            {/* Year Dropdown */}
            <div className="flex-1">
              <select
                required
                data-error={`${prefix}_dob`}
                value={selectedYear}
                onChange={(e) => {
                  const year = e.target.value;
                  const day = selectedDay || '01';
                  const month = selectedMonth || '01';
                  const formattedDate = `${day}/${month}/${year}`;
                  setPerson({ ...person, dob: formattedDate });
                  if (errors[`${prefix}_dob`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_dob`];
                    setErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white appearance-none ${
                  errors[`${prefix}_dob`] 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-primary focus:ring-accent'
                }`}
              >
                <option value="">Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {/* Month Dropdown */}
            <div className="flex-1">
              <select
                required
                value={selectedMonth}
                onChange={(e) => {
                  const month = e.target.value;
                  const day = selectedDay || '01';
                  const year = selectedYear || currentYear.toString();
                  const formattedDate = `${day}/${month}/${year}`;
                  setPerson({ ...person, dob: formattedDate });
                  if (errors[`${prefix}_dob`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_dob`];
                    setErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white appearance-none ${
                  errors[`${prefix}_dob`] 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-primary focus:ring-accent'
                }`}
              >
                <option value="">Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            {/* Day Dropdown */}
            <div className="flex-1">
              <select
                required
                value={selectedDay}
                onChange={(e) => {
                  const day = e.target.value.padStart(2, '0');
                  const month = selectedMonth || '01';
                  const year = selectedYear || currentYear.toString();
                  const formattedDate = `${day}/${month}/${year}`;
                  setPerson({ ...person, dob: formattedDate });
                  if (errors[`${prefix}_dob`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_dob`];
                    setErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white appearance-none ${
                  errors[`${prefix}_dob`] 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-primary focus:ring-accent'
                }`}
              >
                <option value="">Day</option>
                {days.map((day) => (
                  <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
                ))}
              </select>
            </div>
          </div>
          {errors[`${prefix}_dob`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_dob`]}</p>
          )}
        </div>
        {/* Birth Time - Separate Dropdowns */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Birth Time *</label>
          <div className="flex gap-2">
            {/* Hour Dropdown */}
            <div className="flex-1">
              <select
                required
                data-error={`${prefix}_time`}
                value={selectedHour ? selectedHour.padStart(2, '0') : ''}
                onChange={(e) => {
                  const hour = e.target.value || '12';
                  const minute = selectedMinute || '00';
                  const ampm = selectedAmPm || 'AM';
                  setPerson({ ...person, time: `${hour.padStart(2, '0')}:${minute}:00 ${ampm}` });
                  if (errors[`${prefix}_time`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_time`];
                    setErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white appearance-none ${
                  errors[`${prefix}_time`] 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-primary focus:ring-accent'
                }`}
              >
                <option value="">Hour</option>
                {hours.map((hour) => (
                  <option key={hour} value={hour.toString().padStart(2, '0')}>{hour.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
            {/* Minute Dropdown */}
            <div className="flex-1">
              <select
                required
                value={selectedMinute ? selectedMinute.padStart(2, '0') : ''}
                onChange={(e) => {
                  const minute = e.target.value || '00';
                  const hour = selectedHour || '12';
                  const ampm = selectedAmPm || 'AM';
                  setPerson({ ...person, time: `${hour.padStart(2, '0')}:${minute}:00 ${ampm}` });
                  if (errors[`${prefix}_time`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_time`];
                    setErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white appearance-none ${
                  errors[`${prefix}_time`] 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-primary focus:ring-accent'
                }`}
              >
                <option value="">Minute</option>
                {minutes.map((minute) => (
                  <option key={minute} value={minute.toString().padStart(2, '0')}>{minute.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
            {/* AM/PM Dropdown */}
            <div className="flex-1">
              <select
                required
                value={selectedAmPm}
                onChange={(e) => {
                  const ampm = e.target.value;
                  const hour = selectedHour || '12';
                  const minute = selectedMinute || '00';
                  setPerson({ ...person, time: `${hour.padStart(2, '0')}:${minute}:00 ${ampm}` });
                  if (errors[`${prefix}_time`]) {
                    const newErrors = { ...errors };
                    delete newErrors[`${prefix}_time`];
                    setErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white appearance-none ${
                  errors[`${prefix}_time`] 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-primary focus:ring-accent'
                }`}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          {errors[`${prefix}_time`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_time`]}</p>
          )}
        </div>
        {/* Place of Birth with Autocomplete */}
        <PlaceAutocomplete
          label="Place of Birth"
          value={person.place}
          onChange={(value) => {
            setPerson({ ...person, place: value });
            if (errors[`${prefix}_place`]) {
              const newErrors = { ...errors };
              delete newErrors[`${prefix}_place`];
              setErrors(newErrors);
            }
          }}
          error={errors[`${prefix}_place`]}
          required
          dataError={`${prefix}_place`}
        />

        {/* Language Dropdown */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Language *</label>
          <select
            required
            value={person.language || 'English'}
            onChange={(e) => setPerson({ ...person, language: e.target.value })}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white appearance-none"
          >
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Tamil + English">Tamil + English</option>
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
        className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-heading font-bold text-lg hover:bg-green-700 transition-colors shadow-lg"
      >
        Generate Tamil Jathagam
      </button>
    </form>
  );
};

export default InputForm;
