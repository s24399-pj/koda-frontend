import SimpleSearch from '../../components/SimpleSearch/SimpleSearch';
import useTitle from '../../hooks/useTitle';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import OfferSlider from '../../components/OfferSlider/OfferSlider';
import carImage from '../../assets/images/car_home.png';
import './HomePage.scss';
import { useState, useEffect } from 'react';

const HomePage = () => {
  useTitle('Home');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
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

      <SimpleSearch />
      <WhyChooseUs />
      <OfferSlider />
    </div>
  );
};

export default HomePage;
