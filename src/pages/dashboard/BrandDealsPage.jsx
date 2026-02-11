import React, { useState, useEffect } from 'react'
import { Briefcase, Plus, X, DollarSign, Calendar, ExternalLink, CheckCircle, Clock, Send, CreditCard } from 'lucide-react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const STATUS_CONFIG = {
  negotiation: { label: 'Verhandlung', color: '#E8A940', icon: Clock },
  confirmed: { label: 'Bestätigt', color: '#7EB5E6', icon: CheckCircle },
  posted: { label: 'Gepostet', color: '#6BC9A0', icon: Send },
  paid: { label: 'Bezahlt', color: '#FF6B9D', icon: CreditCard },
}

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'OnlyFans', 'Twitter/X', 'Sonstiges']

const BrandDealsPage = ({ userData }) => {
  const [deals, setDeals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ brand: '', contact: '', value: '', deadline: '', platform: 'Instagram', postUrl: '', notes: '' })
  const [filter, setFilter] = useState('all')
  const user = auth.currentUser

  useEffect(() => {
    if (!userData?.companyId) return
    const q = query(collection(db, 'brandDeals'), where('companyId', '==', userData.companyId))
    const unsub = onSnapshot(q, snap => {
      setDeals(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
        if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
        return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      }))
    })
    return () => unsub()
  }, [userData])

  const saveDeal = async () => {
    if (!form.brand.trim()) return
    const data = {
      companyId: userData.companyId,
      brand: form.brand.trim(),
      contact: form.contact.trim(),
      value: parseFloat(form.value) || 0,
      deadline: form.deadline,
      platform: form.platform,
      postUrl: form.postUrl.trim(),
      notes: form.notes.trim(),
      status: 'negotiation',
      createdBy: user.uid,
    }
    if (editId) {
      await updateDoc(doc(db, 'brandDeals', editId), data)
      setEditId(null)
    } else {
      await addDoc(collection(db, 'brandDeals'), { ...data, createdAt: serverTimestamp() })
    }
    setForm({ brand: '', contact: '', value: '', deadline: '', platform: 'Instagram', postUrl: '', notes: '' })
    setShowForm(false)
  }

  const cycleStatus = async (deal) => {
    const order = ['negotiation', 'confirmed', 'posted', 'paid']
    const idx = order.indexOf(deal.status)
    const next = order[(idx + 1) % order.length]
    await updateDoc(doc(db, 'brandDeals', deal.id), { status: next })
  }

  const deleteDeal = async (id) => {
    await deleteDoc(doc(db, 'brandDeals', id))
  }

  const startEdit = (deal) => {
    setForm({
      brand: deal.brand, contact: deal.contact || '', value: deal.value?.toString() || '',
      deadline: deal.deadline || '', platform: deal.platform || 'Instagram',
      postUrl: deal.postUrl || '', notes: deal.notes || '',
    })
    setEditId(deal.id)
    setShowForm(true)
  }

  const filtered = filter === 'all' ? deals : deals.filter(d => d.status === filter)

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const paidValue = deals.filter(d => d.status === 'paid').reduce((sum, d) => sum + (d.value || 0), 0)
  const pendingValue = totalValue - paidValue

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '4px' }}>Brand Deals</h2>
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Kooperationen und Verträge verwalten</p>
        </div>
        <Button variant="primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ brand: '', contact: '', value: '', deadline: '', platform: 'Instagram', postUrl: '', notes: '' }) }} style={{ padding: '10px 16px', fontSize: '13px' }}>
          <Plus size={16} /> Deal
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <Card style={{ textAlign: 'center', padding: '16px' }}>
          <Briefcase size={18} color="#7EB5E6" style={{ margin: '0 auto 6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Gesamt</p>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420' }}>{totalValue.toLocaleString('de-DE')} EUR</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '16px' }}>
          <CreditCard size={18} color="#6BC9A0" style={{ margin: '0 auto 6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Erhalten</p>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#6BC9A0' }}>{paidValue.toLocaleString('de-DE')} EUR</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '16px' }}>
          <Clock size={18} color="#E8A940" style={{ margin: '0 auto 6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Offen</p>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#E8A940' }}>{pendingValue.toLocaleString('de-DE')} EUR</p>
        </Card>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button onClick={() => setFilter('all')} style={{
          padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '500',
          background: filter === 'all' ? 'rgba(42,36,32,0.08)' : 'rgba(42,36,32,0.04)',
          color: filter === 'all' ? '#2A2420' : '#7A6F62', cursor: 'pointer',
        }}>Alle ({deals.length})</button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '500',
            background: filter === key ? `${cfg.color}18` : 'rgba(42,36,32,0.04)',
            color: filter === key ? cfg.color : '#7A6F62', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{cfg.label}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card style={{ marginBottom: '16px', padding: '20px', border: '1.5px solid rgba(126,181,230,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420' }}>{editId ? 'Deal bearbeiten' : 'Neuer Brand Deal'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Marke/Brand</label>
              <input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="z.B. FashionNova" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Kontakt</label>
              <input type="text" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Email/Name" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Wert (EUR)</label>
              <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Plattform</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={inputStyle}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Post-URL (optional)</label>
            <input type="url" value={form.postUrl} onChange={e => setForm({ ...form, postUrl: e.target.value })} placeholder="https://..." style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Notizen</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Vertragsdetails, Anforderungen..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <Button variant="primary" onClick={saveDeal} style={{ width: '100%' }}>{editId ? 'Speichern' : 'Erstellen'}</Button>
        </Card>
      )}

      {/* Deals List */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Briefcase size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Keine Brand Deals vorhanden.</p>
        </Card>
      ) : (
        filtered.map(deal => {
          const cfg = STATUS_CONFIG[deal.status] || STATUS_CONFIG.negotiation
          const StatusIcon = cfg.icon
          const isOverdue = deal.deadline && deal.deadline < new Date().toISOString().slice(0, 10) && deal.status !== 'paid'
          return (
            <Card key={deal.id} style={{ marginBottom: '10px', padding: '16px', borderLeft: isOverdue ? '3px solid #DC2626' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }} onClick={() => startEdit(deal)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', color: '#2A2420', fontSize: '16px' }}>{deal.brand}</span>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}12`, color: cfg.color, fontWeight: '500' }}>{cfg.label}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: '#7A6F62', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={13} /> <strong style={{ color: '#2A2420' }}>{deal.value?.toLocaleString('de-DE')} EUR</strong>
                    </span>
                    <span style={{ color: '#7A6F62', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {deal.deadline || 'Kein Datum'}
                    </span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(126,181,230,0.1)', color: '#7EB5E6' }}>{deal.platform}</span>
                  </div>
                  {deal.notes && <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '4px' }}>{deal.notes}</p>}
                  {deal.contact && <p style={{ fontSize: '11px', color: '#A89B8C', marginTop: '2px' }}>Kontakt: {deal.contact}</p>}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => cycleStatus(deal)} style={{
                    padding: '8px 12px', background: `${cfg.color}10`, border: 'none', borderRadius: '8px',
                    color: cfg.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500',
                  }}><StatusIcon size={14} /></button>
                  {deal.postUrl && (
                    <a href={deal.postUrl} target="_blank" rel="noopener noreferrer" style={{
                      padding: '8px', background: 'rgba(107,201,160,0.1)', borderRadius: '8px', color: '#6BC9A0',
                      display: 'flex', alignItems: 'center',
                    }}><ExternalLink size={14} /></a>
                  )}
                  <button onClick={() => deleteDeal(deal.id)} style={{
                    padding: '8px', background: 'rgba(220,38,38,0.06)', border: 'none', borderRadius: '8px',
                    color: '#DC2626', cursor: 'pointer',
                  }}><X size={14} /></button>
                </div>
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}

export default BrandDealsPage
