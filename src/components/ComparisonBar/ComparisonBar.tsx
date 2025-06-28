/**
 * Component for displaying and managing offers selected for comparison
 * @module components/comparison/ComparisonBar
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ComparisonBar.scss';
import { MiniOffer } from '../../types/miniOfferTypes';

/**
 * Props for ComparisonBar component
 * @interface ComparisonBarProps
 */
interface ComparisonBarProps {
  /** Array of offers selected for comparison */
  selectedOffers: MiniOffer[];
  /** Function to remove an offer from comparison */
  removeFromComparison: (id: string) => void;
}

/**
 * Component that shows a floating bar with offers selected for comparison
 * Allows users to navigate to the comparison page when two offers are selected
 * @component
 * @param {ComparisonBarProps} props - Component props
 * @returns {JSX.Element|null} The ComparisonBar component or null if no offers selected
 */
const ComparisonBar: React.FC<ComparisonBarProps> = ({ selectedOffers, removeFromComparison }) => {
  /** Navigation hook for redirecting to comparison page */
  const navigate = useNavigate();
  
  /**
   * Handles the compare button click
   * Stores selected offers in sessionStorage and navigates to comparison page
   * @function handleCompare
   */
  const handleCompare = () => {
    if (selectedOffers.length === 2) {
      sessionStorage.setItem('comparisonOffers', JSON.stringify(selectedOffers));
      navigate('/comparison');
    }
  };
  
  // Don't render the component if no offers are selected
  if (selectedOffers.length === 0) {
    return null;
  }
  
  return (
    <div className="comparison-bar">
      <div className="comparison-bar-content">
        <div className="selected-offers">
          {selectedOffers.map(offer => (
            <div key={offer.id} className="selected-offer">
              <div className="offer-title">{offer.title}</div>
              <button
                className="remove-button"
                onClick={e => {
                  /**
                   * Prevents event bubbling and removes the offer from comparison
                   * @param {React.MouseEvent} e - Click event
                   */
                  e.stopPropagation();
                  removeFromComparison(offer.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {selectedOffers.length < 2 && (
            <div className="placeholder-offer">
              Wybierz {2 - selectedOffers.length} ofertę do porównania
            </div>
          )}
        </div>
        <button
          className="compare-button"
          disabled={selectedOffers.length !== 2}
          onClick={handleCompare}
        >
          Porównaj
        </button>
      </div>
    </div>
  );
};

export default ComparisonBar;