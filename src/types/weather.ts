export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike?: number;
  weatherCode: number;
  time: string;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  precipitation?: number;
}

export interface ForecastDay {
  date: string;
  min?: number;
  max?: number;
  weatherCode: number;
  precipitationProbability?: number;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
}
