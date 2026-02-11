import React, { useState, useEffect } from 'react'
import { Timer, Plus, X, AlertTriangle, CheckCircle, Clock, Youtube, Instagram } from 'lucide-react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const PLATFORM_CONFIG = {
  YouTube: { color: '#DC2626', icon: '🎬' },
  TikTok: { color: '#000000', icon: '🎵' },
  Instagram: { color: '#E1306C', icon: '📸' },
  'Reels': { color: '#E1306C', icon: '🎞️' },
  'Podcast': { color: '#7EB5E6', icon: '🎙️' },
  'Sonstiges': { color: '#A89B8C', icon: '📌' },
}

const DeadlinesPage = ({ userData }) => {
  const [deadlines, setDeadlines] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', platform: 'YouTube', dueDate: '', notes: '' })
  const user = auth.currentUser

  useEffect(() => {
    if (!userData?.companyId) return
    const q = query(collection(db, 'deadlines'), where('companyId', '==', userData.companyId))
    const unsub = onSnapshot(q, snap => {
      setDeadlines(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
        return 0
      }))
    })
    return () => unsub()
  }, [userData])

  const addDeadline = async () => {
    if (!form.title.trim() || !form.dueDate) return
    await addDoc(collection(db, 'deadlines'), {
      companyId: userData.companyId,
      title: form.title.trim(),
      platform: form.platform,
      dueDate: form.dueDate,
      notes: form.notes.trim(),
      status: 'active',
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    })
    setForm({ title: '', platform: 'YouTube', dueDate: '', notes: '' })
    setShowForm(false)
  }

  const toggleDone = async (dl) => {
    await updateDoc(doc(db, 'deadlines', dl.id), {
      status: dl.status === 'done' ? 'active' : 'done',
    })
  }

  const deleteDeadline = async (id) => {
    await deleteDoc(doc(db, 'deadlines', id))
  }

  const getCountdown = (dateStr) => {
    if (!dateStr) return { text: 'Kein Datum', urgent: false, overdue: false }
    const now = new Date()
    const due = new Date(dateStr + 'T23:59:59')
    const diff = due - now
    const days = Math.ceil(diff / 86400000)

    if (days < 0) return { text: `${Math.abs(days)} Tage überfällig`, urgent: true, overdue: true }
    if (days === 0) return { text: 'Heute fällig!', urgent: true, overdue: false }
    if (days === 1) return { text: 'Morgen fällig', urgent: true, overdue: false }
    if (days <= 3) return { text: `${days} Tage`, urgent: true, overdue: false }
    if (days <= 7) return { text: `${days} Tage`, urgent: false, overdue: false }
    return { text: `${days} Tage`, urgent: false, overdue: false }
  }

  const activeDeadlines = deadlines.filter(d => d.status !== 'done')
  const doneDeadlines = deadlines.filter(d => d.status === 'done')

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Timer size={22} color="#E8A940" /> Deadlines
          </h2>
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Countdown für kommende Uploads</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)} style={{ padding: '10px 16px', fontSize: '13px' }}>
          <Plus size={16} /> Deadline
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card style={{ marginBottom: '16px', padding: '20px', border: '1.5px solid rgba(232,169,64,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420' }}>Neue Deadline</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Titel</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="z.B. Weekly Vlog #42" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Plattform</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={inputStyle}>
                {Object.keys(PLATFORM_CONFIG).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Fällig am</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Notizen</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Details..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <Button variant="primary" onClick={addDeadline} style={{ width: '100%' }}>Erstellen</Button>
        </Card>
      )}

      {/* Active Deadlines */}
      {activeDeadlines.length === 0 && doneDeadlines.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Timer size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Keine Deadlines. Erstelle eine neue!</p>
        </Card>
      ) : (
        <>
          {activeDeadlines.map(dl => {
            const countdown = getCountdown(dl.dueDate)
            const pCfg = PLATFORM_CONFIG[dl.platform] || PLATFORM_CONFIG['Sonstiges']
            return (
              <Card key={dl.id} style={{
                marginBottom: '10px', padding: '16px',
                borderLeft: countdown.overdue ? '3px solid #DC2626' : countdown.urgent ? '3px solid #E8A940' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '18px' }}>{pCfg.icon}</span>
                      <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{dl.title}</span>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: `${pCfg.color}12`, color: pCfg.color, fontWeight: '500' }}>{dl.platform}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {countdown.overdue ? <AlertTriangle size={14} color="#DC2626" /> : <Clock size={14} color={countdown.urgent ? '#E8A940' : '#A89B8C'} />}
                      <span style={{
                        fontSize: '14px', fontWeight: '700',
                        color: countdown.overdue ? '#DC2626' : countdown.urgent ? '#E8A940' : '#6BC9A0',
                      }}>{countdown.text}</span>
                      <span style={{ fontSize: '12px', color: '#A89B8C' }}>
                        ({new Date(dl.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                      </span>
                    </div>
                    {dl.notes && <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '6px' }}>{dl.notes}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => toggleDone(dl)} style={{
                      padding: '8px 12px', background: 'rgba(107,201,160,0.1)', border: 'none', borderRadius: '8px',
                      color: '#6BC9A0', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}><CheckCircle size={14} /> Erledigt</button>
                    <button onClick={() => deleteDeadline(dl.id)} style={{
                      padding: '8px', background: 'rgba(220,38,38,0.06)', border: 'none', borderRadius: '8px',
                      color: '#DC2626', cursor: 'pointer',
                    }}><X size={14} /></button>
                  </div>
                </div>
              </Card>
            )
          })}

          {/* Done */}
          {doneDeadlines.length > 0 && (
            <>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#A89B8C', marginTop: '20px', marginBottom: '10px' }}>Erledigt ({doneDeadlines.length})</p>
              {doneDeadlines.map(dl => {
                return (
                  <Card key={dl.id} style={{ marginBottom: '8px', padding: '14px', opacity: 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} color="#6BC9A0" />
                        <span style={{ fontWeight: '500', color: '#7A6F62', fontSize: '14px', textDecoration: 'line-through' }}>{dl.title}</span>
                        <span style={{ fontSize: '11px', color: '#A89B8C' }}>{dl.platform}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => toggleDone(dl)} style={{
                          padding: '6px 10px', background: 'rgba(232,169,64,0.1)', border: 'none', borderRadius: '8px',
                          color: '#E8A940', cursor: 'pointer', fontSize: '11px',
                        }}>Wiederherstellen</button>
                        <button onClick={() => deleteDeadline(dl.id)} style={{
                          padding: '6px', background: 'rgba(220,38,38,0.06)', border: 'none', borderRadius: '8px',
                          color: '#DC2626', cursor: 'pointer',
                        }}><X size={12} /></button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default DeadlinesPage
