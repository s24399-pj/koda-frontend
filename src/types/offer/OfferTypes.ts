// Enumeracje
import {OfferData} from "../offerTypes.ts";

export enum FuelType {
    PETROL = 'PETROL',
    DIESEL = 'DIESEL',
    LPG = 'LPG',
    HYBRID = 'HYBRID',
    ELECTRIC = 'ELECTRIC',
    HYDROGEN = 'HYDROGEN',
    OTHER = 'OTHER'
}

export enum TransmissionType {
    MANUAL = 'MANUAL',
    AUTOMATIC = 'AUTOMATIC',
    SEMI_AUTOMATIC = 'SEMI_AUTOMATIC'
}

export enum BodyType {
    SEDAN = 'SEDAN',
    HATCHBACK = 'HATCHBACK',
    ESTATE = 'ESTATE',
    SUV = 'SUV',
    COUPE = 'COUPE',
    CONVERTIBLE = 'CONVERTIBLE',
    PICKUP = 'PICKUP',
    VAN = 'VAN',
    MINIBUS = 'MINIBUS',
    OTHER = 'OTHER'
}

export enum DriveType {
    FRONT_WHEEL_DRIVE = 'FRONT_WHEEL_DRIVE',
    REAR_WHEEL_DRIVE = 'REAR_WHEEL_DRIVE',
    ALL_WHEEL_DRIVE = 'ALL_WHEEL_DRIVE',
    FOUR_WHEEL_DRIVE = 'FOUR_WHEEL_DRIVE',
    OTHER = 'OTHER'
}

export enum VehicleCondition {
    NEW = 'NEW',
    USED = 'USED',
    DAMAGED = 'DAMAGED',
    FOR_PARTS = 'FOR_PARTS',
    RESTORED = 'RESTORED',
    CLASSIC = 'CLASSIC'
}

// Interface dla wyposażenia samochodu
export interface CarEquipment {
    // Komfort
    airConditioning?: boolean;
    automaticClimate?: boolean;
    heatedSeats?: boolean;
    electricSeats?: boolean;
    leatherSeats?: boolean;
    panoramicRoof?: boolean;
    electricWindows?: boolean;
    electricMirrors?: boolean;
    keylessEntry?: boolean;
    wheelHeating?: boolean;

    // Multimedia
    navigationSystem?: boolean;
    bluetooth?: boolean;
    usbPort?: boolean;
    multifunction?: boolean;
    androidAuto?: boolean;
    appleCarPlay?: boolean;
    soundSystem?: boolean;

    // Systemy wspomagające
    parkingSensors?: boolean;
    rearCamera?: boolean;
    cruiseControl?: boolean;
    adaptiveCruiseControl?: boolean;
    laneAssist?: boolean;
    blindSpotDetection?: boolean;
    emergencyBraking?: boolean;
    startStop?: boolean;

    // Oświetlenie
    xenonLights?: boolean;
    ledLights?: boolean;
    ambientLighting?: boolean;
    automaticLights?: boolean;
    adaptiveLights?: boolean;

    // Dodatkowe funkcje
    heatedSteeringWheel?: boolean;
    electricTrunk?: boolean;
    electricSunBlind?: boolean;
    headUpDisplay?: boolean;
    aromatherapy?: boolean;
}

// Interface dla tworzenia oferty
export interface CreateOfferCommand {
    // Podstawowe informacje o ofercie
    title: string;
    description: string;
    price: number;
    currency: string;
    negotiable?: boolean;

    // Informacje kontaktowe
    location?: string;
    contactPhone?: string;
    contactEmail?: string;
    expirationDate?: string;

    // Szczegóły pojazdu
    brand: string;
    model: string;
    year: number;
    color?: string;
    displacement?: string;
    vin?: string;
    mileage?: number;
    fuelType?: FuelType;
    transmission?: TransmissionType;
    bodyType?: BodyType;
    driveType?: DriveType;
    enginePower?: number;
    doors?: number;
    seats?: number;
    condition?: VehicleCondition;
    registrationNumber?: string;
    registrationCountry?: string;
    firstOwner?: boolean;
    accidentFree?: boolean;
    serviceHistory?: boolean;
    additionalFeatures?: string;

    // Wyposażenie pojazdu
    equipment?: CarEquipment;
}

// Interface dla odpowiedzi z API
export interface OfferResponse {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    createdAt: string;
    // Inne pola które są zwracane przez API
}

// Nowy interfejs dla odpowiedzi z API zawierającej listę ofert
export interface OffersResponse {
    content: OfferData[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
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