import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, ArrowLeft, Tag, Star, AlertTriangle, Trash2, Briefcase, HelpCircle, MessageCircle, Filter } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const DEMO_MESSAGES = [
  { id: 1, from: 'FashionNova Agency', subject: 'Brand Partnership Q2 2026', preview: 'Wir möchten eine langfristige Zusammenarbeit...', tag: 'booking', priority: 'high', time: '10:32' },
  { id: 2, from: 'Max Mustermann', subject: 'Frage zu deinem letzten Video', preview: 'Hey, ich wollte wissen ob du das Produkt wirklich...', tag: 'support', priority: 'low', time: '09:15' },
  { id: 3, from: 'ColabPartner GmbH', subject: 'Rechnung Nr. 2026-0412', preview: 'Anbei die Rechnung für die letzte Kampagne...', tag: 'billing', priority: 'medium', time: '08:45' },
  { id: 4, from: 'unknown_user_3847', subject: 'FREE FOLLOWERS!!!', preview: 'Get 10k followers in 24h guaranteed!!', tag: 'spam', priority: 'none', time: '07:20' },
  { id: 5, from: 'TikTok Creator Fund', subject: 'Deine Auszahlung für Januar', preview: 'Deine Creator Fund Auszahlung von...', tag: 'billing', priority: 'high', time: 'Gestern' },
  { id: 6, from: 'Studio Berlin', subject: 'Shooting-Termin 15.03.', preview: 'Bestätigung für dein Shooting am 15. März um 14:00...', tag: 'booking', priority: 'medium', time: 'Gestern' },
]

const TAG_CONFIG = {
  booking: { label: 'Booking', color: '#7EB5E6', icon: Briefcase },
  support: { label: 'Support', color: '#F5C563', icon: HelpCircle },
  billing: { label: 'Billing', color: '#6BC9A0', icon: Star },
  spam: { label: 'Spam', color: '#DC2626', icon: Trash2 },
  other: { label: 'Sonstiges', color: '#A89B8C', icon: MessageCircle },
}

const PRIORITY_COLORS = {
  high: '#FF6B9D',
  medium: '#F5C563',
  low: '#A89B8C',
  none: '#E8DFD3',
}

const SmartInboxPage = ({ userData }) => {
  const navigate = useNavigate()
  const [messages] = useState(DEMO_MESSAGES)
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedMsg, setSelectedMsg] = useState(null)

  const filtered = activeFilter === 'all' ? messages : messages.filter(m => m.tag === activeFilter)
  const tagCounts = messages.reduce((acc, m) => { acc[m.tag] = (acc[m.tag] || 0) + 1; return acc }, {})

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/premium')} style={{
          padding: '10px', background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)',
          borderRadius: '12px', color: '#7A6F62', cursor: 'pointer', display: 'flex',
        }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Smart Inbox</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>KI-sortiert nach Priorität & Thema</p>
        </div>
        <span style={{
          marginLeft: 'auto', padding: '4px 10px', borderRadius: '8px',
          background: 'rgba(245,197,99,0.1)', color: '#F5C563', fontSize: '11px', fontWeight: '700',
        }}>PREVIEW</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {Object.entries(TAG_CONFIG).filter(([k]) => k !== 'other').map(([key, cfg]) => {
          const TagIcon = cfg.icon
          return (
            <Card key={key} style={{ textAlign: 'center', padding: '12px 8px' }}>
              <TagIcon size={16} color={cfg.color} style={{ margin: '0 auto 4px' }} />
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420' }}>{tagCounts[key] || 0}</p>
              <p style={{ fontSize: '10px', color: '#A89B8C' }}>{cfg.label}</p>
            </Card>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button onClick={() => setActiveFilter('all')} style={{
          padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '500',
          background: activeFilter === 'all' ? 'rgba(42,36,32,0.08)' : 'rgba(42,36,32,0.04)',
          color: activeFilter === 'all' ? '#2A2420' : '#7A6F62', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>Alle ({messages.length})</button>
        {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setActiveFilter(key)} style={{
            padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '500',
            background: activeFilter === key ? `${cfg.color}18` : 'rgba(42,36,32,0.04)',
            color: activeFilter === key ? cfg.color : '#7A6F62', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{cfg.label}</button>
        ))}
      </div>

      {/* Messages */}
      {filtered.map(msg => {
        const tagCfg = TAG_CONFIG[msg.tag] || TAG_CONFIG.other
        const TagIcon = tagCfg.icon
        return (
          <Card key={msg.id} onClick={() => setSelectedMsg(selectedMsg === msg.id ? null : msg.id)} style={{
            marginBottom: '8px', padding: '14px 16px', cursor: 'pointer',
            borderLeft: `3px solid ${PRIORITY_COLORS[msg.priority]}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{msg.from}</span>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                    background: `${tagCfg.color}12`, color: tagCfg.color, fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '3px',
                  }}>
                    <TagIcon size={10} /> {tagCfg.label}
                  </span>
                  {msg.priority === 'high' && (
                    <AlertTriangle size={13} color="#FF6B9D" />
                  )}
                </div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#5C5349', marginBottom: '2px' }}>{msg.subject}</p>
                <p style={{ fontSize: '12px', color: '#A89B8C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>{msg.preview}</p>
              </div>
              <span style={{ fontSize: '11px', color: '#C4B8A8', whiteSpace: 'nowrap' }}>{msg.time}</span>
            </div>

            {selectedMsg === msg.id && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(232,223,211,0.4)' }}>
                <p style={{ fontSize: '13px', color: '#5C5349', lineHeight: '1.6', marginBottom: '12px' }}>{msg.preview}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px',
                    background: 'rgba(107,201,160,0.1)', color: '#6BC9A0', cursor: 'pointer', fontWeight: '500',
                  }}>Antworten</button>
                  <button style={{
                    padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px',
                    background: 'rgba(42,36,32,0.04)', color: '#7A6F62', cursor: 'pointer', fontWeight: '500',
                  }}>Archivieren</button>
                  {msg.tag === 'spam' && (
                    <button style={{
                      padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px',
                      background: 'rgba(220,38,38,0.06)', color: '#DC2626', cursor: 'pointer', fontWeight: '500',
                    }}>Blockieren</button>
                  )}
                </div>
              </div>
            )}
          </Card>
        )
      })}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '12px', color: '#A89B8C' }}>
          Smart Inbox wird mit OnlyFans & E-Mail Integration im Pro-Plan verfügbar.
        </p>
      </div>
    </div>
  )
}

export default SmartInboxPage
