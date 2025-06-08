import {CarEquipment} from "./OfferTypes.ts";

export interface EquipmentItem {
    key: keyof CarEquipment;
    label: string;
}

export interface EquipmentCategory {
    title: string;
    items: EquipmentItem[];
}

export const equipmentCategories: EquipmentCategory[] = [
    {
        title: "Komfort",
        items: [
            { key: 'airConditioning', label: 'Klimatyzacja' },
            { key: 'automaticClimate', label: 'Klimatyzacja automatyczna' },
            { key: 'heatedSeats', label: 'Podgrzewane fotele' },
            { key: 'electricSeats', label: 'Elektryczne fotele' },
            { key: 'leatherSeats', label: 'Skórzane fotele' },
            { key: 'panoramicRoof', label: 'Dach panoramiczny' },
            { key: 'electricWindows', label: 'Elektryczne szyby' },
            { key: 'electricMirrors', label: 'Elektryczne lusterka' },
            { key: 'keylessEntry', label: 'Wejście bezkluczykowe' },
            { key: 'wheelHeating', label: 'Podgrzewana kierownica' },
            { key: 'heatedSteeringWheel', label: 'Podgrzewana kierownica' }
        ]
    },
    {
        title: "Multimedia",
        items: [
            { key: 'navigationSystem', label: 'System nawigacji' },
            { key: 'bluetooth', label: 'Bluetooth' },
            { key: 'usbPort', label: 'Port USB' },
            { key: 'multifunction', label: 'Kierownica wielofunkcyjna' },
            { key: 'androidAuto', label: 'Android Auto' },
            { key: 'appleCarPlay', label: 'Apple CarPlay' },
            { key: 'soundSystem', label: 'System audio' }
        ]
    },
    {
        title: "Wspomaganie kierowcy",
        items: [
            { key: 'parkingSensors', label: 'Czujniki parkowania' },
            { key: 'rearCamera', label: 'Kamera cofania' },
            { key: 'cruiseControl', label: 'Tempomat' },
            { key: 'adaptiveCruiseControl', label: 'Tempomat adaptacyjny' },
            { key: 'laneAssist', label: 'Asystent pasa ruchu' },
            { key: 'blindSpotDetection', label: 'Wykrywanie martwego pola' },
            { key: 'emergencyBraking', label: 'Awaryjne hamowanie' },
            { key: 'startStop', label: 'System start-stop' }
        ]
    },
    {
        title: "Oświetlenie",
        items: [
            { key: 'xenonLights', label: 'Światła ksenonowe' },
            { key: 'ledLights', label: 'Światła LED' },
            { key: 'ambientLighting', label: 'Oświetlenie nastrojowe' },
            { key: 'automaticLights', label: 'Automatyczne światła' },
            { key: 'adaptiveLights', label: 'Światła adaptacyjne' }
        ]
    },
    {
        title: "Dodatkowe funkcjonalności",
        items: [
            { key: 'electricTrunk', label: 'Elektryczny bagażnik' },
            { key: 'electricSunBlind', label: 'Elektryczna roleta' },
            { key: 'headUpDisplay', label: 'Wyświetlacz HUD' },
            { key: 'aromatherapy', label: 'Aromaterapia' }
        ]
    }
];