import CompteLayout from './CompteLayout'
import CTAButton from './CTAButton'
import { useNavigate } from 'react-router-dom'

export default function MesSessions() {
  const navigate = useNavigate()

  return (
    <CompteLayout title="Mes Sessions">
      <div className="sous-page-card">
        <p className="sous-page-label">À venir</p>
        <div className="sous-page-empty">
          <span className="sous-page-empty-icon">🗓️</span>
          <p>Aucune session planifiée pour le moment.</p>
          <CTAButton color="orange" onClick={() => navigate('/')}>RÉSERVER</CTAButton>
        </div>
      </div>

      <div className="sous-page-card">
        <p className="sous-page-label">Passées</p>
        <div className="sous-page-empty">
          <span className="sous-page-empty-icon">🧹</span>
          <p>Vos sessions terminées apparaîtront ici.</p>
        </div>
      </div>
    </CompteLayout>
  )
}
