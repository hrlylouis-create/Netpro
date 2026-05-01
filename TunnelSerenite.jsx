import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './TunnelSerenite.css'
import './Home.css'
import logo from './assets/netpro-logo.png'
import CTAButton from './CTAButton'
import { supabase } from './supabase'

const TAUX_PLEIN = 31.90
const TAUX_APRES = 15.95
const TOTAL_STEPS = 8

function progressColor(pct) {
  if (pct < 40) return '#F4717F'
  if (pct < 80) return '#F4824A'
  return '#22C55E'
}

export default function TunnelSerenite() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  /* ── Step 1 – Adresse ── */
  const [adresse, setAdresse] = useState('')
  const [confirmedAddr, setConfirmedAddr] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loadingSugg, setLoadingSugg] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('netpro_saved_addresses') || '[]') } catch { return [] }
  })

  function toggleFavorite() {
    if (!confirmedAddr) return
    setSavedAddresses(prev => {
      const next = prev.includes(confirmedAddr)
        ? prev.filter(a => a !== confirmedAddr)
        : [...prev, confirmedAddr]
      localStorage.setItem('netpro_saved_addresses', JSON.stringify(next))
      return next
    })
  }
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)
  const skipFetchRef = useRef(false)

  /* ── Step 2 – Durée + Fréquence ── */
  const [duree, setDuree] = useState(2.5)
  const [frequence, setFrequence] = useState('semaine')

  /* ── Step 5 – Créneaux ── */
  const [creneaux, setCreneaux] = useState([])

  const SLOT_ROWS = [
    { label: 'Matin',   slots: ['7:00','7:30','8:00','8:30','9:00','9:30','10:00','10:30','11:00','11:30','12:00'] },
    { label: 'Journée', slots: ['12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'] },
    { label: 'Soir',    slots: ['19:00','19:30','20:00','20:30','21:00','21:30','22:00'] },
  ]
  const ALL_SLOTS = SLOT_ROWS.flatMap(r => r.slots)
  const POPULAR_SLOTS = new Set(['7:30','8:00','8:30','9:00','9:30','10:00','10:30','20:30','21:00','21:30','22:00'])
  const SURCHARGE_SLOTS = new Set(['7:00','7:30','21:00','21:30','22:00'])

  const slotsPerBlock = duree ? duree * 2 + 1 : 1

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
    if (creneaux.includes(h)) {
      setCreneaux(prev => prev.filter(s => s !== h))
      return
    }
    if (creneaux.length >= 3) return
    setCreneaux(prev => [...prev, h])
  }

  function isInBlock(slot) {
    return creneaux.some(start => getBlockSlots(start).includes(slot))
  }

  function isBlockStart(slot) {
    return creneaux.includes(slot)
  }

  function getCreneauIndices(slot) {
    return creneaux.reduce((acc, start, i) => {
      if (getBlockSlots(start).includes(slot)) acc.push(i)
      return acc
    }, [])
  }

  /* ── Step 4 – Calendrier ── */
  const [selectedDate, setSelectedDate] = useState(null)
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); d.setDate(1); return d })

  const MOIS_LONG = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc']
  const DOW = ['Lu.','Ma.','Me.','Je.','Ve.','Sa.','Di.']
  const today = new Date(); today.setHours(0,0,0,0)
  const freqDays = frequence === 'semaine' ? 7 : frequence === 'deux-semaines' ? 14 : 30

  function buildCalDays(monthDate) {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = (firstDay.getDay() + 6) % 7
    const days = []
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  function isRecurring(day) {
    if (!selectedDate || !day) return false
    const diff = Math.round((day - selectedDate) / 86400000)
    return diff > 0 && diff % freqDays === 0
  }

  function isSelected(day) {
    if (!selectedDate || !day) return false
    return day.toDateString() === selectedDate.toDateString()
  }

  const FREQUENCES = [
    { val: 'semaine',      label: '1 session / sem',  hint: <>Idéal pour un intérieur <strong>toujours impeccable</strong></> },
    { val: 'deux-semaines',label: '1 session / 2sem', hint: <>Idéal pour un <strong>entretien régulier</strong> et efficace</> },
    { val: 'mois',         label: '1 session / mois', hint: <>Idéal pour un <strong>grand rafraîchissement</strong> mensuel</> },
  ]

  const DUREES = [
    { val: 1.5, label: '1h30', hint: <>Idéal pour une surface d'environ <strong>30 à 40m²</strong></> },
    { val: 2,   label: '2h',   hint: <>Idéal pour une surface d'environ <strong>40 à 55m²</strong></> },
    { val: 2.5, label: '2h30', hint: <>Idéal pour une surface d'environ <strong>55 à 65m²</strong></> },
    { val: 3,   label: '3h',   hint: <>Idéal pour une surface d'environ <strong>60 à 80m²</strong></> },
    { val: 3.5, label: '3h30', hint: <>Idéal pour une surface d'environ <strong>75 à 90m²</strong></> },
    { val: 4,   label: '4h',   hint: <>Idéal pour une surface d'environ <strong>90 à 110m²</strong></> },
    { val: 4.5, label: '4h30', hint: <>Idéal pour une surface d'environ <strong>110 à 130m²</strong></> },
    { val: 5,   label: '5h',   hint: <>Idéal pour une surface d'environ <strong>130 à 150m²</strong></> },
  ]

  /* ── Step 6 – Boîte à clés ── */
  const [boiteACles, setBoiteACles] = useState(null)
  const [boitePopup, setBoitePopup] = useState(false)

  /* ── CGV ── */
  const [cgvAccepted, setCgvAccepted] = useState(false)

  /* ── Step 9 – Commentaire ── */
  const [commentaire, setCommentaire] = useState('')

  /* ── Step 8 – Options ── */
  const [options, setOptions] = useState(new Set())
  const [optionPopup, setOptionPopup] = useState(null)

  const OPTIONS = [
    { id: 'plantes',  emoji: '🪴', label: 'Arrosage des plantes', surcharge: 0, offert: true  },
    { id: 'vitres',   emoji: '🪟', label: 'Vitres',               surcharge: 0, offert: true  },
    { id: 'repassage',emoji: '👕', label: 'Repassage',            surcharge: 3, offert: false },
    { id: 'litieres', emoji: '🐱', label: 'Litières',             surcharge: 3, offert: false },
    { id: 'produits', emoji: '🧴', label: 'Produits ménagers',    surcharge: 3, offert: false },
  ]

  function toggleOption(id) {
    setOptions(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  /* ── Global ── */
  const [avanceImmediate, setAvanceImmediate] = useState(true)
  const [recapExpanded, setRecapExpanded] = useState(false)

  /* ── BAN autocomplete ── */
  useEffect(() => {
    if (skipFetchRef.current) { skipFetchRef.current = false; return }
    if (adresse.length < 3) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoadingSugg(true)
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=5&type=housenumber`)
        const data = await res.json()
        setSuggestions(data.features || [])
      } catch { setSuggestions([]) }
      finally { setLoadingSugg(false) }
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

  /* ── Interception bouton retour navigateur ── */
  useEffect(() => {
    window.history.replaceState({ step: 1 }, '')
    function handlePopState(e) {
      const s = e.state?.step
      if (s != null) {
        setStep(s)
        setRecapExpanded(s === 9)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  /* ── Navigation ── */
  const canNext = step === 1 ? !!confirmedAddr
    : step === 2 ? frequence !== null
    : step === 3 ? duree !== null
    : step === 5 ? selectedDate !== null
    : step === 6 ? creneaux.length > 0
    : step === 7 ? boiteACles !== null
    : true

  function goNext() {
    if (!canNext) return
    if (step === 4 && !optionPopup && (options.has('vitres') || options.has('repassage'))) {
      setOptionPopup(true)
      return
    }
    setOptionPopup(null)
    let next
    if (step === 7 && boiteACles === true) next = 9
    else next = step + 1
    setStep(next)
    if (next === 9) setRecapExpanded(true)
    window.history.pushState({ step: next }, '')
  }

  function goPrev() {
    window.history.back()
  }

  function goRestart() {
    setStep(1)
    setAdresse(''); setConfirmedAddr(''); setSuggestions([])
    setDuree(2.5); setFrequence('semaine'); setCreneaux([])
    setSelectedDate(null); setBoiteACles(null)
    setCommentaire(''); setOptions(new Set()); setRecapExpanded(false)
    window.history.replaceState({ step: 1 }, '')
  }

  /* ── Bottom bar & récap ── */
  const taux = avanceImmediate ? TAUX_APRES : TAUX_PLEIN
  const surchargeOptions = duree
    ? [...options].reduce((acc, id) => {
        const o = OPTIONS.find(x => x.id === id)
        return acc + (o ? o.surcharge * duree : 0)
      }, 0)
    : 0
  const surchargeCreneau = duree ? creneaux.filter(c => SURCHARGE_SLOTS.has(c)).length * 5 * duree : 0
  const prixSession = duree ? duree * TAUX_PLEIN : 0
  const avanceDiscount = avanceImmediate ? (prixSession + surchargeOptions + surchargeCreneau) * 0.5 : 0
  const total = duree ? prixSession + surchargeOptions + surchargeCreneau - avanceDiscount : null
  const addrParts = confirmedAddr ? confirmedAddr.split(',') : null
  const fmt = n => n.toFixed(2).replace('.', ',')

  const JOURS_FR = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi']
  const MOIS_FR  = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  const dureeLabel = DUREES.find(d => d.val === duree)?.label ?? '—'
  const freqText = frequence === 'semaine' ? 'Toutes les semaines' : frequence === 'deux-semaines' ? 'Toutes les 2 semaines' : 'Tous les mois'
  const dateText = selectedDate ? `${selectedDate.getDate()} ${MOIS_FR[selectedDate.getMonth()]}` : '—'
  const jourText = selectedDate ? `${JOURS_FR[selectedDate.getDay()]}s` : '—'

  /* ── Progress ── */
  const progress = step >= 9 ? 100 : ((step - 1) / TOTAL_STEPS) * 100

  /* ════════════════════════════════════════
     STEP 1 — Adresse
  ════════════════════════════════════════ */
  const renderStep1 = () => (
    <>
      <h2 className="smr-title">LE MEILLEUR PRO PRES DE CHEZ VOUS</h2>
      <p className="smr-sub">
        Renseignez <strong>votre adresse postale</strong> (N°/Rue/Ville/CP)
      </p>

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
        <button
          className={`smr-search-star${confirmedAddr && savedAddresses.includes(confirmedAddr) ? ' active' : ''}`}
          onClick={e => { e.stopPropagation(); toggleFavorite() }}
          title={savedAddresses.includes(confirmedAddr) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          type="button"
        >
          {confirmedAddr && savedAddresses.includes(confirmedAddr) ? '⭐' : '☆'}
        </button>

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
          <button
            key={i}
            className={`smr-saved-card${confirmedAddr === addr ? ' selected' : ''}`}
            onClick={() => selectSavedAddress(addr)}
          >
            <span>{addr}</span>
            <span className="smr-star">⭐</span>
          </button>
        ))}
      </div>
    </>
  )

  /* ════════════════════════════════════════
     STEP 9 — Commentaire
  ════════════════════════════════════════ */

  /* ════════════════════════════════════════
     STEP 8 — Options
  ════════════════════════════════════════ */
  const renderStep8 = () => (
    <>
      <h2 className="smr-title">QUELQUE CHOSE A AJOUTER ?</h2>
      <p className="smr-sub">
        Enrichissez votre abonnement avec des <strong>superbes options à 3€</strong>
      </p>

      <div className="smr-options-grid">
        {OPTIONS.map(o => (
          <button
            key={o.id}
            className={`smr-option-card${options.has(o.id) ? ' selected' : ''}`}
            onClick={() => toggleOption(o.id)}
          >
            <span className="smr-option-emoji">{o.emoji}</span>
            <span className="smr-option-label">{o.label}</span>
            <span className={`smr-option-price${o.offert ? ' offert' : ''}`}>
              {o.offert ? 'Offert' : '+3€/h'}
            </span>
          </button>
        ))}
      </div>

      <p className="smr-note">Prévoyez <strong>30 min supplémentaires</strong> par option pour le repassage et les vitres</p>

      {optionPopup && (() => {
        const extra = (options.has('vitres') ? 0.5 : 0) + (options.has('repassage') ? 0.5 : 0)
        const extraLabel = extra === 1 ? '+1h' : '+30 min'
        const newDuree = Math.min((duree ?? 1.5) + extra, 4)
        const canAdd = (duree ?? 1.5) < 4
        return (
          <>
            <div className="smr-outside-tap" onClick={() => { setOptionPopup(null); goNext() }} />
            <div className="smr-option-popup">
              <span className="smr-option-popup-emoji">
                {options.has('vitres') && options.has('repassage') ? '🪟👕' : options.has('vitres') ? '🪟' : '👕'}
              </span>
              <p className="smr-option-popup-title">Pensez à prévoir le temps !</p>
              <p className="smr-option-popup-text">
                {options.has('vitres') && options.has('repassage')
                  ? <>Les options <strong>Vitres</strong> et <strong>Repassage</strong> nécessitent du temps supplémentaire — comptez <strong>30 min par option</strong>.</>
                  : options.has('vitres')
                    ? <>L'option <strong>Vitres</strong> nécessite <strong>30 min supplémentaires</strong>.</>
                    : <>L'option <strong>Repassage</strong> nécessite <strong>30 min supplémentaires</strong>.</>
                }
              </p>
              {canAdd && (
                <CTAButton color="green" fullWidth onClick={() => { setDuree(newDuree); goNext() }}>
                  Ajouter {extraLabel}
                </CTAButton>
              )}
              <button className="smr-option-popup-skip" onClick={() => { setOptionPopup(null); goNext() }}>
                {canAdd ? 'Continuer sans ajouter' : 'Continuer (durée max atteinte)'}
              </button>
            </div>
          </>
        )
      })()}
    </>
  )

  /* ════════════════════════════════════════
     STEP 7 — Confirmation sans boîte
  ════════════════════════════════════════ */
  const renderStep7 = () => (
    <>
      <h2 className="smr-title">LA BOITE À CLÉS NETPRO, FACILE ET SECURISÉ</h2>
      <p className="smr-sub">
        Entendu, notez que quelqu'un devra être présent <strong>à chaque rendez-vous</strong>
      </p>

      <div className="smr-oui-non">
        <button
          className={`smr-oui-non-btn${boiteACles === false ? ' selected' : ''}`}
          onClick={() => setBoiteACles(false)}
        >
          C'est noté !
        </button>
        <button
          className={`smr-oui-non-btn${boiteACles === true ? ' selected' : ''}`}
          onClick={() => setBoiteACles(true)}
        >
          Finalement, je prends la boite
        </button>
      </div>

      <p className="smr-note">Netpro <strong>n'est pas responsable</strong> des clés si vous les confiez au pro</p>
    </>
  )

  /* ════════════════════════════════════════
     STEP 6 — Boîte à clés
  ════════════════════════════════════════ */
  const renderStep6 = () => (
    <>
      <h2 className="smr-title">LA BOITE À CLÉS NETPRO, FACILE ET SECURISÉ</h2>
      <p className="smr-sub">
        Désirez-vous l'installation d'une boite à clé sécurisée pour vos prochaines sessions ? C'est facile et sécurisé
      </p>

      <div className="smr-oui-non">
        <button
          className={`smr-oui-non-btn${boiteACles === true ? ' selected' : ''}`}
          onClick={() => setBoiteACles(true)}
        >
          Oui
        </button>
        <button
          className={`smr-oui-non-btn${boiteACles === false ? ' selected' : ''}`}
          onClick={() => setBoiteACles(false)}
        >
          Non
        </button>
      </div>

      <p className="smr-note"><strong>30€</strong> seront ajoutés à la 1ère session pour l'installation de votre boite à clés</p>

      <button className="smr-en-savoir-plus" style={{ marginTop: '40px' }} onClick={() => setBoitePopup(true)}>
        En savoir plus
      </button>

      {boitePopup && (
        <>
          <div className="smr-outside-tap" onClick={() => setBoitePopup(false)} />
          <div className="smr-option-popup">
            <button className="smr-popup-close" onClick={() => setBoitePopup(false)}>✕</button>
            <span className="smr-option-popup-emoji">🔐</span>
            <p className="smr-option-popup-title">La boîte à clés Netpro</p>
            <p className="smr-option-popup-text">
              Une <strong>boîte à clés sécurisée</strong> est installée à votre domicile lors de la première session.
              Elle permet à votre pro attitré d'accéder au logement <strong>sans que vous ayez besoin d'être présent</strong> à chaque rendez-vous.
              <br /><br />
              Le code est <strong>chiffré et personnel</strong> — seul votre pro Netpro y a accès. Vous pouvez le modifier ou faire retirer la boîte à tout moment.
            </p>
          </div>
        </>
      )}
    </>
  )

  /* ════════════════════════════════════════
     STEP 5 — Créneaux
  ════════════════════════════════════════ */
  const renderStep5 = () => {
    const restants = 3 - creneaux.length
    return (
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
                const indices = inBlock ? getCreneauIndices(h) : []
                const startIdx = creneaux.indexOf(h)
                const primaryIdx = startIdx !== -1 ? startIdx : (indices[0] ?? -1)
                const colorClass = primaryIdx !== -1 ? ` cren-${primaryIdx}` : ''
                return (
                  <div key={h} className="smr-slot-wrap">
                    <button
                      className={`smr-slot${inBlock ? ` selected${colorClass}` : ''}${isStart ? ' block-start' : ''}${POPULAR_SLOTS.has(h) ? ' popular' : ''}${(maxed || tooShort) ? ' disabled' : ''}`}
                      onClick={() => toggleCreneau(h)}
                    >
                      {h}
                    </button>
                    {SURCHARGE_SLOTS.has(h) && <span className="smr-slot-surcharge">+5€/h</span>}
                  </div>
                )
              })}
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  /* ════════════════════════════════════════
     STEP 4 — Calendrier
  ════════════════════════════════════════ */
  const renderStep4 = () => (
    <>
      <h2 className="smr-title">ON SE FIXE UNE DATE ?</h2>
      <p className="smr-sub">
        Fixez la date de <strong>votre premier rendez-vous</strong>
      </p>

      <div className="smr-cal">
        <div className="smr-cal-header">
          <button
            className="smr-cal-nav"
            onClick={() => setCalMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() - 1); return n })}
          >‹</button>
          <span className="smr-cal-month">{MOIS_LONG[calMonth.getMonth()]} {String(calMonth.getFullYear()).slice(2)}</span>
          <button
            className="smr-cal-nav"
            onClick={() => setCalMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() + 1); return n })}
          >›</button>
        </div>

        <div className="smr-cal-grid">
          {DOW.map(d => <div key={d} className="smr-cal-dow">{d}</div>)}
          {buildCalDays(calMonth).map((day, i) => {
            if (!day) return <div key={`e${i}`} className="smr-cal-day empty" />
            const isPast = day < today
            return (
              <div
                key={i}
                className={`smr-cal-day${isSelected(day) ? ' selected' : isRecurring(day) ? ' recurring' : ''}${isPast ? ' past' : ''}`}
                onClick={() => !isPast && setSelectedDate(day)}
              >
                {day.getDate()}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

  /* ════════════════════════════════════════
     STEP 2 — Fréquence + Durée (fusionnés)
  ════════════════════════════════════════ */
  const renderStep2 = () => {
    const selected = FREQUENCES.find(f => f.val === frequence)
    return (
      <>
        <h2 className="smr-title">À QUELLE FRÉQUENCE ?</h2>
        <p className="smr-sub"><strong>Combien de fois</strong> par mois souhaitez-vous une session ?</p>

        <div className="smr-freq-list">
          {FREQUENCES.map(f => (
            <button
              key={f.val}
              className={`smr-freq-btn${frequence === f.val ? ' selected' : ''}`}
              onClick={() => setFrequence(f.val)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {selected && <p className="smr-hint">{selected.hint}</p>}
      </>
    )
  }

  const renderStep3 = () => {
    const selected = DUREES.find(d => d.val === duree)
    return (
      <>
        <h2 className="smr-title">COMBIEN D'HEURES DE BONHEUR ?</h2>
        <p className="smr-sub"><strong>Combien de temps</strong> doit durer chaque session ?</p>

        <div className="smr-duree-grid">
          {DUREES.map(d => (
            <button
              key={d.val}
              className={`smr-duree-btn${duree === d.val ? ' selected' : ''}`}
              onClick={() => setDuree(d.val)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {selected && <p className="smr-hint">{selected.hint}</p>}
      </>
    )
  }

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="smr-page smr-page--serenite">

      <div className="gradient-bg" aria-hidden="true">
        <div className="blob blob-orange" />
        <div className="blob blob-pink" />
        <div className="blob blob-orange2" />
        <div className="blob blob-pink2" />
      </div>

      {/* ── Header ── */}
      <header className="smr-header">
        <button className="smr-logo-btn" onClick={() => navigate('/')}>
          <img src={logo} alt="Netpro" className="smr-logo" />
        </button>
        <div className="smr-progress-bar">
          <div className="smr-progress-fill" style={{ width: `${progress}%`, background: progressColor(progress) }} />
        </div>
        <div className="smr-header-toggle">
          <span className={avanceImmediate ? 'smr-taux-barre' : 'smr-taux-reduit'}>{fmt(TAUX_PLEIN)}/h</span>
          <button className={`smr-toggle${avanceImmediate ? ' on' : ''}`} onClick={() => setAvanceImmediate(v => !v)} />
          <span className={avanceImmediate ? 'smr-taux-reduit' : 'smr-taux-barre'}>{fmt(TAUX_APRES)}/h</span>
        </div>
      </header>

      {/* ── Step content ── */}
      <main className="smr-main">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep8()}
        {step === 5 && renderStep4()}
        {step === 6 && renderStep5()}
        {step === 7 && renderStep6()}
        {step === 8 && renderStep7()}
      </main>


      {/* ── Zone de clic externe pour fermer le sheet ── */}
      {recapExpanded && <div className="smr-outside-tap" onClick={() => step === 9 ? goPrev() : setRecapExpanded(false)} />}

      {/* ── Navigation ── */}
      <div className="smr-nav">
        <div className="smr-nav-inner">
          <button className="smr-retour" onClick={goPrev}>
            <span className="smr-retour-arrow">‹</span> Retour
          </button>
          {step < 10 && (
            <CTAButton color="green" onClick={goNext} disabled={!canNext}>SUIVANT</CTAButton>
          )}
          {step > 1 && (
            <button className="smr-restart" onClick={goRestart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className={`smr-bottom-bar${recapExpanded ? ' expanded' : ''}`}
        onClick={() => { if (!recapExpanded) setRecapExpanded(true) }}
      >

        {!recapExpanded && (
          <div className="smr-mini-ticket">
            <div className="smr-mini-ticket-handle" />
            <div className="smr-mini-ticket-row">
              <div className="smr-mini-ticket-left">
                <span className="smr-mini-ticket-brand">NETPRO</span>
                <span className="smr-mini-ticket-detail">
                  {duree && frequence ? `${dureeLabel} · ${freqText}` : 'Sérénité'}
                </span>
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
              <button
                className="smr-ticket-close"
                onClick={e => { e.stopPropagation(); setRecapExpanded(false) }}
                aria-label="Fermer"
              >✕</button>

              <div className="smr-ticket-body">
                {/* En-tête */}
                <div className="smr-ticket-head">
                  <span className="smr-ticket-brand">NETPRO</span>
                </div>
                <p className="smr-ticket-subtitle">
                  Abonnement Sérénité {frequence === 'semaine' ? 'Hebdomadaire' : frequence === 'deux-semaines' ? 'Bimensuel' : frequence === 'mois' ? 'Mensuel' : ''}
                </p>

                <div className="smr-ticket-sep" />

                {/* Détails */}
                <div className="smr-ticket-section">
                  <div className="smr-ticket-row">
                    <span>Sessions</span>
                    <span>{duree ? dureeLabel : '—'}</span>
                  </div>
                  <div className="smr-ticket-row">
                    <span>Fréquence</span>
                    <span>{frequence ? freqText : '—'}</span>
                  </div>
                  {selectedDate && (
                    <div className="smr-ticket-row">
                      <span>Début</span>
                      <span>Le {dateText}, puis ts les {jourText}</span>
                    </div>
                  )}
                  {confirmedAddr && (
                    <div className="smr-ticket-row">
                      <span>Adresse</span>
                      <span className="smr-ticket-val-wrap">{confirmedAddr}</span>
                    </div>
                  )}
                  {creneaux.length > 0 && (
                    <div className="smr-ticket-row">
                      <span>Créneaux</span>
                      <span>{creneaux.join(', ')}</span>
                    </div>
                  )}
                  {boiteACles !== null && (
                    <div className="smr-ticket-row">
                      <span>Boîte à clés</span>
                      <span>{boiteACles ? '+30€ (1ère session)' : 'Non'}</span>
                    </div>
                  )}
                </div>

                <div className="smr-ticket-sep" />

                {/* Prix */}
                <div className="smr-ticket-section">
                  <div className="smr-ticket-row">
                    <span>Prix/h</span>
                    <span>{fmt(TAUX_PLEIN)} €</span>
                  </div>
                  <div className="smr-ticket-row">
                    <span>Session ({dureeLabel})</span>
                    <span>{duree ? fmt(prixSession) : '—'} €</span>
                  </div>
                  {options.size > 0 && (
                    <div className="smr-ticket-row">
                      <span>Options ({options.size})</span>
                      <span>{surchargeOptions > 0 ? `+${fmt(surchargeOptions)} €` : 'Offertes'}</span>
                    </div>
                  )}
                  {surchargeCreneau > 0 && (
                    <div className="smr-ticket-row">
                      <span>Heures majorées</span>
                      <span>+{fmt(surchargeCreneau)} €</span>
                    </div>
                  )}
                  {avanceImmediate && duree && (
                    <div className="smr-ticket-row smr-ticket-row--green">
                      <span>Avance immédiate 50%</span>
                      <span>−{fmt(avanceDiscount)} €</span>
                    </div>
                  )}
                </div>

                <div className="smr-ticket-sep smr-ticket-sep--bold" />

                {/* Total */}
                <div className="smr-ticket-total">
                  <span>TOTAL</span>
                  <span>{total ? fmt(total) + ' €' : '—'}</span>
                </div>

                <div className="smr-ticket-sep" />

                {/* Toggle avance */}
                <div className="smr-ticket-toggle">
                  <span>Avance immédiate</span>
                  <div className="smr-toggle-row">
                    <span className={avanceImmediate ? 'smr-taux-barre' : 'smr-taux-reduit'}>{fmt(TAUX_PLEIN)}/h</span>
                    <button className={`smr-toggle${avanceImmediate ? ' on' : ''}`} onClick={() => setAvanceImmediate(v => !v)} />
                    <span className={avanceImmediate ? 'smr-taux-reduit' : 'smr-taux-barre'}>{fmt(TAUX_APRES)}/h</span>
                  </div>
                </div>

                <div className="smr-ticket-sep" />

                {/* Commentaire */}
                <div className="smr-ticket-comment">
                  <p className="smr-ticket-comment-label">Note pour le pro</p>
                  <textarea
                    className="smr-ticket-comment-area"
                    placeholder="Digicode, animal, instructions..."
                    value={commentaire}
                    onChange={e => setCommentaire(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="smr-ticket-sep" />

                <label className="smr-cgv">
                  <input type="checkbox" checked={cgvAccepted} onChange={e => setCgvAccepted(e.target.checked)} className="smr-cgv-check" />
                  J'accepte les <a href="/cgv" target="_blank" rel="noopener noreferrer" className="smr-cgv-link">CGV</a>
                </label>

                <CTAButton color="green" onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase.from('abonnements').upsert({
                      user_id: user.id,
                      type: 'serenite',
                      label: 'Sérénité',
                      statut: 'actif',
                      depuis: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
                      prochaine_facturation: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                      montant: '15,95€/h'
                    })
                  }
                  navigate('/paiement')
                }} disabled={!cgvAccepted} fullWidth>M'ABONNER</CTAButton>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  )
}
