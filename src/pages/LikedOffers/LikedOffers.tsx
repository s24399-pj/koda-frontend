import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LikedOffers.scss";
import useTitle from "../../hooks/useTitle";
import LikeButton from "../../components/LikeButton/LikeButton";
import CompareCheckbox from "../../components/CompareCheckbox/CompareCheckbox";
import ComparisonBar from "../../components/ComparisonBar/ComparisonBar";
import { useComparison } from "../../context/ComparisonContext";
import { likedOfferApi } from "../../api/likedOfferApi";
import { MiniOffer } from "../../types/miniOfferTypes";

const API_URL = import.meta.env.VITE_API_URL;

interface RawOfferData {
    id: string;
    title: string;
    price: number;
    description?: string;
    CarDetailsDto?: {
        mileage?: number;
        fuelType?: string;
        year?: number;
        enginePower?: number;
        displacement?: string;
        [key: string]: any;
    };
    mainImage?: string;
    imageUrls?: string[];
    images?: string[];
    [key: string]: any;
}

const LikedOffersList: React.FC = () => {
    useTitle("Ulubione");

    const [likedOffers, setLikedOffers] = useState<MiniOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const {
        selectedOffers,
        addToComparison,
        removeFromComparison,
        isOfferSelected,
        canAddMoreOffers
    } = useComparison();

    const isAuthenticated = !!localStorage.getItem("accessToken");

    useEffect(() => {
        if (isAuthenticated) {
            fetchLikedOffers();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const mapToMiniOffer = (rawData: RawOfferData): MiniOffer | null => {
        try {
            if (!rawData.id || !rawData.title || rawData.price === undefined) {
                console.warn("Brakujące wymagane pola w danych oferty:", rawData);
                return null;
            }

            let mainImageValue = "";
            if (rawData.imageUrls && rawData.imageUrls.length > 0) {
                mainImageValue = rawData.imageUrls[0];
            }

            const carDetails = rawData.CarDetailsDto || {};

            return {
                id: rawData.id,
                title: rawData.title,
                price: rawData.price,
                mainImage: mainImageValue,
                mileage: carDetails.mileage || 0,
                fuelType: carDetails.fuelType || "Nieznany",
                year: carDetails.year || 0,
                enginePower: carDetails.enginePower || 0,
                displacement: carDetails.displacement || "Nieznana"
            };
        } catch (error) {
            console.error("Błąd podczas mapowania danych oferty:", error);
            return null;
        }
    };

    const fetchLikedOffers = async () => {
        setIsLoading(true);
        try {
            const data = await likedOfferApi.getLikedOffers();

            if (Array.isArray(data)) {
                const mappedOffers = data
                    .map(offer => mapToMiniOffer(offer))
                    .filter(offer => offer !== null) as MiniOffer[];

                setLikedOffers(mappedOffers);
            } else {
                console.error("Otrzymane dane nie są tablicą:", data);
                setLikedOffers([]);
            }
        } catch (error) {
            console.error("Błąd podczas pobierania ulubionych ofert:", error);
            setLikedOffers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOfferClick = (id: string) => {
        navigate(`/offer/${id}`);
    };

    const handleLikeToggle = (offerId: string, isLiked: boolean) => {
        if (!isLiked) {
            setLikedOffers(prev => prev.filter(offer => offer.id !== offerId));
        }
    };

    const handleToggleComparison = (id: string, checked: boolean) => {
        const offer = likedOffers.find(o => o.id === id);
        if (!offer) return;

        if (checked) {
            addToComparison(offer);
        } else {
            removeFromComparison(id);
        }
    };

    const truncateText = (text: string, maxLength: number) => {
        const isMobile = window.innerWidth <= 768;
        const actualMaxLength = isMobile ? Math.min(maxLength, 30) : maxLength;

        return text.length > actualMaxLength
            ? `${text.substring(0, actualMaxLength)}...`
            : text;
    };

    const renderAuthenticatedContent = () => {
        if (isLoading) {
            return <p className="loading-message">Ładowanie ofert...</p>;
        }

        if (!likedOffers || likedOffers.length === 0) {
            return (
                <div className="no-offers">
                    <p>Nie masz jeszcze ulubionych ofert.</p>
                    <Link to="/offers" className="browse-offers-button">Przeglądaj dostępne oferty</Link>
                </div>
            );
        }

        return (
            <div className="offer-list">
                {likedOffers.map((offer) => (
                    <div key={offer.id} className="offer-card">
                        <div className="offer-clickable" onClick={() => handleOfferClick(offer.id)}>
                            <div className="offer-image-container">
                                <img
                                    src={offer.mainImage ? `${API_URL}/images/${offer.mainImage}` : "/assets/placeholder.jpg"}
                                    alt={offer.title}
                                    loading="lazy"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (target.src.indexOf('placeholder.jpg') === -1) {
                                            target.src = "/assets/placeholder.jpg";
                                        }
                                        target.onerror = null;
                                    }}
                                />
                            </div>
                            <div className="offer-details">
                                <div className="offer-header">
                                    <h2>{truncateText(offer.title, 50)}</h2>
                                    <div className="price-actions">
                                        <span className="offer-price">{offer.price.toLocaleString()} PLN</span>
                                        <LikeButton offerId={offer.id} initialLiked={true} onLikeToggle={(isLiked) => handleLikeToggle(offer.id, isLiked)} />
                                    </div>
                                </div>
                                <div className="offer-info">
                                    <p><strong>Rok:</strong> <span>{offer.year}</span></p>
                                    <p><strong>Przebieg:</strong> <span>{offer.mileage.toLocaleString()} km</span></p>
                                    <p><strong>Typ paliwa:</strong> <span>{offer.fuelType}</span></p>
                                    <p><strong>Moc silnika:</strong> <span>{offer.enginePower} KM</span></p>
                                    <p><strong>Pojemność silnika:</strong> <span>{offer.displacement} cm³</span></p>
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
                ))}
            </div>
        );
    };

    const renderUnauthenticatedContent = () => {
        return (
            <div className="login-section">
                <h2>Zaloguj się, aby zobaczyć swoje ulubione oferty</h2>
                <p>Dodawaj interesujące Cię oferty do ulubionych i miej do nich szybki dostęp.</p>
                <div className="login-buttons">
                    <Link to="/user/login" className="login">Zaloguj się</Link>
                    <Link to="/user/register" className="signup">Zarejestruj się</Link>
                </div>
            </div>
        );
    };

    return (
        <div className="liked-offers-page">
            <h1>Ulubione oferty</h1>
            {isAuthenticated ? renderAuthenticatedContent() : renderUnauthenticatedContent()}

            <ComparisonBar
                selectedOffers={selectedOffers}
                removeFromComparison={removeFromComparison}
            />
        </div>
    );
};

export default LikedOffersList;