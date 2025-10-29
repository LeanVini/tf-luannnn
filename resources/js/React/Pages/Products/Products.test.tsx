import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Importa o componente (mesmo diretório)
import Products from './Products';

describe('Products component (search debounce + pagination)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // mock global.fetch
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({ items: [{ id: 1, name: 'Produto X', price: 10 }], totalPages: 2 }),
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    (global as any).fetch = undefined;
    jest.clearAllMocks();
  });

  test('debounce: fetch is called only after debounce delay', async () => {
    render(<Products />);

    const input = screen.getByPlaceholderText('Buscar produtos...');

    // digitar rapidamente várias vezes
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.change(input, { target: { value: 'abc' } });

    // antes do timer, não deve ter chamado
    expect((global as any).fetch).not.toHaveBeenCalled();

    // avança o tempo do debounce (500ms)
    jest.advanceTimersByTime(500);

    // aguarda o efeito assíncrono que chama fetch
    await waitFor(() => expect((global as any).fetch).toHaveBeenCalledTimes(1));
  });

  test('pagination: clicking next triggers fetch with updated page', async () => {
    render(<Products />);

    // inicialmente, chamará a primeira fetch após debounce
    jest.advanceTimersByTime(500);
    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());

    // limpa mocks para observar chamadas seguintes
    jest.clearAllMocks();

    // clica em próxima página — o componente Pagination renderiza números
    const nextButton = await screen.findByText('Próxima');
    userEvent.click(nextButton);

    // Avança timers para que o efeito reaja (o useEffect observa page)
    jest.advanceTimersByTime(500);

    await waitFor(() => expect((global as any).fetch).toHaveBeenCalledTimes(1));
  });
});
