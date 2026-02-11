import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompany } from '../../contexts/CompanyContext'
import { useFileUpload, getFileCategory, formatFileSize } from '../../hooks/useFileUpload'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import {
  ArrowLeft, Upload, FolderOpen, Image, Film, File, Download,
  Clock, Grid, List, Trash2, Plus, X, Loader, CheckCircle, AlertCircle, Eye
} from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const FirmaAssets = ({ userData }) => {
  const navigate = useNavigate()
  const { company, isOwner, members } = useCompany()
  const { upload, deleteFile, uploading, progress, error: uploadError, reset: resetUpload } = useFileUpload()
  const fileInputRef = useRef(null)

  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [assetNotes, setAssetNotes] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null) // For image preview modal

  // Load assets from Firestore
  useEffect(() => {
    if (!company?.id) { setLoading(false); return }
    const loadAssets = async () => {
      try {
        const q = query(collection(db, 'company_assets'), where('companyId', '==', company.id), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch {
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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const category = getFileCategory(file)
      if (!category) {
        alert('Dateityp nicht unterstützt. Erlaubt: Bilder (JPG, PNG, WebP, GIF), Videos (MP4, MOV, WebM), Dokumente (PDF)')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !company?.id) return
    const user = auth.currentUser
    const category = getFileCategory(selectedFile)
    const timestamp = Date.now()
    const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `companies/${company.id}/assets/${timestamp}_${safeName}`

    const result = await upload(selectedFile, storagePath)
    if (!result) return

    try {
      const newAsset = {
        companyId: company.id,
        name: selectedFile.name,
        type: category,
        fileUrl: result.url,
        storagePath: result.path,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        notes: assetNotes.trim(),
        status: 'draft',
        uploadedBy: user.uid,
        uploaderName: user.displayName || user.email,
        createdAt: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, 'company_assets'), newAsset)
      setAssets(prev => [{ id: docRef.id, ...newAsset, createdAt: { seconds: Date.now() / 1000 } }, ...prev])
      setSelectedFile(null)
      setAssetNotes('')
      setShowCreate(false)
      resetUpload()
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Create asset error:', err)
    }
  }

  const handleDelete = async (asset) => {
    try {
      if (asset.storagePath) await deleteFile(asset.storagePath)
      await deleteDoc(doc(db, 'company_assets', asset.id))
      setAssets(prev => prev.filter(a => a.id !== asset.id))
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
      {/* Preview Modal */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', cursor: 'pointer',
        }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', position: 'relative' }}>
            <button onClick={() => setPreview(null)} style={{
              position: 'absolute', top: '-12px', right: '-12px', width: '32px', height: '32px',
              borderRadius: '50%', background: '#FFFDF7', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}><X size={16} color="#2A2420" /></button>
            {preview.type === 'image' && (
              <img src={preview.url} alt={preview.name} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px', objectFit: 'contain' }} />
            )}
            {preview.type === 'video' && (
              <video src={preview.url} controls style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px' }} />
            )}
            {preview.type === 'document' && (
              <div style={{ background: '#FFFDF7', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                <File size={48} color="#F5C563" />
                <p style={{ color: '#2A2420', fontWeight: '600', marginTop: '12px', fontSize: '16px' }}>{preview.name}</p>
                <a href={preview.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px',
                  padding: '10px 20px', borderRadius: '10px', background: 'rgba(245,197,99,0.1)',
                  color: '#E8A940', fontWeight: '600', fontSize: '14px', textDecoration: 'none',
                }}>
                  <Download size={16} /> PDF öffnen
                </a>
              </div>
            )}
            <p style={{ color: 'white', textAlign: 'center', marginTop: '12px', fontSize: '14px', fontWeight: '500' }}>
              {preview.name} • {preview.uploaderName}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }} className="animate-fade-in">
        <button onClick={() => navigate('/firma/dashboard')} style={{ background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)', borderRadius: '10px', padding: '8px', color: '#7A6F62', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Assets</h2>
          <p style={{ fontSize: '13px', color: '#A89B8C' }}>{company?.name} • {assets.length} Dateien</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Button variant="primary" onClick={() => { setShowCreate(true); resetUpload(); setSelectedFile(null) }} style={{ padding: '10px 16px', fontSize: '13px' }}>
            <Upload size={16} /> Hochladen
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

      {/* Upload Form */}
      {showCreate && (
        <Card style={{ marginBottom: '16px', padding: '20px', border: '1.5px solid rgba(126,181,230,0.2)' }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Datei hochladen</span>
            <button onClick={() => { setShowCreate(false); setSelectedFile(null); resetUpload() }} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          {/* File Picker */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              border: '2px dashed #E8DFD3', borderRadius: '14px', padding: '28px 16px',
              textAlign: 'center', cursor: uploading ? 'default' : 'pointer', marginBottom: '12px',
              background: selectedFile ? 'rgba(107,201,160,0.04)' : 'rgba(42,36,32,0.02)',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,application/pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {selectedFile ? (
              <div>
                <CheckCircle size={28} color="#6BC9A0" style={{ marginBottom: '8px' }} />
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{selectedFile.name}</p>
                <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '4px' }}>
                  {formatFileSize(selectedFile.size)} • {getFileCategory(selectedFile)}
                </p>
              </div>
            ) : (
              <div>
                <Upload size={28} color="#A89B8C" style={{ marginBottom: '8px' }} />
                <p style={{ fontWeight: '600', color: '#5C5349', fontSize: '14px' }}>Datei auswählen</p>
                <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '4px' }}>
                  Bilder, Videos oder PDFs • Max. 50MB
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#7A6F62', fontWeight: '500' }}>Wird hochgeladen...</span>
                <span style={{ fontSize: '12px', color: '#7EB5E6', fontWeight: '700' }}>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(42,36,32,0.06)', overflow: 'hidden' }}>
                <div style={{
                  width: `${progress}%`, height: '100%', borderRadius: '3px',
                  background: 'linear-gradient(90deg, #7EB5E680, #7EB5E6)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
              borderRadius: '10px', background: 'rgba(220,38,38,0.06)', marginBottom: '12px',
            }}>
              <AlertCircle size={16} color="#DC2626" />
              <span style={{ fontSize: '13px', color: '#DC2626' }}>{uploadError}</span>
            </div>
          )}

          {/* Notes */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Notizen (optional)</label>
            <textarea value={assetNotes} onChange={e => setAssetNotes(e.target.value)} placeholder="z.B. Final Edit, Version 2..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <Button variant="primary" onClick={handleUpload} disabled={!selectedFile || uploading} style={{ width: '100%', padding: '12px' }}>
            {uploading ? (
              <><Loader size={16} className="animate-spin" /> Wird hochgeladen... {progress}%</>
            ) : (
              <><Upload size={16} /> Hochladen</>
            )}
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
          <p style={{ color: '#A89B8C', fontSize: '12px', marginTop: '4px' }}>Lade deine erste Datei hoch.</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {filteredAssets.map((asset, i) => {
            const Icon = typeIcons[asset.type] || File
            const color = typeColors[asset.type] || '#A89B8C'
            const status = statusConfig[asset.status] || statusConfig.draft
            return (
              <Card key={asset.id} onClick={() => asset.fileUrl && setPreview(asset)} style={{ padding: '0', cursor: asset.fileUrl ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }} className={`animate-fade-in stagger-${Math.min(i + 2, 8)}`}>
                {/* Thumbnail / Icon */}
                <div style={{
                  width: '100%', height: '100px', background: `${color}08`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {asset.type === 'image' && asset.fileUrl ? (
                    <img src={asset.fileUrl} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : asset.type === 'video' && asset.fileUrl ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
                      <Film size={32} color="white" style={{ opacity: 0.7 }} />
                    </div>
                  ) : (
                    <Icon size={28} color={color} />
                  )}
                  {asset.fileUrl && (
                    <div style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '3px',
                    }}>
                      <Eye size={12} color="white" />
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#A89B8C' }}>
                      {asset.uploaderName?.split(' ')[0] || ''}{asset.fileSize ? ` • ${formatFileSize(asset.fileSize)}` : ''}
                    </span>
                    <span style={{
                      fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
                      background: `${status.color}10`, color: status.color, fontWeight: '600',
                    }}>{status.label}</span>
                  </div>
                </div>
                {isOwner && (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(asset) }} style={{
                    position: 'absolute', top: '6px', left: '6px',
                    background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '6px',
                    padding: '4px', cursor: 'pointer', color: '#DC2626',
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
              <Card key={asset.id} onClick={() => asset.fileUrl && setPreview(asset)} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: asset.fileUrl ? 'pointer' : 'default' }} className={`animate-fade-in stagger-${Math.min(i + 2, 8)}`}>
                {/* Mini Thumbnail */}
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {asset.type === 'image' && asset.fileUrl ? (
                    <img src={asset.fileUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                  ) : (
                    <Icon size={18} color={color} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</p>
                  <p style={{ fontSize: '11px', color: '#A89B8C' }}>
                    {asset.uploaderName || ''}{asset.fileSize ? ` • ${formatFileSize(asset.fileSize)}` : ''}{asset.notes ? ` • ${asset.notes}` : ''}
                  </p>
                </div>
                <span style={{
                  fontSize: '10px', padding: '3px 10px', borderRadius: '6px',
                  background: `${status.color}10`, color: status.color, fontWeight: '600',
                }}>{status.label}</span>
                {asset.fileUrl && (
                  <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                    padding: '6px', borderRadius: '6px', background: 'rgba(42,36,32,0.04)', color: '#7A6F62', display: 'flex',
                  }}>
                    <Download size={14} />
                  </a>
                )}
                {isOwner && (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(asset) }} style={{
                    background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#C9BFAF',
                  }}>
                    <Trash2 size={14} />
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
