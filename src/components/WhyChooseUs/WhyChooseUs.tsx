import React from "react";
import "./WhyChooseUs.css";
import { FaLock, FaUserCheck, FaClock, FaInfoCircle } from "react-icons/fa";

const WhyChooseUs: React.FC = () => {
  return (
    <section className="why-choose-us">

      <div className="content">
        <button className="cta-button">DLACZEGO WARTO WYBRAĆ NAS</button>
        <h2>Jakość usług i pełna transparentność idą u nas w parze</h2>

        {/* Feature List */}
        <div className="features">
          <div className="feature-item">
            <FaLock className="icon" />
            <div>
              <h3>Najniższa cena</h3>
              <p>Wystaw ogłoszenie i wypromuj je za najniższą cenę na rynku</p>
            </div>
          </div>

          <div className="feature-item">
            <FaUserCheck className="icon" />
            <div>
              <h3>Wyłącznie zweryfikowani sprzedawcy</h3>
              <p>Weryfikujemy sprzedawców korzystających z naszych usług</p>
            </div>
          </div>

          <div className="feature-item">
            <FaClock className="icon" />
            <div>
              <h3>Wsparcie techniczne 24/7</h3>
              <p>Wspieramy cię w każdej chwili</p>
            </div>
          </div>

          <div className="feature-item">
            <FaInfoCircle className="icon" />
            <div>
              <h3>Pełna transparentność</h3>
              <p>Wszystkie najważniejsze informacje na temat samochodu są zawarte w ogłoszeniach</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;