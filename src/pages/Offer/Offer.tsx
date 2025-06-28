import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';
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
import { DEFAULT_CAR_IMAGE } from '../../util/constants.tsx';
import offerApi from '../../api/offerApi';

/**
 * Props interface for the Lightbox component.
 */
interface LightboxProps {
  /** Array of image URLs to display in the lightbox */
  images: string[];
  /** Index of the currently displayed image */
  currentIndex: number;
  /** Callback function to close the lightbox */
  onClose: () => void;
  /** Callback function to change the displayed image */
  onImageChange: (index: number) => void;
  /** Base API URL for constructing full image URLs */
  apiUrl: string;
}

/**
 * Lightbox component for displaying images in full-screen overlay.
 * Supports keyboard navigation, thumbnail navigation, and image zooming.
 *
 * @param {LightboxProps} props - The props for the Lightbox component
 * @returns {JSX.Element} The rendered Lightbox component
 */
const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onImageChange,
  apiUrl,
}) => {
  const lightboxThumbnailsRef = useRef<HTMLDivElement | null>(null);

  /**
   * Effect hook to handle thumbnail scrolling when current image changes.
   * Centers the active thumbnail in the thumbnails container.
   */
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

  /**
   * Effect hook to handle keyboard navigation and body scroll prevention.
   * Sets up event listeners for Escape, Arrow Left, and Arrow Right keys.
   */
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

  /**
   * Handles click events on the lightbox backdrop to close the lightbox.
   * Only closes if the clicked element is the backdrop itself.
   *
   * @param {React.MouseEvent} e - The mouse event object
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Navigates to the previous image in the lightbox.
   */
  const handlePrevImage = () => {
    onImageChange((currentIndex - 1 + images.length) % images.length);
  };

  /**
   * Navigates to the next image in the lightbox.
   */
  const handleNextImage = () => {
    onImageChange((currentIndex + 1) % images.length);
  };

  /**
   * Handles image loading errors by setting a default fallback image.
   *
   * @param {React.SyntheticEvent<HTMLImageElement>} event - The image error event
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = DEFAULT_CAR_IMAGE;
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

/**
 * Main Offer component that displays detailed information about a single car offer.
 * Includes image gallery, technical specifications, seller information, and interactive map.
 *
 * @returns {JSX.Element} The rendered Offer component
 */
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

  /**
   * Gets translated text for car equipment based on category and key.
   *
   * @param {keyof typeof translations} category - The translation category
   * @param {string} key - The translation key
   * @returns {string} The translated text or the original key if translation not found
   */
  const getTranslation = (category: keyof typeof translations, key: string) => {
    return (translations[category] as Record<string, string>)?.[key] || key;
  };

  /**
   * Effect hook to handle window resize events for mobile detection.
   */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Effect hook to fetch offer data when component mounts or ID changes.
   * Also handles image collection, seller profile picture, and location geocoding.
   */
  useEffect(() => {
    const fetchOffer = async () => {
      if (!id) {
        setError('Brak ID oferty');
        setLoading(false);
        return;
      }

      try {
        const offerData = await offerApi.getOfferById(id);
        setOffer(offerData);

        const images: string[] = [];
        if (offerData.mainImage) {
          images.push(offerData.mainImage);
        }
        if (offerData.imageUrls && offerData.imageUrls.length > 0) {
          offerData.imageUrls.forEach(img => {
            if (!images.includes(img)) {
              images.push(img);
            }
          });
        }
        setAllImages(images);

        if (images.length > 0) {
          setSelectedImage(images[0]);
        }

        if (offerData.seller?.profilePictureBase64) {
          setProfileImage(offerData.seller.profilePictureBase64);
        }

        if (offerData.location) {
          try {
            const coordinates = await offerApi.geocodeLocation(offerData.location);
            if (coordinates) {
              setMapLat(coordinates.lat);
              setMapLng(coordinates.lng);
            }
          } catch (geocodeError) {
            console.error('Geocoding error:', geocodeError);
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

  /**
   * Effect hook to initialize and configure the Leaflet map when coordinates are available.
   * Creates a map with a circle overlay indicating the offer location area.
   */
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

  /**
   * Effect hook to handle thumbnail scrolling when image index changes.
   * Centers the active thumbnail in the thumbnails container.
   */
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

  /**
   * Handles thumbnail click events to change the selected image.
   *
   * @param {number} index - The index of the clicked thumbnail
   */
  const handleThumbnailClick = (index: number) => {
    setImageIndex(index);
    setSelectedImage(allImages[index]);
  };

  /**
   * Navigates to the previous image in the gallery.
   */
  const handlePrevImage = () => {
    const newIndex = (imageIndex - 1 + allImages.length) % allImages.length;
    handleThumbnailClick(newIndex);
  };

  /**
   * Navigates to the next image in the gallery.
   */
  const handleNextImage = () => {
    const newIndex = (imageIndex + 1) % allImages.length;
    handleThumbnailClick(newIndex);
  };

  /**
   * Handles profile image loading errors by setting a default profile image.
   */
  const handleProfileImageError = () => {
    console.log('Profile image loading error occurred');
    setProfileImage(DEFAULT_PROFILE_IMAGE);
  };

  /**
   * Handles image loading errors by setting a default car image.
   *
   * @param {React.SyntheticEvent<HTMLImageElement>} event - The image error event
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = DEFAULT_CAR_IMAGE;
      console.warn('Image loading error - replaced with placeholder:', target.src);
    }
  };

  /**
   * Opens the lightbox for image viewing.
   */
  const openLightbox = () => {
    setLightboxOpen(true);
  };

  /**
   * Closes the lightbox.
   */
  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  /**
   * Handles image change events from the lightbox component.
   *
   * @param {number} index - The new image index
   */
  const handleLightboxImageChange = (index: number) => {
    setImageIndex(index);
    setSelectedImage(allImages[index]);
  };

  /**
   * Handles the start chat functionality.
   * Redirects to login if user is not authenticated, otherwise navigates to chat.
   */
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

  /**
   * Handles contact button click.
   * Starts chat if seller ID is available, otherwise opens email client.
   */
  const handleContactButton = () => {
    if (offer?.seller?.id) {
      handleStartChat();
    } else {
      window.location.href = `mailto:${offer?.contactEmail}`;
    }
  };

  /**
   * Navigates to the seller's other offers page.
   */
  const handleViewSellerOffers = () => {
    if (offer?.seller?.id) {
      navigate(`/seller/${offer.seller.id}/offers`);
    } else {
      console.error('Missing seller ID');
    }
  };

  /**
   * Renders the car equipment section based on available equipment data.
   *
   * @param {CarEquipment} [equipment] - The car equipment data
   * @returns {JSX.Element | null} The rendered equipment section or null if no equipment
   */
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

  /**
   * Effect hook to handle keyboard navigation for image gallery.
   * Only active when lightbox is not open to avoid conflicts.
   */
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
