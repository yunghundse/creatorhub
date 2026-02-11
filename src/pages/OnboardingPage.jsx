import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Building2, Users, Scissors, TrendingUp,
  CheckCircle, Upload, DollarSign, MessageCircle,
  Calendar, Shield, Briefcase, Timer, Layers,
  ChevronRight, ChevronLeft, Rocket, ArrowRight
} from 'lucide-react'

const ROLE_GUIDES = {
  manager: {
    color: '#F5C563',
    title: 'Manager',
    subtitle: 'Dein Team, deine Kontrolle',
    steps: [
      {
        icon: Building2, title: 'Firma erstellen',
        desc: 'Geh zu "Firma" und erstelle deine Firma. Du erhältst einen Einladungscode, den du an deine Models weitergeben kannst.',
        tip: 'Dein Einladungscode kann jederzeit erneuert werden.',
      },
      {
        icon: CheckCircle, title: 'Content freigeben',
        desc: 'Unter "Freigaben" siehst du alle Content-Einreichungen deiner Models. Mit einem Klick freigeben oder mit Feedback ablehnen.',
        tip: 'Models sehen dein Feedback direkt in ihrer Ansicht.',
      },
      {
        icon: DollarSign, title: 'Revenue aufteilen',
        desc: 'Unter "Revenue" trägst du Einnahmen ein und stellst den Split-Prozentsatz per Slider ein. Das System berechnet automatisch die Anteile.',
        tip: 'Du kannst nach Model und Plattform filtern.',
      },
      {
        icon: Briefcase, title: 'Brand Deals verwalten',
        desc: 'Unter "Deals" trackst du Kooperationen: Brand, Wert, Deadline und Status. Der Status läuft von Verhandlung bis Bezahlt.',
        tip: 'Überfällige Deals werden rot markiert.',
      },
      {
        icon: TrendingUp, title: 'Trends & Analytics',
        desc: '"Analytics" zeigt dir Statistiken deines Teams. "Trends" zeigt aktuelle Plattform-Trends mit AI-Vorschlägen.',
        tip: 'Im Audit-Log siehst du, wer wann was geändert hat.',
      },
    ],
  },
  model: {
    color: '#FF6B9D',
    title: 'Model',
    subtitle: 'Content einreichen, Kalender planen',
    steps: [
      {
        icon: CheckCircle, title: 'Content einreichen',
        desc: 'Unter "Freigaben" lädst du deinen Content hoch (Bild, Video, Album). Dein Manager bekommt eine Benachrichtigung und kann freigeben oder Feedback geben.',
        tip: 'Du siehst den Status: Offen, Freigegeben oder Abgelehnt mit Feedback.',
      },
      {
        icon: Calendar, title: 'Kalender nutzen',
        desc: 'Unter "Kalender" planst du deine Termine: Shootings, Streams, Meetings. Dein Manager sieht deinen Kalender mit.',
        tip: 'Verschiedene Event-Typen haben verschiedene Farben.',
      },
      {
        icon: Upload, title: 'Assets verwalten',
        desc: 'Unter "Assets" lädst du Material hoch und setzt den Status: Rohmaterial → In Bearbeitung → Ready for Post.',
        tip: 'Filter nach Status, um den Überblick zu behalten.',
      },
      {
        icon: MessageCircle, title: 'Chat nutzen',
        desc: 'Im Chat kommunizierst du direkt mit deinem Manager — geschäftlich getrennt von privat.',
        tip: 'Nachrichten sind in Echtzeit.',
      },
    ],
  },
  admin: {
    color: '#FF6B9D',
    title: 'Admin',
    subtitle: 'Volle Kontrolle über die Plattform',
    steps: [
      {
        icon: Shield, title: 'Admin-Panel',
        desc: 'Im Admin-Panel verwaltest du alle User: Freischalten, Blockieren, Rollen einsehen. Du kannst den Wartungsmodus aktivieren.',
        tip: 'Du hast Zugriff auf ALLE Bereiche der App.',
      },
      {
        icon: TrendingUp, title: 'Analytics & Audit',
        desc: 'Analytics zeigt dir plattformweite Statistiken. Im Audit-Log siehst du alle Aktionen aller Teams.',
        tip: 'Der Audit-Log filtert nach Aktionstyp.',
      },
    ],
  },
}

const OnboardingPage = ({ userData }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const role = userData?.role || 'model'
  const guide = ROLE_GUIDES[role] || ROLE_GUIDES.model

  const step = guide.steps[currentStep]
  const StepIcon = step?.icon || Sparkles
  const isLast = currentStep === guide.steps.length - 1

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '18px',
          background: `linear-gradient(135deg, ${guide.color}40, ${guide.color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', boxShadow: `0 8px 24px ${guide.color}30`,
        }}>
          <Rocket size={26} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#2A2420', marginBottom: '4px' }}>
          Willkommen, {guide.title}!
        </h2>
        <p style={{ color: '#A89B8C', fontSize: '14px' }}>{guide.subtitle}</p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        {guide.steps.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: i <= currentStep ? guide.color : 'rgba(232,223,211,0.5)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Step Card */}
      <div style={{
        flex: 1, background: 'rgba(255,253,247,0.8)', backdropFilter: 'blur(12px)',
        borderRadius: '20px', border: '1px solid rgba(232,223,211,0.5)',
        padding: '28px 24px', marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: `${guide.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <StepIcon size={24} color={guide.color} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500' }}>Schritt {currentStep + 1} von {guide.steps.length}</p>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420' }}>{step.title}</h3>
          </div>
        </div>

        <p style={{ fontSize: '15px', color: '#5C5349', lineHeight: '1.7', marginBottom: '16px' }}>
          {step.desc}
        </p>

        {step.tip && (
          <div style={{
            padding: '12px 16px', background: `${guide.color}08`, borderRadius: '12px',
            border: `1px solid ${guide.color}20`,
          }}>
            <p style={{ fontSize: '13px', color: guide.color, fontWeight: '500' }}>
              💡 {step.tip}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {currentStep > 0 && (
          <button onClick={() => setCurrentStep(currentStep - 1)} style={{
            padding: '14px 20px', background: 'rgba(42,36,32,0.04)',
            border: '1.5px solid #E8DFD3', borderRadius: '14px',
            color: '#7A6F62', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
          }}>
            <ChevronLeft size={18} /> Zurück
          </button>
        )}

        {isLast ? (
          <button onClick={() => navigate('/')} style={{
            flex: 1, padding: '14px 20px',
            background: `linear-gradient(135deg, ${guide.color}cc, ${guide.color})`,
            border: 'none', borderRadius: '14px',
            color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: `0 4px 16px ${guide.color}40`, fontFamily: 'inherit',
          }}>
            <Sparkles size={18} /> Loslegen!
          </button>
        ) : (
          <button onClick={() => setCurrentStep(currentStep + 1)} style={{
            flex: 1, padding: '14px 20px',
            background: `linear-gradient(135deg, ${guide.color}cc, ${guide.color})`,
            border: 'none', borderRadius: '14px',
            color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: `0 4px 16px ${guide.color}40`, fontFamily: 'inherit',
          }}>
            Weiter <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Skip */}
      <button onClick={() => navigate('/')} style={{
        marginTop: '12px', padding: '10px', background: 'none', border: 'none',
        color: '#A89B8C', fontSize: '13px', cursor: 'pointer', textAlign: 'center',
        width: '100%', fontFamily: 'inherit',
      }}>
        Einweisung überspringen
      </button>
    </div>
  )
}

export default OnboardingPage
