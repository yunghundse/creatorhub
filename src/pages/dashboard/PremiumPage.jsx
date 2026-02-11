import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Crown, Brain, Zap, Shield, DollarSign, ArrowRight,
  TrendingUp, Repeat, Inbox, Pencil, UserCheck, GitBranch,
  Briefcase, FileText, Receipt, Stamp, ClipboardList, Lock, Clock, Rocket, Wand2,
  Wrench
} from 'lucide-react'
import Card from '../../components/Card'

const CATEGORIES = [
  {
    id: 'ai',
    title: 'AI-Driven Automation',
    subtitle: 'KI-gesteuerte Intelligence',
    icon: Brain,
    color: '#9B8FE6',
    features: [
      { id: 'viral-predictor', title: 'Viral Predictor', desc: 'Analysiert Skripte & Thumbnails — Viralitäts-Score 1-100 basierend auf Echtzeit-Trends', icon: TrendingUp },
      { id: 'auto-repurposing', title: 'Auto-Repurposing Planer', desc: 'YouTube-Video geplant? KI generiert 5 TikTok-Hooks und 3 Instagram-Story-Konzepte', icon: Repeat },
      { id: 'smart-inbox', title: 'Smart Inbox Tagging', desc: 'KI sortiert Nachrichten nach Priorität: Booking, Support, Spam — automatisch', icon: Inbox },
      { id: 'caption-writer', title: 'KI Caption Generator', desc: 'Captions für Instagram, TikTok, YouTube & mehr — auf Knopfdruck generiert', icon: Wand2 },
    ],
  },
  {
    id: 'workflow',
    title: 'Workflow & Collaboration',
    subtitle: 'Deep-Tech für Teams',
    icon: Zap,
    color: '#7EB5E6',
    features: [
      { id: 'visual-annotation', title: 'Visual Annotation Tool', desc: 'Markierungen direkt in Bildern & Videos setzen — "Hier Licht anpassen", "Frame schneiden"', icon: Pencil },
      { id: 'ghost-mode', title: 'Ghost-Mode für Manager', desc: 'Manager loggt sich in Model-Account ein — getrennte Logs, Model bleibt online', icon: UserCheck },
      { id: 'asset-versioning', title: 'Asset Versioning', desc: 'Verschiedene Edit-Versionen (v1, v2, Final) hochladen — direkter Vergleich', icon: GitBranch },
    ],
  },
  {
    id: 'business',
    title: 'Business & Monetarisierung',
    subtitle: 'Revenue optimieren',
    icon: DollarSign,
    color: '#F5C563',
    features: [
      { id: 'brand-deal-crm', title: 'Brand Deal CRM', desc: 'Verträge, Deadlines, Zahlungsstatus — alles an einem Ort', icon: Briefcase },
      { id: 'tax-export', title: 'Tax-Ready Export', desc: 'One-Click Export aller Einnahmen & Ausgaben — vorbereitet für den Steuerberater', icon: FileText },
      { id: 'invoicing', title: 'In-App Invoicing', desc: 'Direkt Rechnungen an Models oder Kunden stellen — aus dem System heraus', icon: Receipt },
    ],
  },
  {
    id: 'security',
    title: 'Security & Protection',
    subtitle: 'Content schützen',
    icon: Shield,
    color: '#FF6B9D',
    features: [
      { id: 'watermark', title: 'Auto-Watermark Generator', desc: 'Jede Vorschau erhält automatisch ein CreatorHub-Wasserzeichen bis zur Freigabe', icon: Stamp },
      { id: 'audit-logs', title: 'Login Audit Logs', desc: 'Wer hat wann was geändert — vollständige Team-Transparenz', icon: ClipboardList },
    ],
  },
]

const PremiumPage = ({ userData }) => {
  const navigate = useNavigate()
  const [expandedCat, setExpandedCat] = useState('ai')

  const totalFeatures = CATEGORIES.reduce((sum, c) => sum + c.features.length, 0)

  return (
    <div>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }} className="animate-fade-in">
        <div style={{
          width: '64px', height: '64px', borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(168,155,140,0.2), rgba(168,155,140,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <Wrench size={28} color="#A89B8C" />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#2A2420', marginBottom: '6px', letterSpacing: '-0.3px' }}>
          Premium Features
        </h2>
        <p style={{ color: '#A89B8C', fontSize: '14px', maxWidth: '320px', margin: '0 auto', lineHeight: '1.5' }}>
          High-End Tools für professionelle Teams und Creator
        </p>
      </div>

      {/* Wartungsmodus Banner */}
      <div className="animate-fade-in stagger-1" style={{
        background: 'linear-gradient(135deg, rgba(245,197,99,0.1), rgba(168,155,140,0.06))',
        border: '1.5px solid rgba(245,197,99,0.2)',
        borderRadius: '18px', padding: '20px',
        marginBottom: '24px', textAlign: 'center',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: 'rgba(245,197,99,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <Clock size={22} color="#E8A940" />
        </div>
        <p style={{ fontWeight: '700', color: '#2A2420', fontSize: '16px', marginBottom: '6px' }}>
          Wartungsmodus
        </p>
        <p style={{ fontSize: '13px', color: '#7A6F62', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto' }}>
          Alle Premium-Features befinden sich derzeit in Entwicklung. Du wirst benachrichtigt, sobald sie verfügbar sind.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }} className="animate-fade-in stagger-2">
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <Rocket size={18} color="#A89B8C" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>{totalFeatures}</p>
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Geplante Features</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <Clock size={18} color="#F5C563" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#F5C563' }}>{totalFeatures}</p>
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>In Entwicklung</p>
        </Card>
      </div>

      {/* Feature Categories */}
      {CATEGORIES.map((cat) => {
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

                  return (
                    <div
                      key={feature.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        padding: '14px 12px', borderRadius: '12px',
                        cursor: 'default',
                        borderBottom: fIdx < cat.features.length - 1 ? '1px solid rgba(232,223,211,0.3)' : 'none',
                        opacity: 0.7,
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: `${cat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FeatureIcon size={18} color={cat.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontWeight: '600', color: '#7A6F62', fontSize: '14px' }}>{feature.title}</span>
                          <span style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                            background: 'rgba(245,197,99,0.1)', color: '#E8A940', fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '3px',
                          }}>
                            <Clock size={8} /> Kommt bald
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.5' }}>{feature.desc}</p>
                      </div>
                      <Lock size={14} color="#C4B8A8" style={{ marginTop: '4px', flexShrink: 0 }} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Bottom Info */}
      <div style={{ textAlign: 'center', marginTop: '28px', paddingBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.6' }}>
          Premium-Features werden schrittweise entwickelt und freigeschaltet.
          Du wirst benachrichtigt, sobald neue Features verfügbar sind.
        </p>
      </div>
    </div>
  )
}

export default PremiumPage
