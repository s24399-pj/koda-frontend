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
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/v1/offers`)
      .then(response => {
        setOffers(response.data.content);
      })
      .catch(error => {
        console.error('Błąd podczas pobierania danych:', error);
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
  };

  const handleOfferClick = (id: string) => {
    navigate(`/offer/${id}`);
  };

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