import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserOffers.scss';
import { getUserOffers, deleteOffer } from '../../api/offerApi';
import { ApiOffer, OfferData } from '../../types/offerTypes.ts';
import { translations } from '../../translations/carEquipmentTranslations';
import { DEFAULT_CAR_IMAGE } from '../../util/constants.tsx';

const API_URL = import.meta.env.VITE_API_URL;

const formatPrice = (price: number, currency: string = 'zł'): string => {
  return price.toLocaleString('pl-PL') + ' ' + currency;
};

const formatMileage = (mileage: number): string => {
  return mileage.toLocaleString('pl-PL') + ' km';
};

const mapApiResponseToComponentFormat = (apiOffers: ApiOffer[]): OfferData[] => {
  if (!apiOffers || !Array.isArray(apiOffers)) {
    console.log('No data or wrong format');
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

const UserOffers: React.FC = () => {
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [noUserIdError, setNoUserIdError] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = DEFAULT_CAR_IMAGE;
      console.warn('Error in image loading:', target.src);
    }
  };

  const handleOfferClick = (offerId: string) => {
    navigate(`/offer/${offerId}`);
  };

  useEffect(() => {
    const fetchUserOffers = async () => {
      try {
        setLoading(true);

        const userId = localStorage.getItem('userId');

        if (!userId) {
          console.warn('User ID not found in localStorage.');
          setNoUserIdError(true);
          setLoading(false);
          return;
        }

        console.log('Fetching offers for user ID:', userId);
        const data = await getUserOffers(userId);

        if (data && data.content) {
          console.log('Fetched data:', data.content);
          const mappedOffers = mapApiResponseToComponentFormat(data.content);
          console.log('Mapped data:', mappedOffers);
          setOffers(mappedOffers);
        } else {
          console.warn('Fetched empty data');
          setOffers([]);
        }
      } catch (err) {
        console.error('Error in fetching offers:', err);
        setError('Failed to load offers. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOffers();
  }, []);

  const handleEditOffer = (offerId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    window.location.href = `/offer/edit/${offerId}`;
  };

  const handleDeleteOffer = async (offerId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (window.confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
      try {
        const success = await deleteOffer(offerId);

        if (success) {
          setOffers(offers.filter(offer => offer.id !== offerId));
        } else {
          throw new Error('Server returned an error.');
        }
      } catch (err) {
        console.error('Error in deleting offer:', err);
        alert('Nie udało się usunąć ogłoszenia. Spróbuj ponownie później.');
      }
    }
  };

  const redirectToProfile = () => {
    window.location.href = '/user/panel';
  };

  const OfferCard: React.FC<{ offer: OfferData }> = ({ offer }) => {
    if (!offer || !offer.CarDetailsDto) {
      return null;
    }

    const translatedFuelType =
      translations.fuelType[offer.CarDetailsDto.fuelType as keyof typeof translations.fuelType] ||
      offer.CarDetailsDto.fuelType;

    const getTranslatedTransmission = (transmission: string) => {
      return (
        translations.transmissionType[transmission as keyof typeof translations.transmissionType] ||
        transmission
      );
    };

    const getTranslatedBodyType = (bodyType: string) => {
      return translations.bodyType[bodyType as keyof typeof translations.bodyType] || bodyType;
    };

    const getTranslatedDriveType = (driveType: string) => {
      return translations.driveType[driveType as keyof typeof translations.driveType] || driveType;
    };

    return (
      <div className="offer-card" onClick={() => handleOfferClick(offer.id)}>
        <div className="offer-image">
          <img
            src={offer.mainImage ? `${API_URL}${offer.mainImage}` : DEFAULT_CAR_IMAGE}
            alt={offer.title}
            onError={handleImageError}
          />
        </div>
        <div className="offer-details">
          <h4 className="offer-title">{offer.title}</h4>
          <div className="offer-specs">
            <span className="offer-year">{offer.CarDetailsDto.year}</span>
            <span className="offer-engine">
              {offer.CarDetailsDto.enginePower} KM | {offer.CarDetailsDto.displacement} |{' '}
              {translatedFuelType}
            </span>
            <span className="offer-mileage">{formatMileage(offer.CarDetailsDto.mileage)}</span>
            {offer.CarDetailsDto.transmission && (
              <span className="offer-transmission">
                {getTranslatedTransmission(offer.CarDetailsDto.transmission)}
              </span>
            )}
            {offer.CarDetailsDto.bodyType && (
              <span className="offer-body-type">
                {getTranslatedBodyType(offer.CarDetailsDto.bodyType)}
              </span>
            )}
            {offer.CarDetailsDto.driveType && (
              <span className="offer-drive-type">
                {getTranslatedDriveType(offer.CarDetailsDto.driveType)}
              </span>
            )}
          </div>
          <div className="offer-price">{formatPrice(offer.price, offer.currency)}</div>
        </div>
        <div className="offer-actions">
          <button className="edit-offer-btn" onClick={e => handleEditOffer(offer.id, e)}>
            Edytuj
          </button>
          <button className="delete-offer-btn" onClick={e => handleDeleteOffer(offer.id, e)}>
            Usuń
          </button>
        </div>
      </div>
    );
  };

  const navigateToCreateOffer = () => {
    window.location.href = '/offer/create';
  };

  const renderOffers = () => {
    if (loading) {
      return <div className="offers-loading">Ładowanie ogłoszeń...</div>;
    }

    if (noUserIdError) {
      return (
        <div className="offers-error">
          <p>Nie można pobrać ogłoszeń. Brak ID użytkownika.</p>
          <p>Przejdź najpierw do profilu, aby załadować swoje dane.</p>
          <button className="primary-btn" onClick={redirectToProfile}>
            Przejdź do profilu
          </button>
        </div>
      );
    }

    if (error) {
      return <div className="offers-error">{error}</div>;
    }

    if (!offers || offers.length === 0) {
      return (
        <div className="offers-empty">
          <p>Obecnie nie masz żadnych aktywnych ogłoszeń.</p>
          <button className="create-offer-btn" onClick={navigateToCreateOffer}>
            Dodaj nowe ogłoszenie
          </button>
        </div>
      );
    }

    return (
      <div className="offers-list">
        {offers.map(offer => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
        <div className="add-offer-container">
          <button className="create-offer-btn" onClick={navigateToCreateOffer}>
            Dodaj nowe ogłoszenie
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="user-offers">
      <h3>Moje ogłoszenia</h3>
      {renderOffers()}
    </div>
  );
};

export default UserOffers;
