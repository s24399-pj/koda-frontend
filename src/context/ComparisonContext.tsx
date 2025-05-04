import React, { createContext, useState, useContext, ReactNode } from "react";
import { MiniOffer } from "../types/miniOfferTypes";

interface ComparisonContextType {
    selectedOffers: MiniOffer[];
    addToComparison: (offer: MiniOffer) => void;
    removeFromComparison: (id: string) => void;
    isOfferSelected: (id: string) => boolean;
    canAddMoreOffers: () => boolean;
    clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error("useComparison must be used within a ComparisonProvider");
    }
    return context;
};

interface ComparisonProviderProps {
    children: ReactNode;
}

export const ComparisonProvider: React.FC<ComparisonProviderProps> = ({ children }) => {
    const [selectedOffers, setSelectedOffers] = useState<MiniOffer[]>([]);

    const addToComparison = (offer: MiniOffer) => {
        if (selectedOffers.length < 2 && !isOfferSelected(offer.id)) {
            setSelectedOffers([...selectedOffers, offer]);
        }
    };

    const removeFromComparison = (id: string) => {
        setSelectedOffers(selectedOffers.filter((offer) => offer.id !== id));
    };

    const isOfferSelected = (id: string) => {
        return selectedOffers.some((offer) => offer.id === id);
    };

    const canAddMoreOffers = () => {
        return selectedOffers.length < 2;
    };

    const clearComparison = () => {
        setSelectedOffers([]);
    };

    const value = {
        selectedOffers,
        addToComparison,
        removeFromComparison,
        isOfferSelected,
        canAddMoreOffers,
        clearComparison,
    };

    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    );
};

export default ComparisonContext;