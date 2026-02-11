import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Database, FileCheck, Server, Globe, Cookie, UserCheck, Mail } from 'lucide-react'
import Card from '../../components/Card'

const DatenschutzPage = () => {
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

  const subHeadingStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2A2420',
    marginTop: '14px',
    marginBottom: '8px',
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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Datenschutzerklarung</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>DSGVO-konforme Datenschutzrichtlinie</p>
        </div>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #6BC9A0, #4DAA82)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(107,201,160,0.3)',
        }}>
          <Shield size={20} color="white" />
        </div>
      </div>

      {/* Info Banner */}
      <Card style={{
        marginBottom: '20px', padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(107,201,160,0.08), rgba(107,201,160,0.04))',
        border: '1px solid rgba(107,201,160,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={18} color="#6BC9A0" />
          <div>
            <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px' }}>Deine Daten sind uns wichtig</p>
            <p style={{ fontSize: '12px', color: '#7A6F62' }}>Diese Erklarung informiert dich uber Art, Umfang und Zweck der Datenverarbeitung</p>
          </div>
        </div>
      </Card>

      {/* 1. Verantwortlicher */}
      <Card style={{ marginBottom: '12px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <UserCheck size={18} color="#F5C563" />
          <span>1. Verantwortlicher</span>
        </div>
        <p style={textStyle}>
          Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze sowie sonstiger datenschutzrechtlicher Bestimmungen ist:
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          CreatorHub<br />
          [Dein Name]<br />
          [Deine Adresse]<br />
          [PLZ und Ort]<br />
          Deutschland<br /><br />
          E-Mail: kontakt@creatorhub.app
        </p>
      </Card>

      {/* 2. Erhobene Daten */}
      <Card style={{ marginBottom: '12px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <Database size={18} color="#FF6B9D" />
          <span>2. Erhobene Daten</span>
        </div>
        <p style={textStyle}>
          Im Rahmen der Nutzung unserer Plattform erheben und verarbeiten wir folgende personenbezogene Daten:
        </p>

        <p style={subHeadingStyle}>Registrierungsdaten:</p>
        <p style={textStyle}>
          - E-Mail-Adresse<br />
          - Anzeigename / Benutzername<br />
          - Profilbild (bei Google-Login automatisch ubernommen)<br />
          - Gewahlte Rolle (Manager, Model)<br />
          - Zeitpunkt der Registrierung
        </p>

        <p style={subHeadingStyle}>Nutzungsdaten:</p>
        <p style={textStyle}>
          - Content-Pipeline-Daten (Titel, Status, Plattform, Notizen)<br />
          - Kalendereinzrage und Deadlines<br />
          - Chat-Nachrichten innerhalb der Plattform<br />
          - Team-Zugehorigkeit und Einladungscodes<br />
          - Hochgeladene Assets und Medien<br />
          - Rechnungs- und Zahlungsinformationen (uber Stripe)
        </p>

        <p style={subHeadingStyle}>Technische Daten:</p>
        <p style={textStyle}>
          - IP-Adresse (anonymisiert)<br />
          - Browsertyp und -version<br />
          - Betriebssystem<br />
          - Zugriffszeitpunkt
        </p>
      </Card>

      {/* 3. Rechtsgrundlage */}
      <Card style={{ marginBottom: '12px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <FileCheck size={18} color="#9B8FE6" />
          <span>3. Rechtsgrundlage</span>
        </div>
        <p style={textStyle}>
          Die Verarbeitung personenbezogener Daten erfolgt auf Basis folgender Rechtsgrundlagen:
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung):</strong><br />
          Soweit wir fur Verarbeitungsvorgange personenbezogener Daten deine Einwilligung einholen, z.B. fur den Versand von Benachrichtigungen.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfullung):</strong><br />
          Die Verarbeitung ist fur die Erfullung des Nutzungsvertrags (Registrierung und Nutzung der Plattform) erforderlich.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse):</strong><br />
          Zur Sicherstellung der Plattformfunktionalitat, Fehlerbehebung und Verbesserung des Dienstes.
        </p>
      </Card>

      {/* 4. Speicherung & Firebase */}
      <Card style={{ marginBottom: '12px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <Server size={18} color="#F5C563" />
          <span>4. Speicherung & Firebase</span>
        </div>
        <p style={textStyle}>
          Wir nutzen Google Firebase als Backend-Infrastruktur. Dabei werden Daten in der Google Cloud gespeichert.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Firebase Authentication:</strong><br />
          Zur Verwaltung der Benutzerkonten und Authentifizierung. Gespeichert werden E-Mail, Name, Profilbild-URL und Authentifizierungstokens.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Cloud Firestore:</strong><br />
          Zur Speicherung von Nutzerdaten, Content-Pipelines, Team-Informationen und Chat-Nachrichten. Die Daten werden in der EU-Region (europe-west) gespeichert.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Firebase Storage:</strong><br />
          Zur Speicherung hochgeladener Medien und Assets. Der Speicherort befindet sich in der EU.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          Google ist nach dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen zum Datenschutz bei Google findest du unter policies.google.com/privacy.
        </p>
      </Card>

      {/* 5. Drittanbieter */}
      <Card style={{ marginBottom: '12px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <Globe size={18} color="#7EB5E6" />
          <span>5. Drittanbieter</span>
        </div>

        <p style={subHeadingStyle}>Stripe (Zahlungsabwicklung)</p>
        <p style={textStyle}>
          Fur die Abwicklung kostenpflichtiger Abonnements nutzen wir den Zahlungsdienstleister Stripe, Inc. (USA) bzw. Stripe Payments Europe, Ltd. (Irland).
          Bei einer Zahlung werden Zahlungsdaten direkt an Stripe ubermittelt und dort verarbeitet. CreatorHub speichert keine vollstandigen Kreditkarten- oder Kontodaten.
          <br /><br />
          Stripe ist nach dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: stripe.com/privacy.
        </p>

        <p style={subHeadingStyle}>Google (OAuth Login)</p>
        <p style={textStyle}>
          Bei der Registrierung oder Anmeldung uber Google Login werden folgende Daten von Google an uns ubermittelt:
          Name, E-Mail-Adresse und Profilbild. Diese Daten werden ausschliesslich zur Erstellung und Verwaltung deines Benutzerkontos verwendet.
          <br /><br />
          Die Datenschutzerklarung von Google findest du unter policies.google.com/privacy.
        </p>
      </Card>

      {/* 6. Cookies */}
      <Card style={{ marginBottom: '12px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <Cookie size={18} color="#E8A940" />
          <span>6. Cookies</span>
        </div>
        <p style={textStyle}>
          CreatorHub verwendet ausschliesslich technisch notwendige Cookies. Diese sind fur den Betrieb der Plattform erforderlich und konnen nicht deaktiviert werden.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Firebase Auth Session Cookie:</strong><br />
          Dient zur Aufrechterhaltung deiner Anmeldesitzung. Dieses Cookie wird automatisch gesetzt, wenn du dich anmeldest, und beim Abmelden geloscht.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          Wir setzen keine Marketing-, Analyse- oder Tracking-Cookies ein. Es findet kein Cross-Site-Tracking statt.
        </p>
      </Card>

      {/* 7. Betroffenenrechte */}
      <Card style={{ marginBottom: '12px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <UserCheck size={18} color="#6BC9A0" />
          <span>7. Betroffenenrechte</span>
        </div>
        <p style={textStyle}>
          Nach der DSGVO stehen dir folgende Rechte zu:
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Auskunftsrecht (Art. 15 DSGVO):</strong><br />
          Du hast das Recht, Auskunft uber deine gespeicherten personenbezogenen Daten zu verlangen.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Recht auf Berichtigung (Art. 16 DSGVO):</strong><br />
          Du kannst die Berichtigung unrichtiger oder die Vervollstandigung unvollstandiger Daten verlangen.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Recht auf Loschung (Art. 17 DSGVO):</strong><br />
          Du kannst die Loschung deiner personenbezogenen Daten verlangen. Du kannst deinen Account jederzeit uber die Einstellungen loschen.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Recht auf Einschrankung (Art. 18 DSGVO):</strong><br />
          Du kannst die Einschrankung der Verarbeitung deiner Daten verlangen.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Recht auf Datenubertragbarkeit (Art. 20 DSGVO):</strong><br />
          Du hast das Recht, deine Daten in einem gangigen, maschinenlesbaren Format zu erhalten.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Widerspruchsrecht (Art. 21 DSGVO):</strong><br />
          Du kannst der Verarbeitung deiner Daten jederzeit widersprechen.
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>Beschwerderecht:</strong><br />
          Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehorde zu beschweren.
        </p>
      </Card>

      {/* 8. Kontakt */}
      <Card style={{ marginBottom: '12px', padding: '22px' }}>
        <div style={sectionTitleStyle}>
          <Mail size={18} color="#FF6B9D" />
          <span>8. Kontakt</span>
        </div>
        <p style={textStyle}>
          Fur Fragen zum Datenschutz, Auskunftsanfragen oder die Wahrnehmung deiner Betroffenenrechte kannst du uns jederzeit kontaktieren:
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          <strong style={{ color: '#2A2420' }}>E-Mail:</strong> kontakt@creatorhub.app
        </p>
        <p style={{ ...textStyle, marginTop: '12px' }}>
          Wir bemuhen uns, Anfragen innerhalb von 30 Tagen zu beantworten, wie es die DSGVO vorsieht.
        </p>
      </Card>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#C4B8A8', marginTop: '20px', marginBottom: '8px' }}>
        Stand: Februar 2025
      </p>
    </div>
  )
}

export default DatenschutzPage
