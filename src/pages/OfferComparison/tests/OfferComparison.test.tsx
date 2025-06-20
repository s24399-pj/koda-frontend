import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import OfferComparison from '../OfferComparison';
import { OfferData } from '../../../types/offerTypes';
import { MiniOffer } from '../../../types/miniOfferTypes';

const { mockUseTitle, mockUseComparison, mockAxios, mockSessionStorage } = vi.hoisted(() => ({
  mockUseTitle: vi.fn(),
  mockUseComparison: vi.fn(),
  mockAxios: {
    get: vi.fn(),
  },
  mockSessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock('../../../hooks/useTitle', () => ({
  default: mockUseTitle,
}));

vi.mock('../../../context/ComparisonContext', () => ({
  useComparison: mockUseComparison,
}));

vi.mock('axios', () => ({
  default: mockAxios,
}));

vi.mock('../../../util/constants.tsx', () => ({
  DEFAULT_CAR_IMAGE: 'default-car.png',
}));

vi.mock('../../../types/offer/comparisionFeatures.ts', () => ({
  comparisonFeatures: [
    {
      key: 'title',
      label: 'Nazwa',
      carDetails: false,
      highlightBetter: undefined,
    },
    {
      key: 'price',
      label: 'Cena',
      carDetails: false,
      unit: 'PLN',
      highlightBetter: 'lower',
    },
    {
      key: 'year',
      label: 'Rok',
      carDetails: true,
      highlightBetter: 'higher',
    },
    {
      key: 'mileage',
      label: 'Przebieg',
      carDetails: true,
      unit: 'km',
      highlightBetter: 'lower',
    },
    {
      key: 'enginePower',
      label: 'Moc',
      carDetails: true,
      unit: 'KM',
      highlightBetter: 'higher',
    },
  ],
}));

Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8137',
  },
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

const mockOfferA: OfferData = {
  id: '1',
  title: 'BMW X5 2020',
  description: 'Great BMW',
  price: 150000,
  currency: 'PLN',
  seller: {
    id: 'seller1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  location: 'Warsaw',
  contactPhone: '+48123456789',
  contactEmail: 'contact@example.com',
  mainImage: '/images/bmw-main.jpg',
  imageUrls: ['/images/bmw-1.jpg', '/images/bmw-2.jpg'],
  CarDetailsDto: {
    brand: 'BMW',
    model: 'X5',
    year: 2020,
    color: 'Black',
    displacement: '3.0L',
    mileage: 50000,
    fuelType: 'Benzyna',
    transmission: 'Automatic',
    bodyType: 'SUV',
    driveType: 'AWD',
    enginePower: 265,
    doors: 5,
    seats: 5,
  },
};

const mockOfferB: OfferData = {
  id: '2',
  title: 'Audi Q7 2019',
  description: 'Great Audi',
  price: 140000,
  currency: 'PLN',
  seller: {
    id: 'seller2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
  },
  location: 'Krakow',
  contactPhone: '+48987654321',
  contactEmail: 'contact2@example.com',
  mainImage: '/images/audi-main.jpg',
  imageUrls: ['/images/audi-1.jpg', '/images/audi-2.jpg'],
  CarDetailsDto: {
    brand: 'Audi',
    model: 'Q7',
    year: 2019,
    color: 'White',
    displacement: '3.0L',
    mileage: 60000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    driveType: 'AWD',
    enginePower: 250,
    doors: 5,
    seats: 7,
  },
};

const mockSearchResults = {
  data: {
    content: [mockOfferA, mockOfferB],
  },
};

const renderComponent = () => {
  return render(<OfferComparison />);
};

describe('OfferComparison Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTitle.mockReset();
    mockUseComparison.mockReturnValue({
      clearComparison: vi.fn(),
    });
    mockSessionStorage.getItem.mockReturnValue(null);
    mockAxios.get.mockResolvedValue(mockSearchResults);
  });

  test('calls useTitle with correct title', () => {
    renderComponent();
    expect(mockUseTitle).toHaveBeenCalledWith('Porównaj');
  });

  test('renders main UI elements', () => {
    renderComponent();

    expect(screen.getByText('Porównywarka ofert')).toBeInTheDocument();
    expect(screen.getByText('Pojazd 1')).toBeInTheDocument();
    expect(screen.getByText('Pojazd 2')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Wpisz nazwę pierwszego auta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Wpisz nazwę drugiego auta')).toBeInTheDocument();
  });

  test('shows loading state when searching', async () => {
    mockAxios.get.mockImplementation(() => new Promise(() => {}));

    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });

    await waitFor(() => {
      expect(screen.getByText('Wyszukiwanie...')).toBeInTheDocument();
    });
  });

  test('searches for offers when typing', async () => {
    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:8137/api/v1/offers', {
        params: expect.any(URLSearchParams),
      });
    });
  });

  test('displays search suggestions', async () => {
    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });
    fireEvent.focus(input1);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
      expect(screen.getByText('Audi Q7 2019')).toBeInTheDocument();
    });
  });

  test('selects offer from suggestions', async () => {
    mockAxios.get.mockImplementation(url => {
      if (url.includes('/api/v1/offers/1')) {
        return Promise.resolve({ data: mockOfferA });
      }
      return Promise.resolve(mockSearchResults);
    });

    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });
    fireEvent.focus(input1);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    // Click the first suggestion (BMW X5 2020)
    const suggestions = screen.getAllByText('BMW X5 2020');
    fireEvent.click(suggestions[0]);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:8137/api/v1/offers/1');
    });
  });

  test('shows comparison table when both offers selected', async () => {
    mockAxios.get.mockImplementation(url => {
      if (url.includes('/api/v1/offers/1')) {
        return Promise.resolve({ data: mockOfferA });
      }
      if (url.includes('/api/v1/offers/2')) {
        return Promise.resolve({ data: mockOfferB });
      }
      return Promise.resolve(mockSearchResults);
    });

    renderComponent();

    // Select first offer
    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });
    fireEvent.focus(input1);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const bmwSuggestions = screen.getAllByText('BMW X5 2020');
    fireEvent.click(bmwSuggestions[0]);

    // Wait for first selection to complete and clear suggestions
    await waitFor(() => {
      expect(input1).toHaveValue('BMW X5 2020');
    });

    // Select second offer
    const input2 = screen.getByPlaceholderText('Wpisz nazwę drugiego auta');
    fireEvent.change(input2, { target: { value: 'Audi' } });
    fireEvent.focus(input2);

    await waitFor(() => {
      const audiSuggestions = screen.getAllByText('Audi Q7 2019');
      expect(audiSuggestions.length).toBeGreaterThan(0);
    });

    const audiSuggestions = screen.getAllByText('Audi Q7 2019');
    fireEvent.click(audiSuggestions[audiSuggestions.length - 1]); // Click the last one (from second list)

    await waitFor(() => {
      expect(screen.getByText('Wyczyść porównanie')).toBeInTheDocument();
      expect(screen.getByText('Nazwa')).toBeInTheDocument();
      expect(screen.getByText('Cena')).toBeInTheDocument();
      expect(screen.getByText('Rok')).toBeInTheDocument();
      expect(screen.getByText('Przebieg')).toBeInTheDocument();
      expect(screen.getByText('Moc')).toBeInTheDocument();
    });
  });

  test('highlights better values in comparison', async () => {
    mockAxios.get.mockImplementation(url => {
      if (url.includes('/api/v1/offers/1')) {
        return Promise.resolve({ data: mockOfferA });
      }
      if (url.includes('/api/v1/offers/2')) {
        return Promise.resolve({ data: mockOfferB });
      }
      return Promise.resolve(mockSearchResults);
    });

    renderComponent();

    // Select both offers
    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });
    fireEvent.focus(input1);

    await waitFor(() => {
      const bmwSuggestions = screen.getAllByText('BMW X5 2020');
      expect(bmwSuggestions.length).toBeGreaterThan(0);
    });

    const bmwSuggestions = screen.getAllByText('BMW X5 2020');
    fireEvent.click(bmwSuggestions[0]);

    await waitFor(() => {
      expect(input1).toHaveValue('BMW X5 2020');
    });

    const input2 = screen.getByPlaceholderText('Wpisz nazwę drugiego auta');
    fireEvent.change(input2, { target: { value: 'Audi' } });
    fireEvent.focus(input2);

    await waitFor(() => {
      const audiSuggestions = screen.getAllByText('Audi Q7 2019');
      expect(audiSuggestions.length).toBeGreaterThan(0);
    });

    const audiSuggestions = screen.getAllByText('Audi Q7 2019');
    fireEvent.click(audiSuggestions[audiSuggestions.length - 1]);

    await waitFor(() => {
      // Check that better values are highlighted
      const highlightedCells = document.querySelectorAll('.highlight');
      expect(highlightedCells.length).toBeGreaterThan(0);
    });
  });

  test('resets comparison when reset button clicked', async () => {
    mockAxios.get.mockImplementation(url => {
      if (url.includes('/api/v1/offers/1')) {
        return Promise.resolve({ data: mockOfferA });
      }
      if (url.includes('/api/v1/offers/2')) {
        return Promise.resolve({ data: mockOfferB });
      }
      return Promise.resolve(mockSearchResults);
    });

    renderComponent();

    // Select both offers first
    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });
    fireEvent.focus(input1);

    await waitFor(() => {
      const bmwSuggestions = screen.getAllByText('BMW X5 2020');
      expect(bmwSuggestions.length).toBeGreaterThan(0);
    });

    const bmwSuggestions = screen.getAllByText('BMW X5 2020');
    fireEvent.click(bmwSuggestions[0]);

    await waitFor(() => {
      expect(input1).toHaveValue('BMW X5 2020');
    });

    const input2 = screen.getByPlaceholderText('Wpisz nazwę drugiego auta');
    fireEvent.change(input2, { target: { value: 'Audi' } });
    fireEvent.focus(input2);

    await waitFor(() => {
      const audiSuggestions = screen.getAllByText('Audi Q7 2019');
      expect(audiSuggestions.length).toBeGreaterThan(0);
    });

    const audiSuggestions = screen.getAllByText('Audi Q7 2019');
    fireEvent.click(audiSuggestions[audiSuggestions.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Wyczyść porównanie')).toBeInTheDocument();
    });

    // Reset
    fireEvent.click(screen.getByText('Wyczyść porównanie'));

    expect(input1).toHaveValue('');
    expect(input2).toHaveValue('');
    expect(screen.queryByText('Wyczyść porównanie')).not.toBeInTheDocument();
  });

  test('loads offers from sessionStorage on mount', async () => {
    const storedOffers: MiniOffer[] = [
      {
        id: '1',
        title: 'BMW X5 2020',
        price: 150000,
        mainImage: '/images/bmw-main.jpg',
        mileage: 50000,
        fuelType: 'Benzyna',
        year: 2020,
        enginePower: 265,
        displacement: '3.0L',
      },
      {
        id: '2',
        title: 'Audi Q7 2019',
        price: 140000,
        mainImage: '/images/audi-main.jpg',
        mileage: 60000,
        fuelType: 'Diesel',
        year: 2019,
        enginePower: 250,
        displacement: '3.0L',
      },
    ];

    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(storedOffers));
    mockAxios.get.mockImplementation(url => {
      if (url.includes('/api/v1/offers/1')) {
        return Promise.resolve({ data: mockOfferA });
      }
      if (url.includes('/api/v1/offers/2')) {
        return Promise.resolve({ data: mockOfferB });
      }
      return Promise.resolve(mockSearchResults);
    });

    renderComponent();

    await waitFor(() => {
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('comparisonOffers');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('comparisonOffers');
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('BMW X5 2020')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Audi Q7 2019')).toBeInTheDocument();
    });
  });

  test('handles search error gracefully', async () => {
    mockAxios.get.mockRejectedValue(new Error('Search failed'));

    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });

    await waitFor(() => {
      expect(screen.getByText('Wystąpił błąd podczas wyszukiwania ofert.')).toBeInTheDocument();
    });
  });

  test('handles offer details fetch error', async () => {
    mockAxios.get.mockImplementation(url => {
      if (url.includes('/api/v1/offers/1')) {
        return Promise.reject(new Error('Failed to fetch details'));
      }
      return Promise.resolve(mockSearchResults);
    });

    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });
    fireEvent.focus(input1);

    await waitFor(() => {
      const bmwSuggestions = screen.getAllByText('BMW X5 2020');
      expect(bmwSuggestions.length).toBeGreaterThan(0);
    });

    const bmwSuggestions = screen.getAllByText('BMW X5 2020');
    fireEvent.click(bmwSuggestions[0]);

    await waitFor(() => {
      expect(screen.getByText('Nie udało się załadować szczegółów oferty.')).toBeInTheDocument();
    });
  });

  test('hides suggestions when clicking outside', async () => {
    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });
    fireEvent.focus(input1);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('BMW X5 2020')).not.toBeInTheDocument();
    });
  });

  test('handles image loading errors', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });
    fireEvent.focus(input1);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const image = screen.getByAltText('BMW X5 2020');
    fireEvent.error(image);

    expect(image.getAttribute('src')).toBe('default-car.png');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Image loading error in comparison:',
      expect.any(String)
    );

    consoleSpy.mockRestore();
  });

  test('prevents multiple error handling for same image', async () => {
    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'BMW' } });
    fireEvent.focus(input1);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const image = screen.getByAltText('BMW X5 2020') as HTMLImageElement;

    // First error
    fireEvent.error(image);
    expect(image.dataset.errorHandled).toBe('true');

    const firstSrc = image.src;

    // Second error should not change src again
    fireEvent.error(image);
    expect(image.src).toBe(firstSrc);
  });

  test('does not search when input is too short', async () => {
    renderComponent();

    const input1 = screen.getByPlaceholderText('Wpisz nazwę pierwszego auta');
    fireEvent.change(input1, { target: { value: 'B' } });

    // Wait to ensure no search is triggered
    await new Promise(resolve => setTimeout(resolve, 400));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  test('calls clearComparison on component unmount', () => {
    const mockClearComparison = vi.fn();
    mockUseComparison.mockReturnValue({
      clearComparison: mockClearComparison,
    });

    const { unmount } = renderComponent();

    unmount();

    expect(mockClearComparison).toHaveBeenCalled();
  });
});
