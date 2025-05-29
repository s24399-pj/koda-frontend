import { SearchFilters } from '../types/searchTypes';

export interface SearchResponse {
  content: any[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

class OfferSearchService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  async searchOffers(filters: SearchFilters, page = 0, size = 5): Promise<SearchResponse> {
    const params = this.buildSearchParams(filters, page, size);
    
    // Sprawdź czy to zaawansowane wyszukiwanie
    const isAdvanced = this.isAdvancedSearch(filters);
    const endpoint = isAdvanced ? '/api/v1/offers/search' : '/api/v1/offers';
    
    const url = `${this.baseUrl}${endpoint}?${params.toString()}`;
    
    console.log('🔍 Search URL:', url);
    console.log('🔍 Is Advanced:', isAdvanced);
    console.log('🔍 Filters:', filters);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Błąd API (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    
    return data;
  }

  private isAdvancedSearch(filters: SearchFilters): boolean {
    return Boolean(
      filters.fuelType?.length > 0 ||
      filters.transmission?.length > 0 ||
      filters.bodyType?.length > 0 ||
      filters.driveType?.length > 0 ||
      filters.condition?.length > 0 ||
      filters.enginePowerFrom?.trim() ||
      filters.enginePowerTo?.trim() ||
      filters.doors?.trim() ||
      filters.seats?.trim() ||
      Object.values(filters.equipment || {}).some(val => val === true)
    );
  }

  private buildSearchParams(filters: SearchFilters, page?: number, size?: number): URLSearchParams {
    const params = new URLSearchParams();

    // Pagination
    if (page !== undefined) params.set('page', page.toString());
    if (size !== undefined) params.set('size', size.toString());

    // TYLKO NUMERYCZNE FILTRY - usuń tekstowe na razie
    
    // Price ranges
    if (filters.priceFrom?.trim()) {
      const price = filters.priceFrom.replace(/\s/g, '');
      if (!isNaN(Number(price)) && Number(price) > 0) {
        params.set('minPrice', price);
      }
    }

    if (filters.priceTo?.trim()) {
      const price = filters.priceTo.replace(/\s/g, '');
      if (!isNaN(Number(price)) && Number(price) > 0) {
        params.set('maxPrice', price);
      }
    }

    // Year ranges
    if (filters.yearFrom?.trim()) {
      const year = parseInt(filters.yearFrom);
      if (!isNaN(year) && year >= 1900) {
        params.set('yearFrom', year.toString());
      }
    }

    if (filters.yearTo?.trim()) {
      const year = parseInt(filters.yearTo);
      if (!isNaN(year) && year >= 1900) {
        params.set('yearTo', year.toString());
      }
    }

    // Mileage ranges
    if (filters.mileageFrom?.trim()) {
      const mileage = filters.mileageFrom.replace(/\s/g, '');
      if (!isNaN(Number(mileage)) && Number(mileage) >= 0) {
        params.set('mileageFrom', mileage);
      }
    }

    if (filters.mileageTo?.trim()) {
      const mileage = filters.mileageTo.replace(/\s/g, '');
      if (!isNaN(Number(mileage)) && Number(mileage) >= 0) {
        params.set('mileageTo', mileage);
      }
    }

    // Engine power ranges
    if (filters.enginePowerFrom?.trim()) {
      const power = parseInt(filters.enginePowerFrom);
      if (!isNaN(power) && power >= 0) {
        params.set('enginePowerFrom', power.toString());
      }
    }

    if (filters.enginePowerTo?.trim()) {
      const power = parseInt(filters.enginePowerTo);
      if (!isNaN(power) && power >= 0) {
        params.set('enginePowerTo', power.toString());
      }
    }

    // Single values
    if (filters.doors?.trim()) {
      const doors = parseInt(filters.doors);
      if (!isNaN(doors) && doors > 0) {
        params.set('doors', doors.toString());
      }
    }

    if (filters.seats?.trim()) {
      const seats = parseInt(filters.seats);
      if (!isNaN(seats) && seats > 0) {
        params.set('seats', seats.toString());
      }
    }

    // Arrays - ENUM filtry (te działają)
    if (filters.fuelType?.length) {
      filters.fuelType.forEach(fuel => {
        params.append('fuelType', fuel);
      });
    }

    if (filters.transmission?.length) {
      filters.transmission.forEach(trans => {
        params.append('transmission', trans);
      });
    }

    if (filters.bodyType?.length) {
      filters.bodyType.forEach(body => {
        params.append('bodyType', body);
      });
    }

    if (filters.driveType?.length) {
      filters.driveType.forEach(drive => {
        params.append('driveType', drive);
      });
    }

    if (filters.condition?.length) {
      filters.condition.forEach(cond => {
        params.append('condition', cond);
      });
    }

    // WYŁĄCZ TYMCZASOWO:
    // - phrase (wyszukiwanie tekstowe)
    // - brand (marka)  
    // - model (model)
    // - location (lokalizacja)
    // - equipment (wyposażenie)

    return params;

  }
}

export const offerSearchService = new OfferSearchService();