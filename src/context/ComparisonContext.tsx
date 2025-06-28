import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MiniOffer } from '../types/miniOfferTypes';

/**
 * Defines the shape of the comparison context.
 */
interface ComparisonContextType {
  selectedOffers: MiniOffer[];
  addToComparison: (offer: MiniOffer) => void;
  removeFromComparison: (id: string) => void;
  isOfferSelected: (id: string) => boolean;
  canAddMoreOffers: () => boolean;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

/**
 * Custom hook to access the comparison context.
 * Throws an error if used outside of a ComparisonProvider.
 *
 * @returns {ComparisonContextType} The current context value.
 */
export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

interface ComparisonProviderProps {
  children: ReactNode;
}

/**
 * Provides comparison-related state and functions to its children.
 *
 * @param {ReactNode} children - Components that consume the context.
 * @returns {JSX.Element} A provider wrapping its children with context value.
 */
export const ComparisonProvider: React.FC<ComparisonProviderProps> = ({ children }) => {
  const [selectedOffers, setSelectedOffers] = useState<MiniOffer[]>([]);

  /**
   * Adds an offer to the comparison list if it's not already selected
   * and the list contains fewer than two offers.
   *
   * @param {MiniOffer} offer - The offer to add.
   */
  const addToComparison = (offer: MiniOffer) => {
    if (selectedOffers.length < 2 && !isOfferSelected(offer.id)) {
      setSelectedOffers([...selectedOffers, offer]);
    }
  };

  /**
   * Removes an offer from the comparison list by ID.
   *
   * @param {string} id - The ID of the offer to remove.
   */
  const removeFromComparison = (id: string) => {
    setSelectedOffers(selectedOffers.filter(offer => offer.id !== id));
  };

  /**
   * Checks if an offer with the given ID is currently selected.
   *
   * @param {string} id - The ID to check.
   * @returns {boolean} True if the offer is selected, false otherwise.
   */
  const isOfferSelected = (id: string): boolean => {
    return selectedOffers.some(offer => offer.id === id);
  };

  /**
   * Determines whether more offers can be added to the comparison list.
   *
   * @returns {boolean} True if fewer than two offers are selected.
   */
  const canAddMoreOffers = (): boolean => {
    return selectedOffers.length < 2;
  };

  /**
   * Clears all selected offers from the comparison list.
   */
  const clearComparison = (): void => {
    setSelectedOffers([]);
  };

  const value: ComparisonContextType = {
    selectedOffers,
    addToComparison,
    removeFromComparison,
    isOfferSelected,
    canAddMoreOffers,
    clearComparison,
  };

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
};

export default ComparisonContext;