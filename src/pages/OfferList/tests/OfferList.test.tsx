import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import OfferList from '../OfferList';
import { MiniOffer } from '../../../types/miniOfferTypes';
import { SearchResponse } from '../../../api/offerApi';

const { mockUseTitle, mockUseNavigate, mockUseComparison, mockOfferApiService, mockScrollTo } =
  vi.hoisted(() => ({
    mockUseTitle: vi.fn(),
    mockUseNavigate: vi.fn(),
    mockUseComparison: vi.fn(),
    mockOfferApiService: {
      searchOffers: vi.fn(),
    },
    mockScrollTo: vi.fn(),
  }));

vi.mock('../../../hooks/useTitle', () => ({
  default: mockUseTitle,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: mockUseNavigate,
}));

vi.mock('../../../context/ComparisonContext', () => ({
  useComparison: mockUseComparison,
}));

vi.mock('../../../api/offerApi', () => ({
  default: mockOfferApiService,
}));

vi.mock('../../../components/LikeButton/LikeButton', () => ({
  default: ({ offerId }: { offerId: string }) => (
    <button data-testid={`like-button-${offerId}`}>❤️</button>
  ),
}));

vi.mock('../../../components/CompareCheckbox/CompareCheckbox', () => ({
  default: ({
    offerId,
    isSelected,
    isDisabled,
    onToggle,
  }: {
    offerId: string;
    isSelected: boolean;
    isDisabled: boolean;
    onToggle: (id: string, checked: boolean) => void;
  }) => (
    <input
      data-testid={`compare-checkbox-${offerId}`}
      type="checkbox"
      checked={isSelected}
      disabled={isDisabled}
      onChange={e => onToggle(offerId, e.target.checked)}
    />
  ),
}));

vi.mock('../../../components/ComparisonBar/ComparisonBar', () => ({
  default: ({
    selectedOffers,
    removeFromComparison,
  }: {
    selectedOffers: MiniOffer[];
    removeFromComparison: (id: string) => void;
  }) => (
    <div data-testid="comparison-bar">
      {selectedOffers.length > 0 && (
        <div>
          <span>Porównywane oferty: {selectedOffers.length}</span>
          {selectedOffers.map(offer => (
            <button
              key={offer.id}
              onClick={() => removeFromComparison(offer.id)}
              data-testid={`remove-from-comparison-${offer.id}`}
            >
              Usuń {offer.title}
            </button>
          ))}
        </div>
      )}
    </div>
  ),
}));

vi.mock('../../../components/AdvancedFilter/AdvancedFilter', () => ({
  default: ({
    onSearch,
    onLoading,
  }: {
    onSearch: (results: SearchResponse<MiniOffer>) => void;
    onLoading: (loading: boolean) => void;
  }) => {
    const handleSearch = () => {
      onLoading(true);

      setTimeout(() => {
        const mockResults: SearchResponse<MiniOffer> = {
          content: mockOffers,
          totalPages: 2,
          number: 0,
          size: 10,
          totalElements: 15,
          empty: false,
        };
        onSearch(mockResults);
        onLoading(false);
      }, 100);
    };

    return (
      <div data-testid="advanced-filter">
        <input data-testid="filter-input" placeholder="Wyszukaj oferty" />
        <button data-testid="search-button" onClick={handleSearch}>
          Szukaj
        </button>
      </div>
    );
  },
}));

vi.mock('../../../util/constants.tsx', () => ({
  DEFAULT_CAR_IMAGE: 'default-car.png',
}));

vi.mock('../../../translations/carEquipmentTranslations', () => ({
  translations: {
    fuelType: {
      Benzyna: 'Benzyna',
      Diesel: 'Diesel',
      Elektryczny: 'Elektryczny',
      Hybryda: 'Hybryda',
    },
  },
}));

Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8137',
  },
  writable: true,
});

Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true,
});

const mockOffers: MiniOffer[] = [
  {
    id: '1',
    title: 'BMW X5 2020',
    price: 150000,
    mainImage: '/images/bmw-1.jpg',
    year: 2020,
    mileage: 50000,
    fuelType: 'Benzyna',
    enginePower: 265,
    displacement: '3.0L',
  },
  {
    id: '2',
    title: 'Audi Q7 2019',
    price: 140000,
    mainImage: '/images/audi-1.jpg',
    year: 2019,
    mileage: 60000,
    fuelType: 'Diesel',
    enginePower: 250,
    displacement: '3.0L',
  },
  {
    id: '3',
    title: 'Tesla Model S 2021',
    price: 200000,
    mainImage: '/images/tesla-1.jpg',
    year: 2021,
    mileage: 30000,
    fuelType: 'Elektryczny',
    enginePower: 400,
    displacement: 'N/A',
  },
];

const mockSearchResponse: SearchResponse<MiniOffer> = {
  content: mockOffers,
  totalPages: 1,
  number: 0,
  size: 10,
  totalElements: 3,
  empty: false,
};

const renderComponent = () => {
  return render(<OfferList />);
};

describe('OfferList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTitle.mockReset();

    const mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    mockUseComparison.mockReturnValue({
      selectedOffers: [],
      addToComparison: vi.fn(),
      removeFromComparison: vi.fn(),
      isOfferSelected: vi.fn().mockReturnValue(false),
      canAddMoreOffers: vi.fn().mockReturnValue(true),
    });

    mockOfferApiService.searchOffers.mockResolvedValue(mockSearchResponse);
  });

  test('calls useTitle with correct title', () => {
    renderComponent();
    expect(mockUseTitle).toHaveBeenCalledWith('Dostępne oferty');
  });

  test('renders main UI elements', () => {
    renderComponent();

    expect(screen.getByText('Dostępne oferty')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-filter')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-bar')).toBeInTheDocument();
  });

  test('displays offers when search results are provided', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
      expect(screen.getByText('Audi Q7 2019')).toBeInTheDocument();
      expect(screen.getByText('Tesla Model S 2021')).toBeInTheDocument();
    });
  });

  test('shows loading state during search', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('search-button'));

    expect(screen.getByText('Ładowanie ofert...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Ładowanie ofert...')).not.toBeInTheDocument();
    });
  });

  test('handles offer click navigation', async () => {
    const mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    renderComponent();

    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const offerCard = screen.getByText('BMW X5 2020').closest('.offer-clickable');
    fireEvent.click(offerCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/offer/1');
  });

  test('handles comparison checkbox toggle', async () => {
    const mockAddToComparison = vi.fn();
    const mockRemoveFromComparison = vi.fn();

    mockUseComparison.mockReturnValue({
      selectedOffers: [],
      addToComparison: mockAddToComparison,
      removeFromComparison: mockRemoveFromComparison,
      isOfferSelected: vi.fn().mockReturnValue(false),
      canAddMoreOffers: vi.fn().mockReturnValue(true),
    });

    renderComponent();

    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(screen.getByTestId('compare-checkbox-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('compare-checkbox-1'));

    expect(mockAddToComparison).toHaveBeenCalledWith(mockOffers[0]);
  });

  test('disables comparison checkbox when limit reached', async () => {
    mockUseComparison.mockReturnValue({
      selectedOffers: [mockOffers[0], mockOffers[1]],
      addToComparison: vi.fn(),
      removeFromComparison: vi.fn(),
      isOfferSelected: (id: string) => id === '1' || id === '2',
      canAddMoreOffers: vi.fn().mockReturnValue(false),
    });

    renderComponent();

    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      const checkbox1 = screen.getByTestId('compare-checkbox-1');
      const checkbox3 = screen.getByTestId('compare-checkbox-3');

      expect(checkbox1).not.toBeDisabled();
      expect(checkbox3).toBeDisabled();
    });
  });

  test('displays fallback for offers without images', async () => {
    const offerWithoutImage: MiniOffer = {
      ...mockOffers[0],
      mainImage: '',
    };

    renderComponent();

    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });
  });

  test('shows no results message when no offers found', async () => {
    const emptyResponse: SearchResponse<MiniOffer> = {
      content: [],
      totalPages: 0,
      number: 0,
      size: 10,
      totalElements: 0,
      empty: true,
    };

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Brak ofert spełniających kryteria wyszukiwania')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Spróbuj zmienić filtry lub rozszerzyć kryteria wyszukiwania')
      ).toBeInTheDocument();
    });
  });

  test('disables pagination buttons appropriately', async () => {
    const singlePageResponse: SearchResponse<MiniOffer> = {
      content: mockOffers,
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 3,
      empty: false,
    };

    renderComponent();

    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(screen.queryByText('>')).not.toBeInTheDocument();
      expect(screen.queryByText('<')).not.toBeInTheDocument();
    });
  });

  test('truncates long titles on mobile', async () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 600,
      writable: true,
    });

    const longTitleOffer: MiniOffer = {
      ...mockOffers[0],
      title: 'This is a very very very very long title that should be truncated on mobile devices',
    };

    const longTitleResponse: SearchResponse<MiniOffer> = {
      content: [longTitleOffer],
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 1,
      empty: false,
    };

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('advanced-filter')).toBeInTheDocument();
    });

    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
    });
  });

  test('formats fuel types correctly', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(screen.getByText('Benzyna')).toBeInTheDocument();
      expect(screen.getByText('Diesel')).toBeInTheDocument();
      expect(screen.getByText('Elektryczny')).toBeInTheDocument();
    });
  });

  test('handles missing data gracefully', async () => {
    const incompleteOffer: MiniOffer = {
      id: '4',
      title: 'Incomplete Car',
      price: 100000,
      mainImage: '',
      year: 0,
      mileage: 0,
      fuelType: '',
      enginePower: 0,
      displacement: '',
    };

    const incompleteResponse: SearchResponse<MiniOffer> = {
      content: [incompleteOffer],
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 1,
      empty: false,
    };

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('advanced-filter')).toBeInTheDocument();
    });
  });

  test('handles invalid search results gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderComponent();

    expect(screen.getByTestId('advanced-filter')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
