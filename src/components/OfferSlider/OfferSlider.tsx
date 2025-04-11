import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import { MiniOffer } from '../../types/miniOfferTypes';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./offerslider.scss";

const API_URL = import.meta.env.VITE_API_URL;

const OfferSlider: React.FC = () => {
  const [offers, setOffers] = useState<MiniOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/v1/offers`)
        .then(response => {
          console.log('Dane z API:', response.data); // Dodano do debugowania
          setOffers(response.data.content || []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Błąd podczas pobierania danych:', error);
          setError('Nie udało się pobrać ofert');
          setLoading(false);
        });
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <button className="slick-prev" />,
    nextArrow: <button className="slick-next" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const handleOfferClick = (id: string) => {
    navigate(`/offer/${id}`);
  };

  if (loading) return <div className="offer-slider-loading">Ładowanie ofert...</div>;
  if (error) return <div className="offer-slider-error">Błąd: {error}</div>;
  if (offers.length === 0) return <div className="offer-slider-empty">Brak dostępnych ofert</div>;

  return (
      <div className="offer-slider">
        <Slider {...settings}>
          {offers.map(offer => (
              <div key={offer.id} className="vehicle-card-wrapper" onClick={() => handleOfferClick(offer.id)}>
                <div className="vehicle-card">
                  <div className="vehicle-image-container">
                    <img
                        src={`${API_URL}/images/${offer.mainImage}`}
                        alt={offer.title}
                        className="vehicle-image"
                    />
                  </div>
                  <div className="vehicle-details">
                    <h3>{offer.title.length > 15 ? offer.title.substring(0, 15) + '...' : offer.title}</h3>
                    <p>{offer.year} | {offer.mileage} km</p>
                    <p>{offer.enginePower} KM | {offer.displacement}</p>
                    <p><strong>{offer.price.toLocaleString()} PLN</strong></p>
                  </div>
                </div>
              </div>
          ))}
        </Slider>
      </div>
  );
};

export default OfferSlider;