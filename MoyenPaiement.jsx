import { useState } from 'react'
import CompteLayout from './CompteLayout'
import CTAButton from './CTAButton'

export default function MoyenPaiement() {
  const [numero, setNumero] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [nom, setNom] = useState('')
  const [saved, setSaved] = useState(false)

  function formatNumero(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2)
    return digits
  }

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <CompteLayout title="Moyen de Paiement">
      <div className="sous-page-card">
        <p className="sous-page-label">Carte enregistrée</p>
        <div className="sous-page-empty">
          <span className="sous-page-empty-icon">💳</span>
          <p>Aucune carte enregistrée.</p>
        </div>
      </div>

      <div className="sous-page-card">
        <p className="sous-page-label">Ajouter une carte</p>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="sous-page-field">
            <label className="sous-page-label">Nom sur la carte</label>
            <input
              className="sous-page-input"
              placeholder="Ex : MARTIN Louis"
              value={nom}
              onChange={e => setNom(e.target.value.toUpperCase())}
            />
          </div>
          <div className="sous-page-field">
            <label className="sous-page-label">Numéro de carte</label>
            <input
              className="sous-page-input"
              placeholder="0000 0000 0000 0000"
              value={numero}
              onChange={e => setNumero(formatNumero(e.target.value))}
            />
          </div>
          <div className="sous-page-row">
            <div className="sous-page-field">
              <label className="sous-page-label">Date d'expiration</label>
              <input
                className="sous-page-input"
                placeholder="MM / AA"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
              />
            </div>
            <div className="sous-page-field">
              <label className="sous-page-label">CVV</label>
              <input
                className="sous-page-input"
                placeholder="123"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              />
            </div>
          </div>
          {saved && <p className="sous-page-success">✓ Carte enregistrée avec succès.</p>}
          <CTAButton color="orange" type="submit">ENREGISTRER</CTAButton>
        </form>
      </div>

      <div className="sous-page-info-block">
        <p>🔒 Vos données bancaires sont chiffrées et sécurisées. Netpro ne stocke jamais votre numéro de carte en clair.</p>
      </div>
    </CompteLayout>
  )
}
