import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, UserPlus, Briefcase, Camera } from 'lucide-react'
import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'
import Button from '../components/Button'

const ADMIN_EMAIL = 'yunghundse@gmail.com'

const ROLES = [
  { id: 'manager', label: 'Manager', icon: Briefcase, desc: 'Firma erstellen, Models verwalten, Revenue & Deals', color: '#F5C563' },
  { id: 'model', label: 'Model', icon: Camera, desc: 'Vom Manager verwaltet, Content & Kalender', color: '#FF6B9D' },
]

const Register = () => {
  const [step, setStep] = useState(1) // 1=Rolle, 2=Formular
  const [selectedRole, setSelectedRole] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const createUserDoc = async (user, displayName, role) => {
    const isAdmin = user.email === ADMIN_EMAIL
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || '',
      photoURL: user.photoURL || '',
      approved: isAdmin,
      blocked: false,
      role: isAdmin ? 'admin' : role,
      acceptedTerms: true,
      acceptedTermsAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      companyId: null,
    })
  }

  const handleEmailRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!acceptedTerms) { setError('Bitte stimme den AGB und Datenschutzbestimmungen zu.'); return }
    if (password !== passwordConfirm) { setError('Passwörter stimmen nicht überein.'); return }
    if (password.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben.'); return }
    setLoading(true)
    try {
      // Beta limit: max 10 managers
      if (selectedRole === 'manager') {
        const managerQ = query(collection(db, 'users'), where('role', '==', 'manager'))
        const managerSnap = await getDocs(managerQ)
        if (managerSnap.size >= 10) {
          setError('Beta-Limit erreicht: Es können derzeit nur 10 Manager registriert werden. Bitte versuche es später erneut.')
          setLoading(false)
          return
        }
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      await createUserDoc(cred.user, name, selectedRole)
      setSuccess(true)
    } catch (err) {
      console.error('Register Error:', err.code, err.message)
      if (err.code === 'auth/email-already-in-use') setError('Diese E-Mail ist bereits registriert.')
      else if (err.code === 'auth/invalid-email') setError('Ungültige E-Mail-Adresse.')
      else setError(`Registrierung fehlgeschlagen: ${err.code || err.message}`)
    }
    setLoading(false)
  }

  const handleGoogleRegister = async () => {
    setError('')
    if (!acceptedTerms) { setError('Bitte stimme den AGB und Datenschutzbestimmungen zu.'); return }
    setLoading(true)
    try {
      // Beta limit: max 10 managers
      if (selectedRole === 'manager') {
        const managerQ = query(collection(db, 'users'), where('role', '==', 'manager'))
        const managerSnap = await getDocs(managerQ)
        if (managerSnap.size >= 10) {
          setError('Beta-Limit erreicht: Es können derzeit nur 10 Manager registriert werden.')
          setLoading(false)
          return
        }
      }
      // Use redirect on mobile/Vercel, popup on localhost
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
      if (isMobile) {
        // Store role in sessionStorage before redirect
        sessionStorage.setItem('pendingRole', selectedRole)
        await signInWithRedirect(auth, googleProvider)
        return
      }
      const result = await signInWithPopup(auth, googleProvider)
      const userRef = doc(db, 'users', result.user.uid)
      const existing = await getDoc(userRef)
      if (!existing.exists()) {
        await createUserDoc(result.user, result.user.displayName, selectedRole)
      }
      setSuccess(true)
    } catch (err) {
      console.error('Google Register Error:', err.code, err.message)
      if (err.code === 'auth/popup-closed-by-user') setError('')
      else if (err.code === 'auth/unauthorized-domain') setError('Domain nicht autorisiert! Füge deine Domain in Firebase Console → Authentication → Settings → Authorized domains hinzu.')
      else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') setError('Google Sign-In nicht aktiviert. Firebase Console → Authentication → Sign-in method → Google aktivieren.')
      else setError(`Fehler: ${err.code || err.message}`)
    }
    setLoading(false)
  }

  // Handle redirect result (for mobile/Vercel)
  React.useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const role = sessionStorage.getItem('pendingRole') || 'model'
        sessionStorage.removeItem('pendingRole')
        const userRef = doc(db, 'users', result.user.uid)
        const existing = await getDoc(userRef)
        if (!existing.exists()) {
          await createUserDoc(result.user, result.user.displayName, role)
        }
        setSuccess(true)
      }
    }).catch(err => {
      if (err.code && err.code !== 'auth/popup-closed-by-user') {
        console.error('Redirect Error:', err.code, err.message)
        setError(`Fehler: ${err.code || err.message}`)
      }
    })
  }, [])

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }} className="animate-fade-in-up">
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #6BC9A0, #4ade80)', borderRadius: '24px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(107,201,160,0.3)' }}>
            <span style={{ fontSize: '36px', color: 'white' }}>✓</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#2A2420', marginBottom: '12px' }}>Registrierung erfolgreich!</h2>
          <p style={{ color: '#7A6F62', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
            Dein Account wurde erstellt. Ein Admin muss deinen Account noch freischalten.
          </p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ padding: '14px 32px' }}>Zum Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#2A2420',
    fontSize: '15px', transition: 'border-color 0.2s', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  // ===== STEP 1: Rollenwahl =====
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)' }}>
        <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in-up">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="animate-float" style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #FF8FAB, #FF6B9D)', borderRadius: '22px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(255,107,157,0.3)' }}>
              <UserPlus size={28} color="white" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#2A2420', marginBottom: '6px' }}>Wer bist du?</h1>
            <p style={{ color: '#A89B8C', fontSize: '14px' }}>Wähle deine Rolle — diese kann nicht geändert werden</p>
            <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', background: 'rgba(107,201,160,0.1)', border: '1px solid rgba(107,201,160,0.25)', borderRadius: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#6BC9A0' }}>BETA</span>
              <span style={{ fontSize: '11px', color: '#7A6F62' }}>Kostenlos — 10 Manager-Plätze</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {ROLES.map(role => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id
              return (
                <button key={role.id} onClick={() => setSelectedRole(role.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px',
                  background: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                  border: isSelected ? `2px solid ${role.color}` : '1.5px solid #E8DFD3',
                  borderRadius: '18px', textAlign: 'left', cursor: 'pointer',
                  boxShadow: isSelected ? `0 4px 20px ${role.color}30` : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px',
                    background: isSelected ? role.color : `${role.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.2s',
                  }}>
                    <Icon size={20} color={isSelected ? 'white' : role.color} />
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{role.label}</p>
                    <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '2px' }}>{role.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <Button variant="primary" onClick={() => { if (selectedRole) setStep(2) }} disabled={!selectedRole}
            style={{ width: '100%', padding: '14px', opacity: selectedRole ? 1 : 0.5 }}>
            Weiter
          </Button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ color: '#A89B8C', fontSize: '14px' }}>Schon einen Account? </span>
            <Link to="/login" style={{ color: '#FF6B9D', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>Anmelden</Link>
          </div>
        </div>
      </div>
    )
  }

  // ===== STEP 2: Account-Daten =====
  const activeRole = ROLES.find(r => r.id === selectedRole)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: `${activeRole.color}15`, border: `1.5px solid ${activeRole.color}40`, borderRadius: '14px', marginBottom: '16px' }}>
            <activeRole.icon size={16} color={activeRole.color} />
            <span style={{ fontWeight: '600', color: activeRole.color, fontSize: '14px' }}>{activeRole.label}</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#2A2420', marginBottom: '6px' }}>Account erstellen</h1>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#A89B8C', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>Rolle ändern</button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '24px', padding: '28px', boxShadow: '0 8px 40px rgba(42,36,32,0.08)' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '12px 16px', marginBottom: '20px', color: '#DC2626', fontSize: '14px', fontWeight: '500' }}>{error}</div>
          )}

          <Button variant="google" onClick={handleGoogleRegister} disabled={loading || !acceptedTerms} style={{ width: '100%', marginBottom: '20px', padding: '14px', opacity: acceptedTerms ? 1 : 0.5 }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Mit Google registrieren
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E8DFD3' }} />
            <span style={{ fontSize: '13px', color: '#A89B8C', fontWeight: '500' }}>oder</span>
            <div style={{ flex: 1, height: '1px', background: '#E8DFD3' }} />
          </div>

          <form onSubmit={handleEmailRegister}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Name</label>
              <input type="text" placeholder="Dein Name" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#FF6B9D'} onBlur={e => e.target.style.borderColor = '#E8DFD3'} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>E-Mail</label>
              <input type="email" placeholder="name@beispiel.de" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#FF6B9D'} onBlur={e => e.target.style.borderColor = '#E8DFD3'} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Passwort</label>
              <input type="password" placeholder="Mindestens 6 Zeichen" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#FF6B9D'} onBlur={e => e.target.style.borderColor = '#E8DFD3'} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Passwort bestätigen</label>
              <input type="password" placeholder="Passwort wiederholen" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#FF6B9D'} onBlur={e => e.target.style.borderColor = '#E8DFD3'} />
            </div>

            {/* AGB Zustimmung */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer', padding: '12px', background: acceptedTerms ? 'rgba(107,201,160,0.06)' : 'rgba(42,36,32,0.02)', borderRadius: '12px', border: acceptedTerms ? '1.5px solid rgba(107,201,160,0.3)' : '1.5px solid #E8DFD3', transition: 'all 0.2s' }}>
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#6BC9A0', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#5C5349', lineHeight: '1.5' }}>
                  Ich stimme den <a href="/legal/agb" target="_blank" style={{ color: '#FF6B9D', fontWeight: '600', textDecoration: 'none' }}>AGB</a>, <a href="/legal/datenschutz" target="_blank" style={{ color: '#FF6B9D', fontWeight: '600', textDecoration: 'none' }}>Datenschutzbestimmungen</a> und <a href="/legal/nda" target="_blank" style={{ color: '#FF6B9D', fontWeight: '600', textDecoration: 'none' }}>Nutzungsbedingungen</a> zu.
                </span>
              </label>
            </div>

            <Button type="submit" variant="primary" disabled={loading || !acceptedTerms} style={{ width: '100%', padding: '14px', opacity: acceptedTerms ? 1 : 0.5 }}>
              {loading ? 'Wird erstellt...' : 'Registrieren'}
            </Button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: '#A89B8C', fontSize: '14px' }}>Schon einen Account? </span>
          <Link to="/login" style={{ color: '#FF6B9D', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>Anmelden</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
