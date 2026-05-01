import './Login.css'
import { Link, useNavigate } from 'react-router-dom'
import logo from './assets/netpro-logo.png'
import { useState } from 'react'
import { useAuth } from './AuthContext'
import CTAButton from './CTAButton'
import GlassButton from './GlassButton'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true)
    const result = await login({ email, password })
    setLoading(false)
    if (result.ok) navigate('/compte')
    else setError(result.error)
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
          <GlassButton to="/inscription">Créer un compte</GlassButton>
        </nav>
      </header>

      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">CONNEXION</h1>

          <input
            type="email"
            placeholder="Adresse mail"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <Link to="/mot-de-passe-oublie" className="forgot">Mot de passe oublié ?</Link>

          <CTAButton color="green" onClick={handleSubmit} fullWidth disabled={loading}>{loading ? 'CHARGEMENT...' : 'SE CONNECTER'}</CTAButton>

          <p className="login-signup">
            Pas de compte ?&nbsp;
            <Link to="/inscription">Créez un compte</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default Login
