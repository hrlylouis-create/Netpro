import './Login.css'
import './Contact.css'
import { Link } from 'react-router-dom'
import logo from './assets/netpro-logo.png'
import { useState } from 'react'
import { useAuth } from './AuthContext'
import CTAButton from './CTAButton'
import GlassButton from './GlassButton'
import Footer from './Footer'

function Contact() {
  const { user } = useAuth()
  const [sujet, setSujet] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!email || !sujet || !message) { setError('Veuillez remplir tous les champs.'); return }
    setSent(true)
  }

  return (
    <div className="login-page contact-page">
      <div className="gradient-bg" aria-hidden="true">
        <div className="blob blob-orange" />
        <div className="blob blob-pink" />
        <div className="blob blob-orange2" />
        <div className="blob blob-pink2" />
      </div>

      <header className="login-header">
        <Link to="/"><img src={logo} alt="Netpro" className="header-logo" /></Link>
        <nav className="login-header-nav">
          <GlassButton href="tel:+33678171947">📞 <strong>06 78 17 19 47</strong></GlassButton>
          {user ? (
            <Link to="/compte" className="compte-icon-bubble">
              <span className="compte-icon-letter">{user.prenom?.[0]?.toUpperCase()}</span>
                  <span className="compte-icon-bonjour">Bonjour <span className="compte-icon-prenom">{user.prenom}</span></span>
            </Link>
          ) : (
            <GlassButton to="/connexion">Se connecter</GlassButton>
          )}
        </nav>
      </header>

      <main className="contact-main">
        {sent ? (
          <div className="login-card contact-card">
            <div className="contact-success-icon">✓</div>
            <h1 className="login-title">MESSAGE ENVOYÉ</h1>
            <p className="contact-success-text">
              Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <CTAButton color="green" onClick={() => setSent(false)} fullWidth>ENVOYER UN AUTRE MESSAGE</CTAButton>
            <GlassButton to="/">Retour à l'accueil</GlassButton>
          </div>
        ) : (
          <div className="contact-wrapper">
            <h1 className="contact-headline">
              ON EST LÀ<br />
              <span className="titre-highlight">POUR VOUS</span>
            </h1>
            <div className="contact-layout">

              <div className="contact-infos">
                <p className="contact-sub">
                  Une question, un problème, une demande particulière ? Notre équipe répond en moins de 24h.
                </p>
                <div className="contact-channels">
                  <a href="tel:+33678171947" className="contact-channel">
                    <div className="contact-channel-icon">📞</div>
                    <div>
                      <p className="contact-channel-label">Téléphone</p>
                      <p className="contact-channel-value">06 78 17 19 47</p>
                    </div>
                  </a>
                  <a href="mailto:contact@netpro.fr" className="contact-channel">
                    <div className="contact-channel-icon">✉️</div>
                    <div>
                      <p className="contact-channel-label">Email</p>
                      <p className="contact-channel-value">contact@netpro.fr</p>
                    </div>
                  </a>
                  <div className="contact-channel">
                    <div className="contact-channel-icon">🕐</div>
                    <div>
                      <p className="contact-channel-label">Disponibilité</p>
                      <p className="contact-channel-value">Lun – Sam, 8h – 20h</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="contact-right">
                <h2 className="contact-form-title">NOUS ÉCRIRE</h2>
                <div className="login-card contact-card">
                  <input
                    type="email"
                    placeholder="Votre adresse mail"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                  />
                  <select
                    className="contact-select"
                    value={sujet}
                    onChange={e => { setSujet(e.target.value); setError('') }}
                  >
                    <option value="" disabled>Sujet</option>
                    <option value="reservation">Une réservation</option>
                    <option value="abonnement">Mon abonnement</option>
                    <option value="pro">Devenir pro Netpro</option>
                    <option value="autre">Autre</option>
                  </select>
                  <textarea
                    className="contact-textarea"
                    placeholder="Votre message..."
                    value={message}
                    onChange={e => { setMessage(e.target.value); setError('') }}
                    rows={5}
                  />
                  {error && <p className="login-error">{error}</p>}
                  <CTAButton color="green" onClick={handleSubmit} fullWidth>ENVOYER</CTAButton>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Contact
