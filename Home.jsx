import './Home.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from './Footer'
import CTAButton from './CTAButton'
import GlassButton from './GlassButton'
import SectionTitle from './SectionTitle'
import CreditModal from './CreditModal'
import { useAuth } from './AuthContext'
import heroTeam from './assets/hero-team-ban.png'
import heroTeam1 from './assets/hero-team1.png'
import heroTeam2 from './assets/hero-team2.png'
import heroTeam3 from './assets/hero-team3.png'
import hero from './assets/hero.jpg'
import logo from './assets/netpro-logo.png'
import imgEssentiel from './assets/menage-rapide.png'
import imgSerenite from './assets/menage-regulier.png'
import imgIntegral from './assets/grand-menage.png'
import reviews from './data/reviews'

const slides = [
  {
    title: "Le ménage ? C'est net, c'est pro, c'est Netpro",
    description: "Des pros qualifiés interviennent à domicile selon votre rythme. Abonnez-vous en quelques clics.",
    promo: null,
    img: heroTeam,
    cta: { label: "M'ABONNER", path: '/souscription/menage-regulier' }
  },
  {
    title: "OFFRE DE BIENVENUE",
    description: "Essayez les services de Netpro en commandant votre premier Essentiel",
    promo: "Bénéficiez de 10% de remise sur la 1ère session avec le code BVN10 !",
    img: heroTeam1,
    cta: { label: "RÉSERVER", path: '/souscription/menage-rapide' }
  },
  {
    title: "NOUVEAUTÉ PRINTEMPS",
    description: "Le beau temps revient, et votre intérieur mérite un grand coup de frais. Découvrez nos nouvelles formules spéciales printemps.",
    promo: "Profitez de -15% sur votre première session Intégral avec le code SPRING15 !",
    img: heroTeam2,
    cta: { label: "RÉSERVER", path: '/souscription/menage-rapide' }
  },
  {
    title: "OFFRE FIDÉLITÉ",
    description: "Vous êtes avec nous depuis un moment ? Merci. En récompense de votre confiance, on vous réserve une offre exclusive.",
    promo: "Cumulez vos sessions et débloquez un mois offert après 10 réservations !",
    img: heroTeam3,
    cta: { label: "RÉSERVER", path: '/souscription/menage-rapide' }
  }
]

const avgRatingNum = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
const avgRating = avgRatingNum.toFixed(1).replace('.', ',')

function Stars({ count }) {
  return (
    <span className="stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? 'star filled' : 'star empty'}>★</span>
      ))}
    </span>
  )
}

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

function useCountUp(target, active, duration = 1100, decimals = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      const ease = 1 - (1 - p) ** 3
      setVal(+(ease * target).toFixed(decimals))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active])
  return val
}

const pourquoiSlides = [
  {
    label: <>C'EST <span className="mot-vert">NET</span></>,
    titre: <>Un résultat <span className="mot-vert">impeccable,</span> garanti</>,
    desc: "Chaque intervention suit un protocole rigoureux. Si le résultat ne vous convient pas, on revient sans frais supplémentaires.",
    tags: ['✓ Protocole certifié', '✓ Contrôle qualité', '✓ Garantie satisfaction', '✓ Produits pro inclus'],
    emoji: '🫧',
  },
  {
    label: <>C'EST <span className="mot-vert">PRO</span></>,
    titre: <>Des pros <span className="mot-vert">salariés,</span> pas des inconnus</>,
    desc: "Chaque pro Netpro est un salarié sélectionné, formé et assuré par nos soins. Vous ouvrez votre porte à quelqu'un que nous connaissons.",
    tags: ['✓ Contrat de travail', '✓ Formation certifiée', '✓ Assurance responsabilité', '✓ Vérification d\'identité'],
    badge: true,
  },
  {
    label: <>C'EST <span className="mot-vert">NETPRO</span></>,
    titre: <>Un service <span className="mot-vert">pensé</span> pour vous</>,
    desc: "Réservation en quelques clics, intervention en 48h, annulation gratuite. Un service flexible qui s'adapte à votre rythme de vie.",
    tags: ['✓ Réservation en ligne', '✓ Intervention en 48h', '✓ Annulation gratuite', '✓ Pro attitré'],
    emoji: '⚡',
  },
]

function PourquoiSlider({ idx, onDotClick }) {
  const [anim, setAnim] = useState(true)
  const prevIdx = useRef(idx)

  useEffect(() => {
    if (prevIdx.current === idx) return
    setAnim(false)
    const t = setTimeout(() => setAnim(true), 80)
    prevIdx.current = idx
    return () => clearTimeout(t)
  }, [idx])

  const s = pourquoiSlides[idx]

  return (
    <div className="pro-verifie-left">
      <div className={`pro-verifie-slide${anim ? ' pv-slide-in' : ''}`}>
        <div className="pro-verifie-titre-row">
          {s.badge ? (
            <svg className="badge-verifie-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#3897f0" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1.01-2.52-1.27-3.91-.81-.67-1.31-1.91-2.19-3.34-2.19-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.9-.2-3.91.81-1.01 1.01-1.27 2.52-.81 3.91C2.88 9.33 2 10.57 2 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1.01 2.52 1.27 3.91.81.67 1.31 1.91 2.19 3.34 2.19 1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.81 1.01-1.01 1.27-2.52.81-3.91 1.31-.67 2.19-1.91 2.19-3.34z"/>
              <path fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.5 2.5 4.5-4.5"/>
            </svg>
          ) : s.emoji ? (
            <span className="pv-emoji">{s.emoji}</span>
          ) : null}
          <h3 className="pro-verifie-titre">{s.titre}</h3>
        </div>
        <p className="pro-verifie-desc">{s.desc}</p>
        <div className="pro-verifie-garanties">{s.tags.map(t => <span key={t}>{t}</span>)}</div>
      </div>
      <div className="pv-dots">
        {pourquoiSlides.map((_, i) => (
          <button key={i} className={`pv-dot${i === idx ? ' pv-dot--active' : ''}`} onClick={() => onDotClick(i)} />
        ))}
      </div>
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const imgRef = useRef(null)
  const [burgerOpen, setBurgerOpen] = useState(false)
  const [profilOpen, setProfilOpen] = useState(false)
  const burgerCloseRef = useRef(null)
  const profilCloseRef = useRef(null)

  function openBurger() {
    clearTimeout(burgerCloseRef.current)
    setBurgerOpen(true)
  }
  function closeBurger() {
    burgerCloseRef.current = setTimeout(() => setBurgerOpen(false), 2500)
  }
  function openProfil() {
    clearTimeout(profilCloseRef.current)
    setProfilOpen(true)
  }
  function closeProfil() {
    profilCloseRef.current = setTimeout(() => setProfilOpen(false), 2500)
  }

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 15000)
  }, [])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [startTimer])

  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.style.animation = 'none'
      void imgRef.current.offsetHeight
      imgRef.current.style.animation = ''
    }
  }, [current])

  const prev = () => { setCurrent(c => (c - 1 + slides.length) % slides.length); startTimer() }
  const next = () => { setCurrent(c => (c + 1) % slides.length); startTimer() }


  // Scroll animation refs
  const [offresRef, offresInView]       = useInView()
  const [pourquoiRef, pourquoiInView]   = useInView()
  const [bienvenueRef, bienvenueInView] = useInView()
  const [avisRef, avisInView]           = useInView()
  const [statsRef, statsInView]         = useInView()

  const [pvIdx, setPvIdx] = useState(0)
  const pvTimerRef = useRef(null)

  const pvGoTo = useCallback((i) => {
    setPvIdx(i)
    clearInterval(pvTimerRef.current)
    pvTimerRef.current = setInterval(() => setPvIdx(i => (i + 1) % pourquoiSlides.length), 5000)
  }, [])

  const pvPause = useCallback((i) => {
    setPvIdx(i)
    clearInterval(pvTimerRef.current)
  }, [])

  const pvResume = useCallback(() => {
    clearInterval(pvTimerRef.current)
    pvTimerRef.current = setInterval(() => setPvIdx(i => (i + 1) % pourquoiSlides.length), 5000)
  }, [])

  useEffect(() => {
    pvTimerRef.current = setInterval(() => setPvIdx(i => (i + 1) % pourquoiSlides.length), 5000)
    return () => clearInterval(pvTimerRef.current)
  }, [])

  const [apresImpot, setApresImpot] = useState(true)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [reserverModal, setReserverModal] = useState({ open: false, souscPath: '' })
  const [offresAnimDone, setOffresAnimDone] = useState(false)
  const [showHeaderToggle, setShowHeaderToggle] = useState(false)
  const offreToggleRowRef = useRef(null)
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    if (!offresInView) return
    const t = setTimeout(() => setOffresAnimDone(true), 900)
    return () => clearTimeout(t)
  }, [offresInView])

  useEffect(() => {
    function onScroll() {
      if (!offreToggleRowRef.current) return
      const rect = offreToggleRowRef.current.getBoundingClientRect()
      setShowHeaderToggle(rect.bottom < 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = [
      { label: 'Nouveautés', ref: bienvenueRef },
      { label: 'Offres', ref: offresRef },
      { label: 'Pourquoi Netpro ?', ref: pourquoiRef },
      { label: 'Avis', ref: avisRef },
    ]
    function onScroll() {
      const threshold = 76 + 100
      let best = null
      for (const s of sections) {
        if (!s.ref.current) continue
        if (s.ref.current.getBoundingClientRect().top <= threshold) {
          best = s.label
        }
      }
      if (best) setActiveSection(best)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [todoRef, todoInView] = useInView()
  const [todoCount, setTodoCount] = useState(0)
  useEffect(() => {
    if (!todoInView || todoCount >= 6) return
    const t = setTimeout(() => setTodoCount(c => c + 1), 280)
    return () => clearTimeout(t)
  }, [todoInView, todoCount])

  // Counters
  const ratingCounter = useCountUp(avgRatingNum, statsInView, 1200, 1)
  const countCounter  = useCountUp(reviews.length, statsInView, 1000)

  return (
    <div className="home">

      <div className="gradient-bg" aria-hidden="true">
        <div className="blob blob-orange" />
        <div className="blob blob-pink" />
        <div className="blob blob-orange2" />
        <div className="blob blob-pink2" />
      </div>

      <header className="home-header">
        <div className="home-header-left">
          <img src={logo} alt="Netpro" className="header-logo" />
          <div className="header-burger-wrap" onMouseEnter={openBurger} onMouseLeave={closeBurger}>
            <GlassButton className={`header-burger${burgerOpen ? ' is-open' : ''}`} aria-label="Menu">
              <span /><span /><span />
            </GlassButton>
            <div className={`header-burger-menu${burgerOpen ? ' is-open' : ''}`}>
              {[
                { label: 'Nouveautés', ref: bienvenueRef },
                { label: 'Offres', ref: offresRef, offset: 76 },
                { label: 'Pourquoi Netpro ?', ref: pourquoiRef },
                { label: 'Avis', ref: avisRef },
              ].map(({ label, ref, offset = 0 }) => (
                <button key={label} className="glass-btn" onClick={() => {
                  if (!ref.current) return
                  const top = ref.current.getBoundingClientRect().top + window.scrollY - 76 + offset
                  window.scrollTo({ top, behavior: 'smooth' })
                  setBurgerOpen(false)
                }}>
                  {activeSection === label ? <strong>{label}</strong> : label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {showHeaderToggle && (
          <div className="header-avance-toggle">
            <span className="smr-taux-reduit">Avance immédiate</span>
            <button className={`smr-toggle${apresImpot ? ' on' : ''}`} onClick={() => setApresImpot(v => !v)} />
          </div>
        )}

        <nav className="header-nav">
          {user ? (
            <>
              {!profilOpen && <GlassButton href="tel:+33678171947">📞 <strong>Réserver par téléphone</strong></GlassButton>}
              <div className="header-profil-wrap" onMouseEnter={openProfil} onMouseLeave={closeProfil}>
                <div className="header-profil-anchor">
                  <div className={`header-profil-menu${profilOpen ? ' is-open' : ''}`}>
                    <Link to="/compte/sessions" className="glass-btn">Mes sessions</Link>
                    <Link to="/compte/factures" className="glass-btn">Mes factures</Link>
                    <Link to="/compte/infos" className="glass-btn">Mes infos</Link>
                    <Link to="/compte/parrainage" className="glass-btn">Parrainage</Link>
                  </div>
                  <Link to="/compte" className={`compte-icon-bubble${profilOpen ? ' is-expanded' : ''}`}>
                    <span className="compte-icon-letter">{user.prenom?.[0]?.toUpperCase()}</span>
                    <span className="compte-icon-bonjour">Bonjour <span className="compte-icon-prenom">{user.prenom}</span></span>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <GlassButton href="tel:+33678171947">📞 <strong>Réserver par téléphone</strong></GlassButton>
              <GlassButton to="/connexion">Se connecter</GlassButton>
            </>
          )}
        </nav>
      </header>

      <section ref={bienvenueRef} className="bienvenue-banner" key={current} onClick={() => navigate(slides[current].cta.path)} style={{ cursor: 'pointer' }} onMouseDown={e => { if (!e.target.closest('.carousel-btn') && !e.target.closest('.cta-btn')) { e.currentTarget.classList.add('banner-pressed') } }} onMouseUp={e => e.currentTarget.classList.remove('banner-pressed')} onMouseLeave={e => e.currentTarget.classList.remove('banner-pressed')}>
        <img src={slides[current].img} alt={slides[current].title} className="bienvenue-banner-bg" />
        <div className="bienvenue-banner-overlay" />
        <div className="bienvenue-banner-content">
          <h2 className="bienvenue-banner-titre">{slides[current].title}</h2>
          <p className="bienvenue-banner-desc">{slides[current].description}</p>
          {slides[current].promo && <p className="bienvenue-banner-promo">{slides[current].promo}</p>}
          <CTAButton color="orange" onClick={() => navigate(slides[current].cta.path)}>{slides[current].cta.label}</CTAButton>
        </div>
        <button className="carousel-btn carousel-btn-left" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
        <button className="carousel-btn carousel-btn-right" onClick={e => { e.stopPropagation(); next(); }}>›</button>
        <div className="carousel-progress-bar" key={`pb-${current}`}>
          <div className="carousel-progress-fill" />
        </div>
      </section>

      <section ref={offresRef} className="offres">
        <SectionTitle inView={offresInView}>
          <span className="titre-highlight">MENAGEZ</span> VOUS UN PETIT PEU...
        </SectionTitle>

        <div ref={offreToggleRowRef} className="mr-toggle-row offres-toggle-row">
          <GlassButton className="offres-info-btn" onClick={() => setShowCreditModal(true)}>?</GlassButton>
          <span className="mr-toggle-label">Avance immédiate</span>
          <button className={`mr-toggle ${apresImpot ? 'on' : ''}`} onClick={() => setApresImpot(v => !v)} aria-pressed={apresImpot}>
            <span className="mr-toggle-thumb" />
          </button>
        </div>

        <div className="offres-grid">

          {[
            {
              label: 'ESSENTIEL', sous: 'Rapide et efficace', img: imgEssentiel, alt: 'Essentiel', smallImg: true,
              prix: '28,90€', reduit: '14,95€', prixColor: '#F4717F', btnColor: 'pink', btnLabel: 'RÉSERVER',
              path: '/menage-rapide', souscPath: '/souscription/menage-rapide',
              features: [<>Session <strong>courte</strong></>, <>Réservation <strong>simple et rapide</strong></>, <>Un pro garanti <strong>en 48h</strong></>, <>Annulation <strong>gratuite</strong></>, <>Offre <strong>personnalisable</strong></>]
            },
            {
              label: 'SÉRÉNITÉ', sous: 'Toujours nickel, toujours serein', img: imgSerenite, alt: 'Sérénité',
              prix: '31,90€', reduit: '15,95€', prixColor: '#22C55E', btnColor: 'green', btnLabel: "M'ABONNER",
              path: '/menage-regulier', souscPath: '/souscription/menage-regulier',
              populaire: true,
              features: [<>Sessions <strong>moyennes</strong> régulières</>, <>Un pro garanti <strong>en 48h</strong></>, <>Arretez ou <strong>mettez en pause</strong></>, <>Votre <strong>pro attitré</strong></>, <>Gestion des <strong>clés sécurisée</strong></>, <>Nettoyage de vitres <strong>offert</strong></>]
            },
            {
              label: 'INTÉGRAL', sous: 'En profondeur, résultat irréprochable', img: imgIntegral, alt: 'Intégral', grandImg: true,
              prix: '34,90€', reduit: '17,45€', prixColor: '#F4824A', btnColor: 'orange', btnLabel: 'RÉSERVER',
              path: '/grand-menage', souscPath: '/souscription/grand-menage',
              features: [<>Session <strong>longue</strong></>, <>Un pro garanti <strong>en 72h</strong></>, <>Le <strong>ménage qui déménage</strong></>, <>Résultat <strong>comme neuf</strong></>, <>Le <strong>meilleur pro disponible</strong></>, <>Nettoyage de vitres <strong>offert</strong></>]
            }
          ].map((o, i) => (
            <div
              key={o.label}
              className={`offre-card${o.populaire ? ' populaire' : ''} fade-up${offresInView ? ' visible' : ''}`}
              style={{ transitionDelay: (!offresAnimDone && offresInView) ? `${i * 0.12}s` : '0s', cursor: 'pointer' }}
              onClick={() => navigate(o.path)}
            >
              {o.populaire && <div className="badge-populaire">POPULAIRE</div>}
              <div className="offre-header">
                <div className="offre-title-row">
                  <span className="trait" style={o.prixColor ? { background: o.prixColor } : {}}></span>
                  <h3>{o.label}</h3>
                  <span className="trait" style={o.prixColor ? { background: o.prixColor } : {}}></span>
                </div>
                <p className="offre-sous-titre">{o.sous}</p>
              </div>
              <div className="offre-top">
                <div className={`offre-img-wrap${o.grandImg ? ' offre-img-wrap--grand' : ''}${o.smallImg ? ' offre-img-wrap--small' : ''}`}>
                  <img src={o.img} alt={o.alt} className="offre-img" />
                </div>
                <div className="offre-prix">
                  <div className="prix-bloc">
                    <span className="a-partir">{apresImpot ? 'À partir de' : 'Tarif normal'}</span>
                    <div className="prix-wrap">
                      {apresImpot && <span className="prix-normal-barre">{o.prix}<span className="prix-unit">/H</span></span>}
                      <span className="prix" style={o.prixColor ? { color: o.prixColor } : {}}>{apresImpot ? o.reduit : o.prix}<span className="prix-unit">/H</span></span>
                    </div>
                  </div>
                </div>
              </div>
              <CTAButton
                color={o.btnColor}
                onClick={e => {
                  e.stopPropagation()
                  if (window.innerWidth < 768) setReserverModal({ open: true, souscPath: o.souscPath })
                  else navigate(o.souscPath)
                }}
              >{o.btnLabel}</CTAButton>
              <ul className="offre-features">
                {o.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <div className="offre-footer">
                <span className="info-btn">En savoir plus ›</span>
              </div>
            </div>
          ))}

        </div>

        <GlassButton to="/comparer-offres" className="comparer-offres">Comparer les offres ›</GlassButton>
      </section>

      <section ref={pourquoiRef} className="pourquoi">
        <SectionTitle inView={pourquoiInView}>
          UNE <span className="titre-highlight--vert">BONNE RAISON</span> DE JETER L'ÉPONGE
        </SectionTitle>
        <div className={`pro-verifie-block fade-up${pourquoiInView ? ' visible' : ''}`} ref={todoRef} style={{ transitionDelay: pourquoiInView ? '0.36s' : '0s' }}>
          <PourquoiSlider idx={pvIdx} onDotClick={pvGoTo} />
          <div className="pourquoi-grid pourquoi-grid--inblock">
            {[
              { titre: <>C'EST <span className="mot-vert">NET</span></>, texte: "Un résultat impeccable garanti à chaque intervention, ou on revient." },
              { titre: <>C'EST <span className="mot-vert">PRO</span></>, texte: "Nos intervenants sont salariés, formés et assurés. Pas de surprise, que du sérieux." },
              { titre: <>C'EST <span className="mot-vert">NETPRO</span></>, texte: "Un service pensé pour votre quotidien : flexible, réactif et toujours disponible." },
            ].map((c, i) => (
              <div
                key={i}
                className={`pourquoi-card pourquoi-card--inblock${pvIdx === i ? ' pourquoi-card--active' : ''}`}
                onMouseEnter={() => pvPause(i)}
                onMouseLeave={pvResume}
              >
                <h3>{c.titre}</h3>
                <p>{c.texte}</p>
              </div>
            ))}
          </div>
          <div className="todo-block todo-block--sans">
            <div className="todo-label"><span className="mot-rose">SANS</span> Netpro</div>
            <ul className="todo-list">
              {['Aspirer toute la maison', 'Récurer les toilettes', 'Repasser les chemises'].map((t, i) => (
                <li key={t} className={`${todoCount > i ? 'todo-item--shown' : ''}${i >= 1 ? ' todo-item--barre' : ''}`}>
                  <span className={`todo-check ${i < 1 ? 'todo-check--rose' : 'todo-check--no'}${todoCount > i ? ' todo-check--pop' : ''}`} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="todo-block todo-block--avec">
            <div className="todo-label"><span className="mot-vert">AVEC</span> Netpro</div>
            <ul className="todo-list todo-list--two-cols">
              {["Aller au ciné avec les enfants", "Profiter d'un dimanche en famille", "Retrouver des amis", "Faire du sport sans culpabiliser", "Prendre enfin du temps pour soi", "Partir en week-end l'esprit libre"].map((t, i) => (
                <li key={t} className={todoCount > i ? 'todo-item--shown' : ''}>
                  <span className={`todo-check todo-check--vert${todoCount > i ? ' todo-check--pop' : ''}`} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </section>

      <section className="services-carte">
        <SectionTitle>SERVICES <span className="titre-highlight--rose">À LA CARTE</span></SectionTitle>
        <div className="services-carte-grid">
          {[
            { emoji: '👕', titre: 'Repassage', desc: 'Un pro vient repasser votre linge à domicile', prixNormal: '25€', prixUnit: '/H', prixReduit: '12,50€', prixReduitUnit: '/H', path: '/services/repassage' },
            { emoji: '🚚', titre: 'Livraison à domicile', desc: 'Livraison de produits ménagers sélectionnés par Netpro', prixNormal: null, prixUnit: '', prixReduit: '29€', prixReduitUnit: '', path: '/services/produits' },
            { emoji: '🪟', titre: 'Vitres', desc: 'Nettoyage complet des vitres intérieur et extérieur', prixNormal: '39€', prixUnit: '', prixReduit: '19,50€', prixReduitUnit: '', path: '/services/vitres' },
          ].map(s => (
            <div key={s.titre} className="services-carte-card" onClick={() => navigate(s.path)}>
              <span className="services-carte-emoji">{s.emoji}</span>
              <h3>{s.titre}</h3>
              <p>{s.desc}</p>
              <div className="offre-prix services-carte-prix-bloc">
                <span className="prix-normal-barre" style={{ visibility: (apresImpot && s.prixNormal) ? 'visible' : 'hidden' }}>{s.prixNormal || '—'}<span className="prix-unit">{s.prixUnit}</span></span>
                <span className="a-partir">À partir de</span>
                <span className="prix">{apresImpot && s.prixNormal ? s.prixReduit : (s.prixNormal || s.prixReduit)}<span className="prix-unit">{s.prixReduitUnit}</span></span>
              </div>
              <CTAButton color="orange" onClick={e => { e.stopPropagation(); navigate(s.path) }}>{s.titre === 'Livraison à domicile' ? 'COMMANDER' : 'RÉSERVER'}</CTAButton>
            </div>
          ))}
        </div>
      </section>

      <section ref={avisRef} className="avis">
        <SectionTitle inView={avisInView}>
          ENSEMBLE POUR L'<span className="titre-highlight--vert">AVIS</span>
        </SectionTitle>

        <div ref={statsRef} className={`avis-note fade-up${avisInView ? ' visible' : ''}`} style={{ transitionDelay: avisInView ? '0.1s' : '0s' }}>
          <span>Nos clients nous donnent</span>
          <strong className="note-score">{ratingCounter.toFixed(1).replace('.', ',')}/5</strong>
          <span className="note-sub">Avis clients vérifiés</span>
        </div>

        <div className="avis-marquee-wrapper">
          <div className="avis-marquee-track">
            {[...reviews, ...reviews].map((review, i) => (
              <div key={i} className="avis-card">
                <div className="avis-card-header">
                  <div className="avis-author">
                    <img src={review.avatar} alt={review.name} className="avis-avatar" />
                    <span className="avis-name">{review.name.toUpperCase()}</span>
                  </div>
                  <div className="avis-rating">
                    <Stars count={review.rating} />
                    <span className="avis-score">{review.rating}/5</span>
                  </div>
                </div>
                <p className="avis-text">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="avis-swipe">
          {reviews.map((review, i) => (
            <div key={i} className="avis-card">
              <div className="avis-card-header">
                <div className="avis-author">
                  <img src={review.avatar} alt={review.name} className="avis-avatar" />
                  <span className="avis-name">{review.name.toUpperCase()}</span>
                </div>
                <div className="avis-rating">
                  <Stars count={review.rating} />
                  <span className="avis-score">{review.rating}/5</span>
                </div>
              </div>
              <p className="avis-text">{review.text}</p>
            </div>
          ))}
        </div>

        <div className="avis-reseaux">
          <p className="avis-reseaux-label">Rejoignez-nous sur les réseaux</p>
          <div className="avis-reseaux-icons">
            <a href="#" className="reseau-icon" aria-label="Instagram">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="#" className="reseau-icon" aria-label="Facebook">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="#" className="reseau-icon" aria-label="TikTok">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>


      <Footer />

      {reserverModal.open && (
        <div className="credit-modal-overlay" onClick={() => setReserverModal({ open: false, souscPath: '' })}>
          <div className="credit-modal reserver-modal" onClick={e => e.stopPropagation()}>
            <button className="credit-modal-close" onClick={() => setReserverModal({ open: false, souscPath: '' })}>✕</button>
            <div className="reserver-modal-header">
              <h2 className="reserver-modal-title">Comment souhaitez-vous réserver ?</h2>
              <p className="reserver-modal-sub">Choisissez la façon dont vous préférez procéder.</p>
            </div>
            <div className="reserver-modal-options">
              <button className="reserver-option reserver-option--web" onClick={() => { setReserverModal({ open: false, souscPath: '' }); navigate(reserverModal.souscPath) }}>
                <span className="reserver-option-icon">💻</span>
                <div>
                  <strong>Continuer sur le web</strong>
                  <p>Créez un compte ou connectez-vous pour réserver en ligne.</p>
                </div>
                <span className="reserver-option-arrow">›</span>
              </button>
              <a className="reserver-option reserver-option--tel" href="tel:+33678171947" onClick={() => setReserverModal({ open: false, souscPath: '' })}>
                <span className="reserver-option-icon">📞</span>
                <div>
                  <strong>Réserver par téléphone</strong>
                  <p>Un conseiller Netpro vous accompagne au 06 78 17 19 47.</p>
                </div>
                <span className="reserver-option-arrow">›</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {showCreditModal && <CreditModal onClose={() => setShowCreditModal(false)} />}

    </div>
  )
}

export default Home
