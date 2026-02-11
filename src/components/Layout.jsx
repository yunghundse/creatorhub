import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Kanban, PieChart, Calendar, MessageCircle,
  Sparkles, Settings, Shield, Building2, Users,
  BarChart3, Upload, Video, Scissors, TrendingUp,
  ListTodo, Menu, X, DollarSign, CheckCircle,
  Briefcase, FileText, Timer, Layers, HelpCircle, Flame
} from 'lucide-react'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

const ADMIN_EMAIL = 'yunghundse@gmail.com'

// Role-based navigation config
const ROLE_NAV = {
  admin: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/dashboard/trends', icon: TrendingUp, label: 'Trends' },
    { path: '/dashboard/audit-log', icon: FileText, label: 'Audit' },
    { path: '/content', icon: Kanban, label: 'Content' },
    { path: '/finanzen', icon: PieChart, label: 'Finanzen' },
    { path: '/kalender', icon: Calendar, label: 'Kalender' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/admin', icon: Shield, label: 'Admin' },
    { path: '/fyp', icon: Flame, label: 'FYP' },
  ],
  manager: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard/company', icon: Building2, label: 'Firma' },
    { path: '/dashboard/approvals', icon: CheckCircle, label: 'Freigaben' },
    { path: '/dashboard/revenue', icon: DollarSign, label: 'Revenue' },
    { path: '/dashboard/brand-deals', icon: Briefcase, label: 'Deals' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/dashboard/trends', icon: TrendingUp, label: 'Trends' },
    { path: '/dashboard/assets', icon: Upload, label: 'Assets' },
    { path: '/dashboard/audit-log', icon: FileText, label: 'Audit' },
    { path: '/kalender', icon: Calendar, label: 'Kalender' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/fyp', icon: Flame, label: 'FYP' },
  ],
  model: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard/approvals', icon: CheckCircle, label: 'Freigaben' },
    { path: '/dashboard/schedule', icon: Calendar, label: 'Kalender' },
    { path: '/dashboard/assets', icon: Upload, label: 'Assets' },
    { path: '/content', icon: Kanban, label: 'Content' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/finanzen', icon: PieChart, label: 'Finanzen' },
    { path: '/fyp', icon: Flame, label: 'FYP' },
  ],
  influencer: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard/collab', icon: ListTodo, label: 'Collab' },
    { path: '/dashboard/deadlines', icon: Timer, label: 'Deadlines' },
    { path: '/dashboard/trends', icon: TrendingUp, label: 'Trends' },
    { path: '/dashboard/asset-library', icon: Layers, label: 'Library' },
    { path: '/dashboard/assets', icon: Upload, label: 'Assets' },
    { path: '/content', icon: Kanban, label: 'Content' },
    { path: '/kalender', icon: Calendar, label: 'Kalender' },
    { path: '/finanzen', icon: PieChart, label: 'Finanzen' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/fyp', icon: Flame, label: 'FYP' },
  ],
  cutter: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard/collab', icon: ListTodo, label: 'Aufträge' },
    { path: '/dashboard/deadlines', icon: Timer, label: 'Deadlines' },
    { path: '/dashboard/asset-library', icon: Layers, label: 'Library' },
    { path: '/dashboard/assets', icon: Upload, label: 'Assets' },
    { path: '/kalender', icon: Calendar, label: 'Kalender' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/finanzen', icon: PieChart, label: 'Finanzen' },
    { path: '/fyp', icon: Flame, label: 'FYP' },
  ],
}

const ROLE_COLORS = {
  admin: '#FF6B9D',
  manager: '#F5C563',
  model: '#FF6B9D',
  influencer: '#7EB5E6',
  cutter: '#6BC9A0',
}

const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  model: 'Model',
  influencer: 'Influencer',
  cutter: 'Cutter',
}

const Layout = ({ children, user, userData }) => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [companyName, setCompanyName] = useState(null)

  const isAdmin = user?.email === ADMIN_EMAIL
  const role = isAdmin ? 'admin' : (userData?.role || 'influencer')
  const navItems = ROLE_NAV[role] || ROLE_NAV.influencer
  const roleColor = ROLE_COLORS[role]

  // Load company name for team header
  React.useEffect(() => {
    if (!userData?.companyId) return
    getDoc(doc(db, 'companies', userData.companyId)).then(snap => {
      if (snap.exists()) setCompanyName(snap.data().name)
    }).catch(() => {})
  }, [userData?.companyId])

  // Mobile: show max 5 items in bottom nav
  const bottomNavItems = navItems.slice(0, 5)
  const moreItems = navItems.slice(5)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FFFDF7 0%, #FFF9EB 30%, #FBF7F2 100%)' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255, 253, 247, 0.85)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(232, 223, 211, 0.5)',
        padding: '14px 20px',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Sidebar toggle for extra items */}
            {moreItems.length > 0 && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                padding: '8px', background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)',
                borderRadius: '10px', color: '#7A6F62', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #FF8FAB 0%, #FF6B9D 100%)',
              borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 107, 157, 0.25)'
            }}>
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420', margin: 0, letterSpacing: '-0.3px' }}>creatorhub</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Status Badge — oben rechts */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '10px',
              background: `${roleColor}10`, border: `1px solid ${roleColor}25`,
            }}>
              <span style={{ fontSize: '11px', color: roleColor, fontWeight: '700' }}>{ROLE_LABELS[role]}</span>
              {companyName && (
                <>
                  <span style={{ fontSize: '9px', color: '#C4B8A8' }}>|</span>
                  <span style={{ fontSize: '11px', color: '#7A6F62', fontWeight: '500', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{companyName}</span>
                </>
              )}
              {userData?.abo && userData.abo !== 'free' && (
                <>
                  <span style={{ fontSize: '9px', color: '#C4B8A8' }}>|</span>
                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245,197,99,0.2)', color: '#E8A940', fontWeight: '700', textTransform: 'uppercase' }}>{userData.abo}</span>
                </>
              )}
            </div>
            <button onClick={() => navigate('/onboarding')} title="Einweisung" style={{
              padding: '10px', background: 'rgba(126,181,230,0.08)',
              border: '1px solid rgba(126,181,230,0.2)', borderRadius: '12px',
              color: '#7EB5E6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <HelpCircle size={18} />
            </button>
            <button onClick={() => navigate('/einstellungen')} style={{
              padding: '10px', background: 'rgba(42, 36, 32, 0.04)',
              border: '1px solid rgba(232, 223, 211, 0.6)', borderRadius: '12px',
              color: '#7A6F62', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Settings size={18} />
            </button>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '12px', border: `2px solid ${roleColor}40`, objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '36px', height: '36px', background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)',
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#5C5349', fontWeight: '700', fontSize: '14px'
              }}>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar overlay for extra nav items */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 150, backdropFilter: 'blur(4px)',
          }} />
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', zIndex: 200,
            background: '#FFFDF7', borderRight: '1px solid rgba(232,223,211,0.5)',
            padding: '20px', paddingTop: '80px', overflowY: 'auto',
            boxShadow: '4px 0 30px rgba(0,0,0,0.1)',
          }} className="animate-fade-in">
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#A89B8C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Navigation</p>
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={() => setSidebarOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    borderRadius: '14px', marginBottom: '4px', textDecoration: 'none',
                    background: isActive ? `${roleColor}12` : 'transparent',
                    color: isActive ? roleColor : '#7A6F62',
                    fontWeight: isActive ? '600' : '400', fontSize: '15px',
                  })}>
                  <Icon size={20} />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '20px 20px 110px' }}>
        <div className="page-transition">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255, 253, 247, 0.92)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(232, 223, 211, 0.5)',
        padding: '10px 20px 26px',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', justifyContent: 'space-around' }}>
          {bottomNavItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '8px 14px', borderRadius: '14px', textDecoration: 'none',
                  background: isActive ? `${roleColor}14` : 'transparent',
                  color: isActive ? roleColor : '#A89B8C',
                  transition: 'all 0.25s ease',
                })}>
                {({ isActive }) => (
                  <>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    <span style={{ fontSize: '11px', fontWeight: isActive ? '600' : '400', letterSpacing: '0.2px' }}>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Layout
