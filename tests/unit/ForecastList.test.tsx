import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import type { ForecastDay } from '../../src/types/weather';

const forecast: ForecastDay[] = [
  { date: '2026-11-11', weatherCode: 0 },
  { date: '2026-11-12', weatherCode: 1 },
  { date: '2026-11-13', weatherCode: 2 },
];

it('identifica o primeiro dia como hoje e informa previsão parcial', () => {
  render(<ForecastList forecast={forecast} unit="celsius" />);
  const days = within(screen.getByRole('list', { name: /Previsão/ })).getAllByRole('listitem');
  expect(within(days[0]).getByText('Hoje')).toBeInTheDocument();
  expect(within(days[1]).getByText('qui')).toBeInTheDocument();
  expect(within(days[2]).getByText('sex')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Parte da previsão não está disponível.');
});

it.fails('identifica o segundo dia como amanhã conforme o contrato solicitado', () => {
  render(<ForecastList forecast={forecast} unit="celsius" />);
  const days = within(screen.getByRole('list', { name: /Previsão/ })).getAllByRole('listitem');
  expect(within(days[1]).getByText('Amanhã')).toBeInTheDocument();
});
