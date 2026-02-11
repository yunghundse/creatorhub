import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Check, Star, Zap, Users, Shield, TrendingUp, Sparkles, ArrowLeft, Loader } from 'lucide-react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import Card from '../../components/Card'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: 'Kostenlos',
    color: '#A89B8C',
    icon: Star,
    slots: 1,
    highlight: false,
    features: [
      '1 Teammitglied',
      'Content Pipeline',
      'Kalender & Chat',
      'Basis-Analytics',
      'Einladungscodes',
    ],
    missing: [
      'Revenue Split Tracker',
      'Brand Deal CRM',
      'Audit Logs',
      'Prioritäts-Support',
      'Custom Branding',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29',
    period: '/ Monat',
    color: '#F5C563',
    icon: Crown,
    slots: 5,
    highlight: true,
    popular: true,
    features: [
      '5 Teammitglieder',
      'Content Pipeline',
      'Kalender & Chat',
      'Erweiterte Analytics',
      'Revenue Split Tracker',
      'Brand Deal CRM',
      'Content Approval Queue',
      'Audit Logs',
      'Deadline Timer',
      'Asset Library',
    ],
    missing: [
      'Custom Branding',
      'API-Zugang',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '79',
    period: '/ Monat',
    color: '#FF6B9D',
    icon: Zap,
    slots: 10,
    highlight: false,
    features: [
      '10 Teammitglieder',
      'Alle Pro Features',
      'Prioritäts-Support',
      'Custom Branding',
      'API-Zugang',
      'Erweiterte Exports',
      'Multi-Team Support',
      'Dedizierter Account Manager',
    ],
    missing: [],
  },
]

const PricingPage = ({ userData }) => {
  const navigate = useNavigate()
  const [currentAbo, setCurrentAbo] = useState('free')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const resolvedCompanyId = userData?.companyId || null

  useEffect(() => {
    if (!resolvedCompanyId) return
    getDoc(doc(db, 'companies', resolvedCompanyId)).then(snap => {
      if (snap.exists()) setCurrentAbo(snap.data().abo || 'free')
    }).catch(() => {})
  }, [resolvedCompanyId])

  const selectPlan = async (planId) => {
    if (planId === currentAbo) return
    if (!resolvedCompanyId) {
      navigate('/dashboard/company')
      return
    }

    setLoading(planId)

    // In einer echten App würde hier Stripe Checkout gestartet werden:
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   body: JSON.stringify({ priceId: STRIPE_PRICES[planId], companyId: resolvedCompanyId }),
    // })
    // const { url } = await response.json()
    // window.location.href = url

    // Für jetzt: Direkt in Firestore updaten (Demo-Modus)
    try {
      await updateDoc(doc(db, 'companies', resolvedCompanyId), { abo: planId })
      setCurrentAbo(planId)
      setSuccess(planId)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Abo update error:', err)
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', left: '20px', padding: '8px', background: 'rgba(42,36,32,0.04)',
          border: 'none', borderRadius: '10px', color: '#7A6F62', cursor: 'pointer',
        }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{
          width: '56px', height: '56px', borderRadius: '18px',
          background: 'linear-gradient(135deg, #F5C563, #E8A940)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(245,197,99,0.3)',
        }}>
          <Crown size={26} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#2A2420', marginBottom: '6px' }}>Wähle deinen Plan</h2>
        <p style={{ color: '#A89B8C', fontSize: '14px' }}>Skaliere dein Team mit dem richtigen Abo</p>
      </div>

      {/* Current Plan Banner */}
      {currentAbo !== 'free' && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
          background: 'rgba(107,201,160,0.08)', border: '1px solid rgba(107,201,160,0.2)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <Shield size={18} color="#6BC9A0" />
          <span style={{ fontSize: '14px', color: '#2A2420', fontWeight: '500' }}>
            Aktueller Plan: <strong style={{ textTransform: 'capitalize', color: '#6BC9A0' }}>{currentAbo}</strong>
          </span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div style={{
          padding: '14px 16px', borderRadius: '12px', marginBottom: '16px',
          background: 'rgba(107,201,160,0.1)', border: '1px solid rgba(107,201,160,0.3)',
          textAlign: 'center',
        }}>
          <p style={{ color: '#6BC9A0', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Sparkles size={16} /> Plan erfolgreich auf <span style={{ textTransform: 'capitalize' }}>{success}</span> gewechselt!
          </p>
        </div>
      )}

      {/* Pricing Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {PLANS.map(plan => {
          const Icon = plan.icon
          const isCurrent = currentAbo === plan.id
          const isDowngrade = PLANS.findIndex(p => p.id === currentAbo) > PLANS.findIndex(p => p.id === plan.id)

          return (
            <Card key={plan.id} style={{
              padding: '0', overflow: 'hidden', position: 'relative',
              border: plan.highlight ? `2px solid ${plan.color}` : isCurrent ? '2px solid #6BC9A0' : '1px solid rgba(232,223,211,0.5)',
              boxShadow: plan.highlight ? `0 8px 30px ${plan.color}15` : 'none',
            }}>
              {/* Popular Badge */}
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  padding: '4px 10px', borderRadius: '8px',
                  background: `${plan.color}15`, color: plan.color,
                  fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px',
                }}>BELIEBT</div>
              )}

              {/* Current Badge */}
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  padding: '4px 10px', borderRadius: '8px',
                  background: 'rgba(107,201,160,0.1)', color: '#6BC9A0',
                  fontSize: '11px', fontWeight: '700',
                }}>AKTUELL</div>
              )}

              <div style={{ padding: '24px' }}>
                {/* Plan Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px',
                    background: `${plan.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} color={plan.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420', margin: 0 }}>{plan.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                      <span style={{ fontSize: '28px', fontWeight: '800', color: '#2A2420' }}>{plan.price === '0' ? 'Gratis' : `${plan.price}€`}</span>
                      {plan.price !== '0' && <span style={{ fontSize: '14px', color: '#A89B8C', fontWeight: '400' }}>{plan.period}</span>}
                    </div>
                  </div>
                </div>

                {/* Slots Info */}
                <div style={{
                  padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
                  background: `${plan.color}08`, display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <Users size={16} color={plan.color} />
                  <span style={{ fontSize: '13px', color: '#5C5349', fontWeight: '500' }}>
                    Bis zu <strong style={{ color: plan.color }}>{plan.slots}</strong> Teammitglied{plan.slots > 1 ? 'er' : ''}
                  </span>
                </div>

                {/* Features */}
                <div style={{ marginBottom: '16px' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
                      <Check size={15} color="#6BC9A0" strokeWidth={3} />
                      <span style={{ fontSize: '13px', color: '#5C5349' }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f, i) => (
                    <div key={`m-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', opacity: 0.4 }}>
                      <span style={{ width: '15px', textAlign: 'center', fontSize: '13px', color: '#A89B8C' }}>—</span>
                      <span style={{ fontSize: '13px', color: '#A89B8C' }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => selectPlan(plan.id)}
                  disabled={isCurrent || loading === plan.id}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                    fontSize: '15px', fontWeight: '700', cursor: isCurrent ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    background: isCurrent ? 'rgba(107,201,160,0.1)'
                      : plan.highlight ? `linear-gradient(135deg, ${plan.color}cc, ${plan.color})`
                      : 'rgba(42,36,32,0.06)',
                    color: isCurrent ? '#6BC9A0'
                      : plan.highlight ? 'white'
                      : '#5C5349',
                    boxShadow: plan.highlight && !isCurrent ? `0 4px 16px ${plan.color}30` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: isCurrent ? 0.8 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading === plan.id ? (
                    <><Loader size={16} className="animate-spin" /> Wird aktualisiert...</>
                  ) : isCurrent ? (
                    <><Check size={16} /> Aktueller Plan</>
                  ) : isDowngrade ? (
                    <>Downgraden</>
                  ) : (
                    <><TrendingUp size={16} /> {plan.price === '0' ? 'Gratis starten' : `Auf ${plan.name} upgraden`}</>
                  )}
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Info Footer */}
      <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px' }}>
        <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.6' }}>
          Alle Pläne sind monatlich kündbar. Kein Vertrag, keine versteckten Kosten.
          Bei einem Downgrade behältst du den Plan bis zum Ende der Abrechnungsperiode.
        </p>
        <p style={{ fontSize: '11px', color: '#C4B8A8', marginTop: '8px' }}>
          Stripe-Integration wird bei Produktions-Launch aktiviert.
        </p>
      </div>
    </div>
  )
}

export default PricingPage
