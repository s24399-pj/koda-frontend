import { beforeEach, describe, expect, it, vi } from 'vitest';
import { likedOfferApi } from '../likedOfferApi';

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock('../axiosAuthClient', () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}));

describe('likedOfferApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    console.error = vi.fn();

    mockGet.mockReset();
    mockPost.mockReset();
  });

  describe('getLikedOffers', () => {
    it('should fetch liked offers successfully', async () => {
      const mockOffers = [
        { id: '1', title: 'Offer 1', price: 100 },
        { id: '2', title: 'Offer 2', price: 200 },
      ];

      mockGet.mockResolvedValueOnce({ data: mockOffers });

      const result = await likedOfferApi.getLikedOffers();

      expect(mockGet).toHaveBeenCalledWith('/api/v1/offers/liked');
      expect(result).toEqual(mockOffers);
    });

    it('should throw error when request fails', async () => {
      const error = new Error('Network Error');
      mockGet.mockRejectedValueOnce(error);

      await expect(likedOfferApi.getLikedOffers()).rejects.toThrow('Network Error');
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas pobierania ulubionych ofert:',
        error
      );
    });
  });

  describe('isOfferLiked', () => {
    it('should return true when offer is liked', async () => {
      const mockResponse = { isLiked: true };
      mockGet.mockResolvedValueOnce({ data: mockResponse });

      const result = await likedOfferApi.isOfferLiked('offer123');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/offers/offer123/liked');
      expect(result).toEqual(mockResponse);
    });

    it('should return false when offer is not liked', async () => {
      const mockResponse = { isLiked: false };
      mockGet.mockResolvedValueOnce({ data: mockResponse });

      const result = await likedOfferApi.isOfferLiked('offer456');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/offers/offer456/liked');
      expect(result).toEqual(mockResponse);
    });

    it('should return false when request fails', async () => {
      const error = new Error('Request failed');
      mockGet.mockRejectedValueOnce(error);

      const result = await likedOfferApi.isOfferLiked('offer789');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/offers/offer789/liked');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas sprawdzania statusu polubienia:',
        error
      );
    });

    it('should handle network timeout gracefully', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      mockGet.mockRejectedValueOnce(timeoutError);

      const result = await likedOfferApi.isOfferLiked('offer999');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/offers/offer999/liked');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas sprawdzania statusu polubienia:',
        timeoutError
      );
    });
  });

  describe('likeOffer', () => {
    it('should like offer successfully', async () => {
      const mockResponse = { success: true, message: 'Offer liked' };
      mockPost.mockResolvedValueOnce({ data: mockResponse });

      const result = await likedOfferApi.likeOffer('offer123');

      expect(mockPost).toHaveBeenCalledWith('/api/v1/offers/offer123/like');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when like request fails', async () => {
      const error = new Error('Like failed');
      mockPost.mockRejectedValueOnce(error);

      await expect(likedOfferApi.likeOffer('offer456')).rejects.toThrow('Like failed');
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas dodawania oferty do ulubionych:',
        error
      );
    });

    it('should handle 401 unauthorized error', async () => {
      const unauthorizedError = new Error('Unauthorized');
      Object.defineProperty(unauthorizedError, 'response', {
        value: { status: 401, data: { message: 'Token expired' } },
      });
      mockPost.mockRejectedValueOnce(unauthorizedError);

      await expect(likedOfferApi.likeOffer('offer789')).rejects.toThrow('Unauthorized');
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas dodawania oferty do ulubionych:',
        unauthorizedError
      );
    });

    it('should handle 404 offer not found error', async () => {
      const notFoundError = new Error('Not found');
      Object.defineProperty(notFoundError, 'response', {
        value: { status: 404, data: { message: 'Offer not found' } },
      });
      mockPost.mockRejectedValueOnce(notFoundError);

      await expect(likedOfferApi.likeOffer('nonexistent')).rejects.toThrow('Not found');
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas dodawania oferty do ulubionych:',
        notFoundError
      );
    });
  });

  describe('unlikeOffer', () => {
    it('should unlike offer successfully', async () => {
      const mockResponse = { success: true, message: 'Offer unliked' };
      mockPost.mockResolvedValueOnce({ data: mockResponse });

      const result = await likedOfferApi.unlikeOffer('offer123');

      expect(mockPost).toHaveBeenCalledWith('/api/v1/offers/offer123/unlike');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when unlike request fails', async () => {
      const error = new Error('Unlike failed');
      mockPost.mockRejectedValueOnce(error);

      await expect(likedOfferApi.unlikeOffer('offer456')).rejects.toThrow('Unlike failed');
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas usuwania oferty z ulubionych:',
        error
      );
    });

    it('should handle server error gracefully', async () => {
      const serverError = new Error('Internal server error');
      Object.defineProperty(serverError, 'response', {
        value: { status: 500, data: { message: 'Server error' } },
      });
      mockPost.mockRejectedValueOnce(serverError);

      await expect(likedOfferApi.unlikeOffer('offer789')).rejects.toThrow('Internal server error');
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas usuwania oferty z ulubionych:',
        serverError
      );
    });

    it('should handle network connectivity issues', async () => {
      const networkError = new Error('Network Error');
      Object.defineProperty(networkError, 'code', { value: 'NETWORK_ERROR' });
      mockPost.mockRejectedValueOnce(networkError);

      await expect(likedOfferApi.unlikeOffer('offer999')).rejects.toThrow('Network Error');
      expect(console.error).toHaveBeenCalledWith(
        'Błąd podczas usuwania oferty z ulubionych:',
        networkError
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty response data', async () => {
      mockGet.mockResolvedValueOnce({ data: null });

      const result = await likedOfferApi.getLikedOffers();

      expect(mockGet).toHaveBeenCalledWith('/api/v1/offers/liked');
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('should handle undefined response data in getLikedOffers', async () => {
      mockGet.mockResolvedValueOnce({ data: undefined });

      const result = await likedOfferApi.getLikedOffers();

      expect(mockGet).toHaveBeenCalledWith('/api/v1/offers/liked');
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle undefined response data in likeOffer', async () => {
      mockPost.mockResolvedValueOnce({ data: undefined });

      const result = await likedOfferApi.likeOffer('offer123');

      expect(mockPost).toHaveBeenCalledWith('/api/v1/offers/offer123/like');
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle empty string offerId', async () => {
      const mockResponse = { isLiked: false };
      mockGet.mockResolvedValueOnce({ data: mockResponse });

      const result = await likedOfferApi.isOfferLiked('');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/offers//liked');
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in offerId', async () => {
      const specialOfferId = 'offer-123_test@domain.com';
      const mockResponse = { success: true };
      mockPost.mockResolvedValueOnce({ data: mockResponse });

      const result = await likedOfferApi.likeOffer(specialOfferId);

      expect(mockPost).toHaveBeenCalledWith(`/api/v1/offers/${specialOfferId}/like`);
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple simultaneous getLikedOffers calls', async () => {
      const mockOffers1 = [{ id: '1', title: 'Offer 1' }];
      const mockOffers2 = [{ id: '2', title: 'Offer 2' }];

      mockGet
        .mockResolvedValueOnce({ data: mockOffers1 })
        .mockResolvedValueOnce({ data: mockOffers2 });

      const [result1, result2] = await Promise.all([
        likedOfferApi.getLikedOffers(),
        likedOfferApi.getLikedOffers(),
      ]);

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(mockGet).toHaveBeenNthCalledWith(1, '/api/v1/offers/liked');
      expect(mockGet).toHaveBeenNthCalledWith(2, '/api/v1/offers/liked');
      expect(result1).toEqual(mockOffers1);
      expect(result2).toEqual(mockOffers2);
    });

    it('should handle mixed like/unlike operations', async () => {
      const likeResponse = { success: true, action: 'liked' };
      const unlikeResponse = { success: true, action: 'unliked' };

      mockPost
        .mockResolvedValueOnce({ data: likeResponse })
        .mockResolvedValueOnce({ data: unlikeResponse });

      const [likeResult, unlikeResult] = await Promise.all([
        likedOfferApi.likeOffer('offer1'),
        likedOfferApi.unlikeOffer('offer2'),
      ]);

      expect(mockPost).toHaveBeenCalledTimes(2);
      expect(mockPost).toHaveBeenNthCalledWith(1, '/api/v1/offers/offer1/like');
      expect(mockPost).toHaveBeenNthCalledWith(2, '/api/v1/offers/offer2/unlike');
      expect(likeResult).toEqual(likeResponse);
      expect(unlikeResult).toEqual(unlikeResponse);
    });
  });
});
