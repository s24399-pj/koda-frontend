import React from 'react';
import { Link } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';
import './LegalPages.scss';

/**
 * Privacy Policy page component.
 * Minimal version for engineering thesis.
 *
 * @returns {JSX.Element} The rendered PrivacyPolicyPage component
 */
const PrivacyPolicyPage: React.FC = () => {
  useTitle('Polityka Prywatności');

  return (
    <div className="legal-page-container">
      <div className="legal-content">
        <div className="legal-header">
          <h1>Polityka Prywatności</h1>
        </div>

        <nav className="legal-nav">
          <Link to="/terms">Regulamin</Link>
        </nav>

        <section className="legal-section">
          <h2>1. Informacje ogólne</h2>
          <p>
            Niniejsza polityka prywatności opisuje zasady przetwarzania danych osobowych
            użytkowników serwisu.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Zbierane dane</h2>
          <p>Zbieramy następujące dane:</p>
          <ul>
            <li>Imię i nazwisko</li>
            <li>Adres e-mail</li>
            <li>Numer telefonu</li>
            <li>Dane zawarte w ogłoszeniach</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Cel przetwarzania</h2>
          <p>Dane przetwarzane są w celu:</p>
          <ul>
            <li>Świadczenia usług serwisu</li>
            <li>Kontaktu z użytkownikami</li>
            <li>Zapewnienia bezpieczeństwa</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Podstawa prawna</h2>
          <p>
            Przetwarzamy dane na podstawie zgody użytkownika oraz w celu wykonania umowy o
            świadczenie usług.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Prawa użytkownika</h2>
          <p>Użytkownik ma prawo do:</p>
          <ul>
            <li>Dostępu do swoich danych</li>
            <li>Sprostowania danych</li>
            <li>Usunięcia danych</li>
            <li>Ograniczenia przetwarzania</li>
            <li>Przenoszenia danych</li>
            <li>Wniesienia sprzeciwu</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Pliki cookies</h2>
          <p>
            Serwis wykorzystuje pliki cookies w celu prawidłowego działania oraz analizy ruchu.
            Możesz zarządzać cookies w ustawieniach przeglądarki.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Bezpieczeństwo</h2>
          <p>
            Stosujemy odpowiednie zabezpieczenia techniczne i organizacyjne w celu ochrony danych
            osobowych.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Kontakt</h2>
          <p>
            W sprawach związanych z ochroną danych osobowych prosimy o kontakt przez formularz
            kontaktowy w serwisie.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
