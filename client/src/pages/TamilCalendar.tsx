import { useState } from 'react';

interface CalendarDay {
  date: number;
  tamilDate: number;
  dayName: string;
  tamilDayName: string;
  nakshatra: string;
  isToday: boolean;
  isAuspicious: boolean;
}

const TAMIL_MONTHS = [
  'சித்திரை (Chithirai)',
  'வைகாசி (Vaikasi)',
  'ஆனி (Aani)',
  'ஆடி (Aadi)',
  'ஆவணி (Aavani)',
  'புரட்டாசி (Purattasi)',
  'ஐப்பசி (Aippasi)',
  'கார்த்திகை (Karthigai)',
  'மார்கழி (Margazhi)',
  'தை (Thai)',
  'மாசி (Maasi)',
  'பங்குனி (Panguni)'
];

const TAMIL_DAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TamilCalendar = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  // Get Tamil month based on English month (approximate conversion)
  const getTamilMonth = (englishMonth: number, day: number): number => {
    // Approximate mapping (actual conversion requires astronomical calculations)
    // Chithirai typically starts around April 14
    const monthMap: { [key: number]: { startDay: number; tamilMonth: number }[] } = {
      0: [{ startDay: 14, tamilMonth: 9 }], // January - Margazhi
      1: [{ startDay: 14, tamilMonth: 10 }], // February - Thai
      2: [{ startDay: 14, tamilMonth: 11 }], // March - Maasi
      3: [{ startDay: 14, tamilMonth: 0 }], // April - Chithirai
      4: [{ startDay: 14, tamilMonth: 1 }], // May - Vaikasi
      5: [{ startDay: 14, tamilMonth: 2 }], // June - Aani
      6: [{ startDay: 16, tamilMonth: 3 }], // July - Aadi
      7: [{ startDay: 16, tamilMonth: 4 }], // August - Aavani
      8: [{ startDay: 17, tamilMonth: 5 }], // September - Purattasi
      9: [{ startDay: 17, tamilMonth: 6 }], // October - Aippasi
      10: [{ startDay: 16, tamilMonth: 7 }], // November - Karthigai
      11: [{ startDay: 16, tamilMonth: 8 }], // December - Margazhi
    };

    const mapping = monthMap[englishMonth]?.[0];
    if (!mapping) return 0;
    
    return day >= mapping.startDay ? mapping.tamilMonth : (mapping.tamilMonth - 1 + 12) % 12;
  };

  const generateCalendar = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: 0,
        tamilDate: 0,
        dayName: '',
        tamilDayName: '',
        nakshatra: '',
        isToday: false,
        isAuspicious: false,
      });
    }

    for (let date = 1; date <= daysInMonth; date++) {
      const currentDate = new Date(selectedYear, selectedMonth, date);
      const dayOfWeek = currentDate.getDay();
      const tamilMonthIndex = getTamilMonth(selectedMonth, date);
      
      // Approximate Tamil date (actual calculation requires astronomical methods)
      const tamilDate = date >= 14 ? date - 13 : date + (daysInMonth - 13);
      
      const isToday = 
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      // Simple auspicious day calculation (Sundays, Tuesdays, Thursdays are generally auspicious)
      const isAuspicious = dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4;

      days.push({
        date,
        tamilDate: Math.max(1, tamilDate % 32),
        dayName: ENGLISH_DAYS[dayOfWeek],
        tamilDayName: TAMIL_DAYS[dayOfWeek],
        nakshatra: `${TAMIL_MONTHS[tamilMonthIndex].split(' ')[0]} ${tamilDate}`,
        isToday,
        isAuspicious,
      });
    }

    return days;
  };

  const calendarDays = generateCalendar();
  const currentMonthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const tamilMonthName = TAMIL_MONTHS[getTamilMonth(selectedMonth, 15)];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-heading font-bold text-primary mb-4">
            தமிழ் நாட்காட்டி / Tamil Calendar
          </h1>
          <p className="text-xl text-gray-700 italic">
            Traditional Tamil Calendar with English dates
          </p>
        </div>

        <div className="bg-secondary border-4 border-primary rounded-xl p-8 shadow-2xl">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="bg-primary text-white px-6 py-3 rounded-lg font-heading font-bold hover:bg-primary/90 transition-colors text-lg"
            >
              ← Previous
            </button>
            
            <div className="text-center">
              <h2 className="text-3xl font-heading font-bold text-primary mb-2">
                {currentMonthName}
              </h2>
              <p className="text-2xl font-heading font-semibold text-accent">
                {tamilMonthName}
              </p>
            </div>

            <button
              onClick={handleNextMonth}
              className="bg-primary text-white px-6 py-3 rounded-lg font-heading font-bold hover:bg-primary/90 transition-colors text-lg"
            >
              Next →
            </button>
          </div>

          <div className="text-center mb-4">
            <button
              onClick={handleToday}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Go to Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {TAMIL_DAYS.map((day, index) => (
              <div
                key={index}
                className="bg-primary text-white text-center py-3 font-heading font-bold text-lg rounded-lg"
              >
                <div className="text-sm">{day}</div>
                <div className="text-xs opacity-90">{ENGLISH_DAYS[index].substring(0, 3)}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[120px] p-3 rounded-lg border-2 transition-all
                  ${day.date === 0 ? 'bg-gray-100 border-transparent' : 'bg-white border-accent'}
                  ${day.isToday ? 'ring-4 ring-green-500 border-green-600 bg-green-50' : ''}
                  ${day.isAuspicious && !day.isToday ? 'border-green-400 bg-green-50/50' : ''}
                  hover:shadow-lg cursor-pointer
                `}
              >
                {day.date !== 0 && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl font-bold ${day.isToday ? 'text-green-700' : 'text-primary'}`}>
                        {day.date}
                      </span>
                      {day.isAuspicious && (
                        <span className="text-green-600 text-sm">✓</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      <div className="font-semibold">{day.tamilDayName}</div>
                      <div className="opacity-75">{day.dayName}</div>
                    </div>
                    <div className="text-xs text-accent font-semibold mt-2 pt-2 border-t border-gray-200">
                      தமிழ்: {day.tamilDate}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 grid md:grid-cols-3 gap-4 bg-white border-2 border-primary rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-50 border-2 border-green-600 rounded"></div>
              <span className="text-sm font-semibold">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-50/50 border-2 border-green-400 rounded"></div>
              <span className="text-sm font-semibold">Auspicious Day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white border-2 border-accent rounded"></div>
              <span className="text-sm font-semibold">Regular Day</span>
            </div>
          </div>

          {/* Information Box */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-400 rounded-lg p-6">
            <h3 className="text-xl font-heading font-bold text-blue-700 mb-3">
              📅 Tamil Calendar Information
            </h3>
            <div className="text-gray-700 space-y-2 text-sm">
              <p>
                <strong>தமிழ் நாட்காட்டி (Tamil Calendar):</strong> The traditional Tamil calendar follows a lunisolar system. 
                Tamil months typically start around the 14th-16th of English months.
              </p>
              <p>
                <strong>சுப தினம் (Auspicious Days):</strong> Sundays, Tuesdays, and Thursdays are generally considered auspicious 
                for starting new ventures and important activities.
              </p>
              <p>
                <strong>Note:</strong> This is a simplified representation. For accurate Tamil calendar dates, 
                please consult traditional Tamil calendar resources or professional astrologers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TamilCalendar;

