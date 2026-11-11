import { formatForecastDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
  isToday?: boolean;
}

export default function ForecastCard({ day, unit, isToday = false }: ForecastCardProps) {
  const date = formatForecastDate(day.date);
  const condition = getWeatherDescription(day.weatherCode);

  return (
    <li className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-4 text-center transition hover:border-teal-200/25 hover:bg-white/[0.07] sm:px-4">
      <p
        className={`text-xs font-semibold uppercase ${isToday ? 'text-teal-200' : 'text-slate-400'}`}
      >
        {isToday ? 'Hoje' : date.weekday}
      </p>
      <p className="mt-1 text-[11px] text-slate-500">{date.day}</p>
      <span aria-label={condition.label} className="my-3 block text-3xl" role="img">
        {condition.icon}
      </span>
      <p className="truncate text-xs text-slate-300">{condition.label}</p>
      <div className="mt-3 flex justify-center gap-2 text-sm font-medium">
        {day.max !== undefined && (
          <span className="text-white">{formatTemperature(day.max, unit)}</span>
        )}
        {day.min !== undefined && (
          <span className="text-slate-500">{formatTemperature(day.min, unit)}</span>
        )}
      </div>
      {day.precipitationProbability !== undefined && (
        <p className="mt-2 text-[11px] text-slate-500">Chuva {day.precipitationProbability}%</p>
      )}
    </li>
  );
}
