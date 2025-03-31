import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SimpleSearch.scss";

const API_URL = import.meta.env.VITE_API_URL;

const SimpleSearch = () => {
  const navigate = useNavigate();
  const [phrase, setPhrase] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const formatNumber = (value: string) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const cleanNumber = (value: string) => {
    return value.replace(/\s/g, "");
  };

  useEffect(() => {
    if (phrase.length >= 2) {
      axios
        .get(`${API_URL}/api/v1/offers/find`, { params: { phrase } })
        .then((response) => setSuggestions(response.data))
        .catch((error) => console.error("Błąd pobierania sugestii:", error));
    } else {
      setSuggestions([]);
    }
  }, [phrase]);

  const handleSuggestionClick = (suggestion: string) => {
    setPhrase(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phrase.trim() !== "") {
      const finalMinPrice = cleanNumber(minPrice);
      const finalMaxPrice = cleanNumber(maxPrice);
      navigate(`/offers?phrase=${encodeURIComponent(phrase)}&minPrice=${finalMinPrice}&maxPrice=${finalMaxPrice}`);
    }
  };

  return (
    <div className="simple-search-wrapper">
      <form className="simple-search-box" onSubmit={handleSubmit}>
        <div className="simple-search-group">
          <label htmlFor="marka">Szukaj</label>
          <input
            type="text"
            id="marka"
            name="phrase"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Wpisz markę lub model"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((suggestion) => (
                <li key={suggestion} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="simple-search-group">
          <label htmlFor="minPrice">Minimalna cena</label>
          <input
            type="text"
            id="minPrice"
            name="minPrice"
            value={minPrice}
            onChange={(e) => setMinPrice(formatNumber(e.target.value))}
            placeholder="Wpisz minimalną cenę"
          />
        </div>
        <div className="simple-search-group">
          <label htmlFor="maxPrice">Maksymalna cena</label>
          <input
            type="text"
            id="maxPrice"
            name="maxPrice"
            value={maxPrice}
            onChange={(e) => setMaxPrice(formatNumber(e.target.value))}
            placeholder="Wpisz maksymalną cenę"
          />
        </div>
        <button type="submit" className="simple-search-button">Szukaj</button>
      </form>
    </div>
  );
};

export default SimpleSearch;