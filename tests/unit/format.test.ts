import { describe, expect, it } from 'vitest';
import { formatForecastDate, formatLongDate } from '../../src/lib/format';

describe('formatação de datas', () => {
  it('formata o dia da semana e a data abreviada da previsão', () => {
    expect(formatForecastDate('2026-11-11')).toEqual({ weekday: 'qua', day: '11 de nov' });
    expect(formatForecastDate('2026-11-12')).toEqual({ weekday: 'qui', day: '12 de nov' });
    expect(formatForecastDate('2026-11-13')).toEqual({ weekday: 'sex', day: '13 de nov' });
  });

  it('formata a data longa em português', () => {
    expect(formatLongDate(new Date(2026, 10, 11, 12))).toBe('quarta-feira, 11 de novembro');
  });
});
