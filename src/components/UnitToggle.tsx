import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const UNITS: { value: Unit; label: string }[] = [
  { value: 'celsius', label: '°C' },
  { value: 'fahrenheit', label: '°F' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex shrink-0 rounded-xl border border-white/10 bg-white/[0.05] p-1"
      role="group"
    >
      {UNITS.map((option) => (
        <button
          aria-pressed={unit === option.value}
          className={`min-w-10 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${
            unit === option.value
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}