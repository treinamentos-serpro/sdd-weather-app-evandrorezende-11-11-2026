import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %s °C para %s °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('mantém o valor original em Celsius', () => {
    expect(convertTemperature(21.5, 'celsius')).toBe(21.5);
    expect(convertTemperature(-40, 'celsius')).toBe(-40);
  });
});

describe('formatTemperature', () => {
  it('arredonda e adiciona o símbolo de grau em Celsius', () => {
    expect(formatTemperature(21.6, 'celsius')).toBe('22°');
    expect(formatTemperature(-3.6, 'celsius')).toBe('-4°');
  });

  it('converte para Fahrenheit antes de arredondar', () => {
    expect(formatTemperature(20.3, 'fahrenheit')).toBe('69°');
    expect(formatTemperature(-40, 'fahrenheit')).toBe('-40°');
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo de cada unidade', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
