export interface RawOfferData {
  id: string;
  title: string;
  price: number;
  description?: string;
  CarDetailsDto?: {
    mileage?: number;
    fuelType?: string;
    year?: number;
    enginePower?: number;
    displacement?: string;
    [key: string]: any;
  };
  mainImage?: string;
  imageUrls?: string[];
  images?: string[];
  [key: string]: any;
}
