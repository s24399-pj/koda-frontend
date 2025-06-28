/**
 * Component for displaying the "Why Choose Us" section highlighting platform benefits
 * @module components/home/WhyChooseUs
 */

import React from 'react';
import './WhyChooseUs.scss';
import { FaLock, FaInfoCircle, FaSearch, FaComments, FaShieldAlt, FaMobile } from 'react-icons/fa';

/**
 * Component that showcases the key features and benefits of the platform
 * Each feature is presented with an icon, title, and description
 * @component
 * @returns {JSX.Element} The WhyChooseUs component
 */
const WhyChooseUs: React.FC = () => {
  return (
    <section className="why-choose-us">
      <div className="content">
        <div className="cta-button">DLACZEGO WARTO WYBRAĆ NAS</div>
        <h2>Nowoczesna platforma z pełną transparentością i bezpieczeństwem</h2>
        <div className="features">
          {/* Advanced car comparison feature */}
          <div className="feature-item">
            <FaSearch className="icon" />
            <div>
              <h3>Zaawansowana porównywarka samochodów</h3>
              <p>
                Rozbudowane narzędzia do porównywania ofert, parametrów technicznych i historii
                pojazdów. Intuicyjne filtry pomogą znaleźć dokładnie to, czego szukasz.
              </p>
            </div>
          </div>
          
          {/* Direct chat communication feature */}
          <div className="feature-item">
            <FaComments className="icon" />
            <div>
              <h3>Bezpośredni kontakt przez wbudowany czat</h3>
              <p>
                Szybka i bezpieczna komunikacja bezpośrednio na platformie. Bez dzwonienia czy
                udostępniania prywatnych danych.
              </p>
            </div>
          </div>
          
          {/* Rating system and listing verification feature */}
          <div className="feature-item">
            <FaShieldAlt className="icon" />
            <div>
              <h3>System ocen i weryfikacja ogłoszeń</h3>
              <p>
                Każdy sprzedawca ma profil z ocenami. Moderacja treści i wymagane dane pojazdu (VIN,
                przebieg) zapewniają wiarygodność ofert.
              </p>
            </div>
          </div>
          
          {/* Data protection and encrypted communication feature */}
          <div className="feature-item">
            <FaLock className="icon" />
            <div>
              <h3>Ochrona danych i szyfrowana komunikacja</h3>
              <p>
                HTTPS i zgodność z RODO gwarantują bezpieczeństwo Twoich danych. Wszystko przez
                bezpieczny czat.
              </p>
            </div>
          </div>
          
          {/* Speed and responsiveness feature */}
          <div className="feature-item">
            <FaMobile className="icon" />
            <div>
              <h3>Szybkość i responsywność</h3>
              <p>
                Platforma działa płynnie na wszystkich urządzeniach. Strony ładują się w mniej niż 3
                sekundy, wyniki wyszukiwania w czasie rzeczywistym.
              </p>
            </div>
          </div>
          
          {/* Lowest price and full transparency feature */}
          <div className="feature-item">
            <FaInfoCircle className="icon" />
            <div>
              <h3>Najniższa cena i pełna transparentność</h3>
              <p>
                Wypromuj ogłoszenie za najniższą cenę na rynku. Wszystkie kluczowe informacje o
                samochodzie w każdym ogłoszeniu.
              </p>
            </div>
          </div>
        </div>
        
        {/* Company mission statement */}
        <div className="mission-statement">
          <h3>Nasza misja</h3>
          <p>
            Demokratyzujemy rynek motoryzacyjny w Polsce. Kupno i sprzedaż samochodu powinny być
            prostymi, bezpiecznymi i przejrzystymi procesami dla wszystkich uczestników.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;