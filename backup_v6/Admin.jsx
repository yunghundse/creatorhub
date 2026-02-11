import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, FileText, BarChart3, DollarSign, Wrench, Shield,
  Check, X, Ban, Trash2, Eye, ChevronRight, AlertTriangle,
  TrendingUp, TrendingDown, Activity, Clock, Search,
  ToggleLeft, ToggleRight, ArrowLeft, RefreshCw, Server, Cpu, HardDrive, Wifi, Crown, Zap
} from 'lucide-react'
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, getDoc, setDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import Card from '../components/Card'
import Button from '../components/Button'

const ADMIN_EMAIL = 'yunghundse@gmail.com'

// ===== ADMIN TABS =====
const TABS = [
  { id: 'overview', icon: BarChart3, label: 'Übersicht' },
  { id: 'users', icon: Users, label: 'User' },
  { id: 'content', icon: FileText, label: 'Content' },
  { id: 'revenue', icon: DollarSign, label: 'Umsatz' },
  { id: 'stats', icon: Server, label: 'System' },
  { id: 'maintenance', icon: Wrench, label: 'Wartung' },
]

// ===== DEMO REVENUE DATA =====
const REVENUE_DATA = [
  { month: 'Sep 25', revenue: 8400, costs: 2100, profit: 6300 },
  { month: 'Okt 25', revenue: 9200, costs: 2300, profit: 6900 },
  { month: 'Nov 25', revenue: 11500, costs: 2800, profit: 8700 },
  { month: 'Dez 25', revenue: 14200, costs: 3200, profit: 11000 },
  { month: 'Jan 26', revenue: 12800, costs: 2900, profit: 9900 },
  { month: 'Feb 26', revenue: 15600, costs: 3400, profit: 12200 },
]

const DEMO_CONTENT_ITEMS = [
  { id: 'c1', title: 'Valentine Special', creator: 'Lisa M.', status: 'pending', type: 'video', date: '10.02.2026', flagged: false },
  { id: 'c2', title: 'Behind the Scenes', creator: 'Sarah K.', status: 'approved', type: 'photo', date: '09.02.2026', flagged: false },
  { id: 'c3', title: 'Promotion Video', creator: 'Max P.', status: 'pending', type: 'video', date: '08.02.2026', flagged: true },
  { id: 'c4', title: 'Q&A Session', creator: 'Lisa M.', status: 'approved', type: 'live', date: '07.02.2026', flagged: false },
  { id: 'c5', title: 'Morning Routine', creator: 'Anna B.', status: 'rejected', type: 'video', date: '06.02.2026', flagged: true },
]

const Admin = ({ user }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [contentItems, setContentItems] = useState(DEMO_CONTENT_ITEMS)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('Die App wird gerade gewartet. Bitte versuche es später erneut.')

  const isAdmin = user?.email === ADMIN_EMAIL

  // Load users from Firestore
  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Error loading users:', err)
    }
    setLoadingUsers(false)
  }

  // Load maintenance status
  const loadMaintenanceStatus = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'maintenance'))
      if (snap.exists()) {
        setMaintenanceMode(snap.data().enabled || false)
        setMaintenanceMessage(snap.data().message || maintenanceMessage)
      }
    } catch (err) {
      console.error('Error loading maintenance status:', err)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    loadUsers()
    loadMaintenanceStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  // Check admin access — after all hooks
  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Shield size={48} color="#DC2626" style={{ marginBottom: '16px' }} />
        <h2 style={{ color: '#2A2420', marginBottom: '8px' }}>Kein Zugang</h2>
        <p style={{ color: '#7A6F62' }}>Du hast keine Admin-Berechtigung.</p>
        <Button variant="primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
          Zurück zur App
        </Button>
      </div>
    )
  }

  // User actions
  const approveUser = async (uid) => {
    await updateDoc(doc(db, 'users', uid), { approved: true })
    setUsers(users.map(u => u.id === uid ? { ...u, approved: true } : u))
  }

  const blockUser = async (uid) => {
    const u = users.find(u => u.id === uid)
    await updateDoc(doc(db, 'users', uid), { blocked: !u.blocked })
    setUsers(users.map(u => u.id === uid ? { ...u, blocked: !u.blocked } : u))
  }

  const deleteUser = async (uid) => {
    if (!confirm('User wirklich löschen? Das kann nicht rückgängig gemacht werden.')) return
    await deleteDoc(doc(db, 'users', uid))
    setUsers(users.filter(u => u.id !== uid))
  }

  // Content actions
  const updateContentStatus = (id, status) => {
    setContentItems(contentItems.map(c => c.id === id ? { ...c, status } : c))
  }

  const deleteContent = (id) => {
    setContentItems(contentItems.filter(c => c.id !== id))
  }

  // Maintenance toggle
  const toggleMaintenance = async () => {
    const newState = !maintenanceMode
    setMaintenanceMode(newState)
    await setDoc(doc(db, 'settings', 'maintenance'), {
      enabled: newState,
      message: maintenanceMessage,
      updatedAt: serverTimestamp(),
      updatedBy: user.email,
    })
  }

  const saveMaintenanceMessage = async () => {
    await setDoc(doc(db, 'settings', 'maintenance'), {
      enabled: maintenanceMode,
      message: maintenanceMessage,
      updatedAt: serverTimestamp(),
      updatedBy: user.email,
    })
  }

  // Filtered users
  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Stats
  const pendingUsers = users.filter(u => !u.approved && !u.blocked).length
  const activeUsers = users.filter(u => u.approved && !u.blocked).length
  const blockedUsers = users.filter(u => u.blocked).length
  const totalRevenue = REVENUE_DATA.reduce((sum, r) => sum + r.revenue, 0)
  const totalProfit = REVENUE_DATA.reduce((sum, r) => sum + r.profit, 0)
  const pendingContent = contentItems.filter(c => c.status === 'pending').length

  // ===== RENDER OVERVIEW =====
  const renderOverview = () => (
    <div className="animate-fade-in">
      {/* Warning: Pending approvals */}
      {pendingUsers > 0 && (
        <Card style={{
          marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(245, 197, 99, 0.1), rgba(245, 197, 99, 0.05))',
          border: '1px solid rgba(245, 197, 99, 0.3)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertTriangle size={20} color="#F5C563" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>
              {pendingUsers} User warten auf Freischaltung
            </p>
          </div>
          <button
            onClick={() => setActiveTab('users')}
            style={{ background: 'none', border: 'none', color: '#FF6B9D', fontWeight: '600', fontSize: '13px' }}
          >
            Ansehen →
          </button>
        </Card>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Users size={16} color="#FF6B9D" />
            <span style={{ fontSize: '12px', color: '#A89B8C' }}>Aktive User</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#2A2420' }}>{activeUsers}</p>
          <p style={{ fontSize: '12px', color: '#6BC9A0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> +{pendingUsers} wartend
          </p>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DollarSign size={16} color="#6BC9A0" />
            <span style={{ fontSize: '12px', color: '#A89B8C' }}>Umsatz (Gesamt)</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#2A2420' }}>€{(totalRevenue / 1000).toFixed(1)}k</p>
          <p style={{ fontSize: '12px', color: '#6BC9A0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> +22% vs. Vormonat
          </p>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FileText size={16} color="#7EB5E6" />
            <span style={{ fontSize: '12px', color: '#A89B8C' }}>Content ausstehend</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#2A2420' }}>{pendingContent}</p>
          <p style={{ fontSize: '12px', color: '#F5C563' }}>Braucht Review</p>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={16} color="#A78BFA" />
            <span style={{ fontSize: '12px', color: '#A89B8C' }}>System</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: maintenanceMode ? '#DC2626' : '#6BC9A0' }}>
            {maintenanceMode ? 'Wartung' : 'Online'}
          </p>
          <p style={{ fontSize: '12px', color: '#A89B8C' }}>Status</p>
        </Card>
      </div>

      {/* Quick Revenue Chart */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '12px' }}>
        Umsatz-Verlauf
      </h3>
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
          {REVENUE_DATA.map((item, i) => {
            const maxRev = Math.max(...REVENUE_DATA.map(r => r.revenue))
            const height = (item.revenue / maxRev) * 100
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#7A6F62', fontWeight: '500' }}>€{(item.revenue / 1000).toFixed(1)}k</span>
                <div style={{
                  width: '100%',
                  height: `${height}%`,
                  background: i === REVENUE_DATA.length - 1
                    ? 'linear-gradient(180deg, #FF8FAB, #FF6B9D)'
                    : 'linear-gradient(180deg, #FFE8B8, #FFDDA0)',
                  borderRadius: '6px',
                  minHeight: '8px',
                  transition: 'height 0.5s ease'
                }} />
                <span style={{ fontSize: '9px', color: '#A89B8C' }}>{item.month.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recent activity */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '12px' }}>
        Letzte Aktivitäten
      </h3>
      {[
        { text: 'Neuer User registriert', time: 'vor 5 Min', icon: Users, color: '#7EB5E6' },
        { text: 'Content freigegeben', time: 'vor 12 Min', icon: Check, color: '#6BC9A0' },
        { text: 'Umsatz-Bericht generiert', time: 'vor 1 Std', icon: BarChart3, color: '#A78BFA' },
      ].map((item, i) => {
        const Icon = item.icon
        return (
          <Card key={i} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: `${item.color}15`,
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={16} color={item.color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#2A2420' }}>{item.text}</p>
            </div>
            <span style={{ fontSize: '12px', color: '#A89B8C' }}>{item.time}</span>
          </Card>
        )
      })}
    </div>
  )

  // ===== RENDER USERS =====
  const renderUsers = () => (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(42, 36, 32, 0.03)',
          border: '1.5px solid #E8DFD3',
          borderRadius: '14px',
          padding: '0 14px'
        }}>
          <Search size={18} color="#A89B8C" />
          <input
            type="text"
            placeholder="User suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1, padding: '12px 0',
              background: 'transparent', border: 'none',
              color: '#2A2420', fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
        <Button variant="ghost" onClick={loadUsers} style={{ padding: '12px' }}>
          <RefreshCw size={18} />
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Wartend', count: pendingUsers, color: '#F5C563' },
          { label: 'Aktiv', count: activeUsers, color: '#6BC9A0' },
          { label: 'Gesperrt', count: blockedUsers, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, textAlign: 'center',
            padding: '10px',
            background: `${s.color}10`,
            borderRadius: '12px',
            border: `1px solid ${s.color}25`
          }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>{s.count}</p>
            <p style={{ fontSize: '11px', color: '#7A6F62' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loadingUsers ? (
        <p style={{ textAlign: 'center', color: '#A89B8C', padding: '40px' }}>Laden...</p>
      ) : filteredUsers.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Users size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#A89B8C' }}>Keine User gefunden</p>
        </Card>
      ) : (
        filteredUsers.map(u => (
          <Card key={u.id} style={{ marginBottom: '10px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {u.photoURL ? (
                <img src={u.photoURL} alt="" style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '40px', height: '40px',
                  background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', color: '#5C5349', fontSize: '16px'
                }}>
                  {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.displayName || 'Kein Name'}
                </p>
                <p style={{ fontSize: '12px', color: '#A89B8C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.email}
                </p>
              </div>
              {/* Status Badge */}
              <span style={{
                fontSize: '11px', fontWeight: '600',
                padding: '4px 10px', borderRadius: '8px',
                background: u.blocked ? 'rgba(220, 38, 38, 0.1)' : u.approved ? 'rgba(107, 201, 160, 0.1)' : 'rgba(245, 197, 99, 0.1)',
                color: u.blocked ? '#DC2626' : u.approved ? '#6BC9A0' : '#F5C563',
              }}>
                {u.blocked ? 'Gesperrt' : u.approved ? 'Aktiv' : 'Wartend'}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px', justifyContent: 'flex-end' }}>
              {!u.approved && !u.blocked && (
                <button
                  onClick={() => approveUser(u.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '10px',
                    background: 'rgba(107, 201, 160, 0.1)',
                    border: '1px solid rgba(107, 201, 160, 0.3)',
                    color: '#6BC9A0', fontSize: '12px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Check size={14} /> Freischalten
                </button>
              )}
              <button
                onClick={() => blockUser(u.id)}
                style={{
                  padding: '6px 14px', borderRadius: '10px',
                  background: u.blocked ? 'rgba(107, 201, 160, 0.1)' : 'rgba(245, 197, 99, 0.1)',
                  border: `1px solid ${u.blocked ? 'rgba(107, 201, 160, 0.3)' : 'rgba(245, 197, 99, 0.3)'}`,
                  color: u.blocked ? '#6BC9A0' : '#F5C563',
                  fontSize: '12px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                {u.blocked ? <><Check size={14} /> Entsperren</> : <><Ban size={14} /> Sperren</>}
              </button>
              {u.email !== ADMIN_EMAIL && (
                <button
                  onClick={() => deleteUser(u.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '10px',
                    background: 'rgba(220, 38, 38, 0.08)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    color: '#DC2626', fontSize: '12px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Trash2 size={14} /> Löschen
                </button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  )

  // ===== RENDER CONTENT MODERATION =====
  const renderContent = () => (
    <div className="animate-fade-in">
      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
        {['Alle', 'Ausstehend', 'Freigegeben', 'Abgelehnt', 'Gemeldet'].map((filter, i) => (
          <button
            key={filter}
            style={{
              padding: '8px 16px', borderRadius: '20px',
              border: 'none', fontSize: '13px', fontWeight: '500',
              whiteSpace: 'nowrap',
              background: i === 0 ? 'linear-gradient(135deg, #FF8FAB, #FF6B9D)' : 'rgba(42, 36, 32, 0.04)',
              color: i === 0 ? 'white' : '#7A6F62',
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {contentItems.map(item => (
        <Card key={item.id} style={{
          marginBottom: '12px',
          borderLeft: item.flagged ? '3px solid #DC2626' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h4 style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{item.title}</h4>
                {item.flagged && <AlertTriangle size={14} color="#DC2626" />}
              </div>
              <p style={{ fontSize: '12px', color: '#A89B8C' }}>von {item.creator} • {item.date} • {item.type}</p>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: '600',
              padding: '4px 10px', borderRadius: '8px',
              background: item.status === 'approved' ? 'rgba(107, 201, 160, 0.1)' : item.status === 'rejected' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(245, 197, 99, 0.1)',
              color: item.status === 'approved' ? '#6BC9A0' : item.status === 'rejected' ? '#DC2626' : '#F5C563',
            }}>
              {item.status === 'approved' ? 'Freigegeben' : item.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              style={{
                padding: '6px 14px', borderRadius: '10px',
                background: 'rgba(42, 36, 32, 0.04)', border: '1px solid #E8DFD3',
                color: '#7A6F62', fontSize: '12px', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <Eye size={14} /> Ansehen
            </button>
            {item.status !== 'approved' && (
              <button
                onClick={() => updateContentStatus(item.id, 'approved')}
                style={{
                  padding: '6px 14px', borderRadius: '10px',
                  background: 'rgba(107, 201, 160, 0.1)', border: '1px solid rgba(107, 201, 160, 0.3)',
                  color: '#6BC9A0', fontSize: '12px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Check size={14} /> Freigeben
              </button>
            )}
            {item.status !== 'rejected' && (
              <button
                onClick={() => updateContentStatus(item.id, 'rejected')}
                style={{
                  padding: '6px 14px', borderRadius: '10px',
                  background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)',
                  color: '#DC2626', fontSize: '12px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <X size={14} /> Ablehnen
              </button>
            )}
            <button
              onClick={() => deleteContent(item.id)}
              style={{
                padding: '6px 14px', borderRadius: '10px',
                background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)',
                color: '#DC2626', fontSize: '12px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  )

  // ===== RENDER REVENUE =====
  const renderRevenue = () => (
    <div className="animate-fade-in">
      {/* Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <Card style={{ background: 'linear-gradient(135deg, rgba(107, 201, 160, 0.08), rgba(107, 201, 160, 0.03))' }}>
          <p style={{ fontSize: '12px', color: '#7A6F62', marginBottom: '4px' }}>Gesamt-Umsatz</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#2A2420' }}>€{(totalRevenue / 1000).toFixed(1)}k</p>
          <p style={{ fontSize: '12px', color: '#6BC9A0', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <TrendingUp size={12} /> 6 Monate
          </p>
        </Card>
        <Card style={{ background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.08), rgba(255, 107, 157, 0.03))' }}>
          <p style={{ fontSize: '12px', color: '#7A6F62', marginBottom: '4px' }}>Gesamt-Gewinn</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#2A2420' }}>€{(totalProfit / 1000).toFixed(1)}k</p>
          <p style={{ fontSize: '12px', color: '#FF6B9D', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <TrendingUp size={12} /> Marge: {((totalProfit / totalRevenue) * 100).toFixed(0)}%
          </p>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '12px' }}>
        Monatlicher Umsatz
      </h3>
      {REVENUE_DATA.slice().reverse().map((item, i) => (
        <Card key={i} style={{ marginBottom: '10px', padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{item.month}</p>
              <p style={{ fontSize: '12px', color: '#A89B8C' }}>Kosten: €{item.costs.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '700', color: '#2A2420', fontSize: '16px' }}>€{item.revenue.toLocaleString()}</p>
              <p style={{ fontSize: '12px', color: '#6BC9A0', fontWeight: '600' }}>
                Gewinn: €{item.profit.toLocaleString()}
              </p>
            </div>
          </div>
          {/* Profit bar */}
          <div style={{ height: '6px', background: 'rgba(42, 36, 32, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(item.profit / item.revenue) * 100}%`,
              background: 'linear-gradient(90deg, #6BC9A0, #4ade80)',
              borderRadius: '3px'
            }} />
          </div>
        </Card>
      ))}
    </div>
  )

  // ===== RENDER MAINTENANCE =====
  const renderMaintenance = () => (
    <div className="animate-fade-in">
      {/* Maintenance Toggle */}
      <Card style={{
        marginBottom: '20px',
        background: maintenanceMode
          ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.06), rgba(220, 38, 38, 0.02))'
          : 'linear-gradient(135deg, rgba(107, 201, 160, 0.06), rgba(107, 201, 160, 0.02))',
        border: `1px solid ${maintenanceMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(107, 201, 160, 0.2)'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: '700', color: '#2A2420', fontSize: '18px', marginBottom: '4px' }}>
              Wartungsmodus
            </h3>
            <p style={{ fontSize: '13px', color: '#7A6F62' }}>
              {maintenanceMode ? 'App ist offline für alle User' : 'App ist online und erreichbar'}
            </p>
          </div>
          <button
            onClick={toggleMaintenance}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: maintenanceMode ? '#DC2626' : '#6BC9A0',
              transition: 'all 0.3s'
            }}
          >
            {maintenanceMode ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
          </button>
        </div>
      </Card>

      {/* Maintenance Message */}
      <Card style={{ marginBottom: '20px' }}>
        <h4 style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px', marginBottom: '12px' }}>
          Wartungs-Nachricht
        </h4>
        <textarea
          value={maintenanceMessage}
          onChange={(e) => setMaintenanceMessage(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '14px',
            background: 'rgba(42, 36, 32, 0.03)',
            border: '1.5px solid #E8DFD3',
            borderRadius: '14px',
            color: '#2A2420',
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
            marginBottom: '12px'
          }}
          onFocus={(e) => e.target.style.borderColor = '#FF6B9D'}
          onBlur={(e) => e.target.style.borderColor = '#E8DFD3'}
        />
        <Button variant="cream" onClick={saveMaintenanceMessage} style={{ padding: '10px 20px' }}>
          Nachricht speichern
        </Button>
      </Card>

      {/* System Info */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '12px' }}>
        System-Info
      </h3>
      {[
        { label: 'Status', value: maintenanceMode ? 'Wartung' : 'Online', color: maintenanceMode ? '#DC2626' : '#6BC9A0' },
        { label: 'Registrierte User', value: users.length.toString(), color: '#2A2420' },
        { label: 'Freigeschaltete User', value: activeUsers.toString(), color: '#6BC9A0' },
        { label: 'Gesperrte User', value: blockedUsers.toString(), color: '#DC2626' },
        { label: 'Ausstehender Content', value: pendingContent.toString(), color: '#F5C563' },
      ].map(info => (
        <Card key={info.label} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
          <span style={{ fontSize: '14px', color: '#7A6F62' }}>{info.label}</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: info.color }}>{info.value}</span>
        </Card>
      ))}
    </div>
  )

  return (
    <div>
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px', background: 'rgba(42, 36, 32, 0.04)',
            border: '1px solid #E8DFD3', borderRadius: '12px',
            color: '#7A6F62', display: 'flex', alignItems: 'center'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>
            Admin Panel
          </h2>
          <p style={{ fontSize: '12px', color: '#A89B8C' }}>
            <Shield size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {user.email}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: '4px',
        marginBottom: '20px',
        overflowX: 'auto',
        padding: '4px',
        background: 'rgba(42, 36, 32, 0.03)',
        borderRadius: '16px'
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'white' : 'transparent',
                color: isActive ? '#FF6B9D' : '#A89B8C',
                fontSize: '11px',
                fontWeight: isActive ? '600' : '500',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'content' && renderContent()}
      {activeTab === 'revenue' && renderRevenue()}
      {activeTab === 'stats' && (
        <div className="animate-fade-in">
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '16px' }}>System-Statistik</h3>

          {/* Registration Chart */}
          <Card style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Users size={16} color="#7EB5E6" />
              <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Registrierungen (letzte 7 Tage)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
              {[3, 5, 2, 8, 4, 6, 7].map((val, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#7A6F62', fontWeight: '500' }}>{val}</span>
                  <div style={{
                    width: '100%', height: `${(val / 8) * 60}px`, minHeight: '4px',
                    background: i === 6 ? 'linear-gradient(180deg, #FF8FAB, #FF6B9D)' : 'linear-gradient(180deg, #7EB5E6, #5A9BD4)',
                    borderRadius: '4px', transition: 'height 0.5s ease',
                  }} />
                  <span style={{ fontSize: '9px', color: '#A89B8C' }}>{['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][i]}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Subscription Stats */}
          <Card style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Crown size={16} color="#F5C563" />
              <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Aktive Abonnements</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Free', count: Math.max(0, users.length - 8), color: '#A89B8C' },
                { label: 'Pro', count: 5, color: '#F5C563' },
                { label: 'Business', count: 3, color: '#FF6B9D' },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '12px', borderRadius: '12px',
                  background: `${s.color}08`, border: `1px solid ${s.color}20`,
                }}>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.count}</p>
                  <p style={{ fontSize: '11px', color: '#7A6F62', marginTop: '2px' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Server Status */}
          <Card style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Server size={16} color="#6BC9A0" />
              <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Server-Status</span>
            </div>
            {[
              { label: 'API-Server', status: 'Online', icon: Wifi, color: '#6BC9A0', latency: '42ms' },
              { label: 'Firebase Firestore', status: 'Online', icon: HardDrive, color: '#6BC9A0', latency: '18ms' },
              { label: 'Firebase Auth', status: 'Online', icon: Shield, color: '#6BC9A0', latency: '12ms' },
              { label: 'Stripe Gateway', status: 'Bereit', icon: Zap, color: '#F5C563', latency: '—' },
              { label: 'E-Mail-System', status: 'Konfiguriert', icon: Cpu, color: '#7EB5E6', latency: '—' },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0',
                  borderBottom: '1px solid rgba(232,223,211,0.3)',
                }}>
                  <Icon size={16} color={item.color} />
                  <span style={{ flex: 1, fontSize: '14px', color: '#2A2420' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', color: '#A89B8C', marginRight: '8px' }}>{item.latency}</span>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '8px',
                    background: `${item.color}10`, color: item.color, fontWeight: '600',
                  }}>{item.status}</span>
                </div>
              )
            })}
          </Card>

          {/* App Info */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Activity size={16} color="#9B8FE6" />
              <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>App-Info</span>
            </div>
            {[
              { label: 'Version', value: 'v6.0' },
              { label: 'Build', value: 'Production' },
              { label: 'Framework', value: 'React 19 + Vite 7' },
              { label: 'Database', value: 'Firebase Firestore' },
              { label: 'Hosting', value: 'Vercel' },
              { label: 'PWA', value: 'Aktiv' },
              { label: 'Security Level', value: 'High' },
              { label: 'E-Mail System', value: 'Konfiguriert (SendGrid)' },
              { label: 'Billing', value: 'Stripe (Demo-Modus)' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                borderBottom: '1px solid rgba(232,223,211,0.2)',
              }}>
                <span style={{ fontSize: '13px', color: '#7A6F62' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#2A2420' }}>{item.value}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
      {activeTab === 'maintenance' && renderMaintenance()}
    </div>
  )
}

export default Admin
