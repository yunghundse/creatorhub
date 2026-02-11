import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCheck, ArrowLeft, Shield, Eye, EyeOff, Users, Clock, Activity, AlertTriangle, Lock, CheckCircle } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const DEMO_MODELS = [
  { id: 1, name: 'Lisa M.', platform: 'OnlyFans', status: 'online', unread: 14, lastActive: 'Jetzt' },
  { id: 2, name: 'Sarah K.', platform: 'OnlyFans', status: 'offline', unread: 3, lastActive: 'Vor 2h' },
  { id: 3, name: 'Julia R.', platform: 'Instagram', status: 'online', unread: 7, lastActive: 'Jetzt' },
]

const ACTIVITY_LOG = [
  { time: '14:32', action: 'Nachricht beantwortet', model: 'Lisa M.', by: 'Manager (Ghost)' },
  { time: '14:15', action: 'DM gelesen (5 Nachrichten)', model: 'Lisa M.', by: 'Manager (Ghost)' },
  { time: '13:50', action: 'Eingeloggt (Ghost-Mode)', model: 'Sarah K.', by: 'Manager (Ghost)' },
  { time: '13:45', action: 'PPV-Nachricht gesendet', model: 'Sarah K.', by: 'Manager (Ghost)' },
  { time: '12:00', action: 'Session beendet', model: 'Sarah K.', by: 'Manager (Ghost)' },
]

const GhostModePage = ({ userData }) => {
  const navigate = useNavigate()
  const [activeSession, setActiveSession] = useState(null)
  const [showLog, setShowLog] = useState(false)

  const startSession = (model) => {
    setActiveSession(model)
  }

  const endSession = () => {
    setActiveSession(null)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/premium')} style={{
          padding: '10px', background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)',
          borderRadius: '12px', color: '#7A6F62', cursor: 'pointer', display: 'flex',
        }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Ghost-Mode</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Manager-Zugriff mit getrennten Logs</p>
        </div>
        <span style={{
          marginLeft: 'auto', padding: '4px 10px', borderRadius: '8px',
          background: 'rgba(245,197,99,0.1)', color: '#F5C563', fontSize: '11px', fontWeight: '700',
        }}>PREVIEW</span>
      </div>

      {/* Security Notice */}
      <Card style={{
        marginBottom: '16px', padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(107,201,160,0.08), rgba(107,201,160,0.04))',
        border: '1px solid rgba(107,201,160,0.15)',
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Shield size={18} color="#6BC9A0" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px', marginBottom: '2px' }}>Getrennte Audit-Logs</p>
            <p style={{ fontSize: '12px', color: '#7A6F62', lineHeight: '1.5' }}>
              Alle Aktionen im Ghost-Mode werden separat protokolliert. Das Model bleibt eingeloggt und wird nicht gestört.
            </p>
          </div>
        </div>
      </Card>

      {/* Active Session */}
      {activeSession && (
        <Card style={{
          marginBottom: '16px', padding: '16px',
          background: 'linear-gradient(135deg, rgba(126,181,230,0.08), rgba(126,181,230,0.04))',
          border: '1.5px solid rgba(126,181,230,0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7EB5E6, #5A9BD4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Eye size={20} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: '700', color: '#2A2420', fontSize: '15px' }}>Ghost-Session aktiv</p>
                <p style={{ fontSize: '13px', color: '#7EB5E6' }}>{activeSession.name} — {activeSession.platform}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Activity size={12} color="#6BC9A0" />
                  <span style={{ fontSize: '11px', color: '#6BC9A0' }}>Verbunden seit 3 Min.</span>
                </div>
              </div>
            </div>
            <button onClick={endSession} style={{
              padding: '8px 14px', borderRadius: '10px', border: 'none',
              background: 'rgba(220,38,38,0.08)', color: '#DC2626',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}>Beenden</button>
          </div>
        </Card>
      )}

      {/* Model List */}
      <h3 style={{
        fontSize: '15px', fontWeight: '600', color: '#2A2420', marginBottom: '12px',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <Users size={16} color="#7EB5E6" /> Verfügbare Accounts
      </h3>

      {DEMO_MODELS.map(model => (
        <Card key={model.id} style={{
          marginBottom: '10px', padding: '14px 16px',
          opacity: activeSession && activeSession.id !== model.id ? 0.5 : 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '16px', color: '#5C5349',
                position: 'relative',
              }}>
                {model.name.charAt(0)}
                <div style={{
                  position: 'absolute', bottom: '-1px', right: '-1px',
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: model.status === 'online' ? '#6BC9A0' : '#A89B8C',
                  border: '2px solid white',
                }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{model.name}</span>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                    background: 'rgba(155,143,230,0.1)', color: '#9B8FE6',
                  }}>{model.platform}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#A89B8C' }}>{model.lastActive}</span>
                  {model.unread > 0 && (
                    <span style={{ fontSize: '11px', color: '#FF6B9D', fontWeight: '600' }}>{model.unread} ungelesen</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => startSession(model)}
              disabled={activeSession !== null}
              style={{
                padding: '8px 14px', borderRadius: '10px', border: 'none',
                background: activeSession ? 'rgba(42,36,32,0.04)' : 'rgba(126,181,230,0.1)',
                color: activeSession ? '#A89B8C' : '#7EB5E6',
                fontSize: '12px', fontWeight: '600', cursor: activeSession ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <EyeOff size={14} /> Ghost
            </button>
          </div>
        </Card>
      ))}

      {/* Activity Log Toggle */}
      <button onClick={() => setShowLog(!showLog)} style={{
        width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(232,223,211,0.4)',
        background: 'rgba(42,36,32,0.02)', cursor: 'pointer', marginTop: '16px', marginBottom: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        color: '#7A6F62', fontSize: '13px', fontWeight: '500',
      }}>
        <Clock size={14} /> Ghost-Session Log {showLog ? 'ausblenden' : 'anzeigen'}
      </button>

      {showLog && (
        <div className="animate-fade-in">
          {ACTIVITY_LOG.map((log, i) => (
            <div key={i} style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              padding: '10px 0', borderBottom: '1px solid rgba(232,223,211,0.2)',
            }}>
              <span style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500', minWidth: '40px' }}>{log.time}</span>
              <div>
                <p style={{ fontSize: '13px', color: '#2A2420' }}>{log.action}</p>
                <p style={{ fontSize: '11px', color: '#A89B8C' }}>{log.model} — {log.by}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#A89B8C', marginTop: '16px' }}>
        Echte Account-Verbindung und DM-Verwaltung werden mit dem Business-Plan verfügbar.
      </p>
    </div>
  )
}

export default GhostModePage
