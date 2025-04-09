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