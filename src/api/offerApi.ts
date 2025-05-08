import axiosAuthClient from './axiosAuthClient';
import { CreateOfferCommand, OfferResponse } from '../types/offer/OfferTypes';

const OFFERS_ENDPOINT = '/api/v1/offers';

export interface OffersResponse {
    content: any[];
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

export const createOffer = async (offerData: CreateOfferCommand): Promise<OfferResponse> => {
    try {
        const response = await axiosAuthClient.post<OfferResponse>(OFFERS_ENDPOINT, offerData);
        return response.data;
    } catch (error) {
        console.error('Błąd podczas tworzenia oferty:', error);
        throw error;
    }
};

export const getUserOffers = async (userId: string): Promise<OffersResponse> => {
    try {
        console.log(`Pobieranie ogłoszeń dla użytkownika ${userId}`);

        const response = await axiosAuthClient.get<OffersResponse>(OFFERS_ENDPOINT, {
            params: {
                userId: userId
            }
        });

        console.log('Otrzymano odpowiedź:', response.data);
        return response.data;
    } catch (error) {
        console.error('Błąd podczas pobierania ogłoszeń użytkownika:', error);
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

export const deleteOffer = async (offerId: string): Promise<boolean> => {
    try {
        const response = await axiosAuthClient.delete(`${OFFERS_ENDPOINT}/${offerId}`);
        return response.status === 200 || response.status === 204;
    } catch (error: any) {
        console.error('Błąd podczas usuwania ogłoszenia:', error);

        if (error.response) {
            if (error.response.status === 403) {
                console.error('Brak uprawnień do usunięcia ogłoszenia');
            } else if (error.response.status === 404) {
                console.error('Ogłoszenie nie zostało znalezione');
            }
        }

        return false;
    }
};

export const updateOffer = async (offerId: string, offerData: CreateOfferCommand): Promise<OfferResponse> => {
    try {
        const response = await axiosAuthClient.put<OfferResponse>(`${OFFERS_ENDPOINT}/${offerId}`, offerData);
        return response.data;
    } catch (error) {
        console.error('Błąd podczas aktualizacji ogłoszenia:', error);
        throw error;
    }
};