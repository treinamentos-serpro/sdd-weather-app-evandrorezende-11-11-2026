import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

const first: City = {
  id: '1',
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23,
  longitude: -46,
};
const second: City = { id: '2', name: 'Lisboa', country: 'Portugal', latitude: 38, longitude: -9 };
const weather = (city: City): WeatherData => ({
  city,
  current: { temperature: 25, weatherCode: 1, time: '2026-11-11T12:00' },
  forecast: [{ date: '2026-11-11', weatherCode: 1, min: 15, max: 27 }],
});

beforeEach(() => vi.resetAllMocks());

it('permite buscar, selecionar outra cidade e trocar unidade sem nova consulta', async () => {
  vi.mocked(searchCities).mockResolvedValue([first, second]);
  vi.mocked(getWeather).mockImplementation(async (city) => weather(city));
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
  await user.click(screen.getByRole('button', { name: /^Buscar$/ }));
  expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toHaveFocus();
  await screen.findByRole('heading', { name: /São Paulo.*Brasil/ });
  expect(screen.getByRole('status', { name: 'Atualizações da consulta' })).toHaveTextContent(
    'Previsão para São Paulo, Brasil carregada.',
  );
  expect(screen.queryByText(/Sensação de/)).not.toBeInTheDocument();
  expect(screen.getByText('Parte da previsão não está disponível.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '°F' }));
  expect(screen.getByText('77°', { exact: false })).toBeInTheDocument();
  expect(getWeather).toHaveBeenCalledTimes(1);
  screen.getByRole('button', { name: /Lisboa.*Portugal/ }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toHaveFocus();
  await screen.findByRole('heading', { name: /Lisboa.*Portugal/ });
  expect(getWeather).toHaveBeenCalledTimes(2);
});

it('apresenta estado vazio e permite repetir uma falha', async () => {
  vi.mocked(searchCities)
    .mockResolvedValueOnce([])
    .mockRejectedValueOnce(new Error('Falha de rede.'))
    .mockResolvedValueOnce([first]);
  vi.mocked(getWeather).mockResolvedValue(weather(first));
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
  await user.click(screen.getByRole('button', { name: /^Buscar$/ }));
  await screen.findByText('Nenhuma cidade encontrada para “São Paulo”.');
  await user.click(screen.getByRole('button', { name: /^Buscar$/ }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede.'));
  screen.getByRole('button', { name: 'Tentar novamente' }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toHaveFocus();
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: /São Paulo.*Brasil/ })).toBeInTheDocument(),
  );
});

it('orienta quando a busca contém apenas espaços e não consulta previsão', async () => {
  vi.mocked(searchCities).mockResolvedValue([]);
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), '   ');
  await user.click(screen.getByRole('button', { name: /^Buscar$/ }));
  expect(await screen.findByText('Digite o nome de uma cidade para buscar.')).toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Atualizações da consulta' })).toHaveTextContent(
    'Informe o nome de uma cidade.',
  );
  expect(getWeather).not.toHaveBeenCalled();
});

it('anuncia carregamento e ausência de resultados na mesma região persistente', async () => {
  let resolveSearch: (cities: City[]) => void = () => {};
  vi.mocked(searchCities).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
  );
  const user = userEvent.setup();
  render(<App />);
  const status = screen.getByRole('status', { name: 'Atualizações da consulta' });
  const alert = screen.getByRole('alert');
  expect(status).toBeEmptyDOMElement();
  expect(alert).toBeEmptyDOMElement();
  await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Cidade inexistente');
  await user.click(screen.getByRole('button', { name: /^Buscar$/ }));
  expect(status).toHaveTextContent('Carregando dados meteorológicos.');
  await act(async () => {
    resolveSearch([]);
  });
  expect(status).toHaveTextContent('Busca sem resultados para Cidade inexistente.');
  expect(screen.getByRole('status', { name: 'Atualizações da consulta' })).toBe(status);
  expect(screen.getByRole('alert')).toBe(alert);
});
