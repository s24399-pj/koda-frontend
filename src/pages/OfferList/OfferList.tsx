import React, {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import axios from "axios";
import "./OfferList.scss";
import useTitle from "../../hooks/useTitle";
import {MiniOffer} from "../../types/miniOfferTypes";
import LikeButton from "../../components/LikeButton/LikeButton";
import CompareCheckbox from "../../components/CompareCheckbox/CompareCheckbox";
import ComparisonBar from "../../components/ComparisonBar/ComparisonBar";
import { useComparison } from "../../context/ComparisonContext";
import AdvancedFilter from "../../components/AdvancedFilter/AdvancedFilter";

const API_URL = import.meta.env.VITE_API_URL;

const adaptToMiniOffer = (item: any): MiniOffer => {
  // Extract car details from the correct property
  const carDetails = item.carDetails || {};
  
  // Get the main image from imageUrls array
  let mainImage = '';
  if (item.imageUrls && item.imageUrls.length > 0) {
    mainImage = item.imageUrls[0];
  }
  
  return {
    id: item.id || '',
    title: item.title || '',
    price: typeof item.price === 'number' ? item.price : 
           typeof item.price === 'string' ? parseFloat(item.price) : 0,
    mainImage: mainImage,
    mileage: carDetails.mileage || 0,
    fuelType: carDetails.fuelType || 'UNKNOWN',
    year: carDetails.year || 0,
    enginePower: carDetails.enginePower || 0,
    displacement: carDetails.displacement || ''
  };
};

const OfferList: React.FC = () => {
  useTitle("Dostępne oferty");

  const [offers, setOffers] = useState<MiniOffer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    selectedOffers,
    addToComparison,
    removeFromComparison,
    isOfferSelected,
    canAddMoreOffers
  } = useComparison();

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = "true";
      target.src = "https://via.placeholder.com/300x200?text=Brak+zdjęcia";
      console.warn('Błąd ładowania zdjęcia w liście ofert:', target.src);
    }
  };

  // Handle search results from AdvancedFilter
  const handleSearchResults = (results: any) => {
    setError(null);
    
    if (!results || !results.content) {
      console.warn('Invalid search results received:', results);
      setOffers([]);
      setTotalPages(0);
      return;
    }

    try {
      // Process the results using the adapter for the actual data structure
      const processedOffers = results.content.map(adaptToMiniOffer);
      
      console.log('Processed offers:', processedOffers);
      
      setOffers(processedOffers);
      setTotalPages(results.totalPages || 1);
      setCurrentPage(results.number ? results.number + 1 : 1);
    } catch (err) {
      console.error('Error processing search results:', err);
      setError('An error occurred while processing the search results.');
      setOffers([]);
    }
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleOfferClick = (id: string) => {
    navigate(`/offer/${id}`);
  };

  const handleToggleComparison = (id: string, checked: boolean) => {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;

    if (checked) {
      addToComparison(offer);
    } else {
      removeFromComparison(id);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const renderPaginationButtons = () => {
    const isMobile = window.innerWidth <= 768;
    const maxButtonsToShow = isMobile ? 3 : 5;

    let startPage = Math.max(currentPage - Math.floor(maxButtonsToShow / 2), 1);
    let endPage = Math.min(startPage + maxButtonsToShow - 1, totalPages);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(endPage - maxButtonsToShow + 1, 1);
    }

    const pages = [];

    if (startPage > 1) {
      pages.push(
        <button key="first" onClick={() => setCurrentPage(1)}>1</button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={currentPage === i ? "active" : ""}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button key="last" onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  const truncateText = (text: string, maxLength: number) => {
    const isMobile = window.innerWidth <= 768;
    const actualMaxLength = isMobile ? Math.min(maxLength, 30) : maxLength;

    return text.length > actualMaxLength
      ? `${text.substring(0, actualMaxLength)}...`
      : text;
  };

  // Helper function to format fuel type for display
  const formatFuelType = (fuelType: string): string => {
    switch (fuelType) {
      case 'PETROL': return 'Benzyna';
      case 'DIESEL': return 'Diesel';
      case 'LPG': return 'LPG';
      case 'HYBRID': return 'Hybryda';
      case 'ELECTRIC': return 'Elektryczny';
      case 'HYDROGEN': return 'Wodór';
      case 'OTHER': return 'Inne';
      default: return fuelType || 'Brak danych';
    }
  };

  return (
    <div className="offer-list-container">
      {/* Mobile filter toggle button */}
      <div className="filter-toggle-mobile">
        <button onClick={toggleFilters}>
          {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
        </button>
      </div>
      
      {/* Two-column layout for desktop */}
      <div className="offer-list-layout">
        {/* Filter Panel - Left column on desktop, toggleable on mobile */}
        <div className={`filter-panel ${showFilters ? 'show' : ''}`}>
          <AdvancedFilter onSearch={handleSearchResults} onLoading={handleLoading} />
        </div>
        
        {/* Offers List - Right column */}
        <div className="offers-panel">
          <div className="offers-header">
            <h1>Dostępne oferty</h1>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="loading-indicator">Ładowanie ofert...</p>
          ) : (
            <>
              {/* Informacja o liczbie wyników */}
              {offers.length > 0 && (
                <div className="results-summary">
                  Znaleziono {offers.length} {offers.length === 1 ? 'ofertę' : 
                    offers.length < 5 ? 'oferty' : 'ofert'} na stronie {currentPage} z {totalPages}
                </div>
              )}

              <div className="offer-list">
                {offers.length > 0 ? (
                  offers.map((offer) => (
                    <div key={offer.id} className="offer-card">
                      <div className="offer-clickable" onClick={() => handleOfferClick(offer.id)}>
                        <div className="offer-image-container">
                          {offer.mainImage ? (
                            <img
                              src={offer.mainImage.startsWith('http') 
                                ? offer.mainImage 
                                : `${API_URL}/images/${offer.mainImage}`}
                              alt={offer.title}
                              loading="lazy"
                              onError={handleImageError}
                            />
                          ) : (
                            <div className="no-image">Brak zdjęcia</div>
                          )}
                        </div>
                        <div className="offer-details">
                          <div className="offer-header">
                            <h2>{truncateText(offer.title, 50)}</h2>
                            <div className="price-actions">
                              <span className="offer-price">
                                {typeof offer.price === 'number' 
                                  ? offer.price.toLocaleString() 
                                  : parseFloat(offer.price).toLocaleString()} PLN
                              </span>
                              <LikeButton offerId={offer.id} />
                            </div>
                          </div>
                          <div className="offer-info">
                            <p><strong>Rok:</strong> <span>{offer.year || 'Brak danych'}</span></p>
                            <p><strong>Przebieg:</strong> <span>
                              {offer.mileage ? `${offer.mileage.toLocaleString()} km` : 'Brak danych'}
                            </span></p>
                            <p><strong>Typ paliwa:</strong> <span>{formatFuelType(offer.fuelType)}</span></p>
                            <p><strong>Moc silnika:</strong> <span>
                              {offer.enginePower ? `${offer.enginePower} KM` : 'Brak danych'}
                            </span></p>
                            <p><strong>Pojemność silnika:</strong> <span>
                              {offer.displacement ? `${offer.displacement}` : 'Brak danych'}
                            </span></p>
                          </div>

                          <div className="offer-compare-bottom">
                            <CompareCheckbox
                              offerId={offer.id}
                              isSelected={isOfferSelected(offer.id)}
                              isDisabled={!canAddMoreOffers() && !isOfferSelected(offer.id)}
                              onToggle={handleToggleComparison}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p className="no-offers">
                      Brak ofert spełniających kryteria wyszukiwania
                    </p>
                    <p className="no-offers-hint">
                      Spróbuj zmienić filtry lub rozszerzyć kryteria wyszukiwania
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                {"<"}
              </button>

              {renderPaginationButtons()}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                {">"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ComparisonBar
        selectedOffers={selectedOffers}
        removeFromComparison={removeFromComparison}
      />
    </div>
  );
};

export default OfferList;