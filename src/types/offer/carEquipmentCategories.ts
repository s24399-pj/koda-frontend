import {CarEquipment} from "./OfferTypes.ts";

export interface EquipmentItem {
    key: keyof CarEquipment;
    label: string;
}

export interface EquipmentCategory {
    title: string;
    icon: string;
    items: EquipmentItem[];
}

export const equipmentCategories: EquipmentCategory[] = [
    {
        title: "Comfort",
        icon: "🛋️",
        items: [
            { key: 'airConditioning', label: 'Air Conditioning' },
            { key: 'automaticClimate', label: 'Automatic Climate Control' },
            { key: 'heatedSeats', label: 'Heated Seats' },
            { key: 'electricSeats', label: 'Electric Seats' },
            { key: 'leatherSeats', label: 'Leather Seats' },
            { key: 'panoramicRoof', label: 'Panoramic Roof' },
            { key: 'electricWindows', label: 'Electric Windows' },
            { key: 'electricMirrors', label: 'Electric Mirrors' },
            { key: 'keylessEntry', label: 'Keyless Entry' },
            { key: 'wheelHeating', label: 'Heated Steering Wheel' },
            { key: 'heatedSteeringWheel', label: 'Heated Steering Wheel' }
        ]
    },
    {
        title: "Multimedia",
        icon: "📱",
        items: [
            { key: 'navigationSystem', label: 'Navigation System' },
            { key: 'bluetooth', label: 'Bluetooth' },
            { key: 'usbPort', label: 'USB Port' },
            { key: 'multifunction', label: 'Multifunction Steering Wheel' },
            { key: 'androidAuto', label: 'Android Auto' },
            { key: 'appleCarPlay', label: 'Apple CarPlay' },
            { key: 'soundSystem', label: 'Sound System' }
        ]
    },
    {
        title: "Driver Assistance",
        icon: "🛡️",
        items: [
            { key: 'parkingSensors', label: 'Parking Sensors' },
            { key: 'rearCamera', label: 'Rear Camera' },
            { key: 'cruiseControl', label: 'Cruise Control' },
            { key: 'adaptiveCruiseControl', label: 'Adaptive Cruise Control' },
            { key: 'laneAssist', label: 'Lane Assist' },
            { key: 'blindSpotDetection', label: 'Blind Spot Detection' },
            { key: 'emergencyBraking', label: 'Emergency Braking' },
            { key: 'startStop', label: 'Start-Stop System' }
        ]
    },
    {
        title: "Lighting",
        icon: "💡",
        items: [
            { key: 'xenonLights', label: 'Xenon Lights' },
            { key: 'ledLights', label: 'LED Lights' },
            { key: 'ambientLighting', label: 'Ambient Lighting' },
            { key: 'automaticLights', label: 'Automatic Lights' },
            { key: 'adaptiveLights', label: 'Adaptive Lights' }
        ]
    },
    {
        title: "Additional Features",
        icon: "⭐",
        items: [
            { key: 'electricTrunk', label: 'Electric Trunk' },
            { key: 'electricSunBlind', label: 'Electric Sun Blind' },
            { key: 'headUpDisplay', label: 'Head-Up Display' },
            { key: 'aromatherapy', label: 'Aromatherapy' }
        ]
    }
];