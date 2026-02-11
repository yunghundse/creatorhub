import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { Sparkles, Wrench } from 'lucide-react'

import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Content from './pages/Content'
import Finance from './pages/Finance'
import CalendarPage from './pages/CalendarPage'
import Chat from './pages/Chat'
import SettingsPage from './pages/SettingsPage'
import Admin from './pages/Admin'

// Dashboard pages
import CompanyPage from './pages/dashboard/CompanyPage'
import CollabPage from './pages/dashboard/CollabPage'
import TrendsPage from './pages/dashboard/TrendsPage'
import AssetsPage from './pages/dashboard/AssetsPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import RevenueSharePage from './pages/dashboard/RevenueSharePage'
import ApprovalQueuePage from './pages/dashboard/ApprovalQueuePage'
import AssetLibraryPage from './pages/dashboard/AssetLibraryPage'
import BrandDealsPage from './pages/dashboard/BrandDealsPage'
import AuditLogPage from './pages/dashboard/AuditLogPage'
import DeadlinesPage from './pages/dashboard/DeadlinesPage'
import PricingPage from './pages/dashboard/PricingPage'
import OnboardingPage from './pages/OnboardingPage'
import FYPPage from './pages/FYPPage'

const ADMIN_EMAIL = 'yunghundse@gmail.com'

const ProtectedRoute = ({ user, userData, maintenanceMode, maintenanceMessage, children }) => {
  if (!user) return <Navigate to="/login" replace />
  const isAdmin = user.email === ADMIN_EMAIL

  if (maintenanceMode && !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)' }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }} className="animate-fade-in-up">
          <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #F5C563, #E8A940)', borderRadius: '22px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(245,197,99,0.3)' }}>
            <Wrench size={28} color="white" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '10px' }}>Wartungsarbeiten</h2>
          <p style={{ color: '#7A6F62', fontSize: '15px', lineHeight: '1.6' }}>{maintenanceMessage || 'Die App wird gerade gewartet.'}</p>
        </div>
      </div>
    )
  }

  if (!isAdmin && userData && !userData.approved) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)' }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }} className="animate-fade-in-up">
          <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #F5C563, #E8A940)', borderRadius: '22px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(245,197,99,0.3)' }}>
            <span style={{ fontSize: '30px' }}>⏳</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '10px' }}>Warten auf Freischaltung</h2>
          <p style={{ color: '#7A6F62', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>Dein Account wurde erstellt. Ein Admin muss dich noch freischalten.</p>
          <button onClick={() => auth.signOut()} style={{ padding: '12px 24px', background: 'rgba(255,107,157,0.08)', border: '1.5px solid rgba(255,107,157,0.2)', borderRadius: '14px', color: '#FF6B9D', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Abmelden</button>
        </div>
      </div>
    )
  }

  if (userData && userData.blocked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)' }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }} className="animate-fade-in-up">
          <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #DC2626, #B91C1C)', borderRadius: '22px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(220,38,38,0.3)' }}>
            <span style={{ fontSize: '30px' }}>🚫</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '10px' }}>Account gesperrt</h2>
          <p style={{ color: '#7A6F62', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>Dein Account wurde gesperrt.</p>
          <button onClick={() => auth.signOut()} style={{ padding: '12px 24px', background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: '14px', color: '#DC2626', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Abmelden</button>
        </div>
      </div>
    )
  }

  return <Layout user={user} userData={userData}>{children}</Layout>
}

// Role guard: only allow specific roles
const RoleGuard = ({ userData, allowed, children }) => {
  const role = userData?.role
  if (!allowed.includes(role) && role !== 'admin') return <Navigate to="/" replace />
  return children
}

function App() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const userSnap = await getDoc(doc(db, 'users', currentUser.uid))
          if (userSnap.exists()) {
            setUserData(userSnap.data())
          } else if (currentUser.email === ADMIN_EMAIL) {
            setUserData({ approved: true, blocked: false, role: 'admin' })
          } else {
            setUserData({ approved: false, blocked: false, role: 'user' })
          }
        } catch (err) {
          console.error('Error loading user data:', err)
          if (currentUser.email === ADMIN_EMAIL) setUserData({ approved: true, blocked: false, role: 'admin' })
        }
        try {
          const maintSnap = await getDoc(doc(db, 'settings', 'maintenance'))
          if (maintSnap.exists()) {
            setMaintenanceMode(maintSnap.data().enabled || false)
            setMaintenanceMessage(maintSnap.data().message || '')
          }
        } catch (err) { console.error('Maintenance check error:', err) }
      } else {
        setUserData(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #FFFDF7 0%, #FFF3D6 30%, #FFE8B8 60%, #FFF9EB 100%)' }}>
        <div style={{ textAlign: 'center' }} className="animate-fade-in">
          <div className="animate-float" style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #FF8FAB, #FF6B9D)', borderRadius: '22px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(255,107,157,0.3)' }}>
            <Sparkles size={28} color="white" />
          </div>
          <p style={{ color: '#A89B8C', fontWeight: '500', fontSize: '15px' }}>creatorhub lädt...</p>
        </div>
      </div>
    )
  }

  const pp = { user, userData, maintenanceMode, maintenanceMessage }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Core routes */}
      <Route path="/" element={<ProtectedRoute {...pp}><Home userData={userData} /></ProtectedRoute>} />
      <Route path="/content" element={<ProtectedRoute {...pp}><Content /></ProtectedRoute>} />
      <Route path="/finanzen" element={<ProtectedRoute {...pp}><Finance /></ProtectedRoute>} />
      <Route path="/kalender" element={<ProtectedRoute {...pp}><CalendarPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute {...pp}><Chat /></ProtectedRoute>} />
      <Route path="/einstellungen" element={<ProtectedRoute {...pp}><SettingsPage user={user} /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute {...pp}><OnboardingPage userData={userData} /></ProtectedRoute>} />
      <Route path="/fyp" element={<ProtectedRoute {...pp}><FYPPage userData={userData} /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute {...pp}><Admin user={user} /></ProtectedRoute>} />

      {/* Dashboard routes — role-gated */}
      <Route path="/dashboard/company" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['manager']}><CompanyPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/models" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['manager']}><CompanyPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/collab" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['influencer', 'cutter']}><CollabPage userData={userData} /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/trends" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['manager', 'influencer']}><TrendsPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/assets" element={<ProtectedRoute {...pp}><AssetsPage userData={userData} /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['manager']}><AnalyticsPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/schedule" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['model']}><CalendarPage /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/revenue" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['manager']}><RevenueSharePage userData={userData} /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/approvals" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['manager', 'model']}><ApprovalQueuePage userData={userData} /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/asset-library" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['influencer', 'cutter']}><AssetLibraryPage userData={userData} /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/brand-deals" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['manager']}><BrandDealsPage userData={userData} /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/audit-log" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['manager']}><AuditLogPage userData={userData} /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/deadlines" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['influencer', 'cutter']}><DeadlinesPage userData={userData} /></RoleGuard></ProtectedRoute>} />
      <Route path="/dashboard/pricing" element={<ProtectedRoute {...pp}><RoleGuard userData={userData} allowed={['manager']}><PricingPage userData={userData} /></RoleGuard></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
