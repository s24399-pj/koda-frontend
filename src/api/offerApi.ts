/**
 * Module for handling offer-related API operations
 * @module api/offerApi
 */

import axiosAuthClient from './axiosAuthClient';
import axios from 'axios';
import { CreateOfferCommand, OfferResponse } from '../types/offer/OfferTypes';
import { MiniOffer } from '../types/miniOfferTypes';
import { OfferData } from '../types/offerTypes';

/** Base API URL */
const API_URL = import.meta.env.VITE_API_URL;

/** Endpoint for offers API */
const OFFERS_ENDPOINT = '/api/v1/offers';

/**
 * Axios client for making requests without authentication
 * @type {import('axios').AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interface for paginated offer response
 * @interface OffersResponse
 */
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

/**
 * Interface for search response with pagination
 * @interface SearchResponse
 * @template T - The type of content in the response
 */
export interface SearchResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  empty: boolean;
}

/**
 * Interface for advanced search parameters
 * @interface AdvancedSearchParams
 */
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

/**
 * Interface for pagination parameters
 * @interface PaginationParams
 */
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

/**
 * Interface for geocoding result
 * @interface GeocodeResult
 */
export interface GeocodeResult {
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    [key: string]: any;
  };
}

/**
 * Interface for location coordinates
 * @interface LocationCoordinates
 */
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

/**
 * Cleans search parameters by removing null, undefined and empty values
 * @function cleanSearchParams
 * @param {AdvancedSearchParams} params - Parameters to clean
 * @returns {Record<string, any>} Cleaned parameters
 */
const cleanSearchParams = (params: AdvancedSearchParams): Record<string, any> => {
  const cleanedParams: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleanedParams[key] = value;
    }
  });

  return cleanedParams;
};

/**
 * Adapts any offer object to MiniOffer format
 * @function adaptToMiniOffer
 * @param {any} item - The offer data to adapt
 * @returns {MiniOffer} Adapted mini offer
 */
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

/**
 * Empty search response template
 * @type {SearchResponse<any>}
 */
const emptyResponse: SearchResponse<any> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
  empty: true,
};

/**
 * Creates a new offer
 * @async
 * @function createOffer
 * @param {CreateOfferCommand} offerData - Data for the new offer
 * @returns {Promise<OfferResponse>} Created offer response
 * @throws {Error} Error creating offer
 */
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

/**
 * Gets offers for a specific user
 * @async
 * @function getUserOffers
 * @param {string} userId - ID of the user to get offers for
 * @returns {Promise<OffersResponse>} User's offers
 */
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

/**
 * Alias for getUserOffers
 * @async
 * @function getOffersBySeller
 * @param {string} userId - ID of the seller
 * @returns {Promise<OffersResponse>} Seller's offers
 */
export const getOffersBySeller = getUserOffers;

/**
 * Deletes an offer
 * @async
 * @function deleteOffer
 * @param {string} offerId - ID of the offer to delete
 * @returns {Promise<boolean>} Success status
 */
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

/**
 * Updates an existing offer
 * @async
 * @function updateOffer
 * @param {string} offerId - ID of the offer to update
 * @param {CreateOfferCommand} offerData - New offer data
 * @returns {Promise<OfferResponse>} Updated offer
 * @throws {Error} Error updating offer
 */
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

/**
 * Searches offers with advanced filtering
 * @async
 * @function searchOffers
 * @param {AdvancedSearchParams} searchParams - Search criteria
 * @param {PaginationParams} paginationParams - Pagination options
 * @returns {Promise<SearchResponse<MiniOffer>>} Search results
 */
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

/**
 * Gets all available car brands
 * @async
 * @function getBrands
 * @returns {Promise<string[]>} List of car brands
 */
export const getBrands = () => {
  return apiClient
    .get<{ content: string[] }>('/api/v1/offers/search/brands')
    .then(response => response.data.content || [])
    .catch(error => {
      console.error('Error fetching brands:', error);
      return [];
    });
};

/**
 * Searches car brands by phrase
 * @async
 * @function searchBrands
 * @param {string} phrase - Search phrase
 * @returns {Promise<string[]>} Matching brands
 */
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

/**
 * Gets car models for a specific brand
 * @async
 * @function getModelsByBrand
 * @param {string} brand - Car brand
 * @returns {Promise<string[]>} List of models
 */
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

/**
 * Gets detailed offer data by ID
 * @async
 * @function getOfferById
 * @param {string} id - Offer ID
 * @returns {Promise<OfferData>} Detailed offer data
 * @throws {Error} Error fetching offer
 */
export const getOfferById = (id: string): Promise<OfferData> => {
  console.log(`Fetching offer with ID: ${id}`);

  return apiClient
    .get<OfferData>(`${OFFERS_ENDPOINT}/${id}`)
    .then(response => {
      console.log('Offer data received');
      return response.data;
    })
    .catch(error => {
      console.error(`Error fetching offer ${id}:`, error);
      throw error;
    });
};

/**
 * Geocodes a location string to coordinates
 * @async
 * @function geocodeLocation
 * @param {string} location - Location to geocode
 * @returns {Promise<LocationCoordinates|null>} Location coordinates
 * @throws {Error} Error geocoding location
 */
export const geocodeLocation = async (location: string): Promise<LocationCoordinates | null> => {
  console.log(`Geocoding location: ${location}`);

  if (!navigator.onLine) {
    console.log('Offline - skipping geocoding');
    return null;
  }

  try {
    const response = await axios.get<GeocodeResult[]>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: `${location}, Poland`,
          format: 'json',
          limit: 5,
          addressdetails: 1,
        },
        timeout: 5000,
      }
    );

    if (response.data.length > 0) {
      const validLocation = response.data.find(
        (result: GeocodeResult) =>
          result.address.city || result.address.town || result.address.village
      );

      if (validLocation) {
        console.log('Valid location found:', validLocation);
        return {
          lat: parseFloat(validLocation.lat),
          lng: parseFloat(validLocation.lon),
        };
      } else {
        console.error('Exact location not found');
        return null;
      }
    } else {
      console.error('No results for this location');
      return null;
    }
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
};

/**
 * Searches offers by text phrase
 * @async
 * @function searchOffersByPhrase
 * @param {string} phrase - Search phrase
 * @param {number} [size=5] - Number of results to return
 * @returns {Promise<OfferData[]>} Matching offers
 */
export const searchOffersByPhrase = (phrase: string, size: number = 5): Promise<OfferData[]> => {
  console.log(`Searching offers by phrase: ${phrase}`);

  return apiClient
    .get<OffersResponse>(OFFERS_ENDPOINT, {
      params: {
        phrase,
        size,
      },
    })
    .then(response => {
      console.log('Search by phrase results received');
      return response.data.content || [];
    })
    .catch(error => {
      console.error('Error searching offers by phrase:', error);
      return [];
    });
};

/**
 * Gets all offers
 * @async
 * @function getAllOffers
 * @returns {Promise<MiniOffer[]>} All offers
 */
export const getAllOffers = (): Promise<MiniOffer[]> => {
  console.log('Fetching all offers');

  return apiClient
    .get<OffersResponse>(OFFERS_ENDPOINT)
    .then(response => {
      console.log('All offers received');
      return response.data.content || [];
    })
    .catch(error => {
      console.error('Error fetching all offers:', error);
      return [];
    });
};

/**
 * Gets the maximum price from all offers
 * @async
 * @function getMaxPrice
 * @returns {Promise<number>} Maximum price
 */
export const getMaxPrice = async (): Promise<number> => {
  console.log('Fetching max price from offers');

  try {
    const response = await apiClient.get<OffersResponse>(OFFERS_ENDPOINT, {
      params: {
        page: 0,
        size: 100,
      },
    });

    const offers = response.data.content || [];
    const maxPrice = offers.reduce((max: number, offer: any) => {
      const price = typeof offer.price === 'number' ? offer.price : parseFloat(offer.price) || 0;
      return price > max ? price : max;
    }, 0);

    console.log('Max price calculated:', maxPrice);
    return maxPrice || 1000000;
  } catch (error) {
    console.error('Error fetching max price:', error);
    return 1000000;
  }
};

/**
 * Gets all car brands
 * @async
 * @function getAllBrands
 * @returns {Promise<string[]>} All car brands
 */
export const getAllBrands = (): Promise<string[]> => {
  console.log('Fetching all brands');

  return apiClient
    .get<string[]>('/api/v1/brands')
    .then(response => {
      console.log('All brands received');
      return response.data || [];
    })
    .catch(error => {
      console.error('Error fetching all brands:', error);
      return [];
    });
};

/**
 * Searches brands by phrase
 * @async
 * @function searchBrandsByPhrase
 * @param {string} phrase - Search phrase
 * @returns {Promise<string[]>} Matching brands
 */
export const searchBrandsByPhrase = (phrase: string): Promise<string[]> => {
  console.log(`Searching brands by phrase: ${phrase}`);

  return apiClient
    .get<string[]>('/api/v1/brands/find', {
      params: { phrase },
    })
    .then(response => {
      console.log('Brand search results received');
      return response.data || [];
    })
    .catch(error => {
      console.error('Error searching brands by phrase:', error);
      return [];
    });
};

/**
 * Offer API object with all exported functions
 * @const offerApi
 */
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
  geocodeLocation,
  searchOffersByPhrase,
  getAllOffers,
  getMaxPrice,
  getAllBrands,
  searchBrandsByPhrase,
  adaptToMiniOffer,
};

export default offerApi;
