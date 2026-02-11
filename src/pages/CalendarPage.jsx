import React, { useState, useEffect } from 'react'
import { Target, Plus, X, Trash2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, onSnapshot, getDocs, serverTimestamp, Timestamp
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import { notifyTeam, notifyOwner } from '../utils/notifications'
import Card from '../components/Card'
import Button from '../components/Button'

const TYPE_COLORS = {
  shooting: '#7EB5E6',
  deadline: '#FF6B9D',
  live: '#6BC9A0',
  meeting: '#F5C563',
  posting: '#A78BFA',
  other: '#A89B8C',
}

const TYPE_LABELS = {
  shooting: 'Shooting',
  deadline: 'Deadline',
  live: 'Live',
  meeting: 'Meeting',
  posting: 'Posting',
  other: 'Sonstiges',
}

const CalendarPage = () => {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  // Form state
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventType, setEventType] = useState('shooting')
  const [notes, setNotes] = useState('')

  // Current month navigation
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const today = new Date()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      orderBy('date', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    return () => unsub()
  }, [])

  const resetForm = () => {
    setTitle('')
    setEventDate('')
    setEventTime('')
    setEventType('shooting')
    setNotes('')
    setEditingEvent(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!title.trim() || !eventDate) return
    const user = auth.currentUser
    if (!user) return

    const data = {
      userId: user.uid,
      title: title.trim(),
      date: eventDate,
      time: eventTime || '',
      type: eventType,
      notes: notes.trim(),
      updatedAt: serverTimestamp(),
    }

    if (editingEvent) {
      await updateDoc(doc(db, 'events', editingEvent.id), data)
    } else {
      data.createdAt = serverTimestamp()
      await addDoc(collection(db, 'events'), data)

      // Notify team members about new event
      try {
        const memberQ = query(collection(db, 'company_members'), where('userId', '==', user.uid))
        const memberSnap = await getDocs(memberQ)
        if (!memberSnap.empty) {
          const companyId = memberSnap.docs[0].data().companyId
          // Get all team members
          const teamQ = query(collection(db, 'company_members'), where('companyId', '==', companyId))
          const teamSnap = await getDocs(teamQ)
          const teamMembers = teamSnap.docs.map(d => ({ id: d.id, ...d.data() }))

          const notifData = {
            type: 'calendar',
            title: 'Neuer Termin',
            message: `${user.displayName || 'Jemand'} hat "${title.trim()}" am ${eventDate}${eventTime ? ' um ' + eventTime + ' Uhr' : ''} erstellt.`,
            link: '/kalender',
          }

          // Notify all approved team members
          await notifyTeam(teamMembers, user.uid, notifData)

          // Also notify company owner (not in company_members)
          const compSnap = await getDocs(query(collection(db, 'companies'), where('ownerId', '!=', '')))
          for (const cd of compSnap.docs) {
            if (cd.id === companyId && cd.data().ownerId !== user.uid) {
              await notifyOwner(cd.data().ownerId, { ...notifData, senderId: user.uid })
            }
          }
        }
      } catch (notifErr) {
        console.warn('Calendar notification error:', notifErr)
      }
    }
    resetForm()
  }

  const handleEdit = (event) => {
    setTitle(event.title)
    setEventDate(event.date)
    setEventTime(event.time || '')
    setEventType(event.type)
    setNotes(event.notes || '')
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleDelete = async (eventId) => {
    await deleteDoc(doc(db, 'events', eventId))
  }

  // Calendar logic
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Monday start
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  const getEventsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  // Events for this month
  const monthEvents = events.filter(e => {
    const [y, m] = e.date.split('-')
    return parseInt(y) === currentYear && parseInt(m) === currentMonth + 1
  }).sort((a, b) => a.date.localeCompare(b.date))

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(42, 36, 32, 0.03)',
    border: '1.5px solid #E8DFD3',
    borderRadius: '12px',
    color: '#2A2420',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="animate-fade-in">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>
            Kalender
          </h2>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginTop: '2px' }}>{monthEvents.length} Termine</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true) }} style={{ padding: '10px 16px' }}>
          <Plus size={18} /> Neu
        </Button>
      </div>

      {/* Month Navigation */}
      <Card className="animate-fade-in stagger-1" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={() => {
            if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
            else setCurrentMonth(currentMonth - 1)
          }} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '8px' }}>
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontWeight: '700', color: '#2A2420', fontSize: '16px', textTransform: 'capitalize' }}>
            {monthName}
          </span>
          <button onClick={() => {
            if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
            else setCurrentMonth(currentMonth + 1)
          }} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '8px' }}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} style={{ textAlign: 'center', padding: '6px', color: '#A89B8C', fontSize: '11px', fontWeight: '600' }}>
              {day}
            </div>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1
            const dayEvents = getEventsForDay(dayNum)
            const isTodayDay = isToday(dayNum)
            const isSelected = selectedDay === dayNum
            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)}
                style={{
                  aspectRatio: '1',
                  background: isTodayDay
                    ? 'linear-gradient(135deg, #FF8FAB 0%, #FF6B9D 100%)'
                    : isSelected ? 'rgba(255,107,157,0.08)' : 'rgba(42, 36, 32, 0.02)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: isTodayDay || isSelected ? '700' : '500',
                  color: isTodayDay ? 'white' : '#5C5349',
                  border: isSelected && !isTodayDay ? '1.5px solid rgba(255,107,157,0.3)' : isTodayDay ? 'none' : '1px solid rgba(232, 223, 211, 0.3)',
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: isTodayDay ? '0 3px 10px rgba(255,107,157,0.3)' : 'none'
                }}
              >
                {dayNum}
                {dayEvents.length > 0 && (
                  <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '3px' }}>
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <div key={idx} style={{
                        width: '4px', height: '4px',
                        borderRadius: '50%',
                        background: isTodayDay ? 'white' : (TYPE_COLORS[e.type] || '#FF6B9D')
                      }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Selected Day Events */}
      {selectedDay && (
        <div className="animate-fade-in" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#2A2420', marginBottom: '10px' }}>
            {selectedDay}. {monthName.split(' ')[0]}
          </h3>
          {getEventsForDay(selectedDay).length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '24px', color: '#A89B8C', fontSize: '14px' }}>
              Keine Termine an diesem Tag
            </Card>
          ) : (
            getEventsForDay(selectedDay).map(event => (
              <Card key={event.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
                <div style={{ width: '4px', height: '40px', background: TYPE_COLORS[event.type] || '#FF6B9D', borderRadius: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{event.title}</p>
                  <p style={{ fontSize: '12px', color: '#A89B8C' }}>{event.time && `${event.time} Uhr • `}{TYPE_LABELS[event.type]}</p>
                </div>
                <button onClick={() => handleEdit(event)} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '6px' }}>
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(event.id)} style={{ background: 'none', border: 'none', color: '#DC2626', padding: '6px' }}>
                  <Trash2 size={16} />
                </button>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Upcoming Events */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '14px' }}>
        Kommende Termine
      </h3>
      {monthEvents.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px', color: '#A89B8C' }}>
          <Target size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p>Noch keine Termine. Erstelle deinen ersten!</p>
        </Card>
      ) : (
        monthEvents.map(event => (
          <Card key={event.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: '4px', height: '44px', background: TYPE_COLORS[event.type] || '#FF6B9D', borderRadius: '2px', flexShrink: 0 }} />
            <div style={{
              width: '48px', height: '48px',
              background: `${TYPE_COLORS[event.type] || '#FF6B9D'}15`,
              borderRadius: '14px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '10px', color: '#A89B8C', fontWeight: '500' }}>
                {new Date(event.date).toLocaleDateString('de-DE', { month: 'short' })}
              </span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420' }}>
                {event.date.split('-')[2]}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{event.title}</p>
              <p style={{ fontSize: '13px', color: '#A89B8C', marginTop: '2px' }}>
                {event.time && `${event.time} Uhr`}
                {event.notes && ` • ${event.notes}`}
              </p>
            </div>
            <span style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: '600',
              background: `${TYPE_COLORS[event.type] || '#FF6B9D'}15`,
              color: TYPE_COLORS[event.type] || '#FF6B9D'
            }}>
              {TYPE_LABELS[event.type]}
            </span>
          </Card>
        ))
      )}

      {/* Add/Edit Event Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42, 36, 32, 0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '20px'
        }} onClick={(e) => { if (e.target === e.currentTarget) resetForm() }}>
          <div className="animate-slide-up" style={{
            width: '100%', maxWidth: '440px',
            background: '#FFFDF7',
            borderRadius: '24px 24px 0 0',
            padding: '28px',
            maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420' }}>
                {editingEvent ? 'Event bearbeiten' : 'Neues Event'}
              </h3>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Titel</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. Shooting, Live Session..." style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Datum</label>
                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Uhrzeit</label>
                <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Typ</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setEventType(key)}
                    style={{
                      padding: '8px 14px', borderRadius: '20px',
                      border: eventType === key ? 'none' : '1.5px solid #E8DFD3',
                      background: eventType === key ? TYPE_COLORS[key] : 'white',
                      color: eventType === key ? 'white' : '#7A6F62',
                      fontSize: '12px', fontWeight: '600'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Notizen</label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Optional..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="ghost" onClick={resetForm} style={{ flex: 1 }}>Abbrechen</Button>
              <Button variant="primary" onClick={handleSave} style={{ flex: 2 }}>
                {editingEvent ? 'Speichern' : 'Event erstellen'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarPage
