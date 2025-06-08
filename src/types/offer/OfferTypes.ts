export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  LPG = 'LPG',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
  HYDROGEN = 'HYDROGEN',
  OTHER = 'OTHER',
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
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
  OTHER = 'OTHER',
}

export enum DriveType {
  FRONT_WHEEL_DRIVE = 'FRONT_WHEEL_DRIVE',
  REAR_WHEEL_DRIVE = 'REAR_WHEEL_DRIVE',
  ALL_WHEEL_DRIVE = 'ALL_WHEEL_DRIVE',
  FOUR_WHEEL_DRIVE = 'FOUR_WHEEL_DRIVE',
  OTHER = 'OTHER',
}

export enum VehicleCondition {
  NEW = 'NEW',
  USED = 'USED',
  DAMAGED = 'DAMAGED',
  FOR_PARTS = 'FOR_PARTS',
  RESTORED = 'RESTORED',
  CLASSIC = 'CLASSIC',
}

export interface CarEquipment {
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

  navigationSystem?: boolean;
  bluetooth?: boolean;
  usbPort?: boolean;
  multifunction?: boolean;
  androidAuto?: boolean;
  appleCarPlay?: boolean;
  soundSystem?: boolean;

  parkingSensors?: boolean;
  rearCamera?: boolean;
  cruiseControl?: boolean;
  adaptiveCruiseControl?: boolean;
  laneAssist?: boolean;
  blindSpotDetection?: boolean;
  emergencyBraking?: boolean;
  startStop?: boolean;

  xenonLights?: boolean;
  ledLights?: boolean;
  ambientLighting?: boolean;
  automaticLights?: boolean;
  adaptiveLights?: boolean;

  heatedSteeringWheel?: boolean;
  electricTrunk?: boolean;
  electricSunBlind?: boolean;
  headUpDisplay?: boolean;
  aromatherapy?: boolean;
}

export interface CreateOfferCommand {
  title: string;
  description: string;
  price: number;
  currency: string;
  negotiable?: boolean;
  location?: string;
  contactPhone?: string;
  contactEmail?: string;
  expirationDate?: string;
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
  equipment?: CarEquipment;
}

export interface OfferFormValues {
  title: string;
  description: string;
  price: number;
  currency: string;
  negotiable: boolean;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  enginePower: number;
  doors: number;
  seats: number;
  vin: string;
  registrationNumber: string;
  registrationCountry: string;
  firstOwner: boolean;
  accidentFree: boolean;
  serviceHistory: boolean;
  additionalFeatures: string;
  equipment?: CarEquipment;
  location?: string;
  expirationDate?: string;
  termsAccepted: boolean;
  imageFiles: File[];
  fuelType?: FuelType;
  transmission?: TransmissionType;
  bodyType?: BodyType;
  driveType?: DriveType;
  condition?: VehicleCondition;
  displacement?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface OfferResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  createdAt: string;
}

export interface OffersResponse {
  content: OfferData[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
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

export interface CarDetails {
  brand: string;
  model: string;
  year: number;
  color: string;
  displacement: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  driveType: string;
  enginePower: number;
  doors: number;
  seats: number;
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
