import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-newsletter">
          <h4 className="newsletter-titre">LA NEWSLETTER :</h4>
          <div className="newsletter-form">
            <input type="email" placeholder="Ton adresse mail ici" />
            <button className="newsletter-btn" aria-label="S'inscrire">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="footer-nav">
          <div className="footer-col">
            <h5>NOS SERVICES</h5>
            <Link to="/menage-rapide">Essentiel</Link>
            <Link to="/menage-regulier">Sérénité</Link>
            <Link to="/grand-menage">Intégral</Link>
            <Link to="/comparer-offres">Comparer les offres</Link>
          </div>
          <div className="footer-col">
            <h5>ENTREPRISE</h5>
            <a href="#">À propos</a>
            <a href="#">Devenir pro</a>
            <a href="#">Carrières</a>
            <a href="#">Blog</a>
          </div>
          <div className="footer-col">
            <h5>AIDE</h5>
            <a href="#">FAQ</a>
            <Link to="/contact">Contact</Link>
            <a href="#">CGU</a>
            <a href="#">Confidentialité</a>
          </div>
          <div className="footer-col">
            <h5>MON COMPTE</h5>
            <Link to="/connexion">Connexion</Link>
            <Link to="/inscription">Créer un compte</Link>
            <Link to="/compte">Mon espace</Link>
          </div>
        </nav>

      </div>

      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </footer>
  )
}
