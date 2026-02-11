import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard, ArrowLeft, Crown, Users, Zap, Check, Download,
  AlertTriangle, Calendar, Receipt, ChevronRight, Shield, X
} from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const DEMO_PLAN = {
  name: 'Pro',
  price: '29',
  period: 'Monat',
  color: '#F5C563',
  renewalDate: '15.03.2025',
  status: 'Aktiv',
  teamSlots: { used: 3, total: 5 },
  featuresUnlocked: { used: 14, total: 18 },
}

const DEMO_BILLING = [
  { id: 1, date: '15.02.2025', description: 'Pro Plan - Monatlich', amount: '29,00', status: 'Bezahlt', invoice: 'INV-2025-002' },
  { id: 2, date: '15.01.2025', description: 'Pro Plan - Monatlich', amount: '29,00', status: 'Bezahlt', invoice: 'INV-2025-001' },
  { id: 3, date: '15.12.2024', description: 'Pro Plan - Monatlich', amount: '29,00', status: 'Bezahlt', invoice: 'INV-2024-012' },
]

const SubscriptionPage = () => {
  const navigate = useNavigate()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelConfirmed, setCancelConfirmed] = useState(false)

  const handleCancel = () => {
    setCancelConfirmed(true)
    setTimeout(() => {
      setShowCancelDialog(false)
      setCancelConfirmed(false)
    }, 2500)
  }

  const progressBarStyle = (percentage, color) => ({
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: 'rgba(42,36,32,0.06)',
    overflow: 'hidden',
  })

  const progressFillStyle = (percentage, color) => ({
    width: `${percentage}%`,
    height: '100%',
    borderRadius: '4px',
    background: `linear-gradient(90deg, ${color}80, ${color})`,
    transition: 'width 0.8s ease',
  })

  return (
    <div>
      {/* Cancel Dialog Overlay */}
      {showCancelDialog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFDF7', borderRadius: '22px', padding: '28px',
            width: '100%', maxWidth: '380px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            {!cancelConfirmed ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '18px',
                    background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(220,38,38,0.08))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <AlertTriangle size={26} color="#DC2626" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2A2420', marginBottom: '8px' }}>
                    Abo wirklich kundigen?
                  </h3>
                  <p style={{ fontSize: '14px', color: '#7A6F62', lineHeight: '1.6' }}>
                    Dein Pro-Plan bleibt bis zum {DEMO_PLAN.renewalDate} aktiv. Danach wirst du auf den kostenlosen Plan herabgestuft.
                  </p>
                </div>

                <Card style={{
                  padding: '14px', marginBottom: '16px',
                  background: 'rgba(245,197,99,0.06)', border: '1px solid rgba(245,197,99,0.15)',
                }}>
                  <p style={{ fontSize: '13px', color: '#5C5349', lineHeight: '1.6' }}>
                    <strong style={{ color: '#E8A940' }}>Du verlierst Zugriff auf:</strong><br />
                    - Revenue Split Tracker<br />
                    - Brand Deal CRM<br />
                    - Erweiterte Analytics<br />
                    - 4 von 5 Team-Slots
                  </p>
                </Card>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowCancelDialog(false)} style={{
                    flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #E8DFD3',
                    background: 'transparent', color: '#7A6F62', fontWeight: '600', fontSize: '14px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Behalten</button>
                  <button onClick={handleCancel} style={{
                    flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
                    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                    color: 'white', fontWeight: '700', fontSize: '14px',
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 4px 16px rgba(220,38,38,0.25)',
                  }}>Abo kundigen</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '18px',
                  background: 'linear-gradient(135deg, #6BC9A0, #4DAA82)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(107,201,160,0.3)',
                }}>
                  <Check size={26} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420', marginBottom: '6px' }}>
                  Kundigung bestatigt
                </h3>
                <p style={{ fontSize: '13px', color: '#7A6F62' }}>
                  Dein Plan bleibt bis zum {DEMO_PLAN.renewalDate} aktiv.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
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
          background: 'linear-gradient(135deg, #F5C563, #E8A940)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(245,197,99,0.3)',
        }}>
          <CreditCard size={20} color="white" />
        </div>
      </div>

      {/* Current Plan Card */}
      <Card style={{
        marginBottom: '16px', padding: '0', overflow: 'hidden',
        border: `2px solid ${DEMO_PLAN.color}`,
        boxShadow: `0 8px 30px ${DEMO_PLAN.color}15`,
      }}>
        <div style={{
          padding: '6px 16px', background: `linear-gradient(135deg, ${DEMO_PLAN.color}cc, ${DEMO_PLAN.color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={14} color="white" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', letterSpacing: '0.5px' }}>AKTUELLER PLAN</span>
          </div>
          <span style={{
            padding: '2px 10px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.25)', color: 'white',
            fontSize: '11px', fontWeight: '700',
          }}>{DEMO_PLAN.status}</span>
        </div>

        <div style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: `${DEMO_PLAN.color}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={26} color={DEMO_PLAN.color} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#2A2420', margin: 0 }}>
                {DEMO_PLAN.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: DEMO_PLAN.color }}>{DEMO_PLAN.price}EUR</span>
                <span style={{ fontSize: '14px', color: '#A89B8C' }}>/ {DEMO_PLAN.period}</span>
              </div>
            </div>
          </div>

          {/* Renewal Date */}
          <div style={{
            padding: '12px 14px', borderRadius: '12px', marginBottom: '16px',
            background: 'rgba(42,36,32,0.03)', border: '1px solid rgba(232,223,211,0.4)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <Calendar size={16} color="#A89B8C" />
            <span style={{ fontSize: '13px', color: '#5C5349' }}>
              Nachste Verlangerung: <strong style={{ color: '#2A2420' }}>{DEMO_PLAN.renewalDate}</strong>
            </span>
          </div>

          {/* Usage Stats */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Team Slots */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="#7EB5E6" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#5C5349' }}>Team-Slots</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#7EB5E6' }}>
                  {DEMO_PLAN.teamSlots.used}/{DEMO_PLAN.teamSlots.total}
                </span>
              </div>
              <div style={progressBarStyle()}>
                <div style={progressFillStyle((DEMO_PLAN.teamSlots.used / DEMO_PLAN.teamSlots.total) * 100, '#7EB5E6')} />
              </div>
            </div>

            {/* Features */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#9B8FE6" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#5C5349' }}>Features</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#9B8FE6' }}>
                  {DEMO_PLAN.featuresUnlocked.used}/{DEMO_PLAN.featuresUnlocked.total}
                </span>
              </div>
              <div style={progressBarStyle()}>
                <div style={progressFillStyle((DEMO_PLAN.featuresUnlocked.used / DEMO_PLAN.featuresUnlocked.total) * 100, '#9B8FE6')} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Plan aendern Button */}
      <Button
        variant="cream"
        onClick={() => navigate('/dashboard/pricing')}
        style={{ width: '100%', padding: '14px', marginBottom: '20px' }}
      >
        <Crown size={16} /> Plan andern
      </Button>

      {/* Payment Method */}
      <Card style={{ marginBottom: '16px', padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(126,181,230,0.12), rgba(126,181,230,0.06))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CreditCard size={20} color="#7EB5E6" />
            </div>
            <div>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Visa ****6411</p>
              <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '2px' }}>Lauft ab 12/2027</p>
            </div>
          </div>
          <button onClick={() => {}} style={{
            padding: '8px 16px', borderRadius: '10px',
            border: '1.5px solid #E8DFD3', background: 'rgba(42,36,32,0.02)',
            color: '#7A6F62', fontWeight: '600', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Andern
          </button>
        </div>
      </Card>

      {/* Billing History */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '16px', fontWeight: '700', color: '#2A2420', marginBottom: '12px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Receipt size={16} color="#F5C563" /> Rechnungsverlauf
        </h3>

        {DEMO_BILLING.map((item, index) => (
          <Card key={item.id} style={{
            marginBottom: '8px', padding: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(107,201,160,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Check size={18} color="#6BC9A0" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{item.amount} EUR</span>
                <span style={{
                  padding: '3px 10px', borderRadius: '8px',
                  background: 'rgba(107,201,160,0.08)', color: '#6BC9A0',
                  fontSize: '11px', fontWeight: '600',
                }}>{item.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#A89B8C' }}>{item.date} - {item.description}</span>
                <button onClick={() => {}} style={{
                  padding: '4px 8px', borderRadius: '6px',
                  border: 'none', background: 'rgba(42,36,32,0.04)',
                  color: '#7A6F62', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '4px', fontSize: '11px',
                  fontFamily: 'inherit',
                }}>
                  <Download size={12} /> PDF
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Cancel Section */}
      <Card style={{
        marginBottom: '16px', padding: '20px',
        border: '1.5px solid rgba(220,38,38,0.15)',
        background: 'rgba(220,38,38,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertTriangle size={18} color="#DC2626" />
          <span style={{ fontWeight: '600', color: '#DC2626', fontSize: '15px' }}>Abo kundigen</span>
        </div>
        <p style={{ fontSize: '13px', color: '#7A6F62', marginBottom: '16px', lineHeight: '1.6' }}>
          Du kannst dein Abonnement jederzeit kundigen. Dein Plan bleibt bis zum Ende der
          aktuellen Abrechnungsperiode aktiv. Danach wirst du automatisch auf den kostenlosen
          Plan umgestellt.
        </p>
        <button onClick={() => setShowCancelDialog(true)} style={{
          width: '100%', padding: '12px', borderRadius: '12px',
          border: '1.5px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.04)',
          color: '#DC2626', fontWeight: '600', fontSize: '14px',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Abo kundigen
        </button>
      </Card>

      {/* Info Footer */}
      <Card style={{
        padding: '14px 16px',
        background: 'rgba(42,36,32,0.02)', border: '1px solid rgba(232,223,211,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={14} color="#A89B8C" />
          <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.5' }}>
            Zahlungen werden sicher uber Stripe abgewickelt. Demo-Modus aktiv.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default SubscriptionPage
