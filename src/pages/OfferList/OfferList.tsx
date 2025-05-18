import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./OfferList.scss";
import useTitle from "../../hooks/useTitle";
import { MiniOffer } from "../../types/miniOfferTypes";
import LikeButton from "../../components/LikeButton/LikeButton";
import CompareCheckbox from "../../components/CompareCheckbox/CompareCheckbox";
import ComparisonBar from "../../components/ComparisonBar/ComparisonBar";
import { useComparison } from "../../context/ComparisonContext";

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

  const {
    selectedOffers,
    addToComparison,
    removeFromComparison,
    isOfferSelected,
    canAddMoreOffers
  } = useComparison();

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

  const handleToggleComparison = (id: string, checked: boolean) => {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;

    if (checked) {
      addToComparison(offer);
    } else {
      removeFromComparison(id);
    }
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
                      <div key={offer.id} className="offer-card">
                        <div className="offer-clickable" onClick={() => handleOfferClick(offer.id)}>
                          <div className="offer-image-container">
                            <img
                                src={`${API_URL}/images/${offer.mainImage}`}
                                alt={offer.title}
                                loading="lazy"
                            />
                          </div>
                          <div className="offer-details">
                            <div className="offer-header">
                              <h2>{truncateText(offer.title, 50)}</h2>
                              <div className="price-actions">
                                <span className="offer-price">{offer.price.toLocaleString()} PLN</span>
                                <LikeButton offerId={offer.id} />
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
                                  isDisabled={!canAddMoreOffers()}
                                  onToggle={handleToggleComparison}
                              />
                            </div>
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

        <ComparisonBar
            selectedOffers={selectedOffers}
            removeFromComparison={removeFromComparison}
        />
      </div>
  );
};

export default OfferList;