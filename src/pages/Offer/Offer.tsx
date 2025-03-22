import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Offer.scss";

interface CarDetails {
  brand: string;
  model: string;
  year: number;
  color: string;
  displacement: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  driveType: string;
  enginePower: number;
  doors: number;
  seats: number;
}

interface OfferData {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  mainImage: string;
  imageUrls?: string[];
  CarDetailsDto: CarDetails;
}

const Offer: React.FC = () => {
  useTitle("Offer");

  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await axios.get<OfferData>(`http://localhost:8137/api/v1/offers/${id}`);
        setOffer(response.data);

        if (response.data.location) {
          const geocodeResponse = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
              q: response.data.location,
              format: "json",
              limit: 1,
            },
          });

          if (geocodeResponse.data.length > 0) {
            const { lat, lon } = geocodeResponse.data[0];
            setMapLat(parseFloat(lat));
            setMapLng(parseFloat(lon));
          }
        }
      } catch (error) {
        console.error("Error fetching offer:", error);
        setError("Nie udało się załadować oferty.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  useEffect(() => {
    if (mapLat && mapLng && mapRef.current) {
      const map = L.map(mapRef.current).setView([mapLat, mapLng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([mapLat, mapLng]).addTo(map).openPopup();

      return () => {
        map.remove();
      };
    }
  }, [mapLat, mapLng]);

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!offer || !offer.CarDetailsDto) return <p>Brak danych o ofercie.</p>;

  const mainImageUrl = offer.imageUrls && offer.imageUrls.length > 0 ? offer.imageUrls[0] : offer.mainImage;

  return (
    <div className="offer-container">
      <div className="offer-header">
        <img
          src={`http://localhost:8137/images/${mainImageUrl}`}
          alt={offer.title}
          className="main-image"
        />
        <div className="offer-info">
          <h1>{offer.title}</h1>
          <p className="price">
            {offer.price.toLocaleString()} {offer.currency}
          </p>
          <p className="location">📍 {offer.location}</p>

          <div className="contact-details">
            <p>📞 {offer.contactPhone}</p>
            <p>📧 <a href={`mailto:${offer.contactEmail}`}>{offer.contactEmail}</a></p>
          </div>

          <button className="contact-button">Skontaktuj się</button>
        </div>
      </div>

      {offer.imageUrls && offer.imageUrls.length > 0 && (
        <div className="offer-gallery">
          {offer.imageUrls.map((image, index) => (
            <img
              key={index}
              src={`http://localhost:8137/images/${image}`}
              alt={`Car view ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className="offer-details">
        <h2>Opis</h2>
        <p>{offer.description}</p>

        <h2>Szczegóły techniczne</h2>
        <ul>
          <li>🚗 Marka: {offer.CarDetailsDto.brand}</li>
          <li>🔧 Model: {offer.CarDetailsDto.model}</li>
          <li>📅 Rok: {offer.CarDetailsDto.year}</li>
          <li>⛽ Paliwo: {offer.CarDetailsDto.fuelType}</li>
          <li>⚙️ Skrzynia biegów: {offer.CarDetailsDto.transmission}</li>
          <li>🏎️ Moc: {offer.CarDetailsDto.enginePower} KM</li>
          <li>📏 Pojemność: {offer.CarDetailsDto.displacement}</li>
          <li>🚪 Liczba drzwi: {offer.CarDetailsDto.doors}</li>
          <li>🛋️ Liczba miejsc: {offer.CarDetailsDto.seats}</li>
        </ul>
      </div>

      {mapLat && mapLng && (
        <div className="offer-map">
          <h2>Mapa lokalizacji</h2>
          <div ref={mapRef} style={{ height: "400px", width: "100%" }}></div>
        </div>
      )}
    </div>
  );
};

export default Offer;