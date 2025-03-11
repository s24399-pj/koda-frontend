import "./MostViewed.scss";
import audi from "../../assets/images/audi_home.png";
import ferrari from "../../assets/images/ferrari_home.png";
import bmw from "../../assets/images/bmw_home.png";
import ford from "../../assets/images/ford_home.png";

const cars = [
  {
    id: 1,
    name: "Audi TT",
    image: audi,
    passengers: "4 Osobowy",
    transmission: "Automat",
    airConditioning: "Klimatyzacja",
    doors: "2 Drzwi",
    price: "50,000 PLN",
  },
  {
    id: 2,
    name: "Ferrari F12",
    image: ferrari,
    passengers: "2 Osobowy",
    transmission: "Automat",
    airConditioning: "Klimatyzacja",
    doors: "2 Drzwi",
    price: "1,550,000 PLN",
  },
  {
    id: 3,
    name: "BMW M3",
    image: bmw,
    passengers: "4 Osobowy",
    transmission: "Automat",
    airConditioning: "Klimatyzacja",
    doors: "4 Drzwi",
    price: "350,000 PLN",
  },
  {
    id: 4,
    name: "Ford Mondeo",
    image: ford,
    passengers: "5 Osobowy",
    transmission: "Automat",
    airConditioning: "Klimatyzacja",
    doors: "4 Drzwi",
    price: "100,000 PLN",
  },
];

const MostViewedCars = () => {
  return (
    <div className="most-viewed-container">
      <span className="section-tag">Popularne</span>
      <h2 className="section-title">Oferty na czasie</h2>
      <div className="cars-list">
        {cars.map((car) => (
          <div key={car.id} className="car-card">
            <img src={car.image} alt={car.name} className="car-image" />
            <h3 className="car-name">{car.name}</h3>
            <div className="car-details">
              <span>👤 {car.passengers}</span>
              <span>⚙️ {car.transmission}</span>
              <span>❄️ {car.airConditioning}</span>
              <span>🚪 {car.doors}</span>
            </div>
            <p className="car-price">
              <strong>{car.price}</strong>
            </p>
            <button className="buy-button">Zobacz</button>
          </div>
        ))}
      </div>
      <button className="view-all-button">Pokaż wszystkie oferty →</button>
    </div>
  );
};

export default MostViewedCars;