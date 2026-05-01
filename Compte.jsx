import './Compte.css'
import './Home.css'
import { useNavigate } from 'react-router-dom'
import Footer from './Footer'
import logo from './assets/netpro-logo.png'
import { useAuth } from './AuthContext'
import CTAButton from './CTAButton'
import GlassButton from './GlassButton'
import { useState, useRef, useEffect } from 'react'

const FAQ_ITEMS = [
  { q: "Comment modifier mes informations personnelles ?",   a: "Rendez-vous dans la section \"Mes infos\" pour mettre à jour votre adresse, prénom, nom ou email." },
  { q: "Comment suspendre ou annuler mon abonnement ?",      a: "Vous pouvez mettre en pause ou résilier votre abonnement depuis \"Mes sessions\" à tout moment, sans frais." },
  { q: "Où trouver mes factures ?",                          a: "Toutes vos factures sont disponibles dans la section \"Mes factures\", téléchargeables en PDF." },
  { q: "Comment bénéficier du crédit d'impôt ?",            a: "Dans \"Mes impôts\", liez votre compte Netpro à votre espace URSSAF pour activer l'avance immédiate à 50%." },
  { q: "Comment parrainer un ami ?",                         a: "Partagez votre code BVNB1 à un proche. Il bénéficiera de 10% de remise sur sa première session." },
  { q: "Mon pro peut-il être remplacé ?",                    a: "En cas d'indisponibilité, Netpro vous propose un remplaçant qualifié dans les meilleurs délais." },
]

const MENU_ITEMS = [
  { label: 'MES SESSIONS',      desc: 'Consultez vos sessions passées et à venir',    icon: '🗓️', path: '/compte/sessions' },
  { label: 'MES FACTURES',      desc: 'Jetez un œil à vos factures détaillées',       icon: '🧾', path: '/compte/factures' },
  { label: 'MOYEN DE PAIEMENT', desc: 'Modifiez votre moyen de paiement',             icon: '💳', path: '/compte/paiement' },
  { label: 'MES IMPÔTS',        desc: 'Liez votre compte Netpro à un compte URSSAF',  icon: '📋', path: '/compte/impots' },
  { label: 'MES INFOS',         desc: 'Mettez à jour vos informations personnelles',  icon: '👤', path: '/compte/infos' },
  { label: 'PARRAINAGE',        desc: '10% de remise avec le code BVNB1 !',           icon: '🎁', path: '/compte/parrainage' },
]

const NOTIF_ICONS = { success: '✓', warning: '⚠', info: 'ℹ' }
const NOTIF_COLORS = { success: '#22C55E', warning: '#F4824A', info: '#3B82F6' }

function Avatar({ prenom }) {
  const initiale = prenom ? prenom[0].toUpperCase() : '?'
  return (
    <div className="compte-avatar">
      {initiale}
    </div>
  )
}

function Compte() {
  const navigate = useNavigate()
  const { user, logout, accountData, loading } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)
  const [profilOpen, setProfilOpen] = useState(false)
  const [auRevoir, setAuRevoir] = useState(false)
  const [dismissedNotifs, setDismissedNotifs] = useState([])
  const profilCloseRef = useRef(null)

  function openProfil() {
    clearTimeout(profilCloseRef.current)
    setProfilOpen(true)
  }
  function closeProfil() {
    profilCloseRef.current = setTimeout(() => setProfilOpen(false), 2500)
  }

  function handleLogout() {
    logout()
    navigate('/connexion')
  }

  useEffect(() => {
    if (!loading && !user) navigate('/connexion')
  }, [loading, user])

  if (loading || !user) return null

  function addToCalendar(session) {
    const dateMap = {
      'Jan.': '01', 'Fév.': '02', 'Mar.': '03', 'Avr.': '04', 'Mai': '05', 'Juin': '06',
      'Juil.': '07', 'Aoû.': '08', 'Sep.': '09', 'Oct.': '10', 'Nov.': '11', 'Déc.': '12'
    }
    const parts = session.date.split(' ')
    const day = parts[0].padStart(2, '0')
    const month = dateMap[parts[1]] || '01'
    const year = parts[2] || new Date().getFullYear()
    const dtStart = `${year}${month}${day}T090000`
    const dtEnd = `${year}${month}${day}T120000`
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Netpro//FR',
      'BEGIN:VEVENT',
      `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
      `SUMMARY:Session Netpro – ${session.type}`,
      `DESCRIPTION:Intervention de ${session.pro}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'session-netpro.ics'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const notifications = (accountData.notifications || []).filter(n => !dismissedNotifs.includes(n.id))
  const abonnement = accountData.abonnement
  const pro = accountData.pro
  const sessions = accountData.sessions || []
  const sessionPlanifiee = sessions.find(s => s.statut === 'planifiee')
  const sessionTerminee = sessions.find(s => s.statut === 'terminee')
  const hasLinks = !!sessionTerminee

  return (
    <div className="compte-page">
      <div className="gradient-bg" aria-hidden="true">
        <div className="blob blob-orange" />
        <div className="blob blob-pink" />
        <div className="blob blob-orange2" />
        <div className="blob blob-pink2" />
      </div>
      <header className="compte-header">
        <img src={logo} alt="Netpro" className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        <nav className="header-nav">
          <div className="header-profil-wrap" onMouseEnter={openProfil} onMouseLeave={closeProfil}>
            <div className="header-profil-anchor">
              <div className={`header-profil-menu${profilOpen ? ' is-open' : ''}`}>
                <GlassButton onClick={handleLogout} onMouseEnter={() => setAuRevoir(true)} onMouseLeave={() => setAuRevoir(false)}>Se déconnecter</GlassButton>
              </div>
              <div className={`compte-icon-bubble${profilOpen ? ' is-expanded' : ''}`}>
                <span className="compte-icon-letter">{user.prenom?.[0]?.toUpperCase()}</span>
                <span className="compte-icon-bonjour">{auRevoir ? 'AU REVOIR ?' : <><span style={{fontFamily:'inherit'}}>BONJOUR </span><span className="compte-icon-prenom">{user.prenom?.toUpperCase()}</span></>}</span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {notifications.length > 0 && (
        <div className="compte-notif-bar">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className="compte-notif"
              style={{ borderLeftColor: NOTIF_COLORS[notif.type] }}
            >
              <span className="compte-notif-icon" style={{ color: NOTIF_COLORS[notif.type] }}>
                {NOTIF_ICONS[notif.type]}
              </span>
              <span className="compte-notif-message">{notif.message}</span>
              <button
                className="compte-notif-close"
                onClick={() => setDismissedNotifs(prev => [...prev, notif.id])}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      <section className="compte-hero">
        <Avatar prenom={user.prenom} />
        <h1 className="compte-bonjour">
          BONJOUR <span className="titre-highlight">{user.prenom?.toUpperCase()}</span>
        </h1>

        {abonnement ? (
          <div className="compte-abonnement-card">
            <div className="compte-abonnement-left">
              <span className="compte-abonnement-badge">ACTIF</span>
              <div>
                <p className="compte-abonnement-type">{abonnement.label}</p>
                <p className="compte-abonnement-meta">Depuis {abonnement.depuis} · Prochaine facturation le {abonnement.prochaine_facturation}</p>
              </div>
            </div>
            <div className="compte-abonnement-right">
              <span className="compte-abonnement-montant">{abonnement.montant}</span>
              <GlassButton onClick={() => navigate('/compte/sessions')}>Gérer</GlassButton>
            </div>
          </div>
        ) : (
          <div className="compte-abonnement-card compte-abonnement-cta">
            <div>
              <p className="compte-abonnement-type">Pas encore abonné</p>
              <p className="compte-abonnement-meta">Profitez de l'avance immédiate à 50%</p>
            </div>
            <CTAButton color="orange" onClick={() => navigate('/')}>S'ABONNER</CTAButton>
          </div>
        )}

        <div className="compte-hero-columns">
          <div className="compte-hero-left">
            <div className="compte-prochaine">
              <p className="compte-prochaine-label">VOTRE PROCHAINE SESSION</p>
              {sessionPlanifiee ? (
                <div className="compte-session-info">
                  <div className="compte-session-date">{sessionPlanifiee.date}</div>
                  <div className="compte-session-detail">{sessionPlanifiee.type} · {sessionPlanifiee.pro}</div>
                  <GlassButton onClick={() => addToCalendar(sessionPlanifiee)} className="compte-cal-btn">📅 Ajouter au calendrier</GlassButton>
                </div>
              ) : (
                <div className="compte-prochaine-empty">
                  <span className="compte-dust-icon">🧹</span>
                  <p>Ça prend la poussière ici</p>
                  <CTAButton color="orange" onClick={() => navigate('/')}>RÉSERVER</CTAButton>
                </div>
              )}
            </div>

            <div className="compte-historique">
              <p className="compte-historique-label">DERNIÈRE SESSION</p>
              {sessionTerminee ? (
                <div className="compte-session-info">
                  <div className="compte-session-date">{sessionTerminee.date}</div>
                  <div className="compte-session-detail">{sessionTerminee.type} · {sessionTerminee.pro}</div>
                </div>
              ) : (
                <div className="compte-historique-empty">
                  <span className="compte-dust-icon">📋</span>
                  <p>Aucune session passée pour l'instant</p>
                </div>
              )}

              {pro && (
                <div className="compte-pro-card">
                  <div className="compte-pro-avatar">{pro.initiale}</div>
                  <div className="compte-pro-info">
                    <span className="compte-pro-nom">{pro.prenom} {pro.nom}</span>
                    <span className="compte-pro-note">⭐ {pro.note} · {pro.sessions} sessions</span>
                  </div>
                </div>
              )}

              <div className="compte-historique-links">
                <button
                  className={`compte-historique-link${!hasLinks ? ' disabled' : ''}`}
                  onClick={() => hasLinks && navigate('/compte/factures')}
                  disabled={!hasLinks}
                >
                  <span>🧾</span> Voir la facture
                </button>
                <button
                  className={`compte-historique-link${!hasLinks ? ' disabled' : ''}`}
                  onClick={() => hasLinks && navigate('/compte/satisfaction')}
                  disabled={!hasLinks}
                >
                  <span>⭐</span> Enquête de satisfaction
                </button>
              </div>
            </div>
          </div>

          <div className="compte-hero-right">
            <section className="compte-menu">
              {MENU_ITEMS.map((item, i) => (
                <div className="compte-menu-card" key={i} onClick={() => navigate(item.path)}>
                  <span className="compte-menu-icon">{item.icon}</span>
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </section>

            <section className="compte-services">
              <h3 className="compte-services-titre">SERVICES À LA CARTE</h3>
              <div className="compte-services-grid">
                <div className="compte-service-card" onClick={() => navigate('/services/repassage')}>
                  <span className="compte-service-emoji">👕</span>
                  <div>
                    <strong>Repassage</strong>
                    <p>À partir de 25€/h</p>
                  </div>
                </div>
                <div className="compte-service-card" onClick={() => navigate('/services/vitres')}>
                  <span className="compte-service-emoji">🪟</span>
                  <div>
                    <strong>Vitres</strong>
                    <p>Forfait dès 39€</p>
                  </div>
                </div>
                <div className="compte-service-card" onClick={() => navigate('/services/produits')}>
                  <span className="compte-service-emoji">🧴</span>
                  <div>
                    <strong>Produits ménagers</strong>
                    <p>Pack dès 29€</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="compte-faq">
        <h2 className="compte-faq-titre">ON RÉPOND À <span className="titre-highlight">VOS QUESTIONS</span></h2>
        <div className="compte-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div
              className={`compte-faq-item${openFaq === i ? ' open' : ''}`}
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="compte-faq-q">
                <span>{item.q}</span>
                <span className="compte-faq-icon">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <p className="compte-faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Compte
