import React from "react";
import "./WhyUs.scss";

import GovFormImg from "../../assets/images/wpisz_dane_pojazdu.webp";
import GovHistoryImg from "../../assets/images/historia_pojazdu.webp";
import useTitle from "../../hooks/useTitle";

const WhyUs: React.FC = () => {
  useTitle("Dlaczego My");

  return (
      <div className="why-us-page">
        <h1>Nie daj się oszukać - z nami to niemożliwe!</h1>

        <section>
          <h2>Transparentność</h2>
          <p>
            Większość platform oferuje odpłatny dostęp do raportów historii pojazdu – czasem nawet za 80 zł!
            W rzeczywistości te dane można pobrać bezpłatnie z oficjalnej strony rządowej:{" "}
            <a
                href="https://historiapojazdu.gov.pl"
                target="_blank"
                rel="noopener noreferrer"
            >
              historiapojazdu.gov.pl
            </a>
            . My nie pobieramy za to opłat i nie ukrywamy źródeł.
          </p>
        </section>

        <section className="screenshot-section">
          <h2>Sprawdź to sam</h2>
          <div className="screenshot-wrapper">
            <div className="screenshot">
              <img src={GovFormImg} alt="Formularz do sprawdzenia historii pojazdu" />
              <p>Formularz ze strony historiapojazdu.gov.pl</p>
            </div>
            <div className="screenshot">
              <img src={GovHistoryImg} alt="Przykładowa historia pojazdu" />
              <p>Przykładowa historia pojazdu</p>
            </div>
          </div>
        </section>

        <section className="education-section">
          <h2>Edukacja i bezpieczeństwo w cyfrowym handlu samochodami</h2>

          <div className="education-content">
            <div className="safety-tips">
              <h3>Jak bezpiecznie kupować samochody online?</h3>
              <p>
                Wraz z rozwojem cyfrowych platform handlowych rośnie również ryzyko oszustw.
                Według danych CERT Orange, phishing stanowi aż 40% wszystkich incydentów bezpieczeństwa.
                W handlu samochodami najpopularniejszą metodą oszustwa jest wyłudzanie zaliczek za nieistniejące pojazdy.
              </p>

              <div className="safety-guidelines">
                <h4>Nasze zasady bezpieczeństwa:</h4>
                <ul>
                  <li><strong>Weryfikacja tożsamości</strong> - każdy sprzedawca musi przejść proces weryfikacji</li>
                  <li><strong>Integracja z CEPiK</strong> - automatyczne sprawdzanie danych pojazdu w rządowych bazach</li>
                  <li><strong>System ocen</strong> - przejrzysty system opinii o sprzedawcach</li>
                  <li><strong>Bezpieczne płatności</strong> - zabezpieczone metody płatności z możliwością zwrotu</li>
                </ul>
              </div>
            </div>

            <div className="digital-inclusion">
              <h3>Dostępność dla wszystkich</h3>
              <p>
                Zdajemy sobie sprawę z problemu wykluczenia cyfrowego, szczególnie wśród osób starszych.
                Dlatego projektujemy naszą platformę z myślą o intuicyjności i przystępności dla wszystkich użytkowników,
                niezależnie od ich doświadczenia z technologią.
              </p>

              <div className="accessibility-features">
                <h4>Nasze rozwiązania dostępności:</h4>
                <ul>
                  <li><strong>Prosty interface</strong> - czytelny design bez zbędnych komplikacji</li>
                  <li><strong>Wsparcie telefoniczne</strong> - możliwość kontaktu dla osób preferujących rozmowę</li>
                  <li><strong>Przewodniki krok po kroku</strong> - szczegółowe instrukcje dla każdego procesu</li>
                  <li><strong>Alternatywne kanały</strong> - utrzymujemy możliwość kontaktu poza platformą</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="social-impact-section">
          <h2>Wpływ społeczny i dostępność</h2>
          <p>
            Wierzymy, że każdy powinien mieć równy dostęp do rynku motoryzacyjnego. Dlatego nasze podstawowe funkcje są darmowe,
            a interfejs jest intuicyjny i przystępny również dla osób starszych czy mniej zaznajomionych z technologią.
            Wspieramy również polskie źródła danych, integrując się z rządowymi bazami jak CEPiK.
          </p>
        </section>

        <section className="market-trends-section">
          <h2>Trendy w cyfryzacji handlu samochodami</h2>
          <p>
            Współczesny rynek motoryzacyjny przechodzi przez dynamiczną transformację cyfrową.
            Według najnowszych danych, 42% przedsiębiorców rozpoczyna poszukiwanie samochodu od stron internetowych dealerów,
            podczas gdy tylko 23% zaczyna od wizyty w tradycyjnym salonie.
            To pokazuje, jak internet stał się pierwszym punktem kontaktu z ofertą motoryzacyjną.
          </p>

          <div className="trend-stats">
            <div className="stat-item">
              <span className="stat-number">52%</span>
              <span className="stat-description">małych i średnich przedsiębiorstw jest zainteresowanych całkowitym zakupem online</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">28%</span>
              <span className="stat-description">firm chce dokonać transakcji bez wychodzenia z biura</span>
            </div>
          </div>
        </section>

        <section>
          <h2>Jak wypadamy na tle konkurencji?</h2>
          <div className="comparison-table">
            <table>
              <thead>
              <tr>
                <th>Funkcja</th>
                <th>Nasza platforma</th>
                <th>Inne serwisy</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>Dostęp do historii pojazdu</td>
                <td>Bezpłatny, ze źródeł rządowych</td>
                <td>Często płatny, nawet 50–80 zł</td>
              </tr>
              <tr>
                <td>Porównywarka ofert</td>
                <td>Zaawansowana i przejrzysta</td>
                <td>Brak lub bardzo ograniczona</td>
              </tr>
              <tr>
                <td>Kontakt przez czat</td>
                <td>Szybki, wbudowany</td>
                <td>Często brak komunikatora</td>
              </tr>
              <tr>
                <td>Historia cen pojazdu</td>
                <td>Tak, bezpłatnie</td>
                <td>Rzadko dostępne</td>
              </tr>
              <tr>
                <td>System ocen sprzedawców</td>
                <td>Tak, przejrzysty system opinii</td>
                <td>Ograniczony lub brak</td>
              </tr>
              <tr>
                <td>Wymagane dane pojazdu</td>
                <td>Tak, obowiązkowe VIN i kluczowe parametry</td>
                <td>Często opcjonalne lub niepełne</td>
              </tr>
              <tr>
                <td>Ukryte koszty</td>
                <td>Brak – pełna transparentność</td>
                <td>Obecne (np. raporty, wyróżnienia)</td>
              </tr>
              <tr>
                <td>Skupienie na użytkowniku</td>
                <td>Tak – stawiamy na wygodę kupującego</td>
                <td>Głównie korzyści dla ogłoszeniodawców</td>
              </tr>
              <tr>
                <td>Responsywność na urządzeniach mobilnych</td>
                <td>Pełna optymalizacja</td>
                <td>Często ograniczona funkcjonalność</td>
              </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
  );
};

export default WhyUs;