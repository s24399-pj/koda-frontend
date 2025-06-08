import {CarEquipment, VehicleCondition} from "./offer/OfferTypes.ts";

export interface CarDetails {
    brand: string;
    model: string;
    year: number;
    color: string;
    displacement: string;
    vin?: string;
    mileage: number;
    fuelType: string;
    transmission: string;
    bodyType: string;
    driveType: string;
    enginePower: number;
    doors: number;
    seats: number;
    condition?: VehicleCondition;
    registrationNumber?: string;
    registrationCountry?: string;
    firstOwner?: boolean;
    accidentFree?: boolean;
    serviceHistory?: boolean;
    additionalFeatures?: string;
    carEquipment?: CarEquipment;
}

export interface SellerData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePictureBase64?: string;
}

export interface OfferData {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    seller: SellerData;
    location: string;
    contactPhone: string;
    contactEmail: string;
    mainImage: string;
    imageUrls?: string[];
    CarDetailsDto: CarDetails;
}

export interface ApiOffer {
    id: string;
    title: string;
    price: number;
    mainImage: string | null;
    mileage: number;
    fuelType: string;
    year: number;
    enginePower: number;
    displacement: string;
    brand?: string;
    model?: string;
    description?: string;
    currency?: string;
    seller?: SellerData;
    location?: string;
    contactPhone?: string;
    contactEmail?: string;
    color?: string;
    transmission?: string;
    bodyType?: string;
    driveType?: string;
    doors?: number;
    seats?: number;
}