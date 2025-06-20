import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LikedOffersList from '../LikedOffers';
import { MiniOffer } from '../../../types/miniOfferTypes';
import { RawOfferData } from '../../../types/offer/RawOfferData';

const { mockUseTitle, mockUseAuth, mockUseComparison, mockNavigate, mockGetLikedOffers } =
  vi.hoisted(() => ({
    mockUseTitle: vi.fn(),
    mockUseAuth: vi.fn(),
    mockUseComparison: vi.fn(),
    mockNavigate: vi.fn(),
    mockGetLikedOffers: vi.fn(),
  }));

vi.mock('../../../api/likedOfferApi', () => ({
  likedOfferApi: {
    getLikedOffers: mockGetLikedOffers,
  },
}));

vi.mock('../../../hooks/useTitle', () => ({
  default: mockUseTitle,
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../context/ComparisonContext', () => ({
  useComparison: mockUseComparison,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, className }: any) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  };
});

vi.mock('../../../components/LikeButton/LikeButton', () => ({
  default: ({ offerId, initialLiked, onLikeToggle }: any) => (
    <button data-testid={`like-button-${offerId}`} onClick={() => onLikeToggle(!initialLiked)}>
      Like Button
    </button>
  ),
}));

vi.mock('../../../components/CompareCheckbox/CompareCheckbox', () => ({
  default: ({ offerId, isSelected, isDisabled, onToggle }: any) => (
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
  default: ({ selectedOffers, removeFromComparison }: any) => (
    <div data-testid="comparison-bar">
      Comparison Bar - {selectedOffers.length} offers
      {selectedOffers.map((offer: any) => (
        <button
          key={offer.id}
          data-testid={`remove-from-comparison-${offer.id}`}
          onClick={() => removeFromComparison(offer.id)}
        >
          Remove {offer.id}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../AuthRequired/AuthRequired', () => ({
  default: ({ pageTitle, message }: any) => (
    <div data-testid="auth-required">
      <h1>{pageTitle}</h1>
      <p>{message}</p>
    </div>
  ),
}));

vi.mock('../../../translations/carEquipmentTranslations', () => ({
  translations: {
    fuelType: {
      Benzyna: 'Petrol',
      Diesel: 'Diesel',
      Nieznany: 'Unknown',
    },
  },
}));

Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000',
  },
  writable: true,
});

const MockComparisonProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <MockComparisonProvider>{component}</MockComparisonProvider>
    </MemoryRouter>
  );
};

const mockOfferData: RawOfferData = {
  id: '1',
  title: 'BMW X5 2020',
  price: 150000,
  imageUrls: ['/images/bmw-x5.jpg'],
  CarDetailsDto: {
    mileage: 50000,
    fuelType: 'Benzyna',
    year: 2020,
    enginePower: 265,
    displacement: '3.0L',
  },
};

const mockMiniOffer: MiniOffer = {
  id: '1',
  title: 'BMW X5 2020',
  price: 150000,
  mainImage: '/images/bmw-x5.jpg',
  mileage: 50000,
  fuelType: 'Benzyna',
  year: 2020,
  enginePower: 265,
  displacement: '3.0L',
};

describe('LikedOffersList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTitle.mockReset();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    mockUseComparison.mockReturnValue({
      selectedOffers: [],
      addToComparison: vi.fn(),
      removeFromComparison: vi.fn(),
      isOfferSelected: vi.fn(() => false),
      canAddMoreOffers: vi.fn(() => true),
    });
    mockGetLikedOffers.mockResolvedValue([]);
  });

  test('calls useTitle with correct title', () => {
    renderWithProviders(<LikedOffersList />);
    expect(mockUseTitle).toHaveBeenCalledWith('Ulubione');
  });

  test('shows AuthRequired component when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    renderWithProviders(<LikedOffersList />);

    expect(screen.getByTestId('auth-required')).toBeInTheDocument();
    expect(screen.getByText('Ulubione oferty')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Dodawaj interesujące Cię oferty do ulubionych i miej do nich szybki dostęp.'
      )
    ).toBeInTheDocument();
  });

  test('shows loading message when fetching offers', async () => {
    mockGetLikedOffers.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<LikedOffersList />);

    expect(screen.getByText('Ładowanie ofert...')).toBeInTheDocument();
  });

  test('shows no offers message when there are no liked offers', async () => {
    mockGetLikedOffers.mockResolvedValue([]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('Nie masz jeszcze ulubionych ofert.')).toBeInTheDocument();
    });

    expect(screen.getByText('Przeglądaj dostępne oferty')).toBeInTheDocument();
  });

  test('handles offer click navigation', async () => {
    mockGetLikedOffers.mockResolvedValue([mockOfferData]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const offerClickable = document.querySelector('.offer-clickable') as HTMLElement;
    fireEvent.click(offerClickable);

    expect(mockNavigate).toHaveBeenCalledWith('/offer/1');
  });

  test('handles like toggle and removes offer from list', async () => {
    mockGetLikedOffers.mockResolvedValue([mockOfferData]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const likeButton = screen.getByTestId('like-button-1');
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.queryByText('BMW X5 2020')).not.toBeInTheDocument();
    });
  });

  test('handles comparison checkbox toggle', async () => {
    const mockAddToComparison = vi.fn();
    const mockRemoveFromComparison = vi.fn();

    mockUseComparison.mockReturnValue({
      selectedOffers: [],
      addToComparison: mockAddToComparison,
      removeFromComparison: mockRemoveFromComparison,
      isOfferSelected: vi.fn(() => false),
      canAddMoreOffers: vi.fn(() => true),
    });

    mockGetLikedOffers.mockResolvedValue([mockOfferData]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const compareCheckbox = screen.getByTestId('compare-checkbox-1');
    fireEvent.click(compareCheckbox);

    expect(mockAddToComparison).toHaveBeenCalledWith(mockMiniOffer);
  });

  test('removes offer from comparison when checkbox is unchecked', async () => {
    const mockRemoveFromComparison = vi.fn();

    mockUseComparison.mockReturnValue({
      selectedOffers: [mockMiniOffer],
      addToComparison: vi.fn(),
      removeFromComparison: mockRemoveFromComparison,
      isOfferSelected: vi.fn(() => true),
      canAddMoreOffers: vi.fn(() => true),
    });

    mockGetLikedOffers.mockResolvedValue([mockOfferData]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const compareCheckbox = screen.getByTestId('compare-checkbox-1');
    fireEvent.click(compareCheckbox);

    expect(mockRemoveFromComparison).toHaveBeenCalledWith('1');
  });

  test('disables comparison checkbox when comparison limit is reached', async () => {
    mockUseComparison.mockReturnValue({
      selectedOffers: [],
      addToComparison: vi.fn(),
      removeFromComparison: vi.fn(),
      isOfferSelected: vi.fn(() => false),
      canAddMoreOffers: vi.fn(() => false),
    });

    mockGetLikedOffers.mockResolvedValue([mockOfferData]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const compareCheckbox = screen.getByTestId('compare-checkbox-1') as HTMLInputElement;
    expect(compareCheckbox.disabled).toBe(true);
  });

  test('handles image loading error', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockGetLikedOffers.mockResolvedValue([mockOfferData]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const image = screen.getByAltText('BMW X5 2020');
    fireEvent.error(image);

    expect(image.getAttribute('src')).toBe('https://placehold.co/600x400');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Image loading error in liked offers:',
      expect.any(String)
    );

    consoleSpy.mockRestore();
  });

  test('handles API error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetLikedOffers.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('Nie masz jeszcze ulubionych ofert.')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error while fetching liked offers:',
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  test('renders ComparisonBar with selected offers', async () => {
    const selectedOffers = [mockMiniOffer];

    mockUseComparison.mockReturnValue({
      selectedOffers,
      addToComparison: vi.fn(),
      removeFromComparison: vi.fn(),
      isOfferSelected: vi.fn(() => true),
      canAddMoreOffers: vi.fn(() => true),
    });

    renderWithProviders(<LikedOffersList />);

    expect(screen.getByTestId('comparison-bar')).toBeInTheDocument();
    expect(screen.getByText('Comparison Bar - 1 offers')).toBeInTheDocument();
  });

  test('handles missing car details gracefully', async () => {
    const offerWithoutDetails = {
      ...mockOfferData,
      CarDetailsDto: null,
    };

    mockGetLikedOffers.mockResolvedValue([offerWithoutDetails]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0 km')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('0 KM')).toBeInTheDocument();
    expect(screen.getByText('Nieznana')).toBeInTheDocument();
  });

  test('uses placeholder image when no mainImage is provided', async () => {
    const offerWithoutImage = {
      ...mockOfferData,
      imageUrls: [],
    };

    mockGetLikedOffers.mockResolvedValue([offerWithoutImage]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const image = screen.getByAltText('BMW X5 2020');
    expect(image.getAttribute('src')).toBe('https://placehold.co/600x400');
  });

  test('truncates long titles correctly', async () => {
    const longTitleOffer = {
      ...mockOfferData,
      title:
        'This is a very long title that should be truncated because it exceeds the maximum length',
    };

    mockGetLikedOffers.mockResolvedValue([longTitleOffer]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(
        screen.getByText('This is a very long title that should be truncated...')
      ).toBeInTheDocument();
    });
  });

  test('filters out invalid offers during mapping', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const invalidOfferData = { id: '', title: '', price: undefined };
    const validOfferData = mockOfferData;

    mockGetLikedOffers.mockResolvedValue([invalidOfferData, validOfferData]);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Missing required fields in offer data:',
      invalidOfferData
    );
    consoleWarnSpy.mockRestore();
  });

  test('handles non-array API response', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetLikedOffers.mockResolvedValue('not an array' as any);

    renderWithProviders(<LikedOffersList />);

    await waitFor(() => {
      expect(screen.getByText('Nie masz jeszcze ulubionych ofert.')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Received data is not an array:', 'not an array');
    consoleErrorSpy.mockRestore();
  });
});
