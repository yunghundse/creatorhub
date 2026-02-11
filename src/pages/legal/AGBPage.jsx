import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ScrollText, Scale } from 'lucide-react'
import Card from '../../components/Card'

const AGBPage = () => {
  const navigate = useNavigate()

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2A2420',
    marginBottom: '12px',
  }

  const textStyle = {
    fontSize: '14px',
    color: '#5C5349',
    lineHeight: '1.8',
    margin: 0,
  }

  const sections = [
    {
      title: 'SS1 Geltungsbereich',
      content: `Diese Allgemeinen Geschaftsbedingungen (AGB) gelten fur die Nutzung der Plattform CreatorHub (nachfolgend "Plattform" genannt), betrieben von CreatorHub, [Dein Name], [Deine Adresse].

Die Plattform bietet Werkzeuge fur Content-Creator, Manager und Models zur Organisation, Zusammenarbeit und Verwaltung von Inhalten und Teams.

Mit der Registrierung und Nutzung der Plattform erklarst du dich mit diesen AGB einverstanden. Abweichende Bedingungen werden nur anerkannt, wenn sie von uns schriftlich bestatigt werden.`,
    },
    {
      title: 'SS2 Registrierung',
      content: `Die Nutzung der Plattform setzt eine Registrierung voraus. Du kannst dich per E-Mail oder uber Google-Login registrieren.

Bei der Registrierung bist du verpflichtet, wahrheitsgemaesse Angaben zu machen. Jede Person darf nur ein Konto erstellen.

Die Freischaltung bestimmter Funktionen kann eine Einladung durch einen Administrator oder Manager erfordern. CreatorHub behalt sich das Recht vor, Registrierungen ohne Angabe von Grunden abzulehnen.

Du bist fur die Sicherheit deiner Zugangsdaten selbst verantwortlich und darfst diese nicht an Dritte weitergeben.`,
    },
    {
      title: 'SS3 Rollen und Berechtigungen',
      content: `Bei der Registrierung wahlst du eine Rolle (Manager oder Model). Diese Rolle bestimmt deine Berechtigungen innerhalb der Plattform.

Die Rolle kann nach der Registrierung nicht eigenstandig geandert werden. Eine Anderung ist nur durch den Plattformbetreiber auf Anfrage moglich.

Manager konnen Teams erstellen und Einladungscodes generieren. Models konnen Teams uber Einladungscodes beitreten.

Die Zuweisung bestimmter Funktionen ist rollenabhangig und kann sich je nach gewahltem Abonnement unterscheiden.`,
    },
    {
      title: 'SS4 Beta-Phase & Zahlungen',
      content: `CreatorHub befindet sich derzeit in der Beta-Phase. Wahrend der Beta ist die Nutzung der Plattform kostenlos. Es konnen sich maximal 10 Manager registrieren, die jeweils 1 Model einladen konnen.

Zukunftig wird CreatorHub verschiedene Abonnement-Plane anbieten (Free, Pro, Business). Der Funktionsumfang wird je nach gewahltem Plan variieren. Kostenpflichtige Abonnements werden monatlich uber den Zahlungsdienstleister Stripe abgerechnet. Es gelten zusatzlich die Nutzungsbedingungen von Stripe.

Die Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern anwendbar. Preisanderungen werden mindestens 30 Tage im Voraus angekundigt.

Es besteht ein 14-tagiges Widerrufsrecht ab Vertragsschluss. Der Widerruf kann formlos per E-Mail an kontakt@creatorhub.app erfolgen.`,
    },
    {
      title: 'SS5 Haftungsausschluss',
      content: `CreatorHub stellt die Plattform "wie besehen" zur Verfugung. Wir ubernehmen keine Garantie fur die ununterbrochene Verfugbarkeit der Plattform.

Der Betreiber haftet nicht fur Inhalte, die von Nutzern erstellt, hochgeladen oder geteilt werden. Jeder Nutzer ist fur seine eigenen Inhalte selbst verantwortlich.

CreatorHub haftet nicht fur Schaden, die durch die Nutzung oder Nichtnutzung der Plattform entstehen, es sei denn, es liegt Vorsatz oder grobe Fahrlassigkeit seitens des Betreibers vor.

KI-generierte Inhalte (z.B. Captions, Analysen) dienen als Vorschlage und Hilfestellung. CreatorHub ubernimmt keine Gewahr fur deren Richtigkeit, Vollstandigkeit oder Eignung fur bestimmte Zwecke.`,
    },
    {
      title: 'SS6 Datenschutz',
      content: `Der Schutz deiner personenbezogenen Daten ist uns wichtig. Details zur Erhebung, Verarbeitung und Nutzung deiner Daten findest du in unserer separaten Datenschutzerklarung.

Mit der Nutzung der Plattform erklarst du dich mit der Verarbeitung deiner Daten gemaess unserer Datenschutzerklarung einverstanden.

Wir setzen technische und organisatorische Massnahmen ein, um deine Daten vor unbefugtem Zugriff, Verlust oder Missbrauch zu schutzen.`,
    },
    {
      title: 'SS7 Kundigung und Loschung',
      content: `Du kannst dein Konto jederzeit uber die Einstellungen der Plattform loschen. Mit der Loschung werden alle personenbezogenen Daten unwiderruflich entfernt.

Bei kostenpflichtigen Abonnements kann die Kundigung jederzeit zum Ende der aktuellen Abrechnungsperiode erfolgen. Bereits gezahlte Betrage werden nicht erstattet, sofern nicht gesetzlich vorgeschrieben.

CreatorHub behalt sich das Recht vor, Konten bei Verstoss gegen diese AGB, bei missbrachlicher Nutzung oder bei langerer Inaktivitat (mehr als 12 Monate) zu sperren oder zu loschen. In diesem Fall wirst du vorab per E-Mail benachrichtigt.

Bei Loschung eines Manager-Kontos werden Teammitglieder automatisch aus dem Team entfernt. Inhalte, die dem Team zugeordnet sind, konnen nicht wiederhergestellt werden.`,
    },
    {
      title: 'SS8 Anderungen der AGB',
      content: `CreatorHub behalt sich das Recht vor, diese AGB jederzeit zu andern. Anderungen werden mindestens 14 Tage vor Inkrafttreten per E-Mail oder In-App-Benachrichtigung angekundigt.

Widersprichst du den Anderungen nicht innerhalb von 14 Tagen nach Zugang der Ankundigung, gelten die geanderten AGB als akzeptiert. Im Falle eines Widerspruchs besteht ein Sonderkundigungsrecht.

Die jeweils aktuelle Fassung der AGB ist jederzeit in der App unter den Einstellungen einsehbar.`,
    },
    {
      title: 'SS9 Schlussbestimmungen',
      content: `Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist, soweit gesetzlich zulassig, der Sitz des Betreibers.

Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der ubrigen Bestimmungen davon unberuhrt. Anstelle der unwirksamen Bestimmung tritt eine Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nachsten kommt.

Mundliche Nebenabreden bestehen nicht. Anderungen und Erganzungen dieser AGB bedurfen der Textform.

Bei Fragen zu diesen AGB kannst du uns jederzeit unter kontakt@creatorhub.app kontaktieren.`,
    },
  ]

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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Allgemeine Geschaftsbedingungen</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>AGB der Plattform CreatorHub</p>
        </div>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #F5C563, #E8A940)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(245,197,99,0.3)',
        }}>
          <ScrollText size={20} color="white" />
        </div>
      </div>

      {/* Info Banner */}
      <Card style={{
        marginBottom: '20px', padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(245,197,99,0.08), rgba(245,197,99,0.04))',
        border: '1px solid rgba(245,197,99,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale size={18} color="#E8A940" />
          <div>
            <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px' }}>Stand: Februar 2026 — Beta</p>
            <p style={{ fontSize: '12px', color: '#7A6F62' }}>Bitte lies diese Bedingungen sorgfaltig durch</p>
          </div>
        </div>
      </Card>

      {/* AGB Sections */}
      {sections.map((section, index) => (
        <Card key={index} style={{ marginBottom: '12px', padding: '22px' }}>
          <h3 style={sectionTitleStyle}>{section.title}</h3>
          <p style={textStyle}>{section.content}</p>
        </Card>
      ))}

      {/* Footer */}
      <Card style={{
        marginBottom: '8px', padding: '16px', textAlign: 'center',
        background: 'rgba(42,36,32,0.02)', border: '1px solid rgba(232,223,211,0.4)',
      }}>
        <p style={{ fontSize: '12px', color: '#A89B8C', lineHeight: '1.6' }}>
          Bei Fragen zu diesen AGB wende dich bitte an:<br />
          <strong style={{ color: '#5C5349' }}>kontakt@creatorhub.app</strong>
        </p>
      </Card>
    </div>
  )
}

export default AGBPage
