import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompany } from '../../contexts/CompanyContext'
import {
  ArrowLeft, Upload, FolderOpen, Image, Film, File, Download, MessageSquare,
  Clock, Eye, MoreVertical, Grid, List
} from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const FirmaAssets = ({ userData }) => {
  const navigate = useNavigate()
  const { company, isOwner, members } = useCompany()
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Demo assets (in production: load from Firebase Storage + Firestore)
  const [assets] = useState([
    { id: '1', name: 'Instagram_Reel_v2.mp4', type: 'video', size: '24.8 MB', uploader: 'Max M.', uploadedAt: '2026-02-10', status: 'review', comments: 2 },
    { id: '2', name: 'Thumbnail_TikTok.png', type: 'image', size: '1.2 MB', uploader: 'Lisa K.', uploadedAt: '2026-02-09', status: 'approved', comments: 0 },
    { id: '3', name: 'Behind_the_Scenes.mp4', type: 'video', size: '156 MB', uploader: 'Max M.', uploadedAt: '2026-02-08', status: 'draft', comments: 5 },
    { id: '4', name: 'Brand_Collab_Brief.pdf', type: 'document', size: '340 KB', uploader: 'Jan', uploadedAt: '2026-02-07', status: 'approved', comments: 1 },
    { id: '5', name: 'Shooting_Set_1.jpg', type: 'image', size: '8.4 MB', uploader: 'Lisa K.', uploadedAt: '2026-02-06', status: 'review', comments: 3 },
    { id: '6', name: 'YouTube_Script_Draft.docx', type: 'document', size: '28 KB', uploader: 'Jan', uploadedAt: '2026-02-05', status: 'draft', comments: 0 },
  ])

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
        <div style={{ display: 'flex', gap: '6px' }}>
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

      {/* Upload Area */}
      <Card style={{
        marginBottom: '16px', padding: '24px', textAlign: 'center', cursor: 'pointer',
        border: '2px dashed rgba(126,181,230,0.3)', background: 'rgba(126,181,230,0.03)',
      }} className="animate-fade-in stagger-1">
        <Upload size={28} color="#7EB5E6" style={{ marginBottom: '8px' }} />
        <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Dateien hochladen</p>
        <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '4px' }}>Drag & Drop oder klicken (Bilder, Videos, Dokumente)</p>
        <p style={{ fontSize: '11px', color: '#C4B8A8', marginTop: '6px' }}>Demo-Modus: Upload wird simuliert</p>
      </Card>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }} className="animate-fade-in stagger-2">
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
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {filteredAssets.map((asset, i) => {
            const Icon = typeIcons[asset.type]
            const color = typeColors[asset.type]
            const status = statusConfig[asset.status]
            return (
              <Card key={asset.id} style={{ padding: '14px', cursor: 'pointer' }} className={`animate-fade-in stagger-${Math.min(i + 3, 8)}`}>
                <div style={{
                  width: '100%', height: '80px', borderRadius: '10px', marginBottom: '10px',
                  background: `${color}08`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={28} color={color} />
                </div>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#A89B8C' }}>{asset.size}</span>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                    background: `${status.color}10`, color: status.color, fontWeight: '600',
                  }}>{status.label}</span>
                </div>
                {asset.comments > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                    <MessageSquare size={10} color="#7EB5E6" />
                    <span style={{ fontSize: '10px', color: '#7EB5E6' }}>{asset.comments}</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <div>
          {filteredAssets.map((asset, i) => {
            const Icon = typeIcons[asset.type]
            const color = typeColors[asset.type]
            const status = statusConfig[asset.status]
            return (
              <Card key={asset.id} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' }} className={`animate-fade-in stagger-${Math.min(i + 3, 8)}`}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</p>
                  <p style={{ fontSize: '11px', color: '#A89B8C' }}>{asset.uploader} · {asset.size} · {asset.uploadedAt}</p>
                </div>
                <span style={{
                  fontSize: '10px', padding: '3px 10px', borderRadius: '6px',
                  background: `${status.color}10`, color: status.color, fontWeight: '600',
                }}>{status.label}</span>
              </Card>
            )
          })}
        </div>
      )}

      {/* Info */}
      <div style={{ textAlign: 'center', marginTop: '20px', padding: '16px' }}>
        <p style={{ fontSize: '11px', color: '#C4B8A8' }}>
          Demo-Modus aktiv. In der Produktionsversion wird Firebase Storage für echte Uploads genutzt.
        </p>
      </div>
    </div>
  )
}

export default FirmaAssets
