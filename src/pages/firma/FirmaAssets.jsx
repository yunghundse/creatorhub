import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompany } from '../../contexts/CompanyContext'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import {
  ArrowLeft, Upload, FolderOpen, Image, Film, File, Download, MessageSquare,
  Clock, Eye, Grid, List, Trash2, Plus, X
} from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const FirmaAssets = ({ userData }) => {
  const navigate = useNavigate()
  const { company, isOwner, members } = useCompany()
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState('image')
  const [assetNotes, setAssetNotes] = useState('')

  // Load assets from Firestore
  useEffect(() => {
    if (!company?.id) { setLoading(false); return }
    const loadAssets = async () => {
      try {
        const q = query(collection(db, 'company_assets'), where('companyId', '==', company.id), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        // Fallback without orderBy
        try {
          const q2 = query(collection(db, 'company_assets'), where('companyId', '==', company.id))
          const snap2 = await getDocs(q2)
          setAssets(snap2.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
        } catch (e) { console.error('Assets load error:', e) }
      }
      setLoading(false)
    }
    loadAssets()
  }, [company?.id])

  const createAsset = async () => {
    if (!assetName.trim()) return
    const user = auth.currentUser
    try {
      const newAsset = {
        companyId: company.id,
        name: assetName.trim(),
        type: assetType,
        notes: assetNotes.trim(),
        status: 'draft',
        uploadedBy: user.uid,
        uploaderName: user.displayName || user.email,
        createdAt: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, 'company_assets'), newAsset)
      setAssets(prev => [{ id: docRef.id, ...newAsset, createdAt: { seconds: Date.now() / 1000 } }, ...prev])
      setAssetName(''); setAssetType('image'); setAssetNotes(''); setShowCreate(false)
    } catch (err) { console.error('Create asset error:', err) }
  }

  const deleteAsset = async (assetId) => {
    try {
      await deleteDoc(doc(db, 'company_assets', assetId))
      setAssets(prev => prev.filter(a => a.id !== assetId))
    } catch (err) { console.error('Delete asset error:', err) }
  }

  const typeIcons = { video: Film, image: Image, document: File }
  const typeColors = { video: '#9B8FE6', image: '#FF6B9D', document: '#F5C563' }
  const statusConfig = {
    draft: { label: 'Entwurf', color: '#A89B8C' },
    review: { label: 'Review', color: '#F5C563' },
    approved: { label: 'Freigegeben', color: '#6BC9A0' },
  }

  const categories = [
    { id: 'all', label: 'Alle' },
    { id: 'video', label: 'Videos' },
    { id: 'image', label: 'Bilder' },
    { id: 'document', label: 'Dokumente' },
  ]

  const filteredAssets = selectedCategory === 'all'
    ? assets
    : assets.filter(a => a.type === selectedCategory)

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }} className="animate-fade-in">
        <button onClick={() => navigate('/firma/dashboard')} style={{ background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)', borderRadius: '10px', padding: '8px', color: '#7A6F62', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Assets</h2>
          <p style={{ fontSize: '13px', color: '#A89B8C' }}>{company?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Button variant="primary" onClick={() => setShowCreate(true)} style={{ padding: '10px 16px', fontSize: '13px' }}>
            <Plus size={16} /> Neu
          </Button>
          <button onClick={() => setViewMode('grid')} style={{
            padding: '8px', borderRadius: '8px', cursor: 'pointer', border: 'none',
            background: viewMode === 'grid' ? 'rgba(126,181,230,0.1)' : 'transparent',
            color: viewMode === 'grid' ? '#7EB5E6' : '#A89B8C',
          }}><Grid size={16} /></button>
          <button onClick={() => setViewMode('list')} style={{
            padding: '8px', borderRadius: '8px', cursor: 'pointer', border: 'none',
            background: viewMode === 'list' ? 'rgba(126,181,230,0.1)' : 'transparent',
            color: viewMode === 'list' ? '#7EB5E6' : '#A89B8C',
          }}><List size={16} /></button>
        </div>
      </div>

      {/* Create Asset Form */}
      {showCreate && (
        <Card style={{ marginBottom: '16px', padding: '20px', border: '1.5px solid rgba(126,181,230,0.2)' }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Neues Asset</span>
            <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Name *</label>
            <input value={assetName} onChange={e => setAssetName(e.target.value)} placeholder="z.B. Instagram_Reel_v2.mp4" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Typ</label>
              <select value={assetType} onChange={e => setAssetType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="image">Bild</option>
                <option value="video">Video</option>
                <option value="document">Dokument</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Notizen</label>
            <textarea value={assetNotes} onChange={e => setAssetNotes(e.target.value)} placeholder="Optional..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <Button variant="primary" onClick={createAsset} disabled={!assetName.trim()} style={{ width: '100%', padding: '12px' }}>
            Asset erstellen
          </Button>
        </Card>
      )}

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }} className="animate-fade-in stagger-1">
        {categories.map(c => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '500',
            border: selectedCategory === c.id ? '1.5px solid rgba(126,181,230,0.3)' : '1px solid rgba(232,223,211,0.6)',
            background: selectedCategory === c.id ? 'rgba(126,181,230,0.08)' : 'rgba(42,36,32,0.02)',
            color: selectedCategory === c.id ? '#7EB5E6' : '#7A6F62',
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>
            {c.label} ({c.id === 'all' ? assets.length : assets.filter(a => a.type === c.id).length})
          </button>
        ))}
      </div>

      {/* Asset Grid/List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#A89B8C' }}>Lade Assets...</div>
      ) : filteredAssets.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }} className="animate-fade-in stagger-2">
          <FolderOpen size={36} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#7A6F62', fontSize: '14px' }}>Noch keine Assets vorhanden.</p>
          <p style={{ color: '#A89B8C', fontSize: '12px', marginTop: '4px' }}>Erstelle dein erstes Asset über den Button oben.</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {filteredAssets.map((asset, i) => {
            const Icon = typeIcons[asset.type] || File
            const color = typeColors[asset.type] || '#A89B8C'
            const status = statusConfig[asset.status] || statusConfig.draft
            return (
              <Card key={asset.id} style={{ padding: '14px', cursor: 'pointer', position: 'relative' }} className={`animate-fade-in stagger-${Math.min(i + 2, 8)}`}>
                <div style={{
                  width: '100%', height: '80px', borderRadius: '10px', marginBottom: '10px',
                  background: `${color}08`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={28} color={color} />
                </div>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#A89B8C' }}>{asset.uploaderName || ''}</span>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                    background: `${status.color}10`, color: status.color, fontWeight: '600',
                  }}>{status.label}</span>
                </div>
                {isOwner && (
                  <button onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id) }} style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '6px',
                    padding: '4px', cursor: 'pointer', color: '#C9BFAF',
                  }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <div>
          {filteredAssets.map((asset, i) => {
            const Icon = typeIcons[asset.type] || File
            const color = typeColors[asset.type] || '#A89B8C'
            const status = statusConfig[asset.status] || statusConfig.draft
            return (
              <Card key={asset.id} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' }} className={`animate-fade-in stagger-${Math.min(i + 2, 8)}`}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</p>
                  <p style={{ fontSize: '11px', color: '#A89B8C' }}>{asset.uploaderName || ''}{asset.notes ? ` · ${asset.notes}` : ''}</p>
                </div>
                <span style={{
                  fontSize: '10px', padding: '3px 10px', borderRadius: '6px',
                  background: `${status.color}10`, color: status.color, fontWeight: '600',
                }}>{status.label}</span>
                {isOwner && (
                  <button onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id) }} style={{
                    background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#C9BFAF',
                  }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FirmaAssets
