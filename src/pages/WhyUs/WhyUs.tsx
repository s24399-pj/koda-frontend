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
        <h2>Bezpośredni kontakt między kupującym a sprzedającym</h2>
        <p>
          Wbudowany czat działa tak, jak znane już i lubiane rozwiązania z OLX czy Allegro Lokalnie – szybka i wygodna komunikacja bezpośrednio w obrębie platformy. Bez potrzeby dzwonienia czy udostępniania prywatnych danych. Szybko, wygodnie i bezpiecznie.
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
                <td>Szybki, wbudowany – jak OLX</td>
                <td>Często brak komunikatora</td>
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
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default WhyUs;