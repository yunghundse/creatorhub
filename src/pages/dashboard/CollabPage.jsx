import React, { useState, useEffect } from 'react'
import { Plus, X, Check, Clock, Trash2 } from 'lucide-react'
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const CollabPage = ({ userData }) => {
  const [tasks, setTasks] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'normal', deadline: '' })
  const user = auth.currentUser
  const role = userData?.role || 'influencer'

  useEffect(() => {
    if (!user) return
    // Influencer sees tasks they created, Cutter sees tasks assigned to them
    const field = role === 'cutter' ? 'assignedTo' : 'createdBy'
    const q = query(collection(db, 'tasks'), where(field, '==', user.uid), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [user, role])

  const addTask = async () => {
    if (!form.title.trim()) return
    await addDoc(collection(db, 'tasks'), {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      deadline: form.deadline,
      status: 'open',
      createdBy: user.uid,
      assignedTo: userData?.partnerId || user.uid,
      createdAt: serverTimestamp(),
    })
    setForm({ title: '', description: '', priority: 'normal', deadline: '' })
    setShowAdd(false)
  }

  const toggleStatus = async (task) => {
    const next = task.status === 'open' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'open'
    await updateDoc(doc(db, 'tasks', task.id), { status: next })
  }

  const deleteTask = async (id) => { await deleteDoc(doc(db, 'tasks', id)) }

  const statusColors = { open: '#F5C563', in_progress: '#7EB5E6', done: '#6BC9A0' }
  const statusLabels = { open: 'Offen', in_progress: 'In Arbeit', done: 'Erledigt' }

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>
            {role === 'cutter' ? 'Meine Aufträge' : 'Collab-Board'}
          </h2>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginTop: '2px' }}>{tasks.length} Aufgaben</p>
        </div>
        {role === 'influencer' && (
          <Button variant="primary" onClick={() => setShowAdd(true)} style={{ padding: '10px 16px' }}>
            <Plus size={18} /> Aufgabe
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontWeight: '600', color: '#2A2420' }}>Neue Aufgabe</span>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#7A6F62' }}><X size={18} /></button>
          </div>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titel" style={{ ...inputStyle, marginBottom: '10px' }} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Beschreibung..." rows={2} style={{ ...inputStyle, marginBottom: '10px', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            {['low', 'normal', 'high'].map(p => (
              <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{
                flex: 1, padding: '8px', borderRadius: '10px', fontSize: '13px', fontWeight: '500',
                border: form.priority === p ? 'none' : '1.5px solid #E8DFD3',
                background: form.priority === p ? (p === 'high' ? '#FF6B9D' : p === 'normal' ? '#7EB5E6' : '#6BC9A0') : 'rgba(255,255,255,0.6)',
                color: form.priority === p ? 'white' : '#7A6F62', textTransform: 'capitalize',
              }}>{p === 'high' ? 'Hoch' : p === 'normal' ? 'Normal' : 'Niedrig'}</button>
            ))}
          </div>
          <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={{ ...inputStyle, marginBottom: '14px' }} />
          <Button variant="primary" onClick={addTask} style={{ width: '100%' }}>Erstellen</Button>
        </Card>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ color: '#A89B8C' }}>Keine Aufgaben vorhanden</p>
        </Card>
      ) : (
        tasks.map(task => (
          <Card key={task.id} style={{ marginBottom: '10px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <button onClick={() => toggleStatus(task)} style={{
                width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, marginTop: '2px',
                background: `${statusColors[task.status]}20`, border: `2px solid ${statusColors[task.status]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                {task.status === 'done' && <Check size={14} color={statusColors.done} />}
                {task.status === 'in_progress' && <Clock size={14} color={statusColors.in_progress} />}
              </button>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: task.status === 'done' ? '#A89B8C' : '#2A2420', fontSize: '15px', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</p>
                {task.description && <p style={{ fontSize: '13px', color: '#A89B8C', marginTop: '4px' }}>{task.description}</p>}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '600', background: `${statusColors[task.status]}15`, color: statusColors[task.status] }}>
                    {statusLabels[task.status]}
                  </span>
                  {task.deadline && <span style={{ fontSize: '11px', color: '#A89B8C' }}>{new Date(task.deadline).toLocaleDateString('de-DE')}</span>}
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#C9BFAF', padding: '4px' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

export default CollabPage
