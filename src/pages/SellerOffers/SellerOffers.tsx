import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SellerOffers.scss';
import { getOffersBySeller } from '../../api/offerApi';
import { ApiOffer, OfferData } from '../../types/offerTypes.ts';
import useTitle from '../../hooks/useTitle';
import axios from 'axios';
import LikeButton from '../../components/LikeButton/LikeButton';
import CompareCheckbox from '../../components/CompareCheckbox/CompareCheckbox';
import ComparisonBar from '../../components/ComparisonBar/ComparisonBar';
import { useComparison } from '../../context/ComparisonContext';

const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_CAR_IMAGE = 'https://via.placeholder.com/300x200?text=Brak+zdjęcia';

const formatPrice = (price: number, currency: string = 'zł'): string => {
  return price.toLocaleString('pl-PL') + ' ' + currency;
};

const formatMileage = (mileage: number): string => {
  return mileage.toLocaleString('pl-PL') + ' km';
};

const fuelTypeTranslations: Record<string, string> = {
  PETROL: 'Benzyna',
  DIESEL: 'Diesel',
  LPG: 'LPG',
  HYBRID: 'Hybryda',
  ELECTRIC: 'Elektryczny',
  HYDROGEN: 'Wodór',
  OTHER: 'Inny',
};

const mapApiResponseToComponentFormat = (apiOffers: ApiOffer[]): OfferData[] => {
  if (!apiOffers || !Array.isArray(apiOffers)) {
    console.log('⚠️ Brak danych lub nieprawidłowy format');
    return [];
  }

  return apiOffers.map(offer => {
    return {
      id: offer.id,
      title: offer.title,
      description: offer.description || '',
      price: offer.price,
      currency: offer.currency || 'zł',
      seller: offer.seller || {
        id: 'unknownSellerId',
        firstName: 'Unknown',
        lastName: 'Seller',
        email: 'unknown@example.com',
      },
      location: offer.location || '',
      contactPhone: offer.contactPhone || '',
      contactEmail: offer.contactEmail || '',
      mainImage: offer.mainImage || '',
      CarDetailsDto: {
        brand: offer.brand || 'Unknown',
        model: offer.model || 'Unknown',
        year: offer.year || 0,
        color: offer.color || '',
        displacement: offer.displacement || '',
        mileage: offer.mileage || 0,
        fuelType: offer.fuelType || 'OTHER',
        transmission: offer.transmission || '',
        bodyType: offer.bodyType || '',
        driveType: String(offer.driveType || ''),
        enginePower: offer.enginePower || 0,
        doors: offer.doors || 0,
        seats: offer.seats || 0,
      },
    };
  });
};

const SellerOffers: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerInfo, setSellerInfo] = useState<{ firstName: string; lastName: string } | null>(
    null
  );
  const navigate = useNavigate();

  const {
    selectedOffers,
    addToComparison,
    removeFromComparison,
    isOfferSelected,
    canAddMoreOffers,
  } = useComparison();

  useTitle(
    sellerInfo
      ? `Oferty sprzedającego - ${sellerInfo.firstName} ${sellerInfo.lastName}`
      : 'Oferty sprzedającego'
  );

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = DEFAULT_CAR_IMAGE;
      console.warn('Błąd ładowania zdjęcia w ofercie sprzedającego:', target.src);
    }
  };

  const handleOfferClick = (offerId: string) => {
    sessionStorage.setItem('sellerOffersScrollPosition', window.pageYOffset.toString());
    navigate(`/offer/${offerId}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleToggleComparison = (id: string, checked: boolean, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const offer = offers.find(o => o.id === id);
    if (!offer) return;

    const miniOffer = {
      id: offer.id,
      title: offer.title,
      price: offer.price,
      mainImage: offer.mainImage,
      mileage: offer.CarDetailsDto.mileage,
      fuelType: offer.CarDetailsDto.fuelType,
      year: offer.CarDetailsDto.year,
      enginePower: offer.CarDetailsDto.enginePower,
      displacement: offer.CarDetailsDto.displacement,
    };

    if (checked) {
      addToComparison(miniOffer);
    } else {
      removeFromComparison(id);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchSellerOffers = async () => {
      if (!sellerId) {
        setError('Nie podano ID sprzedającego.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Pobieranie ofert dla sprzedającego ID:', sellerId);
        const data = await getOffersBySeller(sellerId);

        if (data && data.content && data.content.length > 0) {
          console.log('Otrzymane dane:', data.content);
          const mappedOffers = mapApiResponseToComponentFormat(data.content);
          setOffers(mappedOffers);

          const firstOffer = data.content[0];
          if (firstOffer) {
            try {
              const offerResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/offers/${firstOffer.id}`
              );
              if (offerResponse.data.seller) {
                setSellerInfo({
                  firstName: offerResponse.data.seller.firstName,
                  lastName: offerResponse.data.seller.lastName,
                });
              }
            } catch (err) {
              console.warn('Nie udało się pobrać danych sprzedającego:', err);
            }
          }
        } else {
          console.warn('Otrzymano puste dane odpowiedzi');
          setOffers([]);
        }
      } catch (err) {
        console.error('Błąd podczas pobierania ofert sprzedającego:', err);
        setError('Nie udało się pobrać ofert sprzedającego. Spróbuj ponownie później.');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOffers();
  }, [sellerId]);

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('sellerOffersScrollPosition');
    if (savedScrollPosition && offers.length > 0) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('sellerOffersScrollPosition');
      }, 100);
    }
  }, [offers]);

  const OfferCard: React.FC<{ offer: OfferData }> = ({ offer }) => {
    if (!offer || !offer.CarDetailsDto) {
      return null;
    }

    const translatedFuelType =
      fuelTypeTranslations[offer.CarDetailsDto.fuelType] || offer.CarDetailsDto.fuelType;

    return (
      <div className="offer-card">
        <div className="offer-clickable" onClick={() => handleOfferClick(offer.id)}>
          <div className="offer-image-container">
            <img
              src={offer.mainImage ? `${API_URL}${offer.mainImage}` : DEFAULT_CAR_IMAGE}
              alt={offer.title}
              loading="lazy"
              onError={handleImageError}
            />
          </div>
          <div className="offer-details">
            <div className="offer-header">
              <h2>{truncateText(offer.title, 50)}</h2>
              <div className="price-actions">
                <span className="offer-price">{formatPrice(offer.price, offer.currency)}</span>
                <div onClick={e => e.stopPropagation()}>
                  <LikeButton offerId={offer.id} initialLiked={false} />
                </div>
              </div>
            </div>

            <div className="offer-info">
              <p>
                <strong>Rok:</strong> <span>{offer.CarDetailsDto.year}</span>
              </p>
              <p>
                <strong>Przebieg:</strong> <span>{formatMileage(offer.CarDetailsDto.mileage)}</span>
              </p>
              <p>
                <strong>Typ paliwa:</strong> <span>{translatedFuelType}</span>
              </p>
              <p>
                <strong>Moc silnika:</strong> <span>{offer.CarDetailsDto.enginePower} KM</span>
              </p>
              <p>
                <strong>Pojemność silnika:</strong> <span>{offer.CarDetailsDto.displacement}</span>
              </p>
              {offer.location && (
                <p>
                  <strong>Lokalizacja:</strong> <span>{offer.location}</span>
                </p>
              )}
            </div>

            <div className="offer-compare-bottom">
              <div onClick={e => e.stopPropagation()}>
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
      </div>
    );
  };

  const renderOffers = () => {
    if (loading) {
      return <div className="loading-message">Ładowanie ofert...</div>;
    }

    if (error) {
      return <div className="offers-error">{error}</div>;
    }

    if (!offers || offers.length === 0) {
      return (
        <div className="no-offers">
          <p>Ten sprzedający nie ma obecnie żadnych aktywnych ogłoszeń.</p>
        </div>
      );
    }

    return (
      <div className="offer-list">
        {offers.map(offer => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    );
  };

  return (
    <div className="seller-offers">
      <div className="seller-offers-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Wróć
        </button>
        <h1>
          {sellerInfo
            ? `Oferty sprzedającego - ${sellerInfo.firstName} ${sellerInfo.lastName}`
            : 'Oferty sprzedającego'}
        </h1>
        {offers.length > 0 && (
          <p className="offers-count">
            Znaleziono {offers.length}{' '}
            {offers.length === 1 ? 'ofertę' : offers.length < 5 ? 'oferty' : 'ofert'}
            {sellerInfo && ` dla użytkownika: ${sellerInfo.firstName} ${sellerInfo.lastName}`}
          </p>
        )}
      </div>
      {renderOffers()}

      <ComparisonBar selectedOffers={selectedOffers} removeFromComparison={removeFromComparison} />
    </div>
  );
};

export default SellerOffers;
