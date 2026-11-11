import type { City, WeatherData } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

async function fetchWithTimeout<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 10_000);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  if (signal?.aborted) controller.abort();

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok)
      throw new WeatherServiceError('Não foi possível consultar os dados meteorológicos.');
    const data: T = await response.json();
    return data;
  } catch (error) {
    if (timedOut) throw new WeatherServiceError('A requisição demorou demais.');
    if (signal?.aborted) throw error;
    if (error instanceof WeatherServiceError) throw error;
    if (error instanceof SyntaxError) {
      throw new WeatherServiceError('A resposta meteorológica é inválida.');
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

interface GeocodingResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface ForecastResponse {
  current?: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    relative_humidity_2m?: number | null;
    wind_speed_10m?: number | null;
    surface_pressure?: number | null;
    precipitation?: number | null;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_min?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
  };
}

function isValidForecastDate(date: unknown): boolean {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const data = await fetchWithTimeout<{ results?: GeocodingResult[] } | null>(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`,
    signal,
  );
  if (
    !data ||
    (data.results !== undefined && !Array.isArray(data.results)) ||
    data.results?.some(
      (city) =>
        !city ||
        typeof city.id !== 'number' ||
        typeof city.name !== 'string' ||
        !Number.isFinite(city.latitude) ||
        !Number.isFinite(city.longitude) ||
        (city.country !== undefined && typeof city.country !== 'string') ||
        (city.admin1 !== undefined && typeof city.admin1 !== 'string'),
    )
  ) {
    throw new WeatherServiceError('A resposta da busca de cidades é inválida.');
  }
  return (data.results ?? []).map((city) => ({
    id: String(city.id),
    name: city.name,
    country: city.country ?? '',
    region: city.admin1,
    latitude: city.latitude,
    longitude: city.longitude,
  }));
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  });
  const data = await fetchWithTimeout<ForecastResponse | null>(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  );
  const current = data?.current;
  const daily = data?.daily;
  if (
    !current ||
    !daily ||
    typeof current.temperature_2m !== 'number' ||
    typeof current.weather_code !== 'number' ||
    typeof current.time !== 'string' ||
    !Array.isArray(daily.time) ||
    !Array.isArray(daily.weather_code) ||
    daily.time.some(
      (date, index) => !isValidForecastDate(date) || typeof daily.weather_code[index] !== 'number',
    )
  ) {
    throw new WeatherServiceError('A resposta meteorológica está incompleta.');
  }

  return {
    city,
    current: {
      temperature: current.temperature_2m,
      time: current.time,
      weatherCode: current.weather_code,
      humidity: current.relative_humidity_2m ?? undefined,
      windSpeed: current.wind_speed_10m ?? undefined,
      pressure: current.surface_pressure ?? undefined,
      precipitation: current.precipitation ?? undefined,
    },
    forecast: daily.time.slice(0, 5).map((date, index) => ({
      date,
      weatherCode: daily.weather_code[index],
      min: daily.temperature_2m_min?.[index] ?? undefined,
      max: daily.temperature_2m_max?.[index] ?? undefined,
      precipitationProbability: daily.precipitation_probability_max?.[index] ?? undefined,
    })),
  };
}
