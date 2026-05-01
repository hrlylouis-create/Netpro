import CompteLayout from './CompteLayout'
import { useAuth } from './AuthContext'
import CTAButton from './CTAButton'
import { useState } from 'react'

export default function Satisfaction() {
  const { accountData } = useAuth()
  const sessions = accountData.sessions || []
  const lastSession = sessions.find(s => s.statut === 'terminee')

  const [note, setNote] = useState(0)
  const [hover, setHover] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [recommande, setRecommande] = useState(null)
  const [envoye, setEnvoye] = useState(false)

  function handleEnvoyer() {
    if (note === 0) return
    setEnvoye(true)
  }

  if (envoye) {
    return (
      <CompteLayout title="Enquête de satisfaction">
        <div className="sous-page-card" style={{ alignItems: 'center', padding: '60px 32px', textAlign: 'center', gap: 24 }}>
          <span style={{ fontSize: 48 }}>⭐</span>
          <p style={{ fontFamily: 'Boulder, sans-serif', fontSize: 24, textTransform: 'uppercase', color: '#1A1A1A' }}>
            Merci pour votre retour !
          </p>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: '#1A1A1A', lineHeight: 1.6 }}>
            Votre avis nous aide à améliorer nos services.
          </p>
        </div>
      </CompteLayout>
    )
  }

  return (
    <CompteLayout title="Enquête de satisfaction">
      <div className="sous-page-card">
        {lastSession ? (
          <div className="satisfaction-session-recap">
            <span className="satisfaction-session-icon">🗓️</span>
            <div>
              <p className="sous-page-label">Session du {lastSession.date}</p>
              <p className="sous-page-value">{lastSession.type} · {lastSession.pro}</p>
            </div>
          </div>
        ) : (
          <div className="sous-page-empty">
            <span className="sous-page-empty-icon">📋</span>
            <p>Aucune session terminée pour l'instant.</p>
          </div>
        )}
      </div>

      <div className="sous-page-card">
        <p className="sous-page-label">Votre note</p>
        <div className="satisfaction-stars">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              className={`satisfaction-star${i <= (hover || note) ? ' active' : ''}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setNote(i)}
              aria-label={`${i} étoile${i > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>

        <div className="sous-page-field">
          <label className="sous-page-label">Votre commentaire</label>
          <textarea
            className="sous-page-input satisfaction-textarea"
            placeholder="Qu'avez-vous pensé de cette session ?"
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <p className="sous-page-label" style={{ marginBottom: 12 }}>Recommanderiez-vous Netpro ?</p>
          <div className="satisfaction-recommande">
            {['Oui', 'Peut-être', 'Non'].map(val => (
              <button
                key={val}
                className={`satisfaction-recommande-btn${recommande === val ? ' active' : ''}`}
                onClick={() => setRecommande(val)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <CTAButton
          color="orange"
          onClick={handleEnvoyer}
          style={{ alignSelf: 'flex-start', opacity: note === 0 ? 0.5 : 1 }}
        >
          ENVOYER
        </CTAButton>
      </div>
    </CompteLayout>
  )
}
