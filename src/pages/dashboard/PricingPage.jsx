import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Check, Star, Zap, Users, Shield, TrendingUp, Sparkles, ArrowLeft, Loader, CreditCard, AlertTriangle, Lock, Brain, Repeat, Inbox, Pencil, UserCheck, GitBranch, FileText, Receipt, Stamp } from 'lucide-react'
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
      'Premium AI-Tools',
      'Tax-Ready Export',
      'In-App Invoicing',
    ],
    premiumAccess: false,
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
      'Tax-Ready Export',
    ],
    missing: [
      'AI Viral Predictor',
      'Auto-Repurposing',
      'Smart Inbox',
      'Ghost-Mode',
      'In-App Invoicing',
    ],
    premiumAccess: 'partial',
    // Stripe Price ID — hier echte ID eintragen
    stripePriceId: 'price_pro_monthly',
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
      'AI Viral Predictor',
      'Auto-Repurposing Planer',
      'Smart Inbox Tagging',
      'Ghost-Mode für Manager',
      'Asset Versioning',
      'Visual Annotations',
      'In-App Invoicing',
      'Watermark Generator',
      'Prioritäts-Support',
      'API-Zugang',
    ],
    missing: [],
    premiumAccess: 'full',
    stripePriceId: 'price_business_monthly',
  },
]

const PREMIUM_FEATURES = [
  { icon: Brain, name: 'Viral Predictor', plan: 'business', desc: 'KI-Score für Viralität' },
  { icon: Repeat, name: 'Auto-Repurposing', plan: 'business', desc: 'YouTube → TikTok + IG' },
  { icon: Inbox, name: 'Smart Inbox', plan: 'business', desc: 'KI-Nachrichten-Sortierung' },
  { icon: FileText, name: 'Tax Export', plan: 'pro', desc: 'Steuer-CSV auf einen Klick' },
  { icon: Receipt, name: 'Invoicing', plan: 'business', desc: 'Rechnungen direkt erstellen' },
  { icon: Pencil, name: 'Annotations', plan: 'business', desc: 'Markierungen auf Medien' },
  { icon: UserCheck, name: 'Ghost-Mode', plan: 'business', desc: 'Manager-Account-Zugriff' },
  { icon: GitBranch, name: 'Versioning', plan: 'business', desc: 'Edit-Versionen vergleichen' },
  { icon: Stamp, name: 'Watermark', plan: 'business', desc: 'Auto-Wasserzeichen' },
]

const PricingPage = ({ userData }) => {
  const navigate = useNavigate()
  const [currentAbo, setCurrentAbo] = useState('free')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(null)
  const [paymentStep, setPaymentStep] = useState('select') // select, processing, done

  const resolvedCompanyId = userData?.companyId || null

  useEffect(() => {
    if (!resolvedCompanyId) return
    getDoc(doc(db, 'companies', resolvedCompanyId)).then(snap => {
      if (snap.exists()) setCurrentAbo(snap.data().abo || 'free')
    }).catch(() => {})
  }, [resolvedCompanyId])

  const startCheckout = (planId) => {
    if (planId === currentAbo) return
    if (!resolvedCompanyId) {
      navigate('/dashboard/company')
      return
    }
    if (planId === 'free') {
      // Downgrade to free
      selectPlan(planId)
      return
    }
    // Show payment modal
    setShowPaymentModal(planId)
    setPaymentStep('select')
  }

  const processPayment = async () => {
    const planId = showPaymentModal
    setPaymentStep('processing')

    // In production: redirect to Stripe Checkout
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     priceId: PLANS.find(p => p.id === planId).stripePriceId,
    //     companyId: resolvedCompanyId,
    //     successUrl: window.location.origin + '/dashboard/pricing?success=true',
    //     cancelUrl: window.location.origin + '/dashboard/pricing?canceled=true',
    //   }),
    // })
    // const { url } = await response.json()
    // window.location.href = url

    // Demo-Modus: Simuliere Zahlung (2 Sekunden)
    await new Promise(r => setTimeout(r, 2000))
    await selectPlan(planId)
    setPaymentStep('done')
    setTimeout(() => {
      setShowPaymentModal(null)
      setPaymentStep('select')
    }, 2000)
  }

  const selectPlan = async (planId) => {
    setLoading(planId)
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

  const selectedPlan = PLANS.find(p => p.id === showPaymentModal)

  return (
    <div>
      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <>
          <div onClick={() => { if (paymentStep === 'select') setShowPaymentModal(null) }} style={{
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
              {paymentStep === 'select' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '18px',
                      background: `linear-gradient(135deg, ${selectedPlan.color}cc, ${selectedPlan.color})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px', boxShadow: `0 8px 24px ${selectedPlan.color}30`,
                    }}>
                      <CreditCard size={24} color="white" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2A2420' }}>
                      Upgrade auf {selectedPlan.name}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#A89B8C', marginTop: '4px' }}>
                      {selectedPlan.price}€ {selectedPlan.period}
                    </p>
                  </div>

                  {/* Plan summary */}
                  <Card style={{ padding: '14px', marginBottom: '16px', background: `${selectedPlan.color}06`, border: `1px solid ${selectedPlan.color}15` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#7A6F62' }}>{selectedPlan.name} Plan</span>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#2A2420' }}>{selectedPlan.price}€/Monat</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(232,223,211,0.3)' }}>
                      <span style={{ fontSize: '12px', color: '#A89B8C' }}>Teammitglieder</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: selectedPlan.color }}>bis zu {selectedPlan.slots}</span>
                    </div>
                  </Card>

                  {/* Payment method info */}
                  <div style={{
                    padding: '14px', borderRadius: '12px', marginBottom: '16px',
                    background: 'rgba(245,197,99,0.06)', border: '1px solid rgba(245,197,99,0.15)',
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                  }}>
                    <Lock size={16} color="#E8A940" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', color: '#7A6F62', lineHeight: '1.5' }}>
                      Sichere Zahlung über Stripe. Du wirst zur Stripe-Checkout-Seite weitergeleitet. Jederzeit monatlich kündbar.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowPaymentModal(null)} style={{
                      flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #E8DFD3',
                      background: 'transparent', color: '#7A6F62', fontWeight: '600', fontSize: '14px',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>Abbrechen</button>
                    <button onClick={processPayment} style={{
                      flex: 2, padding: '14px', borderRadius: '14px', border: 'none',
                      background: `linear-gradient(135deg, ${selectedPlan.color}cc, ${selectedPlan.color})`,
                      color: 'white', fontWeight: '700', fontSize: '14px',
                      cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: `0 4px 16px ${selectedPlan.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}>
                      <CreditCard size={16} /> Jetzt bezahlen
                    </button>
                  </div>

                  <p style={{ textAlign: 'center', fontSize: '11px', color: '#C4B8A8', marginTop: '12px' }}>
                    Demo-Modus: Zahlung wird simuliert
                  </p>
                </>
              )}

              {paymentStep === 'processing' && (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div className="animate-float" style={{
                    width: '64px', height: '64px', borderRadius: '20px',
                    background: `linear-gradient(135deg, ${selectedPlan.color}cc, ${selectedPlan.color})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: `0 8px 30px ${selectedPlan.color}30`,
                  }}>
                    <Loader size={28} color="white" className="animate-spin" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420', marginBottom: '6px' }}>Zahlung wird verarbeitet...</h3>
                  <p style={{ fontSize: '13px', color: '#A89B8C' }}>Bitte warte einen Moment.</p>
                </div>
              )}

              {paymentStep === 'done' && (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '20px',
                    background: 'linear-gradient(135deg, #6BC9A0, #4DAA82)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: '0 8px 30px rgba(107,201,160,0.3)',
                  }}>
                    <Check size={28} color="white" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420', marginBottom: '6px' }}>Upgrade erfolgreich!</h3>
                  <p style={{ fontSize: '13px', color: '#6BC9A0', fontWeight: '600' }}>
                    Willkommen beim {selectedPlan.name}-Plan!
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
              {plan.popular && !isCurrent && (
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

                {/* Premium Access Badge */}
                {plan.premiumAccess && (
                  <div style={{
                    padding: '8px 12px', borderRadius: '10px', marginBottom: '12px',
                    background: plan.premiumAccess === 'full' ? 'rgba(155,143,230,0.08)' : 'rgba(245,197,99,0.06)',
                    border: `1px solid ${plan.premiumAccess === 'full' ? 'rgba(155,143,230,0.15)' : 'rgba(245,197,99,0.15)'}`,
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Sparkles size={14} color={plan.premiumAccess === 'full' ? '#9B8FE6' : '#F5C563'} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: plan.premiumAccess === 'full' ? '#9B8FE6' : '#E8A940' }}>
                      {plan.premiumAccess === 'full' ? 'Alle Premium-Features inkl.' : 'Basis Premium-Features inkl.'}
                    </span>
                  </div>
                )}

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
                  onClick={() => startCheckout(plan.id)}
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
                  ) : plan.price === '0' ? (
                    <><Star size={16} /> Gratis starten</>
                  ) : (
                    <><CreditCard size={16} /> {plan.name} für {plan.price}€/Monat</>
                  )}
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Premium Feature Comparison */}
      <div style={{ marginTop: '24px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2A2420', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#9B8FE6" /> Premium-Features im Detail
        </h3>
        {PREMIUM_FEATURES.map((f, i) => {
          const FIcon = f.icon
          const unlocked = (f.plan === 'pro' && ['pro', 'business'].includes(currentAbo)) || (f.plan === 'business' && currentAbo === 'business')
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              borderRadius: '10px', marginBottom: '4px',
              background: unlocked ? 'rgba(107,201,160,0.04)' : 'transparent',
            }}>
              <FIcon size={16} color={unlocked ? '#6BC9A0' : '#C4B8A8'} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: unlocked ? '#2A2420' : '#A89B8C' }}>{f.name}</span>
                <span style={{ fontSize: '11px', color: '#A89B8C', marginLeft: '8px' }}>{f.desc}</span>
              </div>
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600', textTransform: 'capitalize',
                background: unlocked ? 'rgba(107,201,160,0.1)' : `rgba(${f.plan === 'pro' ? '245,197,99' : '255,107,157'},0.08)`,
                color: unlocked ? '#6BC9A0' : f.plan === 'pro' ? '#E8A940' : '#FF6B9D',
              }}>
                {unlocked ? 'Aktiv' : f.plan}
              </span>
            </div>
          )
        })}
      </div>

      {/* Info Footer */}
      <div style={{ textAlign: 'center', marginTop: '20px', padding: '16px' }}>
        <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.6' }}>
          Alle Pläne sind monatlich kündbar. Kein Vertrag, keine versteckten Kosten.
          Bei einem Downgrade behältst du den Plan bis zum Ende der Abrechnungsperiode.
        </p>
        <p style={{ fontSize: '11px', color: '#C4B8A8', marginTop: '8px' }}>
          Zahlung wird sicher über Stripe abgewickelt. Demo-Modus aktiv.
        </p>
      </div>
    </div>
  )
}

export default PricingPage
