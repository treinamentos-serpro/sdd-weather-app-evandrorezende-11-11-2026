import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title" className="pt-1">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Próximos dias
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white" id="forecast-title">
            Previsão diária
          </h2>
        </div>
        <p className="hidden text-xs text-slate-500 sm:block">
          Máxima <span className="text-white">·</span> mínima
        </p>
      </div>
      <ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        aria-label="Previsão para os próximos cinco dias"
      >
        {forecast.map((day, index) => (
          <ForecastCard day={day} isToday={index === 0} key={day.date} unit={unit} />
        ))}
      </ul>
      {forecast.length < 5 && (
        <p className="mt-3 text-sm text-slate-400" role="status">
          Parte da previsão não está disponível.
        </p>
      )}
    </section>
  );
}
