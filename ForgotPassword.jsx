import './Login.css'
import { Link, useNavigate } from 'react-router-dom'
import logo from './assets/netpro-logo.png'
import { useState } from 'react'
import CTAButton from './CTAButton'
import GlassButton from './GlassButton'

function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(36)
}

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleCheckEmail() {
    if (!email) { setError('Veuillez entrer votre adresse mail.'); return }
    const users = JSON.parse(localStorage.getItem('netpro_users') || '[]')
    const found = users.find(u => u.email === email)
    if (!found) { setError('Aucun compte associé à cet email.'); return }
    setError('')
    setStep('reset')
  }

  function handleReset() {
    if (!password) { setError('Veuillez entrer un nouveau mot de passe.'); return }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    const users = JSON.parse(localStorage.getItem('netpro_users') || '[]')
    const updated = users.map(u => u.email === email ? { ...u, password: hashPassword(password) } : u)
    localStorage.setItem('netpro_users', JSON.stringify(updated))
    setStep('done')
  }

  return (
    <div className="login-page">
      <div className="gradient-bg" aria-hidden="true">
        <div className="blob blob-orange" />
        <div className="blob blob-pink" />
        <div className="blob blob-orange2" />
        <div className="blob blob-pink2" />
      </div>

      <header className="login-header">
        <Link to="/"><img src={logo} alt="Netpro" className="header-logo" /></Link>
        <nav className="login-header-nav">
          <GlassButton href="tel:+33678171947">📞 <strong>06 78 17 19 47</strong></GlassButton>
          <GlassButton to="/connexion">Se connecter</GlassButton>
        </nav>
      </header>

      <main className="login-main">
        <div className="login-card">

          {step === 'email' && (
            <>
              <h1 className="login-title" style={{ fontSize: '28px', textAlign: 'center' }}>VOUS AVEZ OUBLIÉ<br />VOTRE MOT DE PASSE&nbsp;?</h1>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#1A1A1A', textAlign: 'center', lineHeight: 1.5, marginBottom: '4px' }}>
                On passe l'éponge pour cette fois-ci.
              </p>
              <input
                type="email"
                placeholder="Adresse mail"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCheckEmail()}
              />
              {error && <p className="login-error">{error}</p>}
              <CTAButton color="green" onClick={handleCheckEmail} fullWidth>CONTINUER</CTAButton>
              <GlassButton to="/connexion" >‹ Retour</GlassButton>
            </>
          )}

          {step === 'reset' && (
            <>
              <h1 className="login-title">NOUVEAU MDP</h1>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#1A1A1A', textAlign: 'center', lineHeight: 1.5, marginBottom: '4px' }}>
                Choisissez un nouveau mot de passe pour <strong>{email}</strong>
              </p>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {error && <p className="login-error">{error}</p>}
              <CTAButton color="green" onClick={handleReset} fullWidth>RÉINITIALISER</CTAButton>
              <GlassButton onClick={() => { setStep('email'); setError('') }} >‹ Retour</GlassButton>
            </>
          )}

          {step === 'done' && (
            <>
              <h1 className="login-title">SUCCÈS</h1>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#1A1A1A', textAlign: 'center', lineHeight: 1.6 }}>
                Votre mot de passe a bien été mis à jour.<br />Vous pouvez maintenant vous connecter.
              </p>
              <CTAButton color="green" onClick={() => navigate('/connexion')} fullWidth>SE CONNECTER</CTAButton>
            </>
          )}

        </div>
      </main>
    </div>
  )
}

export default ForgotPassword
