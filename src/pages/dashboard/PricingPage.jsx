import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Crown, Check, Star, Zap, Users, Shield, ArrowLeft, Sparkles, Lock, Clock,
  Brain, Repeat, Inbox, Pencil, UserCheck, GitBranch, FileText, Receipt, Stamp
} from 'lucide-react'
import Card from '../../components/Card'

const FREE_FEATURES = [
  '1 Teammitglied',
  'Content Pipeline',
  'Kalender & Terminplanung',
  'Firma erstellen & Team einladen',
  'Aufgaben & Assets verwalten',
  'Benachrichtigungen',
  'Einladungscodes',
]

const PRO_FEATURES = [
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
]

const BUSINESS_FEATURES = [
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

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }} className="animate-fade-in">
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', left: '20px', padding: '8px', background: 'rgba(42,36,32,0.04)',
          border: 'none', borderRadius: '10px', color: '#7A6F62', cursor: 'pointer',
        }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{
          width: '56px', height: '56px', borderRadius: '18px',
          background: 'linear-gradient(135deg, #7EB5E6, #5A9BD4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(126,181,230,0.3)',
        }}>
          <Crown size={26} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#2A2420', marginBottom: '6px' }}>Unsere Pläne</h2>
        <p style={{ color: '#A89B8C', fontSize: '14px' }}>Skaliere dein Team mit dem richtigen Abo</p>
      </div>

      {/* ===== FREE PLAN — AKTIV ===== */}
      <Card style={{
        padding: '0', overflow: 'hidden', marginBottom: '14px',
        border: '2px solid #6BC9A0',
        boxShadow: '0 8px 30px rgba(107,201,160,0.1)',
      }} className="animate-fade-in stagger-1">
        <div style={{
          padding: '6px 16px',
          background: 'linear-gradient(135deg, #6BC9A0cc, #6BC9A0)',
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

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'rgba(107,201,160,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Star size={22} color="#6BC9A0" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420', margin: 0 }}>Free</h3>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#2A2420' }}>Gratis</span>
            </div>
          </div>

          <div style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
            background: 'rgba(107,201,160,0.06)', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Users size={16} color="#6BC9A0" />
            <span style={{ fontSize: '13px', color: '#5C5349', fontWeight: '500' }}>
              Bis zu <strong style={{ color: '#6BC9A0' }}>1</strong> Teammitglied
            </span>
          </div>

          {FREE_FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
              <Check size={15} color="#6BC9A0" strokeWidth={3} />
              <span style={{ fontSize: '13px', color: '#5C5349' }}>{f}</span>
            </div>
          ))}

          <button disabled style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none', marginTop: '16px',
            background: 'rgba(107,201,160,0.1)', color: '#6BC9A0',
            fontWeight: '700', fontSize: '15px', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'default', opacity: 0.8,
          }}>
            <Check size={16} /> Aktueller Plan
          </button>
        </div>
      </Card>

      {/* ===== PRO PLAN — WARTUNG ===== */}
      <Card style={{
        padding: '0', overflow: 'hidden', marginBottom: '14px',
        border: '1.5px solid rgba(245,197,99,0.25)',
        opacity: 0.85,
      }} className="animate-fade-in stagger-2">
        <div style={{
          padding: '8px 16px',
          background: 'linear-gradient(135deg, rgba(245,197,99,0.12), rgba(245,197,99,0.06))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(245,197,99,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={14} color="#E8A940" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#E8A940', letterSpacing: '0.5px' }}>PRO</span>
          </div>
          <span style={{
            padding: '3px 12px', borderRadius: '8px',
            background: 'rgba(245,197,99,0.1)', color: '#E8A940',
            fontSize: '11px', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Clock size={10} /> Kommt bald
          </span>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'rgba(245,197,99,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={22} color="#F5C563" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420', margin: 0 }}>Pro</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#2A2420' }}>29€</span>
                <span style={{ fontSize: '14px', color: '#A89B8C' }}>/ Monat</span>
              </div>
            </div>
          </div>

          <div style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
            background: 'rgba(245,197,99,0.06)', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Users size={16} color="#F5C563" />
            <span style={{ fontSize: '13px', color: '#5C5349', fontWeight: '500' }}>
              Bis zu <strong style={{ color: '#F5C563' }}>5</strong> Teammitglieder
            </span>
          </div>

          {PRO_FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
              <Check size={15} color="#C4B8A8" strokeWidth={3} />
              <span style={{ fontSize: '13px', color: '#A89B8C' }}>{f}</span>
            </div>
          ))}

          <button disabled style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none', marginTop: '16px',
            background: 'linear-gradient(135deg, rgba(245,197,99,0.12), rgba(245,197,99,0.06))',
            color: '#C4B08A', fontWeight: '700', fontSize: '15px', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'not-allowed', opacity: 0.7,
          }}>
            <Lock size={14} /> Bald verfügbar
          </button>
        </div>
      </Card>

      {/* ===== BUSINESS PLAN — WARTUNG ===== */}
      <Card style={{
        padding: '0', overflow: 'hidden', marginBottom: '14px',
        border: '1.5px solid rgba(255,107,157,0.2)',
        opacity: 0.85,
      }} className="animate-fade-in stagger-3">
        <div style={{
          padding: '8px 16px',
          background: 'linear-gradient(135deg, rgba(255,107,157,0.1), rgba(255,107,157,0.04))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,107,157,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={14} color="#FF6B9D" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#FF6B9D', letterSpacing: '0.5px' }}>BUSINESS</span>
          </div>
          <span style={{
            padding: '3px 12px', borderRadius: '8px',
            background: 'rgba(255,107,157,0.08)', color: '#FF6B9D',
            fontSize: '11px', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Clock size={10} /> Kommt bald
          </span>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'rgba(255,107,157,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={22} color="#FF6B9D" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420', margin: 0 }}>Business</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#2A2420' }}>79€</span>
                <span style={{ fontSize: '14px', color: '#A89B8C' }}>/ Monat</span>
              </div>
            </div>
          </div>

          <div style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
            background: 'rgba(255,107,157,0.04)', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Users size={16} color="#FF6B9D" />
            <span style={{ fontSize: '13px', color: '#5C5349', fontWeight: '500' }}>
              Bis zu <strong style={{ color: '#FF6B9D' }}>10</strong> Teammitglieder
            </span>
          </div>

          {BUSINESS_FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
              <Check size={15} color="#C4B8A8" strokeWidth={3} />
              <span style={{ fontSize: '13px', color: '#A89B8C' }}>{f}</span>
            </div>
          ))}

          <button disabled style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none', marginTop: '16px',
            background: 'linear-gradient(135deg, rgba(255,107,157,0.1), rgba(255,107,157,0.04))',
            color: '#D4849B', fontWeight: '700', fontSize: '15px', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'not-allowed', opacity: 0.7,
          }}>
            <Lock size={14} /> Bald verfügbar
          </button>
        </div>
      </Card>

      {/* Premium Feature Übersicht */}
      <div style={{ marginTop: '24px', marginBottom: '16px' }} className="animate-fade-in stagger-4">
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2A2420', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#9B8FE6" /> Premium-Features Vorschau
        </h3>
        {PREMIUM_FEATURES.map((f, i) => {
          const FIcon = f.icon
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              borderRadius: '10px', marginBottom: '4px',
            }}>
              <FIcon size={16} color="#C4B8A8" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#A89B8C' }}>{f.name}</span>
                <span style={{ fontSize: '11px', color: '#C4B8A8', marginLeft: '8px' }}>{f.desc}</span>
              </div>
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600',
                background: 'rgba(168,155,140,0.08)', color: '#A89B8C',
                display: 'flex', alignItems: 'center', gap: '3px',
              }}>
                <Lock size={8} /> {f.plan}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '20px', padding: '16px' }}>
        <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.6' }}>
          Derzeit ist nur der kostenlose Plan verfügbar. Pro und Business
          werden bald freigeschaltet — du wirst benachrichtigt, sobald es soweit ist.
        </p>
      </div>
    </div>
  )
}

export default PricingPage
