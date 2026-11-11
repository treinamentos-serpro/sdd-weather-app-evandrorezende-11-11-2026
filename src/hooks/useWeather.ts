import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'empty';
type Operation = { type: 'search'; name: string } | { type: 'weather'; city: City };

export function useWeather() {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const activeRequest = useRef<AbortController | null>(null);
  const lastOperation = useRef<Operation | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function run(operation: Operation) {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    lastOperation.current = operation;
    setStatus('loading');
    setError(null);
    setData(null);

    if (operation.type === 'search') {
      setQuery(operation.name);
      setCities([]);
    } else {
      setCities([]);
    }

    try {
      let city: City;
      if (operation.type === 'search') {
        const foundCities = await searchCities(operation.name, controller.signal);
        if (controller.signal.aborted) return;
        setCities(foundCities);
        if (foundCities.length === 0) {
          setStatus('empty');
          return;
        }
        city = foundCities[0];
        lastOperation.current = { type: 'weather', city };
      } else {
        city = operation.city;
      }

      const weather = await getWeather(city, controller.signal);
      if (controller.signal.aborted) return;
      setData(weather);
      setStatus('success');
    } catch (caughtError) {
      if (controller.signal.aborted) return;
      setError(
        caughtError instanceof Error ? caughtError.message : 'Não foi possível consultar o clima.',
      );
      setStatus('error');
    }
  }

  function search(name: string) {
    return run({ type: 'search', name: name.trim() });
  }

  function selectCity(city: City) {
    return run({ type: 'weather', city });
  }

  function retry() {
    if (lastOperation.current) return run(lastOperation.current);
    return Promise.resolve();
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}
