import './Home.css'
import './Essentiel.css'
import './Integral.css'
import { useState, useEffect, useRef } from 'react'
import Footer from './Footer'
import { Link, useNavigate } from 'react-router-dom'
import CTAButton from './CTAButton'
import GlassButton from './GlassButton'
import CreditModal from './CreditModal'
import { useAuth } from './AuthContext'
import logo from './assets/netpro-logo.png'
import hero from './assets/hero3-product.png'

const faqItems = [
  { q: "Combien de temps dure une session ?", a: "Une session Intégral dure entre 3h et 5h selon la superficie et l'état de votre logement." },
  { q: "Combien de professionnels interviennent ?", a: "En général, une équipe de 2 professionnels intervient pour une efficacité maximale." },
  { q: "À quelle fréquence faire un Intégral ?", a: "Nous recommandons un Intégral 2 à 4 fois par an, selon vos besoins et votre mode de vie." },
  { q: "Dois-je être présent pendant la session ?", a: "Non, vous n'avez pas besoin d'être présent. Vous pouvez confier vos clés à notre équipe en toute sécurité." },
  { q: "Comment est fixé le prix ?", a: "Le tarif est de 34,90€/h, soit 17,45€/h après crédit d'impôt (50% pour les particuliers)." },
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

function Integral() {
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
    <div className="mr-page mr-page--integral">

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
                <span className="mr-subbar-amount">{apresImpot ? '17,45€/H' : '34,90€/H'}</span>
              </div>
              <CTAButton color="orange" className="cta-btn--sm" onClick={() => navigate('/souscription/grand-menage')}>RÉSERVER</CTAButton>
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
          <span className="mr-prix-barre" style={{ visibility: apresImpot ? 'visible' : 'hidden' }}>34,90€/h</span>
          <div className="mr-titre-row">
            <span className="mr-nav-arrow" onClick={() => setTimeout(() => navigate('/menage-regulier'), 180)} style={{ cursor: 'pointer' }}>‹</span>
            <h1 className="mr-titre">INTÉGRAL</h1>
            <span className="mr-nav-arrow mr-nav-arrow--disabled">›</span>
          </div>
          <div className="mr-prix-principal">{apresImpot ? '17,45€/H' : '34,90€/H'}</div>
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
          <CTAButton ref={ctaRef} color="orange" onClick={() => navigate('/souscription/grand-menage')} className="mr-hero-btn">RÉSERVER</CTAButton>
        </div>
        <div className="mr-hero-img-wrap">
          <img src={hero} alt="Pro ménage Netpro" className="mr-hero-img" />
        </div>
      </section>

      <section className="mr-valeurs" ref={valeursRef}>
        <h2 className={`mr-valeurs-titre${fu(valeursInView, valeursAnimDone)}`}>
          <span className="mot-orange">GRANDS</span> BESOINS… <span className="mot-orange">GRANDS</span> MOYENS
        </h2>
        <p className={`mr-valeurs-sous${fu(valeursInView, valeursAnimDone)}`} style={td(valeursAnimDone, '0.1s')}>Le ménage qui déménage</p>

        <div className="mr-valeurs-grid-wrap">
          <div className="mr-valeurs-grid">
            <div className={`mr-valeur-card${fu(valeursInView, valeursAnimDone)}`} style={td(valeursAnimDone, '0.15s')}>
              <h3 className="mr-valeur-title">SESSION <span className="mot-orange">XXL</span></h3>
              <p>Une session longue pour tout traiter en profondeur, sans rien laisser de côté</p>
            </div>
            <div className={`mr-valeur-card${fu(valeursInView, valeursAnimDone)}`} style={td(valeursAnimDone, '0.27s')}>
              <h3 className="mr-valeur-title">MOYENS <span className="mot-orange">XXL</span></h3>
              <p>Des professionnels expérimentés et une méthode qui a fait ses preuves, pour un nettoyage maîtrisé</p>
            </div>
            <div className={`mr-valeur-card${fu(valeursInView, valeursAnimDone)}`} style={td(valeursAnimDone, '0.39s')}>
              <h3 className="mr-valeur-title">RÉSULTAT <span className="mot-orange">XXL</span></h3>
              <p>Un intérieur transformé en une session, propre en profondeur presque comme neuf</p>
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
            { title: 'SALLE DE BAIN', desc: 'On détartre la salle de bain', icon: '🚿' },
            { title: 'ÉLECTROMÉNAGER', desc: "On nettoie l'électroménager", icon: '🏠' },
            { title: 'MURS', desc: 'On lessive les murs', icon: '🪣' },
            { title: 'PLACARDS', desc: "On nettoie l'intérieur des placards", icon: '🗄️' },
          ].map((item, i) => (
            <div className={`mr-inclus-card${fu(inclusInView, inclusAnimDone)}`} key={item.title} style={td(inclusAnimDone, `${0.06 + i * 0.06}s`)}>
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
            { title: 'VITRES', prix: '3€/H', desc: 'Nettoyage complet des vitres', offert: true, icon: '🪟' },
            { title: 'PRODUITS', prix: '3€/H', desc: 'Fourniture des produits ménagers', offert: true, icon: '🧴' },
          ].map((item, i) => (
            <div className={`mr-option-card${fu(optionsInView, optionsAnimDone)}`} key={item.title} style={td(optionsAnimDone, `${0.08 + i * 0.1}s`)}>
              {item.offert && <div className="mrr-badge-offert">OFFERT</div>}
              <span className="mr-card-icon">{item.icon}</span>
              <h4>{item.title}<br /><span className="mr-option-prix">{item.prix}</span></h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
        <GlassButton to="/comparer-offres" className={`comparer-offres${fu(optionsInView, optionsAnimDone)}`} style={td(optionsAnimDone, '0.3s')}>Comparer les offres ›</GlassButton>
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

export default Integral
