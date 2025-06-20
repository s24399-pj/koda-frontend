import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import { MiniOffer } from '../../types/miniOfferTypes';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './offerslider.scss';
import { DEFAULT_CAR_IMAGE } from '../../util/constants.tsx';

const API_URL = import.meta.env.VITE_API_URL;

const OfferSlider: React.FC = () => {
  const [offers, setOffers] = useState<MiniOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = DEFAULT_CAR_IMAGE;
      console.warn('Image loading error in slider:', target.src);
    }
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/v1/offers`)
      .then(response => {
        console.log('Data from API:', response.data);
        setOffers(response.data.content || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch offers');
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
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = false;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (Math.abs(e.clientX - startX.current) > 5 || Math.abs(e.clientY - startY.current) > 5) {
      isDragging.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      Math.abs(e.touches[0].clientX - startX.current) > 5 ||
      Math.abs(e.touches[0].clientY - startY.current) > 5
    ) {
      isDragging.current = true;
    }
  };

  const handleClickEnd = (id: string) => {
    if (!isDragging.current) {
      navigate(`/offer/${id}`);
    }
  };

  if (loading) return <div className="offer-slider-loading">Loading offers...</div>;
  if (error) return <div className="offer-slider-error">Error: {error}</div>;
  if (offers.length === 0) return <div className="offer-slider-empty">No offers available</div>;

  return (
    <div className="offer-slider">
      <Slider {...settings}>
        {offers.map(offer => (
          <div
            key={offer.id}
            className="vehicle-card-wrapper"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => handleClickEnd(offer.id)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleClickEnd(offer.id)}
          >
            <div className="vehicle-card">
              <div className="vehicle-image-container">
                <img
                  src={offer.mainImage ? `${API_URL}${offer.mainImage}` : DEFAULT_CAR_IMAGE}
                  alt={offer.title}
                  className="vehicle-image"
                  onError={handleImageError}
                />
              </div>
              <div className="vehicle-details">
                <h3>
                  {offer.title.length > 15 ? offer.title.substring(0, 15) + '...' : offer.title}
                </h3>
                <p>
                  {offer.year} | {offer.mileage} km
                </p>
                <p>
                  {offer.enginePower} KM | {offer.displacement}
                </p>
                <p>
                  <strong>{offer.price.toLocaleString()} PLN</strong>
                </p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default OfferSlider;
