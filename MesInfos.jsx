import { useState } from 'react'
import CompteLayout from './CompteLayout'
import CTAButton from './CTAButton'
import { useAuth } from './AuthContext'

const ANIMAUX = ['🐶 Chien', '🐱 Chat', '🐾 Autre']

export default function MesInfos() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    civilite: user.civilite || '',
    prenom: user.prenom || '',
    nom: user.nom || '',
    email: user.email || '',
    adresse: user.adresse || '',
    date_naissance: user.date_naissance || '',
    animaux: user.animaux || [],
  })
  const [saved, setSaved] = useState(false)

  const [savedAddresses, setSavedAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('netpro_saved_addresses') || '[]') } catch { return [] }
  })

  function removeAddress(addr) {
    const next = savedAddresses.filter(a => a !== addr)
    setSavedAddresses(next)
    localStorage.setItem('netpro_saved_addresses', JSON.stringify(next))
  }

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setSaved(false)
  }

  function toggleAnimal(animal) {
    setForm(f => {
      const next = f.animaux.includes(animal)
        ? f.animaux.filter(a => a !== animal)
        : [...f.animaux, animal]
      return { ...f, animaux: next }
    })
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    updateUser(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <CompteLayout title="Mes Infos">
      <form onSubmit={handleSave} style={{ display: 'contents' }}>

        <div className="sous-page-card">
          <p className="sous-page-label">Identité</p>
          <div className="sous-page-field">
            <label className="sous-page-label">Civilité</label>
            <select className="sous-page-input" value={form.civilite} onChange={e => set('civilite', e.target.value)}>
              <option value="">—</option>
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
            </select>
          </div>
          <div className="sous-page-row">
            <div className="sous-page-field">
              <label className="sous-page-label">Prénom</label>
              <input className="sous-page-input" value={form.prenom} onChange={e => set('prenom', e.target.value)} />
            </div>
            <div className="sous-page-field">
              <label className="sous-page-label">Nom</label>
              <input className="sous-page-input" value={form.nom} onChange={e => set('nom', e.target.value)} />
            </div>
          </div>
          <div className="sous-page-field">
            <label className="sous-page-label">Date de naissance</label>
            <input className="sous-page-input" type="date" value={form.date_naissance} onChange={e => set('date_naissance', e.target.value)} />
          </div>
        </div>

        <div className="sous-page-card">
          <p className="sous-page-label">Contact</p>
          <div className="sous-page-field">
            <label className="sous-page-label">Email</label>
            <input className="sous-page-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="sous-page-field">
            <label className="sous-page-label">Adresse principale</label>
            <input className="sous-page-input" value={form.adresse} onChange={e => set('adresse', e.target.value)} placeholder="Ex : 12 rue de la Paix, 75001 Paris" />
          </div>
          {savedAddresses.length > 0 && (
            <div className="sous-page-field">
              <label className="sous-page-label">Adresses favorites</label>
              <div className="mes-infos-adresses">
                {savedAddresses.map((addr, i) => (
                  <div key={i} className="mes-infos-adresse-item">
                    <span>⭐</span>
                    <span>{addr}</span>
                    <button type="button" className="mes-infos-adresse-remove" onClick={() => removeAddress(addr)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sous-page-card">
          <p className="sous-page-label">Animaux à domicile</p>
          <p className="mes-infos-animaux-hint">Votre pro sera informé pour adapter son intervention.</p>
          <div className="mes-infos-animaux">
            {ANIMAUX.map(animal => (
              <button
                key={animal}
                type="button"
                className={`mes-infos-animal-btn${form.animaux.includes(animal) ? ' active' : ''}`}
                onClick={() => toggleAnimal(animal)}
              >
                {animal}
              </button>
            ))}
          </div>
        </div>

        {saved && <p className="sous-page-success">✓ Informations mises à jour.</p>}
        <CTAButton color="orange" type="submit">ENREGISTRER</CTAButton>
      </form>
    </CompteLayout>
  )
}
