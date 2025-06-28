import { useState, useEffect } from 'react';
import SimpleSearch from '../../components/SimpleSearch/SimpleSearch';
import useTitle from '../../hooks/useTitle';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import OfferSlider from '../../components/OfferSlider/OfferSlider';
import carImage from '../../assets/images/car_home.png';
import './HomePage.scss';

/**
 * Renders the landing page with dynamic content based on screen size.
 * Includes hero text, an image, a search component, a feature section,
 * and a slider for featured offers.
 *
 * @component
 */
const HomePage = () => {
  useTitle('Home');

  /**
   * Determines if the current screen size is considered mobile.
   */
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  /**
   * Sets up a resize listener to update the isMobile state.
   */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <div className="homepage-text">
          <h1>
            Znajdź swój wymarzony <span>samochód</span>
          </h1>
          <h2>Kupuj i sprzedawaj bez tajemnic – samochody, którym możesz zaufać</h2>
        </div>

        <div className={`car-image-container ${isMobile ? 'mobile' : ''}`}>
          <img className="car-image-home" src={carImage} alt="Car" />
        </div>
      </div>

      {/* Search bar component */}
      <SimpleSearch />

      {/* Section explaining service advantages */}
      <WhyChooseUs />

      {/* Featured offer slider */}
      <OfferSlider />
    </div>
  );
};

export default HomePage;
