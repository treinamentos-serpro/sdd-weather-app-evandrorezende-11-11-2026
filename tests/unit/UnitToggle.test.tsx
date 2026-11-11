import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastList from '../../src/components/ForecastList';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit, WeatherData } from '../../src/types/weather';

const weather: WeatherData = {
  city: { id: '1', name: 'São Paulo', country: 'Brasil', latitude: -23, longitude: -46 },
  current: {
    time: '2026-11-11T12:00',
    temperature: 0,
    feelsLike: -40,
    weatherCode: 0,
    humidity: 70,
  },
  forecast: [{ date: '2026-11-11', weatherCode: 0, min: 0, max: 100 }],
};

function WeatherWithUnit() {
  const [unit, setUnit] = useState<Unit>('celsius');
  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather weather={weather} unit={unit} />
      <ForecastList forecast={weather.forecast} unit={unit} />
    </>
  );
}

it('converte temperatura, sensação e previsão sem alterar a umidade', async () => {
  const user = userEvent.setup();
  render(<WeatherWithUnit />);
  const current = screen.getByRole('region', { name: /São Paulo/ });
  const forecast = screen.getByRole('list', { name: /Previsão/ });
  await user.click(screen.getByRole('button', { name: '°F' }));
  expect(within(current).getByText('32°', { exact: false })).toBeInTheDocument();
  expect(within(current).getByText('Sensação de -40°')).toBeInTheDocument();
  expect(within(current).getByText('70%')).toBeInTheDocument();
  expect(within(forecast).getByText('32°')).toBeInTheDocument();
  expect(within(forecast).getByText('212°')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  await user.click(screen.getByRole('button', { name: '°C' }));
  expect(within(forecast).getByText('100°')).toBeInTheDocument();
});
