import React, { useState, useEffect, useRef } from 'react'
import { Plus, X, Trash2, Edit3, Upload, FileText, Film, Image, Paperclip, Download } from 'lucide-react'
import {
  collection, addDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, doc, updateDoc, deleteDoc
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useCompany } from '../contexts/CompanyContext'
import { useFileUpload, getFileCategory, formatFileSize } from '../hooks/useFileUpload'
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
  const [previewItem, setPreviewItem] = useState(null)

  // File upload
  const fileRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const { upload, uploading, progress, error: uploadError, reset: resetUpload } = useFileUpload()

  const currentUser = auth.currentUser
  const { company, isApproved, hasCompany } = useCompany()

  // Load content: own content + team content if in a company
  useEffect(() => {
    if (!currentUser) return

    // If user is in a company, load all company content; otherwise only own content
    if (hasCompany && company?.id && isApproved) {
      const q = query(
        collection(db, 'content'),
        where('companyId', '==', company.id),
        orderBy('createdAt', 'desc')
      )
      const unsub = onSnapshot(q, (snap) => {
        setContent(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      })
      return () => unsub()
    } else {
      // Personal content only
      const q = query(
        collection(db, 'content'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )
      const unsub = onSnapshot(q, (snap) => {
        setContent(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      })
      return () => unsub()
    }
  }, [currentUser, hasCompany, company?.id, isApproved])

  const openNew = () => {
    setEditItem(null)
    setForm({ title: '', type: 'Video', deadline: '', earnings: '', notes: '' })
    setSelectedFile(null)
    resetUpload()
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
    setSelectedFile(null)
    resetUpload()
    setShowModal(true)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const category = getFileCategory(file)
      if (!category) {
        alert('Dateityp nicht unterstützt. Erlaubt: JPG, PNG, WebP, GIF, MP4, MOV, WebM, PDF')
        return
      }
      setSelectedFile(file)
    }
  }

  const saveContent = async () => {
    if (!form.title.trim()) return

    let fileData = {}
    // Upload file if selected
    if (selectedFile) {
      const ts = Date.now()
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const folder = hasCompany && company?.id ? `companies/${company.id}` : `users/${currentUser.uid}`
      const storagePath = `${folder}/content/${ts}_${safeName}`
      const result = await upload(selectedFile, storagePath)
      if (result) {
        fileData = {
          fileUrl: result.url,
          storagePath: result.path,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileMime: selectedFile.type,
        }
      }
    }

    const data = {
      title: form.title.trim(),
      type: form.type,
      deadline: form.deadline,
      earnings: parseFloat(form.earnings) || 0,
      notes: form.notes.trim(),
      ...fileData,
    }

    if (editItem) {
      // When editing, only include file data if a new file was uploaded
      if (!selectedFile) {
        delete data.fileUrl
        delete data.storagePath
        delete data.fileName
        delete data.fileSize
        delete data.fileMime
      }
      await updateDoc(doc(db, 'content', editItem.id), data)
    } else {
      await addDoc(collection(db, 'content'), {
        ...data,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || 'Unbekannt',
        companyId: (hasCompany && company?.id) ? company.id : null,
        status: 'Editing',
        progress: 10,
        createdAt: serverTimestamp(),
      })
    }
    setShowModal(false)
    setSelectedFile(null)
    resetUpload()
  }

  const updateStatus = async (item, newStatus) => {
    const progress = newStatus === 'Ready' ? 100 : newStatus === 'Review' ? 70 : 30
    await updateDoc(doc(db, 'content', item.id), { status: newStatus, progress })
  }

  const deleteContent = async (id) => {
    await deleteDoc(doc(db, 'content', id))
  }

  const filtered = activeFilter === 'Alle' ? content : content.filter(c => c.status === activeFilter)

  const FileIcon = ({ mime, size = 16 }) => {
    if (!mime) return <Paperclip size={size} color="#A89B8C" />
    if (mime.startsWith('image/')) return <Image size={size} color="#7EB5E6" />
    if (mime.startsWith('video/')) return <Film size={size} color="#FF6B9D" />
    return <FileText size={size} color="#F5C563" />
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(42,36,32,0.03)', border: '1.5px solid #E8DFD3',
    borderRadius: '12px', color: '#2A2420', fontSize: '14px', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  }

  // ===== PREVIEW MODAL =====
  if (previewItem) {
    const mime = previewItem.fileMime || ''
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(42,36,32,0.7)', backdropFilter: 'blur(8px)',
        zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }} onClick={() => setPreviewItem(null)}>
        <div onClick={e => e.stopPropagation()} style={{
          background: '#FFFDF7', borderRadius: '20px', padding: '24px',
          maxWidth: '440px', width: '100%', maxHeight: '80vh', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: '700', color: '#2A2420', fontSize: '18px' }}>{previewItem.title}</h3>
            <button onClick={() => setPreviewItem(null)} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px' }}>
              <X size={22} />
            </button>
          </div>

          {mime.startsWith('image/') && (
            <img src={previewItem.fileUrl} alt={previewItem.fileName} style={{ width: '100%', borderRadius: '12px', marginBottom: '12px' }} />
          )}
          {mime.startsWith('video/') && (
            <video src={previewItem.fileUrl} controls style={{ width: '100%', borderRadius: '12px', marginBottom: '12px' }} />
          )}
          {mime === 'application/pdf' && (
            <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(42,36,32,0.03)', borderRadius: '12px', marginBottom: '12px' }}>
              <FileText size={40} color="#F5C563" />
              <p style={{ color: '#7A6F62', fontSize: '14px', marginTop: '8px' }}>{previewItem.fileName}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <a href={previewItem.fileUrl} target="_blank" rel="noopener noreferrer" download style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', background: 'rgba(255,107,157,0.1)', border: 'none',
              borderRadius: '12px', color: '#FF6B9D', fontWeight: '600', fontSize: '14px',
              textDecoration: 'none',
            }}>
              <Download size={16} /> Herunterladen
            </a>
          </div>

          {previewItem.notes && (
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#7A6F62', lineHeight: '1.6' }}>{previewItem.notes}</p>
          )}

          {previewItem.userName && (
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#A89B8C' }}>
              Erstellt von: {previewItem.userName}
            </p>
          )}
        </div>
      </div>
    )
  }

  // ===== MODAL =====
  if (showModal) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>
            {editItem ? 'Content bearbeiten' : 'Neuer Content'}
          </h2>
          <button onClick={() => { setShowModal(false); setSelectedFile(null); resetUpload() }} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px' }}>
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

          {/* File Upload */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>
              Datei anhängen (optional)
            </label>
            <input type="file" ref={fileRef} onChange={handleFileSelect} style={{ display: 'none' }}
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,application/pdf" />

            {!selectedFile && editItem?.fileUrl ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                background: 'rgba(42,36,32,0.03)', borderRadius: '12px', border: '1.5px solid #E8DFD3',
              }}>
                <FileIcon mime={editItem.fileMime} size={20} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#2A2420', fontWeight: '500' }}>{editItem.fileName || 'Datei'}</p>
                  <p style={{ fontSize: '11px', color: '#A89B8C' }}>Vorhandene Datei — klicke um zu ersetzen</p>
                </div>
                <button onClick={() => fileRef.current?.click()} style={{
                  padding: '6px 12px', background: 'rgba(255,107,157,0.1)', border: 'none',
                  borderRadius: '8px', color: '#FF6B9D', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                }}>Ersetzen</button>
              </div>
            ) : selectedFile ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                background: 'rgba(107,201,160,0.06)', borderRadius: '12px', border: '1.5px solid rgba(107,201,160,0.3)',
              }}>
                <FileIcon mime={selectedFile.type} size={20} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#2A2420', fontWeight: '500' }}>{selectedFile.name}</p>
                  <p style={{ fontSize: '11px', color: '#6BC9A0' }}>{formatFileSize(selectedFile.size)}</p>
                </div>
                <button onClick={() => setSelectedFile(null)} style={{
                  background: 'none', border: 'none', color: '#A89B8C', padding: '4px', cursor: 'pointer',
                }}><X size={16} /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{
                width: '100%', padding: '20px', background: 'rgba(42,36,32,0.02)',
                border: '2px dashed #E8DFD3', borderRadius: '12px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                color: '#A89B8C', transition: 'border-color 0.2s',
              }}>
                <Upload size={22} />
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Bild, Video oder PDF auswählen</span>
                <span style={{ fontSize: '11px' }}>Max: Bilder 10MB, Videos 50MB, PDF 10MB</span>
              </button>
            )}

            {uploading && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ width: '100%', height: '6px', background: '#E8DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(135deg, #FF8FAB, #FF6B9D)', borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontSize: '11px', color: '#A89B8C', marginTop: '4px' }}>Upload... {progress}%</p>
              </div>
            )}
            {uploadError && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px' }}>{uploadError}</p>}
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

          <Button variant="primary" onClick={saveContent} disabled={uploading} style={{ width: '100%', padding: '14px', opacity: uploading ? 0.6 : 1 }}>
            {uploading ? `Upload... ${progress}%` : editItem ? 'Speichern' : 'Erstellen'}
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
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', color: '#2A2420', marginBottom: '6px', fontSize: '16px' }}>{item.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: '600',
                    background: STATUS_COLORS[item.status]?.bg, color: STATUS_COLORS[item.status]?.text
                  }}>{item.status}</span>
                  <span style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500' }}>{item.type}</span>
                  {item.userName && hasCompany && (
                    <span style={{ fontSize: '11px', color: '#A89B8C' }}>von {item.userName}</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {item.earnings > 0 && (
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#6BC9A0', background: 'rgba(107,201,160,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                    +€{item.earnings}
                  </span>
                )}
                <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', color: '#A89B8C', padding: '4px', cursor: 'pointer' }}>
                  <Edit3 size={14} />
                </button>
                <button onClick={() => deleteContent(item.id)} style={{ background: 'none', border: 'none', color: '#A89B8C', padding: '4px', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* File Attachment Thumbnail */}
            {item.fileUrl && (
              <div
                onClick={() => setPreviewItem(item)}
                style={{
                  marginBottom: '12px', borderRadius: '10px', overflow: 'hidden',
                  border: '1px solid rgba(232,223,211,0.4)', cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {item.fileMime?.startsWith('image/') ? (
                  <img src={item.fileUrl} alt={item.fileName} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                ) : item.fileMime?.startsWith('video/') ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,107,157,0.04)' }}>
                    <Film size={20} color="#FF6B9D" />
                    <div>
                      <p style={{ fontSize: '13px', color: '#2A2420', fontWeight: '500' }}>{item.fileName}</p>
                      <p style={{ fontSize: '11px', color: '#A89B8C' }}>{formatFileSize(item.fileSize)}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(245,197,99,0.04)' }}>
                    <FileText size={20} color="#F5C563" />
                    <div>
                      <p style={{ fontSize: '13px', color: '#2A2420', fontWeight: '500' }}>{item.fileName}</p>
                      <p style={{ fontSize: '11px', color: '#A89B8C' }}>{formatFileSize(item.fileSize)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <ProgressBar progress={item.progress || 0} color={STATUS_COLORS[item.status]?.text || '#FF6B9D'} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <span style={{ fontSize: '12px', color: '#A89B8C' }}>
                {item.progress || 0}%{item.deadline ? ` • ${new Date(item.deadline).toLocaleDateString('de-DE')}` : ''}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {item.status !== 'Editing' && (
                  <button onClick={() => updateStatus(item, 'Editing')} style={{
                    padding: '6px 14px', background: 'rgba(42,36,32,0.04)', border: '1px solid #E8DFD3',
                    borderRadius: '10px', color: '#7A6F62', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                  }}>Zurück</button>
                )}
                {item.status !== 'Ready' && (
                  <button onClick={() => updateStatus(item, item.status === 'Editing' ? 'Review' : 'Ready')} style={{
                    padding: '6px 14px', background: 'rgba(255,107,157,0.1)', border: 'none',
                    borderRadius: '10px', color: '#FF6B9D', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
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
