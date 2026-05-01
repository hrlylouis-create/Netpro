import { useState } from 'react'
import CompteLayout from './CompteLayout'
import { useAuth } from './AuthContext'

const CODE = 'BVNB1'

export default function Parrainage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(CODE).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <CompteLayout title="Parrainage">
      <div className="sous-page-info-block">
        <p>🎁 <strong>Parrainez un ami</strong> et offrez-lui <strong>10% de remise</strong> sur sa première session. En échange, vous recevez une session offerte après 3 parrainages validés.</p>
      </div>

      <div className="sous-page-card">
        <p className="sous-page-label">Votre code de parrainage</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span className="sous-page-code">{CODE}</span>
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 10,
              padding: '8px 16px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 13,
              cursor: 'pointer',
              color: '#1A1A1A',
              transition: 'background 0.2s',
            }}
          >
            {copied ? '✓ Copié !' : 'Copier'}
          </button>
        </div>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#888', marginTop: 4 }}>
          Partagez ce code à vos proches avant leur première réservation.
        </p>
      </div>

      <div className="sous-page-card">
        <p className="sous-page-label">Mes parrainages</p>
        <div className="sous-page-empty" style={{ paddingTop: 16, paddingBottom: 8 }}>
          <span className="sous-page-empty-icon">👥</span>
          <p>Aucun parrainage enregistré pour l'instant.</p>
        </div>
        <hr className="sous-page-divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="sous-page-label">Sessions offertes débloquées</span>
          <span style={{ fontFamily: 'Boulder, sans-serif', fontSize: 22, color: '#F4824A' }}>0</span>
        </div>
      </div>
    </CompteLayout>
  )
}
