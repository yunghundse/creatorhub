import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Crown, Sparkles, Brain, Zap, Shield, DollarSign, ArrowRight,
  TrendingUp, Repeat, Inbox, Pencil, UserCheck, GitBranch,
  Briefcase, FileText, Receipt, Stamp, ClipboardList, Lock, Clock, Star, Rocket, Wand2
} from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const CATEGORIES = [
  {
    id: 'ai',
    title: 'AI-Driven Automation',
    subtitle: 'KI-gesteuerte Intelligence',
    icon: Brain,
    color: '#9B8FE6',
    features: [
      {
        id: 'viral-predictor',
        title: 'Viral Predictor',
        desc: 'Analysiert Skripte & Thumbnails — Viralitäts-Score 1-100 basierend auf Echtzeit-Trends',
        icon: TrendingUp,
        path: '/premium/viral-predictor',
        status: 'coming_soon',
      },
      {
        id: 'auto-repurposing',
        title: 'Auto-Repurposing Planer',
        desc: 'YouTube-Video geplant? KI generiert 5 TikTok-Hooks und 3 Instagram-Story-Konzepte',
        icon: Repeat,
        path: '/premium/repurposing',
        status: 'coming_soon',
      },
      {
        id: 'smart-inbox',
        title: 'Smart Inbox Tagging',
        desc: 'KI sortiert Nachrichten nach Priorität: Booking, Support, Spam — automatisch',
        icon: Inbox,
        path: '/premium/smart-inbox',
        status: 'coming_soon',
      },
      {
        id: 'caption-writer',
        title: 'KI Caption Generator',
        desc: 'Captions für Instagram, TikTok, YouTube & mehr — auf Knopfdruck generiert',
        icon: Wand2,
        path: '/premium/caption-writer',
        status: 'active',
      },
    ],
  },
  {
    id: 'workflow',
    title: 'Workflow & Collaboration',
    subtitle: 'Deep-Tech für Teams',
    icon: Zap,
    color: '#7EB5E6',
    features: [
      {
        id: 'visual-annotation',
        title: 'Visual Annotation Tool',
        desc: 'Markierungen direkt in Bildern & Videos setzen — "Hier Licht anpassen", "Frame schneiden"',
        icon: Pencil,
        path: '/premium/annotations',
        status: 'coming_soon',
      },
      {
        id: 'ghost-mode',
        title: 'Ghost-Mode für Manager',
        desc: 'Manager loggt sich in Model-Account ein — getrennte Logs, Model bleibt online',
        icon: UserCheck,
        path: '/premium/ghost-mode',
        status: 'coming_soon',
      },
      {
        id: 'asset-versioning',
        title: 'Asset Versioning',
        desc: 'Verschiedene Edit-Versionen (v1, v2, Final) hochladen — direkter Vergleich',
        icon: GitBranch,
        path: '/premium/versioning',
        status: 'coming_soon',
      },
    ],
  },
  {
    id: 'business',
    title: 'Business & Monetarisierung',
    subtitle: 'Revenue optimieren',
    icon: DollarSign,
    color: '#F5C563',
    features: [
      {
        id: 'brand-deal-crm',
        title: 'Brand Deal CRM',
        desc: 'Verträge, Deadlines, Zahlungsstatus — alles an einem Ort',
        icon: Briefcase,
        path: '/dashboard/brand-deals',
        status: 'active',
      },
      {
        id: 'tax-export',
        title: 'Tax-Ready Export',
        desc: 'One-Click Export aller Einnahmen & Ausgaben — vorbereitet für den Steuerberater',
        icon: FileText,
        path: '/premium/tax-export',
        status: 'coming_soon',
      },
      {
        id: 'invoicing',
        title: 'In-App Invoicing',
        desc: 'Direkt Rechnungen an Models oder Kunden stellen — aus dem System heraus',
        icon: Receipt,
        path: '/premium/invoicing',
        status: 'coming_soon',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Protection',
    subtitle: 'Content schützen',
    icon: Shield,
    color: '#FF6B9D',
    features: [
      {
        id: 'watermark',
        title: 'Auto-Watermark Generator',
        desc: 'Jede Vorschau erhält automatisch ein CreatorHub-Wasserzeichen bis zur Freigabe',
        icon: Stamp,
        path: '/premium/watermark',
        status: 'coming_soon',
      },
      {
        id: 'audit-logs',
        title: 'Login Audit Logs',
        desc: 'Wer hat wann was geändert — vollständige Team-Transparenz',
        icon: ClipboardList,
        path: '/dashboard/audit-log',
        status: 'active',
      },
    ],
  },
]

const STATUS_BADGES = {
  active: { label: 'Aktiv', color: '#6BC9A0', bg: 'rgba(107,201,160,0.1)' },
  coming_soon: { label: 'Bald verfügbar', color: '#F5C563', bg: 'rgba(245,197,99,0.1)' },
  beta: { label: 'Beta', color: '#7EB5E6', bg: 'rgba(126,181,230,0.1)' },
}

const PremiumPage = ({ userData }) => {
  const navigate = useNavigate()
  const [expandedCat, setExpandedCat] = useState('ai')

  const totalFeatures = CATEGORIES.reduce((sum, c) => sum + c.features.length, 0)
  const activeFeatures = CATEGORIES.reduce((sum, c) => sum + c.features.filter(f => f.status === 'active').length, 0)
  const comingSoon = totalFeatures - activeFeatures

  return (
    <div>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }} className="animate-fade-in">
        <div style={{
          width: '64px', height: '64px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #F5C563, #E8A940)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px', boxShadow: '0 8px 30px rgba(245,197,99,0.3)',
        }}>
          <Crown size={28} color="white" />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#2A2420', marginBottom: '6px', letterSpacing: '-0.3px' }}>
          Premium Features
        </h2>
        <p style={{ color: '#A89B8C', fontSize: '14px', maxWidth: '320px', margin: '0 auto', lineHeight: '1.5' }}>
          High-End Tools für professionelle Teams und Creator
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }} className="animate-fade-in stagger-1">
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <Rocket size={18} color="#9B8FE6" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>{totalFeatures}</p>
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Features</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <Star size={18} color="#6BC9A0" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#6BC9A0' }}>{activeFeatures}</p>
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Aktiv</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <Clock size={18} color="#F5C563" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#F5C563' }}>{comingSoon}</p>
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Bald da</p>
        </Card>
      </div>

      {/* Upgrade Banner */}
      <div className="animate-fade-in stagger-2" style={{
        background: 'linear-gradient(135deg, rgba(245,197,99,0.12), rgba(232,169,64,0.08))',
        border: '1px solid rgba(245,197,99,0.25)',
        borderRadius: '18px', padding: '18px 20px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: 'linear-gradient(135deg, #F5C563, #E8A940)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px', marginBottom: '2px' }}>Premium-Features freischalten</p>
          <p style={{ fontSize: '12px', color: '#7A6F62' }}>Upgrade auf Pro oder Business für vollen Zugriff</p>
        </div>
        <button onClick={() => navigate('/dashboard/pricing')} style={{
          padding: '8px 14px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg, #F5C563, #E8A940)',
          color: 'white', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(245,197,99,0.3)',
        }}>
          Upgrade
        </button>
      </div>

      {/* Feature Categories */}
      {CATEGORIES.map((cat, catIdx) => {
        const CatIcon = cat.icon
        const isExpanded = expandedCat === cat.id

        return (
          <div key={cat.id} className="animate-fade-in" style={{ marginBottom: '16px' }}>
            {/* Category Header */}
            <div
              onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                borderRadius: isExpanded ? '16px 16px 0 0' : '16px',
                background: `${cat.color}08`, border: `1px solid ${cat.color}20`,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CatIcon size={20} color={cat.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '700', color: '#2A2420', fontSize: '15px' }}>{cat.title}</p>
                <p style={{ fontSize: '12px', color: '#A89B8C' }}>{cat.subtitle} — {cat.features.length} Features</p>
              </div>
              <div style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease', color: '#A89B8C',
              }}>
                <ArrowRight size={18} />
              </div>
            </div>

            {/* Features List */}
            {isExpanded && (
              <div style={{
                background: 'rgba(255,255,255,0.5)', border: `1px solid ${cat.color}15`,
                borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '8px',
              }}>
                {cat.features.map((feature, fIdx) => {
                  const FeatureIcon = feature.icon
                  const badge = STATUS_BADGES[feature.status]
                  const isClickable = feature.status === 'active' || feature.status === 'coming_soon'

                  return (
                    <div
                      key={feature.id}
                      onClick={() => isClickable && navigate(feature.path)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        padding: '14px 12px', borderRadius: '12px',
                        cursor: isClickable ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        background: 'transparent',
                        borderBottom: fIdx < cat.features.length - 1 ? '1px solid rgba(232,223,211,0.3)' : 'none',
                      }}
                      onMouseEnter={e => { if (isClickable) e.currentTarget.style.background = `${cat.color}06` }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: `${cat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FeatureIcon size={18} color={cat.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{feature.title}</span>
                          <span style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                            background: badge.bg, color: badge.color, fontWeight: '600',
                          }}>
                            {badge.label}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#7A6F62', lineHeight: '1.5' }}>{feature.desc}</p>
                      </div>
                      {feature.status === 'coming_soon' && (
                        <Lock size={14} color="#C4B8A8" style={{ marginTop: '4px', flexShrink: 0 }} />
                      )}
                      {feature.status === 'active' && (
                        <ArrowRight size={14} color={cat.color} style={{ marginTop: '4px', flexShrink: 0 }} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center', marginTop: '28px', paddingBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.6', marginBottom: '16px' }}>
          Premium-Features werden schrittweise freigeschaltet.
          Pro- und Business-Kunden erhalten frühzeitig Zugang.
        </p>
        <Button variant="cream" onClick={() => navigate('/dashboard/pricing')} style={{ padding: '14px 28px' }}>
          <Crown size={16} /> Pläne vergleichen
        </Button>
      </div>
    </div>
  )
}

export default PremiumPage
