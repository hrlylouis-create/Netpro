import './Login.css'
import { Link, useNavigate } from 'react-router-dom'
import logo from './assets/netpro-logo.png'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthContext'
import CTAButton from './CTAButton'
import GlassButton from './GlassButton'

function AddressInput({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([])
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    onChange(val)
    clearTimeout(debounceRef.current)
    if (val.length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=5`)
        const data = await res.json()
        setSuggestions(data.features || [])
      } catch {
        setSuggestions([])
      }
    }, 250)
  }

  function handleSelect(feature) {
    onChange(feature.properties.label)
    setSuggestions([])
  }

  return (
    <div className="address-wrapper" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Adresse postale"
        value={value}
        onChange={handleChange}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="address-suggestions">
          {suggestions.map((f) => (
            <li key={f.properties.id} onMouseDown={() => handleSelect(f)}>
              {f.properties.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [civilite, setCivilite] = useState('madame')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [adresse, setAdresse] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password || !adresse || !prenom || !nom) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    const result = await register({ email, password, adresse, civilite, prenom, nom })
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
          <GlassButton to="/connexion">Se connecter</GlassButton>
        </nav>
      </header>

      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">CRÉATION</h1>

          <AddressInput value={adresse} onChange={v => { setAdresse(v); setError('') }} />

          <input type="email" placeholder="Adresse mail" value={email} onChange={e => { setEmail(e.target.value); setError('') }} />

          <div className="password-wrapper">
            <input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" value={password} onChange={e => { setPassword(e.target.value); setError('') }} />
            <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          <div className="civilite-toggle">
            <button className={`civilite-btn${civilite === 'madame' ? ' active' : ''}`} onClick={() => setCivilite('madame')} type="button">Madame</button>
            <button className={`civilite-btn${civilite === 'monsieur' ? ' active' : ''}`} onClick={() => setCivilite('monsieur')} type="button">Monsieur</button>
          </div>

          <input type="text" placeholder="Prénom" value={prenom} onChange={e => { setPrenom(e.target.value); setError('') }} />
          <input type="text" placeholder="Nom" value={nom} onChange={e => { setNom(e.target.value); setError('') }} />

          {error && <p className="login-error">{error}</p>}

          <p className="cgu-text">En créant un compte vous acceptez <a href="#">nos CGU</a></p>

          <CTAButton color="green" onClick={handleSubmit} fullWidth disabled={loading}>{loading ? 'CHARGEMENT...' : 'CRÉER MON COMPTE'}</CTAButton>
          <GlassButton to="/connexion">‹ Retour</GlassButton>
        </div>
      </main>
    </div>
  )
}

export default Register
