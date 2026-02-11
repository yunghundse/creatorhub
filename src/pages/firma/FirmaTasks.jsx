import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompany } from '../../contexts/CompanyContext'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import { createNotification, notifyTeam } from '../../utils/notifications'
import {
  ArrowLeft, Plus, Check, Trash2, Clock, User, Filter, X, CheckSquare
} from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const FirmaTasks = ({ userData }) => {
  const navigate = useNavigate()
  const { company, isOwner, members, isApproved } = useCompany()
  const [tasks, setTasks] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [assignTo, setAssignTo] = useState('')
  const [priority, setPriority] = useState('normal')
  const [filter, setFilter] = useState('all') // all, mine, open, done
  const [loading, setLoading] = useState(true)

  const uid = auth.currentUser?.uid

  // Load tasks
  useEffect(() => {
    if (!company?.id) { setLoading(false); return }

    const loadTasks = async () => {
      try {
        const q = query(collection(db, 'company_tasks'), where('companyId', '==', company.id), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        // Fallback: without orderBy if index doesn't exist
        try {
          const q2 = query(collection(db, 'company_tasks'), where('companyId', '==', company.id))
          const snap2 = await getDocs(q2)
          setTasks(snap2.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
        } catch (e) { console.error('Tasks load error:', e) }
      }
      setLoading(false)
    }
    loadTasks()
  }, [company?.id])

  const createTask = async () => {
    if (!title.trim()) return
    const newTask = {
      companyId: company.id,
      title: title.trim(),
      description: desc.trim(),
      assignedTo: assignTo || null,
      priority,
      status: 'open',
      createdBy: uid,
      createdAt: serverTimestamp(),
    }
    try {
      const docRef = await addDoc(collection(db, 'company_tasks'), newTask)
      setTasks(prev => [{ id: docRef.id, ...newTask, createdAt: { seconds: Date.now() / 1000 } }, ...prev])

      // Send notification
      const user = auth.currentUser
      const senderName = user?.displayName || 'Manager'
      if (assignTo) {
        // Notify the assigned person
        await createNotification({
          recipientId: assignTo,
          type: 'task',
          title: 'Neue Aufgabe',
          message: `${senderName} hat dir "${title.trim()}" zugewiesen.`,
          link: '/firma/tasks',
          senderId: uid,
        })
      } else {
        // Notify all team members
        const teamMembers = members.filter(m => m.status === 'approved')
        await notifyTeam(teamMembers, uid, {
          type: 'task',
          title: 'Neue Aufgabe',
          message: `${senderName} hat "${title.trim()}" erstellt.`,
          link: '/firma/tasks',
        })
      }

      setTitle(''); setDesc(''); setAssignTo(''); setPriority('normal'); setShowCreate(false)
    } catch (err) { console.error('Create task error:', err) }
  }

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'open' : 'done'
    try {
      await updateDoc(doc(db, 'company_tasks', taskId), { status: newStatus })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (err) { console.error('Toggle task error:', err) }
  }

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'company_tasks', taskId))
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) { console.error('Delete task error:', err) }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'mine') return t.assignedTo === uid
    if (filter === 'open') return t.status === 'open'
    if (filter === 'done') return t.status === 'done'
    return true
  })

  const getMemberName = (userId) => {
    if (!userId) return 'Alle'
    const m = members.find(m => m.userId === userId)
    return m?.user?.displayName || m?.user?.email || 'Unbekannt'
  }

  const priorityColors = { urgent: '#DC2626', high: '#F5C563', normal: '#7EB5E6', low: '#A89B8C' }
  const priorityLabels = { urgent: 'Dringend', high: 'Hoch', normal: 'Normal', low: 'Niedrig' }

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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>Aufgaben</h2>
          <p style={{ fontSize: '13px', color: '#A89B8C' }}>{company?.name}</p>
        </div>
        {isOwner && (
          <Button variant="primary" onClick={() => setShowCreate(true)} style={{ padding: '10px 16px', fontSize: '13px' }}>
            <Plus size={16} /> Neue Aufgabe
          </Button>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }} className="animate-fade-in stagger-1">
        {[
          { id: 'all', label: 'Alle' },
          { id: 'mine', label: 'Meine' },
          { id: 'open', label: 'Offen' },
          { id: 'done', label: 'Erledigt' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '500',
            border: filter === f.id ? '1.5px solid rgba(126,181,230,0.3)' : '1px solid rgba(232,223,211,0.6)',
            background: filter === f.id ? 'rgba(126,181,230,0.08)' : 'rgba(42,36,32,0.02)',
            color: filter === f.id ? '#7EB5E6' : '#7A6F62',
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Create Task Form */}
      {showCreate && (
        <Card style={{ marginBottom: '16px', padding: '20px', border: '1.5px solid rgba(107,201,160,0.2)' }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Neue Aufgabe</span>
            <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Titel *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. Instagram Reel schneiden" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Beschreibung</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Details zur Aufgabe..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Zuweisen an</label>
              <select value={assignTo} onChange={e => setAssignTo(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Alle</option>
                {members.filter(m => m.status === 'approved').map(m => (
                  <option key={m.userId} value={m.userId}>{m.user?.displayName || m.user?.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Priorität</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="urgent">Dringend</option>
                <option value="high">Hoch</option>
                <option value="normal">Normal</option>
                <option value="low">Niedrig</option>
              </select>
            </div>
          </div>

          <Button variant="primary" onClick={createTask} disabled={!title.trim()} style={{ width: '100%', padding: '12px' }}>
            Aufgabe erstellen
          </Button>
        </Card>
      )}

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#A89B8C' }}>Lade Aufgaben...</div>
      ) : filteredTasks.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }} className="animate-fade-in stagger-2">
          <CheckSquare size={36} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#7A6F62', fontSize: '14px' }}>
            {filter === 'all' ? 'Noch keine Aufgaben erstellt.' : 'Keine Aufgaben in dieser Kategorie.'}
          </p>
        </Card>
      ) : (
        filteredTasks.map((task, i) => (
          <Card key={task.id} style={{ marginBottom: '8px', padding: '14px 18px' }} className={`animate-fade-in stagger-${Math.min(i + 2, 8)}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {/* Checkbox */}
              <button onClick={() => toggleTask(task.id, task.status)} style={{
                width: '24px', height: '24px', borderRadius: '8px', flexShrink: 0, marginTop: '2px',
                border: task.status === 'done' ? 'none' : '2px solid #E8DFD3',
                background: task.status === 'done' ? 'linear-gradient(135deg, #6BC9A0, #4FA882)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                {task.status === 'done' && <Check size={14} color="white" strokeWidth={3} />}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontWeight: '600', color: task.status === 'done' ? '#A89B8C' : '#2A2420', fontSize: '14px',
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                }}>{task.title}</p>
                {task.description && (
                  <p style={{ fontSize: '12px', color: '#7A6F62', marginTop: '3px', lineHeight: '1.4' }}>{task.description}</p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600',
                    background: `${priorityColors[task.priority]}10`, color: priorityColors[task.priority],
                  }}>{priorityLabels[task.priority]}</span>
                  {task.assignedTo && (
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(126,181,230,0.08)', color: '#7EB5E6', fontWeight: '500' }}>
                      {getMemberName(task.assignedTo)}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete (owner only) */}
              {isOwner && (
                <button onClick={() => deleteTask(task.id)} style={{
                  background: 'none', border: 'none', color: '#C9BFAF', cursor: 'pointer', padding: '4px',
                }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

export default FirmaTasks
