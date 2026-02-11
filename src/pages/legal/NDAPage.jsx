import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Check, FileSignature, Calendar, User } from 'lucide-react'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const NDAPage = () => {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)
  const [fullName, setFullName] = useState('')
  const [signing, setSigning] = useState(false)
  const [alreadySigned, setAlreadySigned] = useState(false)
  const [signedData, setSignedData] = useState(null)

  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  // Check if already signed
  useEffect(() => {
    const checkNDA = async () => {
      const user = auth.currentUser
      if (!user) return
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists() && snap.data().acceptedNDA) {
          setAlreadySigned(true)
          setSignedData({
            name: snap.data().ndaSignedName || snap.data().displayName || '',
            date: snap.data().ndaSignedAt?.toDate?.()
              ? snap.data().ndaSignedAt.toDate().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : today,
          })
        } else {
          // Pre-fill name
          setFullName(snap.data()?.displayName || user.displayName || '')
        }
      } catch (err) {
        console.error('NDA check error:', err)
      }
    }
    checkNDA()
  }, [])

  const handleSign = async () => {
    if (!accepted || !fullName.trim()) return
    const user = auth.currentUser
    if (!user) return

    setSigning(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        acceptedNDA: true,
        ndaSignedName: fullName.trim(),
        ndaSignedAt: serverTimestamp(),
      })
      setSignedData({
        name: fullName.trim(),
        date: today,
      })
      setAlreadySigned(true)
    } catch (err) {
      console.error('NDA sign error:', err)
    }
    setSigning(false)
  }

  const sectionStyle = {
    fontSize: '14px',
    color: '#5C5349',
    lineHeight: '1.8',
    margin: 0,
  }

  const paragraphTitleStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2A2420',
    marginBottom: '8px',
    marginTop: '16px',
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#2A2420',
    fontSize: '15px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{
          padding: '10px', background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)',
          borderRadius: '12px', color: '#7A6F62', cursor: 'pointer', display: 'flex',
        }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Geheimhaltungsvereinbarung</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>NDA - Non-Disclosure Agreement</p>
        </div>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #9B8FE6, #7B6FD6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(155,143,230,0.3)',
        }}>
          <FileSignature size={20} color="white" />
        </div>
      </div>

      {alreadySigned && signedData ? (
        /* Success State */
        <div>
          <Card style={{
            padding: '32px 24px', textAlign: 'center', marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(107,201,160,0.1), rgba(107,201,160,0.04))',
            border: '2px solid rgba(107,201,160,0.25)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #6BC9A0, #4DAA82)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(107,201,160,0.3)',
            }}>
              <Check size={30} color="white" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2A2420', marginBottom: '6px' }}>
              NDA unterzeichnet
            </h3>
            <p style={{ fontSize: '14px', color: '#6BC9A0', fontWeight: '600', marginBottom: '20px' }}>
              Die Geheimhaltungsvereinbarung wurde erfolgreich unterzeichnet
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '20px',
              border: '1px solid rgba(232,223,211,0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <User size={16} color="#5C5349" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '12px', color: '#A89B8C' }}>Unterzeichner</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#2A2420' }}>{signedData.name}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Calendar size={16} color="#5C5349" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '12px', color: '#A89B8C' }}>Datum</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#2A2420' }}>{signedData.date}</p>
                </div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '10px',
                background: 'rgba(107,201,160,0.1)', border: '1px solid rgba(107,201,160,0.2)',
              }}>
                <ShieldCheck size={14} color="#6BC9A0" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#6BC9A0' }}>NDA unterzeichnet</span>
              </div>
            </div>
          </Card>

          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            style={{ width: '100%', padding: '14px' }}
          >
            Zuruck
          </Button>
        </div>
      ) : (
        /* NDA Content & Signing */
        <div>
          <Card style={{ marginBottom: '20px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#2A2420', marginBottom: '16px', textAlign: 'center' }}>
              Geheimhaltungsvereinbarung (NDA)
            </h3>
            <p style={{ ...sectionStyle, marginBottom: '8px', textAlign: 'center', color: '#A89B8C', fontSize: '13px' }}>
              zwischen CreatorHub und dem/der Unterzeichnenden
            </p>

            <div style={{ borderTop: '1px solid #E8DFD3', marginTop: '16px', paddingTop: '16px' }}>
              <p style={paragraphTitleStyle}>1. Gegenstand der Vereinbarung</p>
              <p style={sectionStyle}>
                Diese Geheimhaltungsvereinbarung regelt den Umgang mit vertraulichen Informationen,
                die im Rahmen der Nutzung der Plattform CreatorHub und der Zusammenarbeit innerhalb
                von Teams zugaenglich werden. Als vertrauliche Informationen gelten insbesondere:
                unveroffentlichte Content-Ideen, Strategien, Finanzinformationen, Kundendaten,
                Vertragsdetails und interne Kommunikation.
              </p>

              <p style={paragraphTitleStyle}>2. Geheimhaltungspflicht</p>
              <p style={sectionStyle}>
                Der/die Unterzeichnende verpflichtet sich, alle vertraulichen Informationen, die im
                Rahmen der Plattformnutzung zugaenglich werden, streng vertraulich zu behandeln. Die
                Weitergabe an Dritte ist ohne ausdrueckliche schriftliche Genehmigung des jeweiligen
                Informationsinhabers untersagt. Dies gilt auch nach Beendigung der Zusammenarbeit
                oder Loeschung des Accounts.
              </p>

              <p style={paragraphTitleStyle}>3. Team-Inhalte und Content</p>
              <p style={sectionStyle}>
                Innerhalb eines Teams geteilte Inhalte, Entwuerfe, Medien und Strategien sind als
                vertraulich zu behandeln. Die Veroeffentlichung, Weiterleitung oder anderweitige
                Nutzung von Team-Inhalten ausserhalb der Plattform bedarf der Zustimmung des Team-Managers.
                Dies schliesst Screenshots, Bildschirmaufnahmen und muendliche Weitergabe ein.
              </p>

              <p style={paragraphTitleStyle}>4. Ausnahmen</p>
              <p style={sectionStyle}>
                Von der Geheimhaltungspflicht ausgenommen sind Informationen, die: (a) oeffentlich
                bekannt sind oder werden, ohne dass der/die Unterzeichnende dafuer verantwortlich ist;
                (b) dem/der Unterzeichnenden bereits vor der Zusammenarbeit bekannt waren; (c) von
                einem Dritten rechtmaessig ohne Geheimhaltungsverpflichtung erhalten wurden; (d)
                aufgrund gesetzlicher Verpflichtung offengelegt werden muessen.
              </p>

              <p style={paragraphTitleStyle}>5. Dauer und Geltung</p>
              <p style={sectionStyle}>
                Diese Vereinbarung tritt mit der digitalen Unterzeichnung in Kraft und gilt fuer die
                gesamte Dauer der Nutzung der Plattform sowie fuer einen Zeitraum von 24 Monaten
                nach Beendigung der Nutzung. Die Geheimhaltungspflicht fuer Geschaeftsgeheimnisse
                gilt zeitlich unbegrenzt.
              </p>

              <p style={paragraphTitleStyle}>6. Rechtsfolgen bei Verstoss</p>
              <p style={sectionStyle}>
                Bei Verstoss gegen diese Geheimhaltungsvereinbarung behaelt sich CreatorHub das Recht
                vor, den Zugang zur Plattform sofort zu sperren und rechtliche Schritte einzuleiten.
                Der/die Unterzeichnende kann fuer entstandene Schaeden haftbar gemacht werden. Es gilt
                das Recht der Bundesrepublik Deutschland.
              </p>
            </div>
          </Card>

          {/* Signing Section */}
          <Card style={{
            marginBottom: '16px', padding: '22px',
            border: '1.5px solid rgba(155,143,230,0.2)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2A2420', marginBottom: '18px' }}>
              Digitale Unterschrift
            </h3>

            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              cursor: 'pointer', marginBottom: '18px',
            }}>
              <div
                onClick={() => setAccepted(!accepted)}
                style={{
                  width: '24px', height: '24px', borderRadius: '8px', flexShrink: 0, marginTop: '1px',
                  border: accepted ? '2px solid #6BC9A0' : '2px solid #E8DFD3',
                  background: accepted ? 'rgba(107,201,160,0.1)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                {accepted && <Check size={16} color="#6BC9A0" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: '14px', color: '#5C5349', lineHeight: '1.6' }}>
                Ich habe die Geheimhaltungsvereinbarung gelesen und akzeptiere sie.
              </span>
            </label>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '8px' }}>
                Vollstandiger Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Vor- und Nachname"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '8px' }}>
                Datum
              </label>
              <div style={{
                ...inputStyle,
                background: 'rgba(42,36,32,0.05)',
                color: '#7A6F62',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <Calendar size={16} color="#A89B8C" />
                {today}
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleSign}
              disabled={!accepted || !fullName.trim() || signing}
              style={{ width: '100%', padding: '16px', fontSize: '15px' }}
            >
              {signing ? 'Wird gespeichert...' : <><FileSignature size={18} /> Digital unterschreiben</>}
            </Button>
          </Card>

          <Card style={{
            padding: '14px 16px',
            background: 'rgba(245,197,99,0.04)', border: '1px solid rgba(245,197,99,0.15)',
          }}>
            <p style={{ fontSize: '12px', color: '#7A6F62', lineHeight: '1.6' }}>
              <strong style={{ color: '#E8A940' }}>Hinweis:</strong> Mit der digitalen Unterschrift bestatigst du,
              dass du die Geheimhaltungsvereinbarung vollstandig gelesen und verstanden hast. Diese Vereinbarung
              ist rechtlich bindend.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}

export default NDAPage
