import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import App from '../../src/App';

const city = { id: 1, name: 'São Paulo', country: 'Brasil', latitude: -23.55, longitude: -46.63 };
const forecast = {
  current: { time: '2026-11-11T12:00', temperature_2m: 25, weather_code: 1 },
  daily: { time: ['2026-11-11'], weather_code: [1] },
};

afterEach(() => vi.unstubAllGlobals());

it('permite repetir a busca quando a rede volta', async () => {
  const fetchMock = vi
    .fn()
    .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockResolvedValueOnce(new Response(JSON.stringify({ results: [city] })))
    .mockResolvedValueOnce(new Response(JSON.stringify(forecast)));
  vi.stubGlobal('fetch', fetchMock);
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  const error = await screen.findByRole('region', { name: 'Não foi possível carregar' });
  expect(within(error).getByText('Falha de rede.')).toBeInTheDocument();
  await user.click(within(error).getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByRole('heading', { name: /São Paulo.*Brasil/ })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(fetchMock.mock.calls[0][0]).toBe(fetchMock.mock.calls[1][0]);
});

it('repete somente a previsão quando a rede cai após a geocodificação', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ results: [city] })))
    .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockResolvedValueOnce(new Response(JSON.stringify(forecast)));
  vi.stubGlobal('fetch', fetchMock);
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  const error = await screen.findByRole('region', { name: 'Não foi possível carregar' });
  expect(within(error).getByText('Falha de rede.')).toBeInTheDocument();
  await user.click(within(error).getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByRole('heading', { name: /São Paulo.*Brasil/ })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(fetchMock.mock.calls[1][0]).toBe(fetchMock.mock.calls[2][0]);
});
