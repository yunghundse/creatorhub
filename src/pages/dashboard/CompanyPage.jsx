import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Copy, Plus, Users, Check, RefreshCw, Crown } from 'lucide-react'
import { doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const ABO_LIMITS = { free: 1, pro: 5, business: 10 }

const CompanyPage = () => {
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [members, setMembers] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const user = auth.currentUser

  // Load company
  useEffect(() => {
    if (!user) return
    const loadCompany = async () => {
      // Check if user has a company
      const userSnap = await getDoc(doc(db, 'users', user.uid))
      const userData = userSnap.data()
      if (userData?.companyId) {
        const compSnap = await getDoc(doc(db, 'companies', userData.companyId))
        if (compSnap.exists()) setCompany({ id: compSnap.id, ...compSnap.data() })
      }
      setLoading(false)
    }
    loadCompany()
  }, [user])

  // Load members
  useEffect(() => {
    if (!company) return
    const q = query(collection(db, 'users'), where('companyId', '==', company.id))
    const unsub = onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.uid !== user.uid))
    })
    return () => unsub()
  }, [company])

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createCompany = async () => {
    if (!form.name.trim()) return
    setLoading(true)
    const inviteCode = generateInviteCode()
    const compRef = doc(collection(db, 'companies'))
    await setDoc(compRef, {
      name: form.name.trim(),
      description: form.description.trim(),
      ownerId: user.uid,
      ownerEmail: user.email,
      inviteCode,
      abo: 'free',
      createdAt: serverTimestamp(),
    })
    await updateDoc(doc(db, 'users', user.uid), { companyId: compRef.id })
    setCompany({ id: compRef.id, name: form.name.trim(), description: form.description.trim(), ownerId: user.uid, inviteCode, abo: 'free' })
    setShowCreate(false)
    setLoading(false)
  }

  const refreshInviteCode = async () => {
    const newCode = generateInviteCode()
    await updateDoc(doc(db, 'companies', company.id), { inviteCode: newCode })
    setCompany({ ...company, inviteCode: newCode })
  }

  const copyCode = () => {
    navigator.clipboard.writeText(company.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#A89B8C' }}>Laden...</div>

  // No company yet
  if (!company && !showCreate) {
    return (
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '8px' }}>Firma</h2>
        <p style={{ color: '#A89B8C', fontSize: '14px', marginBottom: '24px' }}>Erstelle deine Firma und lade Models ein</p>
        <Card style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Building2 size={40} color="#E8DFD3" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#7A6F62', fontSize: '15px', marginBottom: '20px' }}>Du hast noch keine Firma erstellt.</p>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> Firma erstellen
          </Button>
        </Card>
      </div>
    )
  }

  // Create form
  if (showCreate) {
    return (
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '24px' }}>Firma erstellen</h2>
        <Card style={{ padding: '20px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Firmenname</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="z.B. Star Agency" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Beschreibung</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Kurze Beschreibung..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>Abbrechen</Button>
            <Button variant="primary" onClick={createCompany} style={{ flex: 1 }}>Erstellen</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Company Dashboard
  const abo = company.abo || 'free'
  const maxSlots = ABO_LIMITS[abo]

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '8px' }}>{company.name}</h2>
      <p style={{ color: '#A89B8C', fontSize: '14px', marginBottom: '24px' }}>{company.description || 'Firmenverwaltung'}</p>

      {/* Abo Status */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: abo === 'free' ? '12px' : '0' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500' }}>Aktuelles Abo</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#2A2420', textTransform: 'capitalize' }}>{abo}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: '#A89B8C' }}>Slots</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: members.length >= maxSlots ? '#DC2626' : '#6BC9A0' }}>
                {members.length}/{maxSlots}
              </p>
            </div>
            <button onClick={() => navigate('/dashboard/pricing')} style={{
              padding: '10px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #F5C563cc, #F5C563)',
              color: 'white', fontWeight: '700', fontSize: '13px', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(245,197,99,0.3)',
            }}>
              <Crown size={14} /> {abo === 'free' ? 'Upgraden' : 'Plan ändern'}
            </button>
          </div>
        </div>
        {abo === 'free' && members.length >= maxSlots && (
          <div style={{
            padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)',
            fontSize: '13px', color: '#DC2626', fontWeight: '500',
          }}>
            Slot-Limit erreicht. Upgrade auf Pro für bis zu 5 Teammitglieder.
          </div>
        )}
      </Card>

      {/* Invite Code */}
      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', marginBottom: '10px' }}>Einladungscode</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            flex: 1, padding: '14px 16px', background: 'rgba(42,36,32,0.03)',
            border: '1.5px solid #E8DFD3', borderRadius: '12px',
            fontSize: '20px', fontWeight: '700', color: '#2A2420', letterSpacing: '3px', textAlign: 'center',
            fontFamily: 'monospace',
          }}>
            {company.inviteCode}
          </div>
          <button onClick={copyCode} style={{
            padding: '14px', background: copied ? 'rgba(107,201,160,0.1)' : 'rgba(255,107,157,0.08)',
            border: 'none', borderRadius: '12px', color: copied ? '#6BC9A0' : '#FF6B9D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
          <button onClick={refreshInviteCode} style={{
            padding: '14px', background: 'rgba(42,36,32,0.04)', border: 'none', borderRadius: '12px',
            color: '#7A6F62', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={20} />
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '8px' }}>
          Teile diesen Code mit Models. Sie können ihn bei der Registrierung oder in den Einstellungen eingeben.
        </p>
      </Card>

      {/* Members */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={18} color="#F5C563" /> Team ({members.length})
      </h3>
      {members.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '30px' }}>
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Noch keine Teammitglieder. Teile deinen Einladungscode!</p>
        </Card>
      ) : (
        members.map(m => (
          <Card key={m.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: m.role === 'model' ? 'rgba(255,107,157,0.1)' : 'rgba(107,201,160,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '700', color: m.role === 'model' ? '#FF6B9D' : '#6BC9A0',
            }}>
              {m.displayName?.charAt(0) || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{m.displayName || m.email}</p>
              <p style={{ fontSize: '12px', color: '#A89B8C', textTransform: 'capitalize' }}>{m.role}</p>
            </div>
            <span style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: '600',
              background: m.approved ? 'rgba(107,201,160,0.1)' : 'rgba(245,197,99,0.1)',
              color: m.approved ? '#6BC9A0' : '#E8A940',
            }}>{m.approved ? 'Aktiv' : 'Wartend'}</span>
          </Card>
        ))
      )}
    </div>
  )
}

export default CompanyPage
