import { describe, expect, it } from 'vitest';
import { getWeatherDescription } from '../../src/lib/weatherCodes';

describe('getWeatherDescription', () => {
  it('retorna a descrição de um código conhecido', () => {
    expect(getWeatherDescription(0)).toEqual({ label: 'Céu limpo', icon: '☀️' });
    expect(getWeatherDescription(61)).toEqual({ label: 'Chuva leve', icon: '🌧️' });
  });

  it('retorna uma condição genérica para um código desconhecido', () => {
    expect(getWeatherDescription(999)).toEqual({ label: 'Condição variável', icon: '🌥️' });
  });
});
