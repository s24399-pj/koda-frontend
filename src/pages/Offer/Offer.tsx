import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import axios from "axios";
import L from "leaflet";
import { OfferData } from "../../types/offerTypes";
import "leaflet/dist/leaflet.css";
import "./Offer.scss";

// TODO outsource it somewhere
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onImageChange: (index: number) => void;
  apiUrl: string;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onImageChange, apiUrl }) => {
  const lightboxThumbnailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lightboxThumbnailsRef.current && currentIndex >= 0) {
      const container = lightboxThumbnailsRef.current;
      const thumbnail = container.children[currentIndex] as HTMLElement;

      if (thumbnail) {
        const containerWidth = container.offsetWidth;
        const thumbnailLeft = thumbnail.offsetLeft;
        const thumbnailWidth = thumbnail.offsetWidth;

        const scrollTo = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
        container.scrollTo({
          left: Math.max(0, scrollTo),
          behavior: 'smooth'
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
    target.src = "https://via.placeholder.com/400x300?text=Brak+zdjęcia";
  };

  return (
      <div className="lightbox-overlay" onClick={handleBackdropClick}>
        <button
            className="lightbox-close"
            onClick={onClose}
            aria-label="Zamknij podgląd"
        >
          ×
        </button>

        {images.length > 1 && (
            <>
              <button
                  className="lightbox-nav prev"
                  onClick={handlePrevImage}
                  aria-label="Poprzednie zdjęcie"
              >
                &lt;
              </button>
              <button
                  className="lightbox-nav next"
                  onClick={handleNextImage}
                  aria-label="Następne zdjęcie"
              >
                &gt;
              </button>
            </>
        )}

        <div className="lightbox-content">
          <img
              src={`${apiUrl}/images/${images[currentIndex]}`}
              alt="Powiększony widok"
              className="lightbox-image"
              onError={handleImageError}
          />

          {images.length > 1 && (
              <div className="lightbox-thumbnails-wrapper">
                <div
                    className="lightbox-thumbnails"
                    ref={lightboxThumbnailsRef}
                >
                  {images.map((image, idx) => (
                      <div
                          key={idx}
                          className={`lightbox-thumbnail ${idx === currentIndex ? 'active' : ''}`}
                          onClick={() => onImageChange(idx)}
                      >
                        <img
                            src={`${apiUrl}/images/${image}`}
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
  useTitle("Offer");

  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>(DEFAULT_AVATAR);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const thumbnailsContainerRef = useRef<HTMLDivElement | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

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
        const response = await axios.get<OfferData>(`${import.meta.env.VITE_API_URL}/api/v1/offers/${id}`);
        setOffer(response.data);

<<<<<<< HEAD
=======
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

>>>>>>> eabb89251de0f7aa9f14b5233b34ffb71cae315e
        if (response.data.seller?.profilePictureBase64) {
          setProfileImage(response.data.seller.profilePictureBase64);
        }

        if (response.data.location) {
          const geocodeResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
              q: `${response.data.location}, Poland`,
              format: "json",
              limit: 5,
              addressdetails: 1,
            },
          });

          if (geocodeResponse.data.length > 0) {
            const validLocation = geocodeResponse.data.find((result: any) =>
                result.address.city || result.address.town || result.address.village
            );

            if (validLocation) {
              const { lat, lon } = validLocation;
              setMapLat(parseFloat(lat));
              setMapLng(parseFloat(lon));
            } else {
              console.error("Nie znaleziono dokładnej miejscowości");
              setError("Nie udało się znaleźć dokładnej lokalizacji.");
            }
          } else {
            console.error("Brak wyników dla tej lokalizacji");
            setError("Nie udało się znaleźć lokalizacji.");
          }
        }
      } catch (error) {
        console.error("Error fetching offer:", error);
        setError("Nie udało się załadować oferty.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  useEffect(() => {
    if (mapLat && mapLng && mapRef.current) {
      const map = L.map(mapRef.current).setView([mapLat, mapLng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const radius = isMobile ? 2000 : 4000;

      L.circle([mapLat, mapLng], {
        radius: radius,
        color: "#007be5",
        fillColor: "#007be5",
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(map).bindPopup("Lokalizacja oferty");

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

        const scrollTo = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
        container.scrollTo({
          left: Math.max(0, scrollTo),
          behavior: 'smooth'
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
    console.log("Wystąpił błąd ładowania zdjęcia profilowego");
    setProfileImage(DEFAULT_AVATAR);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    target.src = "https://via.placeholder.com/400x300?text=Brak+zdjęcia";
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
  if (!offer || !offer.CarDetailsDto) return <p>Brak danych o ofercie.</p>;

  return (
      <div className="offer-container">
        <div className="offer-header">
          <div className="main-image-container">
            <img
                src={`${import.meta.env.VITE_API_URL}/images/${selectedImage}`}
                alt={offer.title}
                className="main-image"
                onError={handleImageError}
                onClick={openLightbox}
            />
            <div className="zoom-hint">
              <span>🔍 Kliknij, aby powiększyć</span>
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
                    &lt;
                  </button>

                  <div
                      className="thumbnails-container"
                      ref={thumbnailsContainerRef}
                  >
                    {allImages.map((image, idx) => (
                        <div
                            key={idx}
                            className={`thumbnail-container ${idx === imageIndex ? 'active' : ''}`}
                            onClick={() => handleThumbnailClick(idx)}
                        >
                          <img
                              src={`${import.meta.env.VITE_API_URL}/images/${image}`}
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
                    &gt;
                  </button>
                </div>
              </div>
          )}

          <div className="offer-info">
            <h1>{offer.title}</h1>
            <p className="price">
              {offer.price.toLocaleString()} {offer.currency}
            </p>
            <p className="location">📍 {offer.location}</p>

            <div className="contact-details">
              <p>📞 {offer.contactPhone}</p>
              <p>📧 <a href={`mailto:${offer.contactEmail}`}>{offer.contactEmail}</a></p>
            </div>

            <button className="contact-button">Skontaktuj się</button>
          </div>
        </div>

        <div className="offer-details">
          <h2>Opis</h2>
          <p>{offer.description}</p>

          <h2>Szczegóły techniczne</h2>
          <ul>
            <li>🚗 Marka: {offer.CarDetailsDto.brand}</li>
            <li>🔧 Model: {offer.CarDetailsDto.model}</li>
            <li>📅 Rok: {offer.CarDetailsDto.year}</li>
            <li>⛽ Paliwo: {offer.CarDetailsDto.fuelType}</li>
            <li>⚙️ Skrzynia biegów: {offer.CarDetailsDto.transmission}</li>
            <li>🏎️ Moc: {offer.CarDetailsDto.enginePower} KM</li>
            <li>📏 Pojemność: {offer.CarDetailsDto.displacement}</li>
            <li>🚪 Liczba drzwi: {offer.CarDetailsDto.doors}</li>
            <li>🛋️ Liczba miejsc: {offer.CarDetailsDto.seats}</li>
          </ul>
        </div>

        {offer.seller && (
            <div className="seller-info-section">
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
                    <h3>{offer.seller.firstName} {offer.seller.lastName}</h3>
                    <p className="seller-email">{offer.seller.email}</p>
                  </div>
                </div>
                <button className="view-seller-offers">
                  Zobacz inne oferty sprzedającego
                </button>
              </div>
            </div>
        )}

        {mapLat && mapLng && (
            <div className="offer-map">
              <h2>Lokalizacja</h2>
              <div
                  ref={mapRef}
                  style={{
                    height: isMobile ? "250px" : "300px",
                    width: "100%"
                  }}
              ></div>
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