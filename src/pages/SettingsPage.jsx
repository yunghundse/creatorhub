import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Shield, FileText, ChevronRight, Key, Trash2, AlertTriangle, X, Building2, Check, UserPlus, Monitor, CreditCard, Scale, FileCheck } from 'lucide-react'
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth'
import { doc, deleteDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import Card from '../components/Card'
import Button from '../components/Button'

const SettingsPage = ({ user, userData }) => {
  const navigate = useNavigate()
  const [view, setView] = useState('main') // main, security, legal, team
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPwConfirm, setNewPwConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePw, setDeletePw] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [companyName, setCompanyName] = useState(null)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createdCode, setCreatedCode] = useState(null)

  const userRole = userData?.role || 'model'
  const hasCompany = !!userData?.companyId
  // Models können beitreten, Manager gründen selbst
  const canJoinCompany = userRole === 'model'
  const isManager = userRole === 'manager'

  // Load current company name
  useEffect(() => {
    if (!userData?.companyId) return
    getDoc(doc(db, 'companies', userData.companyId)).then(snap => {
      if (snap.exists()) setCompanyName(snap.data().name)
    }).catch(() => {})
  }, [userData?.companyId])

  // Also check companies collection for manager ownership
  useEffect(() => {
    if (!isManager || hasCompany) return
    getDocs(query(collection(db, 'companies'), where('ownerId', '==', user.uid))).then(snap => {
      if (!snap.empty) {
        const c = snap.docs[0]
        setCompanyName(c.data().name)
      }
    }).catch(() => {})
  }, [isManager, user?.uid])

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
      // Clean up company_members entries for this user
      try {
        const memberSnap = await getDocs(query(collection(db, 'company_members'), where('userId', '==', user.uid)))
        for (const memberDoc of memberSnap.docs) {
          await deleteDoc(memberDoc.ref)
        }
      } catch (cleanupErr) {
        console.warn('company_members cleanup:', cleanupErr)
      }
      await deleteDoc(doc(db, 'users', user.uid))
      await deleteUser(auth.currentUser)
    } catch (err) {
      console.error('Delete error:', err.code)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError('Passwort ist falsch.')
      else if (err.code === 'auth/requires-recent-login') setError('Bitte melde dich neu an und versuche es erneut.')
      else setError(`Fehler: ${err.code || err.message}`)
    }
    setLoading(false)
  }

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) { setCreateError('Bitte gib einen Firmennamen ein.'); return }
    setCreateError(''); setCreateLoading(true)

    try {
      // Generate invite code (6 chars)
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]

      const companyData = {
        name: newCompanyName.trim(),
        ownerId: user.uid,
        ownerEmail: user.email,
        inviteCode: code,
        abo: 'free',
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'companies'), companyData)
      await updateDoc(doc(db, 'users', user.uid), { companyId: docRef.id })

      setCreatedCode(code)
      setCompanyName(newCompanyName.trim())
      setNewCompanyName('')
    } catch (err) {
      console.error('Create company error:', err)
      setCreateError('Fehler beim Erstellen. Bitte versuche es erneut.')
    }
    setCreateLoading(false)
  }

  const handleJoinCompany = async () => {
    if (!inviteCode.trim()) { setJoinError('Bitte Einladungscode eingeben.'); return }
    setJoinError(''); setJoinSuccess(''); setJoinLoading(true)

    try {
      // Find company by invite code
      const q = query(collection(db, 'companies'), where('inviteCode', '==', inviteCode.trim().toUpperCase()))
      const snap = await getDocs(q)

      if (snap.empty) {
        setJoinError('Ungültiger Einladungscode. Bitte prüfe den Code.')
        setJoinLoading(false)
        return
      }

      const companyDoc = snap.docs[0]
      const companyData = companyDoc.data()
      const companyId = companyDoc.id

      // Check slot limits
      const abo = companyData.abo || 'free'
      const limits = { free: 1, pro: 5, business: 10 }
      const maxSlots = limits[abo] || 1

      const membersSnap = await getDocs(query(collection(db, 'users'), where('companyId', '==', companyId)))
      const memberCount = membersSnap.docs.filter(d => d.id !== companyData.ownerId).length

      if (memberCount >= maxSlots) {
        setJoinError(`Team ist voll (${memberCount}/${maxSlots}). Der Manager muss das Abo upgraden.`)
        setJoinLoading(false)
        return
      }

      // Join the company (legacy + new company_members system)
      await updateDoc(doc(db, 'users', user.uid), { companyId })
      // Create company_members entry with pending status
      try {
        await addDoc(collection(db, 'company_members'), {
          companyId,
          userId: user.uid,
          email: user.email,
          displayName: user.displayName || user.email,
          role: userRole,
          status: 'pending',
          joinedAt: serverTimestamp(),
        })
      } catch (memberErr) {
        console.warn('company_members create:', memberErr)
      }
      setJoinSuccess(`Erfolgreich "${companyData.name}" beigetreten! Warte auf Freischaltung durch den Inhaber.`)
      setCompanyName(companyData.name)
      setInviteCode('')

      // Reload after short delay
      setTimeout(() => window.location.reload(), 1500)

    } catch (err) {
      console.error('Join error:', err)
      setJoinError('Fehler beim Beitreten. Bitte versuche es erneut.')
    }
    setJoinLoading(false)
  }

  const handleLeaveCompany = async () => {
    setError(''); setLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), { companyId: null })
      // Also remove company_members entry
      try {
        const memberSnap = await getDocs(query(collection(db, 'company_members'), where('userId', '==', user.uid)))
        for (const memberDoc of memberSnap.docs) {
          await deleteDoc(memberDoc.ref)
        }
      } catch (cleanupErr) {
        console.warn('company_members cleanup on leave:', cleanupErr)
      }
      setCompanyName(null)
      setSuccess('Du hast die Firma verlassen.')
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Leave error:', err)
      setError('Fehler beim Verlassen der Firma.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  // ===== TEAM / EINLADUNGSCODE =====
  if (view === 'team') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => { setView('main'); setJoinError(''); setJoinSuccess('') }} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px', cursor: 'pointer' }}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Team & Firma</h2>
        </div>

        {/* Current Company Status */}
        {hasCompany && companyName ? (
          <Card style={{ marginBottom: '16px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(107,201,160,0.15), rgba(107,201,160,0.08))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Building2 size={22} color="#6BC9A0" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{companyName}</p>
                <p style={{ fontSize: '12px', color: '#6BC9A0', fontWeight: '500' }}>Mitglied als {userRole}</p>
              </div>
              <Check size={20} color="#6BC9A0" />
            </div>

            {canJoinCompany && (
              <button onClick={handleLeaveCompany} disabled={loading} style={{
                width: '100%', padding: '11px', borderRadius: '12px',
                border: '1.5px solid rgba(220,38,38,0.15)', background: 'rgba(220,38,38,0.04)',
                color: '#DC2626', fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                opacity: loading ? 0.5 : 1,
              }}>
                Firma verlassen
              </button>
            )}
          </Card>
        ) : canJoinCompany ? (
          <>
            {/* Join Company Form */}
            <Card style={{ padding: '20px', marginBottom: '16px', border: '1.5px solid rgba(126,181,230,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <UserPlus size={18} color="#7EB5E6" />
                <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Firma beitreten</span>
              </div>
              <p style={{ fontSize: '13px', color: '#7A6F62', marginBottom: '14px', lineHeight: '1.5' }}>
                Gib den Einladungscode ein, den du von deinem Manager erhalten hast.
              </p>

              {joinError && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px', padding: '10px 14px', marginBottom: '12px',
                  color: '#DC2626', fontSize: '13px', fontWeight: '500',
                }}>{joinError}</div>
              )}
              {joinSuccess && (
                <div style={{
                  background: 'rgba(107,201,160,0.08)', border: '1px solid rgba(107,201,160,0.2)',
                  borderRadius: '10px', padding: '10px 14px', marginBottom: '12px',
                  color: '#059669', fontSize: '13px', fontWeight: '500',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}><Check size={16} /> {joinSuccess}</div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Einladungscode</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="z.B. AB3XY2"
                  maxLength={8}
                  style={{
                    ...inputStyle,
                    fontSize: '18px', fontWeight: '700', letterSpacing: '3px',
                    textAlign: 'center', fontFamily: 'monospace', textTransform: 'uppercase',
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleJoinCompany()}
                />
              </div>

              <Button variant="primary" onClick={handleJoinCompany} disabled={joinLoading || !inviteCode.trim()} style={{ width: '100%', padding: '13px' }}>
                {joinLoading ? 'Wird geprüft...' : 'Firma beitreten'}
              </Button>
            </Card>

            {/* Info */}
            <Card style={{ padding: '16px', background: 'rgba(245,197,99,0.04)', border: '1px solid rgba(245,197,99,0.15)' }}>
              <p style={{ fontSize: '12px', color: '#7A6F62', lineHeight: '1.6' }}>
                <strong style={{ color: '#E8A940' }}>Wie bekomme ich einen Code?</strong><br />
                Dein Manager erstellt eine Firma und erhält einen Einladungscode. Dieser wird dir per Chat oder direkt mitgeteilt. Nach dem Beitritt siehst du den gemeinsamen Kalender, Assets und mehr.
              </p>
            </Card>
          </>
        ) : isManager ? (
          <>
            {/* Manager: Create Company Form */}
            {createdCode ? (
              <Card style={{ padding: '24px', textAlign: 'center', border: '1.5px solid rgba(107,201,160,0.3)', background: 'rgba(107,201,160,0.04)' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '18px',
                  background: 'linear-gradient(135deg, #6BC9A0, #4FA882)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', boxShadow: '0 4px 15px rgba(107,201,160,0.3)',
                }}>
                  <Check size={26} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420', marginBottom: '6px' }}>Firma erstellt!</h3>
                <p style={{ fontSize: '13px', color: '#7A6F62', marginBottom: '16px' }}>
                  Teile diesen Einladungscode mit deinen Models:
                </p>
                <div style={{
                  padding: '14px 20px', borderRadius: '14px',
                  background: 'rgba(42,36,32,0.04)', border: '1.5px solid #E8DFD3',
                  marginBottom: '16px',
                }}>
                  <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '6px', fontFamily: 'monospace', color: '#2A2420' }}>
                    {createdCode}
                  </span>
                </div>
                <button onClick={() => { navigator.clipboard?.writeText(createdCode) }} style={{
                  padding: '10px 24px', borderRadius: '12px', border: '1.5px solid rgba(126,181,230,0.3)',
                  background: 'rgba(126,181,230,0.06)', color: '#7EB5E6', fontWeight: '600',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '12px',
                }}>
                  Code kopieren
                </button>
                <br />
                <Button variant="primary" onClick={() => { setTimeout(() => window.location.reload(), 200) }} style={{ marginTop: '8px', padding: '12px 24px' }}>
                  Zum Firma-Dashboard
                </Button>
              </Card>
            ) : (
              <Card style={{ padding: '20px', border: '1.5px solid rgba(245,197,99,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <Building2 size={18} color="#F5C563" />
                  <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Firma erstellen</span>
                </div>
                <p style={{ fontSize: '13px', color: '#7A6F62', marginBottom: '14px', lineHeight: '1.5' }}>
                  Erstelle deine Firma und erhalte einen Einladungscode, den du mit deinen Models teilen kannst.
                </p>

                {createError && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px', padding: '10px 14px', marginBottom: '12px',
                    color: '#DC2626', fontSize: '13px', fontWeight: '500',
                  }}>{createError}</div>
                )}

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Firmenname</label>
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={e => setNewCompanyName(e.target.value)}
                    placeholder="z.B. Studio Max, CreatorTeam..."
                    maxLength={40}
                    style={inputStyle}
                    onKeyDown={e => e.key === 'Enter' && handleCreateCompany()}
                  />
                </div>

                <Button variant="primary" onClick={handleCreateCompany} disabled={createLoading || !newCompanyName.trim()} style={{ width: '100%', padding: '13px' }}>
                  {createLoading ? 'Wird erstellt...' : 'Firma gründen'}
                </Button>
              </Card>
            )}
          </>
        ) : (
          <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Building2 size={36} color="#E8DFD3" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#7A6F62', fontSize: '14px' }}>Du bist aktuell keiner Firma zugeordnet.</p>
          </Card>
        )}
      </div>
    )
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
    const legalItems = [
      { title: 'Impressum', desc: 'Angaben gemäß § 5 TMG', icon: FileText, path: '/legal/impressum', color: '#7EB5E6' },
      { title: 'AGB', desc: 'Allgemeine Geschäftsbedingungen', icon: Scale, path: '/legal/agb', color: '#F5C563' },
      { title: 'Datenschutz', desc: 'DSGVO-konforme Datenschutzerklärung', icon: Shield, path: '/legal/datenschutz', color: '#6BC9A0' },
      { title: 'NDA / Geheimhaltung', desc: 'Digitale Vertraulichkeitsvereinbarung', icon: FileCheck, path: '/legal/nda', color: '#9B8FE6' },
    ]

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px', cursor: 'pointer' }}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Rechtliches</h2>
        </div>

        {legalItems.map(item => {
          const Icon = item.icon
          return (
            <Card key={item.title} onClick={() => navigate(item.path)} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}>
              <div style={{ width: '40px', height: '40px', background: `${item.color}12`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={item.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '1px' }}>{item.desc}</p>
              </div>
              <ChevronRight size={18} color="#C9BFAF" />
            </Card>
          )
        })}
      </div>
    )
  }

  // ===== HAUPTMENÜ =====
  const menuItems = [
    { icon: Building2, label: 'Team & Firma', desc: hasCompany ? `Mitglied bei ${companyName || 'Firma'}` : 'Einer Firma beitreten', action: () => setView('team'), color: '#7EB5E6' },
    { icon: CreditCard, label: 'Abo-Verwaltung', desc: 'Plan verwalten, Rechnungen, Kündigung', action: () => navigate('/dashboard/subscription'), color: '#6BC9A0' },
    { icon: Shield, label: 'Sicherheit', desc: 'Passwort ändern, Account löschen', action: () => setView('security'), color: '#FF6B9D' },
    { icon: Monitor, label: 'Aktive Sitzungen', desc: 'Login-Übersicht und Session-Management', action: () => navigate('/einstellungen/sessions'), color: '#9B8FE6' },
    { icon: FileText, label: 'Rechtliches', desc: 'Impressum, AGB, Datenschutz, NDA', action: () => setView('legal'), color: '#F5C563' },
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
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600', textTransform: 'capitalize',
              background: 'rgba(255,107,157,0.08)', color: '#FF6B9D',
            }}>{userRole}</span>
            {hasCompany && companyName && (
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: '500',
                background: 'rgba(107,201,160,0.08)', color: '#6BC9A0',
              }}>{companyName}</span>
            )}
          </div>
        </div>
      </Card>

      {/* Join Company Banner for Models without a company */}
      {canJoinCompany && !hasCompany && (
        <Card className="animate-fade-in stagger-2" onClick={() => setView('team')} style={{
          marginBottom: '16px', padding: '14px 18px', cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(126,181,230,0.08), rgba(126,181,230,0.04))',
          border: '1.5px solid rgba(126,181,230,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #7EB5E6, #5A9BD4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserPlus size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Firma beitreten</p>
              <p style={{ fontSize: '12px', color: '#7A6F62' }}>Einladungscode eingeben um deinem Team beizutreten</p>
            </div>
            <ChevronRight size={18} color="#7EB5E6" />
          </div>
        </Card>
      )}

      {/* Menu */}
      {menuItems.map((item, i) => {
        const Icon = item.icon
        return (
          <Card key={item.label} onClick={item.action}
            style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}
            className={`animate-fade-in stagger-${i + 3}`}>
            <div style={{ width: '40px', height: '40px', background: `${item.color}12`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={item.color} />
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
      <div style={{ marginTop: '24px' }} className="animate-fade-in stagger-6">
        <Button variant="secondary" onClick={handleLogout} style={{ width: '100%', padding: '14px' }}>
          <LogOut size={18} /> Abmelden
        </Button>
      </div>

      {/* Version */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#C9BFAF', marginTop: '20px' }}>CreatorHub v7.0 — Team Edition</p>
    </div>
  )
}

export default SettingsPage
