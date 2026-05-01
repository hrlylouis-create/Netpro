import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './TunnelSerenite.css'
import './Home.css'
import logo from './assets/netpro-logo.png'
import CTAButton from './CTAButton'

const TOTAL_STEPS = 4

function progressColor(pct) {
  if (pct < 40) return '#F4717F'
  if (pct < 80) return '#F4824A'
  return '#22C55E'
}

const PACKS = [
  {
    val: 'M',
    label: 'Pack M',
    prix: 29,
    hint: <>Produits essentiels pour <strong>1 à 2 personnes</strong></>,
    contenu: 'Liquide vaisselle · Nettoyant multi-surfaces · Produit WC · Éponges',
  },
  {
    val: 'L',
    label: 'Pack L',
    prix: 49,
    hint: <>Produits complets pour <strong>3 à 4 personnes</strong></>,
    contenu: 'Pack M + Nettoyant vitres · Dégraissant · Produit sols · Gel douche',
  },
  {
    val: 'XL',
    label: 'Pack XL',
    prix: 69,
    hint: <>Gamme complète pour <strong>grande famille ou grand logement</strong></>,
    contenu: 'Pack L + Détartrant · Lessive · Adoucissant · Produit inox',
  },
]

const SLOT_ROWS = [
  { label: 'Matin',   slots: ['7:00','7:30','8:00','8:30','9:00','9:30','10:00','10:30','11:00','11:30','12:00'] },
  { label: 'Journée', slots: ['12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'] },
  { label: 'Soir',    slots: ['19:00','19:30','20:00','20:30','21:00'] },
]
const ALL_SLOTS = SLOT_ROWS.flatMap(r => r.slots)

const MOIS_LONG = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc']
const MOIS_FR   = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const DOW = ['Lu.','Ma.','Me.','Je.','Ve.','Sa.','Di.']

export default function TunnelProduits() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const [adresse, setAdresse] = useState('')
  const [confirmedAddr, setConfirmedAddr] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [savedAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('netpro_saved_addresses') || '[]') } catch { return [] }
  })
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)
  const skipFetchRef = useRef(false)

  const [pack, setPack] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [creneau, setCreneau] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [recapExpanded, setRecapExpanded] = useState(false)

  const today = new Date(); today.setHours(0,0,0,0)
  function buildCalDays(monthDate) {
    const year = monthDate.getFullYear(), month = monthDate.getMonth()
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0)
    const startDow = (firstDay.getDay() + 6) % 7
    const days = []
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }
  function isSelected(day) {
    if (!selectedDate || !day) return false
    return day.toDateString() === selectedDate.toDateString()
  }

  useEffect(() => {
    if (skipFetchRef.current) { skipFetchRef.current = false; return }
    if (adresse.length < 3) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=5&type=housenumber`)
        const data = await res.json()
        setSuggestions(data.features || [])
      } catch { setSuggestions([]) }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [adresse])

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setSuggestions([])
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function selectSuggestion(feature) {
    skipFetchRef.current = true
    setAdresse(feature.properties.label)
    setConfirmedAddr(feature.properties.label)
    setSuggestions([])
  }
  function selectSavedAddress(addr) {
    skipFetchRef.current = true
    setAdresse(addr)
    setConfirmedAddr(addr)
    setSuggestions([])
  }

  useEffect(() => {
    window.history.replaceState({ step: 1 }, '')
    function handlePopState(e) {
      const s = e.state?.step
      if (s != null) { setStep(s); setRecapExpanded(s === 5) }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const canNext = step === 1 ? !!confirmedAddr
    : step === 2 ? pack !== null
    : step === 3 ? selectedDate !== null
    : step === 4 ? creneau !== null
    : true

  function goNext() {
    if (!canNext) return
    const next = step + 1
    setStep(next)
    if (next === 5) setRecapExpanded(true)
    window.history.pushState({ step: next }, '')
  }
  function goPrev() { window.history.back() }
  function goRestart() {
    setStep(1)
    setAdresse(''); setConfirmedAddr(''); setSuggestions([])
    setPack(null); setSelectedDate(null); setCreneau(null)
    setCommentaire(''); setRecapExpanded(false)
    window.history.replaceState({ step: 1 }, '')
  }

  const selectedPack = PACKS.find(p => p.val === pack)
  const total = selectedPack?.prix ?? null
  const fmt = n => n.toFixed(2).replace('.', ',')
  const dateText = selectedDate ? `${selectedDate.getDate()} ${MOIS_FR[selectedDate.getMonth()]}` : '—'
  const progress = step >= 5 ? 100 : (step / TOTAL_STEPS) * 100

  const renderStep1 = () => (
    <>
      <h2 className="smr-title">LE MEILLEUR PRO PRES DE CHEZ VOUS</h2>
      <p className="smr-sub">Renseignez <strong>votre adresse de livraison</strong> (N°/Rue/Ville/CP)</p>
      <div className="smr-search-wrap" ref={wrapRef}>
        <input
          className={`smr-search-input${confirmedAddr ? ' confirmed' : ''}`}
          type="text"
          placeholder="Recherchez votre adresse"
          value={adresse}
          onChange={e => { setAdresse(e.target.value); setConfirmedAddr('') }}
          autoComplete="off"
        />
        {confirmedAddr && (
          <button className="smr-search-check" onClick={() => { setAdresse(''); setConfirmedAddr(''); setSuggestions([]) }} type="button">
            <span className="smr-search-check-tick">✓</span>
            <span className="smr-search-check-clear">✕</span>
          </button>
        )}
        {suggestions.length > 0 && (
          <ul className="smr-suggestions">
            {suggestions.map(f => (
              <li key={f.properties.id} onClick={() => selectSuggestion(f)}>
                <span className="smr-sugg-label">{f.properties.label}</span>
                <span className="smr-sugg-city">{f.properties.city}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="smr-section-label">Adresses favorites</p>
      <div className="smr-saved-list">
        {savedAddresses.map((addr, i) => (
          <button key={i} className={`smr-saved-card${confirmedAddr === addr ? ' selected' : ''}`} onClick={() => selectSavedAddress(addr)}>
            <span>{addr}</span><span className="smr-star">★</span>
          </button>
        ))}
      </div>
    </>
  )

  const renderStep2 = () => (
    <>
      <h2 className="smr-title">QUEL PACK VOUS CONVIENT ?</h2>
      <p className="smr-sub">Choisissez le pack adapté à <strong>votre foyer</strong></p>
      <div className="smr-freq-list">
        {PACKS.map(p => (
          <button key={p.val} className={`smr-freq-btn${pack === p.val ? ' selected' : ''}`} onClick={() => setPack(p.val)}>
            <span>{p.label}</span>
            <span style={{ fontWeight: 700, color: '#F4824A' }}>{p.prix}€</span>
          </button>
        ))}
      </div>
      {selectedPack && (
        <>
          <p className="smr-hint">{selectedPack.hint}</p>
          <p className="smr-note" style={{ marginTop: 12 }}>{selectedPack.contenu}</p>
        </>
      )}
    </>
  )

  const renderStep3 = () => (
    <>
      <h2 className="smr-title">QUAND LIVRER ?</h2>
      <p className="smr-sub">Choisissez la <strong>date de livraison</strong></p>
      <div className="smr-cal">
        <div className="smr-cal-header">
          <button className="smr-cal-nav" onClick={() => setCalMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() - 1); return n })}>‹</button>
          <span className="smr-cal-month">{MOIS_LONG[calMonth.getMonth()]} {String(calMonth.getFullYear()).slice(2)}</span>
          <button className="smr-cal-nav" onClick={() => setCalMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() + 1); return n })}>›</button>
        </div>
        <div className="smr-cal-grid">
          {DOW.map(d => <div key={d} className="smr-cal-dow">{d}</div>)}
          {buildCalDays(calMonth).map((day, i) => {
            if (!day) return <div key={`e${i}`} className="smr-cal-day empty" />
            const isPast = day < today
            return (
              <div key={i} className={`smr-cal-day${isSelected(day) ? ' selected' : ''}${isPast ? ' past' : ''}`} onClick={() => !isPast && setSelectedDate(day)}>
                {day.getDate()}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

  const renderStep4 = () => (
    <>
      <h2 className="smr-title">À QUELLE HEURE ?</h2>
      <p className="smr-sub">Choisissez un <strong>créneau de livraison</strong></p>
      <div className="smr-slots-rows">
        {SLOT_ROWS.map((row, ri) => (
          <div key={ri} className="smr-slots-group">
            <span className="smr-slots-label">{row.label}</span>
            <div className="smr-slots-row">
              {row.slots.map(h => (
                <button
                  key={h}
                  className={`smr-slot${creneau === h ? ' selected block-start' : ''}`}
                  onClick={() => setCreneau(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className="smr-page smr-page--integral">
      <div className="gradient-bg" aria-hidden="true">
        <div className="blob blob-orange" />
        <div className="blob blob-pink" />
        <div className="blob blob-orange2" />
        <div className="blob blob-pink2" />
      </div>

      <header className="smr-header">
        <button className="smr-logo-btn" onClick={() => navigate('/')}>
          <img src={logo} alt="Netpro" className="smr-logo" />
        </button>
        <div className="smr-progress-bar">
          <div className="smr-progress-fill" style={{ width: `${progress}%`, background: progressColor(progress) }} />
        </div>
        <button className="smr-connexion-btn">Se connecter</button>
      </header>

      <main className="smr-main">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </main>

      {recapExpanded && <div className="smr-outside-tap" onClick={() => step === 5 ? goPrev() : setRecapExpanded(false)} />}

      <div className="smr-nav">
        <div className="smr-nav-inner">
          <button className="smr-retour" onClick={goPrev}><span className="smr-retour-arrow">‹</span> Retour</button>
          {step < 5 && <CTAButton color="orange" onClick={goNext} disabled={!canNext}>SUIVANT</CTAButton>}
          {step > 1 && (
            <button className="smr-restart" onClick={goRestart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className={`smr-bottom-bar${recapExpanded ? ' expanded' : ''}`} onClick={() => { if (!recapExpanded) setRecapExpanded(true) }}>
        {!recapExpanded && (
          <div className="smr-mini-ticket">
            <div className="smr-mini-ticket-handle" />
            <div className="smr-mini-ticket-row">
              <div className="smr-mini-ticket-left">
                <span className="smr-mini-ticket-brand">NETPRO</span>
                <span className="smr-mini-ticket-detail">{pack && selectedDate ? `Pack ${pack} · ${dateText}` : 'Produits ménagers'}</span>
              </div>
              <div className="smr-mini-ticket-right">
                <span className="smr-mini-ticket-label">TOTAL</span>
                <span className="smr-mini-ticket-amount">{total ? `${fmt(total)}€` : '—'}</span>
              </div>
            </div>
          </div>
        )}
        {recapExpanded && (
          <div className="smr-ticket-wrapper">
            <div className="smr-ticket">
              <button className="smr-ticket-close" onClick={e => { e.stopPropagation(); setRecapExpanded(false) }}>✕</button>
              <div className="smr-ticket-body">
                <div className="smr-ticket-head"><span className="smr-ticket-brand">NETPRO</span></div>
                <p className="smr-ticket-subtitle">Livraison Produits ménagers</p>
                <div className="smr-ticket-sep" />
                <div className="smr-ticket-section">
                  <div className="smr-ticket-row"><span>Pack</span><span>{selectedPack ? `${selectedPack.label}` : '—'}</span></div>
                  <div className="smr-ticket-row"><span>Date</span><span>{selectedDate ? `Le ${dateText}` : '—'}</span></div>
                  {creneau && <div className="smr-ticket-row"><span>Créneau</span><span>{creneau}</span></div>}
                  {confirmedAddr && <div className="smr-ticket-row"><span>Adresse</span><span className="smr-ticket-val-wrap">{confirmedAddr}</span></div>}
                </div>
                <div className="smr-ticket-sep" />
                <div className="smr-ticket-section">
                  <div className="smr-ticket-row"><span>{selectedPack?.label ?? 'Pack'}</span><span>{total ? `${fmt(total)} €` : '—'}</span></div>
                </div>
                <div className="smr-ticket-sep smr-ticket-sep--bold" />
                <div className="smr-ticket-total"><span>TOTAL</span><span>{total ? fmt(total) + ' €' : '—'}</span></div>
                <div className="smr-ticket-sep" />
                <div className="smr-ticket-comment">
                  <p className="smr-ticket-comment-label">Note pour le livreur</p>
                  <textarea className="smr-ticket-comment-area" placeholder="Digicode, étage, instructions..." value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={3} />
                </div>
                <div className="smr-ticket-sep" />
                <label className="smr-cgv">
                  <input type="checkbox" checked={cgvAccepted} onChange={e => setCgvAccepted(e.target.checked)} className="smr-cgv-check" />
                  J'accepte les <a href="/cgv" target="_blank" rel="noopener noreferrer" className="smr-cgv-link">CGV</a>
                </label>
                <CTAButton color="orange" onClick={() => navigate('/paiement')} disabled={!cgvAccepted} fullWidth>COMMANDER</CTAButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
