import CompteLayout from './CompteLayout'

export default function MesFactures() {
  return (
    <CompteLayout title="Mes Factures">
      <div className="sous-page-card">
        <p className="sous-page-label">Factures disponibles</p>
        <div className="sous-page-empty">
          <span className="sous-page-empty-icon">🧾</span>
          <p>Aucune facture pour l'instant.<br />Elles apparaîtront ici après votre première session.</p>
        </div>
      </div>

      <div className="sous-page-info-block">
        <p>📥 Toutes vos factures sont téléchargeables en PDF. Elles sont générées automatiquement après chaque session et conservées pendant 5 ans.</p>
      </div>
    </CompteLayout>
  )
}
