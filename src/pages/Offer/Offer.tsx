import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';
import axios from 'axios';
import L from 'leaflet';
import { OfferData } from '../../types/offerTypes';
import 'leaflet/dist/leaflet.css';
import './Offer.scss';
import LikeButton from '../../components/LikeButton/LikeButton';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PROFILE_IMAGE } from '../../assets/defaultProfilePicture.ts';
import { CarEquipment } from '../../types/offer/OfferTypes.ts';
import { equipmentCategories } from '../../types/offer/carEquipmentCategories.ts';
import { translations } from '../../translations/carEquipmentTranslations.ts';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onImageChange: (index: number) => void;
  apiUrl: string;
}

const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onImageChange,
  apiUrl,
}) => {
  const lightboxThumbnailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lightboxThumbnailsRef.current && currentIndex >= 0) {
      const container = lightboxThumbnailsRef.current;
      const thumbnail = container.children[currentIndex] as HTMLElement;

      if (thumbnail) {
        const containerWidth = container.offsetWidth;
        const thumbnailLeft = thumbnail.offsetLeft;
        const thumbnailWidth = thumbnail.offsetWidth;

        const scrollTo = thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2;
        container.scrollTo({
          left: Math.max(0, scrollTo),
          behavior: 'smooth',
        });
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        onImageChange((currentIndex + 1) % images.length);
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        onImageChange((currentIndex - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onImageChange, currentIndex, images.length]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrevImage = () => {
    onImageChange((currentIndex - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    onImageChange((currentIndex + 1) % images.length);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = 'https://placehold.co/600x400';
      console.warn('Image loading error:', target.src);
    }
  };

  return (
    <div className="lightbox-overlay" onClick={handleBackdropClick}>
      <button className="lightbox-close" onClick={onClose} aria-label="Zamknij podgląd">
        ×
      </button>

      {images.length > 1 && (
        <>
          <button
            className="lightbox-nav prev"
            onClick={handlePrevImage}
            aria-label="Poprzednie zdjęcie"
          >
            ‹
          </button>
          <button
            className="lightbox-nav next"
            onClick={handleNextImage}
            aria-label="Następne zdjęcie"
          >
            ›
          </button>
        </>
      )}

      <div className="lightbox-content">
        <img
          src={`${apiUrl}${images[currentIndex]}`}
          alt="Powiększony widok"
          className="lightbox-image"
          onError={handleImageError}
        />

        {images.length > 1 && (
          <div className="lightbox-thumbnails-wrapper">
            <div className="lightbox-thumbnails" ref={lightboxThumbnailsRef}>
              {images.map((image, idx) => (
                <div
                  key={idx}
                  className={`lightbox-thumbnail ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => onImageChange(idx)}
                >
                  <img
                    src={`${apiUrl}${image}`}
                    alt={`Miniatura ${idx + 1}`}
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Offer: React.FC = () => {
  useTitle('Oferta');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>(DEFAULT_PROFILE_IMAGE);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const thumbnailsContainerRef = useRef<HTMLDivElement | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  const getTranslation = (category: keyof typeof translations, key: string) => {
    return (translations[category] as Record<string, string>)?.[key] || key;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await axios.get<OfferData>(
          `${import.meta.env.VITE_API_URL}/api/v1/offers/${id}`
        );
        setOffer(response.data);

        const images: string[] = [];
        if (response.data.mainImage) {
          images.push(response.data.mainImage);
        }
        if (response.data.imageUrls && response.data.imageUrls.length > 0) {
          response.data.imageUrls.forEach(img => {
            if (!images.includes(img)) {
              images.push(img);
            }
          });
        }
        setAllImages(images);

        if (images.length > 0) {
          setSelectedImage(images[0]);
        }

        if (response.data.seller?.profilePictureBase64) {
          setProfileImage(response.data.seller.profilePictureBase64);
        }

        if (response.data.location) {
          const geocodeResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
              q: `${response.data.location}, Poland`,
              format: 'json',
              limit: 5,
              addressdetails: 1,
            },
          });

          if (geocodeResponse.data.length > 0) {
            const validLocation = geocodeResponse.data.find(
              (result: any) => result.address.city || result.address.town || result.address.village
            );

            if (validLocation) {
              const { lat, lon } = validLocation;
              setMapLat(parseFloat(lat));
              setMapLng(parseFloat(lon));
            } else {
              console.error('Exact location not found');
              setError('Failed to find exact location.');
            }
          } else {
            console.error('No results for this location');
            setError('Failed to find location.');
          }
        }
      } catch (error) {
        console.error('Error fetching offer:', error);
        setError('Failed to load offer.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  useEffect(() => {
    if (mapLat && mapLng && mapRef.current) {
      const map = L.map(mapRef.current).setView([mapLat, mapLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const radius = isMobile ? 2000 : 4000;

      L.circle([mapLat, mapLng], {
        radius: radius,
        color: '#007aff',
        fillColor: '#007aff',
        fillOpacity: 0.3,
        weight: 2,
      })
        .addTo(map)
        .bindPopup('Lokalizacja oferty');

      return () => {
        map.remove();
      };
    }
  }, [mapLat, mapLng, isMobile]);

  useEffect(() => {
    if (thumbnailsContainerRef.current && imageIndex >= 0) {
      const container = thumbnailsContainerRef.current;
      const thumbnail = container.children[imageIndex] as HTMLElement;

      if (thumbnail) {
        const containerWidth = container.offsetWidth;
        const thumbnailLeft = thumbnail.offsetLeft;
        const thumbnailWidth = thumbnail.offsetWidth;

        const scrollTo = thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2;
        container.scrollTo({
          left: Math.max(0, scrollTo),
          behavior: 'smooth',
        });
      }
    }
  }, [imageIndex]);

  const handleThumbnailClick = (index: number) => {
    setImageIndex(index);
    setSelectedImage(allImages[index]);
  };

  const handlePrevImage = () => {
    const newIndex = (imageIndex - 1 + allImages.length) % allImages.length;
    handleThumbnailClick(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = (imageIndex + 1) % allImages.length;
    handleThumbnailClick(newIndex);
  };

  const handleProfileImageError = () => {
    console.log('Profile image loading error occurred');
    setProfileImage(DEFAULT_PROFILE_IMAGE);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = 'https://placehold.co/600x400';
      console.warn('Image loading error - replaced with placeholder:', target.src);
    }
  };

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const handleLightboxImageChange = (index: number) => {
    setImageIndex(index);
    setSelectedImage(allImages[index]);
  };

  const handleStartChat = () => {
    if (!isAuthenticated) {
      navigate('/user/login', { state: { returnUrl: `/offer/${id}` } });
      return;
    }

    if (offer?.seller?.id) {
      const sellerInfo = {
        id: offer.seller.id,
        firstName: offer.seller.firstName,
        lastName: offer.seller.lastName,
        profilePicture: offer.seller.profilePictureBase64,
        email: offer.seller.email,
        isNewConversation: true,
      };

      navigate(`/chat/${offer.seller.id}`, { state: { sellerInfo } });
    } else {
      console.error('Missing seller ID');
    }
  };

  const handleContactButton = () => {
    if (offer?.seller?.id) {
      handleStartChat();
    } else {
      window.location.href = `mailto:${offer?.contactEmail}`;
    }
  };

  const handleViewSellerOffers = () => {
    if (offer?.seller?.id) {
      navigate(`/seller/${offer.seller.id}/offers`);
    } else {
      console.error('Missing seller ID');
    }
  };

  const renderEquipmentSection = (equipment?: CarEquipment) => {
    if (!equipment) return null;

    return (
      <div className="equipment-section">
        <div className="section">
          <h2>Wyposażenie</h2>
          {equipmentCategories.map(category => {
            const availableItems = category.items.filter(
              item => equipment[item.key as keyof CarEquipment] === true
            );

            if (availableItems.length === 0) return null;

            return (
              <div key={category.title} className="equipment-category">
                <h3>{category.title}</h3>
                <div className="equipment-grid">
                  {availableItems.map(item => (
                    <div key={item.key} className="equipment-item">
                      <span className="equipment-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageIndex, allImages.length, lightboxOpen]);

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!offer || !offer.CarDetailsDto) return <p>Brak danych oferty.</p>;

  return (
    <div className="offer-container">
      <div className="offer-header">
        <div className="images-section">
          <div className="main-image-container">
            <img
              src={`${import.meta.env.VITE_API_URL}${selectedImage}`}
              alt={offer.title}
              className="main-image"
              onError={handleImageError}
              onClick={openLightbox}
            />
            <div className="zoom-hint">
              <span>Kliknij aby powiększyć</span>
            </div>
          </div>

          {allImages.length > 0 && (
            <div className="offer-gallery">
              <div className="thumbnails-wrapper">
                <button
                  className="nav-button prev"
                  onClick={handlePrevImage}
                  aria-label="Poprzednie zdjęcie"
                  disabled={allImages.length <= 1}
                >
                  ‹
                </button>

                <div className="thumbnails-container" ref={thumbnailsContainerRef}>
                  {allImages.map((image, idx) => (
                    <div
                      key={idx}
                      className={`thumbnail-container ${idx === imageIndex ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(idx)}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}${image}`}
                        alt={`Widok ${idx + 1}`}
                        className="thumbnail-image"
                        onError={handleImageError}
                      />
                    </div>
                  ))}
                </div>

                <button
                  className="nav-button next"
                  onClick={handleNextImage}
                  aria-label="Następne zdjęcie"
                  disabled={allImages.length <= 1}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="offer-info">
          <div className="offer-title-row">
            <h1>{offer.title}</h1>
            <LikeButton
              offerId={offer.id}
              onLikeToggle={isLiked => {
                console.log(`Offer ${offer.id} ${isLiked ? 'liked' : 'not liked'}`);
              }}
            />
          </div>

          <div className="price-section">
            <div className="price">
              {offer.price.toLocaleString()} {offer.currency}
            </div>
            <div className="price-note">
              {offer.CarDetailsDto.mileage && `${offer.CarDetailsDto.mileage.toLocaleString()} km`}
            </div>
          </div>

          <div className="key-details">
            <div className="detail-item">
              <span className="label">Lokalizacja</span>
              <span className="value">{offer.location}</span>
            </div>
            <div className="detail-item">
              <span className="label">Rok</span>
              <span className="value">{offer.CarDetailsDto.year}</span>
            </div>
            <div className="detail-item">
              <span className="label">Paliwo</span>
              <span className="value">
                {getTranslation('fuelType', offer.CarDetailsDto.fuelType)}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Moc</span>
              <span className="value">{offer.CarDetailsDto.enginePower} KM</span>
            </div>
          </div>

          <div className="contact-section">
            <div className="contact-item">
              <span className="contact-label">Telefon</span>
              <span className="contact-value">
                <a href={`tel:${offer.contactPhone}`}>{offer.contactPhone}</a>
              </span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Email</span>
              <span className="contact-value">
                <a href={`mailto:${offer.contactEmail}`}>{offer.contactEmail}</a>
              </span>
            </div>
          </div>

          <button className="contact-button" onClick={handleContactButton}>
            Kontakt
          </button>
        </div>
      </div>

      <div className="offer-details">
        <div className="section">
          <h2>Opis</h2>
          <p>{offer.description}</p>
        </div>

        <div className="section">
          <h2>Dane techniczne</h2>
          <div className="tech-specs">
            <div className="spec-item">
              <span className="spec-label">Marka</span>
              <span className="spec-value">{offer.CarDetailsDto.brand}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Model</span>
              <span className="spec-value">{offer.CarDetailsDto.model}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Rok</span>
              <span className="spec-value">{offer.CarDetailsDto.year}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Paliwo</span>
              <span className="spec-value">
                {getTranslation('fuelType', offer.CarDetailsDto.fuelType)}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Skrzynia</span>
              <span className="spec-value">
                {getTranslation('transmissionType', offer.CarDetailsDto.transmission)}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Moc</span>
              <span className="spec-value">{offer.CarDetailsDto.enginePower} KM</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Pojemność</span>
              <span className="spec-value">{offer.CarDetailsDto.displacement}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Typ nadwozia</span>
              <span className="spec-value">
                {getTranslation('bodyType', offer.CarDetailsDto.bodyType)}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Napęd</span>
              <span className="spec-value">
                {getTranslation('driveType', offer.CarDetailsDto.driveType)}
              </span>
            </div>
            {offer.CarDetailsDto.doors && (
              <div className="spec-item">
                <span className="spec-label">Drzwi</span>
                <span className="spec-value">{offer.CarDetailsDto.doors}</span>
              </div>
            )}
            {offer.CarDetailsDto.seats && (
              <div className="spec-item">
                <span className="spec-label">Miejsca</span>
                <span className="spec-value">{offer.CarDetailsDto.seats}</span>
              </div>
            )}
            {offer.CarDetailsDto.color && (
              <div className="spec-item">
                <span className="spec-label">Kolor</span>
                <span className="spec-value">{offer.CarDetailsDto.color}</span>
              </div>
            )}
            {offer.CarDetailsDto.condition && (
              <div className="spec-item">
                <span className="spec-label">Stan</span>
                <span className="spec-value">
                  {getTranslation('vehicleCondition', offer.CarDetailsDto.condition)}
                </span>
              </div>
            )}
            {offer.CarDetailsDto.registrationNumber && (
              <div className="spec-item">
                <span className="spec-label">Nr rejestracji</span>
                <span className="spec-value">{offer.CarDetailsDto.registrationNumber}</span>
              </div>
            )}
            {offer.CarDetailsDto.firstOwner !== null && (
              <div className="spec-item">
                <span className="spec-label">Pierwszy właściciel</span>
                <span className="spec-value">{offer.CarDetailsDto.firstOwner ? 'Tak' : 'Nie'}</span>
              </div>
            )}
            {offer.CarDetailsDto.accidentFree !== null && (
              <div className="spec-item">
                <span className="spec-label">Bezwypadkowy</span>
                <span className="spec-value">
                  {offer.CarDetailsDto.accidentFree ? 'Tak' : 'Nie'}
                </span>
              </div>
            )}
            {offer.CarDetailsDto.serviceHistory !== null && (
              <div className="spec-item">
                <span className="spec-label">Historia serwisowa</span>
                <span className="spec-value">
                  {offer.CarDetailsDto.serviceHistory ? 'Tak' : 'Nie'}
                </span>
              </div>
            )}
          </div>
        </div>

        {renderEquipmentSection(offer.CarDetailsDto.carEquipment)}
      </div>

      {offer.seller && (
        <div className="seller-info-section">
          <div className="section">
            <h2>Sprzedający</h2>
            <div className="seller-info">
              <div className="seller-profile">
                <div className="profile-image-container">
                  <img
                    src={profileImage}
                    alt={`${offer.seller.firstName} ${offer.seller.lastName}`}
                    onError={handleProfileImageError}
                    className="profile-image"
                  />
                </div>
                <div className="seller-details">
                  <h3>
                    {offer.seller.firstName} {offer.seller.lastName}
                  </h3>
                  <p className="seller-email">{offer.seller.email}</p>

                  <button
                    className="start-chat-button"
                    onClick={handleStartChat}
                    disabled={!isAuthenticated}
                    title={!isAuthenticated ? 'Musisz być zalogowany!' : ''}
                  >
                    <i className="fas fa-comments"></i> Rozpocznij czat
                  </button>
                </div>
              </div>
              <button
                className="view-seller-offers"
                onClick={handleViewSellerOffers}
                disabled={!offer?.seller?.id}
              >
                Zobacz inne oferty sprzedającego
              </button>
            </div>
          </div>
        </div>
      )}

      {mapLat && mapLng && (
        <div className="offer-map">
          <div className="section">
            <h2>Lokalizacja</h2>
            <div
              ref={mapRef}
              style={{
                height: isMobile ? '250px' : '300px',
                width: '100%',
              }}
            ></div>
          </div>
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={allImages}
          currentIndex={imageIndex}
          onClose={closeLightbox}
          onImageChange={handleLightboxImageChange}
          apiUrl={import.meta.env.VITE_API_URL}
        />
      )}
    </div>
  );
};

export default Offer;
