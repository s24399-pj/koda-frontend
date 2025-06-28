import React, { useState, useEffect } from 'react';
import './OfferComparison.scss';
import { OfferData } from '../../types/offerTypes';
import { MiniOffer } from '../../types/miniOfferTypes';
import useTitle from '../../hooks/useTitle';
import { useComparison } from '../../context/ComparisonContext';
import {
  comparisonFeatures,
  ComparisonType,
  Feature,
} from '../../types/offer/comparisionFeatures.ts';
import { DEFAULT_CAR_IMAGE } from '../../util/constants.tsx';
import { searchOffersByPhrase, getOfferById } from '../../api/offerApi';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Component rendering the offer comparison tool.
 * Users can select two offers and view their features side-by-side.
 *
 * @component
 */
const OfferComparison: React.FC = () => {
  useTitle('Porównaj');

  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [suggestionsA, setSuggestionsA] = useState<OfferData[]>([]);
  const [suggestionsB, setSuggestionsB] = useState<OfferData[]>([]);
  const [offerA, setOfferA] = useState<OfferData | null>(null);
  const [offerB, setOfferB] = useState<OfferData | null>(null);
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusA, setFocusA] = useState(false);
  const [focusB, setFocusB] = useState(false);

  const { clearComparison } = useComparison();

  /**
   * Handles image loading errors and falls back to a default image.
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = DEFAULT_CAR_IMAGE;
      console.warn('Image loading error in comparison:', target.src);
    }
  };

  /**
   * Loads offers from sessionStorage if available (e.g. redirected from another page).
   */
  useEffect(() => {
    const loadOffersFromSession = async () => {
      try {
        const storedOffers = sessionStorage.getItem('comparisonOffers');
        if (storedOffers) {
          const parsedOffers: MiniOffer[] = JSON.parse(storedOffers);
          if (parsedOffers.length === 2) {
            setInputA(parsedOffers[0].title);
            setInputB(parsedOffers[1].title);
            const detailedOfferA = await fetchOfferDetails(parsedOffers[0].id);
            const detailedOfferB = await fetchOfferDetails(parsedOffers[1].id);
            if (detailedOfferA) setOfferA(detailedOfferA);
            if (detailedOfferB) setOfferB(detailedOfferB);
            sessionStorage.removeItem('comparisonOffers');
          }
        }
      } catch (error) {
        console.error('Error loading offers from session:', error);
      }
    };

    loadOffersFromSession();
    return () => {
      clearComparison();
    };
  }, []);

  /**
   * Performs a search and populates suggestions based on query input.
   */
  const searchOffers = async (
    query: string,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSuggestions: React.Dispatch<React.SetStateAction<OfferData[]>>
  ) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await searchOffersByPhrase(query, 5);
      setSuggestions(results);
    } catch (error) {
      console.error('Error searching offers:', error);
      setError('Wystąpił błąd podczas wyszukiwania ofert.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retrieves detailed offer data by ID.
   */
  const fetchOfferDetails = async (id: string): Promise<OfferData | null> => {
    try {
      const offer = await getOfferById(id);

      if (offer && (!offer.imageUrls || offer.imageUrls.length === 0)) {
        const imagesField = (offer as any)['images'];
        if (Array.isArray(imagesField) && imagesField.length > 0) {
          offer.imageUrls = imagesField;
        }
      }

      return offer;
    } catch (error) {
      console.error('Error fetching offer details:', error);
      setError('Nie udało się załadować szczegółów oferty.');
      return null;
    }
  };

  // Debounced search for inputA
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputA) {
        searchOffers(inputA, setIsLoadingA, setSuggestionsA);
      } else {
        setSuggestionsA([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [inputA]);

  // Debounced search for inputB
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputB) {
        searchOffers(inputB, setIsLoadingB, setSuggestionsB);
      } else {
        setSuggestionsB([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [inputB]);

  /**
   * Dismisses suggestion dropdowns when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.input-group')) {
        setSuggestionsA([]);
        setSuggestionsB([]);
        setFocusA(false);
        setFocusB(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Sets selected offer and fetches detailed data.
   */
  const selectOffer = async (
    offer: OfferData,
    setOffer: React.Dispatch<React.SetStateAction<OfferData | null>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setSuggestions: React.Dispatch<React.SetStateAction<OfferData[]>>
  ) => {
    setInput(offer.title);
    setSuggestions([]);
    const detailedOffer = await fetchOfferDetails(offer.id);
    if (detailedOffer) {
      setOffer(detailedOffer);
    }
  };

  /**
   * Resets both selections and errors.
   */
  const handleReset = () => {
    setInputA('');
    setInputB('');
    setOfferA(null);
    setOfferB(null);
    setSuggestionsA([]);
    setSuggestionsB([]);
    setError(null);
  };

  /**
   * Formats a value with optional units.
   */
  const format = (value: any, unit = ''): string => {
    if (value === null || value === undefined) return '—';
    return typeof value === 'number'
      ? `${value.toLocaleString('pl-PL')} ${unit}`.trim()
      : `${value} ${unit}`.trim();
  };

  /**
   * Determines which offer is better based on feature comparison type.
   */
  const getBetterOffer = (keyA: any, keyB: any, type?: ComparisonType): string => {
    if (keyA == null || keyB == null) return '';
    if (type === 'higher') return keyA > keyB ? 'A' : keyA < keyB ? 'B' : '';
    if (type === 'lower') return keyA < keyB ? 'A' : keyA > keyB ? 'B' : '';
    return '';
  };

  /**
   * Returns the main image URL for a given offer.
   */
  const getMainImageUrl = (offer: OfferData): string | null => {
    if (!offer) return null;
    if (offer.imageUrls?.length) return `${API_URL}${offer.imageUrls[0]}`;
    if (offer.mainImage) return `${API_URL}${offer.mainImage}`;
    const imagesField = (offer as any)['images'];
    return Array.isArray(imagesField) && imagesField.length ? `${API_URL}${imagesField[0]}` : null;
  };

  /**
   * Retrieves the value for a feature from an offer.
   */
  const getValue = (offer: OfferData | null, feature: Feature): any => {
    if (!offer) return null;
    if (feature.carDetails) {
      return offer.CarDetailsDto?.[feature.key as keyof typeof offer.CarDetailsDto] ?? null;
    }
    return offer[feature.key as keyof OfferData];
  };

  const features: Feature[] = comparisonFeatures;

  return (
    <div className="offer-comparison-page">
      <h1>Porównywarka ofert</h1>

      <div className="compare-inputs">
        {/* Offer Input A */}
        <div className="input-group">
          <label>Pojazd 1</label>
          <input
            value={inputA}
            onChange={e => setInputA(e.target.value)}
            onFocus={() => setFocusA(true)}
            placeholder="Wpisz nazwę pierwszego auta"
            disabled={isLoadingA}
          />
          {isLoadingA && <div className="loading">Wyszukiwanie...</div>}
          {suggestionsA.length > 0 && focusA && (
            <ul className="suggestions">
              {suggestionsA.map(offer => (
                <li
                  key={offer.id}
                  onClick={() => selectOffer(offer, setOfferA, setInputA, setSuggestionsA)}
                >
                  <div className="suggestion-item">
                    <img
                      src={getMainImageUrl(offer) || DEFAULT_CAR_IMAGE}
                      alt={offer.title}
                      className="suggestion-image"
                      onError={handleImageError}
                    />
                    <div className="suggestion-details">
                      <div className="suggestion-title">{offer.title}</div>
                      <div className="suggestion-info">{format(offer.price, 'PLN')}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Offer Input B */}
        <div className="input-group">
          <label>Pojazd 2</label>
          <input
            value={inputB}
            onChange={e => setInputB(e.target.value)}
            onFocus={() => setFocusB(true)}
            placeholder="Wpisz nazwę drugiego auta"
            disabled={isLoadingB}
          />
          {isLoadingB && <div className="loading">Wyszukiwanie...</div>}
          {suggestionsB.length > 0 && focusB && (
            <ul className="suggestions">
              {suggestionsB.map(offer => (
                <li
                  key={offer.id}
                  onClick={() => selectOffer(offer, setOfferB, setInputB, setSuggestionsB)}
                >
                  <div className="suggestion-item">
                    <img
                      src={getMainImageUrl(offer) || DEFAULT_CAR_IMAGE}
                      alt={offer.title}
                      className="suggestion-image"
                      onError={handleImageError}
                    />
                    <div className="suggestion-details">
                      <div className="suggestion-title">{offer.title}</div>
                      <div className="suggestion-info">{format(offer.price, 'PLN')}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {offerA && offerB && (
        <>
          <div className="button-container">
            <button onClick={handleReset} className="reset-button">
              Wyczyść porównanie
            </button>
          </div>

          <div className="compare-table">
            <table>
              <thead>
                <tr>
                  <th>Zdjęcie</th>
                  <th>
                    <div className="car-header">
                      <img
                        src={getMainImageUrl(offerA) || DEFAULT_CAR_IMAGE}
                        alt="Oferta 1"
                        className="car-thumbnail"
                        onError={handleImageError}
                      />
                    </div>
                  </th>
                  <th>
                    <div className="car-header">
                      <img
                        src={getMainImageUrl(offerB) || DEFAULT_CAR_IMAGE}
                        alt="Oferta 2"
                        className="car-thumbnail"
                        onError={handleImageError}
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map(feature => {
                  const valueA = getValue(offerA, feature);
                  const valueB = getValue(offerB, feature);
                  const betterOffer = feature.highlightBetter
                    ? getBetterOffer(valueA, valueB, feature.highlightBetter)
                    : '';
                  return (
                    <tr key={feature.key}>
                      <td>{feature.label}</td>
                      <td className={betterOffer === 'A' ? 'highlight' : ''}>
                        {format(valueA, feature.unit || '')}
                      </td>
                      <td className={betterOffer === 'B' ? 'highlight' : ''}>
                        {format(valueB, feature.unit || '')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default OfferComparison;
