import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import UserOffers from '../UserOffers';
import { MemoryRouter } from 'react-router-dom';
import { deleteOffer, getUserOffers } from '../../../api/offerApi';
import type { ApiOffer } from '../../../types/offerTypes';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../api/offerApi');
const mockedGet = vi.mocked(getUserOffers);
const mockedDel = vi.mocked(deleteOffer);

beforeAll(() => {
  vi.stubEnv('VITE_API_URL', 'http://api.test');
});

describe('UserOffers Component', () => {
  const sampleApiOffers: ApiOffer[] = [
    {
      id: '1',
      title: 'First Car',
      price: 12345,
      mainImage: '/img1.jpg',
      mileage: 5000,
      fuelType: 'PETROL',
      year: 2020,
      enginePower: 150,
      displacement: '1.6',
      brand: 'BMW',
      model: 'X5',
      description: 'Nice',
      currency: 'PLN',
      seller: { id: 's1', firstName: 'J', lastName: 'D', email: 'j@d' },
      location: 'Warsaw',
      contactPhone: '123',
      contactEmail: 'a@b',
      transmission: undefined,
      bodyType: undefined,
      driveType: undefined,
      doors: undefined,
      seats: undefined,
      color: undefined,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  it('renders empty-state when API returns zero offers', async () => {
    localStorage.setItem('userId', 'u1');
    mockedGet.mockResolvedValue({ content: [] } as any);

    render(
      <MemoryRouter>
        <UserOffers />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/nie masz żadnych aktywnych ogłoszeń/i)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /Dodaj nowe ogłoszenie/ }));

    expect(window.location.href).toContain('/offer/create');
  });

  it('renders real offers, handles image error, navigation, edit and delete', async () => {
    localStorage.setItem('userId', 'u1');
    mockedGet.mockResolvedValue({ content: sampleApiOffers } as any);
    mockedDel.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <UserOffers />
      </MemoryRouter>
    );

    const title = await screen.findByText('First Car');
    expect(title).toBeInTheDocument();

    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', 'https://placehold.co/600x400');

    fireEvent.click(title.closest('.offer-card')!);
    expect(mockNavigate).toHaveBeenCalledWith('/offer/1');

    fireEvent.click(screen.getByRole('button', { name: /Edytuj/ }));
    expect(window.location.href).toContain('/offer/edit/1');

    fireEvent.click(screen.getByRole('button', { name: /Usuń/ }));
    await waitFor(() => expect(screen.queryByText('First Car')).not.toBeInTheDocument());
  });
});
