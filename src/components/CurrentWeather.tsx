import { formatLongDate } from '../lib/format';
import { formatTemperature, unitLabel } from '../lib/temperature';
import { getWeatherDescription } from '../lib/weatherCodes';
import type { Unit, WeatherData } from '../types/weather';

interface CurrentWeatherProps {
  weather: WeatherData;
  unit: Unit;
}

export default function CurrentWeather({ weather, unit }: CurrentWeatherProps) {
  const condition = getWeatherDescription(weather.current.weatherCode);
  const today = formatLongDate(new Date());

  return (
    <section
      aria-labelledby="current-weather-title"
      className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5 shadow-glass backdrop-blur-xl sm:p-8 lg:p-10"
    >
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
            Agora · {today}
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl" id="current-weather-title">
            {weather.city.name}
            <span className="ml-2 text-lg font-normal text-slate-400 sm:text-xl">
              {weather.city.region ? `${weather.city.region}, ` : ''}{weather.city.country}
            </span>
          </h1>

          <div className="mt-5 flex items-center gap-4 sm:gap-6">
            <span aria-label={condition.label} className="text-6xl sm:text-7xl" role="img">
              {condition.icon}
            </span>
            <div>
              <p className="text-6xl font-light leading-none tracking-tight text-white sm:text-7xl">
                {formatTemperature(weather.current.temperature, unit)}
                <span className="ml-1 align-top text-2xl font-normal text-slate-300">{unitLabel(unit)}</span>
              </p>
              <p className="mt-3 text-base text-slate-300">{condition.label}</p>
              {weather.current.feelsLike !== undefined && (
                <p className="mt-1 text-sm text-slate-400">
                  Sensação de {formatTemperature(weather.current.feelsLike, unit)}
                </p>
              )}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-3 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          {weather.current.humidity !== undefined && <div>
            <dt className="text-xs text-slate-400">Umidade</dt>
            <dd className="mt-1 text-lg font-medium text-white">{weather.current.humidity}%</dd>
          </div>}
          {weather.current.windSpeed !== undefined && <div>
            <dt className="text-xs text-slate-400">Vento</dt>
            <dd className="mt-1 text-lg font-medium text-white">{weather.current.windSpeed} <span className="text-xs font-normal text-slate-400">km/h</span></dd>
          </div>}
          {weather.current.pressure !== undefined && <div>
            <dt className="text-xs text-slate-400">Pressão</dt>
            <dd className="mt-1 text-lg font-medium text-white">{weather.current.pressure} <span className="text-xs font-normal text-slate-400">hPa</span></dd>
          </div>}
        </dl>
      </div>
    </section>
  );
}