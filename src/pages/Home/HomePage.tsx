import React from "react";
import carImage from "../../assets/images/skoda_fabia.png";
import "./HomePage.css";
import SimpleSearch from "../../components/SimpleSearch/SimpleSearch";
import useTitle from "../../hooks/useTitle"; // Ensure you are importing the hook
import WhyChooseUs from "../../components/WhyChooseUs/WhyChooseUs";

const HomePage = () => {
  useTitle("Home"); // This sets the title of the page

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
          <img className="car-image" src={carImage} alt="Fabia" />
        </div>
      </div>

      {/* SimpleSearch below text and car image */}
      <SimpleSearch />
      <WhyChooseUs />
    </div>
  );
};

export default HomePage;
