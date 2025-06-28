/**
 * Component for displaying a carousel of vehicle offers
 * @module components/home/OfferSlider
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { MiniOffer } from '../../types/miniOfferTypes';
import { getAllOffers } from '../../api/offerApi';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './offerslider.scss';
import { DEFAULT_CAR_IMAGE } from '../../util/constants.tsx';

/** Base API URL from environment variables */
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Responsive carousel component for displaying vehicle offers on the homepage
 * @component
 * @returns {JSX.Element} The OfferSlider component
 */
const OfferSlider: React.FC = () => {
  /** Array of offers to display in the slider */
  const [offers, setOffers] = useState<MiniOffer[]>([]);
  /** Loading state for data fetching */
  const [loading, setLoading] = useState(true);
  /** Error state for data fetching */
  const [error, setError] = useState<string | null>(null);
  /** Navigation hook for redirecting to offer details */
  const navigate = useNavigate();

  /** Flag to track if user is dragging (to prevent navigation on drag) */
  const isDragging = useRef(false);
  /** Starting X coordinate for drag detection */
  const startX = useRef(0);
  /** Starting Y coordinate for drag detection */
  const startY = useRef(0);

  /**
   * Handles image loading errors by replacing with default image
   * @function handleImageError
   * @param {React.SyntheticEvent<HTMLImageElement>} event - Image error event
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.dataset.errorHandled) {
      target.dataset.errorHandled = 'true';
      target.src = DEFAULT_CAR_IMAGE;
      console.warn('Image loading error in slider:', target.src);
    }
  };

  /**
   * Fetches all offers on component mount
   */
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const data = await getAllOffers();
        console.log('Data from API:', data);
        setOffers(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  /**
   * Configuration for the react-slick carousel
   * @type {Object}
   */
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

  /**
   * Initializes drag tracking on mouse down
   * @function handleMouseDown
   * @param {React.MouseEvent} e - Mouse down event
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  /**
   * Initializes drag tracking on touch start
   * @function handleTouchStart
   * @param {React.TouchEvent} e - Touch start event
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = false;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  /**
   * Updates drag state on mouse move
   * @function handleMouseMove
   * @param {React.MouseEvent} e - Mouse move event
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (Math.abs(e.clientX - startX.current) > 5 || Math.abs(e.clientY - startY.current) > 5) {
      isDragging.current = true;
    }
  };

  /**
   * Updates drag state on touch move
   * @function handleTouchMove
   * @param {React.TouchEvent} e - Touch move event
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      Math.abs(e.touches[0].clientX - startX.current) > 5 ||
      Math.abs(e.touches[0].clientY - startY.current) > 5
    ) {
      isDragging.current = true;
    }
  };

  /**
   * Navigates to offer details if not dragging
   * @function handleClickEnd
   * @param {string} id - Offer ID to navigate to
   */
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