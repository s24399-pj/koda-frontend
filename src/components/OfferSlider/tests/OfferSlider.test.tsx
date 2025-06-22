import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OfferSlider from '../OfferSlider';
import { MiniOffer } from '../../../types/miniOfferTypes.ts';

const { mockGetAllOffers } = vi.hoisted(() => ({
  mockGetAllOffers: vi.fn(),
}));

vi.mock('../../../api/offerApi', () => ({
  getAllOffers: mockGetAllOffers,
}));

vi.mock('react-slick', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="mock-slider">{children}</div>,
}));

vi.mock('../../../util/constants.tsx', () => ({
  DEFAULT_CAR_IMAGE: 'default-car.png',
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

const TEST_API = 'http://api.test';
Object.defineProperty(import.meta, 'env', { value: { VITE_API_URL: TEST_API }, writable: true });

describe('OfferSlider Component', () => {
  const sampleOffers: MiniOffer[] = [
    {
      id: '1',
      title: 'Test Offer One',
      price: 12345,
      mainImage: '/img1.jpg',
      mileage: 1000,
      fuelType: 'PETROL',
      year: 2020,
      enginePower: 150,
      displacement: '1.6L',
    },
    {
      id: '2',
      title: 'Second Offer With A Very Long Title',
      price: 23456,
      mainImage: '',
      mileage: 2000,
      fuelType: 'DIESEL',
      year: 2021,
      enginePower: 120,
      displacement: '2.0L',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllOffers.mockResolvedValue(sampleOffers);
  });

  it('shows loading state initially', () => {
    mockGetAllOffers.mockReturnValue(new Promise(() => {}));
    render(<OfferSlider />);
    expect(screen.getByText('Loading offers...')).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    mockGetAllOffers.mockRejectedValue(new Error('Network error'));
    render(<OfferSlider />);
    await waitFor(() =>
      expect(screen.getByText('Error: Failed to fetch offers')).toBeInTheDocument()
    );
  });

  it('displays empty message when no offers', async () => {
    mockGetAllOffers.mockResolvedValue([]);
    render(<OfferSlider />);
    await waitFor(() => expect(screen.getByText('No offers available')).toBeInTheDocument());
  });

  it('renders offers correctly', async () => {
    render(<OfferSlider />);

    await waitFor(() => {
      expect(mockGetAllOffers).toHaveBeenCalled();
      expect(screen.getByText('Test Offer One')).toBeInTheDocument();
      expect(screen.getByText('Second Offer Wi...')).toBeInTheDocument();
      expect(screen.getByText('12,345 PLN')).toBeInTheDocument();
      expect(screen.getByText('23,456 PLN')).toBeInTheDocument();
    });
  });

  it('navigates to offer when clicked without dragging', async () => {
    render(<OfferSlider />);
    await waitFor(() => expect(screen.queryByText('Loading offers...')).toBeNull());

    const wrapper = screen.getByTestId('mock-slider').children[0] as HTMLElement;
    fireEvent.mouseDown(wrapper, { clientX: 0, clientY: 0 });
    fireEvent.mouseUp(wrapper);

    expect(mockNavigate).toHaveBeenCalledWith('/offer/1');
  });

  it('does not navigate when dragging', async () => {
    render(<OfferSlider />);
    await waitFor(() => expect(screen.queryByText('Loading offers...')).toBeNull());

    const wrapper = screen.getByTestId('mock-slider').children[0] as HTMLElement;
    fireEvent.mouseDown(wrapper, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(wrapper, { clientX: 10, clientY: 0 });
    fireEvent.mouseUp(wrapper);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles touch events correctly', async () => {
    render(<OfferSlider />);
    await waitFor(() => expect(screen.queryByText('Loading offers...')).toBeNull());

    const wrapper = screen.getByTestId('mock-slider').children[0] as HTMLElement;
    fireEvent.touchStart(wrapper, { touches: [{ clientX: 0, clientY: 0 }] });
    fireEvent.touchMove(wrapper, { touches: [{ clientX: 10, clientY: 0 }] });
    fireEvent.touchEnd(wrapper);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('falls back to placeholder on image error', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<OfferSlider />);
    await waitFor(() => expect(screen.getAllByRole('img').length).toBe(2));

    const img = screen.getAllByRole('img')[0] as HTMLImageElement;
    fireEvent.error(img);

    expect(consoleSpy).toHaveBeenCalledWith('Image loading error in slider:', expect.any(String));
    expect(img.src).toContain('default-car.png');

    consoleSpy.mockRestore();
  });

  it('prevents multiple error handling for same image', async () => {
    render(<OfferSlider />);
    await waitFor(() => expect(screen.getAllByRole('img').length).toBe(2));

    const img = screen.getAllByRole('img')[0] as HTMLImageElement;

    fireEvent.error(img);
    expect(img.dataset.errorHandled).toBe('true');

    const firstSrc = img.src;

    fireEvent.error(img);
    expect(img.src).toBe(firstSrc);
  });

  it('displays offer details correctly', async () => {
    render(<OfferSlider />);

    await waitFor(() => {
      expect(screen.getByText(/2020.*1000.*km/)).toBeInTheDocument();
      expect(screen.getByText(/150.*KM.*1\.6L/)).toBeInTheDocument();
      expect(screen.getByText(/2021.*2000.*km/)).toBeInTheDocument();
      expect(screen.getByText(/120.*KM.*2\.0L/)).toBeInTheDocument();
    });
  });

  it('truncates long titles correctly', async () => {
    render(<OfferSlider />);

    await waitFor(() => {
      expect(screen.getByText('Test Offer One')).toBeInTheDocument();
      expect(screen.getByText('Second Offer Wi...')).toBeInTheDocument();
    });
  });

  it('handles offers without main image', async () => {
    const offersWithoutImage: MiniOffer[] = [
      {
        id: '1',
        title: 'No Image Offer',
        price: 10000,
        mainImage: '',
        mileage: 5000,
        fuelType: 'PETROL',
        year: 2019,
        enginePower: 100,
        displacement: '1.4L',
      },
    ];

    mockGetAllOffers.mockResolvedValue(offersWithoutImage);
    render(<OfferSlider />);

    await waitFor(() => {
      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('default-car.png');
    });
  });
});
