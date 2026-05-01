import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './TunnelSerenite.css'
import './Home.css'
import logo from './assets/netpro-logo.png'
import CTAButton from './CTAButton'

const TAUX = 25
const TOTAL_STEPS = 6

function progressColor(pct) {
  if (pct < 40) return '#F4717F'
  if (pct < 80) return '#F4824A'
  return '#22C55E'
}

const DUREES = [
  { val: 1,   label: '1h',   hint: <>Idéal pour <strong>environ 10 à 15 pièces</strong></> },
  { val: 1.5, label: '1h30', hint: <>Idéal pour <strong>environ 15 à 25 pièces</strong></> },
  { val: 2,   label: '2h',   hint: <>Idéal pour <strong>environ 25 à 40 pièces</strong></> },
  { val: 2.5, label: '2h30', hint: <>Idéal pour <strong>environ 40 à 60 pièces</strong></> },
  { val: 3,   label: '3h',   hint: <>Idéal pour <strong>environ 60 à 80 pièces</strong></> },
]

const REMISE_OPTIONS = [
  { val: 'presence', label: 'Je serai présent(e)', hint: 'Vous remettez les clés en main propre au pro' },
  { val: 'tiers',    label: 'Tiers de confiance',  hint: 'Un proche ou voisin remet les clés à votre place' },
  { val: 'lieu-sur', label: 'Lieu sûr',            hint: 'Les clés sont déposées dans un lieu convenu avec le pro' },
]

const SLOT_ROWS = [
  { label: 'Matin',   slots: ['7:00','7:30','8:00','8:30','9:00','9:30','10:00','10:30','11:00','11:30','12:00'] },
  { label: 'Journée', slots: ['12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'] },
  { label: 'Soir',    slots: ['19:00','19:30','20:00','20:30','21:00','21:30','22:00'] },
]
const ALL_SLOTS = SLOT_ROWS.flatMap(r => r.slots)
const POPULAR_SLOTS = new Set(['7:30','8:00','8:30','9:00','9:30','10:00','10:30','20:30','21:00','21:30','22:00'])

const MOIS_LONG = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc']
const MOIS_FR   = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const DOW = ['Lu.','Ma.','Me.','Je.','Ve.','Sa.','Di.']

export default function TunnelRepassage() {
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

  const [duree, setDuree] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [creneaux, setCreneaux] = useState([])
  const [remiseCles, setRemiseCles] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [recapExpanded, setRecapExpanded] = useState(false)
  const [avanceImmediate, setAvanceImmediate] = useState(true)

  const slotsPerBlock = duree ? duree * 2 : 1

  function getBlockSlots(startSlot) {
    const idx = ALL_SLOTS.indexOf(startSlot)
    if (idx === -1) return []
    return ALL_SLOTS.slice(idx, idx + slotsPerBlock)
  }
  function getBlockStartForSlot(slot) {
    for (const start of creneaux) {
      if (getBlockSlots(start).includes(slot)) return start
    }
    return null
  }
  function toggleCreneau(h) {
    if (getBlockSlots(h).length < slotsPerBlock) return
    const existingStart = getBlockStartForSlot(h)
    if (existingStart === h) { setCreneaux(prev => prev.filter(s => s !== existingStart)); return }
    if (existingStart) { setCreneaux(prev => [...prev.filter(s => s !== existingStart), h]); return }
    if (creneaux.length >= 3) return
    setCreneaux(prev => [...prev, h])
  }
  function isInBlock(slot) { return creneaux.some(start => getBlockSlots(start).includes(slot)) }
  function isBlockStart(slot) { return creneaux.includes(slot) }

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
      if (s != null) { setStep(s); setRecapExpanded(s === 7) }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const canNext = step === 1 ? !!confirmedAddr
    : step === 2 ? duree !== null
    : step === 3 ? selectedDate !== null
    : step === 4 ? creneaux.length > 0
    : step === 5 ? remiseCles !== null
    : true

  function goNext() {
    if (!canNext) return
    const next = step + 1
    setStep(next)
    if (next === 7) setRecapExpanded(true)
    window.history.pushState({ step: next }, '')
  }
  function goPrev() { window.history.back() }
  function goRestart() {
    setStep(1)
    setAdresse(''); setConfirmedAddr(''); setSuggestions([])
    setDuree(null); setSelectedDate(null); setCreneaux([])
    setRemiseCles(null); setCommentaire(''); setRecapExpanded(false)
    window.history.replaceState({ step: 1 }, '')
  }

  const prixSession = duree ? duree * TAUX : 0
  const avanceDiscount = avanceImmediate ? prixSession * 0.5 : 0
  const total = duree ? prixSession - avanceDiscount : null
  const fmt = n => n.toFixed(2).replace('.', ',')
  const dureeLabel = DUREES.find(d => d.val === duree)?.label ?? '—'
  const dateText = selectedDate ? `${selectedDate.getDate()} ${MOIS_FR[selectedDate.getMonth()]}` : '—'
  const remiseLabel = REMISE_OPTIONS.find(r => r.val === remiseCles)?.label ?? '—'
  const progress = step >= 7 ? 100 : (step / TOTAL_STEPS) * 100

  const renderStep1 = () => (
    <>
      <h2 className="smr-title">LE MEILLEUR PRO PRES DE CHEZ VOUS</h2>
      <p className="smr-sub">Renseignez <strong>votre adresse postale</strong> (N°/Rue/Ville/CP)</p>
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

  const renderStep2 = () => {
    const selected = DUREES.find(d => d.val === duree)
    return (
      <>
        <h2 className="smr-title">COMBIEN DE LINGE À REPASSER ?</h2>
        <p className="smr-sub"><strong>Combien de temps</strong> souhaitez-vous réserver ?</p>
        <div className="smr-duree-grid">
          {DUREES.map(d => (
            <button key={d.val} className={`smr-duree-btn${duree === d.val ? ' selected' : ''}`} onClick={() => setDuree(d.val)}>
              {d.label}
            </button>
          ))}
        </div>
        {selected && <p className="smr-hint">{selected.hint}</p>}
      </>
    )
  }

  const renderStep3 = () => (
    <>
      <h2 className="smr-title">ON SE FIXE UNE DATE ?</h2>
      <p className="smr-sub">Choisissez la <strong>date de votre session</strong></p>
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
      <h2 className="smr-title">ON EST SUR LE MÊME CRÉNEAU</h2>
      <p className="smr-sub">
        Choisissez <strong>jusqu'à 3 créneaux</strong>
        {creneaux.length > 0 && creneaux.length < 3 && <> (encore {3 - creneaux.length})</>}
        {creneaux.length === 3 && <> (maximum atteint)</>}
      </p>
      <div className="smr-slots-rows">
        {SLOT_ROWS.map((row, ri) => (
          <div key={ri} className="smr-slots-group">
            <span className="smr-slots-label">{row.label}</span>
            <div className="smr-slots-row">
              {row.slots.map(h => {
                const inBlock = isInBlock(h)
                const isStart = isBlockStart(h)
                const tooShort = getBlockSlots(h).length < slotsPerBlock
                const maxed = creneaux.length >= 3 && !inBlock
                return (
                  <button
                    key={h}
                    className={`smr-slot${inBlock ? ' selected' : ''}${isStart ? ' block-start' : ''}${POPULAR_SLOTS.has(h) ? ' popular' : ''}${(maxed || tooShort) ? ' disabled' : ''}`}
                    onClick={() => toggleCreneau(h)}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )

  const renderStep5 = () => (
    <>
      <h2 className="smr-title">COMMENT LE PRO ACCÈDE-T-IL ?</h2>
      <p className="smr-sub">Comment souhaitez-vous <strong>remettre les clés</strong> ?</p>
      <div className="smr-freq-list">
        {REMISE_OPTIONS.map(opt => (
          <button key={opt.val} className={`smr-freq-btn${remiseCles === opt.val ? ' selected' : ''}`} onClick={() => setRemiseCles(opt.val)}>
            {opt.label}
          </button>
        ))}
      </div>
      {remiseCles && <p className="smr-hint">{REMISE_OPTIONS.find(r => r.val === remiseCles)?.hint}</p>}
    </>
  )

  const renderStep6 = () => (
    <>
      <h2 className="smr-title">QUELQUE CHOSE A AJOUTER ?</h2>
      <p className="smr-sub">Laissez un commentaire pour le pro</p>
      <textarea className="smr-textarea" placeholder="Écrivez ici..." value={commentaire} onChange={e => setCommentaire(e.target.value)} />
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
        {step === 5 && renderStep5()}
        {(step === 6 || step === 7) && renderStep6()}
      </main>

      {recapExpanded && <div className="smr-outside-tap" onClick={() => step === 7 ? goPrev() : setRecapExpanded(false)} />}

      <div className="smr-nav">
        <div className="smr-nav-inner">
          <button className="smr-retour" onClick={goPrev}><span className="smr-retour-arrow">‹</span> Retour</button>
          {step < 7 && <CTAButton color="orange" onClick={goNext} disabled={!canNext}>SUIVANT</CTAButton>}
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
                <span className="smr-mini-ticket-detail">{duree && selectedDate ? `${dureeLabel} · ${dateText}` : 'Repassage'}</span>
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
                <p className="smr-ticket-subtitle">Réservation Repassage</p>
                <div className="smr-ticket-sep" />
                <div className="smr-ticket-section">
                  <div className="smr-ticket-row"><span>Session</span><span>{duree ? dureeLabel : '—'}</span></div>
                  <div className="smr-ticket-row"><span>Date</span><span>{selectedDate ? `Le ${dateText}` : '—'}</span></div>
                  {creneaux.length > 0 && <div className="smr-ticket-row"><span>Créneaux</span><span>{creneaux.join(', ')}</span></div>}
                  {confirmedAddr && <div className="smr-ticket-row"><span>Adresse</span><span className="smr-ticket-val-wrap">{confirmedAddr}</span></div>}
                  {remiseCles && <div className="smr-ticket-row"><span>Remise des clés</span><span>{remiseLabel}</span></div>}
                </div>
                <div className="smr-ticket-sep" />
                <div className="smr-ticket-section">
                  <div className="smr-ticket-row"><span>Prix/h</span><span>{fmt(TAUX)} €</span></div>
                  <div className="smr-ticket-row"><span>Session ({dureeLabel})</span><span>{duree ? fmt(prixSession) : '—'} €</span></div>
                  {avanceImmediate && duree && <div className="smr-ticket-row smr-ticket-row--green"><span>Avance immédiate 50%</span><span>−{fmt(avanceDiscount)} €</span></div>}
                </div>
                <div className="smr-ticket-sep smr-ticket-sep--bold" />
                <div className="smr-ticket-total"><span>TOTAL</span><span>{total ? fmt(total) + ' €' : '—'}</span></div>
                <div className="smr-ticket-sep" />
                <div className="smr-ticket-toggle">
                  <span>Avance immédiate</span>
                  <div className="smr-toggle-row">
                    <span className={avanceImmediate ? 'smr-taux-barre' : 'smr-taux-reduit'}>{fmt(TAUX)}/h</span>
                    <button className={`smr-toggle${avanceImmediate ? ' on' : ''}`} onClick={() => setAvanceImmediate(v => !v)} />
                    <span className={avanceImmediate ? 'smr-taux-reduit' : 'smr-taux-barre'}>{fmt(TAUX / 2)}/h</span>
                  </div>
                </div>
                <div className="smr-ticket-sep" />
                <div className="smr-ticket-comment">
                  <p className="smr-ticket-comment-label">Note pour le pro</p>
                  <textarea className="smr-ticket-comment-area" placeholder="Instructions particulières..." value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={3} />
                </div>
                <div className="smr-ticket-sep" />
                <label className="smr-cgv">
                  <input type="checkbox" checked={cgvAccepted} onChange={e => setCgvAccepted(e.target.checked)} className="smr-cgv-check" />
                  J'accepte les <a href="/cgv" target="_blank" rel="noopener noreferrer" className="smr-cgv-link">CGV</a>
                </label>
                <CTAButton color="orange" onClick={() => navigate('/paiement')} disabled={!cgvAccepted} fullWidth>RÉSERVER</CTAButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
