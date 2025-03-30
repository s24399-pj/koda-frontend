import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.scss";
import carNotFound from "../../assets/images/car_not_found.png";

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <img src={carNotFound} alt="Car Not Found" className="not-found-image" />
      <h1>404 - Strona nie znaleziona</h1>
      <p>Ups! Wygląda na to, że zabłądziłeś. Wracamy do strony głównej?</p>
      <Link to="/" className="back-home-button">Powrót do strony głównej</Link>
    </div>
  );
};

export default NotFound;