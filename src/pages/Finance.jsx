import React, { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, ArrowUpRight, Plus, X, Trash2 } from 'lucide-react'
import {
  collection, addDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, doc, deleteDoc
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import Card from '../components/Card'
import Button from '../components/Button'
import ProgressBar from '../components/ProgressBar'

const PLATFORM_COLORS = {
  OnlyFans: '#FF6B9D',
  Fansly: '#7EB5E6',
  Patreon: '#F5C563',
  TikTok: '#000000',
  Instagram: '#E1306C',
  YouTube: '#FF0000',
  Twitch: '#9146FF',
  Sonstiges: '#A89B8C',
}

const PLATFORM_LIST = ['OnlyFans', 'Fansly', 'Patreon', 'TikTok', 'Instagram', 'YouTube', 'Twitch', 'Sonstiges']

const Finance = () => {
  const [entries, setEntries] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ platform: 'OnlyFans', brutto: '', netto: '', note: '', month: '' })

  const currentUser = auth.currentUser

  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'finances'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [currentUser])

  const addEntry = async () => {
    if (!form.brutto && !form.netto) return
    await addDoc(collection(db, 'finances'), {
      userId: currentUser.uid,
      platform: form.platform,
      brutto: parseFloat(form.brutto) || 0,
      netto: parseFloat(form.netto) || 0,
      note: form.note.trim(),
      month: form.month || new Date().toISOString().slice(0, 7),
      createdAt: serverTimestamp(),
    })
    setForm({ platform: 'OnlyFans', brutto: '', netto: '', note: '', month: '' })
    setShowAdd(false)
  }

  const deleteEntry = async (id) => {
    await deleteDoc(doc(db, 'finances', id))
  }

  // Aggregate by platform
  const platformTotals = entries.reduce((acc, e) => {
    if (!acc[e.platform]) acc[e.platform] = { brutto: 0, netto: 0 }
    acc[e.platform].brutto += (e.brutto || 0)
    acc[e.platform].netto += (e.netto || 0)
    return acc
  }, {})

  const totalBrutto = entries.reduce((sum, e) => sum + (e.brutto || 0), 0)
  const totalNetto = entries.reduce((sum, e) => sum + (e.netto || 0), 0)

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(42,36,32,0.03)', border: '1.5px solid #E8DFD3',
    borderRadius: '12px', color: '#2A2420', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  }

  // ===== ADD FORM =====
  if (showAdd) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Einnahme hinzufügen</h2>
          <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>
        <Card style={{ padding: '20px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Plattform</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PLATFORM_LIST.map(p => (
                <button key={p} onClick={() => setForm({ ...form, platform: p })} style={{
                  padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '500',
                  border: form.platform === p ? 'none' : '1.5px solid #E8DFD3',
                  background: form.platform === p ? (PLATFORM_COLORS[p] || '#FF6B9D') : 'rgba(255,255,255,0.6)',
                  color: form.platform === p ? 'white' : '#7A6F62',
                }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Brutto (€)</label>
              <input type="number" value={form.brutto} onChange={e => setForm({ ...form, brutto: e.target.value })} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Netto (€)</label>
              <input type="number" value={form.netto} onChange={e => setForm({ ...form, netto: e.target.value })} placeholder="0" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Monat</label>
            <input type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Notiz</label>
            <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="z.B. Abo-Einnahmen" style={inputStyle} />
          </div>
          <Button variant="primary" onClick={addEntry} style={{ width: '100%', padding: '14px' }}>Hinzufügen</Button>
        </Card>
      </div>
    )
  }

  // ===== MAIN VIEW =====
  return (
    <div>
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>Finanzen</h2>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginTop: '2px' }}>Dein Finanz-Überblick</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)} style={{ padding: '10px 16px' }}>
          <Plus size={18} /> Neu
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <Card className="animate-fade-in stagger-1">
          <p style={{ fontSize: '12px', color: '#A89B8C', marginBottom: '6px', fontWeight: '500' }}>Brutto</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.5px' }}>
            €{totalBrutto > 1000 ? (totalBrutto / 1000).toFixed(1) + 'k' : totalBrutto.toLocaleString('de-DE')}
          </p>
          {entries.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <ArrowUpRight size={14} color="#6BC9A0" />
              <span style={{ fontSize: '12px', color: '#6BC9A0', fontWeight: '600' }}>{entries.length} Einträge</span>
            </div>
          )}
        </Card>
        <Card className="animate-fade-in stagger-2">
          <p style={{ fontSize: '12px', color: '#A89B8C', marginBottom: '6px', fontWeight: '500' }}>Netto</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#6BC9A0', letterSpacing: '-0.5px' }}>
            €{totalNetto > 1000 ? (totalNetto / 1000).toFixed(1) + 'k' : totalNetto.toLocaleString('de-DE')}
          </p>
          {totalBrutto > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', color: '#A89B8C' }}>{((totalNetto / totalBrutto) * 100).toFixed(0)}% Marge</span>
            </div>
          )}
        </Card>
      </div>

      {/* Platform Breakdown */}
      {Object.keys(platformTotals).length > 0 && (
        <>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#FF6B9D" />
            Plattform-Analyse
          </h3>
          {Object.entries(platformTotals).sort((a, b) => b[1].netto - a[1].netto).map(([platform, totals], i) => (
            <Card key={platform} style={{ marginBottom: '12px' }} className={`animate-fade-in stagger-${Math.min(i + 3, 5)}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PLATFORM_COLORS[platform] || '#A89B8C' }} />
                  <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{platform}</span>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#6BC9A0' }}>
                  €{totals.netto.toLocaleString('de-DE')}
                </span>
              </div>
              {totals.brutto > 0 && (
                <ProgressBar progress={(totals.netto / totals.brutto) * 100} color={PLATFORM_COLORS[platform] || '#A89B8C'} height={5} />
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#A89B8C' }}>Brutto €{totals.brutto.toLocaleString('de-DE')}</span>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* Recent Entries */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '14px', marginTop: '24px' }}>
        Letzte Einträge
      </h3>
      {entries.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginBottom: '16px' }}>Noch keine Einträge. Füge deine erste Einnahme hinzu!</p>
          <Button variant="cream" onClick={() => setShowAdd(true)}><Plus size={16} /> Einnahme hinzufügen</Button>
        </Card>
      ) : (
        entries.slice(0, 10).map(e => (
          <Card key={e.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PLATFORM_COLORS[e.platform] || '#A89B8C', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{e.platform}</p>
              <p style={{ fontSize: '12px', color: '#A89B8C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.month || ''}{e.note ? ` • ${e.note}` : ''}
              </p>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#6BC9A0', flexShrink: 0 }}>€{(e.netto || 0).toLocaleString('de-DE')}</span>
            <button onClick={() => deleteEntry(e.id)} style={{ background: 'none', border: 'none', color: '#A89B8C', padding: '4px', flexShrink: 0 }}>
              <Trash2 size={14} />
            </button>
          </Card>
        ))
      )}
    </div>
  )
}

export default Finance
