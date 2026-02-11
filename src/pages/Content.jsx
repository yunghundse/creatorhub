import React, { useState, useEffect } from 'react'
import { Plus, X, Trash2, Edit3 } from 'lucide-react'
import {
  collection, addDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, doc, updateDoc, deleteDoc
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import Card from '../components/Card'
import Button from '../components/Button'
import ProgressBar from '../components/ProgressBar'

const STATUS_COLORS = {
  Editing: { bg: 'rgba(255,107,157,0.1)', text: '#FF6B9D' },
  Review: { bg: 'rgba(126,181,230,0.1)', text: '#7EB5E6' },
  Ready: { bg: 'rgba(107,201,160,0.1)', text: '#6BC9A0' },
}

const CONTENT_TYPES = ['Video', 'Foto', 'Live', 'Story', 'Reel', 'Post', 'Sonstiges']

const Content = () => {
  const [content, setContent] = useState([])
  const [activeFilter, setActiveFilter] = useState('Alle')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ title: '', type: 'Video', deadline: '', earnings: '', notes: '' })

  const currentUser = auth.currentUser

  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'content'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setContent(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [currentUser])

  const openNew = () => {
    setEditItem(null)
    setForm({ title: '', type: 'Video', deadline: '', earnings: '', notes: '' })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      title: item.title || '',
      type: item.type || 'Video',
      deadline: item.deadline || '',
      earnings: item.earnings?.toString() || '',
      notes: item.notes || '',
    })
    setShowModal(true)
  }

  const saveContent = async () => {
    if (!form.title.trim()) return
    const data = {
      title: form.title.trim(),
      type: form.type,
      deadline: form.deadline,
      earnings: parseFloat(form.earnings) || 0,
      notes: form.notes.trim(),
    }
    if (editItem) {
      await updateDoc(doc(db, 'content', editItem.id), data)
    } else {
      await addDoc(collection(db, 'content'), {
        ...data,
        userId: currentUser.uid,
        status: 'Editing',
        progress: 10,
        createdAt: serverTimestamp(),
      })
    }
    setShowModal(false)
  }

  const updateStatus = async (item, newStatus) => {
    const progress = newStatus === 'Ready' ? 100 : newStatus === 'Review' ? 70 : 30
    await updateDoc(doc(db, 'content', item.id), { status: newStatus, progress })
  }

  const deleteContent = async (id) => {
    await deleteDoc(doc(db, 'content', id))
  }

  const filtered = activeFilter === 'Alle' ? content : content.filter(c => c.status === activeFilter)

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(42,36,32,0.03)', border: '1.5px solid #E8DFD3',
    borderRadius: '12px', color: '#2A2420', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  }

  // ===== MODAL =====
  if (showModal) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>
            {editItem ? 'Content bearbeiten' : 'Neuer Content'}
          </h2>
          <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <Card style={{ padding: '20px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Titel</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="z.B. Valentine Special" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#FF6B9D'} onBlur={e => e.target.style.borderColor = '#E8DFD3'} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Typ</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CONTENT_TYPES.map(t => (
                <button key={t} onClick={() => setForm({ ...form, type: t })} style={{
                  padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '500',
                  border: form.type === t ? 'none' : '1.5px solid #E8DFD3',
                  background: form.type === t ? 'linear-gradient(135deg, #FF8FAB, #FF6B9D)' : 'rgba(255,255,255,0.6)',
                  color: form.type === t ? 'white' : '#7A6F62',
                }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Einnahmen (€)</label>
            <input type="number" value={form.earnings} onChange={e => setForm({ ...form, earnings: e.target.value })} placeholder="0" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Notizen</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Anmerkungen..." rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = '#FF6B9D'} onBlur={e => e.target.style.borderColor = '#E8DFD3'} />
          </div>

          <Button variant="primary" onClick={saveContent} style={{ width: '100%', padding: '14px' }}>
            {editItem ? 'Speichern' : 'Erstellen'}
          </Button>
        </Card>
      </div>
    )
  }

  // ===== CONTENT LIST =====
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="animate-fade-in">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>Content Pipeline</h2>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginTop: '2px' }}>{content.length} Projekte</p>
        </div>
        <Button variant="primary" onClick={openNew} style={{ padding: '10px 16px' }}>
          <Plus size={18} /> Neu
        </Button>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }} className="animate-fade-in stagger-1">
        {['Alle', 'Editing', 'Review', 'Ready'].map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)} style={{
            padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
            border: activeFilter === filter ? 'none' : '1.5px solid #E8DFD3',
            background: activeFilter === filter ? 'linear-gradient(135deg, #FF8FAB 0%, #FF6B9D 100%)' : 'rgba(255,255,255,0.6)',
            color: activeFilter === filter ? 'white' : '#7A6F62',
            boxShadow: activeFilter === filter ? '0 3px 10px rgba(255,107,157,0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}>{filter}</button>
        ))}
      </div>

      {/* Content Items */}
      {filtered.length === 0 ? (
        <Card className="animate-fade-in stagger-2" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginBottom: '16px' }}>
            {activeFilter === 'Alle' ? 'Noch kein Content. Erstelle deinen ersten!' : `Kein Content mit Status "${activeFilter}"`}
          </p>
          {activeFilter === 'Alle' && (
            <Button variant="cream" onClick={openNew}><Plus size={16} /> Content erstellen</Button>
          )}
        </Card>
      ) : (
        filtered.map((item, i) => (
          <Card key={item.id} style={{ marginBottom: '14px' }} className={`animate-fade-in stagger-${Math.min(i + 2, 5)}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontWeight: '600', color: '#2A2420', marginBottom: '6px', fontSize: '16px' }}>{item.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: '600',
                    background: STATUS_COLORS[item.status]?.bg, color: STATUS_COLORS[item.status]?.text
                  }}>{item.status}</span>
                  <span style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500' }}>{item.type}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {item.earnings > 0 && (
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#6BC9A0', background: 'rgba(107,201,160,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                    +€{item.earnings}
                  </span>
                )}
                <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', color: '#A89B8C', padding: '4px' }}>
                  <Edit3 size={14} />
                </button>
                <button onClick={() => deleteContent(item.id)} style={{ background: 'none', border: 'none', color: '#A89B8C', padding: '4px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <ProgressBar progress={item.progress || 0} color={STATUS_COLORS[item.status]?.text || '#FF6B9D'} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <span style={{ fontSize: '12px', color: '#A89B8C' }}>
                {item.progress || 0}%{item.deadline ? ` • ${new Date(item.deadline).toLocaleDateString('de-DE')}` : ''}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {item.status !== 'Editing' && (
                  <button onClick={() => updateStatus(item, 'Editing')} style={{
                    padding: '6px 14px', background: 'rgba(42,36,32,0.04)', border: '1px solid #E8DFD3',
                    borderRadius: '10px', color: '#7A6F62', fontSize: '12px', fontWeight: '500'
                  }}>Zurück</button>
                )}
                {item.status !== 'Ready' && (
                  <button onClick={() => updateStatus(item, item.status === 'Editing' ? 'Review' : 'Ready')} style={{
                    padding: '6px 14px', background: 'rgba(255,107,157,0.1)', border: 'none',
                    borderRadius: '10px', color: '#FF6B9D', fontSize: '12px', fontWeight: '600'
                  }}>{item.status === 'Editing' ? 'Review' : 'Publish'}</button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

export default Content
