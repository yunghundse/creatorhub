import React, { useState, useEffect } from 'react'
import { Upload, Image, X, MessageSquare, Check, Clock, Trash2 } from 'lucide-react'
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const STATUS_OPTIONS = [
  { id: 'raw', label: 'Rohmaterial', color: '#F5C563' },
  { id: 'in_progress', label: 'In Bearbeitung', color: '#7EB5E6' },
  { id: 'ready', label: 'Ready for Post', color: '#6BC9A0' },
]

const AssetsPage = ({ userData }) => {
  const [assets, setAssets] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', type: 'image', notes: '' })
  const [filter, setFilter] = useState('all')
  const user = auth.currentUser

  useEffect(() => {
    if (!user) return
    // Show own assets + company assets if part of company
    const q = query(collection(db, 'assets'), where('companyId', '==', userData?.companyId || user.uid), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [user, userData])

  const uploadAsset = async () => {
    if (!form.title.trim()) return
    await addDoc(collection(db, 'assets'), {
      title: form.title.trim(),
      url: form.url.trim(),
      type: form.type,
      notes: form.notes.trim(),
      status: 'raw',
      uploadedBy: user.uid,
      uploaderName: user.displayName || user.email,
      companyId: userData?.companyId || user.uid,
      createdAt: serverTimestamp(),
    })
    setForm({ title: '', url: '', type: 'image', notes: '' })
    setShowUpload(false)
  }

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'assets', id), { status })
  }

  const deleteAsset = async (id) => {
    await deleteDoc(doc(db, 'assets', id))
  }

  const filtered = filter === 'all' ? assets : assets.filter(a => a.status === filter)

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Assets</h2>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginTop: '2px' }}>{assets.length} Dateien</p>
        </div>
        <Button variant="primary" onClick={() => setShowUpload(true)} style={{ padding: '10px 16px' }}>
          <Upload size={18} /> Upload
        </Button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <Card style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontWeight: '600', color: '#2A2420' }}>Neues Asset</span>
            <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', color: '#7A6F62' }}><X size={18} /></button>
          </div>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titel / Dateiname" style={{ ...inputStyle, marginBottom: '10px' }} />
          <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="URL oder Link zum Asset" style={{ ...inputStyle, marginBottom: '10px' }} />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {['image', 'video', 'document'].map(t => (
              <button key={t} onClick={() => setForm({ ...form, type: t })} style={{
                flex: 1, padding: '8px', borderRadius: '10px', fontSize: '13px', fontWeight: '500',
                border: form.type === t ? 'none' : '1.5px solid #E8DFD3',
                background: form.type === t ? '#FF6B9D' : 'rgba(255,255,255,0.6)',
                color: form.type === t ? 'white' : '#7A6F62', textTransform: 'capitalize',
              }}>{t === 'image' ? 'Bild' : t === 'video' ? 'Video' : 'Dokument'}</button>
            ))}
          </div>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notizen / Anweisungen..." rows={2} style={{ ...inputStyle, marginBottom: '14px', resize: 'vertical' }} />
          <Button variant="primary" onClick={uploadAsset} style={{ width: '100%' }}>Hochladen</Button>
        </Card>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        <button onClick={() => setFilter('all')} style={{
          padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '500',
          border: filter === 'all' ? 'none' : '1.5px solid #E8DFD3',
          background: filter === 'all' ? '#2A2420' : 'rgba(255,255,255,0.6)',
          color: filter === 'all' ? 'white' : '#7A6F62',
        }}>Alle</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} style={{
            padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
            border: filter === s.id ? 'none' : '1.5px solid #E8DFD3',
            background: filter === s.id ? s.color : 'rgba(255,255,255,0.6)',
            color: filter === s.id ? 'white' : '#7A6F62',
          }}>{s.label}</button>
        ))}
      </div>

      {/* Asset Grid */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Image size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#A89B8C' }}>Keine Assets gefunden</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {filtered.map(asset => {
            const statusInfo = STATUS_OPTIONS.find(s => s.id === asset.status) || STATUS_OPTIONS[0]
            return (
              <Card key={asset.id} style={{ padding: '14px' }}>
                <div style={{
                  width: '100%', height: '100px', borderRadius: '10px', marginBottom: '10px',
                  background: asset.type === 'video' ? 'linear-gradient(135deg, rgba(126,181,230,0.1), rgba(126,181,230,0.05))' : 'linear-gradient(135deg, rgba(255,107,157,0.08), rgba(255,107,157,0.03))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {asset.url ? (
                    <img src={asset.url} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <Image size={24} color="#C9BFAF" />
                  )}
                </div>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.title}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: '600',
                    background: `${statusInfo.color}15`, color: statusInfo.color,
                  }}>{statusInfo.label}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {STATUS_OPTIONS.filter(s => s.id !== asset.status).map(s => (
                      <button key={s.id} onClick={() => updateStatus(asset.id, s.id)} title={s.label} style={{
                        width: '20px', height: '20px', borderRadius: '6px', border: 'none',
                        background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                      </button>
                    ))}
                    <button onClick={() => deleteAsset(asset.id)} style={{ width: '20px', height: '20px', borderRadius: '6px', border: 'none', background: 'rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={10} color="#DC2626" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AssetsPage
