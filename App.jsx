import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import './global.css'
import { AuthProvider } from './AuthContext'
import Login from './Login'
import Register from './Register'
import Compte from './Compte'
import ForgotPassword from './ForgotPassword'
import Home from './Home'
import Essentiel from './Essentiel'
import Serenite from './Serenite'
import Integral from './Integral'
import TunnelSerenite from './TunnelSerenite'
import TunnelEssentiel from './TunnelEssentiel'
import TunnelIntegral from './TunnelIntegral'
import TunnelRepassage from './TunnelRepassage'
import TunnelVitres from './TunnelVitres'
import TunnelProduits from './TunnelProduits'
import Paiement from './Paiement'
import CompareOffres from './CompareOffres'
import Contact from './Contact'
import MesSessions from './MesSessions'
import MesFactures from './MesFactures'
import MoyenPaiement from './MoyenPaiement'
import MesImpots from './MesImpots'
import MesInfos from './MesInfos'
import Parrainage from './Parrainage'
import Satisfaction from './Satisfaction'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menage-rapide" element={<Essentiel />} />
        <Route path="/menage-regulier" element={<Serenite />} />
        <Route path="/grand-menage" element={<Integral />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/compte" element={<Compte />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/souscription/menage-regulier" element={<TunnelSerenite />} />
        <Route path="/souscription/menage-rapide" element={<TunnelEssentiel />} />
        <Route path="/souscription/grand-menage" element={<TunnelIntegral />} />
        <Route path="/services/repassage" element={<TunnelRepassage />} />
        <Route path="/services/vitres" element={<TunnelVitres />} />
        <Route path="/services/produits" element={<TunnelProduits />} />
        <Route path="/paiement" element={<Paiement />} />
        <Route path="/comparer-offres" element={<CompareOffres />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/compte/sessions" element={<MesSessions />} />
        <Route path="/compte/factures" element={<MesFactures />} />
        <Route path="/compte/paiement" element={<MoyenPaiement />} />
        <Route path="/compte/impots" element={<MesImpots />} />
        <Route path="/compte/infos" element={<MesInfos />} />
        <Route path="/compte/parrainage" element={<Parrainage />} />
        <Route path="/compte/satisfaction" element={<Satisfaction />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App