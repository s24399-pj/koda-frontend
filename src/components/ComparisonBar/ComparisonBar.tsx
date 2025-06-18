import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ComparisonBar.scss';
import { MiniOffer } from '../../types/miniOfferTypes';

interface ComparisonBarProps {
  selectedOffers: MiniOffer[];
  removeFromComparison: (id: string) => void;
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({ selectedOffers, removeFromComparison }) => {
  const navigate = useNavigate();

  const handleCompare = () => {
    if (selectedOffers.length === 2) {
      sessionStorage.setItem('comparisonOffers', JSON.stringify(selectedOffers));
      navigate('/comparison');
    }
  };

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
