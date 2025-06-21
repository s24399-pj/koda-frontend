import axiosAuthClient from './axiosAuthClient';
import axios from 'axios';
import { CreateOfferCommand, OfferResponse } from '../types/offer/OfferTypes';
import { MiniOffer } from '../types/miniOfferTypes';

const API_URL = import.meta.env.VITE_API_URL;
const OFFERS_ENDPOINT = '/api/v1/offers';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface OffersResponse {
  content: any[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort?: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
}

export interface SearchResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  empty: boolean;
}

export interface AdvancedSearchParams {
  phrase?: string;
  brand?: string;
  model?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  minYear?: number | null;
  maxYear?: number | null;
  minMileage?: number | null;
  maxMileage?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  driveType?: string | null;
  minEnginePower?: number | null;
  maxEnginePower?: number | null;
  condition?: string | null;
  firstOwner?: boolean | null;
  accidentFree?: boolean | null;
  serviceHistory?: boolean | null;

  airConditioning?: boolean | null;
  automaticClimate?: boolean | null;
  heatedSeats?: boolean | null;
  navigationSystem?: boolean | null;
  bluetooth?: boolean | null;
  parkingSensors?: boolean | null;
  rearCamera?: boolean | null;
  leatherSeats?: boolean | null;
  panoramicRoof?: boolean | null;
  ledLights?: boolean | null;
  [key: string]: any;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

const cleanSearchParams = (params: AdvancedSearchParams): Record<string, any> => {
  const cleanedParams: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleanedParams[key] = value;
    }
  });

  return cleanedParams;
};

export const adaptToMiniOffer = (item: any): MiniOffer => {
  const carDetails = item.carDetailsDto || item.carDetails || {};

  let mainImage = '';
  if (item.imageUrls && item.imageUrls.length > 0) {
    mainImage = item.imageUrls[0];
  }

  return {
    id: item.id || '',
    title: item.title || '',
    price:
      typeof item.price === 'number'
        ? item.price
        : typeof item.price === 'string'
          ? parseFloat(item.price)
          : 0,
    mainImage: mainImage,
    mileage: carDetails.mileage || 0,
    fuelType: carDetails.fuelType || 'UNKNOWN',
    year: carDetails.year || 0,
    enginePower: carDetails.enginePower || 0,
    displacement: carDetails.displacement || '',
  };
};

const emptyResponse: SearchResponse<any> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
  empty: true,
};

export const createOffer = (offerData: CreateOfferCommand) => {
  console.log('Creating new offer with data:', offerData);

  return axiosAuthClient
    .post<OfferResponse>(OFFERS_ENDPOINT, offerData)
    .then(response => {
      console.log('Offer created successfully');
      return response.data;
    })
    .catch(error => {
      console.error('Error creating offer:', error);
      throw error;
    });
};

export const getUserOffers = (userId: string) => {
  console.log(`Fetching offers for user ${userId}`);

  return axiosAuthClient
    .get<OffersResponse>(OFFERS_ENDPOINT, {
      params: { userId },
    })
    .then(response => {
      console.log('User offers received');
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching user offers:', error);
      return {
        content: [],
        pageable: {
          pageNumber: 0,
          pageSize: 10,
        },
        totalElements: 0,
        totalPages: 0,
        last: true,
        first: true,
        empty: true,
      };
    });
};

export const getOffersBySeller = getUserOffers;

export const deleteOffer = (offerId: string) => {
  console.log(`Deleting offer with ID: ${offerId}`);

  return axiosAuthClient
    .delete(`${OFFERS_ENDPOINT}/${offerId}`)
    .then(response => {
      console.log('Offer deleted successfully');
      return response.status === 200 || response.status === 204;
    })
    .catch(error => {
      console.error('Error deleting offer:', error);

      if (error.response) {
        if (error.response.status === 403) {
          console.error('Permission denied to delete offer');
        } else if (error.response.status === 404) {
          console.error('Offer not found');
        }
      }
      return false;
    });
};

export const updateOffer = (offerId: string, offerData: CreateOfferCommand) => {
  console.log(`Updating offer with ID: ${offerId}`);

  return axiosAuthClient
    .put<OfferResponse>(`${OFFERS_ENDPOINT}/${offerId}`, offerData)
    .then(response => {
      console.log('Offer updated successfully');
      return response.data;
    })
    .catch(error => {
      console.error('Error updating offer:', error);
      throw error;
    });
};

export const searchOffers = (
  searchParams: AdvancedSearchParams = {},
  paginationParams: PaginationParams = { page: 0, size: 10 }
) => {
  const cleanedParams = cleanSearchParams(searchParams);

  console.log('Searching offers with params:', cleanedParams);

  return apiClient
    .post<SearchResponse<any>>('/api/v1/offers/search/advanced', cleanedParams, {
      params: {
        page: paginationParams.page,
        size: paginationParams.size,
        sort: paginationParams.sort,
      },
    })
    .then(response => {
      console.log('Search results received');

      const transformedResponse: SearchResponse<MiniOffer> = {
        ...response.data,
        content: response.data.content.map(adaptToMiniOffer),
      };

      return transformedResponse;
    })
    .catch(error => {
      console.error('Error searching offers:', error);

      return emptyResponse;
    });
};

export const getBrands = () => {
  return apiClient
    .get<{ content: string[] }>('/api/v1/offers/search/brands')
    .then(response => response.data.content || [])
    .catch(error => {
      console.error('Error fetching brands:', error);
      return [];
    });
};

export const searchBrands = (phrase: string) => {
  return apiClient
    .get<{ content: string[] }>('/api/v1/offers/search/brands/search', {
      params: { phrase },
    })
    .then(response => response.data.content || [])
    .catch(error => {
      console.error('Error searching brands:', error);
      return [];
    });
};

export const getModelsByBrand = (brand: string) => {
  return apiClient
    .get<{ content: string[] }>('/api/v1/offers/search/models', {
      params: { brand },
    })
    .then(response => response.data.content || [])
    .catch(error => {
      console.error('Error fetching models for brand:', error);
      return [];
    });
};

export const getOfferById = (id: string) => {
  return apiClient
    .get(`/api/v1/offers/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Error fetching offer ${id}:`, error);
      throw error;
    });
};

const offerApi = {
  createOffer,
  getUserOffers,
  getOffersBySeller,
  deleteOffer,
  updateOffer,
  searchOffers,
  getBrands,
  searchBrands,
  getModelsByBrand,
  getOfferById,
  adaptToMiniOffer,
};

export default offerApi;
