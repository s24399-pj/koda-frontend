import React, {useState, useEffect} from "react";
import axios from "axios";
import "./OfferComparison.scss";
import {OfferData} from "../../types/offerTypes";
import {MiniOffer} from "../../types/miniOfferTypes";
import useTitle from "../../hooks/useTitle";
import {useComparison} from "../../context/ComparisonContext";
import {comparisonFeatures, ComparisonType, Feature} from "../../types/offer/comparisionFeatures.ts";

const API_URL = import.meta.env.VITE_API_URL;
const PLACEHOLDER_IMAGE = "https://placehold.co/600x400";

const OfferComparison: React.FC = () => {
    useTitle("Porównaj");

    const [inputA, setInputA] = useState("");
    const [inputB, setInputB] = useState("");
    const [suggestionsA, setSuggestionsA] = useState<OfferData[]>([]);
    const [suggestionsB, setSuggestionsB] = useState<OfferData[]>([]);
    const [offerA, setOfferA] = useState<OfferData | null>(null);
    const [offerB, setOfferB] = useState<OfferData | null>(null);
    const [isLoadingA, setIsLoadingA] = useState(false);
    const [isLoadingB, setIsLoadingB] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [focusA, setFocusA] = useState(false);
    const [focusB, setFocusB] = useState(false);

    const {clearComparison} = useComparison();

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const target = event.target as HTMLImageElement;
        if (!target.dataset.errorHandled) {
            target.dataset.errorHandled = "true";
            target.src = PLACEHOLDER_IMAGE;
            console.warn('Image loading error in comparison:', target.src);
        }
    };

    useEffect(() => {
        const loadOffersFromSession = async () => {
            try {
                const storedOffers = sessionStorage.getItem("comparisonOffers");
                if (storedOffers) {
                    const parsedOffers: MiniOffer[] = JSON.parse(storedOffers);

                    if (parsedOffers.length === 2) {
                        setInputA(parsedOffers[0].title);
                        setInputB(parsedOffers[1].title);

                        const detailedOfferA = await fetchOfferDetails(parsedOffers[0].id);
                        const detailedOfferB = await fetchOfferDetails(parsedOffers[1].id);

                        if (detailedOfferA) setOfferA(detailedOfferA);
                        if (detailedOfferB) setOfferB(detailedOfferB);

                        sessionStorage.removeItem("comparisonOffers");
                    }
                }
            } catch (error) {
                console.error("Error loading offers from session:", error);
            }
        };

        loadOffersFromSession();

        return () => {
            clearComparison();
        };
    }, []);

    const searchOffers = async (query: string, setLoading: React.Dispatch<React.SetStateAction<boolean>>,
                                setSuggestions: React.Dispatch<React.SetStateAction<OfferData[]>>) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            params.set("phrase", query);
            params.set("size", "5");

            const response = await axios.get(`${API_URL}/api/v1/offers`, {params});
            setSuggestions(response.data.content || []);
        } catch (error) {
            console.error("Error searching offers:", error);
            setError("Wystąpił błąd podczas wyszukiwania ofert.");
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOfferDetails = async (id: string): Promise<OfferData | null> => {
        try {
            const response = await axios.get<OfferData>(`${API_URL}/api/v1/offers/${id}`);

            const offer = response.data;

            if (offer) {
                if (!offer.imageUrls || offer.imageUrls.length === 0) {
                    const imagesField = (offer as any)['images'];
                    if (imagesField && Array.isArray(imagesField) && imagesField.length > 0) {
                        offer.imageUrls = imagesField;
                    }
                }
            }

            return offer;
        } catch (error) {
            console.error("Error fetching offer details:", error);
            setError("Nie udało się załadować szczegółów oferty.");
            return null;
        }
    };

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

    const selectOffer = async (offer: OfferData, setOffer: React.Dispatch<React.SetStateAction<OfferData | null>>,
                               setInput: React.Dispatch<React.SetStateAction<string>>,
                               setSuggestions: React.Dispatch<React.SetStateAction<OfferData[]>>) => {
        setInput(offer.title);
        setSuggestions([]);

        const detailedOffer = await fetchOfferDetails(offer.id);
        if (detailedOffer) {
            setOffer(detailedOffer);
        }
    };

    const handleReset = () => {
        setInputA("");
        setInputB("");
        setOfferA(null);
        setOfferB(null);
        setSuggestionsA([]);
        setSuggestionsB([]);
        setError(null);
    };

    const format = (value: any, unit = ""): string => {
        if (value === null || value === undefined) return "—";

        if (typeof value === 'number') {
            return `${value.toLocaleString('pl-PL')} ${unit}`.trim();
        }

        return `${value} ${unit}`.trim();
    };

    const getBetterOffer = (keyA: any, keyB: any, type?: ComparisonType): string => {
        if (keyA === null || keyB === null || keyA === undefined || keyB === undefined) return "";
        if (type === 'higher') return keyA > keyB ? 'A' : keyA < keyB ? 'B' : '';
        if (type === 'lower') return keyA < keyB ? 'A' : keyA > keyB ? 'B' : '';
        return "";
    };

    const getMainImageUrl = (offer: OfferData): string | null => {
        if (!offer) return null;

        if (offer.imageUrls && offer.imageUrls.length > 0) {
            return `${API_URL}${offer.imageUrls[0]}`;
        }

        if (offer.mainImage) {
            return `${API_URL}${offer.mainImage}`;
        }

        const imagesField = (offer as any)['images'];
        if (imagesField && Array.isArray(imagesField) && imagesField.length > 0) {
            return `${API_URL}${imagesField[0]}`;
        }

        return null;
    };

    const features: Feature[] = comparisonFeatures;

    const getValue = (offer: OfferData | null, feature: Feature): any => {
        if (!offer) return null;

        if (feature.carDetails) {
            if (!offer.CarDetailsDto) return null;
            return offer.CarDetailsDto[feature.key as keyof typeof offer.CarDetailsDto];
        }

        return offer[feature.key as keyof OfferData];
    };

    return (
        <div className="offer-comparison-page">
            <h1>Porównywarka ofert</h1>

            <div className="compare-inputs">
                <div className="input-group">
                    <label>Pojazd 1</label>
                    <input
                        value={inputA}
                        onChange={(e) => setInputA(e.target.value)}
                        onFocus={() => setFocusA(true)}
                        placeholder="Wpisz nazwę pierwszego auta"
                        disabled={isLoadingA}
                    />
                    {isLoadingA && <div className="loading">Wyszukiwanie...</div>}
                    {suggestionsA.length > 0 && focusA && (
                        <ul className="suggestions">
                            {suggestionsA.map((offer) => (
                                <li key={offer.id}
                                    onClick={() => selectOffer(offer, setOfferA, setInputA, setSuggestionsA)}>
                                    <div className="suggestion-item">
                                        <img
                                            src={getMainImageUrl(offer) || PLACEHOLDER_IMAGE}
                                            alt={offer.title}
                                            className="suggestion-image"
                                            onError={handleImageError}
                                        />
                                        <div className="suggestion-details">
                                            <div className="suggestion-title">{offer.title}</div>
                                            <div className="suggestion-info">
                                                {format(offer.price, "PLN")}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="input-group">
                    <label>Pojazd 2</label>
                    <input
                        value={inputB}
                        onChange={(e) => setInputB(e.target.value)}
                        onFocus={() => setFocusB(true)}
                        placeholder="Wpisz nazwę drugiego auta"
                        disabled={isLoadingB}
                    />
                    {isLoadingB && <div className="loading">Wyszukiwanie...</div>}
                    {suggestionsB.length > 0 && focusB && (
                        <ul className="suggestions">
                            {suggestionsB.map((offer) => (
                                <li key={offer.id}
                                    onClick={() => selectOffer(offer, setOfferB, setInputB, setSuggestionsB)}>
                                    <div className="suggestion-item">
                                        <img
                                            src={getMainImageUrl(offer) || PLACEHOLDER_IMAGE}
                                            alt={offer.title}
                                            className="suggestion-image"
                                            onError={handleImageError}
                                        />
                                        <div className="suggestion-details">
                                            <div className="suggestion-title">{offer.title}</div>
                                            <div className="suggestion-info">
                                                {format(offer.price, "PLN")}
                                            </div>
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
                                            src={getMainImageUrl(offerA) || PLACEHOLDER_IMAGE}
                                            alt="Oferta 1"
                                            className="car-thumbnail"
                                            onError={handleImageError}
                                        />
                                    </div>
                                </th>
                                <th>
                                    <div className="car-header">
                                        <img
                                            src={getMainImageUrl(offerB) || PLACEHOLDER_IMAGE}
                                            alt="Oferta 2"
                                            className="car-thumbnail"
                                            onError={handleImageError}
                                        />
                                    </div>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {features.map((feature) => {
                                const valueA = getValue(offerA, feature);
                                const valueB = getValue(offerB, feature);
                                const betterOffer = feature.highlightBetter
                                    ? getBetterOffer(valueA, valueB, feature.highlightBetter)
                                    : "";
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