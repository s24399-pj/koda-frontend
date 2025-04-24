import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./OfferList.scss";
import useTitle from "../../hooks/useTitle";
import { MiniOffer } from "../../types/miniOfferTypes";
import LikeButton from "../../components/LikeButton/LikeButton";

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 5;

const OfferList: React.FC = () => {
  useTitle("Dostępne oferty");

  const [offers, setOffers] = useState<MiniOffer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        params.set("page", (currentPage - 1).toString());
        params.set("size", PAGE_SIZE.toString());

        const response = await axios.get(`${API_URL}/api/v1/offers`, { params });

        setOffers(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Błąd podczas pobierania ofert:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [currentPage, location.search]);

  const handleOfferClick = (id: string) => {
    navigate(`/offer/${id}`);
  };

  const renderPaginationButtons = () => {
    const isMobile = window.innerWidth <= 768;
    const maxButtonsToShow = isMobile ? 3 : 5;

    let startPage = Math.max(currentPage - Math.floor(maxButtonsToShow / 2), 1);
    let endPage = Math.min(startPage + maxButtonsToShow - 1, totalPages);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(endPage - maxButtonsToShow + 1, 1);
    }

    const pages = [];

    if (startPage > 1) {
      pages.push(
          <button key="first" onClick={() => setCurrentPage(1)}>1</button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
          <button
              key={i}
              className={currentPage === i ? "active" : ""}
              onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
          <button key="last" onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </button>
      );
    }

    return pages;
  };

  const truncateText = (text: string, maxLength: number) => {
    const isMobile = window.innerWidth <= 768;
    const actualMaxLength = isMobile ? Math.min(maxLength, 30) : maxLength;

    return text.length > actualMaxLength
        ? `${text.substring(0, actualMaxLength)}...`
        : text;
  };

  return (
      <div className="offer-list-container">
        <h1>Dostępne oferty</h1>

        {isLoading ? (
            <p>Ładowanie ofert...</p>
        ) : (
            <div className="offer-list">
              {offers.length > 0 ? (
                  offers.map((offer) => (
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
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="offer-price">{offer.price.toLocaleString()} PLN</span>
                            <LikeButton />
                          </div>
                        </div>
                          <div className="offer-info">
                            <p><strong>Rok:</strong> {offer.year}</p>
                            <p><strong>Przebieg:</strong> {offer.mileage.toLocaleString()} km</p>
                            <p><strong>Typ paliwa:</strong> {offer.fuelType}</p>
                            <p><strong>Moc silnika:</strong> {offer.enginePower} KM</p>
                            <p><strong>Pojemność silnika:</strong> {offer.displacement} cm³</p>
                          </div>
                        </div>
                      </div>
                  ))
              ) : (
                  <p className="no-offers">Brak dostępnych ofert.</p>
              )}
            </div>
        )}

        {totalPages > 1 && (
            <div className="pagination">
              <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
              >
                {"<"}
              </button>

              {renderPaginationButtons()}

              <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
              >
                {">"}
              </button>
            </div>
        )}
      </div>
  );
};

export default OfferList;