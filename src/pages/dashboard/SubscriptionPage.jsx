import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompany } from '../../contexts/CompanyContext'
import {
  ArrowLeft, Crown, Users, Zap, Check, Star,
  Shield, Sparkles, Lock, Clock
} from 'lucide-react'
import Card from '../../components/Card'

const SubscriptionPage = ({ userData }) => {
  const navigate = useNavigate()
  const { company, members, isOwner, hasCompany, isApproved } = useCompany()

  // Real data from Firestore
  const currentAbo = company?.abo || 'free'
  const approvedMembers = members?.filter(m => m.status === 'approved') || []
  const slotLimits = { free: 1, pro: 5, business: 10 }
  const maxSlots = slotLimits[currentAbo] || 1
  const usedSlots = approvedMembers.length

  const progressBarStyle = {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: 'rgba(42,36,32,0.06)',
    overflow: 'hidden',
  }

  const progressFillStyle = (percentage, color) => ({
    width: `${percentage}%`,
    height: '100%',
    borderRadius: '4px',
    background: `linear-gradient(90deg, ${color}80, ${color})`,
    transition: 'width 0.8s ease',
  })

  const freeFeatures = [
    'Kalender & Terminplanung',
    'Firma erstellen & Team einladen',
    '1 Team-Slot',
    'Aufgaben & Assets verwalten',
    'Benachrichtigungen',
  ]

  const premiumFeatures = [
    'Bis zu 10 Team-Slots',
    'Revenue Split Tracker',
    'Brand Deal CRM',
    'Erweiterte Analytics',
    'Prioritäts-Support',
    'Individuelle Vertragsvorlagen',
  ]

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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Abo-Verwaltung</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Dein Abonnement verwalten</p>
        </div>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #7EB5E6, #5A9BD4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(126,181,230,0.3)',
        }}>
          <Crown size={20} color="white" />
        </div>
      </div>

      {/* Current Free Plan Card */}
      <Card style={{
        marginBottom: '16px', padding: '0', overflow: 'hidden',
        border: '2px solid #7EB5E6',
        boxShadow: '0 8px 30px rgba(126,181,230,0.1)',
      }} className="animate-fade-in stagger-1">
        <div style={{
          padding: '6px 16px',
          background: 'linear-gradient(135deg, #7EB5E6cc, #7EB5E6)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={14} color="white" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', letterSpacing: '0.5px' }}>AKTUELLER PLAN</span>
          </div>
          <span style={{
            padding: '2px 10px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.25)', color: 'white',
            fontSize: '11px', fontWeight: '700',
          }}>Aktiv</span>
        </div>

        <div style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'rgba(126,181,230,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={26} color="#7EB5E6" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#2A2420', margin: 0 }}>
                Free
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#7EB5E6' }}>0€</span>
                <span style={{ fontSize: '14px', color: '#A89B8C' }}>/ Monat</span>
              </div>
            </div>
          </div>

          {/* Team Slots — echte Daten */}
          {hasCompany && (
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="#7EB5E6" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#5C5349' }}>Team-Slots</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#7EB5E6' }}>
                  {usedSlots}/{maxSlots}
                </span>
              </div>
              <div style={progressBarStyle}>
                <div style={progressFillStyle(maxSlots > 0 ? (usedSlots / maxSlots) * 100 : 0, '#7EB5E6')} />
              </div>
            </div>
          )}

          {/* Free Features */}
          <div style={{ marginTop: '16px' }}>
            {freeFeatures.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '6px',
                  background: 'rgba(107,201,160,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Check size={12} color="#6BC9A0" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '13px', color: '#5C5349' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Premium Coming Soon Card */}
      <Card style={{
        marginBottom: '16px', padding: '0', overflow: 'hidden',
        border: '1.5px solid rgba(245,197,99,0.25)',
        background: 'linear-gradient(135deg, rgba(245,197,99,0.03), rgba(155,143,230,0.03))',
        position: 'relative',
      }} className="animate-fade-in stagger-2">
        {/* Coming Soon Badge */}
        <div style={{
          padding: '8px 16px',
          background: 'linear-gradient(135deg, rgba(245,197,99,0.12), rgba(155,143,230,0.08))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(245,197,99,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} color="#F5C563" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#E8A940', letterSpacing: '0.5px' }}>PREMIUM</span>
          </div>
          <span style={{
            padding: '3px 12px', borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(245,197,99,0.15), rgba(155,143,230,0.1))',
            color: '#E8A940', fontSize: '11px', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Clock size={10} /> Kommt bald
          </span>
        </div>

        <div style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(245,197,99,0.15), rgba(155,143,230,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={26} color="#F5C563" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2A2420', margin: 0 }}>
                Premium
              </h3>
              <p style={{ fontSize: '13px', color: '#A89B8C', marginTop: '2px' }}>
                Für wachsende Teams & Agenturen
              </p>
            </div>
          </div>

          {/* Premium Features */}
          <div style={{ marginBottom: '18px' }}>
            {premiumFeatures.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '6px',
                  background: 'rgba(245,197,99,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Star size={11} color="#E8A940" />
                </div>
                <span style={{ fontSize: '13px', color: '#7A6F62' }}>{feat}</span>
              </div>
            ))}
          </div>

          {/* Disabled Upgrade Button */}
          <button disabled style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, rgba(245,197,99,0.15), rgba(155,143,230,0.1))',
            color: '#C4B08A', fontWeight: '700', fontSize: '14px',
            cursor: 'not-allowed', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: 0.7,
          }}>
            <Lock size={14} /> Bald verfügbar
          </button>
        </div>
      </Card>

      {/* Info about current usage */}
      {hasCompany && (
        <Card style={{
          marginBottom: '16px', padding: '16px',
          background: 'rgba(42,36,32,0.02)', border: '1px solid rgba(232,223,211,0.4)',
        }} className="animate-fade-in stagger-3">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(126,181,230,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Zap size={16} color="#7EB5E6" />
            </div>
            <div>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px', marginBottom: '4px' }}>
                Dein Team: {company?.name}
              </p>
              <p style={{ fontSize: '12px', color: '#7A6F62', lineHeight: '1.5' }}>
                {isOwner
                  ? `Du bist der Inhaber. ${usedSlots} von ${maxSlots} Team-Slot${maxSlots !== 1 ? 's' : ''} belegt. Mit dem Premium-Plan kannst du bald bis zu 10 Mitglieder einladen.`
                  : `Du bist Mitglied im Team "${company?.name}". Dein Manager verwaltet das Abonnement.`
                }
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* No Company Info */}
      {!hasCompany && (
        <Card style={{
          marginBottom: '16px', padding: '16px',
          background: 'rgba(42,36,32,0.02)', border: '1px solid rgba(232,223,211,0.4)',
        }} className="animate-fade-in stagger-3">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(168,155,140,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Users size={16} color="#A89B8C" />
            </div>
            <div>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px', marginBottom: '4px' }}>
                Kein Team
              </p>
              <p style={{ fontSize: '12px', color: '#7A6F62', lineHeight: '1.5' }}>
                {userData?.role === 'manager'
                  ? 'Erstelle eine Firma in den Einstellungen, um Team-Features zu nutzen.'
                  : 'Tritt einem Team bei, um mit deinem Manager zusammenzuarbeiten.'
                }
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Footer */}
      <Card style={{
        padding: '14px 16px',
        background: 'rgba(42,36,32,0.02)', border: '1px solid rgba(232,223,211,0.4)',
      }} className="animate-fade-in stagger-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={14} color="#A89B8C" />
          <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.5' }}>
            Derzeit ist nur der kostenlose Plan verfügbar. Sobald Premium startet, wirst du hier benachrichtigt.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default SubscriptionPage
