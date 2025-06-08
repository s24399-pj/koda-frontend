import './Footer.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section brand">
            <div className="logo">
              <h2>KODA</h2>
              <p className="tagline">Twój zaufany partner</p>
            </div>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>

          <div className="footer-section links">
            <h3>Nawigacja</h3>
            <ul>
              <li>
                <a href="#">Nasze Produkty</a>
              </li>
              <li>
                <a href="#">Zasoby</a>
              </li>
              <li>
                <a href="#">Dowiedz się więcej</a>
              </li>
              <li>
                <a href="#">Obserwuj</a>
              </li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h3>Kontakt</h3>
            <ul>
              <li>
                <i className="fas fa-phone"></i>
                <a href="tel:+48123123123" className="mobile-tap">
                  +48 123 123 123
                </a>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:kontakt@koda.com" className="mobile-tap">
                  kontakt@koda.com
                </a>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Targ Drzewny 9/11, 80-894 Gdańsk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>Copyright © {currentYear} ・ Koda, All Rights Reserved</p>
          </div>
          <div className="footer-links">
            <a href="#">Polityka prywatności</a>
            <a href="#">Warunki korzystania</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
