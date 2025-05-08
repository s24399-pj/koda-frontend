import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SimpleSearch.scss";
import { OfferData } from "../../types/offerTypes";

const API_URL = import.meta.env.VITE_API_URL;

const SimpleSearch: React.FC = () => {
  const navigate = useNavigate();
  const [phrase, setPhrase] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [maxPriceValue, setMaxPriceValue] = useState<number>(1000000);
  const [showMinPriceSuggestions, setShowMinPriceSuggestions] = useState(false);
  const [showMaxPriceSuggestions, setShowMaxPriceSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const MIN_PRICE_POINTS = [1000, 5000, 10000, 25000, 50000, 100000, 250000];
  const MAX_PRICE_POINTS = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];

  useEffect(() => {
    if (priceError) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [priceError]);

  const formatNumber = (value: string) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const cleanNumber = (value: string) => {
    return value.replace(/\s/g, "");
  };

  useEffect(() => {
    const fetchMaxPrice = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("size", "100");
        
        const response = await axios.get(`${API_URL}/api/v1/offers`, { params });
        const offers: OfferData[] = response.data.content || [];
        
        const maxPrice = offers.reduce((max, offer) => 
          offer.price > max ? offer.price : max, 0);
        
        setMaxPriceValue(maxPrice || 1000000);
      } catch (error) {
        console.error("Error fetching price data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMaxPrice();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhrase(e.target.value);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    setMinPrice(formattedValue);
    validatePrices(formattedValue, maxPrice);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    
    const minPriceNum = parseInt(cleanNumber(minPrice) || "0", 10);
    const newMaxPriceNum = parseInt(cleanNumber(formattedValue) || "0", 10);
    
    if (newMaxPriceNum === 0 || newMaxPriceNum > minPriceNum) {
      setMaxPrice(formattedValue);
      setPriceError(null);
    } else {
      setPriceError("Cena maksymalna nie może być równa lub niższa niż minimalna");
    }
  };

  const validatePrices = (minPriceStr: string, maxPriceStr: string) => {
    const minPriceNum = parseInt(cleanNumber(minPriceStr) || "0", 10);
    const maxPriceNum = parseInt(cleanNumber(maxPriceStr) || "0", 10);
    
    if (maxPriceNum > 0 && minPriceNum >= maxPriceNum) {
      setPriceError("Cena minimalna nie może być równa lub wyższa niż maksymalna");
      return false;
    } else {
      setPriceError(null);
      return true;
    }
  };

  const handleMinPriceClick = (price: number) => {
    const formattedPrice = formatNumber(price.toString());
    setMinPrice(formattedPrice);
    setShowMinPriceSuggestions(false);
    validatePrices(formattedPrice, maxPrice);
  };

  const handleMaxPriceClick = (price: number) => {
    const minPriceNum = parseInt(cleanNumber(minPrice) || "0", 10);
    
    if (price > minPriceNum) {
      setMaxPrice(formatNumber(price.toString()));
      setPriceError(null);
    } else {
      setPriceError("Cena maksymalna nie może być równa lub niższa niż minimalna");
    }
    
    setShowMaxPriceSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validatePrices(minPrice, maxPrice);
    if (!isValid) return;
    
    navigate(`/offers?phrase=${encodeURIComponent(phrase)}&minPrice=${cleanNumber(minPrice)}&maxPrice=${cleanNumber(maxPrice)}`);
  };

  const getFilteredPrices = (pricePoints: number[]): number[] => {
    return pricePoints.filter(price => price <= maxPriceValue);
  };

  return (
    <div className="simple-search-wrapper">
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
          />
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
            className={priceError && priceError.includes("minimalna") ? "error" : ""}
          />
          {showMinPriceSuggestions && (
            <div className="suggestions-container">
              <ul className="suggestions price-suggestions">
                {getFilteredPrices(MIN_PRICE_POINTS).map((price) => (
                  <li 
                    key={`min-${price}`} 
                    onMouseDown={() => handleMinPriceClick(price)}
                  >
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
            className={priceError && priceError.includes("maksymalna") ? "error" : ""}
          />
          {showMaxPriceSuggestions && (
            <div className="suggestions-container">
              <ul className="suggestions price-suggestions">
                {getFilteredPrices(MAX_PRICE_POINTS).map((price) => (
                  <li 
                    key={`max-${price}`} 
                    onMouseDown={() => handleMaxPriceClick(price)}
                  >
                    {formatNumber(price.toString())} zł
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button type="submit" className="simple-search-button">
          Szukaj
        </button>
      </form>
    </div>
  );
};

export default SimpleSearch;