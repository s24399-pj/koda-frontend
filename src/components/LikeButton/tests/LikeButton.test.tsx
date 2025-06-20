import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import LikeButton from '../LikeButton';
import { likedOfferApi } from '../../../api/likedOfferApi';

vi.mock('../../../api/likedOfferApi', () => ({
  likedOfferApi: {
    isOfferLiked: vi.fn(),
    likeOffer: vi.fn(),
    unlikeOffer: vi.fn(),
  },
}));

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

global.alert = vi.fn();
global.console.error = vi.fn();

describe('LikeButton', () => {
  const mockOnLikeToggle = vi.fn();

  const defaultProps = {
    offerId: 'offer-123',
    initialLiked: false,
    onLikeToggle: mockOnLikeToggle,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('does not render when offerId is empty', () => {
    const { container } = render(<LikeButton {...defaultProps} offerId="" />);
    expect(container.firstChild).toBeNull();
  });

  test('does not render when offerId is not provided', () => {
    const { container } = render(<LikeButton {...defaultProps} offerId={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders like button when offerId is provided', () => {
    render(<LikeButton {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('shows unliked state initially when initialLiked is false', () => {
    render(<LikeButton {...defaultProps} initialLiked={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Dodaj do ulubionych');
    expect(button).not.toHaveClass('liked');
  });

  test('shows liked state initially when initialLiked is true', () => {
    render(<LikeButton {...defaultProps} initialLiked={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Usuń z ulubionych');
    expect(button).toHaveClass('liked');
  });

  test('checks like status on mount when user is logged in', async () => {
    vi.mocked(likedOfferApi.isOfferLiked).mockResolvedValue(true);

    render(<LikeButton {...defaultProps} />);

    await waitFor(() => {
      expect(likedOfferApi.isOfferLiked).toHaveBeenCalledWith('offer-123');
    });
  });

  test('does not check like status when user is not logged in', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(<LikeButton {...defaultProps} />);

    expect(likedOfferApi.isOfferLiked).not.toHaveBeenCalled();
  });

  test('updates state after checking like status', async () => {
    vi.mocked(likedOfferApi.isOfferLiked).mockResolvedValue(true);

    render(<LikeButton {...defaultProps} initialLiked={false} />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('liked');
      expect(button).toHaveAttribute('aria-label', 'Usuń z ulubionych');
    });
  });

  test('handles error when checking like status', async () => {
    vi.mocked(likedOfferApi.isOfferLiked).mockRejectedValue(new Error('API Error'));

    render(<LikeButton {...defaultProps} />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas sprawdzania statusu polubienia:',
        expect.any(Error)
      );
    });
  });

  test('shows alert when not logged in user tries to like', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const user = userEvent.setup();

    render(<LikeButton {...defaultProps} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(alert).toHaveBeenCalledWith('Zaloguj się, aby dodać ofertę do ulubionych');
    expect(likedOfferApi.likeOffer).not.toHaveBeenCalled();
  });

  test('likes offer when clicked and user is logged in', async () => {
    vi.mocked(likedOfferApi.likeOffer).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LikeButton {...defaultProps} initialLiked={false} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(likedOfferApi.likeOffer).toHaveBeenCalledWith('offer-123');
    expect(mockOnLikeToggle).toHaveBeenCalledWith(true);
  });

  test('unlikes offer when clicked and already liked', async () => {
    vi.mocked(likedOfferApi.unlikeOffer).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LikeButton {...defaultProps} initialLiked={true} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(likedOfferApi.unlikeOffer).toHaveBeenCalledWith('offer-123');
    expect(mockOnLikeToggle).toHaveBeenCalledWith(false);
  });

  test('shows loading state during API call', async () => {
    let resolvePromise: (value?: any) => void;
    vi.mocked(likedOfferApi.likeOffer).mockReturnValue(
      new Promise(resolve => {
        resolvePromise = resolve;
      })
    );

    const user = userEvent.setup();
    render(<LikeButton {...defaultProps} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(button).toBeDisabled();
    expect(button.querySelector('animateTransform')).toBeInTheDocument();

    resolvePromise!();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  test('prevents multiple clicks during loading', async () => {
    let resolvePromise: (value?: any) => void;
    vi.mocked(likedOfferApi.likeOffer).mockReturnValue(
      new Promise(resolve => {
        resolvePromise = resolve;
      })
    );

    const user = userEvent.setup();
    render(<LikeButton {...defaultProps} />);

    const button = screen.getByRole('button');

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(likedOfferApi.likeOffer).toHaveBeenCalledTimes(1);

    resolvePromise!();
  });

  test('rollbacks state on API error', async () => {
    vi.mocked(likedOfferApi.likeOffer).mockRejectedValue(new Error('API Error'));
    const user = userEvent.setup();

    render(<LikeButton {...defaultProps} initialLiked={false} />);

    const button = screen.getByRole('button');

    expect(button).not.toHaveClass('liked');

    await user.click(button);

    await waitFor(() => {
      expect(button).not.toHaveClass('liked');
      expect(button).toHaveAttribute('aria-label', 'Dodaj do ulubionych');
    });

    expect(mockOnLikeToggle).toHaveBeenCalledWith(true);
    expect(mockOnLikeToggle).toHaveBeenCalledWith(false);
    expect(alert).toHaveBeenCalledWith('Wystąpił błąd podczas aktualizacji statusu polubienia.');
    expect(console.error).toHaveBeenCalledWith(
      'Błąd podczas aktualizacji statusu polubienia:',
      expect.any(Error)
    );
  });

  test('stops event propagation on click', () => {
    const mockParentClick = vi.fn();
    render(
      <div onClick={mockParentClick}>
        <LikeButton {...defaultProps} />
      </div>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockParentClick).not.toHaveBeenCalled();
  });

  test('prevents default behavior on click', () => {
    render(<LikeButton {...defaultProps} />);

    const button = screen.getByRole('button');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    fireEvent(button, clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
  });

  test('works without onLikeToggle callback', async () => {
    vi.mocked(likedOfferApi.likeOffer).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LikeButton offerId="offer-123" initialLiked={false} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(likedOfferApi.likeOffer).toHaveBeenCalledWith('offer-123');
  });

  test('handles empty offerId during toggle gracefully', async () => {
    const { rerender } = render(<LikeButton {...defaultProps} />);
    rerender(<LikeButton {...defaultProps} offerId="" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('updates like status when offerId changes', async () => {
    vi.mocked(likedOfferApi.isOfferLiked).mockImplementation(id => {
      return Promise.resolve(id === 'liked-offer');
    });

    const { rerender } = render(<LikeButton {...defaultProps} offerId="normal-offer" />);

    await waitFor(() => {
      expect(likedOfferApi.isOfferLiked).toHaveBeenCalledWith('normal-offer');
    });

    rerender(<LikeButton {...defaultProps} offerId="liked-offer" />);

    await waitFor(() => {
      expect(likedOfferApi.isOfferLiked).toHaveBeenCalledWith('liked-offer');
    });
  });

  test('handles concurrent API calls correctly', async () => {
    const promises: Array<(value?: any) => void> = [];
    vi.mocked(likedOfferApi.likeOffer).mockImplementation(() => {
      return new Promise(resolve => promises.push(resolve));
    });

    const user = userEvent.setup();
    render(<LikeButton {...defaultProps} />);

    const button = screen.getByRole('button');

    await user.click(button);
    await user.click(button);

    expect(likedOfferApi.likeOffer).toHaveBeenCalledTimes(1);

    promises[0]();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
