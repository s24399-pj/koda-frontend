import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './OfferList.scss';
import useTitle from '../../hooks/useTitle';
import { MiniOffer } from '../../types/miniOfferTypes';
import LikeButton from '../../components/LikeButton/LikeButton';
import CompareCheckbox from '../../components/CompareCheckbox/CompareCheckbox';
import ComparisonBar from '../../components/ComparisonBar/ComparisonBar';
import { useComparison } from '../../context/ComparisonContext';
import AdvancedFilter from '../../components/AdvancedFilter/AdvancedFilter';
import { translations } from '../../translations/carEquipmentTranslations';
import offerApiService, { SearchResponse, AdvancedSearchParams } from '../../api/offerApi';
import { DEFAULT_CAR_IMAGE } from '../../util/constants.tsx';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Functional component that displays a list of offers.
 * It allows users to filter, compare, and navigate through different offers.
 */
const OfferList: React.FC = () => {
  useTitle('Dostępne oferty');
  const navigate = useNavigate();
  const advancedFilterRef = useRef<any>(null);

  const [offers, setOffers] = useState<MiniOffer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialFilters, setInitialFilters] = useState<AdvancedSearchParams>({});

  const {
    selectedOffers,
    addToComparison,
    removeFromComparison,
    isOfferSelected,
    canAddMoreOffers,
  } = useComparison();

  /**
   * Effect hook to read and process search parameters from sessionStorage on component mount.
   */
  useEffect(() => {
    try {
      const paramsJson = sessionStorage.getItem('simpleSearchParams');
      if (paramsJson) {
        const params = JSON.parse(paramsJson);
        console.log('Found SimpleSearch parameters in sessionStorage:', params);

        sessionStorage.removeItem('simpleSearchParams');

        if (typeof params === 'object') {
          const cleanParams: AdvancedSearchParams = {};

          if (params.phrase && params.phrase.trim() !== '') {
            cleanParams.phrase = params.phrase.trim();
          }

          if (params.minPrice && typeof params.minPrice === 'number') {
            cleanParams.minPrice = params.minPrice;
          }

          if (params.maxPrice && typeof params.maxPrice === 'number') {
            cleanParams.maxPrice = params.maxPrice;
          }

          console.log('Prepared parameters for AdvancedFilter:', cleanParams);

          if (Object.keys(cleanParams).length > 0) {
            setInitialFilters(cleanParams);
          }
        }
      }
    } catch (error) {
      console.error('Error reading parameters from sessionStorage:', error);
    }
  }, []);

  /**
   * Handles image loading errors by setting a default image.
   * @param {React.SyntheticEvent<HTMLImageElement>} event - The event object from the image error.
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = DEFAULT_CAR_IMAGE;
      console.warn('Error loading image in offer list:', target.src);
    }
  };

  /**
   * Processes and sets the search results.
   * @param {SearchResponse<MiniOffer>} results - The search results to handle.
   */
  const handleSearchResults = (results: SearchResponse<MiniOffer>) => {
    setError(null);

    if (!results || !results.content) {
      console.warn('Invalid search results:', results);
      setOffers([]);
      setTotalPages(0);
      return;
    }

    try {
      setOffers(results.content);
      setTotalPages(results.totalPages || 1);
      setCurrentPage(results.number !== undefined ? results.number + 1 : 1);
    } catch (err) {
      console.error('Error processing search results:', err);
      setError('Wystąpił błąd podczas przetwarzania wyników wyszukiwania.');
      setOffers([]);
    }
  };

  /**
   * Sets the loading state.
   * @param {boolean} loading - The loading state to set.
   */
  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  /**
   * Navigates to the offer details page.
   * @param {string} id - The ID of the offer to navigate to.
   */
  const handleOfferClick = (id: string) => {
    navigate(`/offer/${id}`);
  };

  /**
   * Toggles the comparison state of an offer.
   * @param {string} id - The ID of the offer to toggle.
   * @param {boolean} checked - The comparison state to set.
   */
  const handleToggleComparison = (id: string, checked: boolean) => {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;

    if (checked) {
      addToComparison(offer);
    } else {
      removeFromComparison(id);
    }
  };

  /**
   * Handles page change events and fetches the corresponding offers.
   * @param {number} newPage - The new page number to navigate to.
   */
  const handlePageChange = async (newPage: number) => {
    console.log(`Changing page to ${newPage}`);

    let currentFilters = {};
    if (
      advancedFilterRef.current &&
      typeof advancedFilterRef.current.getCurrentFilters === 'function'
    ) {
      currentFilters = advancedFilterRef.current.getCurrentFilters();
      console.log('Current filters during page change:', currentFilters);
    }

    setCurrentPage(newPage);
    setIsLoading(true);

    const apiPage = newPage - 1;

    try {
      const results = await offerApiService.searchOffers(currentFilters as AdvancedSearchParams, {
        page: apiPage,
        size: 10,
      });

      console.log(`Results for page ${newPage}:`, results);

      if (results && results.content) {
        setOffers(results.content);
        setTotalPages(results.totalPages || 1);
        setError(null);
      } else {
        console.warn('Invalid response during page change:', results);
        setOffers([]);
        setError('Nie udało się załadować ofert. Nieprawidłowa odpowiedź z serwera.');
      }
    } catch (error) {
      console.error('Error during page change:', error);
      setError('Nie udało się załadować ofert. Spróbuj ponownie później.');
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Renders pagination buttons based on the current page and total pages.
   * @returns {Array} An array of pagination button elements.
   */
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
        <button key="first" onClick={() => handlePageChange(1)}>
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="pagination-ellipsis">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={currentPage === i ? 'active' : ''}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="pagination-ellipsis">
            ...
          </span>
        );
      }
      pages.push(
        <button key="last" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  /**
   * Truncates text to a specified maximum length.
   * @param {string} text - The text to truncate.
   * @param {number} maxLength - The maximum length of the text.
   * @returns {string} The truncated text.
   */
  const truncateText = (text: string, maxLength: number) => {
    const isMobile = window.innerWidth <= 768;
    const actualMaxLength = isMobile ? Math.min(maxLength, 30) : maxLength;

    return text.length > actualMaxLength ? `${text.substring(0, actualMaxLength)}...` : text;
  };

  /**
   * Formats the fuel type text.
   * @param {string} fuelType - The fuel type to format.
   * @returns {string} The formatted fuel type.
   */
  const formatFuelType = (fuelType: string): string => {
    return (
      translations.fuelType[fuelType as keyof typeof translations.fuelType] ||
      fuelType ||
      'Brak danych'
    );
  };

  return (
    <div className="offer-list-container">
      <div className="offer-list-layout">
        <div className={`filter-panel ${showFilters ? 'show' : ''}`}>
          <AdvancedFilter
            ref={advancedFilterRef}
            onSearch={handleSearchResults}
            onLoading={handleLoading}
            initialFilters={initialFilters}
          />
        </div>

        <div className="offers-panel">
          <div className="offers-header">
            <h1>Dostępne oferty</h1>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <p className="loading-indicator">Ładowanie ofert...</p>
          ) : (
            <>
              {offers.length > 0 && (
                <div className="results-summary">
                  Znaleziono {offers.length}{' '}
                  {offers.length === 1 ? 'ofertę' : offers.length < 5 ? 'oferty' : 'ofert'} na
                  stronie {currentPage} z {totalPages}
                </div>
              )}

              <div className="offer-list">
                {offers.length > 0 ? (
                  offers.map(offer => (
                    <div key={offer.id} className="offer-card">
                      <div className="offer-clickable" onClick={() => handleOfferClick(offer.id)}>
                        <div className="offer-image-container">
                          {offer.mainImage ? (
                            <img
                              src={`${API_URL}${offer.mainImage}`}
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
                                  : parseFloat(String(offer.price)).toLocaleString()}{' '}
                                PLN
                              </span>
                              <LikeButton offerId={offer.id} />
                            </div>
                          </div>
                          <div className="offer-info">
                            <p>
                              <strong>Rok:</strong> <span>{offer.year || 'Brak danych'}</span>
                            </p>
                            <p>
                              <strong>Przebieg:</strong>{' '}
                              <span>
                                {offer.mileage
                                  ? `${offer.mileage.toLocaleString()} km`
                                  : 'Brak danych'}
                              </span>
                            </p>
                            <p>
                              <strong>Typ paliwa:</strong>{' '}
                              <span>{formatFuelType(offer.fuelType)}</span>
                            </p>
                            <p>
                              <strong>Moc silnika:</strong>{' '}
                              <span>
                                {offer.enginePower ? `${offer.enginePower} KM` : 'Brak danych'}
                              </span>
                            </p>
                            <p>
                              <strong>Pojemność silnika:</strong>{' '}
                              <span>
                                {offer.displacement ? `${offer.displacement}` : 'Brak danych'}
                              </span>
                            </p>
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
                    <p className="no-offers">Brak ofert spełniających kryteria wyszukiwania</p>
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
                onClick={() => handlePageChange(currentPage - 1)}
              >
                {'<'}
              </button>

              {renderPaginationButtons()}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                {'>'}
              </button>
            </div>
          )}
        </div>
      </div>

      <ComparisonBar selectedOffers={selectedOffers} removeFromComparison={removeFromComparison} />
    </div>
  );
};

export default OfferList;