interface PersonCardProps {
  name: string;
  details: {
    rasi?: string;
    nakshatra?: string;
    nakshatraPaatham?: string;
    lagnam?: string;
    chandranPosition?: string;
    suriyanPosition?: string;
    dosham?: string;
    dasaBalance?: string;
    rasiLord?: string;
    nakshatraLord?: string;
  };
}

const PersonCard = ({ name, details }: PersonCardProps) => {
  const fields = [
    { label: 'Rasi (ராசி)', value: details.rasi },
    { label: 'Nakshatra (நட்சத்திரம்)', value: details.nakshatra },
    { label: 'Nakshatra Paatham', value: details.nakshatraPaatham },
    { label: 'Lagnam (லக்னம்)', value: details.lagnam },
    { label: 'Chandran Position', value: details.chandranPosition },
    { label: 'Suriyan Position', value: details.suriyanPosition },
    { label: 'Dosham Presence', value: details.dosham },
    { label: 'Dasa Balance', value: details.dasaBalance },
    { label: 'Rasi Lord (அதிபதி)', value: details.rasiLord },
    { label: 'Nakshatra Lord', value: details.nakshatraLord },
  ];

  return (
    <div className="bg-secondary border-2 border-primary rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-heading font-bold text-primary mb-4 border-b-2 border-accent pb-2">
        {name}
      </h2>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-primary/20">
            <span className="font-semibold text-gray-700">{field.label}:</span>
            <span className="text-primary font-medium">{field.value || 'Calculating...'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonCard;
