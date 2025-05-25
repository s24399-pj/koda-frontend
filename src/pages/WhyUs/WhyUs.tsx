import React from "react";
import "./WhyUs.scss";

import GovFormImg from "../../assets/images/wpisz_dane_pojazdu.webp";
import GovHistoryImg from "../../assets/images/historia_pojazdu.webp";
import useTitle from "../../hooks/useTitle";

const WhyUs: React.FC = () => {
  useTitle("Dlaczego My");

  return (
      <div className="why-us-page">
        <h1>Dlaczego warto wybrać nas?</h1>

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

        <section>
          <h2>Nowoczesne i użyteczne narzędzia</h2>
          <p>
            Nasz serwis to coś więcej niż katalog ogłoszeń. Oferujemy rozbudowaną porównywarkę samochodów, która pozwala łatwo zestawić ze sobą różne oferty, ich parametry techniczne oraz historię. Dzięki intuicyjnym filtrom znajdziesz dokładnie to, czego szukasz – bez przeszukiwania setek niepasujących ogłoszeń.
          </p>
        </section>

        <section>
          <h2>Bezpośredni kontakt między kupującym, a sprzedającym</h2>
          <p>
            Wbudowany czat – szybka i wygodna komunikacja bezpośrednio w obrębie platformy. Bez potrzeby dzwonienia czy udostępniania prywatnych danych. Szybko, wygodnie i bezpiecznie.
          </p>
        </section>

        <section className="security-section">
          <h2>Bezpieczeństwo na pierwszym miejscu</h2>
          <div className="security-features">
            <div className="security-item">
              <h3>🛡️ System ocen i opinii</h3>
              <p>Każdy sprzedawca ma swój profil z ocenami od poprzednich kupujących. Dzięki temu możesz łatwo sprawdzić wiarygodność osoby, z którą chcesz przeprowadzić transakcję.</p>
            </div>
            <div className="security-item">
              <h3>🔒 Ochrona danych osobowych</h3>
              <p>Twoje dane są bezpieczne dzięki szyfrowanej komunikacji (HTTPS) i zgodności z RODO. Nie musisz udostępniać swojego numeru telefonu – wszystko odbywa się przez bezpieczny czat.</p>
            </div>
            <div className="security-item">
              <h3>⚠️ Weryfikacja ogłoszeń</h3>
              <p>Naszy administratorzy aktywnie moderują treści, usuwając podejrzane ogłoszenia i blokując nieuczciwe konta.</p>
            </div>
            <div className="security-item">
              <h3>📋 Wymagane dane pojazdu</h3>
              <p>Każde ogłoszenie wymaga podania kluczowych informacji jak numer VIN, przebieg czy rok produkcji. To zapewnia wiarygodność ofert i ułatwia weryfikację historii pojazdu.</p>
            </div>
          </div>
        </section>

        <section className="innovation-section">
          <h2>Innowacyjne funkcje</h2>
          <div className="innovation-grid">
            <div className="innovation-item">
              <h3>📊 Historia cen pojazdu</h3>
              <p>Zobacz, jak zmieniała się cena konkretnego samochodu w czasie. To pomoże Ci ocenić, czy obecna cena jest uczciwa, czy warto jeszcze poczekać.</p>
            </div>
            <div className="innovation-item">
              <h3>💾 Lista zapisanych ofert</h3>
              <p>Zapisuj interesujące Cię ogłoszenia i wracaj do nich później. Twoja lista jest zawsze dostępna w profilu użytkownika.</p>
            </div>
            <div className="innovation-item">
              <h3>📈 Licznik wyświetleń</h3>
              <p>Jeśli sprzedajesz samochód, zobacz ile osób obejrzało Twoje ogłoszenie. To pomoże Ci ocenić zainteresowanie i ewentualnie dostosować cenę.</p>
            </div>
          </div>
        </section>

        <section className="user-experience-section">
          <h2>Doświadczenie użytkownika</h2>
          <div className="ux-features">
            <div className="ux-item">
              <h3>📱 Pełna responsywność</h3>
              <p>Nasza platforma działa płynnie na wszystkich urządzeniach – od smartfona po komputer stacjonarny. Interfejs automatycznie dostosowuje się do rozmiaru ekranu.</p>
            </div>
            <div className="ux-item">
              <h3>⚡ Szybkość działania</h3>
              <p>Strony ładują się w mniej niż 3 sekundy, a wyszukiwanie działa w czasie rzeczywistym. Ne musisz czekać – wyniki pojawiają się natychmiast.</p>
            </div>
            <div className="ux-item">
              <h3>🎯 Zaawansowane filtry</h3>
              <p>Filtruj oferty według marki, modelu, roku produkcji, przebiegu, ceny, lokalizacji i wielu innych kryteriów. Znajdź dokładnie to, czego szukasz.</p>
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

        <section className="mission-section">
          <h2>Nasza misja</h2>
          <p>
            Chcemy demokratyzować rynek motoryzacyjny w Polsce. Wierzymy, że kupno i sprzedaż samochodu powinny być
            procesami prostymi, bezpiecznymi i przejrzystymi dla wszystkich uczestników. Dlatego tworzymy narzędzia,
            które wyrównują szanse i dają każdemu dostęp do pełnej informacji o pojeździe – bez ukrytych kosztów
            i nieprzejrzystych praktyk.
          </p>
        </section>

        <section className="future-section">
          <h2>Patrzymy w przyszłość</h2>
          <p>
            Nasza platforma jest zaprojektowana z myślą o przyszłości. Planujemy integrację z dodatkowymi źródłami danych,
            rozwijanie funkcji AI do lepszego dopasowywania ofert oraz wprowadzenie nowych narzędzi ułatwiających
            proces decyzyjny. Słuchamy głosu naszych użytkowników i stale ulepszamy serwis.
          </p>
        </section>
      </div>
  );
};

export default WhyUs;