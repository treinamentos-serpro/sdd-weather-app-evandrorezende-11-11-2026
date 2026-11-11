import type { Unit } from '../types/weather';

export function convertTemperature(celsius: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function formatTemperature(celsius: number, unit: Unit): string {
  return `${Math.round(convertTemperature(celsius, unit))}°`;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}