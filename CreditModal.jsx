export default function CreditModal({ onClose }) {
  return (
    <div className="credit-modal-overlay" onClick={onClose}>
      <div className="credit-modal" onClick={e => e.stopPropagation()}>
        <button className="credit-modal-close" onClick={onClose}>✕</button>
        <div className="credit-modal-header">
          <span className="credit-modal-badge">Avance immédiate</span>
          <h2 className="credit-modal-title">Ne payez que la moitié,<br />Netpro avance le reste</h2>
          <p className="credit-modal-intro">En France, tout foyer qui fait appel à un service à domicile bénéficie d'un crédit d'impôt de 50 %. Avec l'avance immédiate, ce bénéfice s'applique directement sur votre facture — sans attendre votre déclaration fiscale.</p>
        </div>
        <div className="credit-modal-points">
          <div className="credit-modal-point">
            <span className="credit-modal-point-icon">½</span>
            <div>
              <strong>50 % de réduction immédiate</strong>
              <p>Vous ne payez que la moitié de chaque prestation. L'État verse le reste directement à Netpro.</p>
            </div>
          </div>
          <div className="credit-modal-point">
            <span className="credit-modal-point-icon">€</span>
            <div>
              <strong>Jusqu'à 6 000 € d'avantage par an</strong>
              <p>Le crédit d'impôt s'applique sur jusqu'à 12 000 € de dépenses annuelles.</p>
            </div>
          </div>
          <div className="credit-modal-point">
            <span className="credit-modal-point-icon">✓</span>
            <div>
              <strong>Accessible à tous</strong>
              <p>Même si vous ne payez pas d'impôts, vous bénéficiez du remboursement. Aucune condition de revenus.</p>
            </div>
          </div>
          <div className="credit-modal-point">
            <span className="credit-modal-point-icon">⚡</span>
            <div>
              <strong>Sans avance de trésorerie</strong>
              <p>Contrairement à l'ancien système, vous n'avancez plus rien. Le crédit est déduit directement à chaque facture.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
