import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import SellerOffers from '../SellerOffers';
import { ApiOffer } from '../../../types/offerTypes';

const {
  mockUseParams,
  mockUseNavigate,
  mockUseTitle,
  mockUseComparison,
  mockGetOffersBySeller,
  mockAxios,
  mockSessionStorage,
  mockScrollTo,
} = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
  mockUseNavigate: vi.fn(),
  mockUseTitle: vi.fn(),
  mockUseComparison: vi.fn(),
  mockGetOffersBySeller: vi.fn(),
  mockAxios: {
    get: vi.fn(),
  },
  mockSessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  mockScrollTo: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useParams: mockUseParams,
  useNavigate: mockUseNavigate,
}));

vi.mock('../../../hooks/useTitle', () => ({
  default: mockUseTitle,
}));

vi.mock('../../../context/ComparisonContext', () => ({
  useComparison: mockUseComparison,
}));

vi.mock('../../../api/offerApi', () => ({
  getOffersBySeller: mockGetOffersBySeller,
}));

vi.mock('axios', () => ({
  default: mockAxios,
}));

vi.mock('../../../components/LikeButton/LikeButton', () => ({
  default: ({ offerId, initialLiked }: { offerId: string; initialLiked: boolean }) => (
    <button data-testid={`like-button-${offerId}`}>{initialLiked ? '❤️' : '🤍'}</button>
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
    onToggle: (id: string, checked: boolean, event?: React.MouseEvent) => void;
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
    selectedOffers: any[];
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

// Mock constants
vi.mock('../../../util/constants.tsx', () => ({
  DEFAULT_CAR_IMAGE: 'default-car.png',
}));

// Mock translations
vi.mock('../../../translations/carEquipmentTranslations', () => ({
  translations: {
    fuelType: {
      Benzyna: 'Benzyna',
      Diesel: 'Diesel',
      Elektryczny: 'Elektryczny',
      OTHER: 'Inne',
    },
  },
}));

// Mock environment
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8137',
  },
  writable: true,
});

// Mock browser APIs
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

Object.defineProperty(window, 'pageYOffset', {
  value: 500,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

const mockApiOffers: ApiOffer[] = [
  {
    id: '1',
    title: 'BMW X5 2020',
    description: 'Great BMW SUV',
    price: 150000,
    currency: 'PLN',
    location: 'Warsaw',
    contactPhone: '+48123456789',
    contactEmail: 'seller@example.com',
    mainImage: '/images/bmw-1.jpg',
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
    seller: {
      id: 'seller-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
  },
  {
    id: '2',
    title: 'Audi Q7 2019',
    description: 'Luxury Audi',
    price: 140000,
    currency: 'PLN',
    location: 'Krakow',
    contactPhone: '+48987654321',
    contactEmail: 'seller2@example.com',
    mainImage: '/images/audi-1.jpg',
    brand: 'Audi',
    model: 'Q7',
    year: 2019,
    color: 'White',
    displacement: '2.0L',
    mileage: 60000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    driveType: 'AWD',
    enginePower: 250,
    doors: 5,
    seats: 7,
    seller: {
      id: 'seller-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
  },
];

const mockSellerResponse = {
  content: mockApiOffers,
  totalPages: 1,
  number: 0,
  size: 10,
  totalElements: 2,
};

const mockSellerDetails = {
  data: {
    seller: {
      firstName: 'John',
      lastName: 'Doe',
    },
  },
};

const renderComponent = () => {
  return render(<SellerOffers />);
};

describe('SellerOffers Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ sellerId: 'seller-1' });

    const mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    mockUseComparison.mockReturnValue({
      selectedOffers: [],
      addToComparison: vi.fn(),
      removeFromComparison: vi.fn(),
      isOfferSelected: vi.fn().mockReturnValue(false),
      canAddMoreOffers: vi.fn().mockReturnValue(true),
    });

    mockGetOffersBySeller.mockResolvedValue(mockSellerResponse);
    mockAxios.get.mockResolvedValue(mockSellerDetails);
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  test('calls useTitle with default title initially', () => {
    renderComponent();
    expect(mockUseTitle).toHaveBeenCalledWith('Oferty sprzedającego');
  });

  test('renders loading state initially', () => {
    renderComponent();
    expect(screen.getByText('Ładowanie ofert...')).toBeInTheDocument();
  });

  test('renders main UI elements after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('← Wróć')).toBeInTheDocument();
      expect(screen.getByText('Oferty sprzedającego - John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('comparison-bar')).toBeInTheDocument();
    });
  });

  test('fetches and displays seller offers', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockGetOffersBySeller).toHaveBeenCalledWith('seller-1');
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
      expect(screen.getByText('Audi Q7 2019')).toBeInTheDocument();
    });
  });

  test('fetches seller details and updates title', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:8137/api/v1/offers/1');
      expect(mockUseTitle).toHaveBeenLastCalledWith('Oferty sprzedającego - John Doe');
    });
  });

  test('displays offer details correctly', async () => {
    renderComponent();

    await waitFor(() => {
      // Check BMW offer details
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
      expect(screen.getByText('150 000 PLN')).toBeInTheDocument();
      expect(screen.getByText('2020')).toBeInTheDocument();
      expect(screen.getByText('50 000 km')).toBeInTheDocument();
      expect(screen.getByText('Benzyna')).toBeInTheDocument();
      expect(screen.getByText('265 KM')).toBeInTheDocument();
      expect(screen.getByText('3.0L')).toBeInTheDocument();
      expect(screen.getByText('2.0L')).toBeInTheDocument();
      expect(screen.getByText('Warsaw')).toBeInTheDocument();
    });
  });

  test('displays offers count', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Znaleziono 2 oferty dla użytkownika: John Doe')).toBeInTheDocument();
    });
  });

  test('handles back button click', async () => {
    const mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('← Wróć')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('← Wróć'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('handles offer click navigation', async () => {
    const mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    // Find the clickable container for BMW offer
    const offerCard = screen.getByText('BMW X5 2020').closest('.offer-clickable');
    fireEvent.click(offerCard!);

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('sellerOffersScrollPosition', '500');
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

    await waitFor(() => {
      expect(screen.getByTestId('compare-checkbox-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('compare-checkbox-1'));

    expect(mockAddToComparison).toHaveBeenCalledWith({
      id: '1',
      title: 'BMW X5 2020',
      price: 150000,
      mainImage: '/images/bmw-1.jpg',
      mileage: 50000,
      fuelType: 'Benzyna',
      year: 2020,
      enginePower: 265,
      displacement: '3.0L',
    });
  });

  test('disables comparison checkbox when limit reached', async () => {
    mockUseComparison.mockReturnValue({
      selectedOffers: [{ id: '1' }, { id: '2' }],
      addToComparison: vi.fn(),
      removeFromComparison: vi.fn(),
      isOfferSelected: (id: string) => id === '1' || id === '2',
      canAddMoreOffers: vi.fn().mockReturnValue(false),
    });

    renderComponent();

    await waitFor(() => {
      const checkbox1 = screen.getByTestId('compare-checkbox-1');
      const checkbox2 = screen.getByTestId('compare-checkbox-2');

      expect(checkbox1).not.toBeDisabled(); // Selected offer should not be disabled
      expect(checkbox2).not.toBeDisabled(); // Selected offer should not be disabled
    });
  });

  test('handles image loading errors', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderComponent();

    await waitFor(() => {
      const image = screen.getByAltText('BMW X5 2020');
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByAltText('BMW X5 2020') as HTMLImageElement;
    fireEvent.error(image);

    expect(image.src).toContain('default-car.png');
    expect(consoleSpy).toHaveBeenCalledWith(
      "Image loading error in seller's offer:",
      expect.any(String)
    );

    consoleSpy.mockRestore();
  });

  test('prevents multiple error handling for same image', async () => {
    renderComponent();

    await waitFor(() => {
      const image = screen.getByAltText('BMW X5 2020');
      expect(image).toBeInTheDocument();
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

  test('shows no offers message when seller has no offers', async () => {
    mockGetOffersBySeller.mockResolvedValue({
      content: [],
      totalPages: 0,
      number: 0,
      size: 10,
      totalElements: 0,
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Ten sprzedający nie ma obecnie żadnych aktywnych ogłoszeń.')
      ).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    mockGetOffersBySeller.mockRejectedValue(new Error('API Error'));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText("Failed to fetch seller's offers. Please try again later.")
      ).toBeInTheDocument();
    });
  });

  test('handles missing sellerId', async () => {
    mockUseParams.mockReturnValue({ sellerId: undefined });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Seller ID not provided.')).toBeInTheDocument();
    });

    expect(mockGetOffersBySeller).not.toHaveBeenCalled();
  });

  test('handles seller details fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockAxios.get.mockRejectedValue(new Error('Seller details error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    // Should still show offers even if seller details fail
    expect(screen.getByText('Oferty sprzedającego')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch seller data:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  test('restores scroll position from session storage', async () => {
    mockSessionStorage.getItem.mockReturnValue('800');

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    // Wait for the setTimeout to complete
    await waitFor(
      () => {
        expect(mockScrollTo).toHaveBeenCalledWith(0, 800);
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('sellerOffersScrollPosition');
      },
      { timeout: 200 }
    );
  });

  test('scrolls to top on component mount', () => {
    renderComponent();
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('formats price and mileage correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('150 000 PLN')).toBeInTheDocument();
      expect(screen.getByText('140 000 PLN')).toBeInTheDocument();
      expect(screen.getByText('50 000 km')).toBeInTheDocument();
      expect(screen.getByText('60 000 km')).toBeInTheDocument();
    });
  });

  test('translates fuel types correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Benzyna')).toBeInTheDocument();
      expect(screen.getByText('Diesel')).toBeInTheDocument();
    });
  });

  test('handles offers without location', async () => {
    const offerWithoutLocation: ApiOffer = {
      ...mockApiOffers[0],
      location: '',
    };

    mockGetOffersBySeller.mockResolvedValue({
      content: [offerWithoutLocation],
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 1,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
      // Location should not be displayed when empty
      expect(screen.queryByText('Lokalizacja:')).not.toBeInTheDocument();
    });
  });

  test('handles offers without images', async () => {
    const offerWithoutImage: ApiOffer = {
      ...mockApiOffers[0],
      mainImage: '',
    };

    mockGetOffersBySeller.mockResolvedValue({
      content: [offerWithoutImage],
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 1,
    });

    renderComponent();

    await waitFor(() => {
      const image = screen.getByAltText('BMW X5 2020') as HTMLImageElement;
      expect(image.src).toContain('default-car.png');
    });
  });

  test('handles malformed API response', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockGetOffersBySeller.mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Ten sprzedający nie ma obecnie żadnych aktywnych ogłoszeń.')
      ).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('handles offers count pluralization correctly', async () => {
    // Test with 1 offer
    mockGetOffersBySeller.mockResolvedValue({
      content: [mockApiOffers[0]],
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 1,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Znaleziono 1 ofertę/)).toBeInTheDocument();
    });

    // Test with 5 offers (should use "ofert")
    const fiveOffers = Array(5)
      .fill(null)
      .map((_, i) => ({ ...mockApiOffers[0], id: `${i + 1}` }));
    mockGetOffersBySeller.mockResolvedValue({
      content: fiveOffers,
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 5,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Znaleziono 5 ofert/)).toBeInTheDocument();
    });
  });
});
