import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

it('envia o termo digitado ao buscar', async () => {
  const onSearch = vi.fn();
  const user = userEvent.setup();
  render(
    <SearchBar
      results={[]}
      isLoading={false}
      message={null}
      onSearch={onSearch}
      onSelect={vi.fn()}
    />,
  );
  await user.type(screen.getByLabelText('Buscar cidade'), 'São Paulo');
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  expect(onSearch).toHaveBeenCalledOnce();
  expect(onSearch).toHaveBeenCalledWith('São Paulo');
});

it.fails('não chama onSearch quando o campo está vazio', async () => {
  const onSearch = vi.fn();
  const user = userEvent.setup();
  render(
    <SearchBar
      results={[]}
      isLoading={false}
      message={null}
      onSearch={onSearch}
      onSelect={vi.fn()}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  expect(onSearch).not.toHaveBeenCalled();
});
