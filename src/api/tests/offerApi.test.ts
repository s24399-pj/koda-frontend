import { beforeEach, describe, expect, it, vi } from 'vitest';
import offerApi, {
  adaptToMiniOffer,
  AdvancedSearchParams,
  createOffer,
  deleteOffer,
  getBrands,
  getOfferById,
  getOffersBySeller,
  getUserOffers,
  PaginationParams,
  searchBrands,
  getModelsByBrand,
  searchOffers,
  updateOffer,
} from '../offerApi';
import { CreateOfferCommand } from '../../types/offer/OfferTypes';

vi.stubGlobal('import.meta', { env: { VITE_API_URL: 'http://localhost:8080' } });

const { mockAuthGet, mockAuthPost, mockAuthPut, mockAuthDelete, mockApiClient } = vi.hoisted(
  () => ({
    mockAuthGet: vi.fn(),
    mockAuthPost: vi.fn(),
    mockAuthPut: vi.fn(),
    mockAuthDelete: vi.fn(),
    mockApiClient: {
      get: vi.fn(),
      post: vi.fn(),
    },
  })
);

vi.mock('../axiosAuthClient', () => ({
  default: {
    get: mockAuthGet,
    post: mockAuthPost,
    put: mockAuthPut,
    delete: mockAuthDelete,
  },
}));

vi.mock('axios', () => ({
  default: {
    create: () => mockApiClient,
  },
}));

describe('offerApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();

    mockAuthGet.mockReset();
    mockAuthPost.mockReset();
    mockAuthPut.mockReset();
    mockAuthDelete.mockReset();
    mockApiClient.get.mockReset();
    mockApiClient.post.mockReset();
  });

  describe('createOffer', () => {
    it('should create offer successfully', async () => {
      const mockOfferData: CreateOfferCommand = {
        title: 'Test Car',
        description: 'Test Description',
        price: 25000,
      } as CreateOfferCommand;

      const mockResponse = {
        data: {
          id: '123',
          title: 'Test Car',
          price: 25000,
        },
      };

      mockAuthPost.mockResolvedValueOnce(mockResponse);

      const result = await createOffer(mockOfferData);

      expect(mockAuthPost).toHaveBeenCalledWith('/api/v1/offers', mockOfferData);
      expect(result).toEqual(mockResponse.data);
      expect(console.log).toHaveBeenCalledWith('Creating new offer with data:', mockOfferData);
      expect(console.log).toHaveBeenCalledWith('Offer created successfully');
    });

    it('should throw error when create offer fails', async () => {
      const mockOfferData: CreateOfferCommand = {
        title: 'Test Car',
      } as CreateOfferCommand;

      const error = new Error('Create failed');
      mockAuthPost.mockRejectedValueOnce(error);

      await expect(createOffer(mockOfferData)).rejects.toThrow('Create failed');
      expect(console.error).toHaveBeenCalledWith('Error creating offer:', error);
    });
  });

  describe('getUserOffers', () => {
    it('should fetch user offers successfully', async () => {
      const mockResponse = {
        data: {
          content: [{ id: '1', title: 'Car 1' }],
          totalElements: 1,
          totalPages: 1,
          pageable: { pageNumber: 0, pageSize: 10 },
          last: true,
          first: true,
        },
      };

      mockAuthGet.mockResolvedValueOnce(mockResponse);

      const result = await getUserOffers('user123');

      expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/offers', {
        params: { userId: 'user123' },
      });
      expect(result).toEqual(mockResponse.data);
      expect(console.log).toHaveBeenCalledWith('Fetching offers for user user123');
      expect(console.log).toHaveBeenCalledWith('User offers received');
    });

    it('should return empty response when fetch fails', async () => {
      const error = new Error('Fetch failed');
      mockAuthGet.mockRejectedValueOnce(error);

      const result = await getUserOffers('user123');

      expect(result).toEqual({
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
      });
      expect(console.error).toHaveBeenCalledWith('Error fetching user offers:', error);
    });
  });

  describe('getOffersBySeller', () => {
    it('should be an alias for getUserOffers', () => {
      expect(getOffersBySeller).toBe(getUserOffers);
    });
  });

  describe('deleteOffer', () => {
    it('should delete offer successfully with status 200', async () => {
      const mockResponse = { status: 200 };
      mockAuthDelete.mockResolvedValueOnce(mockResponse);

      const result = await deleteOffer('offer123');

      expect(mockAuthDelete).toHaveBeenCalledWith('/api/v1/offers/offer123');
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Deleting offer with ID: offer123');
      expect(console.log).toHaveBeenCalledWith('Offer deleted successfully');
    });

    it('should delete offer successfully with status 204', async () => {
      const mockResponse = { status: 204 };
      mockAuthDelete.mockResolvedValueOnce(mockResponse);

      const result = await deleteOffer('offer123');

      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      const error = new Error('Delete failed');
      mockAuthDelete.mockRejectedValueOnce(error);

      const result = await deleteOffer('offer123');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error deleting offer:', error);
    });

    it('should handle 403 forbidden error', async () => {
      const error = new Error('Forbidden');
      Object.defineProperty(error, 'response', {
        value: { status: 403 },
      });
      mockAuthDelete.mockRejectedValueOnce(error);

      const result = await deleteOffer('offer123');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Permission denied to delete offer');
    });

    it('should handle 404 not found error', async () => {
      const error = new Error('Not found');
      Object.defineProperty(error, 'response', {
        value: { status: 404 },
      });
      mockAuthDelete.mockRejectedValueOnce(error);

      const result = await deleteOffer('offer123');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Offer not found');
    });
  });

  describe('updateOffer', () => {
    it('should update offer successfully', async () => {
      const mockOfferData: CreateOfferCommand = {
        title: 'Updated Car',
        price: 30000,
      } as CreateOfferCommand;

      const mockResponse = {
        data: {
          id: '123',
          title: 'Updated Car',
          price: 30000,
        },
      };

      mockAuthPut.mockResolvedValueOnce(mockResponse);

      const result = await updateOffer('offer123', mockOfferData);

      expect(mockAuthPut).toHaveBeenCalledWith('/api/v1/offers/offer123', mockOfferData);
      expect(result).toEqual(mockResponse.data);
      expect(console.log).toHaveBeenCalledWith('Updating offer with ID: offer123');
      expect(console.log).toHaveBeenCalledWith('Offer updated successfully');
    });

    it('should throw error when update fails', async () => {
      const mockOfferData: CreateOfferCommand = {
        title: 'Updated Car',
      } as CreateOfferCommand;

      const error = new Error('Update failed');
      mockAuthPut.mockRejectedValueOnce(error);

      await expect(updateOffer('offer123', mockOfferData)).rejects.toThrow('Update failed');
      expect(console.error).toHaveBeenCalledWith('Error updating offer:', error);
    });
  });

  describe('searchOffers', () => {
    it('should search offers successfully with default params', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              id: '1',
              title: 'Car 1',
              price: 20000,
              imageUrls: ['image1.jpg'],
              carDetailsDto: {
                mileage: 50000,
                fuelType: 'PETROL',
                year: 2020,
                enginePower: 150,
                displacement: '2.0',
              },
            },
          ],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          size: 10,
          empty: false,
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await searchOffers();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/offers/search/advanced',
        {},
        {
          params: {
            page: 0,
            size: 10,
            sort: undefined,
          },
        }
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        id: '1',
        title: 'Car 1',
        price: 20000,
        mainImage: 'image1.jpg',
        mileage: 50000,
        fuelType: 'PETROL',
        year: 2020,
        enginePower: 150,
        displacement: '2.0',
      });
      expect(console.log).toHaveBeenCalledWith('Searching offers with params:', {});
      expect(console.log).toHaveBeenCalledWith('Search results received');
    });

    it('should search offers with custom params', async () => {
      const searchParams: AdvancedSearchParams = {
        phrase: 'BMW',
        minPrice: 20000,
        maxPrice: 50000,
        brand: 'BMW',
        fuelType: 'PETROL',
      };

      const paginationParams: PaginationParams = {
        page: 1,
        size: 20,
        sort: 'price,asc',
      };

      const mockResponse = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 1,
          size: 20,
          empty: true,
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await searchOffers(searchParams, paginationParams);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/offers/search/advanced',
        {
          phrase: 'BMW',
          minPrice: 20000,
          maxPrice: 50000,
          brand: 'BMW',
          fuelType: 'PETROL',
        },
        {
          params: {
            page: 1,
            size: 20,
            sort: 'price,asc',
          },
        }
      );

      expect(result).toEqual({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 1,
        size: 20,
        empty: true,
      });
    });

    it('should return empty response when search fails', async () => {
      const error = new Error('Search failed');
      mockApiClient.post.mockRejectedValueOnce(error);

      const result = await searchOffers();

      expect(result).toEqual({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10,
        empty: true,
      });
      expect(console.error).toHaveBeenCalledWith('Error searching offers:', error);
    });

    it('should clean search params by removing null/undefined/empty values', async () => {
      const searchParams: AdvancedSearchParams = {
        phrase: 'BMW',
        brand: '',
        minPrice: null,
        maxPrice: undefined,
        fuelType: 'PETROL',
      };

      const mockResponse = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
          empty: true,
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await searchOffers(searchParams);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/offers/search/advanced',
        {
          phrase: 'BMW',
          fuelType: 'PETROL',
        },
        expect.any(Object)
      );
    });
  });

  describe('getBrands', () => {
    it('should fetch brands successfully', async () => {
      const mockResponse = {
        data: {
          content: ['BMW', 'Audi', 'Mercedes'],
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getBrands();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/offers/search/brands');
      expect(result).toEqual(['BMW', 'Audi', 'Mercedes']);
    });

    it('should return empty array when content is null', async () => {
      const mockResponse = {
        data: {
          content: null,
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getBrands();

      expect(result).toEqual([]);
    });

    it('should return empty array when fetch fails', async () => {
      const error = new Error('Fetch failed');
      mockApiClient.get.mockRejectedValueOnce(error);

      const result = await getBrands();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error fetching brands:', error);
    });
  });

  describe('searchBrands', () => {
    it('should search brands successfully', async () => {
      const mockResponse = {
        data: {
          content: ['BMW', 'BMW M'],
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await searchBrands('BMW');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/offers/search/brands/search', {
        params: { phrase: 'BMW' },
      });
      expect(result).toEqual(['BMW', 'BMW M']);
    });

    it('should return empty array when search fails', async () => {
      const error = new Error('Search failed');
      mockApiClient.get.mockRejectedValueOnce(error);

      const result = await searchBrands('BMW');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error searching brands:', error);
    });
  });

  describe('getModelsByBrand', () => {
  it('should fetch models for brand successfully', async () => {
    const mockResponse = {
      data: {
        content: ['M3', 'M5', 'X5', '3 Series', 'X3'],
      },
    };

    mockApiClient.get.mockResolvedValueOnce(mockResponse);

    const result = await getModelsByBrand('BMW');

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/offers/search/models', {
      params: { brand: 'BMW' },
    });
    expect(result).toEqual(['M3', 'M5', 'X5', '3 Series', 'X3']);
  });

  it('should return empty array when content is null', async () => {
    const mockResponse = {
      data: {
        content: null,
      },
    };

    mockApiClient.get.mockResolvedValueOnce(mockResponse);

    const result = await getModelsByBrand('BMW');

    expect(result).toEqual([]);
  });

  it('should return empty array when fetch fails', async () => {
    const error = new Error('Models fetch failed');
    mockApiClient.get.mockRejectedValueOnce(error);

    const result = await getModelsByBrand('BMW');

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Error fetching models for brand:', error);
  });

  it('should handle different brand names', async () => {
    const mockResponse = {
      data: {
        content: ['A3', 'A4', 'A6', 'Q5', 'Q7'],
      },
    };

    mockApiClient.get.mockResolvedValueOnce(mockResponse);

    const result = await getModelsByBrand('Audi');

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/offers/search/models', {
      params: { brand: 'Audi' },
    });
    expect(result).toEqual(['A3', 'A4', 'A6', 'Q5', 'Q7']);
  });

  it('should handle empty brand string', async () => {
    const mockResponse = {
      data: {
        content: [],
      },
    };

    mockApiClient.get.mockResolvedValueOnce(mockResponse);

    const result = await getModelsByBrand('');

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/offers/search/models', {
      params: { brand: '' },
    });
    expect(result).toEqual([]);
  });
});

  describe('getOfferById', () => {
    it('should fetch offer by id successfully', async () => {
      const mockResponse = {
        data: {
          id: '123',
          title: 'Test Car',
          price: 25000,
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getOfferById('123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/offers/123');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Not found');
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(getOfferById('123')).rejects.toThrow('Not found');
      expect(console.error).toHaveBeenCalledWith('Error fetching offer 123:', error);
    });
  });

  describe('adaptToMiniOffer', () => {
    it('should adapt complete offer data', () => {
      const input = {
        id: '123',
        title: 'BMW X5',
        price: 45000,
        imageUrls: ['image1.jpg', 'image2.jpg'],
        carDetailsDto: {
          mileage: 80000,
          fuelType: 'DIESEL',
          year: 2019,
          enginePower: 250,
          displacement: '3.0',
        },
      };

      const result = adaptToMiniOffer(input);

      expect(result).toEqual({
        id: '123',
        title: 'BMW X5',
        price: 45000,
        mainImage: 'image1.jpg',
        mileage: 80000,
        fuelType: 'DIESEL',
        year: 2019,
        enginePower: 250,
        displacement: '3.0',
      });
    });

    it('should handle carDetails instead of carDetailsDto', () => {
      const input = {
        id: '123',
        title: 'Audi A4',
        price: 30000,
        imageUrls: ['image1.jpg'],
        carDetails: {
          mileage: 60000,
          fuelType: 'PETROL',
          year: 2020,
          enginePower: 200,
          displacement: '2.0',
        },
      };

      const result = adaptToMiniOffer(input);

      expect(result.mileage).toBe(60000);
      expect(result.fuelType).toBe('PETROL');
    });

    it('should handle missing fields with defaults', () => {
      const input = {};

      const result = adaptToMiniOffer(input);

      expect(result).toEqual({
        id: '',
        title: '',
        price: 0,
        mainImage: '',
        mileage: 0,
        fuelType: 'UNKNOWN',
        year: 0,
        enginePower: 0,
        displacement: '',
      });
    });

    it('should parse string price to number', () => {
      const input = {
        id: '123',
        title: 'Test Car',
        price: '25000.50',
      };

      const result = adaptToMiniOffer(input);

      expect(result.price).toBe(25000.5);
    });

    it('should handle empty imageUrls array', () => {
      const input = {
        id: '123',
        title: 'Test Car',
        price: 25000,
        imageUrls: [],
      };

      const result = adaptToMiniOffer(input);

      expect(result.mainImage).toBe('');
    });

    it('should handle missing imageUrls', () => {
      const input = {
        id: '123',
        title: 'Test Car',
        price: 25000,
      };

      const result = adaptToMiniOffer(input);

      expect(result.mainImage).toBe('');
    });
  });

  describe('default export', () => {
    it('should export all functions in default object', () => {
      expect(offerApi.createOffer).toBe(createOffer);
      expect(offerApi.getUserOffers).toBe(getUserOffers);
      expect(offerApi.getOffersBySeller).toBe(getOffersBySeller);
      expect(offerApi.deleteOffer).toBe(deleteOffer);
      expect(offerApi.updateOffer).toBe(updateOffer);
      expect(offerApi.searchOffers).toBe(searchOffers);
      expect(offerApi.getBrands).toBe(getBrands);
      expect(offerApi.searchBrands).toBe(searchBrands);
      expect(offerApi.getOfferById).toBe(getOfferById);
      expect(offerApi.adaptToMiniOffer).toBe(adaptToMiniOffer);
    });
  });
});
