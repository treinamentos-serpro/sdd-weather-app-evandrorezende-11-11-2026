import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: '1',
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};
const forecast = {
  current: {
    time: '2026-11-11T12:00',
    temperature_2m: 25,
    weather_code: 1,
    relative_humidity_2m: 70,
    wind_speed_10m: 12,
    surface_pressure: 1010,
    precipitation: 0,
  },
  daily: {
    time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
    weather_code: [1, 2, 3, 61, 0],
    temperature_2m_max: [27, 28, 29, 30, 31],
    temperature_2m_min: [17, 18, 19, 20, 21],
    precipitation_probability_max: [0, 10, 20, 30, 40],
  },
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('Open-Meteo', () => {
  it('busca e mapeia cidades com parâmetros e nome codificado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1,
              name: 'São Paulo',
              country: 'Brasil',
              admin1: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
            },
          ],
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    expect(await searchCities(' São Paulo ')).toEqual([{ ...city, region: 'São Paulo' }]);
    expect(fetchMock.mock.calls[0][0]).toContain(
      'name=S%C3%A3o%20Paulo&count=5&language=pt&format=json',
    );
  });

  it('retorna lista vazia sem chamada para texto vazio e quando não há resultados', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    expect(await searchCities('  ')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await searchCities('inexistente')).toEqual([]);
  });

  it('mapeia cidade sem região', async () => {
    const result = {
      id: 1,
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [result] }))),
    );
    expect(await searchCities('São Paulo')).toEqual([{ ...city, region: undefined }]);
  });

  it('solicita os campos e mapeia cinco dias sem substituir ausências por zero', async () => {
    const payload = {
      ...forecast,
      daily: { ...forecast.daily, temperature_2m_min: [null, 18, 19, 20, 21] },
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload)));
    vi.stubGlobal('fetch', fetchMock);
    const weather = await getWeather(city);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('latitude')).toBe('-23.55');
    expect(url.searchParams.get('longitude')).toBe('-46.63');
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('current')).toBe(
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    );
    expect(url.searchParams.get('daily')).toBe(
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    );
    expect(weather.current).toMatchObject({ temperature: 25, humidity: 70, precipitation: 0 });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.city).toEqual(city);
    expect(weather.current).toMatchObject({
      time: forecast.current.time,
      weatherCode: 1,
      windSpeed: 12,
      pressure: 1010,
    });
    expect(
      weather.forecast.map((day) => [
        day.date,
        day.weatherCode,
        day.max,
        day.precipitationProbability,
      ]),
    ).toEqual(
      forecast.daily.time.map((date, index) => [
        date,
        forecast.daily.weather_code[index],
        forecast.daily.temperature_2m_max[index],
        forecast.daily.precipitation_probability_max[index],
      ]),
    );
    expect(weather.forecast[0]).toEqual({
      date: '2026-11-11',
      weatherCode: 1,
      max: 27,
      min: undefined,
      precipitationProbability: 0,
    });
  });

  it('trata respostas HTTP e dados incompletos', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('', { status: 500 }))
        .mockResolvedValueOnce(new Response('{}')),
    );
    await expect(searchCities('teste')).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(getWeather(city)).rejects.toThrow('A resposta meteorológica está incompleta.');
  });

  it.each([
    { current: forecast.current },
    { daily: forecast.daily },
  ])('rejeita previsão sem current ou daily', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('preserva dados opcionais nulos como ausentes e mantém zeros reais', async () => {
    const payload = {
      current: { ...forecast.current, precipitation: null, relative_humidity_2m: null },
      daily: { ...forecast.daily, precipitation_probability_max: [null, 0, 20, 30, 40] },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    const result = await getWeather(city);
    expect(result.current.precipitation).toBeUndefined();
    expect(result.current.humidity).toBeUndefined();
    expect(result.forecast[0].precipitationProbability).toBeUndefined();
    expect(result.forecast[1].precipitationProbability).toBe(0);
  });

  it.fails('converte precipitação nula em zero conforme o contrato solicitado', async () => {
    const payload = { ...forecast, current: { ...forecast.current, precipitation: null } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    expect((await getWeather(city)).current.precipitation).toBe(0);
  });

  it('não inventa dias ausentes em uma previsão parcial', async () => {
    const payload = {
      ...forecast,
      daily: {
        time: forecast.daily.time.slice(0, 2),
        weather_code: forecast.daily.weather_code.slice(0, 2),
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    const result = await getWeather(city);
    expect(result.forecast).toEqual([
      {
        date: '2026-11-11',
        weatherCode: 1,
        min: undefined,
        max: undefined,
        precipitationProbability: undefined,
      },
      {
        date: '2026-11-12',
        weatherCode: 2,
        min: undefined,
        max: undefined,
        precipitationProbability: undefined,
      },
    ]);
  });

  it('trata falha HTTP ao consultar a previsão', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('trata JSON inválido como erro do serviço', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{')));
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('limita o tempo de leitura do corpo da resposta', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url, options: RequestInit) =>
        Promise.resolve({
          ok: true,
          json: () =>
            new Promise((_resolve, reject) => {
              options.signal?.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              );
            }),
        }),
      ),
    );
    const request = getWeather(city);
    const assertion = expect(request).rejects.toThrow('A requisição demorou demais.');
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('propaga cancelamento ao ler o corpo sem tratá-lo como timeout', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url, options: RequestInit) =>
        Promise.resolve({
          ok: true,
          json: () =>
            new Promise((_resolve, reject) => {
              options.signal?.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              );
            }),
        }),
      ),
    );
    const request = getWeather(city, controller.signal);
    await Promise.resolve();
    controller.abort();
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('informa falha de rede quando a leitura do corpo é interrompida', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.reject(new TypeError('network')) }),
    );
    await expect(getWeather(city)).rejects.toThrow('Falha de rede.');
  });

  it('rejeita data inválida antes de entregá-la à interface', async () => {
    const payload = { ...forecast, daily: { ...forecast.daily, time: ['data inválida'] } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each([
    'null',
    '{"results":{}}',
    '{"results":[null]}',
  ])('rejeita geocodificação malformada: %s', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(payload)));
    await expect(searchCities('teste')).rejects.toThrow(
      'A resposta da busca de cidades é inválida.',
    );
  });

  it('trata previsão nula como resposta incompleta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('null')));
    await expect(getWeather(city)).rejects.toThrow('A resposta meteorológica está incompleta.');
  });

  it('traduz falhas de rede e timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValueOnce(new TypeError('network'))
        .mockImplementationOnce(
          (_url, options: RequestInit) =>
            new Promise((_resolve, reject) => {
              options.signal?.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              );
            }),
        ),
    );
    await expect(searchCities('teste')).rejects.toThrow('Falha de rede.');
    const request = searchCities('teste');
    const assertion = expect(request).rejects.toThrow('A requisição demorou demais.');
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
});
