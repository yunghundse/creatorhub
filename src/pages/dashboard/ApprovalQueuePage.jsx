import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Upload, Image, MessageSquare, X, Send, Eye } from 'lucide-react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const ApprovalQueuePage = ({ userData }) => {
  const [items, setItems] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', fileUrl: '', type: 'image' })
  const [feedbackForm, setFeedbackForm] = useState({ id: null, text: '' })
  const [filter, setFilter] = useState('all')
  const user = auth.currentUser
  const isManager = userData?.role === 'manager' || user?.email === 'yunghundse@gmail.com'

  useEffect(() => {
    if (!userData?.companyId) return
    const q = query(collection(db, 'approvals'), where('companyId', '==', userData.companyId))
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0
        const tb = b.createdAt?.toMillis?.() || 0
        return tb - ta
      }))
    })
    return () => unsub()
  }, [userData])

  const submitContent = async () => {
    if (!form.title.trim() || !form.fileUrl.trim()) return
    await addDoc(collection(db, 'approvals'), {
      companyId: userData.companyId,
      uploadedBy: user.uid,
      uploaderName: user.displayName || user.email,
      title: form.title.trim(),
      description: form.description.trim(),
      fileUrl: form.fileUrl.trim(),
      type: form.type,
      status: 'pending',
      feedback: '',
      reviewedBy: null,
      createdAt: serverTimestamp(),
      reviewedAt: null,
    })
    setForm({ title: '', description: '', fileUrl: '', type: 'image' })
    setShowUpload(false)
  }

  const approve = async (id) => {
    await updateDoc(doc(db, 'approvals', id), {
      status: 'approved',
      reviewedBy: user.uid,
      reviewedAt: serverTimestamp(),
    })
  }

  const reject = async (id) => {
    if (!feedbackForm.text.trim()) {
      setFeedbackForm({ id, text: '' })
      return
    }
    await updateDoc(doc(db, 'approvals', id), {
      status: 'rejected',
      feedback: feedbackForm.text.trim(),
      reviewedBy: user.uid,
      reviewedAt: serverTimestamp(),
    })
    setFeedbackForm({ id: null, text: '' })
  }

  const statusConfig = {
    pending: { label: 'Warten', color: '#E8A940', bg: 'rgba(245,197,99,0.1)', icon: Clock },
    approved: { label: 'Freigegeben', color: '#6BC9A0', bg: 'rgba(107,201,160,0.1)', icon: CheckCircle },
    rejected: { label: 'Abgelehnt', color: '#DC2626', bg: 'rgba(220,38,38,0.08)', icon: XCircle },
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)
  const pendingCount = items.filter(i => i.status === 'pending').length

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '4px' }}>
            Content Freigabe
            {pendingCount > 0 && (
              <span style={{ marginLeft: '10px', fontSize: '13px', padding: '3px 10px', borderRadius: '10px', background: 'rgba(245,197,99,0.15)', color: '#E8A940', fontWeight: '600' }}>
                {pendingCount} offen
              </span>
            )}
          </h2>
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>
            {isManager ? 'Content von Models prüfen und freigeben' : 'Content zur Freigabe hochladen'}
          </p>
        </div>
        {!isManager && (
          <Button variant="primary" onClick={() => setShowUpload(true)} style={{ padding: '10px 16px', fontSize: '13px' }}>
            <Upload size={16} /> Hochladen
          </Button>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: 'Alle' },
          { key: 'pending', label: 'Offen' },
          { key: 'approved', label: 'Freigegeben' },
          { key: 'rejected', label: 'Abgelehnt' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '500',
            background: filter === f.key ? 'rgba(245,197,99,0.15)' : 'rgba(42,36,32,0.04)',
            color: filter === f.key ? '#E8A940' : '#7A6F62', cursor: 'pointer',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Upload Form */}
      {showUpload && (
        <Card style={{ marginBottom: '16px', padding: '20px', border: '1.5px solid rgba(255,107,157,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420' }}>Content einreichen</h3>
            <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Titel</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="z.B. Shooting Set #12" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Typ</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                <option value="image">Bild</option>
                <option value="video">Video</option>
                <option value="album">Album/Set</option>
                <option value="text">Text/Caption</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Link/URL</label>
              <input type="url" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Beschreibung</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Hinweise für den Manager..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <Button variant="primary" onClick={submitContent} style={{ width: '100%' }}>Einreichen</Button>
        </Card>
      )}

      {/* Items */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Image size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Keine Einträge vorhanden.</p>
        </Card>
      ) : (
        filtered.map(item => {
          const cfg = statusConfig[item.status]
          const StatusIcon = cfg.icon
          return (
            <Card key={item.id} style={{ marginBottom: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{item.title}</span>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: cfg.bg, color: cfg.color, fontWeight: '500' }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(126,181,230,0.1)', color: '#7EB5E6', fontWeight: '500' }}>
                      {item.type}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#A89B8C' }}>von {item.uploaderName}</p>
                  {item.description && <p style={{ fontSize: '13px', color: '#7A6F62', marginTop: '6px' }}>{item.description}</p>}
                </div>
                {item.fileUrl && (
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" style={{
                    padding: '8px', background: 'rgba(126,181,230,0.1)', borderRadius: '8px', color: '#7EB5E6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Eye size={16} /></a>
                )}
              </div>

              {/* Feedback display */}
              {item.status === 'rejected' && item.feedback && (
                <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(220,38,38,0.04)', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.1)' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#DC2626', marginBottom: '4px' }}>Feedback:</p>
                  <p style={{ fontSize: '13px', color: '#5C5349' }}>{item.feedback}</p>
                </div>
              )}

              {/* Manager actions */}
              {isManager && item.status === 'pending' && (
                <div style={{ marginTop: '12px' }}>
                  {feedbackForm.id === item.id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" value={feedbackForm.text} onChange={e => setFeedbackForm({ ...feedbackForm, text: e.target.value })}
                        placeholder="Feedback/Änderungswunsch..." style={{ ...inputStyle, flex: 1 }} />
                      <button onClick={() => reject(item.id)} style={{
                        padding: '10px 16px', background: 'rgba(220,38,38,0.08)', border: 'none', borderRadius: '10px',
                        color: '#DC2626', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      }}><Send size={14} /> Ablehnen</button>
                      <button onClick={() => setFeedbackForm({ id: null, text: '' })} style={{
                        padding: '10px', background: 'rgba(42,36,32,0.04)', border: 'none', borderRadius: '10px',
                        color: '#7A6F62', cursor: 'pointer',
                      }}><X size={14} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => approve(item.id)} style={{
                        flex: 1, padding: '10px', background: 'rgba(107,201,160,0.1)', border: 'none', borderRadius: '10px',
                        color: '#6BC9A0', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}><CheckCircle size={16} /> Freigeben</button>
                      <button onClick={() => reject(item.id)} style={{
                        flex: 1, padding: '10px', background: 'rgba(220,38,38,0.06)', border: 'none', borderRadius: '10px',
                        color: '#DC2626', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}><XCircle size={16} /> Ablehnen</button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}

export default ApprovalQueuePage
