import { useNavigate } from 'react-router-dom'
import './Tunnel.css'
import './Paiement.css'
import logo from './assets/netpro-logo.png'

function Paiement() {
  const navigate = useNavigate()

  return (
    <div className="sou-page">

      <header className="sou-header">
        <button className="sou-back" onClick={() => navigate(-1)}><span className="sou-back-arrow">‹</span> RETOUR</button>
        <img src={logo} alt="Netpro" style={{ height: 36 }} />
      </header>

      <div className="sou-main">

        <div className="sou-left">
          <h2 className="sou-step-title">RÈGLEMENT</h2>
          <p className="sou-step-sub">Vos coordonnées de paiement — vous ne serez débité qu'à la fin de chaque session</p>

          <div className="pai-card-preview">
            <div className="pai-card-chip" />
            <div className="pai-card-number">•••• •••• •••• ••••</div>
            <div className="pai-card-bottom">
              <span className="pai-card-holder">NOM DU TITULAIRE</span>
              <span className="pai-card-expiry">MM/AA</span>
            </div>
          </div>

          <div className="sou-form" style={{ marginTop: 32 }}>
            <div className="sou-input-wrap">
              <input className="sou-input" placeholder="Numéro de carte" maxLength={19} />
            </div>
            <div className="sou-form-row">
              <div className="sou-input-wrap">
                <input className="sou-input" placeholder="MM/AA" maxLength={5} />
              </div>
              <div className="sou-input-wrap">
                <input className="sou-input" placeholder="CVC" maxLength={3} />
              </div>
            </div>
            <div className="sou-input-wrap">
              <input className="sou-input" placeholder="Nom du titulaire" />
            </div>
          </div>

          <p className="sou-note" style={{ marginTop: 24 }}>
            Vos données sont <strong>chiffrées et sécurisées</strong>. Netpro ne stocke jamais vos informations bancaires.
          </p>
        </div>

        <div className="sou-right">
          <div className="sou-recap">
            <div className="sou-recap-tabs">
              <span className="sou-recap-tab active-offre">MON OFFRE</span>
            </div>
            <p className="sou-recap-note" style={{ marginTop: 8 }}>
              Le récapitulatif de votre commande apparaîtra ici après connexion.
            </p>
          </div>

          <div className="sou-nav">
            <button className="sou-prev" onClick={() => navigate(-1)}>‹</button>
            <button className="sou-finaliser">CONFIRMER ET PAYER</button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Paiement
