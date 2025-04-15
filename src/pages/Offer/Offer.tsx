import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import axios from "axios";
import L from "leaflet";
import Slider from "react-slick";
import { OfferData } from "../../types/offerTypes";
import "leaflet/dist/leaflet.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Offer.scss";

// TODO outsource it somewhere
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

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

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await axios.get<OfferData>(`${import.meta.env.VITE_API_URL}/api/v1/offers/${id}`);
        setOffer(response.data);

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

      L.circle([mapLat, mapLng], {
        radius: 4000,
        color: "#007be5",
        fillColor: "#007be5",
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(map).bindPopup("Lokalizacja oferty");

      return () => {
        map.remove();
      };
    }
  }, [mapLat, mapLng]);

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleProfileImageError = () => {
    console.log("Wystąpił błąd ładowania zdjęcia profilowego");
    setProfileImage(DEFAULT_AVATAR);
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!offer || !offer.CarDetailsDto) return <p>Brak danych o ofercie.</p>;

  const mainImageUrl = selectedImage || (offer.imageUrls && offer.imageUrls.length > 0 ? offer.imageUrls[0] : offer.mainImage);

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    focusOnSelect: true,
    centerMode: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerMode: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          centerMode: true,
        },
      },
    ],
  };

  return (
      <div className="offer-container">
        <div className="offer-header">
          <img
              src={`${import.meta.env.VITE_API_URL}/images/${mainImageUrl}`}
              alt={offer.title}
              className="main-image"
          />
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

        {offer.imageUrls && offer.imageUrls.length > 0 && (
            <div className="offer-gallery">
              <Slider {...sliderSettings}>
                {offer.imageUrls.map((image, index) => (
                    <div key={index}>
                      <img
                          src={`${import.meta.env.VITE_API_URL}/images/${image}`}
                          alt={`Car view ${index + 1}`}
                          className="slider-image"
                          onClick={() => handleImageClick(image)}
                      />
                    </div>
                ))}
              </Slider>
            </div>
        )}

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
              <div ref={mapRef} style={{ height: "300px", width: "60%" }}></div>
            </div>
        )}
      </div>
  );
};

export default Offer;