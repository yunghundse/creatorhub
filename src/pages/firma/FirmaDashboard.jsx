import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompany } from '../../contexts/CompanyContext'
import {
  Building2, Calendar, CheckSquare, FolderOpen, Users, Crown,
  ArrowRight, Clock, Sparkles, TrendingUp, Star, FileText
} from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const FirmaDashboard = ({ userData }) => {
  const navigate = useNavigate()
  const { company, isOwner, isApproved, isPending, members, hasCompany } = useCompany()
  const userRole = userData?.role || 'influencer'

  // ===== WARTE AUF FREISCHALTUNG =====
  if (isPending) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }} className="animate-fade-in">
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(245,197,99,0.15), rgba(245,197,99,0.05))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Clock size={36} color="#F5C563" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '10px' }}>Warte auf Freischaltung</h2>
          <p style={{ color: '#7A6F62', fontSize: '15px', lineHeight: '1.6', maxWidth: '320px', margin: '0 auto 20px' }}>
            Dein Beitrittsantrag bei <strong style={{ color: '#2A2420' }}>{company?.name}</strong> wird geprüft.
            Sobald dein Manager dich freigibt, hast du Zugriff auf das Team-Dashboard.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '12px',
            background: 'rgba(245,197,99,0.08)', border: '1px solid rgba(245,197,99,0.2)',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F5C563' }} />
            <span style={{ fontSize: '13px', color: '#E8A940', fontWeight: '600' }}>Ausstehend</span>
          </div>
        </div>
      </div>
    )
  }

  // ===== KEIN TEAM =====
  if (!hasCompany) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }} className="animate-fade-in">
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(126,181,230,0.15), rgba(126,181,230,0.05))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Building2 size={36} color="#7EB5E6" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '10px' }}>Noch kein Team</h2>
          <p style={{ color: '#7A6F62', fontSize: '15px', lineHeight: '1.6', maxWidth: '320px', margin: '0 auto 24px' }}>
            {['manager', 'influencer'].includes(userRole)
              ? 'Erstelle dein Team und lade Models oder Cutter ein.'
              : 'Gib den Einladungscode deines Managers ein, um beizutreten.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/einstellungen')} style={{ padding: '14px 28px' }}>
            {['manager', 'influencer'].includes(userRole) ? 'Team erstellen' : 'Code eingeben'}
          </Button>
        </div>
      </div>
    )
  }

  // ===== INHABER-VIEW (Manager / Influencer) =====
  if (isOwner) {
    const approvedCount = members.filter(m => m.status === 'approved').length
    const pendingCount = members.filter(m => m.status === 'pending').length

    return (
      <div>
        <div className="animate-fade-in" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #F5C563, #E8A940)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(245,197,99,0.3)',
            }}>
              <Crown size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>{company?.name}</h2>
              <p style={{ fontSize: '13px', color: '#A89B8C' }}>Inhaber-Dashboard</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }} className="animate-fade-in stagger-1">
          {[
            { label: 'Mitglieder', value: approvedCount, color: '#6BC9A0' },
            { label: 'Ausstehend', value: pendingCount, color: '#F5C563' },
            { label: 'Plan', value: (company?.abo || 'free').toUpperCase(), color: '#FF6B9D' },
          ].map(s => (
            <Card key={s.label} style={{ textAlign: 'center', padding: '14px 10px' }}>
              <p style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#7A6F62', marginTop: '2px' }}>{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Pending Members Alert */}
        {pendingCount > 0 && (
          <Card className="animate-fade-in stagger-2" onClick={() => navigate('/firma/admin')} style={{
            marginBottom: '16px', padding: '14px 18px', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(245,197,99,0.08), rgba(245,197,99,0.03))',
            border: '1.5px solid rgba(245,197,99,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color="#F5C563" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{pendingCount} {pendingCount === 1 ? 'Anfrage' : 'Anfragen'} warten</p>
                <p style={{ fontSize: '12px', color: '#7A6F62' }}>Neue Mitglieder freischalten</p>
              </div>
              <ArrowRight size={16} color="#F5C563" />
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#A89B8C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }} className="animate-fade-in stagger-3">Schnellzugriff</p>

        {[
          { icon: Users, label: 'Team verwalten', desc: 'Mitglieder, Einladungen, Freischaltungen', path: '/firma/admin', color: '#7EB5E6' },
          { icon: CheckSquare, label: 'Aufgaben', desc: 'To-Dos erstellen und zuweisen', path: '/firma/tasks', color: '#6BC9A0' },
          { icon: FolderOpen, label: 'Assets', desc: 'Media-Dateien und Content verwalten', path: '/firma/assets', color: '#9B8FE6' },
          { icon: Calendar, label: 'Redaktionsplan', desc: 'Termine und Postings planen', path: '/kalender', color: '#F5C563' },
          { icon: TrendingUp, label: 'Analytics', desc: 'KI-Trends und Business-Zahlen', path: '/dashboard/analytics', color: '#FF6B9D' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <Card key={item.label} onClick={() => navigate(item.path)}
              style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}
              className={`animate-fade-in stagger-${i + 4}`}>
              <div style={{ width: '40px', height: '40px', background: `${item.color}12`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={item.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{item.label}</p>
                <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '1px' }}>{item.desc}</p>
              </div>
              <ArrowRight size={16} color="#C9BFAF" />
            </Card>
          )
        })}
      </div>
    )
  }

  // ===== MITGLIEDER-VIEW (Model / Cutter) =====
  return (
    <div>
      {/* Welcome Header */}
      <div className="animate-fade-in" style={{ marginBottom: '24px' }}>
        <Card style={{
          padding: '24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(126,181,230,0.06), rgba(107,201,160,0.04))',
          border: '1.5px solid rgba(126,181,230,0.15)',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #7EB5E6, #5A9BD4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 4px 15px rgba(126,181,230,0.3)',
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2A2420', marginBottom: '6px' }}>
            Willkommen im Team von {company?.name}!
          </h2>
          <p style={{ fontSize: '14px', color: '#7A6F62', lineHeight: '1.6' }}>
            Ab jetzt nutzen wir diesen Hub als zentrale Kommandozentrale für Planung, Content und Zusammenarbeit.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '8px', marginTop: '12px',
            background: 'rgba(107,201,160,0.08)', border: '1px solid rgba(107,201,160,0.2)',
          }}>
            <Star size={12} color="#6BC9A0" />
            <span style={{ fontSize: '12px', color: '#6BC9A0', fontWeight: '600' }}>
              Freigeschaltet als {userRole === 'model' ? 'Model' : 'Cutter'}
            </span>
          </div>
        </Card>
      </div>

      {/* So arbeiten wir */}
      <p style={{ fontSize: '12px', fontWeight: '600', color: '#A89B8C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }} className="animate-fade-in stagger-1">So arbeiten wir</p>

      {[
        {
          icon: Calendar, color: '#F5C563', title: 'Redaktionsplan',
          desc: userRole === 'model'
            ? 'Hier findest du alle anstehenden Termine und Shootings. Dein Manager hat dort Strategien für Social Media hinterlegt.'
            : 'Prüfe den Kalender für anstehende Deadlines. Dein Influencer hat dort den Content-Plan eingetragen.',
        },
        {
          icon: CheckSquare, color: '#6BC9A0', title: 'Aufgaben & To-Dos',
          desc: 'In deiner Aufgabenliste findest du spezifische Anweisungen. Markiere Aufgaben als erledigt, damit der Workflow flüssig bleibt.',
        },
        {
          icon: FolderOpen, color: '#9B8FE6', title: 'Asset-Manager',
          desc: userRole === 'model'
            ? 'Lade hier dein Rohmaterial hoch. Dein Manager und Cutter erhalten sofort Zugriff und können Feedback geben.'
            : 'Hier findest du Links zum Rohmaterial und die Timestamps mit Korrekturwünschen von deinem Influencer.',
        },
      ].map((item, i) => {
        const Icon = item.icon
        return (
          <Card key={item.title} style={{ marginBottom: '10px', padding: '16px 18px' }} className={`animate-fade-in stagger-${i + 2}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: `${item.color}12`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <Icon size={18} color={item.color} />
              </div>
              <div>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: '#7A6F62', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            </div>
          </Card>
        )
      })}

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }} className="animate-fade-in stagger-5">
        <Card onClick={() => navigate('/firma/tasks')} style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
          <CheckSquare size={24} color="#6BC9A0" style={{ marginBottom: '8px' }} />
          <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Meine Aufgaben</p>
        </Card>
        <Card onClick={() => navigate('/kalender')} style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
          <Calendar size={24} color="#F5C563" style={{ marginBottom: '8px' }} />
          <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Zum Kalender</p>
        </Card>
      </div>

      {/* Company Info Footer */}
      <Card style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(42,36,32,0.02)' }} className="animate-fade-in stagger-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={16} color="#A89B8C" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', color: '#7A6F62' }}>
              <strong style={{ color: '#5C5349' }}>{company?.name}</strong> · {members.filter(m => m.status === 'approved').length + 1} Mitglieder
            </p>
          </div>
          <FileText size={14} color="#A89B8C" style={{ cursor: 'pointer' }} onClick={() => navigate('/firma/assets')} />
        </div>
      </Card>
    </div>
  )
}

export default FirmaDashboard
