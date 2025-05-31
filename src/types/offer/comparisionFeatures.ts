export type ComparisonType = 'higher' | 'lower';

export interface Feature {
    label: string;
    key: string;
    unit?: string;
    highlightBetter?: ComparisonType;
    carDetails?: boolean;
}

export const comparisonFeatures: Feature[] = [
    {label: "Tytuł", key: "title"},
    {label: "Cena", key: "price", unit: "PLN", highlightBetter: 'lower'},
    {label: "Rok produkcji", key: "year", highlightBetter: 'higher', carDetails: true},
    {label: "Przebieg", key: "mileage", unit: "km", highlightBetter: 'lower', carDetails: true},
    {label: "Typ paliwa", key: "fuelType", carDetails: true},
    {label: "Moc silnika", key: "enginePower", unit: "KM", highlightBetter: 'higher', carDetails: true},
    {label: "Pojemność silnika", key: "displacement", carDetails: true},
    {label: "Skrzynia biegów", key: "transmission", carDetails: true},
    {label: "Liczba drzwi", key: "doors", carDetails: true},
    {label: "Liczba miejsc", key: "seats", carDetails: true},
    {label: "Marka", key: "brand", carDetails: true},
    {label: "Model", key: "model", carDetails: true},
    {label: "Lokalizacja", key: "location"},
    {label: "Telefon kontaktowy", key: "contactPhone"},
    {label: "Email kontaktowy", key: "contactEmail"}
];