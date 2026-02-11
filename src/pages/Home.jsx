import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Heart, Sparkles, Clock, ChevronRight, Zap,
  ArrowUpRight, Kanban, Calendar, Building2, Users, DollarSign,
  CheckCircle, Briefcase, Timer, Layers, ListTodo, Scissors,
  Video, Shield
} from 'lucide-react'
import {
  collection, query, where, orderBy, onSnapshot, limit, getDocs
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import Card from '../components/Card'
import Button from '../components/Button'

const ADMIN_EMAIL = 'yunghundse@gmail.com'

const EVENT_TYPE_COLORS = {
  shooting: '#7EB5E6',
  deadline: '#FF6B9D',
  live: '#6BC9A0',
  meeting: '#F5C563',
  posting: '#9B8FE6',
  other: '#A89B8C',
}

const Home = ({ userData }) => {
  const navigate = useNavigate()
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [events, setEvents] = useState([])
  const [contentStats, setContentStats] = useState({ total: 0, editing: 0, review: 0, ready: 0, totalEarnings: 0 })
  const [financeTotal, setFinanceTotal] = useState({ brutto: 0, netto: 0 })
  const [teamStats, setTeamStats] = useState({ members: 0, pendingApprovals: 0, activeDeals: 0 })
  const [deadlineCount, setDeadlineCount] = useState(0)
  const [taskCount, setTaskCount] = useState(0)

  const currentUser = auth.currentUser
  const isAdmin = currentUser?.email === ADMIN_EMAIL
  const role = isAdmin ? 'admin' : (userData?.role || 'model')

  // Load upcoming events
  useEffect(() => {
    if (!currentUser) return
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextWeekStr = nextWeek.toISOString().split('T')[0]

    const q = query(
      collection(db, 'events'),
      where('userId', '==', currentUser.uid),
      where('date', '>=', todayStr),
      where('date', '<=', nextWeekStr),
      orderBy('date', 'asc'),
      limit(5)
    )
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [currentUser])

  // Load content stats
  useEffect(() => {
    if (!currentUser) return
    const q = query(collection(db, 'content'), where('userId', '==', currentUser.uid))
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => d.data())
      setContentStats({
        total: items.length,
        editing: items.filter(i => i.status === 'Editing').length,
        review: items.filter(i => i.status === 'Review').length,
        ready: items.filter(i => i.status === 'Ready').length,
        totalEarnings: items.reduce((sum, i) => sum + (i.earnings || 0), 0),
      })
    })
    return () => unsub()
  }, [currentUser])

  // Load finance totals
  useEffect(() => {
    if (!currentUser) return
    const q = query(collection(db, 'finances'), where('userId', '==', currentUser.uid))
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => d.data())
      setFinanceTotal({
        brutto: items.reduce((sum, i) => sum + (i.brutto || 0), 0),
        netto: items.reduce((sum, i) => sum + (i.netto || 0), 0),
      })
    })
    return () => unsub()
  }, [currentUser])

  // Load role-specific stats
  useEffect(() => {
    if (!userData?.companyId) return
    const cid = userData.companyId

    if (role === 'manager' || role === 'admin') {
      getDocs(query(collection(db, 'users'), where('companyId', '==', cid))).then(snap => {
        setTeamStats(prev => ({ ...prev, members: snap.size }))
      }).catch(() => {})
      getDocs(query(collection(db, 'approvals'), where('companyId', '==', cid), where('status', '==', 'pending'))).then(snap => {
        setTeamStats(prev => ({ ...prev, pendingApprovals: snap.size }))
      }).catch(() => {})
      getDocs(query(collection(db, 'brandDeals'), where('companyId', '==', cid), where('status', '!=', 'paid'))).then(snap => {
        setTeamStats(prev => ({ ...prev, activeDeals: snap.size }))
      }).catch(() => {})
    }

    if (role === 'model') {
      getDocs(query(collection(db, 'deadlines'), where('companyId', '==', cid), where('status', '==', 'open'))).then(snap => {
        setDeadlineCount(snap.size)
      }).catch(() => {})
      getDocs(query(collection(db, 'tasks'), where('companyId', '==', cid), where('status', '!=', 'done'))).then(snap => {
        setTaskCount(snap.size)
      }).catch(() => {})
    }
  }, [userData?.companyId, role])

  const generateAiSuggestion = () => {
    const suggestions = {
      manager: [
        "Revenue-Split für diesen Monat prüfen",
        "3 offene Brand-Deals warten auf Antwort",
        "Freigaben-Queue überprüfen — schnelleres Feedback = bessere Performance",
      ],
      model: [
        "Content zur Freigabe einreichen für schnellere Veröffentlichung",
        "Kalender checken — sind alle Shootings geplant?",
        "Poste um 20:00 Uhr für +45% Engagement",
      ],
      admin: [
        "User-Freischaltungen prüfen",
        "Audit-Log regelmäßig checken",
      ],
    }
    const list = suggestions[role] || suggestions.model
    setAiSuggestion(list[Math.floor(Math.random() * list.length)])
    setTimeout(() => setAiSuggestion(null), 5000)
  }

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Creator'

  // Quick Actions per role
  const quickActions = {
    manager: [
      { icon: CheckCircle, label: 'Freigaben', path: '/dashboard/approvals', color: '#6BC9A0', count: teamStats.pendingApprovals },
      { icon: DollarSign, label: 'Revenue', path: '/dashboard/revenue', color: '#F5C563' },
      { icon: Briefcase, label: 'Deals', path: '/dashboard/brand-deals', color: '#7EB5E6', count: teamStats.activeDeals },
      { icon: Building2, label: 'Firma', path: '/dashboard/company', color: '#FF6B9D' },
    ],
    model: [
      { icon: CheckCircle, label: 'Freigaben', path: '/dashboard/approvals', color: '#6BC9A0' },
      { icon: Calendar, label: 'Kalender', path: '/dashboard/schedule', color: '#7EB5E6' },
      { icon: Video, label: 'Assets', path: '/dashboard/assets', color: '#F5C563' },
      { icon: Heart, label: 'Finanzen', path: '/finanzen', color: '#FF6B9D' },
    ],
    admin: [
      { icon: Shield, label: 'Admin', path: '/admin', color: '#FF6B9D' },
      { icon: Users, label: 'Audit', path: '/dashboard/audit-log', color: '#7EB5E6' },
      { icon: TrendingUp, label: 'Analytics', path: '/dashboard/analytics', color: '#6BC9A0' },
      { icon: TrendingUp, label: 'Trends', path: '/dashboard/trends', color: '#F5C563' },
    ],
  }
  const roleActions = quickActions[role] || quickActions.model

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: '24px' }} className="animate-fade-in">
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>
          Hallo, {displayName}
        </h2>
        <p style={{ color: '#A89B8C', marginTop: '4px', fontSize: '15px' }}>
          {role === 'manager' ? 'Dein Team-Überblick' :
           role === 'model' ? 'Dein Shooting-Überblick' :
           role === 'admin' ? 'System-Überblick' :
           'Dein Creator-Überblick'}
        </p>
      </div>

      {/* AI Banner */}
      {aiSuggestion && (
        <div className="animate-scale-in" style={{
          background: 'linear-gradient(135deg, rgba(255,143,171,0.12) 0%, rgba(255,107,157,0.08) 100%)',
          border: '1px solid rgba(255,107,157,0.2)',
          borderRadius: '18px', padding: '16px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '36px', height: '36px', background: 'linear-gradient(135deg, #FF8FAB, #FF6B9D)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ color: '#5C5349', fontSize: '14px', fontWeight: '500' }}>{aiSuggestion}</span>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }} className="animate-fade-in stagger-1">
        {roleActions.map((action, i) => {
          const Icon = action.icon
          return (
            <div key={i} onClick={() => navigate(action.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              padding: '14px 8px', borderRadius: '16px', cursor: 'pointer',
              background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(232,223,211,0.4)',
              transition: 'all 0.2s ease', position: 'relative',
            }}>
              {action.count > 0 && (
                <div style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#FF6B9D', color: 'white', fontSize: '11px',
                  fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {action.count > 9 ? '9+' : action.count}
                </div>
              )}
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: `${action.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={19} color={action.color} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#5C5349', textAlign: 'center' }}>{action.label}</span>
            </div>
          )
        })}
      </div>

      {/* Role-specific Stats */}
      {(role === 'manager' || role === 'admin') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <Card className="animate-fade-in stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(107,201,160,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} color="#6BC9A0" />
              </div>
              <span style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500' }}>Team</span>
            </div>
            <p style={{ fontSize: '26px', fontWeight: '700', color: '#2A2420' }}>{teamStats.members}</p>
            <span style={{ fontSize: '12px', color: '#A89B8C' }}>Mitglieder</span>
          </Card>
          <Card className="animate-fade-in stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(245,197,99,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={16} color="#F5C563" />
              </div>
              <span style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500' }}>Revenue</span>
            </div>
            <p style={{ fontSize: '26px', fontWeight: '700', color: '#2A2420' }}>
              {financeTotal.brutto > 1000 ? (financeTotal.brutto / 1000).toFixed(1) + 'k' : financeTotal.brutto.toLocaleString('de-DE')}€
            </p>
            <span style={{ fontSize: '12px', color: '#A89B8C' }}>Brutto</span>
          </Card>
        </div>
      )}


      {role === 'model' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <Card className="animate-fade-in stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(107,201,160,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={16} color="#6BC9A0" />
              </div>
              <span style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500' }}>Freigaben</span>
            </div>
            <p style={{ fontSize: '26px', fontWeight: '700', color: '#2A2420' }}>{contentStats.review}</p>
            <span style={{ fontSize: '12px', color: '#A89B8C' }}>Ausstehend</span>
          </Card>
          <Card className="animate-fade-in stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(255,107,157,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={16} color="#FF6B9D" />
              </div>
              <span style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500' }}>Earnings</span>
            </div>
            <p style={{ fontSize: '26px', fontWeight: '700', color: '#2A2420' }}>
              €{contentStats.totalEarnings > 1000 ? (contentStats.totalEarnings / 1000).toFixed(1) + 'k' : contentStats.totalEarnings.toLocaleString('de-DE')}
            </p>
            <span style={{ fontSize: '12px', color: '#A89B8C' }}>Content</span>
          </Card>
        </div>
      )}

      {/* Content Pipeline */}
      <Card className="animate-fade-in stagger-3" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Kanban size={18} color="#FF6B9D" />
          <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Content Pipeline</span>
        </div>
        {contentStats.total === 0 ? (
          <p style={{ fontSize: '13px', color: '#A89B8C' }}>Noch kein Content erstellt</p>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(255,107,157,0.06)', borderRadius: '12px' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#FF6B9D' }}>{contentStats.editing}</p>
              <p style={{ fontSize: '11px', color: '#A89B8C', fontWeight: '500' }}>Editing</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(126,181,230,0.06)', borderRadius: '12px' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#7EB5E6' }}>{contentStats.review}</p>
              <p style={{ fontSize: '11px', color: '#A89B8C', fontWeight: '500' }}>Review</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(107,201,160,0.06)', borderRadius: '12px' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#6BC9A0' }}>{contentStats.ready}</p>
              <p style={{ fontSize: '11px', color: '#A89B8C', fontWeight: '500' }}>Ready</p>
            </div>
          </div>
        )}
      </Card>

      {/* AI Button */}
      <div className="animate-fade-in stagger-3" style={{ marginBottom: '28px' }}>
        <Button variant="cream" onClick={generateAiSuggestion} style={{ width: '100%', padding: '16px' }}>
          <Sparkles size={18} /> KI-Insight generieren
        </Button>
      </div>

      {/* Upcoming Events */}
      <div className="animate-fade-in stagger-4">
        <h3 style={{
          fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '14px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Clock size={18} color="#FF6B9D" />
          Anstehend (nächste 7 Tage)
        </h3>

        {events.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '30px 20px' }}>
            <Calendar size={24} color="#E8DFD3" style={{ marginBottom: '8px' }} />
            <p style={{ color: '#A89B8C', fontSize: '14px' }}>Keine Events in den nächsten 7 Tagen</p>
          </Card>
        ) : (
          events.map(item => {
            const dateObj = new Date(item.date + 'T00:00:00')
            const day = dateObj.getDate().toString().padStart(2, '0')
            const monthShort = dateObj.toLocaleDateString('de-DE', { month: 'short' })
            return (
              <Card key={item.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: `linear-gradient(135deg, ${EVENT_TYPE_COLORS[item.type] || '#A89B8C'}18, ${EVENT_TYPE_COLORS[item.type] || '#A89B8C'}08)`,
                  borderRadius: '14px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <span style={{ fontSize: '10px', color: '#A89B8C', fontWeight: '500' }}>{monthShort}</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420' }}>{day}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{item.title}</p>
                  <p style={{ fontSize: '13px', color: '#A89B8C', marginTop: '2px' }}>
                    {item.time ? `${item.time} Uhr` : item.type || ''}
                  </p>
                </div>
                <ChevronRight size={20} color="#C9BFAF" />
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Home
