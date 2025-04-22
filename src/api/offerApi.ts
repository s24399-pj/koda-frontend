import axiosAuthClient from './axiosAuthClient';
import {CreateOfferCommand, OfferResponse} from "../types/offer/OfferTypes.ts";

// Endpoint dla API ofert
const OFFERS_ENDPOINT = '/api/v1/offers';


export const createOffer = async (offerData: CreateOfferCommand): Promise<OfferResponse> => {
    try {
        const response = await axiosAuthClient.post<OfferResponse>(OFFERS_ENDPOINT, offerData);
        return response.data;
    } catch (error) {
        console.error('Błąd podczas tworzenia oferty:', error);
        throw error;
    }
};
