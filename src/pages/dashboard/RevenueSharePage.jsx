import React, { useState, useEffect } from 'react'
import { DollarSign, Plus, Users, TrendingUp, Percent, X } from 'lucide-react'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const PLATFORMS = ['OnlyFans', 'Fansly', 'Patreon', 'TikTok', 'Instagram', 'YouTube', 'Twitch', 'Sonstiges']

const RevenueSharePage = ({ userData }) => {
  const [splits, setSplits] = useState([])
  const [members, setMembers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ modelId: '', platform: 'OnlyFans', brutto: '', splitPercent: '50' })
  const [filter, setFilter] = useState('all')
  const user = auth.currentUser

  // Load company members (models)
  useEffect(() => {
    if (!userData?.companyId) return
    const q = query(collection(db, 'users'), where('companyId', '==', userData.companyId), where('role', '==', 'model'))
    const unsub = onSnapshot(q, snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [userData])

  // Load revenue splits
  useEffect(() => {
    if (!userData?.companyId) return
    const q = query(collection(db, 'revenueSplits'), where('companyId', '==', userData.companyId))
    const unsub = onSnapshot(q, snap => {
      setSplits(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0
        const tb = b.createdAt?.toMillis?.() || 0
        return tb - ta
      }))
    })
    return () => unsub()
  }, [userData])

  const addSplit = async () => {
    if (!form.modelId || !form.brutto || !form.splitPercent) return
    const model = members.find(m => m.id === form.modelId)
    const brutto = parseFloat(form.brutto)
    const percent = parseFloat(form.splitPercent)
    const modelShare = (brutto * percent) / 100
    const managerShare = brutto - modelShare

    await addDoc(collection(db, 'revenueSplits'), {
      companyId: userData.companyId,
      modelId: form.modelId,
      modelName: model?.displayName || model?.email || 'Model',
      platform: form.platform,
      brutto,
      splitPercent: percent,
      modelShare: Math.round(modelShare * 100) / 100,
      managerShare: Math.round(managerShare * 100) / 100,
      month: new Date().toISOString().slice(0, 7),
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    })
    setForm({ modelId: '', platform: 'OnlyFans', brutto: '', splitPercent: '50' })
    setShowForm(false)
  }

  const deleteSplit = async (id) => {
    await deleteDoc(doc(db, 'revenueSplits', id))
  }

  const filtered = filter === 'all' ? splits : splits.filter(s => s.modelId === filter)

  // Aggregierte Statistiken
  const totalBrutto = filtered.reduce((sum, s) => sum + (s.brutto || 0), 0)
  const totalModelShare = filtered.reduce((sum, s) => sum + (s.modelShare || 0), 0)
  const totalManagerShare = filtered.reduce((sum, s) => sum + (s.managerShare || 0), 0)

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '4px' }}>Revenue Split</h2>
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Einnahmen aufteilen zwischen Manager & Model</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)} style={{ padding: '10px 16px', fontSize: '13px' }}>
          <Plus size={16} /> Eintrag
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <Card style={{ textAlign: 'center', padding: '16px' }}>
          <DollarSign size={20} color="#F5C563" style={{ margin: '0 auto 6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Brutto Gesamt</p>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420' }}>{totalBrutto.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '16px' }}>
          <Users size={20} color="#FF6B9D" style={{ margin: '0 auto 6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Model-Anteil</p>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#FF6B9D' }}>{totalModelShare.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '16px' }}>
          <TrendingUp size={20} color="#6BC9A0" style={{ margin: '0 auto 6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Manager-Anteil</p>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#6BC9A0' }}>{totalManagerShare.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
        </Card>
      </div>

      {/* Filter */}
      {members.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button onClick={() => setFilter('all')} style={{
            padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
            background: filter === 'all' ? 'rgba(245,197,99,0.15)' : 'rgba(42,36,32,0.04)',
            color: filter === 'all' ? '#E8A940' : '#7A6F62', cursor: 'pointer',
          }}>Alle</button>
          {members.map(m => (
            <button key={m.id} onClick={() => setFilter(m.id)} style={{
              padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
              background: filter === m.id ? 'rgba(255,107,157,0.12)' : 'rgba(42,36,32,0.04)',
              color: filter === m.id ? '#FF6B9D' : '#7A6F62', cursor: 'pointer',
            }}>{m.displayName || m.email?.split('@')[0]}</button>
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <Card style={{ marginBottom: '16px', padding: '20px', border: '1.5px solid rgba(245,197,99,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420' }}>Neuer Revenue Split</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Model</label>
            <select value={form.modelId} onChange={e => setForm({ ...form, modelId: e.target.value })} style={inputStyle}>
              <option value="">Model wählen...</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.displayName || m.email}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Plattform</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={inputStyle}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Brutto (EUR)</label>
              <input type="number" value={form.brutto} onChange={e => setForm({ ...form, brutto: e.target.value })} placeholder="0.00" step="0.01" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>
              Model-Anteil: {form.splitPercent}%
            </label>
            <input type="range" min="0" max="100" value={form.splitPercent} onChange={e => setForm({ ...form, splitPercent: e.target.value })}
              style={{ width: '100%', accentColor: '#FF6B9D' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#A89B8C' }}>
              <span>Model: {form.brutto ? ((parseFloat(form.brutto) * parseFloat(form.splitPercent)) / 100).toFixed(2) : '0.00'} EUR</span>
              <span>Manager: {form.brutto ? (parseFloat(form.brutto) - (parseFloat(form.brutto) * parseFloat(form.splitPercent)) / 100).toFixed(2) : '0.00'} EUR</span>
            </div>
          </div>

          <Button variant="primary" onClick={addSplit} style={{ width: '100%' }}>Eintragen</Button>
        </Card>
      )}

      {/* Splits List */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Percent size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Noch keine Revenue-Splits eingetragen.</p>
        </Card>
      ) : (
        filtered.map(s => (
          <Card key={s.id} style={{ marginBottom: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{s.modelName}</span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(126,181,230,0.1)', color: '#7EB5E6', fontWeight: '500' }}>{s.platform}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                  <span style={{ color: '#7A6F62' }}>Brutto: <strong style={{ color: '#2A2420' }}>{s.brutto?.toFixed(2)} EUR</strong></span>
                  <span style={{ color: '#7A6F62' }}>Split: <strong style={{ color: '#FF6B9D' }}>{s.splitPercent}%</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '12px' }}>
                  <span style={{ color: '#FF6B9D' }}>Model: {s.modelShare?.toFixed(2)}</span>
                  <span style={{ color: '#6BC9A0' }}>Manager: {s.managerShare?.toFixed(2)}</span>
                  <span style={{ color: '#A89B8C' }}>{s.month}</span>
                </div>
              </div>
              <button onClick={() => deleteSplit(s.id)} style={{
                padding: '6px', background: 'rgba(220,38,38,0.06)', border: 'none', borderRadius: '8px',
                color: '#DC2626', cursor: 'pointer',
              }}><X size={14} /></button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

export default RevenueSharePage
