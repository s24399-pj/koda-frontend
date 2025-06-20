import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import SimpleSearch from '../SimpleSearch';

vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

const TEST_API = 'http://api.test';
beforeAll(() => {
  vi.stubEnv('VITE_API_URL', TEST_API);
});
import.meta, 'env', { value: { VITE_API_URL: TEST_API }, writable: true };

describe('SimpleSearch Component', () => {
  const priceOffers = [{ price: 5000 }, { price: 20000 }, { price: 75000 }];
  const brandList = ['Audi', 'BMW', 'Toyota'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formats and validates price inputs', async () => {
    mockedGet.mockResolvedValue({ data: { content: priceOffers } });
    render(<SimpleSearch />);
    await waitFor(() => {});

    const minInput = screen.getByLabelText('Minimalna cena');
    const maxInput = screen.getByLabelText('Maksymalna cena');

    fireEvent.change(minInput, { target: { value: '10000' } });
    expect(minInput).toHaveValue('10 000');

    // set max lower than min to trigger error
    fireEvent.change(maxInput, { target: { value: '5000' } });
    await waitFor(() => expect(screen.getByText(/Cena maksymalna nie może/)).toBeInTheDocument());

    // show notification
    expect(screen.getByRole('button', { name: 'Zamknij powiadomienie' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Zamknij powiadomienie' }));
    await waitFor(() => expect(screen.queryByText(/Cena maksymalna nie może/)).toBeNull());
  });

  it('displays brand suggestions and allows selection', async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { content: priceOffers } })
      .mockResolvedValueOnce({ data: brandList })
      .mockResolvedValueOnce({ data: brandList });

    render(<SimpleSearch />);
    await waitFor(() => {});

    const searchInput = screen.getByPlaceholderText('Wpisz markę lub model');
    fireEvent.focus(searchInput);
    await waitFor(() => expect(screen.getByText('Ładowanie...')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Audi')).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByText('BMW'));
    expect(searchInput).toHaveValue('BMW');
  });

  it('submits valid search and navigates', async () => {
    mockedGet.mockResolvedValue({ data: { content: priceOffers } });
    render(<SimpleSearch />);
    await waitFor(() => {});

    const input = screen.getByPlaceholderText('Wpisz markę lub model');
    fireEvent.change(input, { target: { value: 'Audi' } });
    const minInput = screen.getByLabelText('Minimalna cena');
    const maxInput = screen.getByLabelText('Maksymalna cena');
    fireEvent.change(minInput, { target: { value: '1000' } });
    fireEvent.change(maxInput, { target: { value: '50000' } });

    fireEvent.click(screen.getByRole('button', { name: 'Szukaj' }));
    expect(mockNavigate).toHaveBeenCalledWith('/offers?phrase=Audi&minPrice=1000&maxPrice=50000');
  });
});
