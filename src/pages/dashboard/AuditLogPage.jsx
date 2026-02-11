import React, { useState, useEffect } from 'react'
import { Shield, Clock, User, FileText, Filter } from 'lucide-react'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase'
import Card from '../../components/Card'

const ACTION_CONFIG = {
  login: { label: 'Login', color: '#7EB5E6', icon: '🔑' },
  content_upload: { label: 'Content Upload', color: '#6BC9A0', icon: '📤' },
  content_approved: { label: 'Content Freigabe', color: '#6BC9A0', icon: '✅' },
  content_rejected: { label: 'Content Abgelehnt', color: '#DC2626', icon: '❌' },
  asset_added: { label: 'Asset hinzugefügt', color: '#B48EE0', icon: '📁' },
  task_created: { label: 'Task erstellt', color: '#E8A940', icon: '📋' },
  task_updated: { label: 'Task aktualisiert', color: '#E8A940', icon: '🔄' },
  deal_created: { label: 'Deal erstellt', color: '#FF6B9D', icon: '🤝' },
  deal_updated: { label: 'Deal aktualisiert', color: '#FF6B9D', icon: '📝' },
  revenue_added: { label: 'Revenue eingetragen', color: '#F5C563', icon: '💰' },
  calendar_event: { label: 'Kalender Event', color: '#7EB5E6', icon: '📅' },
  settings_changed: { label: 'Einstellung geändert', color: '#A89B8C', icon: '⚙️' },
  member_joined: { label: 'Mitglied beigetreten', color: '#6BC9A0', icon: '👋' },
  member_removed: { label: 'Mitglied entfernt', color: '#DC2626', icon: '🚪' },
}

const AuditLogPage = ({ userData }) => {
  const [logs, setLogs] = useState([])
  const [filterAction, setFilterAction] = useState('all')
  const [maxItems, setMaxItems] = useState(50)

  useEffect(() => {
    if (!userData?.companyId) return
    const q = query(
      collection(db, 'auditLogs'),
      where('companyId', '==', userData.companyId),
      orderBy('timestamp', 'desc'),
      limit(maxItems)
    )
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, (err) => {
      // Index might not exist yet — show empty
      console.log('AuditLog query needs index:', err.message)
      setLogs([])
    })
    return () => unsub()
  }, [userData, maxItems])

  const filtered = filterAction === 'all' ? logs : logs.filter(l => l.action === filterAction)

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Gerade eben'
    if (diff < 3600000) return `vor ${Math.floor(diff / 60000)} Min`
    if (diff < 86400000) return `vor ${Math.floor(diff / 3600000)} Std`
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  // Get unique action types from logs
  const actionTypes = [...new Set(logs.map(l => l.action))].filter(Boolean)

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={22} color="#7EB5E6" /> Audit Log
        </h2>
        <p style={{ color: '#A89B8C', fontSize: '14px' }}>Wer hat wann was geändert</p>
      </div>

      {/* Filter */}
      {actionTypes.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button onClick={() => setFilterAction('all')} style={{
            padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '500',
            background: filterAction === 'all' ? 'rgba(126,181,230,0.15)' : 'rgba(42,36,32,0.04)',
            color: filterAction === 'all' ? '#7EB5E6' : '#7A6F62', cursor: 'pointer', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}><Filter size={12} /> Alle</button>
          {actionTypes.map(action => {
            const cfg = ACTION_CONFIG[action] || { label: action, color: '#A89B8C', icon: '📌' }
            return (
              <button key={action} onClick={() => setFilterAction(action)} style={{
                padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '500',
                background: filterAction === action ? `${cfg.color}18` : 'rgba(42,36,32,0.04)',
                color: filterAction === action ? cfg.color : '#7A6F62', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{cfg.icon} {cfg.label}</button>
            )
          })}
        </div>
      )}

      {/* Log Entries */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <FileText size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#A89B8C', fontSize: '14px' }}>Noch keine Aktivitäten aufgezeichnet.</p>
          <p style={{ color: '#C4B8A8', fontSize: '12px', marginTop: '8px' }}>Logs werden automatisch erstellt, wenn Team-Mitglieder Aktionen durchführen.</p>
        </Card>
      ) : (
        <>
          {filtered.map((log, idx) => {
            const cfg = ACTION_CONFIG[log.action] || { label: log.action, color: '#A89B8C', icon: '📌' }
            const isLast = idx === filtered.length - 1
            return (
              <div key={log.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                {/* Timeline line */}
                {!isLast && (
                  <div style={{
                    position: 'absolute', left: '17px', top: '36px', bottom: '-8px',
                    width: '2px', background: '#E8DFD3',
                  }} />
                )}
                {/* Icon */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: `${cfg.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', zIndex: 1,
                }}>
                  {cfg.icon}
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{cfg.label}</span>
                    <span style={{ fontSize: '11px', color: '#A89B8C' }}>{formatTime(log.timestamp)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7A6F62' }}>
                    <User size={12} />
                    <span>{log.userName || 'Unbekannt'}</span>
                    {log.target && (
                      <>
                        <span style={{ color: '#C4B8A8' }}>•</span>
                        <span>{log.target}</span>
                      </>
                    )}
                  </div>
                  {log.details && <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '4px' }}>{log.details}</p>}
                </div>
              </div>
            )
          })}

          {logs.length >= maxItems && (
            <button onClick={() => setMaxItems(maxItems + 50)} style={{
              width: '100%', padding: '12px', background: 'rgba(42,36,32,0.04)', border: 'none',
              borderRadius: '12px', color: '#7A6F62', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              marginTop: '8px',
            }}>Mehr laden...</button>
          )}
        </>
      )}
    </div>
  )
}

export default AuditLogPage
