import React, { useState } from 'react'
import { LogOut, User, Shield, FileText, ChevronRight, Key, Trash2, AlertTriangle, X } from 'lucide-react'
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import Card from '../components/Card'
import Button from '../components/Button'

const SettingsPage = ({ user }) => {
  const [view, setView] = useState('main') // main, security, legal
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPwConfirm, setNewPwConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePw, setDeletePw] = useState('')

  const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com'

  const handleLogout = async () => { await signOut(auth) }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (newPw !== newPwConfirm) { setError('Neue Passwörter stimmen nicht überein.'); return }
    if (newPw.length < 6) { setError('Neues Passwort muss mindestens 6 Zeichen haben.'); return }
    setLoading(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPw)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPw)
      setSuccess('Passwort erfolgreich geändert!')
      setCurrentPw(''); setNewPw(''); setNewPwConfirm('')
    } catch (err) {
      console.error('Password change error:', err.code)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError('Aktuelles Passwort ist falsch.')
      else if (err.code === 'auth/too-many-requests') setError('Zu viele Versuche. Bitte warte.')
      else setError(`Fehler: ${err.code || err.message}`)
    }
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    setError(''); setLoading(true)
    try {
      if (!isGoogleUser && deletePw) {
        const credential = EmailAuthProvider.credential(user.email, deletePw)
        await reauthenticateWithCredential(auth.currentUser, credential)
      }
      // Delete Firestore user doc
      await deleteDoc(doc(db, 'users', user.uid))
      // Delete Firebase Auth account
      await deleteUser(auth.currentUser)
    } catch (err) {
      console.error('Delete error:', err.code)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError('Passwort ist falsch.')
      else if (err.code === 'auth/requires-recent-login') setError('Bitte melde dich neu an und versuche es erneut.')
      else setError(`Fehler: ${err.code || err.message}`)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  // ===== SICHERHEIT =====
  if (view === 'security') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => { setView('main'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px', cursor: 'pointer' }}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Sicherheit</h2>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '14px', fontWeight: '500' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(107,201,160,0.08)', border: '1px solid rgba(107,201,160,0.2)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px', color: '#059669', fontSize: '14px', fontWeight: '500' }}>{success}</div>}

        {/* Passwort ändern */}
        <Card style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Key size={18} color="#FF6B9D" />
            <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Passwort ändern</span>
          </div>
          {isGoogleUser ? (
            <p style={{ fontSize: '13px', color: '#A89B8C' }}>Du bist mit Google angemeldet. Passwortänderung nur über dein Google-Konto möglich.</p>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Aktuelles Passwort</label>
                <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Neues Passwort</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required placeholder="Min. 6 Zeichen" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Neues Passwort bestätigen</label>
                <input type="password" value={newPwConfirm} onChange={e => setNewPwConfirm(e.target.value)} required style={inputStyle} />
              </div>
              <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
                {loading ? 'Wird geändert...' : 'Passwort ändern'}
              </Button>
            </form>
          )}
        </Card>

        {/* Account löschen */}
        <Card style={{ padding: '20px', border: '1.5px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Trash2 size={18} color="#DC2626" />
            <span style={{ fontWeight: '600', color: '#DC2626', fontSize: '15px' }}>Account löschen</span>
          </div>
          <p style={{ fontSize: '13px', color: '#7A6F62', marginBottom: '16px', lineHeight: '1.5' }}>
            Dein Account und alle Daten werden unwiderruflich gelöscht. Dies kann nicht rückgängig gemacht werden.
          </p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} style={{
              padding: '10px 20px', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', color: '#DC2626', fontWeight: '600', fontSize: '14px', cursor: 'pointer', width: '100%',
            }}>Account löschen</button>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(245,197,99,0.1)', borderRadius: '12px', marginBottom: '12px' }}>
                <AlertTriangle size={16} color="#E8A940" />
                <span style={{ fontSize: '13px', color: '#5C5349', fontWeight: '500' }}>Bist du sicher? Alle Daten gehen verloren!</span>
              </div>
              {!isGoogleUser && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Passwort zur Bestätigung</label>
                  <input type="password" value={deletePw} onChange={e => setDeletePw(e.target.value)} style={inputStyle} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setShowDeleteConfirm(false); setDeletePw('') }} style={{
                  flex: 1, padding: '10px', background: 'rgba(42,36,32,0.04)', border: '1px solid #E8DFD3',
                  borderRadius: '12px', color: '#7A6F62', fontWeight: '500', fontSize: '14px', cursor: 'pointer',
                }}>Abbrechen</button>
                <button onClick={handleDeleteAccount} disabled={loading} style={{
                  flex: 1, padding: '10px', background: '#DC2626', border: 'none',
                  borderRadius: '12px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                  opacity: loading ? 0.5 : 1,
                }}>Endgültig löschen</button>
              </div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  // ===== RECHTLICHES =====
  if (view === 'legal') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px', cursor: 'pointer' }}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Rechtliches</h2>
        </div>

        {[
          { title: 'Impressum', content: 'Angaben gemäß § 5 TMG\n\nCreatorHub\nInhaber: [Dein Name]\n[Deine Adresse]\n\nKontakt:\nE-Mail: kontakt@creatorhub.app\n\nVerantwortlich für den Inhalt nach § 55 Abs. 2 RStV:\n[Dein Name]\n[Deine Adresse]' },
          { title: 'AGB', content: 'Allgemeine Geschäftsbedingungen\n\n§1 Geltungsbereich\nDiese AGB gelten für die Nutzung der Plattform CreatorHub.\n\n§2 Registrierung\nDie Nutzung setzt eine Registrierung voraus. Die Freischaltung erfolgt durch einen Administrator.\n\n§3 Rollen\nBei der Registrierung wird eine Rolle gewählt (Manager, Model, Influencer, Cutter). Diese ist nicht änderbar.\n\n§4 Haftung\nDer Betreiber haftet nicht für Inhalte der Nutzer.\n\n§5 Kündigung\nNutzer können ihren Account jederzeit über die Einstellungen löschen.' },
          { title: 'Datenschutz', content: 'Datenschutzerklärung\n\n1. Verantwortlicher\nCreatorHub, kontakt@creatorhub.app\n\n2. Erhobene Daten\nWir erheben: E-Mail, Name, Profilbild (bei Google-Login), sowie nutzungsbezogene Daten.\n\n3. Speicherung\nDaten werden in Firebase (Google Cloud, EU-Region) gespeichert.\n\n4. Zweck\nAuthentifizierung, App-Funktionalität, Kommunikation zwischen Nutzern.\n\n5. Rechte\nAuskunft, Löschung, Berichtigung gemäß DSGVO. Kontakt: kontakt@creatorhub.app\n\n6. Cookies\nWir nutzen nur technisch notwendige Cookies (Firebase Auth Session).' },
        ].map(item => (
          <Card key={item.title} style={{ padding: '20px', marginBottom: '12px' }}>
            <h3 style={{ fontWeight: '600', color: '#2A2420', fontSize: '16px', marginBottom: '12px' }}>{item.title}</h3>
            <pre style={{ fontSize: '13px', color: '#5C5349', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{item.content}</pre>
          </Card>
        ))}
      </div>
    )
  }

  // ===== HAUPTMENÜ =====
  const menuItems = [
    { icon: Shield, label: 'Sicherheit', desc: 'Passwort ändern, Account löschen', action: () => setView('security') },
    { icon: FileText, label: 'Rechtliches', desc: 'Impressum, AGB, Datenschutz', action: () => setView('legal') },
  ]

  return (
    <div>
      <div className="animate-fade-in" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>Einstellungen</h2>
      </div>

      {/* User Info */}
      <Card className="animate-fade-in stagger-1" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user?.photoURL ? (
          <img src={user.photoURL} alt="avatar" style={{ width: '56px', height: '56px', borderRadius: '18px', border: '2px solid rgba(255,107,157,0.2)', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: '#5C5349' }}>
            {user?.displayName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '16px' }}>{user?.displayName || 'Creator'}</p>
          <p style={{ fontSize: '13px', color: '#A89B8C', marginTop: '2px' }}>{user?.email}</p>
        </div>
      </Card>

      {/* Menu */}
      {menuItems.map((item, i) => {
        const Icon = item.icon
        return (
          <Card key={item.label} onClick={item.action}
            style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}
            className={`animate-fade-in stagger-${i + 2}`}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,107,157,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color="#FF6B9D" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '1px' }}>{item.desc}</p>
            </div>
            <ChevronRight size={18} color="#C9BFAF" />
          </Card>
        )
      })}

      {/* Logout */}
      <div style={{ marginTop: '24px' }} className="animate-fade-in stagger-4">
        <Button variant="secondary" onClick={handleLogout} style={{ width: '100%', padding: '14px' }}>
          <LogOut size={18} /> Abmelden
        </Button>
      </div>

      {/* Version */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#C9BFAF', marginTop: '20px' }}>CreatorHub v2.0 — Made with AI</p>
    </div>
  )
}

export default SettingsPage
