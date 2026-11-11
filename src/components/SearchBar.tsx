import { type FormEvent, type Ref, useState } from 'react';
import type { City } from '../types/weather';
import EmptyState from './states/EmptyState';

interface SearchBarProps {
  inputRef?: Ref<HTMLInputElement>;
  results: City[];
  isLoading: boolean;
  message: string | null;
  onSearch: (query: string) => void;
  onSelect: (city: City) => void;
}

export default function SearchBar({
  inputRef,
  results,
  isLoading,
  message,
  onSearch,
  onSelect,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query);
  }

  return (
    <div className="relative w-full max-w-xl">
      <form
        className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-1.5 shadow-glass backdrop-blur-md transition focus-within:border-teal-200/50"
        onSubmit={handleSubmit}
        role="search"
      >
        <span aria-hidden="true" className="pl-3 text-lg text-teal-200">
          ⌕
        </span>
        <label className="sr-only" htmlFor="city-search">
          Buscar cidade
        </label>
        <input
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white placeholder:text-slate-400"
          id="city-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar cidade..."
          ref={inputRef}
          type="search"
          value={query}
        />
        <button
          className="rounded-xl bg-teal-200 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-100 disabled:cursor-wait disabled:opacity-70"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Buscando' : 'Buscar'}
        </button>
      </form>

      {(results.length > 0 || message) && (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-night-800/95 shadow-glass backdrop-blur-xl">
          {results.length > 0 ? (
            <ul aria-label="Resultados da busca" className="divide-y divide-white/[0.07]">
              {results.map((city) => (
                <li key={city.id}>
                  <button
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-white/[0.07] focus-visible:-outline-offset-4"
                    onClick={() => {
                      setQuery(city.name);
                      onSelect(city);
                    }}
                    type="button"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-slate-100">
                      {city.name}
                      <span className="ml-2 font-normal text-slate-400">
                        {city.region ? `${city.region}, ` : ''}
                        {city.country}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-teal-200">
                      ↗
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              hint="Confira a grafia ou tente buscar outra cidade."
              title={message ?? 'Nenhuma cidade encontrada.'}
            />
          )}
        </div>
      )}
    </div>
  );
}
