import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./LikedOffers.scss";
import useTitle from "../../hooks/useTitle";
import { MiniOffer } from "../../types/miniOfferTypes";
import { useAuth } from "../../context/AuthContext.tsx";
import AuthRequiredPage from "../../pages/AuthRequired/AuthRequired.tsx";

const API_URL = import.meta.env.VITE_API_URL;

const LikedOffersList: React.FC = () => {
  useTitle("Ulubione");

  const [likedOffers, setLikedOffers] = useState<MiniOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedOffers();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchLikedOffers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_URL}/api/v1/offers/liked`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLikedOffers(response.data || []);
    } catch (error) {
      console.error("Błąd podczas pobierania ulubionych ofert:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfferClick = (id: string) => {
    navigate(`/offer/${id}`);
  };

  const handleUnlikeOffer = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent navigation to offer details
    try {
      const token = localStorage.getItem('accessToken');
      
      await axios.post(`${API_URL}/api/v1/offers/${id}/unlike`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove unliked offer from the list
      setLikedOffers(prev => prev.filter(offer => offer.id !== id));
    } catch (error) {
      console.error("Błąd podczas usuwania oferty z ulubionych:", error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    const isMobile = window.innerWidth <= 768;
    const actualMaxLength = isMobile ? Math.min(maxLength, 30) : maxLength;

    return text.length > actualMaxLength
        ? `${text.substring(0, actualMaxLength)}...`
        : text;
  };

  // Content for authenticated users
  const renderAuthenticatedContent = () => {
    if (isLoading) {
      return <p className="loading-message">Ładowanie ofert...</p>;
    }

    return (
      <div className="offer-list">
        {likedOffers.length > 0 ? (
          likedOffers.map((offer) => (
            <div key={offer.id} className="offer-card" onClick={() => handleOfferClick(offer.id)}>
              <img
                src={`${API_URL}/images/${offer.mainImage}`}
                alt={offer.title}
                className="offer-image"
                loading="lazy"
              />
              <div className="offer-details">
                <div className="offer-header">
                  <h2>{truncateText(offer.title, 50)}</h2>
                  <span className="offer-price">{offer.price.toLocaleString()} PLN</span>
                </div>
                <div className="offer-info">
                  <p><strong>Rok:</strong> {offer.year}</p>
                  <p><strong>Przebieg:</strong> {offer.mileage.toLocaleString()} km</p>
                  <p><strong>Typ paliwa:</strong> {offer.fuelType}</p>
                  <p><strong>Moc silnika:</strong> {offer.enginePower} KM</p>
                  <p><strong>Pojemność silnika:</strong> {offer.displacement} cm³</p>
                </div>
                <button 
                  className="heart-button liked"
                  onClick={(e) => handleUnlikeOffer(e, offer.id)}
                  aria-label="Usuń z ulubionych"
                >
                  <i className="fas fa-heart"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-offers">
            <p>Nie masz jeszcze ulubionych ofert.</p>
            <Link to="/offers" className="browse-offers-button">Przeglądaj dostępne oferty</Link>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return <AuthRequiredPage 
      pageTitle="Ulubione oferty" 
      message="Dodawaj interesujące Cię oferty do ulubionych i miej do nich szybki dostęp."
    />;
  }

  return (
    <div className="liked-offers-page">
      <h1>Ulubione oferty</h1>
      {renderAuthenticatedContent()}
    </div>
  );
};

export default LikedOffersList;