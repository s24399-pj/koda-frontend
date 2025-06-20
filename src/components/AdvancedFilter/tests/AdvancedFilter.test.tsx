import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import axios from 'axios';
import AdvancedFilter from '../AdvancedFilter';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedAxios = axios as any;

vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:8137',
  },
});

vi.mock('../../../types/offer/OfferTypes', () => ({
  FuelType: {
    PETROL: 'PETROL',
    DIESEL: 'DIESEL',
    ELECTRIC: 'ELECTRIC',
    HYBRID: 'HYBRID',
  },
  TransmissionType: {
    MANUAL: 'MANUAL',
    AUTOMATIC: 'AUTOMATIC',
  },
  BodyType: {
    SEDAN: 'SEDAN',
    HATCHBACK: 'HATCHBACK',
    SUV: 'SUV',
    COUPE: 'COUPE',
  },
  DriveType: {
    FWD: 'FWD',
    RWD: 'RWD',
    AWD: 'AWD',
  },
  VehicleCondition: {
    NEW: 'NEW',
    USED: 'USED',
    DAMAGED: 'DAMAGED',
  },
}));

describe('AdvancedFilter', () => {
  const mockOnSearch = vi.fn();
  const mockOnLoading = vi.fn();

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: {
        content: [],
      },
    });

    mockedAxios.post.mockResolvedValue({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders basic filter fields', () => {
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    expect(screen.getByLabelText('Szukaj')).toBeInTheDocument();
    expect(screen.getByLabelText('Marka')).toBeInTheDocument();
    expect(screen.getByLabelText('Model')).toBeInTheDocument();
    expect(screen.getByText('Cena (PLN)')).toBeInTheDocument();
    expect(screen.getByText('Rok produkcji')).toBeInTheDocument();
  });

  test('shows/hides advanced filters when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const toggleButton = screen.getByText('Pokaż filtry zaawansowane');

    expect(screen.queryByText('Szczegóły pojazdu')).not.toBeInTheDocument();

    await user.click(toggleButton);

    expect(screen.getByText('Szczegóły pojazdu')).toBeInTheDocument();
    expect(screen.getByText('Wyposażenie')).toBeInTheDocument();
    expect(screen.getByText('Ukryj filtry zaawansowane')).toBeInTheDocument();
  });

  test('updates phrase input value', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const phraseInput = screen.getByLabelText('Szukaj');
    await user.type(phraseInput, 'BMW X5');

    expect(phraseInput).toHaveValue('BMW X5');
  });

  test('handles price range inputs', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const priceContainer = screen.getByText('Cena (PLN)').closest('.filter-field');
    const minPriceInput = priceContainer?.querySelector(
      'input[name="minPrice"]'
    ) as HTMLInputElement;
    const maxPriceInput = priceContainer?.querySelector(
      'input[name="maxPrice"]'
    ) as HTMLInputElement;

    await user.type(minPriceInput, '50000');
    await user.type(maxPriceInput, '100000');

    expect(minPriceInput).toHaveValue(50000);
    expect(maxPriceInput).toHaveValue(100000);
  });

  test('handles year range inputs', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const yearContainer = screen.getByText('Rok produkcji').closest('.filter-field');
    const minYearInput = yearContainer?.querySelector('input[name="minYear"]') as HTMLInputElement;
    const maxYearInput = yearContainer?.querySelector('input[name="maxYear"]') as HTMLInputElement;

    await user.type(minYearInput, '2020');
    await user.type(maxYearInput, '2024');

    expect(minYearInput).toHaveValue(2020);
    expect(maxYearInput).toHaveValue(2024);
  });

  test('handles advanced filter options', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    await user.click(screen.getByText('Pokaż filtry zaawansowane'));

    const fuelTypeSelect = screen.getByLabelText('Rodzaj paliwa');
    await user.selectOptions(fuelTypeSelect, 'PETROL');
    expect(fuelTypeSelect).toHaveValue('PETROL');

    const transmissionSelect = screen.getByLabelText('Skrzynia biegów');
    await user.selectOptions(transmissionSelect, 'AUTOMATIC');
    expect(transmissionSelect).toHaveValue('AUTOMATIC');
  });

  test('handles equipment checkboxes', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    await user.click(screen.getByText('Pokaż filtry zaawansowane'));

    const airConditioningCheckbox = screen.getByLabelText('Klimatyzacja');
    await user.click(airConditioningCheckbox);
    expect(airConditioningCheckbox).toBeChecked();

    const navigationCheckbox = screen.getByLabelText('Nawigacja');
    await user.click(navigationCheckbox);
    expect(navigationCheckbox).toBeChecked();
  });

  test('submits search form', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    await user.type(screen.getByLabelText('Szukaj'), 'tests search');

    const priceContainer = screen.getByText('Cena (PLN)').closest('.filter-field');
    const minPriceInput = priceContainer?.querySelector(
      'input[name="minPrice"]'
    ) as HTMLInputElement;
    await user.type(minPriceInput, '50000');

    const searchButton = screen.getByRole('button', { name: 'Szukaj' });
    await user.click(searchButton);

    expect(mockOnLoading).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(mockOnLoading).toHaveBeenCalledWith(false);
    });
  });

  test('resets filters when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const phraseInput = screen.getByLabelText('Szukaj');

    await user.type(phraseInput, 'Test search');

    expect(phraseInput).toHaveValue('Test search');

    const resetButton = screen.getByText('Wyczyść filtry');
    await user.click(resetButton);

    await waitFor(() => {
      expect(phraseInput).toHaveValue('');
    });
  });

  test('disables reset button when no filters are active', () => {
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const resetButton = screen.getByText('Wyczyść filtry');
    expect(resetButton).toBeDisabled();
  });

  test('enables reset button when filters are active', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const phraseInput = screen.getByLabelText('Szukaj');
    await user.type(phraseInput, 'test');

    const resetButton = screen.getByText('Wyczyść filtry');
    expect(resetButton).not.toBeDisabled();
  });

  test('disables model select when no brand is selected', () => {
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const modelSelect = screen.getByLabelText('Model');
    expect(modelSelect).toBeDisabled();
  });

  test('year inputs have correct min/max attributes', () => {
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const yearContainer = screen.getByText('Rok produkcji').closest('.filter-field');
    const yearInputs = yearContainer?.querySelectorAll('input[type="number"]');

    expect(yearInputs?.[0]).toHaveAttribute('min', '1900');
    expect(yearInputs?.[0]).toHaveAttribute('max', '2025');
    expect(yearInputs?.[1]).toHaveAttribute('min', '1900');
    expect(yearInputs?.[1]).toHaveAttribute('max', '2025');
  });

  test('calls onSearch callback', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const searchButton = screen.getByRole('button', { name: 'Szukaj' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  test('handles API errors gracefully', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

    const user = userEvent.setup();
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    const searchButton = screen.getByRole('button', { name: 'Szukaj' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        content: [],
        totalElements: 0,
        totalPages: 0,
      });
    });

    expect(mockOnLoading).toHaveBeenCalledWith(false);
  });

  test('fetches initial offers on mount', async () => {
    render(<AdvancedFilter onSearch={mockOnSearch} onLoading={mockOnLoading} />);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });
});
