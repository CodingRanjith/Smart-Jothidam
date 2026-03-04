import { useState } from 'react';
import type { AstrologyDetails } from '../types';

type Lang = 'en' | 'ta';

const LABELS: Record<Lang, Record<string, string>> = {
  en: {
    tamilDate: 'Tamil date',
    nakshatra: 'Nakshatra',
    weekday: 'Weekday',
    tithi: 'Tithi',
    yoga: 'Yoga',
    karana: 'Karana',
    nakshatraLord: 'Nakshatra Lord',
    god: 'God',
    animalSign: 'Animal Sign',
    rasi: 'Rasi',
    rasiLord: 'Rasi Lord',
    ascendant: 'Ascendant',
    ascendantLord: 'Ascendant Lord',
    tree: 'Tree',
    ganam: 'Ganam',
    bird: 'Bird',
    yoni: 'Yoni',
    gothram: 'Gothram',
    bhutham: 'Bhutham',
    chandranPosition: 'Chandran (Moon)',
    suriyanPosition: 'Suriyan (Sun)',
    dosham: 'Dosham',
    dasaBalance: 'Dasa Balance',
    ayanamsa: 'Ayanamsa',
  },
  ta: {
    tamilDate: 'தமிழ் தேதி',
    nakshatra: 'நட்சத்திரம்',
    weekday: 'வார நாள்',
    tithi: 'திதி',
    yoga: 'யோகம்',
    karana: 'கரணம்',
    nakshatraLord: 'நட்சத்திர அதிபதி',
    god: 'தெய்வம்',
    animalSign: 'விலங்கு அடையாளம்',
    rasi: 'ராசி',
    rasiLord: 'ராசி அதிபதி',
    ascendant: 'லக்னம்',
    ascendantLord: 'லக்ன அதிபதி',
    tree: 'மரம்',
    ganam: 'கணம்',
    bird: 'பறவை',
    yoni: 'யோனி',
    gothram: 'கோத்திரம்',
    bhutham: 'பூதம்',
    chandranPosition: 'சந்திரன் நிலை',
    suriyanPosition: 'சூரியன் நிலை',
    dosham: 'தோஷம்',
    dasaBalance: 'தசை சமநிலை',
    ayanamsa: 'அயனாம்சம்',
  },
};

function getDisplayValue(details: AstrologyDetails, key: string, lang: Lang): string {
  if (key === 'ascendant') {
    return lang === 'en' && details.lagnamEnglish ? details.lagnamEnglish : (details.lagnam || '—');
  }
  const val = (details as Record<string, string | undefined>)[key];
  if (val == null || val === '') return '—';
  if (val.includes(' / ')) {
    const [en, ta] = val.split(' / ');
    return lang === 'ta' ? (ta || en) : (en || ta);
  }
  if (key === 'rasi' && lang === 'en' && details.rasiEnglish) return details.rasiEnglish;
  if (key === 'nakshatra' && lang === 'en' && details.nakshatraEnglish) return details.nakshatraEnglish;
  if (key === 'lagnam' && lang === 'en' && details.lagnamEnglish) return details.lagnamEnglish;
  if (key === 'rasiLord' && lang === 'en' && details.rasiLordEnglish) return details.rasiLordEnglish;
  if (key === 'nakshatraLord' && lang === 'en' && details.nakshatraLordEnglish) return details.nakshatraLordEnglish;
  if (key === 'ascendantLord' && lang === 'en' && details.ascendantLordEnglish) return details.ascendantLordEnglish;
  if (key === 'weekday' && lang === 'ta' && details.weekdayTamil) return details.weekdayTamil;
  if (key === 'weekday' && lang === 'en') return details.weekday || val;
  return val;
}

interface ViewMoreDetailsProps {
  name: string;
  details: AstrologyDetails;
  defaultExpanded?: boolean;
}

const ViewMoreDetails = ({ name, details, defaultExpanded = false }: ViewMoreDetailsProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [lang, setLang] = useState<Lang>('en');

  const rows: { key: string; value?: string }[] = [
    { key: 'tamilDate', value: details.tamilDate },
    { key: 'nakshatra', value: details.nakshatra ? `${details.nakshatra} ${details.nakshatraPaatham || ''} Pada` : undefined },
    { key: 'weekday', value: details.weekday || details.weekdayTamil },
    { key: 'tithi', value: details.tithi },
    { key: 'yoga', value: details.yoga },
    { key: 'karana', value: details.karana },
    { key: 'nakshatraLord', value: details.nakshatraLord },
    { key: 'god', value: details.god },
    { key: 'animalSign', value: details.animalSign },
    { key: 'rasi', value: details.rasi },
    { key: 'rasiLord', value: details.rasiLord },
    { key: 'ascendant', value: details.lagnam },
    { key: 'ascendantLord', value: details.ascendantLord },
    { key: 'tree', value: details.tree },
    { key: 'ganam', value: details.ganam },
    { key: 'bird', value: details.bird },
    { key: 'yoni', value: details.yoni },
    { key: 'gothram', value: details.gothram },
    { key: 'bhutham', value: details.bhutham },
    { key: 'chandranPosition', value: details.chandranPosition },
    { key: 'suriyanPosition', value: details.suriyanPosition },
    { key: 'dosham', value: details.dosham },
    { key: 'dasaBalance', value: details.dasaBalance },
    { key: 'ayanamsa', value: details.ayanamsa },
  ].filter((r) => r.value != null && r.value !== '');

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 border-2 border-primary/30 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left font-heading font-bold text-primary bg-accent/20 hover:bg-accent/30 transition-colors"
      >
        <span>
          {expanded ? '▼ ' : '▶ '}
          {lang === 'ta' ? 'மேலும் விவரங்கள்' : 'View more details'}
        </span>
      </button>
      {expanded && (
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${lang === 'en' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('ta')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${lang === 'ta' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              தமிழ்
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {lang === 'ta'
              ? `பிறந்த தேதி தொடர்பான மற்ற சோதிடத் தகவல்கள் — ${name}`
              : `Other astrological information about the date of birth — ${name}`}
          </p>
          <div className="border border-primary/20 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {rows.map(({ key }) => {
                  const label = LABELS[lang][key] || key;
                  let value = getDisplayValue(details, key, lang);
                  if (key === 'nakshatra' && details.nakshatraPaatham) {
                    value = `${value} ${details.nakshatraPaatham} ${lang === 'ta' ? 'பாதம்' : 'Pada'}`;
                  }
                  return (
                    <tr key={key} className="border-b border-primary/10 hover:bg-primary/5">
                      <td className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 align-top w-1/3">{label}</td>
                      <td className="py-2 px-3 text-primary font-medium">{value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMoreDetails;
