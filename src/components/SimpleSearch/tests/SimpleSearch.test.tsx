import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SimpleSearch from '../SimpleSearch';

const { mockGetMaxPrice, mockGetAllBrands, mockSearchBrandsByPhrase } = vi.hoisted(() => ({
  mockGetMaxPrice: vi.fn(),
  mockGetAllBrands: vi.fn(),
  mockSearchBrandsByPhrase: vi.fn(),
}));

vi.mock('../../../api/offerApi', () => ({
  getMaxPrice: mockGetMaxPrice,
  getAllBrands: mockGetAllBrands,
  searchBrandsByPhrase: mockSearchBrandsByPhrase,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

const TEST_API = 'http://api.test';
beforeAll(() => {
  vi.stubEnv('VITE_API_URL', TEST_API);
});

Object.defineProperty(import.meta, 'env', { value: { VITE_API_URL: TEST_API }, writable: true });

describe('SimpleSearch Component', () => {
  const brandList = ['Audi', 'BMW', 'Toyota'];
  const maxPrice = 75000;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
    mockGetMaxPrice.mockResolvedValue(maxPrice);
    mockGetAllBrands.mockResolvedValue(brandList);
    mockSearchBrandsByPhrase.mockResolvedValue(brandList);
  });

  it('formats and validates price inputs', async () => {
    render(<SimpleSearch />);

    await waitFor(() => {
      expect(mockGetMaxPrice).toHaveBeenCalled();
    });

    const minInput = screen.getByLabelText('Minimalna cena');
    const maxInput = screen.getByLabelText('Maksymalna cena');

    fireEvent.change(minInput, { target: { value: '10000' } });
    expect(minInput).toHaveValue('10 000');

    fireEvent.change(maxInput, { target: { value: '5000' } });
    await waitFor(() => expect(screen.getByText(/Cena maksymalna nie może/)).toBeInTheDocument());

    expect(screen.getByRole('button', { name: 'Zamknij powiadomienie' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Zamknij powiadomienie' }));
    await waitFor(() => expect(screen.queryByText(/Cena maksymalna nie może/)).toBeNull());
  });

  it('displays brand suggestions and allows selection', async () => {
    render(<SimpleSearch />);

    await waitFor(() => {
      expect(mockGetMaxPrice).toHaveBeenCalled();
      expect(mockGetAllBrands).toHaveBeenCalled();
    });

    const searchInput = screen.getByPlaceholderText('Wpisz markę lub model');
    fireEvent.focus(searchInput);

    await waitFor(() => expect(screen.getByText('Ładowanie...')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Audi')).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByText('BMW'));
    expect(searchInput).toHaveValue('BMW');
  });

  it('searches brands when typing', async () => {
    render(<SimpleSearch />);

    await waitFor(() => {
      expect(mockGetAllBrands).toHaveBeenCalled();
    });

    const searchInput = screen.getByPlaceholderText('Wpisz markę lub model');
    fireEvent.change(searchInput, { target: { value: 'BMW' } });

    await waitFor(() => {
      expect(mockSearchBrandsByPhrase).toHaveBeenCalledWith('BMW');
    });
  });

  it('shows all brands when input is empty and focused', async () => {
    render(<SimpleSearch />);

    const searchInput = screen.getByPlaceholderText('Wpisz markę lub model');
    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(mockGetAllBrands).toHaveBeenCalled();
    });
  });

  it('submits valid search, saves to sessionStorage and navigates', async () => {
    render(<SimpleSearch />);

    await waitFor(() => {
      expect(mockGetMaxPrice).toHaveBeenCalled();
    });

    const input = screen.getByPlaceholderText('Wpisz markę lub model');
    fireEvent.change(input, { target: { value: 'Audi' } });

    const minInput = screen.getByLabelText('Minimalna cena');
    const maxInput = screen.getByLabelText('Maksymalna cena');
    fireEvent.change(minInput, { target: { value: '1000' } });
    fireEvent.change(maxInput, { target: { value: '50000' } });

    fireEvent.click(screen.getByRole('button', { name: 'Szukaj' }));

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'simpleSearchParams',
      JSON.stringify({
        phrase: 'Audi',
        minPrice: 1000,
        maxPrice: 50000
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/offers');
  });

  it('handles API errors gracefully', async () => {
    mockGetMaxPrice.mockRejectedValue(new Error('API Error'));
    mockGetAllBrands.mockRejectedValue(new Error('Brands Error'));

    render(<SimpleSearch />);

    await waitFor(() => {
      expect(mockGetMaxPrice).toHaveBeenCalled();
      expect(mockGetAllBrands).toHaveBeenCalled();
    });

    const input = screen.getByPlaceholderText('Wpisz markę lub model');
    expect(input).toBeInTheDocument();
  });

  it('shows no results when brand search fails', async () => {
    mockSearchBrandsByPhrase.mockResolvedValue([]);

    render(<SimpleSearch />);

    const searchInput = screen.getByPlaceholderText('Wpisz markę lub model');
    fireEvent.change(searchInput, { target: { value: 'NonExistentBrand' } });
    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(screen.getByText('Brak wyników wyszukiwania')).toBeInTheDocument();
    });
  });

  it('handles price suggestion clicks', async () => {
    render(<SimpleSearch />);

    await waitFor(() => {
      expect(mockGetMaxPrice).toHaveBeenCalled();
    });

    const minInput = screen.getByLabelText('Minimalna cena');
    fireEvent.focus(minInput);

    await waitFor(() => {
      expect(screen.getByText('1 000 zł')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByText('1 000 zł'));
    expect(minInput).toHaveValue('1 000');
  });

  it('disables search when loading', async () => {
    mockGetMaxPrice.mockImplementation(() => new Promise(() => {}));

    render(<SimpleSearch />);

    const searchButton = screen.getByRole('button', { name: 'Ładowanie...' });
    expect(searchButton).toBeDisabled();
  });

  it('validates prices correctly', async () => {
    render(<SimpleSearch />);

    await waitFor(() => {
      expect(mockGetMaxPrice).toHaveBeenCalled();
    });

    const minInput = screen.getByLabelText('Minimalna cena');
    const maxInput = screen.getByLabelText('Maksymalna cena');

    fireEvent.change(minInput, { target: { value: '50000' } });
    fireEvent.change(maxInput, { target: { value: '30000' } });

    await waitFor(() => {
      expect(screen.getByText(/Cena maksymalna nie może być równa lub niższa/)).toBeInTheDocument();
    });
  });
});