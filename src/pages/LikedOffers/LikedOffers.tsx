import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LikedOffers.scss';
import useTitle from '../../hooks/useTitle';
import LikeButton from '../../components/LikeButton/LikeButton';
import CompareCheckbox from '../../components/CompareCheckbox/CompareCheckbox';
import ComparisonBar from '../../components/ComparisonBar/ComparisonBar';
import { useComparison } from '../../context/ComparisonContext';
import { useAuth } from '../../context/AuthContext';
import AuthRequired from '../AuthRequired/AuthRequired';
import { likedOfferApi } from '../../api/likedOfferApi';
import { MiniOffer } from '../../types/miniOfferTypes';
import { RawOfferData } from '../../types/offer/RawOfferData';
import { translations } from '../../translations/carEquipmentTranslations';

const API_URL = import.meta.env.VITE_API_URL;

const LikedOffersList: React.FC = () => {
  useTitle('Ulubione');

  const [likedOffers, setLikedOffers] = useState<MiniOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    selectedOffers,
    addToComparison,
    removeFromComparison,
    isOfferSelected,
    canAddMoreOffers,
  } = useComparison();

  const getTranslation = (category: keyof typeof translations, key: string) => {
    return (translations[category] as Record<string, string>)?.[key] || key;
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = 'https://placehold.co/600x400';
      console.warn('Image loading error in liked offers:', target.src);
    }
  };

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
        console.warn('Missing required fields in offer data:', rawData);
        return null;
      }

      let mainImageValue = '';
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
        fuelType: carDetails.fuelType || 'Nieznany',
        year: carDetails.year || 0,
        enginePower: carDetails.enginePower || 0,
        displacement: carDetails.displacement || 'Nieznana',
      };
    } catch (error) {
      console.error('Error while mapping offer data:', error);
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
        console.error('Received data is not an array:', data);
        setLikedOffers([]);
      }
    } catch (error) {
      console.error('Error while fetching liked offers:', error);
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
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderAuthenticatedContent = () => {
    if (isLoading) {
      return <p className="loading-message">Ładowanie ofert...</p>;
    }

    if (!likedOffers || likedOffers.length === 0) {
      return (
        <div className="no-offers">
          <p>Nie masz jeszcze ulubionych ofert.</p>
          <Link to="/offers" className="browse-offers-button">
            Przeglądaj dostępne oferty
          </Link>
        </div>
      );
    }

    return (
      <div className="offer-list">
        {likedOffers.map(offer => (
          <div key={offer.id} className="offer-card">
            <div className="offer-clickable" onClick={() => handleOfferClick(offer.id)}>
              <div className="offer-image-container">
                <img
                  src={
                    offer.mainImage
                      ? `${API_URL}${offer.mainImage}`
                      : 'https://via.placeholder.com/300x200?text=Brak+zdjęcia'
                  }
                  alt={offer.title}
                  loading="lazy"
                  onError={handleImageError}
                />
              </div>
              <div className="offer-details">
                <div className="offer-header">
                  <h2>{truncateText(offer.title, 50)}</h2>
                  <div className="price-actions">
                    <span className="offer-price">{offer.price.toLocaleString()} PLN</span>
                    <LikeButton
                      offerId={offer.id}
                      initialLiked={true}
                      onLikeToggle={isLiked => handleLikeToggle(offer.id, isLiked)}
                    />
                  </div>
                </div>

                <div className="offer-info">
                  <p>
                    <strong>Rok:</strong> <span>{offer.year}</span>
                  </p>
                  <p>
                    <strong>Przebieg:</strong> <span>{offer.mileage.toLocaleString()} km</span>
                  </p>
                  <p>
                    <strong>Typ paliwa:</strong>{' '}
                    <span>{getTranslation('fuelType', offer.fuelType)}</span>
                  </p>
                  <p>
                    <strong>Moc silnika:</strong> <span>{offer.enginePower} KM</span>
                  </p>
                  <p>
                    <strong>Pojemność silnika:</strong> <span>{offer.displacement}</span>
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
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <AuthRequired
        pageTitle="Ulubione oferty"
        message="Dodawaj interesujące Cię oferty do ulubionych i miej do nich szybki dostęp."
      />
    );
  }

  return (
    <div className="liked-offers-page">
      <h1>Ulubione oferty</h1>
      {renderAuthenticatedContent()}

      <ComparisonBar selectedOffers={selectedOffers} removeFromComparison={removeFromComparison} />
    </div>
  );
};

export default LikedOffersList;
