import axiosAuthClient from './axiosAuthClient';

export const likedOfferApi = {
  getLikedOffers: async () => {
    try {
      const response = await axiosAuthClient.get(`/api/v1/offers/liked`);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania ulubionych ofert:', error);
      throw error;
    }
  },

  isOfferLiked: async (offerId: string) => {
    try {
      const response = await axiosAuthClient.get(`/api/v1/offers/${offerId}/liked`);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas sprawdzania statusu polubienia:', error);
      return false;
    }
  },

  likeOffer: async (offerId: string) => {
    try {
      const response = await axiosAuthClient.post(`/api/v1/offers/${offerId}/like`);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas dodawania oferty do ulubionych:', error);
      throw error;
    }
  },

  unlikeOffer: async (offerId: string) => {
    try {
      const response = await axiosAuthClient.post(`/api/v1/offers/${offerId}/unlike`);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas usuwania oferty z ulubionych:', error);
      throw error;
    }
  },
};
