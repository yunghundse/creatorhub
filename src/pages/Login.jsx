import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, sendPasswordResetEmail } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'
import Button from '../components/Button'

const ADMIN_EMAIL = 'yunghundse@gmail.com'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  // Handle redirect result (for mobile/Vercel)
  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const userRef = doc(db, 'users', result.user.uid)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          const isAdmin = result.user.email === ADMIN_EMAIL
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || '',
            photoURL: result.user.photoURL || '',
            approved: isAdmin,
            blocked: false,
            role: isAdmin ? 'admin' : 'user',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            companyId: null,
          })
        } else {
          await updateDoc(userRef, { lastLogin: serverTimestamp() })
        }
      }
    }).catch(err => {
      if (err.code && err.code !== 'auth/popup-closed-by-user') {
        console.error('Redirect Error:', err.code, err.message)
        setError(`Fehler: ${err.code || err.message}`)
      }
    })
  }, [])

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      console.error('Email Login Error:', err.code, err.message)
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-Mail oder Passwort falsch.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Zu viele Versuche. Bitte warte einen Moment.')
      } else {
        setError(`Login fehlgeschlagen: ${err.code || err.message}`)
      }
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider)
        return
      }
      const result = await signInWithPopup(auth, googleProvider)
      const userRef = doc(db, 'users', result.user.uid)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        const isAdmin = result.user.email === ADMIN_EMAIL
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          approved: isAdmin,
          blocked: false,
          role: isAdmin ? 'admin' : 'user',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          companyId: null,
        })
      } else {
        await updateDoc(userRef, { lastLogin: serverTimestamp() })
      }
    } catch (err) {
      console.error('Google Login Error:', err.code, err.message)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('')
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain nicht autorisiert! Füge deine Domain in Firebase Console → Authentication → Settings → Authorized domains hinzu.')
      } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In nicht aktiviert. Firebase Console → Authentication → Sign-in method → Google aktivieren.')
      } else {
        setError(`Anmeldung fehlgeschlagen: ${err.code || err.message}`)
      }
    }
    setLoading(false)
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError('')
    if (!resetEmail.trim()) { setError('Bitte E-Mail eingeben.'); return }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim())
      setResetSent(true)
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('Kein Account mit dieser E-Mail gefunden.')
      else if (err.code === 'auth/invalid-email') setError('Ungültige E-Mail-Adresse.')
      else setError('Fehler beim Senden. Bitte versuche es erneut.')
    }
    setLoading(false)
  }

  // ===== PASSWORD RESET SCREEN =====
  if (showReset) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', background: 'linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-in-up">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '72px', height: '72px', background: 'linear-gradient(135deg, #7EB5E6, #5A9FD4)',
              borderRadius: '22px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(126,181,230,0.3)'
            }}>
              <span style={{ fontSize: '28px' }}>🔑</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#2A2420', marginBottom: '8px' }}>Passwort vergessen?</h1>
            <p style={{ color: '#A89B8C', fontSize: '14px', lineHeight: '1.5' }}>
              {resetSent ? 'E-Mail wurde gesendet! Prüfe dein Postfach.' : 'Gib deine E-Mail ein und wir senden dir einen Reset-Link.'}
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.9)', borderRadius: '24px',
            padding: '28px', boxShadow: '0 8px 40px rgba(42,36,32,0.08)'
          }}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '14px', fontWeight: '500' }}>{error}</div>
            )}
            {resetSent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(107,201,160,0.15)', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '24px' }}>✓</span>
                </div>
                <p style={{ color: '#6BC9A0', fontWeight: '600', fontSize: '15px', marginBottom: '16px' }}>Reset-Link gesendet!</p>
                <p style={{ color: '#7A6F62', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
                  Prüfe dein E-Mail-Postfach (auch Spam) und folge dem Link um dein Passwort zurückzusetzen.
                </p>
                <Button variant="primary" onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(''); setError('') }} style={{ width: '100%', padding: '14px' }}>
                  Zurück zum Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>E-Mail</label>
                  <input type="email" placeholder="name@beispiel.de" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required
                    style={{ width: '100%', padding: '14px 16px', background: 'rgba(42,36,32,0.03)', border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#2A2420', fontSize: '15px', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#7EB5E6'} onBlur={e => e.target.style.borderColor = '#E8DFD3'} />
                </div>
                <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '14px', marginBottom: '12px' }}>
                  {loading ? 'Wird gesendet...' : 'Reset-Link senden'}
                </Button>
                <button type="button" onClick={() => { setShowReset(false); setError(''); setResetEmail('') }}
                  style={{ width: '100%', padding: '12px', background: 'none', border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#7A6F62', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
                  Zurück zum Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', background: 'linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="animate-float" style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #FF8FAB 0%, #FF6B9D 100%)',
            borderRadius: '24px', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(255, 107, 157, 0.3)'
          }}>
            <Sparkles size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#2A2420', letterSpacing: '-0.5px', marginBottom: '8px' }}>creatorhub</h1>
          <p style={{ color: '#A89B8C', fontSize: '15px' }}>Dein Kreativ-Studio</p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.9)', borderRadius: '24px',
          padding: '32px', boxShadow: '0 8px 40px rgba(42, 36, 32, 0.08)'
        }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '14px', padding: '12px 16px', marginBottom: '20px',
              color: '#DC2626', fontSize: '14px', fontWeight: '500'
            }}>{error}</div>
          )}

          <Button variant="google" onClick={handleGoogleLogin} disabled={loading} style={{ width: '100%', marginBottom: '20px', padding: '14px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Mit Google anmelden
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E8DFD3' }} />
            <span style={{ fontSize: '13px', color: '#A89B8C', fontWeight: '500' }}>oder</span>
            <div style={{ flex: 1, height: '1px', background: '#E8DFD3' }} />
          </div>

          <form onSubmit={handleEmailLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>E-Mail</label>
              <input type="email" placeholder="name@creatorhub.app" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(42,36,32,0.03)', border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#2A2420', fontSize: '15px', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#FF6B9D'} onBlur={e => e.target.style.borderColor = '#E8DFD3'} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Passwort</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(42,36,32,0.03)', border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#2A2420', fontSize: '15px', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#FF6B9D'} onBlur={e => e.target.style.borderColor = '#E8DFD3'} />
            </div>
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button type="button" onClick={() => { setShowReset(true); setResetEmail(email); setError('') }}
                style={{ background: 'none', border: 'none', color: '#7EB5E6', fontSize: '13px', fontWeight: '500', cursor: 'pointer', padding: '4px 0' }}>
                Passwort vergessen?
              </button>
            </div>
            <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
              {loading ? 'Wird geladen...' : 'Anmelden'}
            </Button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: '#A89B8C', fontSize: '14px' }}>Noch keinen Account? </span>
          <Link to="/register" style={{ color: '#FF6B9D', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>Registrieren</Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '12px', color: '#A89B8C', background: 'rgba(255,255,255,0.6)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(232,223,211,0.5)', fontWeight: '500' }}>AI Powered Studio</span>
        </div>
      </div>
    </div>
  )
}

export default Login
