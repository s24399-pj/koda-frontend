import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import OfferSlider from '../OfferSlider';
import { MiniOffer } from '../../../types/miniOfferTypes.ts';

vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

vi.mock('react-slick', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="mock-slider">{children}</div>,
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
  });

  it('shows loading state initially', () => {
    mockedGet.mockReturnValue(new Promise(() => {}));
    render(<OfferSlider />);
    expect(screen.getByText('Loading offers...')).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    mockedGet.mockRejectedValue(new Error('Network error'));
    render(<OfferSlider />);
    await waitFor(() =>
      expect(screen.getByText('Error: Failed to fetch offers')).toBeInTheDocument()
    );
  });

  it('displays empty message when no offers', async () => {
    mockedGet.mockResolvedValue({ data: { content: [] } });
    render(<OfferSlider />);
    await waitFor(() => expect(screen.getByText('No offers available')).toBeInTheDocument());
  });

  it('does not navigate when dragging', async () => {
    mockedGet.mockResolvedValue({ data: { content: sampleOffers } });
    render(<OfferSlider />);
    await waitFor(() => expect(screen.queryByText('Loading offers...')).toBeNull());
    const wrapper = screen.getByTestId('mock-slider').children[0] as HTMLElement;
    fireEvent.mouseDown(wrapper, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(wrapper, { clientX: 10, clientY: 0 });
    fireEvent.mouseUp(wrapper);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('falls back to placeholder on image error', async () => {
    mockedGet.mockResolvedValue({ data: { content: sampleOffers } });
    console.warn = vi.fn();
    render(<OfferSlider />);
    await waitFor(() => expect(screen.getAllByRole('img').length).toBe(2));
    const img = screen.getAllByRole('img')[0];
    fireEvent.error(img);
    expect(console.warn).toHaveBeenCalled();
    expect(img).toHaveAttribute('src', 'https://placehold.co/600x400');
  });
});
