import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
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
  current: { temperature: 20, weatherCode: 1, time: '2026-11-11T12:00' },
  forecast: [],
});

beforeEach(() => vi.resetAllMocks());

describe('useWeather', () => {
  it('busca e carrega automaticamente a primeira cidade, permitindo selecionar outra', async () => {
    vi.mocked(searchCities).mockResolvedValue([first, second]);
    vi.mocked(getWeather).mockImplementation(async (city) => weather(city));
    const { result } = renderHook(() => useWeather());
    expect(result.current.status).toBe('idle');
    await act(() => result.current.search(' São Paulo '));
    expect(result.current.status).toBe('success');
    expect(result.current.query).toBe('São Paulo');
    expect(result.current.cities).toEqual([first, second]);
    expect(result.current.data?.city).toEqual(first);
    await act(() => result.current.selectCity(second));
    expect(result.current.data?.city).toEqual(second);
  });

  it('mostra vazio e repete a operação de clima que falhou', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([]).mockResolvedValueOnce([first]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error('Falha de rede.'))
      .mockResolvedValueOnce(weather(first));
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('nada'));
    expect(result.current.status).toBe('empty');
    await act(() => result.current.search('São Paulo'));
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Falha de rede.');
    await act(() => result.current.retry());
    expect(result.current.status).toBe('success');
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(result.current.data?.city).toEqual(first);
  });

  it('ignora respostas de uma operação anterior', async () => {
    let resolveFirst: (value: WeatherData) => void = () => {};
    vi.mocked(getWeather)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(weather(second));
    const { result } = renderHook(() => useWeather());
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.selectCity(first);
    });
    await waitFor(() => expect(result.current.status).toBe('loading'));
    await act(() => result.current.selectCity(second));
    await act(async () => {
      resolveFirst(weather(first));
      await pending;
    });
    expect(result.current.data?.city).toEqual(second);
    expect(result.current.status).toBe('success');
  });
});
