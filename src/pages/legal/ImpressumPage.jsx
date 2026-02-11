import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Mail, MapPin, User } from 'lucide-react'
import Card from '../../components/Card'

const ImpressumPage = () => {
  const navigate = useNavigate()

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2A2420',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }

  const textStyle = {
    fontSize: '14px',
    color: '#5C5349',
    lineHeight: '1.8',
    margin: 0,
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/einstellungen')} style={{
          padding: '10px', background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)',
          borderRadius: '12px', color: '#7A6F62', cursor: 'pointer', display: 'flex',
        }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Impressum</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Rechtliche Angaben</p>
        </div>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #F5C563, #E8A940)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(245,197,99,0.3)',
        }}>
          <FileText size={20} color="white" />
        </div>
      </div>

      {/* Angaben gemaess § 5 TMG */}
      <Card style={{ marginBottom: '14px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <User size={18} color="#F5C563" />
          <span>Angaben gemaess SS 5 TMG</span>
        </div>
        <p style={textStyle}>
          CreatorHub<br />
          Inhaber: [Dein Name]<br />
          [Deine Adresse]<br />
          [PLZ und Ort]<br />
          Deutschland
        </p>
      </Card>

      {/* Kontakt */}
      <Card style={{ marginBottom: '14px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <Mail size={18} color="#FF6B9D" />
          <span>Kontakt</span>
        </div>
        <p style={textStyle}>
          E-Mail: kontakt@creatorhub.app<br /><br />
          Wir sind bemuht, Anfragen schnellstmoglich zu beantworten.
          Bitte nutze die oben angegebene E-Mail-Adresse fur alle
          rechtlichen und allgemeinen Anfragen.
        </p>
      </Card>

      {/* Verantwortlich fur den Inhalt */}
      <Card style={{ marginBottom: '14px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <FileText size={18} color="#9B8FE6" />
          <span>Verantwortlich fur den Inhalt</span>
        </div>
        <p style={textStyle}>
          Verantwortlich fur den Inhalt nach SS 55 Abs. 2 RStV:<br /><br />
          [Dein Name]<br />
          [Deine Adresse]<br />
          [PLZ und Ort]<br />
          Deutschland
        </p>
      </Card>

      {/* Haftungshinweis */}
      <Card style={{ marginBottom: '14px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <MapPin size={18} color="#6BC9A0" />
          <span>Haftungshinweis</span>
        </div>
        <p style={textStyle}>
          Trotz sorgfaltiger inhaltlicher Kontrolle ubernehmen wir keine
          Haftung fur die Inhalte externer Links. Fur den Inhalt der
          verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich.
          <br /><br />
          Die auf dieser Plattform veroffentlichten Inhalte unterliegen dem
          deutschen Urheberrecht. Jede vom deutschen Urheberrecht nicht
          zugelassene Verwertung bedarf der vorherigen schriftlichen
          Zustimmung des jeweiligen Autors oder Urhebers.
        </p>
      </Card>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#C4B8A8', marginTop: '20px', marginBottom: '8px' }}>
        Stand: Februar 2026 — Beta
      </p>
    </div>
  )
}

export default ImpressumPage
