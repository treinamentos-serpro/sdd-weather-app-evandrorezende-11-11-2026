interface WeatherDescription {
  label: string;
  icon: string;
}

const WEATHER_CODES: Record<number, WeatherDescription> = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Predomínio de sol', icon: '🌤️' },
  2: { label: 'Sol entre nuvens', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Neblina', icon: '🌫️' },
  51: { label: 'Garoa leve', icon: '🌦️' },
  61: { label: 'Chuva leve', icon: '🌧️' },
  71: { label: 'Neve', icon: '🌨️' },
  95: { label: 'Trovoadas', icon: '⛈️' },
};

export function getWeatherDescription(code: number): WeatherDescription {
  return WEATHER_CODES[code] ?? { label: 'Condição variável', icon: '🌥️' };
}