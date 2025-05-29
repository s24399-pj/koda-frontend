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

export interface Equipment {
    airConditioning: boolean;
    automaticClimate: boolean;
    heatedSeats: boolean;
    navigationSystem: boolean;
    bluetooth: boolean;
    parkingSensors: boolean;
    rearCamera: boolean;
    cruiseControl: boolean;
    xenonLights: boolean;
    ledLights: boolean;
}

export interface SearchFilters {
    searchTerm: string;
    brand: string;
    model: string;
    priceFrom: string;
    priceTo: string;
    currency: string;
    yearFrom: string;
    yearTo: string;
    mileageFrom: string;
    mileageTo: string;
    location: string;
    fuelType: FuelType[];
    transmission: TransmissionType[];
    bodyType: BodyType[];
    driveType: DriveType[];
    condition: VehicleCondition[];
    enginePowerFrom: string;
    enginePowerTo: string;
    doors: string;
    seats: string;
    equipment: Equipment;
}

export interface Translations {
    fuelType: Record<keyof typeof FuelType, string>;
    transmission: Record<keyof typeof TransmissionType, string>;
    bodyType: Record<keyof typeof BodyType, string>;
    driveType: Record<keyof typeof DriveType, string>;
    condition: Record<keyof typeof VehicleCondition, string>;
}

export interface EquipmentOption {
    key: keyof Equipment;
    label: string;
}

export interface AdvancedSearchProps {
    onSearch?: (filters: SearchFilters) => void;
    initialFilters?: Partial<SearchFilters>;
}

// Tłumaczenia
export const translations: Translations = {
    fuelType: {
        PETROL: 'Benzyna',
        DIESEL: 'Diesel',
        LPG: 'LPG',
        HYBRID: 'Hybryda',
        ELECTRIC: 'Elektryczny',
        HYDROGEN: 'Wodór',
        OTHER: 'Inne'
    },
    transmission: {
        MANUAL: 'Manualna',
        AUTOMATIC: 'Automatyczna',
        SEMI_AUTOMATIC: 'Półautomatyczna'
    },
    bodyType: {
        SEDAN: 'Sedan',
        HATCHBACK: 'Hatchback',
        ESTATE: 'Kombi',
        SUV: 'SUV',
        COUPE: 'Coupe',
        CONVERTIBLE: 'Kabriolet',
        PICKUP: 'Pickup',
        VAN: 'Van',
        MINIBUS: 'Minibus',
        OTHER: 'Inne'
    },
    driveType: {
        FRONT_WHEEL_DRIVE: 'Przedni napęd',
        REAR_WHEEL_DRIVE: 'Tylny napęd',
        ALL_WHEEL_DRIVE: 'Napęd na 4 koła',
        FOUR_WHEEL_DRIVE: '4x4',
        OTHER: 'Inne'
    },
    condition: {
        NEW: 'Nowy',
        USED: 'Używany',
        DAMAGED: 'Uszkodzony',
        FOR_PARTS: 'Na części',
        RESTORED: 'Odnowiony',
        CLASSIC: 'Klasyczny'
    }
};

export const equipmentOptions: EquipmentOption[] = [
    { key: 'airConditioning', label: 'Klimatyzacja' },
    { key: 'automaticClimate', label: 'Klimatyzacja automatyczna' },
    { key: 'heatedSeats', label: 'Podgrzewane fotele' },
    { key: 'navigationSystem', label: 'Nawigacja' },
    { key: 'bluetooth', label: 'Bluetooth' },
    { key: 'parkingSensors', label: 'Czujniki parkowania' },
    { key: 'rearCamera', label: 'Kamera cofania' },
    { key: 'cruiseControl', label: 'Tempomat' },
    { key: 'xenonLights', label: 'Xenon' },
    { key: 'ledLights', label: 'LED' }
];

export const popularBrands: string[] = [
    'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 
    'Ford', 'Opel', 'Skoda', 'Peugeot', 'Renault'
];