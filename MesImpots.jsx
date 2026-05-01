import { useState } from 'react'
import CompteLayout from './CompteLayout'
import CTAButton from './CTAButton'

export default function MesImpots() {
  const [linked, setLinked] = useState(false)
  const [urssaf, setUrssaf] = useState('')

  return (
    <CompteLayout title="Mes Impôts">
      <div className="sous-page-info-block">
        <p>💡 <strong>Crédit d'impôt à 50%</strong> — En liant votre compte Netpro à votre espace URSSAF, vous bénéficiez de l'avance immédiate du crédit d'impôt. Vous ne payez que 50% du montant à chaque session.</p>
      </div>

      <div className="sous-page-card">
        <p className="sous-page-label">Statut</p>
        {linked ? (
          <p className="sous-page-success">✓ Votre compte URSSAF est lié. L'avance immédiate est active.</p>
        ) : (
          <>
            <div className="sous-page-empty" style={{ paddingTop: 16, paddingBottom: 8 }}>
              <span className="sous-page-empty-icon">📋</span>
              <p>Compte URSSAF non lié.</p>
            </div>
            <hr className="sous-page-divider" />
            <div className="sous-page-field">
              <label className="sous-page-label">Numéro URSSAF</label>
              <input
                className="sous-page-input"
                placeholder="Ex : 1234567890123"
                value={urssaf}
                onChange={e => setUrssaf(e.target.value.replace(/\D/g, '').slice(0, 13))}
              />
            </div>
            <CTAButton color="orange" onClick={() => urssaf.length >= 10 && setLinked(true)}>LIER MON COMPTE</CTAButton>
          </>
        )}
      </div>

      <div className="sous-page-card">
        <p className="sous-page-label">Comment ça fonctionne ?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['1', 'Entrez votre numéro URSSAF ci-dessus.'],
            ['2', 'Netpro transmet automatiquement vos sessions à l\'administration fiscale.'],
            ['3', 'Vous ne payez que 50% du montant à chaque session, sans attendre votre déclaration.'],
          ].map(([n, text]) => (
            <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'Boulder, sans-serif', fontSize: 18, color: '#F4824A', flexShrink: 0 }}>{n}.</span>
              <p className="sous-page-value" style={{ margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </CompteLayout>
  )
}
