import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Kanban, Calendar, MessageCircle,
  Sparkles, Settings, Building2,
  Menu, X, HelpCircle, FileText, Scale, Shield
} from 'lucide-react'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import NotificationBell from './NotificationBell'

const ADMIN_EMAIL = 'yunghundse@gmail.com'

const ROLE_COLORS = {
  admin: '#FF6B9D',
  manager: '#F5C563',
  model: '#FF6B9D',
}

const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  model: 'Model',
}

// Simplified navigation: only core features in bottom nav
// Manager: Home, Team, Kalender, Content, Chat
// Model: Home, Team, Kalender, Content, Chat
// Admin: Home, Kalender, Content, Chat, Admin
const ROLE_NAV = {
  admin: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/kalender', icon: Calendar, label: 'Kalender' },
    { path: '/content', icon: Kanban, label: 'Content' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/admin', icon: Shield, label: 'Admin' },
  ],
  manager: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/firma/dashboard', icon: Building2, label: 'Mein Team', requiresCompany: true },
    { path: '/kalender', icon: Calendar, label: 'Kalender' },
    { path: '/content', icon: Kanban, label: 'Content' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
  ],
  model: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/firma/dashboard', icon: Building2, label: 'Mein Team', requiresCompany: true },
    { path: '/kalender', icon: Calendar, label: 'Kalender' },
    { path: '/content', icon: Kanban, label: 'Content' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
  ],
}

// Extra items for sidebar menu (less important / secondary)
const SIDEBAR_EXTRA = {
  admin: [
    { path: '/firma/assets', icon: FileText, label: 'Firma Assets' },
    { path: '/firma/tasks', icon: FileText, label: 'Aufgaben' },
    { path: '/finanzen', label: 'Finanzen', icon: FileText },
    { path: '/einstellungen', label: 'Einstellungen', icon: Settings },
    { path: '/dashboard/pricing', label: 'Preise & Pläne', icon: FileText },
    { path: '/dashboard/subscription', label: 'Abo', icon: FileText },
    { path: '/legal/impressum', label: 'Impressum', icon: Scale },
    { path: '/legal/agb', label: 'AGB', icon: FileText },
    { path: '/legal/datenschutz', label: 'Datenschutz', icon: Shield },
  ],
  manager: [
    { path: '/firma/assets', icon: FileText, label: 'Firma Assets', requiresCompany: true },
    { path: '/firma/tasks', icon: FileText, label: 'Aufgaben', requiresCompany: true },
    { path: '/firma/admin', icon: Shield, label: 'Team verwalten', requiresCompany: true },
    { path: '/finanzen', label: 'Finanzen', icon: FileText },
    { path: '/einstellungen', label: 'Einstellungen', icon: Settings },
    { path: '/dashboard/pricing', label: 'Preise & Pläne', icon: FileText },
    { path: '/dashboard/subscription', label: 'Abo', icon: FileText },
    { path: '/legal/impressum', label: 'Impressum', icon: Scale },
    { path: '/legal/agb', label: 'AGB', icon: FileText },
    { path: '/legal/datenschutz', label: 'Datenschutz', icon: Shield },
  ],
  model: [
    { path: '/firma/assets', icon: FileText, label: 'Firma Assets', requiresCompany: true },
    { path: '/firma/tasks', icon: FileText, label: 'Aufgaben', requiresCompany: true },
    { path: '/finanzen', label: 'Finanzen', icon: FileText },
    { path: '/einstellungen', label: 'Einstellungen', icon: Settings },
    { path: '/dashboard/subscription', label: 'Abo', icon: FileText },
    { path: '/legal/impressum', label: 'Impressum', icon: Scale },
    { path: '/legal/agb', label: 'AGB', icon: FileText },
    { path: '/legal/datenschutz', label: 'Datenschutz', icon: Shield },
  ],
}

const Layout = ({ children, user, userData }) => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [companyName, setCompanyName] = useState(null)

  const isAdmin = user?.email === ADMIN_EMAIL
  const role = isAdmin ? 'admin' : (userData?.role || 'model')
  const roleColor = ROLE_COLORS[role]
  const hasCompany = !!userData?.companyId

  // Bottom nav items (core only)
  const rawNavItems = ROLE_NAV[role] || ROLE_NAV.model
  const navItems = rawNavItems.filter(item => {
    if (item.requiresCompany && !hasCompany) return false
    return true
  })

  // Sidebar extra items
  const rawSidebarItems = SIDEBAR_EXTRA[role] || SIDEBAR_EXTRA.model
  const sidebarItems = rawSidebarItems.filter(item => {
    if (item.requiresCompany && !hasCompany) return false
    return true
  })

  // Dynamic label: replace "Mein Team" with company name
  const displayNavItems = navItems.map(item => {
    if (item.requiresCompany && companyName) {
      return { ...item, label: companyName.length > 10 ? companyName.slice(0, 10) + '…' : companyName }
    }
    return item
  })

  // Load company name
  React.useEffect(() => {
    if (!userData?.companyId) { setCompanyName(null); return }
    getDoc(doc(db, 'companies', userData.companyId)).then(snap => {
      if (snap.exists()) setCompanyName(snap.data().name)
    }).catch(() => {})
  }, [userData?.companyId])

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
            {/* Sidebar toggle */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              padding: '8px', background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)',
              borderRadius: '10px', color: '#7A6F62', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
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
            <NotificationBell />
            {/* Status Badge */}
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
            </div>
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

      {/* Sidebar overlay */}
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

            {/* Main Nav in sidebar too */}
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#A89B8C', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px' }}>Hauptmenü</p>
            {displayNavItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={() => setSidebarOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
                    borderRadius: '12px', marginBottom: '2px', textDecoration: 'none',
                    background: isActive ? `${roleColor}12` : 'transparent',
                    color: isActive ? roleColor : '#7A6F62',
                    fontWeight: isActive ? '600' : '400', fontSize: '14px',
                  })}>
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}

            {/* Divider */}
            <div style={{ height: '1px', background: '#E8DFD3', margin: '14px 0' }} />

            {/* Secondary nav */}
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#A89B8C', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px' }}>Weitere</p>
            {sidebarItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
                    borderRadius: '12px', marginBottom: '2px', textDecoration: 'none',
                    background: isActive ? `${roleColor}12` : 'transparent',
                    color: isActive ? roleColor : '#7A6F62',
                    fontWeight: isActive ? '600' : '400', fontSize: '14px',
                  })}>
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}

            {/* Help */}
            <div style={{ height: '1px', background: '#E8DFD3', margin: '14px 0' }} />
            <NavLink to="/onboarding" onClick={() => setSidebarOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '12px', textDecoration: 'none', color: '#7EB5E6', fontSize: '14px' }}>
              <HelpCircle size={18} />
              Hilfe & Einweisung
            </NavLink>
          </div>
        </>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '20px 20px 110px' }}>
        <div className="page-transition">
          {children}
        </div>
      </main>

      {/* Bottom Navigation — only core items */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255, 253, 247, 0.92)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(232, 223, 211, 0.5)',
        padding: '10px 20px 26px',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', justifyContent: 'space-around' }}>
          {displayNavItems.map(item => {
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
