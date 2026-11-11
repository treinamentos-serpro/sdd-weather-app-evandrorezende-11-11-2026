import { useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data: weather, cities, error, query, search, selectCity, retry } = useWeather();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const announcement =
    status === 'loading'
      ? `${cities.length > 0 ? `${cities.length} cidades encontradas. ` : ''}Carregando dados meteorológicos.`
      : status === 'success' && weather
        ? `Previsão para ${weather.city.name}, ${weather.city.country} carregada.${cities.length > 0 ? ` ${cities.length} cidades encontradas.` : ''}${weather.forecast.length < 5 ? ' Parte da previsão não está disponível.' : ''}`
        : status === 'empty'
          ? query
            ? `Busca sem resultados para ${query}.`
            : 'Informe o nome de uma cidade.'
          : '';

  return (
    <div className="min-h-screen px-4 pb-10 sm:px-6">
      <div
        aria-atomic="true"
        aria-label="Atualizações da consulta"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
      <div aria-atomic="true" className="sr-only" role="alert">
        {status === 'error'
          ? `Não foi possível carregar. ${error ?? 'Não foi possível consultar o clima.'}`
          : ''}
      </div>
      <header className="mx-auto flex max-w-6xl flex-col gap-5 border-b border-white/[0.08] py-5 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
        <a
          aria-label="WeatherView, página inicial"
          className="flex w-fit items-center gap-3"
          href="#home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-100/15 bg-teal-100/[0.08] text-xl text-teal-100">
            ☼
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-wide text-white">
              WeatherView
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-400">
              Seu tempo, em perspectiva
            </span>
          </span>
        </a>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <SearchBar
            inputRef={searchInputRef}
            isLoading={status === 'loading'}
            message={
              status === 'empty'
                ? query
                  ? `Nenhuma cidade encontrada para “${query}”.`
                  : 'Digite o nome de uma cidade para buscar.'
                : null
            }
            onSearch={(name) => {
              searchInputRef.current?.focus();
              void search(name);
            }}
            onSelect={(city) => {
              searchInputRef.current?.focus();
              void selectCity(city);
            }}
            results={cities}
          />
          <UnitToggle onChange={setUnit} unit={unit} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl pt-7 sm:pt-10" id="home">
        <div className="mb-5 flex items-center gap-2 text-xs text-slate-400">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-teal-200 shadow-[0_0_10px_rgba(103,232,209,0.65)]"
          />
          <span className="capitalize">{currentDate}</span>
          <span aria-hidden="true" className="mx-1 text-slate-600">
            /
          </span>
          <span>Dados Open-Meteo</span>
        </div>

        {status === 'error' ? (
          <ErrorState
            message={error ?? 'Não foi possível consultar o clima.'}
            onRetry={() => {
              searchInputRef.current?.focus();
              void retry();
            }}
          />
        ) : status === 'loading' ? (
          <LoadingState message="Carregando dados meteorológicos..." />
        ) : weather ? (
          <div className="space-y-8">
            <CurrentWeather unit={unit} weather={weather} />
            <ForecastList forecast={weather.forecast} unit={unit} />
          </div>
        ) : (
          <EmptyState
            hint="Busque uma cidade para consultar as condições atuais."
            title="Vamos encontrar seu clima"
          />
        )}

        <footer className="mt-10 flex flex-col gap-2 border-t border-white/[0.07] pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>WeatherView</p>
          <p>
            Dados meteorológicos:{' '}
            <a className="underline" href="https://open-meteo.com/">
              Open-Meteo
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
