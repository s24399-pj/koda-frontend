/**
 * Component for basic vehicle search functionality
 * @module components/home/SimpleSearch
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SimpleSearch.scss';
import { getMaxPrice, getAllBrands, searchBrandsByPhrase } from '../../api/offerApi';

/**
 * Simple search form for the homepage with brand search and price range selection
 * @component
 * @returns {JSX.Element} The SimpleSearch component
 */
const SimpleSearch: React.FC = () => {
  /** Navigation hook for redirecting to search results */
  const navigate = useNavigate();
  /** Search phrase for brand/model */
  const [phrase, setPhrase] = useState('');
  /** Minimum price formatted with thousand separators */
  const [minPrice, setMinPrice] = useState<string>('');
  /** Maximum price formatted with thousand separators */
  const [maxPrice, setMaxPrice] = useState<string>('');
  /** Maximum price value in the system */
  const [maxPriceValue, setMaxPriceValue] = useState<number>(1000000);
  /** Controls visibility of minimum price suggestions */
  const [showMinPriceSuggestions, setShowMinPriceSuggestions] = useState(false);
  /** Controls visibility of maximum price suggestions */
  const [showMaxPriceSuggestions, setShowMaxPriceSuggestions] = useState(false);
  /** Controls visibility of brand suggestions */
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  /** Loading state for price data */
  const [isLoading, setIsLoading] = useState(false);
  /** Loading state for brand data */
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  /** Error message for price validation */
  const [priceError, setPriceError] = useState<string | null>(null);
  /** Controls visibility of error notification */
  const [showNotification, setShowNotification] = useState(false);
  /** List of all available brands */
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  /** Filtered brands based on search phrase */
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  /** Flag indicating no brand results found */
  const [noResults, setNoResults] = useState(false);

  /** Predefined minimum price options */
  const MIN_PRICE_POINTS = [1000, 5000, 10000, 25000, 50000, 100000, 250000];
  /** Predefined maximum price options */
  const MAX_PRICE_POINTS = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];

  /**
   * Shows and automatically hides error notifications
   */
  useEffect(() => {
    if (priceError) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [priceError]);

  /**
   * Formats a number string with thousand separators
   * @function formatNumber
   * @param {string} value - Number string to format
   * @returns {string} Formatted number string
   */
  const formatNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  /**
   * Removes thousand separators from a formatted number string
   * @function cleanNumber
   * @param {string} value - Formatted number string
   * @returns {string} Clean number string
   */
  const cleanNumber = (value: string) => {
    return value.replace(/\s/g, '');
  };

  /**
   * Fetches maximum price from API on component mount
   */
  useEffect(() => {
    const fetchMaxPrice = async () => {
      try {
        setIsLoading(true);
        const maxPrice = await getMaxPrice();
        setMaxPriceValue(maxPrice);
      } catch (error) {
        console.error('Error fetching price data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaxPrice();
  }, []);

  /**
   * Fetches all available brands on component mount
   */
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoadingBrands(true);
        console.log('Fetching all brands');
        const brands = await getAllBrands();
        console.log('All brands response:', brands);
        setAvailableBrands(brands);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  /**
   * Fetches brand suggestions based on search phrase
   * @async
   * @function fetchBrandSuggestions
   * @param {string} searchPhrase - Search phrase for filtering brands
   */
  const fetchBrandSuggestions = async (searchPhrase: string) => {
    setNoResults(false);

    if (searchPhrase.length === 0) {
      try {
        setIsLoadingBrands(true);
        console.log('Showing all brands');
        const brands = await getAllBrands();
        setFilteredBrands(brands);

        if (brands.length === 0) {
          setNoResults(true);
        }
      } catch (error) {
        console.error('Error fetching all brands:', error);
        setFilteredBrands(availableBrands);
      } finally {
        setIsLoadingBrands(false);
      }
    } else {
      try {
        setIsLoadingBrands(true);
        console.log(`Fetching brands with phrase: "${searchPhrase}"`);
        const brands = await searchBrandsByPhrase(searchPhrase);
        console.log('Brand suggestions response:', brands);
        setFilteredBrands(brands);

        if (brands.length === 0) {
          setNoResults(true);
        }
      } catch (error) {
        console.error('Error fetching brand suggestions:', error);
        const filtered = availableBrands.filter(brand =>
          brand.toLowerCase().includes(searchPhrase.toLowerCase())
        );
        setFilteredBrands(filtered);

        if (filtered.length === 0) {
          setNoResults(true);
        }
      } finally {
        setIsLoadingBrands(false);
      }
    }
  };

  /**
   * Debounces brand suggestion fetching when search phrase changes
   */
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBrandSuggestions(phrase);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [phrase, availableBrands]);

  /**
   * Handles search phrase input changes
   * @function handleInputChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPhrase(newValue);

    setShowBrandSuggestions(true);
  };

  /**
   * Handles minimum price input changes
   * @function handleMinPriceChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    setMinPrice(formattedValue);
    validatePrices(formattedValue, maxPrice);
  };

  /**
   * Handles maximum price input changes
   * @function handleMaxPriceChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);

    const minPriceNum = parseInt(cleanNumber(minPrice) || '0', 10);
    const newMaxPriceNum = parseInt(cleanNumber(formattedValue) || '0', 10);

    if (newMaxPriceNum === 0 || newMaxPriceNum > minPriceNum) {
      setMaxPrice(formattedValue);
      setPriceError(null);
    } else {
      setPriceError('Cena maksymalna nie może być równa lub niższa niż minimalna');
    }
  };

  /**
   * Validates price range inputs
   * @function validatePrices
   * @param {string} minPriceStr - Minimum price string
   * @param {string} maxPriceStr - Maximum price string
   * @returns {boolean} Whether the price range is valid
   */
  const validatePrices = (minPriceStr: string, maxPriceStr: string) => {
    const minPriceNum = parseInt(cleanNumber(minPriceStr) || '0', 10);
    const maxPriceNum = parseInt(cleanNumber(maxPriceStr) || '0', 10);

    if (maxPriceNum > 0 && minPriceNum >= maxPriceNum) {
      setPriceError('Cena minimalna nie może być równa lub wyższa niż maksymalna');
      return false;
    } else {
      setPriceError(null);
      return true;
    }
  };

  /**
   * Handles clicking on a minimum price suggestion
   * @function handleMinPriceClick
   * @param {number} price - Selected minimum price
   */
  const handleMinPriceClick = (price: number) => {
    const formattedPrice = formatNumber(price.toString());
    setMinPrice(formattedPrice);
    setShowMinPriceSuggestions(false);
    validatePrices(formattedPrice, maxPrice);
  };

  /**
   * Handles clicking on a maximum price suggestion
   * @function handleMaxPriceClick
   * @param {number} price - Selected maximum price
   */
  const handleMaxPriceClick = (price: number) => {
    const minPriceNum = parseInt(cleanNumber(minPrice) || '0', 10);

    if (price > minPriceNum) {
      setMaxPrice(formatNumber(price.toString()));
      setPriceError(null);
    } else {
      setPriceError('Cena maksymalna nie może być równa lub niższa niż minimalna');
    }

    setShowMaxPriceSuggestions(false);
  };

  /**
   * Handles clicking on a brand suggestion
   * @function handleBrandClick
   * @param {string} brand - Selected brand
   */
  const handleBrandClick = (brand: string) => {
    console.log(`Selected brand: ${brand}`);
    setPhrase(brand);
    setShowBrandSuggestions(false);
  };

  /**
   * Handles search form submission
   * @function handleSubmit
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validatePrices(minPrice, maxPrice);
    if (!isValid) return;

    const searchParams: Record<string, any> = {};

    if (phrase && phrase.trim() !== '') {
      searchParams.phrase = phrase.trim();
    }

    if (minPrice && cleanNumber(minPrice) !== '') {
      searchParams.minPrice = parseInt(cleanNumber(minPrice), 10);
    }

    if (maxPrice && cleanNumber(maxPrice) !== '') {
      searchParams.maxPrice = parseInt(cleanNumber(maxPrice), 10);
    }

    console.log('Saving search parameters to sessionStorage:', searchParams);

    if (Object.keys(searchParams).length > 0) {
      sessionStorage.setItem('simpleSearchParams', JSON.stringify(searchParams));
    }

    navigate('/offers');
  };

  /**
   * Filters price points based on maximum price value
   * @function getFilteredPrices
   * @param {number[]} pricePoints - Array of price points to filter
   * @returns {number[]} Filtered price points
   */
  const getFilteredPrices = (pricePoints: number[]): number[] => {
    return pricePoints.filter(price => price <= maxPriceValue);
  };

  console.log('Current state:', {
    phrase,
    showBrandSuggestions,
    filteredBrands: filteredBrands.length,
    noResults,
    isLoadingBrands,
  });

  return (
    <div className="simple-search-wrapper">
      {isLoading && <div className="loading-indicator">Ładowanie danych...</div>}

      {showNotification && priceError && (
        <div className="notification-container">
          <div className="notification error">
            <div className="notification-icon">⚠️</div>
            <div className="notification-message">{priceError}</div>
            <button
              className="notification-close"
              onClick={() => setShowNotification(false)}
              aria-label="Zamknij powiadomienie"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form className="simple-search-box" onSubmit={handleSubmit}>
        <div className="simple-search-group">
          <label htmlFor="marka">Szukaj</label>
          <input
            type="text"
            id="marka"
            name="phrase"
            value={phrase}
            onChange={handleInputChange}
            placeholder="Wpisz markę lub model"
            autoComplete="off"
            disabled={isLoading}
            onFocus={() => {
              setShowBrandSuggestions(true);
              if (phrase.length === 0) {
                fetchBrandSuggestions('');
              }
            }}
            onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
          />
          {showBrandSuggestions && (
            <div className="suggestions-container">
              <ul className="suggestions brand-suggestions">
                {isLoadingBrands ? (
                  <li className="loading-suggestion">Ładowanie...</li>
                ) : noResults ? (
                  <li className="no-results">Brak wyników wyszukiwania</li>
                ) : (
                  filteredBrands.map(brand => (
                    <li key={brand} onMouseDown={() => handleBrandClick(brand)}>
                      {brand}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="simple-search-group">
          <label htmlFor="minPrice">Minimalna cena</label>
          <input
            type="text"
            id="minPrice"
            name="minPrice"
            value={minPrice}
            onChange={handleMinPriceChange}
            placeholder="od"
            onFocus={() => setShowMinPriceSuggestions(true)}
            onBlur={() => setTimeout(() => setShowMinPriceSuggestions(false), 200)}
            className={priceError && priceError.includes('minimalna') ? 'error' : ''}
            disabled={isLoading}
          />
          {showMinPriceSuggestions && (
            <div className="suggestions-container">
              <ul className="suggestions price-suggestions">
                {getFilteredPrices(MIN_PRICE_POINTS).map(price => (
                  <li key={`min-${price}`} onMouseDown={() => handleMinPriceClick(price)}>
                    {formatNumber(price.toString())} zł
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="simple-search-group">
          <label htmlFor="maxPrice">Maksymalna cena</label>
          <input
            type="text"
            id="maxPrice"
            name="maxPrice"
            value={maxPrice}
            onChange={handleMaxPriceChange}
            placeholder="do"
            onFocus={() => setShowMaxPriceSuggestions(true)}
            onBlur={() => setTimeout(() => setShowMaxPriceSuggestions(false), 200)}
            className={priceError && priceError.includes('maksymalna') ? 'error' : ''}
            disabled={isLoading}
          />
          {showMaxPriceSuggestions && (
            <div className="suggestions-container">
              <ul className="suggestions price-suggestions">
                {getFilteredPrices(MAX_PRICE_POINTS).map(price => (
                  <li key={`max-${price}`} onMouseDown={() => handleMaxPriceClick(price)}>
                    {formatNumber(price.toString())} zł
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button type="submit" className="simple-search-button" disabled={isLoading}>
          {isLoading ? 'Ładowanie...' : 'Szukaj'}
        </button>
      </form>
    </div>
  );
};

export default SimpleSearch;