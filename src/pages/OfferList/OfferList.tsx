import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./OfferList.scss";
import useTitle from "../../hooks/useTitle";
import { MiniOffer } from "../../types/miniOfferTypes";

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 5;

const OfferList: React.FC = () => {
  useTitle("Dostępne oferty");

  const [offers, setOffers] = useState<MiniOffer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const params = new URLSearchParams(location.search);
        params.set("page", (currentPage - 1).toString());
        params.set("size", PAGE_SIZE.toString());

        const response = await axios.get(`${API_URL}/api/v1/offers`, { params });

        setOffers(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Błąd podczas pobierania ofert:", error);
      }
    };

    fetchOffers();
  }, [currentPage, location.search]);

  const handleOfferClick = (id: string) => {
    navigate(`/offer/${id}`);
  };

  return (
    <div className="offer-list-container">
      <h1>Dostępne oferty</h1>

      <div className="offer-list">
        {offers.length > 0 ? (
          offers.map((offer) => (
            <div key={offer.id} className="offer-card" onClick={() => handleOfferClick(offer.id)}>
              <img
                src={`${API_URL}/images/${offer.mainImage}`}
                alt={offer.title}
                className="offer-image"
              />
              <div className="offer-details">
                <div className="offer-header">
                  <h2>{offer.title.length > 50 ? `${offer.title.substring(0, 50)}...` : offer.title}</h2>
                  <span className="offer-price">{offer.price.toLocaleString()} PLN</span>
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

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>{"<"}</button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>{">"}</button>
        </div>
      )}
    </div>
  );
};

export default OfferList;