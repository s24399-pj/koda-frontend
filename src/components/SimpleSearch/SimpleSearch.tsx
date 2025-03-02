import React from "react";
import "./SimpleSearch.css"; // Import the updated CSS file

const SimpleSearch = () => {
  return (
    <div className="simple-search-wrapper">
      <form className="simple-search-form">
        <div>
          <label htmlFor="marka">Marka</label>
          <select id="marka" name="marka">
            <option value="">Wybierz markę</option>
            {/* Add options here */}
          </select>
        </div>

        <div>
          <label htmlFor="model">Model</label>
          <select id="model" name="model">
            <option value="">Wybierz model</option>
            {/* Add options here */}
          </select>
        </div>

        <div>
          <label htmlFor="lokalizacja">Lokalizacja</label>
          <select id="lokalizacja" name="lokalizacja">
            <option value="">Wybierz lokalizację</option>
            {/* Add options here */}
          </select>
        </div>

        <button type="submit">Szukaj</button>
      </form>
    </div>
  );
};

export default SimpleSearch;
