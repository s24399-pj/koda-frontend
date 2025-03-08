import React from "react";
import "./SimpleSearch.css";

const SimpleSearch = () => {
  return (
    <div className="simple-search-wrapper">
      <form className="simple-search-box">
        <div className="simple-search-group">
          <label htmlFor="marka">Marka</label>
          <select id="marka" name="marka">
            <option value="">Wybierz markę</option>
            {/* Add options dynamically */}
          </select>
        </div>

        <div className="simple-search-group">
          <label htmlFor="model">Model</label>
          <select id="model" name="model">
            <option value="">Wybierz model</option>
            {/* Add options dynamically */}
          </select>
        </div>

        <div className="simple-search-group">
          <label htmlFor="lokalizacja">Lokalizacja</label>
          <select id="lokalizacja" name="lokalizacja">
            <option value="">Znajdź dogodną lokalizację</option>
            {/* Add options dynamically */}
          </select>
        </div>

        <button type="submit" className="simple-search-button">Szukaj</button>
      </form>
    </div>
  );
};

export default SimpleSearch;
