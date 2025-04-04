import SimpleSearch from "../../components/SimpleSearch/SimpleSearch";
import useTitle from "../../hooks/useTitle";
import WhyChooseUs from "../../components/WhyChooseUs/WhyChooseUs";
import OfferSlider from "../../components/OfferSlider/OfferSlider";
import carImage from "../../assets/images/car_home.png";
import "./HomePage.scss";

const HomePage = () => {
  useTitle("Home");

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        {/* Left side text */}
        <div className="homepage-text">
          <h1>
            Znajdź swój wymarzony <span>samochód</span>
          </h1>
          <h2>
            Kupuj i sprzedawaj bez tajemnic – samochody, którym możesz zaufać
          </h2>
        </div>

        {/* Right side car image */}
        <div className="car-image-container">
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