import React from 'react';
import { Link } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';
import './LegalPages.scss';

/**
 * Terms page component displaying terms and conditions.
 * Minimal version for engineering thesis.
 *
 * @returns {JSX.Element} The rendered TermsPage component
 */
const TermsPage: React.FC = () => {
  useTitle('Regulamin');

  return (
    <div className="legal-page-container">
      <div className="legal-content">
        <div className="legal-header">
          <h1>Regulamin</h1>
        </div>

        <nav className="legal-nav">
          <Link to="/privacy-policy">Polityka prywatności</Link>
        </nav>

        <section className="legal-section">
          <h2>§1. Postanowienia ogólne</h2>
          <ol>
            <li>Niniejszy regulamin określa zasady korzystania z serwisu.</li>
            <li>Korzystanie z serwisu oznacza akceptację regulaminu.</li>
            <li>Serwis umożliwia publikowanie i przeglądanie ogłoszeń.</li>
          </ol>
        </section>

        <section className="legal-section">
          <h2>§2. Rejestracja</h2>
          <ol>
            <li>Rejestracja w serwisie jest bezpłatna.</li>
            <li>Użytkownik zobowiązany jest podać prawdziwe dane.</li>
            <li>Hasło do konta jest poufne.</li>
          </ol>
        </section>

        <section className="legal-section">
          <h2>§3. Ogłoszenia</h2>
          <ol>
            <li>Publikowanie ogłoszeń jest dostępne dla zarejestrowanych użytkowników.</li>
            <li>Zabrania się publikowania treści niezgodnych z prawem.</li>
            <li>Serwis może usunąć ogłoszenia naruszające regulamin.</li>
          </ol>
        </section>

        <section className="legal-section">
          <h2>§4. Odpowiedzialność</h2>
          <ol>
            <li>Serwis nie ponosi odpowiedzialności za treść ogłoszeń.</li>
            <li>Użytkownik korzysta z serwisu na własne ryzyko.</li>
            <li>Serwis nie pośredniczy w transakcjach między użytkownikami.</li>
          </ol>
        </section>

        <section className="legal-section">
          <h2>§5. Dane osobowe</h2>
          <ol>
            <li>Dane osobowe przetwarzane są zgodnie z RODO.</li>
            <li>
              Szczegóły znajdują się w <Link to="/privacy-policy">Polityce Prywatności</Link>.
            </li>
          </ol>
        </section>

        <section className="legal-section">
          <h2>§6. Postanowienia końcowe</h2>
          <ol>
            <li>Serwis zastrzega sobie prawo do zmiany regulaminu.</li>
            <li>W sprawach nieuregulowanych stosuje się przepisy prawa polskiego.</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
