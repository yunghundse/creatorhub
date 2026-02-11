import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench, Clock, Lock } from 'lucide-react'
import Card from './Card'

const MaintenanceBlock = ({ title, description, icon: Icon, color = '#A89B8C' }) => {
  const navigate = useNavigate()

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }} className="animate-fade-in">
        <button onClick={() => navigate(-1)} style={{
          padding: '10px', background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)',
          borderRadius: '12px', color: '#7A6F62', cursor: 'pointer', display: 'flex',
        }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>{title}</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Premium Feature</p>
        </div>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px',
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={20} color={color} />}
        </div>
      </div>

      {/* Wartungsmodus Card */}
      <Card style={{
        textAlign: 'center', padding: '48px 24px',
        border: '1.5px solid rgba(245,197,99,0.2)',
        background: 'linear-gradient(135deg, rgba(245,197,99,0.04), rgba(168,155,140,0.02))',
      }} className="animate-fade-in stagger-1">
        <div style={{
          width: '72px', height: '72px', borderRadius: '22px',
          background: 'rgba(245,197,99,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Wrench size={32} color="#E8A940" />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2A2420', marginBottom: '8px' }}>
          Wartungsmodus
        </h3>

        <p style={{
          fontSize: '14px', color: '#7A6F62', lineHeight: '1.7',
          maxWidth: '300px', margin: '0 auto 24px',
        }}>
          {description || 'Dieses Feature befindet sich derzeit in Entwicklung und ist noch nicht verfügbar.'}
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '12px',
          background: 'rgba(245,197,99,0.08)', border: '1px solid rgba(245,197,99,0.15)',
        }}>
          <Clock size={14} color="#E8A940" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#E8A940' }}>Kommt bald</span>
        </div>
      </Card>

      {/* Info */}
      <Card style={{
        marginTop: '16px', padding: '14px 16px',
        background: 'rgba(42,36,32,0.02)', border: '1px solid rgba(232,223,211,0.4)',
      }} className="animate-fade-in stagger-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={14} color="#A89B8C" />
          <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.5' }}>
            Dieses Feature wird mit einem zukünftigen Premium-Plan freigeschaltet. Du wirst benachrichtigt.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default MaintenanceBlock
