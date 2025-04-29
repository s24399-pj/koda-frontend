import axiosAuthClient from './axiosAuthClient';
import { CreateOfferCommand, OfferResponse } from '../types/offer/OfferTypes';

// Endpoint dla API ofert
const OFFERS_ENDPOINT = '/api/v1/offers';

// Istniejąca funkcja do tworzenia oferty
export const createOffer = async (offerData: CreateOfferCommand): Promise<OfferResponse> => {
    try {
        const response = await axiosAuthClient.post<OfferResponse>(OFFERS_ENDPOINT, offerData);
        return response.data;
    } catch (error) {
        console.error('Błąd podczas tworzenia oferty:', error);
        throw error;
    }
};

// Struktura odpowiedzi z API dla listy ogłoszeń
interface OffersResponse {
    content: any[]; // Używamy any zamiast konkretnego typu, aby uniknąć problemów z importami
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort?: {
            empty: boolean;
            unsorted: boolean;
            sorted: boolean;
        }
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

// Funkcja do pobierania ogłoszeń użytkownika - poprawiona
export const getUserOffers = async (userId: string): Promise<OffersResponse> => {
    try {
        console.log(`Pobieranie ogłoszeń dla użytkownika ${userId}`);

        // Poprawiony endpoint (z parametrem userId, a nie url)
        const response = await axiosAuthClient.get<OffersResponse>(OFFERS_ENDPOINT, {
            params: {
                userId: userId
            }
        });

        console.log('Otrzymano odpowiedź:', response.data);
        return response.data;
    } catch (error) {
        console.error('Błąd podczas pobierania ogłoszeń użytkownika:', error);
        // Zwracamy pustą odpowiedź w przypadku błędu, aby uniknąć błędów renderowania
        return {
            content: [],
            pageable: {
                pageNumber: 0,
                pageSize: 10
            },
            totalElements: 0,
            totalPages: 0,
            last: true,
            first: true,
            empty: true
        };
    }
};

// Funkcja do usuwania ogłoszenia
export const deleteOffer = async (offerId: string): Promise<boolean> => {
    try {
        const response = await axiosAuthClient.delete(`${OFFERS_ENDPOINT}/${offerId}`);
        return response.status === 200 || response.status === 204;
    } catch (error) {
        console.error('Błąd podczas usuwania ogłoszenia:', error);
        throw error;
    }
};

// Funkcja do aktualizacji ogłoszenia
export const updateOffer = async (offerId: string, offerData: CreateOfferCommand): Promise<OfferResponse> => {
    try {
        const response = await axiosAuthClient.put<OfferResponse>(`${OFFERS_ENDPOINT}/${offerId}`, offerData);
        return response.data;
    } catch (error) {
        console.error('Błąd podczas aktualizacji ogłoszenia:', error);
        throw error;
    }
};