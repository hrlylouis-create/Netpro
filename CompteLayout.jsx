import './Compte.css'
import './Home.css'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import logo from './assets/netpro-logo.png'
import { useAuth } from './AuthContext'
import GlassButton from './GlassButton'

export default function CompteLayout({ children, title }) {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) navigate('/connexion')
  }, [loading, user])

  if (loading || !user) return null

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
          <div className="compte-icon-bubble">
            <span className="compte-icon-letter">{user.prenom?.[0]?.toUpperCase()}</span>
            <span className="compte-icon-bonjour">BONJOUR <span className="compte-icon-prenom">{user.prenom?.toUpperCase()}</span></span>
          </div>
        </nav>
      </header>

      <div className="sous-page-wrap">
        <div className="sous-page-header">
          <GlassButton onClick={() => navigate('/compte')}>‹ Mon compte</GlassButton>
          <h1 className="sous-page-titre">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
