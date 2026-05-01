import './Home.css'
import './Essentiel.css'
import './CompareOffres.css'
import { Link } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Footer from './Footer'
import GlassButton from './GlassButton'
import { useAuth } from './AuthContext'
import logo from './assets/netpro-logo.png'

const OFFRES = [
  { key: 'rap', label: 'ESSENTIEL', sous: 'Rapide et efficace',                    prix: '28,90€', color: '#F4717F', to: '/essentiel', btnLabel: 'RÉSERVER' },
  { key: 'reg', label: 'SÉRÉNITÉ',  sous: 'Toujours nickel, toujours serein',      prix: '31,90€', color: '#22C55E', to: '/serenite',  btnLabel: "M'ABONNER", pop: true },
  { key: 'gm',  label: 'INTÉGRAL',  sous: 'En profondeur, résultat irréprochable', prix: '34,90€', color: '#F4824A', to: '/integral',  btnLabel: 'RÉSERVER' },
]



function CompareOffres() {
  const { user } = useAuth()
  const offresRef = useRef(null)
  const [stickyVisible, setStickyVisible] = useState(false)

  useEffect(() => {
    const check = () => {
      const el = offresRef.current
      if (!el) return
      const { bottom } = el.getBoundingClientRect()
      setStickyVisible(bottom < 49)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <>
    <div className="co-page">
      <div className="gradient-bg" aria-hidden="true">
        <div className="blob blob-orange" />
        <div className="blob blob-pink" />
        <div className="blob blob-orange2" />
        <div className="blob blob-pink2" />
      </div>

      <header className="home-header co-page-header">
        <Link to="/"><img src={logo} alt="Netpro" className="header-logo" /></Link>
        <div className={`co-header-offres${stickyVisible ? ' co-header-offres--visible' : ''}`}>
          {OFFRES.map((o, i) => {
            const centers = ['calc(50% - 276px)', '50%', 'calc(50% + 276px)']
            return (
              <Link key={o.key} to={o.to} className="co-header-offre-item" style={{ left: centers[i] }}>
                <span className="co-sticky-label" style={{ color: o.color }}>{o.label}</span>
                <span className="co-sticky-prix" style={{ color: o.color }}>{o.prix}<span className="co-sticky-unit">/h</span></span>
              </Link>
            )
          })}
        </div>
        <nav className="header-nav">
          <GlassButton href="tel:+33678171947" className="header-tel">📞&nbsp;06 78 17 19 47</GlassButton>
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

      <main className="co-main">
        {/* ── Cards offres ── */}
        <div className="co-row co-row--offres" ref={offresRef}>
          <div className="co-cell co-cell--empty co-cell--title-col">
            <h1 className="co-title">COMPAREZ LES OFFRES</h1>
          </div>
          {OFFRES.map(o => (
            <div key={o.key} className={`co-cell co-cell--header${o.pop ? ' co-cell--header-pop' : ''}`}>
              {o.pop && <div className="co-header-badge">Populaire</div>}
              <span className="co-header-label" style={{ color: o.color }}>{o.label}</span>
              <span className="co-header-sous">{o.sous}</span>
              <div className="co-header-prix">
                <span className="co-header-montant" style={{ color: o.color }}>{o.prix}</span>
                <span className="co-header-unit">/h</span>
              </div>
              <Link to={o.to} className="co-header-btn" style={{ background: o.color }}>
                {o.btnLabel}
              </Link>
            </div>
          ))}
        </div>

        <div className="co-table">

        {/* ── Résumé ── */}
        <div className="co-row">
          <div className="co-cell co-cell--label"><span className="co-cat-name">Résumé</span></div>
          <div className="co-cell co-cell--data co-cell--dark">
            <p>Session rapide <strong>garantie dans la semaine</strong>, réservée en <strong>5 minutes</strong></p>
          </div>
          <div className="co-cell co-cell--data co-cell--dark">
            <p>Sessions <strong>régulières flexibles</strong>, toujours au <strong>même niveau d'exigence</strong></p>
          </div>
          <div className="co-cell co-cell--data co-cell--dark">
            <p>Une <strong>session longue</strong> pour tout traiter <strong>en profondeur</strong>, sans rien laisser de côté</p>
          </div>
        </div>

        {/* ── Mode ── */}
        <div className="co-row">
          <div className="co-cell co-cell--label"><span className="co-cat-name">Mode de fonctionnement</span></div>
          <div className="co-cell co-cell--data"><p>Ponctuel</p></div>
          <div className="co-cell co-cell--data"><p>Abonnement<br />sans engagement</p></div>
          <div className="co-cell co-cell--data"><p>Ponctuel</p></div>
        </div>

        {/* ── Pro ── */}
        <div className="co-row">
          <div className="co-cell co-cell--label"><span className="co-cat-name">Pro</span></div>
          <div className="co-cell co-cell--data"><p>Le meilleur disponible dans le secteur</p></div>
          <div className="co-cell co-cell--data"><p>Un pro attitré — possibilité de choisir</p></div>
          <div className="co-cell co-cell--data"><p>Le meilleur disponible</p></div>
        </div>

        {/* ── Délai ── */}
        <div className="co-row">
          <div className="co-cell co-cell--label"><span className="co-cat-name">Délai</span></div>
          <div className="co-cell co-cell--data"><p>Garanti en 48h</p></div>
          <div className="co-cell co-cell--data"><p>Garanti en 48h</p></div>
          <div className="co-cell co-cell--data"><p>Garanti en 72h</p></div>
        </div>

        {/* ── Durée ── */}
        <div className="co-row">
          <div className="co-cell co-cell--label"><span className="co-cat-name">Durée</span></div>
          <div className="co-cell co-cell--data"><p>De 1h30 à 2h</p></div>
          <div className="co-cell co-cell--data"><p>De 1h30 à 6h</p></div>
          <div className="co-cell co-cell--data"><p>De 3h30 à 7h</p></div>
        </div>

        {/* ── Avantage ── */}
        <div className="co-row">
          <div className="co-cell co-cell--label"><span className="co-cat-name">Avantage fidélité</span></div>
          <div className="co-cell co-cell--data"><p>—</p></div>
          <div className="co-cell co-cell--data"><p>1 Intégral au prix d'une session Sérénité toutes les 10 prestations</p></div>
          <div className="co-cell co-cell--data"><p>—</p></div>
        </div>

        {/* ── Services ── */}
        <div className="co-row co-row--section-label">
          <div className="co-cell co-cell--label"><span className="co-cat-name">Services</span></div>
        </div>
        {(() => {
          const services = [
            { emoji: '🧽', label: 'Dépoussiérage des surfaces',              rap: true,  reg: true,  gm: true  },
            { emoji: '🧹', label: 'Aspiration, balayage et lavage des sols', rap: true,  reg: true,  gm: true  },
            { emoji: '🧼', label: 'Désinfection des zones de contact',       rap: true,  reg: true,  gm: true  },
            { emoji: '🛏️', label: 'Changement du linge de lit',              rap: true,  reg: true,  gm: true  },
            { emoji: '🗑️', label: 'Entretien des poubelles',                 rap: true,  reg: true,  gm: true  },
            { emoji: '🍳', label: 'Dégraissage surfaces de cuisine',         rap: true,  reg: true,  gm: true  },
            { emoji: '🚿', label: 'Détartrage de la salle de bain',          rap: false, reg: true,  gm: true  },
            { emoji: '🏠', label: 'Nettoyage de l\'électroménager',          rap: false, reg: true,  gm: true  },
            { emoji: '🪣', label: 'Lessivage des murs',                         rap: false, reg: false, gm: true  },
            { emoji: '🗄️', label: 'Intérieur des placards',                  rap: false, reg: false, gm: true  },
          ]
          return (
            <div className="co-row co-row--block">
              <div className="co-cell co-cell--label co-block-col">
                {services.map(s => (
                  <div key={s.label} className="co-block-item">
                    <span className="co-service-emoji">{s.emoji}</span>
                    <span className="co-service-name">{s.label}</span>
                  </div>
                ))}
              </div>
              {['rap', 'reg', 'gm'].map(key => (
                <div key={key} className="co-cell co-cell--data co-block-col">
                  {services.map(s => (
                    <div key={s.label} className="co-block-item co-block-item--center">
                      <span className={s[key] ? 'co-check' : 'co-dash'}>{s[key] ? '✓' : '✗'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        })()}

        {/* ── Options ── */}
        <div className="co-row co-row--section-label">
          <div className="co-cell co-cell--label"><span className="co-cat-name">Options à 3€</span></div>
        </div>
        {(() => {
          const options = [
            { emoji: '🪟', label: 'Nettoyage des vitres', sub: '+3€/h', rap: { v: true, o: false }, reg: { v: true, o: true  }, gm: { v: true,  o: true  } },
            { emoji: '🪴', label: 'Arrosage des plantes', sub: '+3€/s', rap: { v: true, o: false }, reg: { v: true, o: true  }, gm: { v: false, o: false } },
            { emoji: '👕', label: 'Repassage',            sub: '+3€/h', rap: { v: true, o: false }, reg: { v: true, o: false }, gm: { v: false, o: false } },
            { emoji: '🧴', label: 'Produits ménagers',    sub: '+3€/h', rap: { v: true, o: false }, reg: { v: true, o: false }, gm: { v: true,  o: false } },
          ]
          return (
            <div className="co-row co-row--block">
              <div className="co-cell co-cell--label co-block-col">
                {options.map(opt => (
                  <div key={opt.label} className="co-block-item co-block-item--spread">
                    <div className="co-service-left">
                      <span className="co-service-emoji">{opt.emoji}</span>
                      <span className="co-service-name">{opt.label}</span>
                    </div>
                    <span className="co-service-sub">{opt.sub}</span>
                  </div>
                ))}
              </div>
              {['rap', 'reg', 'gm'].map(key => (
                <div key={key} className="co-cell co-cell--data co-block-col">
                  {options.map(opt => (
                    <div key={opt.label} className="co-block-item co-block-item--center">
                      {!opt[key].v
                        ? <span className="co-dash">✗</span>
                        : opt[key].o
                          ? <span className="co-badge-offert">OFFERT</span>
                          : <span className="co-check">✓</span>
                      }
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        })()}

        </div> {/* co-table */}

        <Footer />
      </main>
    </div>
    </>
  )
}


export default CompareOffres
