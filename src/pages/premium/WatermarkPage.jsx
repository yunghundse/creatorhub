import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stamp, ArrowLeft, Shield, Eye, EyeOff, Image, Settings, CheckCircle, Sparkles } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const WatermarkPage = ({ userData }) => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    enabled: true,
    position: 'center',
    opacity: 40,
    text: 'CREATORHUB PREVIEW',
    autoApply: true,
    removeOnApproval: true,
  })
  const [saved, setSaved] = useState(false)

  const POSITIONS = [
    { id: 'top-left', label: 'Oben Links' },
    { id: 'top-right', label: 'Oben Rechts' },
    { id: 'center', label: 'Mittig' },
    { id: 'bottom-left', label: 'Unten Links' },
    { id: 'bottom-right', label: 'Unten Rechts' },
    { id: 'diagonal', label: 'Diagonal' },
  ]

  const saveSettings = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Auto-Watermark</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Content-Schutz bis zur Freigabe</p>
        </div>
        <span style={{
          marginLeft: 'auto', padding: '4px 10px', borderRadius: '8px',
          background: 'rgba(245,197,99,0.1)', color: '#F5C563', fontSize: '11px', fontWeight: '700',
        }}>PREVIEW</span>
      </div>

      {/* Preview Area */}
      <Card style={{
        marginBottom: '20px', padding: '0', overflow: 'hidden',
        position: 'relative', minHeight: '200px',
        background: 'linear-gradient(135deg, #2A2420, #3D362F)',
      }}>
        {/* Simulated Image Area */}
        <div style={{
          width: '100%', height: '200px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <Image size={48} color="rgba(255,255,255,0.15)" />

          {/* Watermark Overlay */}
          {settings.enabled && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: settings.position === 'diagonal' ? 'rotate(-30deg)' : 'none',
            }}>
              <p style={{
                color: `rgba(255,255,255,${settings.opacity / 100})`,
                fontSize: settings.position === 'diagonal' ? '20px' : '16px',
                fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase',
                textAlign: 'center', lineHeight: '2',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}>
                {settings.text}
                {settings.position === 'diagonal' && (
                  <>
                    <br />{settings.text}
                    <br />{settings.text}
                  </>
                )}
              </p>
            </div>
          )}

          <div style={{
            position: 'absolute', bottom: '10px', right: '10px',
            padding: '4px 10px', borderRadius: '6px',
            background: settings.enabled ? 'rgba(107,201,160,0.2)' : 'rgba(220,38,38,0.2)',
            color: settings.enabled ? '#6BC9A0' : '#DC2626',
            fontSize: '10px', fontWeight: '600',
          }}>
            {settings.enabled ? 'Geschützt' : 'Ungeschützt'}
          </div>
        </div>
      </Card>

      {/* Settings */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Settings size={16} color="#9B8FE6" />
          <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Watermark-Einstellungen</span>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 0', borderBottom: '1px solid rgba(232,223,211,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="#6BC9A0" />
            <span style={{ fontSize: '14px', color: '#2A2420' }}>Watermark aktiv</span>
          </div>
          <button onClick={() => setSettings({ ...settings, enabled: !settings.enabled })} style={{
            width: '48px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            background: settings.enabled ? '#6BC9A0' : '#E8DFD3', position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', background: 'white',
              position: 'absolute', top: '3px', transition: 'left 0.2s',
              left: settings.enabled ? '23px' : '3px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }} />
          </button>
        </div>

        {/* Custom Text */}
        <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(232,223,211,0.3)' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Watermark-Text</label>
          <input
            type="text"
            value={settings.text}
            onChange={e => setSettings({ ...settings, text: e.target.value })}
            style={{
              width: '100%', padding: '10px 14px', background: 'rgba(42,36,32,0.03)',
              border: '1.5px solid #E8DFD3', borderRadius: '10px', color: '#2A2420',
              fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Position */}
        <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(232,223,211,0.3)' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '8px' }}>Position</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {POSITIONS.map(pos => (
              <button key={pos.id} onClick={() => setSettings({ ...settings, position: pos.id })} style={{
                padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                background: settings.position === pos.id ? 'rgba(155,143,230,0.15)' : 'rgba(42,36,32,0.04)',
                color: settings.position === pos.id ? '#9B8FE6' : '#7A6F62',
              }}>{pos.label}</button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(232,223,211,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349' }}>Deckkraft</label>
            <span style={{ fontSize: '13px', color: '#9B8FE6', fontWeight: '600' }}>{settings.opacity}%</span>
          </div>
          <input
            type="range" min="10" max="80" value={settings.opacity}
            onChange={e => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#9B8FE6' }}
          />
        </div>

        {/* Auto settings */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(232,223,211,0.3)' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#2A2420' }}>Auto-Apply bei Upload</p>
            <p style={{ fontSize: '11px', color: '#A89B8C' }}>Jeder Upload erhält automatisch Watermark</p>
          </div>
          <button onClick={() => setSettings({ ...settings, autoApply: !settings.autoApply })} style={{
            width: '48px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            background: settings.autoApply ? '#6BC9A0' : '#E8DFD3', position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', background: 'white',
              position: 'absolute', top: '3px', transition: 'left 0.2s',
              left: settings.autoApply ? '23px' : '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#2A2420' }}>Bei Freigabe entfernen</p>
            <p style={{ fontSize: '11px', color: '#A89B8C' }}>Watermark verschwindet nach Manager-Approval</p>
          </div>
          <button onClick={() => setSettings({ ...settings, removeOnApproval: !settings.removeOnApproval })} style={{
            width: '48px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            background: settings.removeOnApproval ? '#6BC9A0' : '#E8DFD3', position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', background: 'white',
              position: 'absolute', top: '3px', transition: 'left 0.2s',
              left: settings.removeOnApproval ? '23px' : '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }} />
          </button>
        </div>
      </Card>

      {/* Save */}
      {saved && (
        <div style={{
          padding: '12px', borderRadius: '12px', marginBottom: '12px',
          background: 'rgba(107,201,160,0.1)', border: '1px solid rgba(107,201,160,0.25)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '14px', color: '#6BC9A0', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle size={16} /> Einstellungen gespeichert!
          </span>
        </div>
      )}

      <Button variant="primary" onClick={saveSettings} style={{ width: '100%', padding: '14px' }}>
        <Sparkles size={16} /> Einstellungen speichern
      </Button>
    </div>
  )
}

export default WatermarkPage
