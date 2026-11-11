export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatForecastDate(date: string): { weekday: string; day: string } {
  const [year, month, day] = date.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return {
    weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
      .format(parsedDate)
      .replace('.', ''),
    day: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
      .format(parsedDate)
      .replace('.', ''),
  };
}