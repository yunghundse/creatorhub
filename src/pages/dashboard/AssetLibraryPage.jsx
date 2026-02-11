import React, { useState, useEffect } from 'react'
import { Film, Music, Type, Layers, Plus, X, Download, Folder } from 'lucide-react'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const CATEGORIES = [
  { key: 'intro', label: 'Intros', icon: Film, color: '#FF6B9D' },
  { key: 'outro', label: 'Outros', icon: Film, color: '#7EB5E6' },
  { key: 'sound', label: 'Sound-Effekte', icon: Music, color: '#6BC9A0' },
  { key: 'font', label: 'Schriftarten', icon: Type, color: '#E8A940' },
  { key: 'overlay', label: 'Overlays', icon: Layers, color: '#B48EE0' },
]

const AssetLibraryPage = ({ userData }) => {
  const [assets, setAssets] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'intro', url: '', notes: '' })
  const [activeCategory, setActiveCategory] = useState('all')
  const user = auth.currentUser
  const isManager = userData?.role === 'manager'

  useEffect(() => {
    if (!userData?.companyId) return
    const q = query(collection(db, 'assetLibrary'), where('companyId', '==', userData.companyId))
    const unsub = onSnapshot(q, snap => {
      setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0
        const tb = b.createdAt?.toMillis?.() || 0
        return tb - ta
      }))
    })
    return () => unsub()
  }, [userData])

  const addAsset = async () => {
    if (!form.title.trim() || !form.url.trim()) return
    await addDoc(collection(db, 'assetLibrary'), {
      companyId: userData.companyId,
      title: form.title.trim(),
      category: form.category,
      url: form.url.trim(),
      notes: form.notes.trim(),
      uploadedBy: user.uid,
      uploaderName: user.displayName || user.email,
      createdAt: serverTimestamp(),
    })
    setForm({ title: '', category: 'intro', url: '', notes: '' })
    setShowAdd(false)
  }

  const deleteAsset = async (id) => {
    await deleteDoc(doc(db, 'assetLibrary', id))
  }

  const filtered = activeCategory === 'all' ? assets : assets.filter(a => a.category === activeCategory)

  const getCategoryConfig = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0]

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '4px' }}>Asset Library</h2>
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Branding-Assets für einheitliches Erscheinungsbild</p>
        </div>
        {isManager && (
          <Button variant="primary" onClick={() => setShowAdd(true)} style={{ padding: '10px 16px', fontSize: '13px' }}>
            <Plus size={16} /> Asset
          </Button>
        )}
      </div>

      {/* Category Stats */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button onClick={() => setActiveCategory('all')} style={{
          padding: '10px 16px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: '600',
          background: activeCategory === 'all' ? 'rgba(42,36,32,0.08)' : 'rgba(42,36,32,0.03)',
          color: activeCategory === 'all' ? '#2A2420' : '#A89B8C', cursor: 'pointer', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Folder size={14} /> Alle ({assets.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = assets.filter(a => a.category === cat.key).length
          const Icon = cat.icon
          return (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
              padding: '10px 16px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: '500',
              background: activeCategory === cat.key ? `${cat.color}18` : 'rgba(42,36,32,0.03)',
              color: activeCategory === cat.key ? cat.color : '#A89B8C', cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Icon size={14} /> {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card style={{ marginBottom: '16px', padding: '20px', border: '1.5px solid rgba(126,181,230,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420' }}>Neues Asset</h3>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Titel</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="z.B. Standard Intro v2" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Kategorie</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Link/URL</label>
              <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Hinweise</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Verwendungshinweise..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <Button variant="primary" onClick={addAsset} style={{ width: '100%' }}>Hinzufügen</Button>
        </Card>
      )}

      {/* Asset Grid */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Layers size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Keine Assets in dieser Kategorie.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {filtered.map(asset => {
            const cat = getCategoryConfig(asset.category)
            const Icon = cat.icon
            return (
              <Card key={asset.id} style={{ padding: '16px', position: 'relative' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: `${cat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '10px',
                }}>
                  <Icon size={22} color={cat.color} />
                </div>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px', marginBottom: '4px', lineHeight: '1.3' }}>{asset.title}</p>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: `${cat.color}12`, color: cat.color, fontWeight: '500' }}>
                  {cat.label}
                </span>
                {asset.notes && <p style={{ fontSize: '11px', color: '#A89B8C', marginTop: '8px', lineHeight: '1.4' }}>{asset.notes}</p>}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, padding: '8px', background: `${cat.color}10`, border: 'none', borderRadius: '8px',
                    color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                    fontSize: '12px', fontWeight: '500', gap: '4px',
                  }}>
                    <Download size={12} /> Öffnen
                  </a>
                  {isManager && (
                    <button onClick={() => deleteAsset(asset.id)} style={{
                      padding: '8px', background: 'rgba(220,38,38,0.06)', border: 'none', borderRadius: '8px',
                      color: '#DC2626', cursor: 'pointer',
                    }}><X size={12} /></button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AssetLibraryPage
