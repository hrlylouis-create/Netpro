import './Home.css'
import './Essentiel.css'
import { useState, useEffect, useRef } from 'react'
import Footer from './Footer'
import { Link, useNavigate } from 'react-router-dom'
import CTAButton from './CTAButton'
import GlassButton from './GlassButton'
import CreditModal from './CreditModal'
import { useAuth } from './AuthContext'
import logo from './assets/netpro-logo.png'
import hero from './assets/hero1-product.png'

const faqItems = [
  { q: "Combien de temps dure une session ?", a: "Une session Essentiel dure entre 1h30 et 2h selon la superficie de votre logement." },
  { q: "Qui vient faire le ménage ?", a: "Un professionnel vérifié et assuré, sélectionné par Netpro pour sa fiabilité et son expertise." },
  { q: "Dois-je fournir les produits ?", a: "Non, notre pro apporte tout le matériel nécessaire. Vous pouvez également opter pour l'option Produits à 3€/h." },
  { q: "Puis-je annuler ma réservation ?", a: "Oui, l'annulation est gratuite jusqu'à 24h avant la session." },
  { q: "Comment est fixé le prix ?", a: "Le tarif est de 28,90€/h, soit 14,95€/h après crédit d'impôt (50% pour les particuliers)." },
]

function useInView() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setDone(true), 1500)
    return () => clearTimeout(t)
  }, [inView])
  return [ref, inView, done]
}

function Essentiel() {
  const [apresImpot, setApresImpot] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)
  const [subbarVisible, setSubbarVisible] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const ctaRef = useRef(null)
  const heroRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [valeursRef, valeursInView, valeursAnimDone] = useInView()
  const [inclusRef, inclusInView, inclusAnimDone] = useInView()
  const [optionsRef, optionsInView, optionsAnimDone] = useInView()
  const [faqRef, faqInView, faqAnimDone] = useInView()

  useEffect(() => {
    const onScroll = () => {
      if (!ctaRef.current) return
      const rect = ctaRef.current.getBoundingClientRect()
      if (rect.bottom < 62) setSubbarVisible(true)
      else if (window.scrollY < 10) setSubbarVisible(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fu = (inView, done) => !done ? ` fade-up${inView ? ' visible' : ''}` : ''
  const td = (done, delay) => ({ transitionDelay: done ? '0s' : delay })

  return (
    <div className="mr-page mr-page--essentiel">

      <div className="gradient-bg" aria-hidden="true">
        <div className="blob blob-orange" />
        <div className="blob blob-pink" />
        <div className="blob blob-orange2" />
        <div className="blob blob-pink2" />
      </div>

      <header className="mr-header">
        <div className="home-header-left">
          <Link to="/">
            <img src={logo} alt="Netpro" className="header-logo" />
          </Link>
          <div className="home-shortcuts">
            {[
              { label: 'Présentation', ref: null },
              { label: "Dans l'offre", ref: inclusRef, offset: -96 },
              { label: 'FAQ', ref: faqRef },
            ].map(({ label, ref, offset = 0 }) => (
              <GlassButton key={label} onClick={() => {
                if (!ref) return window.scrollTo({ top: 0, behavior: 'smooth' })
                if (!ref.current) return
                const top = ref.current.getBoundingClientRect().top + window.scrollY - 76 + offset
                window.scrollTo({ top, behavior: 'smooth' })
              }}>{label}</GlassButton>
            ))}
          </div>
        </div>
        <nav className="header-nav">
          {subbarVisible ? (
            <>
              <div className="mr-subbar-priceblock">
                <span className="mr-subbar-label">Avance immédiate</span>
                <button
                  className={`mr-toggle ${apresImpot ? 'on' : ''}`}
                  onClick={() => setApresImpot(v => !v)}
                  aria-pressed={apresImpot}
                >
                  <span className="mr-toggle-thumb" />
                </button>
                <span className="mr-subbar-amount">{apresImpot ? '14,95€/H' : '28,90€/H'}</span>
              </div>
              <CTAButton color="pink" className="cta-btn--sm" onClick={() => navigate('/souscription/menage-rapide')}>RÉSERVER</CTAButton>
            </>
          ) : (
            <>
              <GlassButton href="tel:+33678171947" className="header-tel">📞&nbsp;06 78 17 19 47</GlassButton>
              {user ? (
                <Link to="/compte" className="compte-icon-bubble">
                  <span className="compte-icon-letter">{user.prenom?.[0]?.toUpperCase()}</span>
                  <span className="compte-icon-bonjour">Bonjour <span className="compte-icon-prenom">{user.prenom}</span></span>
                </Link>
              ) : (
                <GlassButton to="/connexion">Se connecter</GlassButton>
              )}
            </>
          )}
        </nav>
      </header>

      <section className="mr-hero" ref={heroRef}>
        <div className="mr-hero-content">
          <span className="mr-badge-placeholder" />
          <span className="mr-prix-barre" style={{ visibility: apresImpot ? 'visible' : 'hidden' }}>28,90€/h</span>
          <div className="mr-titre-row">
            <span className="mr-nav-arrow mr-nav-arrow--disabled">‹</span>
            <h1 className="mr-titre">ESSENTIEL</h1>
            <span className="mr-nav-arrow" onClick={() => setTimeout(() => navigate('/menage-regulier'), 180)} style={{ cursor: 'pointer' }}>›</span>
          </div>
          <div className="mr-prix-principal">{apresImpot ? '14,95€/H' : '28,90€/H'}</div>
          <span className="mr-hero-spacer" />
          <div className="mr-toggle-row">
            <GlassButton className="offres-info-btn" onClick={() => setShowCreditModal(true)}>?</GlassButton>
            <span className="mr-toggle-label">Avance immédiate</span>
            <button
              className={`mr-toggle ${apresImpot ? 'on' : ''}`}
              onClick={() => setApresImpot(v => !v)}
              aria-pressed={apresImpot}
            >
              <span className="mr-toggle-thumb" />
            </button>
          </div>
          <CTAButton ref={ctaRef} color="pink" onClick={() => navigate('/souscription/menage-rapide')} className="mr-hero-btn">RÉSERVER</CTAButton>
        </div>
        <div className="mr-hero-img-wrap">
          <img src={hero} alt="Pro ménage Netpro" className="mr-hero-img" />
        </div>
      </section>

      <section className="mr-valeurs" ref={valeursRef}>
        <h2 className={`mr-valeurs-titre${fu(valeursInView, valeursAnimDone)}`}>
          <span className="mot-rose">VIIIIITE</span> FAIT, <span className="mot-rose">BIEN</span> FAIT
        </h2>
        <p className={`mr-valeurs-sous${fu(valeursInView, valeursAnimDone)}`} style={td(valeursAnimDone, '0.1s')}>Jamais bâclé</p>

        <div className="mr-valeurs-grid-wrap">
          <div className="mr-valeurs-grid">
            <div className={`mr-valeur-card${fu(valeursInView, valeursAnimDone)}`} style={td(valeursAnimDone, '0.15s')}>
              <h3 className="mr-valeur-title">RAP<span className="mr-stripe-i">IIIIIII</span>DE</h3>
              <p>Réservez en 5min une session rapide garantie en 48h</p>
            </div>
            <div className={`mr-valeur-card${fu(valeursInView, valeursAnimDone)}`} style={td(valeursAnimDone, '0.27s')}>
              <h3 className="mr-valeur-title">EFF<span className="mr-stripe-i">IIIIIII</span>CACE</h3>
              <p>On va droit au but<br />Un bon petit coup de propre,<br />pour une maison toute fraîche</p>
            </div>
            <div className={`mr-valeur-card${fu(valeursInView, valeursAnimDone)}`} style={td(valeursAnimDone, '0.39s')}>
              <h3 className="mr-valeur-title">B<span className="mr-stripe-i">IIIIIII</span>EN FAIT</h3>
              <p>Les exigences de Netpro<br />Un résultat net et soigné, sans<br />compromis</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mr-inclus" ref={inclusRef}>
        <h3 className={`mr-section-label${fu(inclusInView, inclusAnimDone)}`}>Dans l'offre</h3>
        <div className="mr-inclus-grid">
          {[
            { title: 'SURFACES', desc: 'On dépoussiére les surfaces', icon: '🧽' },
            { title: 'SOLS', desc: 'On aspire, on balaye et on lave les sols', icon: '🧹' },
            { title: 'CONTACTS', desc: 'On désinfecte les zones de contact', icon: '🧼' },
            { title: 'LITERIE', desc: <>On change le linge<br />de lit</>, icon: '🛏️' },
            { title: 'DÉCHETS', desc: 'On entretient et on sort les poubelles', icon: '🗑️' },
            { title: 'CUISINE', desc: 'On dégraisse les surfaces de cuisine', icon: '🍳' },
          ].map((item, i) => (
            <div className={`mr-inclus-card${fu(inclusInView, inclusAnimDone)}`} key={item.title} style={td(inclusAnimDone, `${0.08 + i * 0.08}s`)}>
              <span className="mr-card-icon">{item.icon}</span>
              <h4>{item.title}<br/><span className="mr-inclus-spacer"> </span></h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mr-options" ref={optionsRef}>
        <h3 className={`mr-section-label${fu(optionsInView, optionsAnimDone)}`}>En option</h3>
        <div className="mr-options-grid">
          {[
            { title: 'VITRES', prix: '3€/H', desc: 'Nettoyage complet des vitres', icon: '🪟' },
            { title: 'REPASSAGE', prix: '3€/H', desc: 'Repassage et pliage du linge', icon: '👕' },
            { title: 'PRODUITS', prix: '3€/H', desc: 'Fourniture des produits ménagers', icon: '🧴' },
            { title: 'PLANTES', prix: '2€', desc: 'Arrosage des plantes', icon: '🪴' },
          ].map((item, i) => (
            <div className={`mr-option-card${fu(optionsInView, optionsAnimDone)}`} key={item.title} style={td(optionsAnimDone, `${0.08 + i * 0.1}s`)}>
              <span className="mr-card-icon">{item.icon}</span>
              <h4>{item.title}<br /><span className="mr-option-prix">{item.prix}</span></h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
        <GlassButton to="/comparer-offres" className={`comparer-offres${fu(optionsInView, optionsAnimDone)}`} style={td(optionsAnimDone, '0.5s')}>Comparer les offres ›</GlassButton>
      </section>

      <section className="mr-faq" ref={faqRef}>
        <h2 className={`mr-faq-titre${fu(faqInView, faqAnimDone)}`}>
          <span className="mot-vert">ON</span> RÉPOND À <span className="mot-rose">VOS</span> QUESTIONS
        </h2>
        <div className="mr-faq-list">
          {faqItems.map((item, i) => (
            <div
              className={`mr-faq-item${fu(faqInView, faqAnimDone)}${openFaq === i ? ' open' : ''}`}
              key={i}
              style={td(faqAnimDone, `${0.08 + i * 0.08}s`)}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="mr-faq-q">
                <span>{item.q}</span>
                <span className="mr-faq-icon">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <p className="mr-faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <Footer />
      {showCreditModal && <CreditModal onClose={() => setShowCreditModal(false)} />}

    </div>
  )
}

export default Essentiel
