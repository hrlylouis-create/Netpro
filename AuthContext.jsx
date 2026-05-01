import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

function buildUser(supabaseUser) {
  if (!supabaseUser) return null
  const meta = supabaseUser.user_metadata || {}
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    prenom: meta.prenom || '',
    nom: meta.nom || '',
    civilite: meta.civilite || '',
    adresse: meta.adresse || '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accountData, setAccountData] = useState({ abonnement: null, pro: null, sessions: [], notifications: [] })

  /* ── Init session ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? buildUser(session.user) : null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? buildUser(session.user) : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ── Fetch account data when user changes ── */
  useEffect(() => {
    if (!user) {
      setAccountData({ abonnement: null, pro: null, sessions: [], notifications: [] })
      return
    }

    async function fetchAccountData() {
      try {
        const [abonnementRes, sessionsRes, notificationsRes] = await Promise.all([
          supabase.from('abonnements').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('sessions').select('*, pros(*)').eq('user_id', user.id),
          supabase.from('notifications').select('*').eq('user_id', user.id).eq('dismissed', false),
        ])

        const abonnement = abonnementRes.data || null
        const rawSessions = sessionsRes.data || []
        const notifications = notificationsRes.data || []

        // Normalize sessions and extract pro from first session
        const sessions = rawSessions.map(s => ({
          id: s.id,
          date: s.date,
          type: s.type,
          statut: s.statut,
          facture_id: s.facture_id,
          pro: s.pros ? `${s.pros.prenom} ${s.pros.nom}` : '',
        }))

        const firstSessionWithPro = rawSessions.find(s => s.pros)
        const pro = firstSessionWithPro ? {
          prenom: firstSessionWithPro.pros.prenom,
          nom: firstSessionWithPro.pros.nom,
          note: firstSessionWithPro.pros.note,
          sessions: firstSessionWithPro.pros.sessions,
          initiale: firstSessionWithPro.pros.prenom?.[0] || '?',
        } : null

        setAccountData({ abonnement, pro, sessions, notifications })
      } catch {
        setAccountData({ abonnement: null, pro: null, sessions: [], notifications: [] })
      }
    }

    fetchAccountData()
  }, [user?.id])

  /* ── Auth functions ── */
  async function register({ email, password, prenom, nom, civilite, adresse }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { prenom, nom, civilite, adresse } },
    })
    if (error) return { error: error.message }

    const registeredUser = data.user
    if (registeredUser) {
      await supabase.from('profiles').upsert({
        id: registeredUser.id,
        prenom,
        nom,
        civilite,
        adresse,
      })
    }

    return { ok: true }
  }

  async function login({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { ok: true }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function updateUser(fields) {
    if (!user) return
    await supabase.from('profiles').update(fields).eq('id', user.id)
    setUser(prev => ({ ...prev, ...fields }))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, accountData, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
