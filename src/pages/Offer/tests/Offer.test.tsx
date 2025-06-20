import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Offer from '../Offer';
import { CarDetails, OfferData, SellerData } from '../../../types/offerTypes';
import { CarEquipment, VehicleCondition } from '../../../types/offer/OfferTypes';

const { mockUseTitle, mockUseAuth, mockUseNavigate, mockUseParams, mockAxios, mockLeaflet } =
  vi.hoisted(() => ({
    mockUseTitle: vi.fn(),
    mockUseAuth: vi.fn(),
    mockUseNavigate: vi.fn(),
    mockUseParams: vi.fn(),
    mockAxios: {
      get: vi.fn(),
    },
    mockLeaflet: {
      map: vi.fn(),
      tileLayer: vi.fn(),
      circle: vi.fn(),
    },
  }));

vi.mock('../../../hooks/useTitle', () => ({
  default: mockUseTitle,
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockUseNavigate,
    useParams: mockUseParams,
  };
});

vi.mock('axios', () => ({
  default: mockAxios,
}));

vi.mock('leaflet', () => ({
  default: mockLeaflet,
  map: mockLeaflet.map,
  tileLayer: mockLeaflet.tileLayer,
  circle: mockLeaflet.circle,
}));

vi.mock('../../../components/LikeButton/LikeButton', () => ({
  default: ({ offerId, onLikeToggle }: any) => (
    <button data-testid={`like-button-${offerId}`} onClick={() => onLikeToggle(true)}>
      Like Button
    </button>
  ),
}));

vi.mock('../../../assets/defaultProfilePicture.ts', () => ({
  DEFAULT_PROFILE_IMAGE: 'default-profile.png',
}));

vi.mock('../../../util/constants.tsx', () => ({
  DEFAULT_CAR_IMAGE: 'default-car.png',
}));

vi.mock('../../../types/offer/carEquipmentCategories.ts', () => ({
  equipmentCategories: [
    {
      title: 'Bezpieczeństwo',
      items: [
        { key: 'abs', label: 'ABS' },
        { key: 'airbags', label: 'Poduszki powietrzne' },
      ],
    },
  ],
}));

vi.mock('../../../translations/carEquipmentTranslations.ts', () => ({
  translations: {
    fuelType: {
      Benzyna: 'Petrol',
      Diesel: 'Diesel',
    },
    transmissionType: {
      Manual: 'Manualna',
      Automatic: 'Automatyczna',
    },
    bodyType: {
      Hatchback: 'Hatchback',
      Sedan: 'Sedan',
    },
    driveType: {
      FWD: 'Przedni',
      AWD: 'Wszystkie koła',
    },
    vehicleCondition: {
      New: 'Nowy',
      Used: 'Używany',
    },
  },
}));

Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000',
  },
  writable: true,
});

const mockSellerData: SellerData = {
  id: 'seller1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  profilePictureBase64: 'base64-profile-pic',
};

const mockCarDetails: CarDetails = {
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
  condition: 'Used' as VehicleCondition,
  registrationNumber: 'WA12345',
  firstOwner: true,
  accidentFree: true,
  serviceHistory: true,
  carEquipment: {
    abs: true,
    airbags: true,
  } as CarEquipment,
};

const mockOfferData: OfferData = {
  id: '1',
  title: 'BMW X5 2020',
  description: 'Excellent condition BMW X5',
  price: 150000,
  currency: 'PLN',
  seller: mockSellerData,
  location: 'Warsaw',
  contactPhone: '+48123456789',
  contactEmail: 'seller@example.com',
  mainImage: '/images/bmw-main.jpg',
  imageUrls: ['/images/bmw-1.jpg', '/images/bmw-2.jpg'],
  CarDetailsDto: mockCarDetails,
};

const mockMapInstance = {
  setView: vi.fn().mockReturnThis(),
  remove: vi.fn(),
};

const mockTileLayer = {
  addTo: vi.fn().mockReturnThis(),
};

const mockCircle = {
  addTo: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis(),
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('Offer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTitle.mockReset();
    mockUseParams.mockReturnValue({ id: '1' });
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    mockLeaflet.map.mockReturnValue(mockMapInstance);
    mockLeaflet.tileLayer.mockReturnValue(mockTileLayer);
    mockLeaflet.circle.mockReturnValue(mockCircle);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock scrollTo for DOM elements
    Element.prototype.scrollTo = vi.fn();

    const mockGeocodeResponse = {
      data: [
        {
          lat: '52.2297',
          lon: '21.0122',
          address: { city: 'Warsaw' },
        },
      ],
    };

    // Reset axios mock to default behavior
    mockAxios.get.mockReset();

    // Setup axios mocks to return consistent data
    mockAxios.get.mockImplementation(url => {
      if (url.includes('nominatim')) {
        return Promise.resolve(mockGeocodeResponse);
      }
      return Promise.resolve({ data: mockOfferData });
    });
  });

  test('calls useTitle with correct title', () => {
    renderWithRouter(<Offer />);
    expect(mockUseTitle).toHaveBeenCalledWith('Oferta');
  });

  test('shows loading state initially', () => {
    // Mock axios to never resolve to keep loading state
    mockAxios.get.mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<Offer />);
    expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
  });

  test('shows error message when API call fails', async () => {
    // Mock axios to reject on first call (main API call)
    mockAxios.get.mockRejectedValueOnce(new Error('API Error'));

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load offer.')).toBeInTheDocument();
    });
  });

  test('renders technical specifications', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    expect(screen.getByText('BMW')).toBeInTheDocument();
    expect(screen.getByText('X5')).toBeInTheDocument();
    expect(screen.getByText('Automatyczna')).toBeInTheDocument();
    expect(screen.getByText('3.0L')).toBeInTheDocument();
    expect(screen.getByText('Wszystkie koła')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
    expect(screen.getByText('WA12345')).toBeInTheDocument();

    // Check year in technical specs specifically
    const techSpecs = document.querySelector('.tech-specs');
    expect(techSpecs).toHaveTextContent('2020');
  });

  test('renders seller information', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    expect(screen.getByText(/John.*Doe/)).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Rozpocznij czat')).toBeInTheDocument();
    expect(screen.getByText('Zobacz inne oferty sprzedającego')).toBeInTheDocument();
  });

  test('renders equipment section', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('Wyposażenie')).toBeInTheDocument();
    });

    expect(screen.getByText('Bezpieczeństwo')).toBeInTheDocument();
    expect(screen.getByText('ABS')).toBeInTheDocument();
    expect(screen.getByText('Poduszki powietrzne')).toBeInTheDocument();
  });

  test('handles image navigation', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const nextButton = screen.getByLabelText('Następne zdjęcie');
    const prevButton = screen.getByLabelText('Poprzednie zdjęcie');

    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();

    fireEvent.click(nextButton);
    fireEvent.click(prevButton);
  });

  test('opens lightbox when main image is clicked', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const mainImage = screen.getByAltText('BMW X5 2020');
    fireEvent.click(mainImage);

    await waitFor(() => {
      expect(screen.getByLabelText('Zamknij podgląd')).toBeInTheDocument();
    });
  });

  test('handles contact button click', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const contactButton = screen.getByText('Kontakt');
    fireEvent.click(contactButton);

    expect(mockUseNavigate).toHaveBeenCalledWith('/chat/seller1', {
      state: {
        sellerInfo: {
          id: 'seller1',
          firstName: 'John',
          lastName: 'Doe',
          profilePicture: 'base64-profile-pic',
          email: 'john.doe@example.com',
          isNewConversation: true,
        },
      },
    });
  });

  test('disables chat button when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const chatButton = screen.getByText('Rozpocznij czat');
    expect(chatButton).toBeDisabled();
  });

  test('navigates to seller offers when button clicked', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const viewOffersButton = screen.getByText('Zobacz inne oferty sprzedającego');
    fireEvent.click(viewOffersButton);

    expect(mockUseNavigate).toHaveBeenCalledWith('/seller/seller1/offers');
  });

  test('handles image loading errors', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const mainImage = screen.getByAltText('BMW X5 2020');
    fireEvent.error(mainImage);

    expect(mainImage.getAttribute('src')).toBe('default-car.png');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Image loading error - replaced with placeholder:',
      expect.any(String)
    );

    consoleSpy.mockRestore();
  });

  test('handles profile image loading errors', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText(/John.*Doe/)).toBeInTheDocument();
    });

    const profileImage = screen.getByAltText(/John.*Doe/);
    fireEvent.error(profileImage);

    expect(consoleSpy).toHaveBeenCalledWith('Profile image loading error occurred');
    consoleSpy.mockRestore();
  });

  test('handles keyboard navigation', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
  });

  test('handles window resize', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    fireEvent(window, new Event('resize'));
  });

  test('renders map when location data is available', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockLeaflet.map).toHaveBeenCalled();
      expect(mockLeaflet.tileLayer).toHaveBeenCalled();
      expect(mockLeaflet.circle).toHaveBeenCalled();
    });
  });

  test('renders boolean fields correctly', async () => {
    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const takElements = screen.getAllByText('Tak');
    expect(takElements).toHaveLength(3);

    expect(screen.getByText('Pierwszy właściciel')).toBeInTheDocument();
    expect(screen.getByText('Bezwypadkowy')).toBeInTheDocument();
    expect(screen.getByText('Historia serwisowa')).toBeInTheDocument();
  });

  test('handles missing optional fields', async () => {
    const offerWithoutOptionalFields: OfferData = {
      ...mockOfferData,
      CarDetailsDto: {
        ...mockOfferData.CarDetailsDto,
        condition: undefined,
        registrationNumber: undefined,
        registrationCountry: undefined,
        firstOwner: undefined,
        accidentFree: undefined,
        serviceHistory: undefined,
        vin: undefined,
        additionalFeatures: undefined,
        carEquipment: undefined,
      },
    };

    // Override mock for this test
    mockAxios.get.mockImplementation(url => {
      if (url.includes('nominatim')) {
        return Promise.resolve({
          data: [
            {
              lat: '52.2297',
              lon: '21.0122',
              address: { city: 'Warsaw' },
            },
          ],
        });
      }
      return Promise.resolve({ data: offerWithoutOptionalFields });
    });

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    // Should render basic offer info
    expect(screen.getByText(/150,000.*PLN/)).toBeInTheDocument();
  });

  test('handles offer without seller', async () => {
    const offerWithoutSeller: Partial<OfferData> = {
      ...mockOfferData,
      seller: undefined,
    };

    // Override mock for this test
    mockAxios.get.mockImplementation(url => {
      if (url.includes('nominatim')) {
        return Promise.resolve({
          data: [
            {
              lat: '52.2297',
              lon: '21.0122',
              address: { city: 'Warsaw' },
            },
          ],
        });
      }
      return Promise.resolve({ data: offerWithoutSeller });
    });

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    expect(screen.queryByText('Sprzedający')).not.toBeInTheDocument();
  });

  test('handles offer without equipment', async () => {
    const offerWithoutEquipment: OfferData = {
      ...mockOfferData,
      CarDetailsDto: {
        ...mockOfferData.CarDetailsDto,
        carEquipment: undefined,
      },
    };

    // Override mock for this test
    mockAxios.get.mockImplementation(url => {
      if (url.includes('nominatim')) {
        return Promise.resolve({
          data: [
            {
              lat: '52.2297',
              lon: '21.0122',
              address: { city: 'Warsaw' },
            },
          ],
        });
      }
      return Promise.resolve({ data: offerWithoutEquipment });
    });

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    // Should render basic offer info
    expect(screen.getByText(/150,000.*PLN/)).toBeInTheDocument();
  });

  test('handles contact email fallback when no seller', async () => {
    const offerWithoutSeller: Partial<OfferData> = {
      ...mockOfferData,
      seller: undefined,
    };

    // Override mock for this test
    mockAxios.get.mockImplementation(url => {
      if (url.includes('nominatim')) {
        return Promise.resolve({
          data: [
            {
              lat: '52.2297',
              lon: '21.0122',
              address: { city: 'Warsaw' },
            },
          ],
        });
      }
      return Promise.resolve({ data: offerWithoutSeller });
    });

    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' };

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const contactButton = screen.getByText('Kontakt');
    fireEvent.click(contactButton);

    expect(window.location.href).toBe('mailto:seller@example.com');

    window.location = originalLocation;
  });

  test('renders no data message when offer is missing CarDetailsDto', async () => {
    const offerWithoutCarDetails = {
      ...mockOfferData,
      CarDetailsDto: null,
    };

    // Mock axios to return offer without CarDetailsDto
    mockAxios.get.mockImplementation(url => {
      if (url.includes('nominatim')) {
        return Promise.resolve({
          data: [
            {
              lat: '52.2297',
              lon: '21.0122',
              address: { city: 'Warsaw' },
            },
          ],
        });
      }
      return Promise.resolve({ data: offerWithoutCarDetails });
    });

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('Brak danych oferty.')).toBeInTheDocument();
    });
  });

  test('disables chat button when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    renderWithRouter(<Offer />);

    await waitFor(() => {
      expect(screen.getByText('BMW X5 2020')).toBeInTheDocument();
    });

    const chatButton = screen.getByText('Rozpocznij czat');
    expect(chatButton).toBeDisabled();
    expect(chatButton.getAttribute('title')).toBe('Musisz być zalogowany!');
  });
});
