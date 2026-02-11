import React, { useState } from 'react'
import { Monitor, ChevronRight, Smartphone, Laptop, Globe, Shield, LogOut, Trash2 } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const INITIAL_OTHER_SESSIONS = [
  {
    id: 1,
    browser: 'Chrome Mobile',
    os: 'Android 14',
    ip: '172.16.***.***',
    lastActive: 'vor 2 Stunden',
    location: 'München, Deutschland',
    device: 'Samsung Galaxy S24',
    icon: Smartphone,
  },
  {
    id: 2,
    browser: 'Safari',
    os: 'macOS Sonoma',
    ip: '10.0.***.***',
    lastActive: 'vor 3 Tagen',
    location: 'Hamburg, Deutschland',
    device: 'MacBook Pro',
    icon: Laptop,
  },
  {
    id: 3,
    browser: 'Firefox',
    os: 'Windows 11',
    ip: '192.168.***.***',
    lastActive: 'vor 1 Woche',
    location: 'Berlin, Deutschland',
    device: 'Desktop PC',
    icon: Monitor,
  },
]

const SessionsPage = () => {
  const [otherSessions, setOtherSessions] = useState(INITIAL_OTHER_SESSIONS)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleRemoveSession = (id) => {
    setOtherSessions(prev => prev.filter(s => s.id !== id))
  }

  const handleRemoveAll = () => {
    setOtherSessions([])
    setShowConfirm(false)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#7A6F62',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'rgba(126, 181, 230, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Monitor size={20} color="#7EB5E6" />
        </div>
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#2A2420',
            letterSpacing: '-0.3px',
          }}>
            Aktive Sitzungen
          </h2>
          <p style={{ fontSize: '13px', color: '#A89B8C' }}>
            {1 + otherSessions.length} {otherSessions.length === 0 ? 'Sitzung' : 'Sitzungen'} aktiv
          </p>
        </div>
      </div>

      {/* Current Session */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#6BC9A0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '10px',
          paddingLeft: '4px',
        }}>
          Aktuelle Sitzung
        </p>
      </div>
      <Card
        hover={false}
        style={{
          marginBottom: '24px',
          padding: '18px',
          border: '1.5px solid rgba(107, 201, 160, 0.3)',
          background: 'rgba(255, 255, 255, 0.75)',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(107,201,160,0.15), rgba(107,201,160,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Monitor size={22} color="#6BC9A0" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontWeight: '700', color: '#2A2420', fontSize: '15px' }}>
                Chrome
              </span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: '600',
                background: 'rgba(107,201,160,0.12)',
                color: '#059669',
              }}>
                Diese Sitzung
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7A6F62' }}>
                <Laptop size={13} color="#A89B8C" />
                <span>Linux / Ubuntu</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7A6F62' }}>
                <Globe size={13} color="#A89B8C" />
                <span>192.168.***.*** — Deutschland</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6BC9A0', fontWeight: '500' }}>
                <div style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#6BC9A0',
                  flexShrink: 0,
                }} />
                <span>Jetzt aktiv</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <>
          <div style={{ marginBottom: '8px' }}>
            <p style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#A89B8C',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
              paddingLeft: '4px',
            }}>
              Andere Sitzungen
            </p>
          </div>
          {otherSessions.map((session) => {
            const DeviceIcon = session.icon
            return (
              <Card
                key={session.id}
                hover={false}
                style={{
                  marginBottom: '10px',
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '13px',
                    background: 'rgba(42, 36, 32, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <DeviceIcon size={20} color="#7A6F62" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>
                        {session.browser}
                      </span>
                      <span style={{ fontSize: '12px', color: '#A89B8C' }}>
                        {session.device}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7A6F62' }}>
                        <Laptop size={12} color="#A89B8C" />
                        <span>{session.os}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7A6F62' }}>
                        <Globe size={12} color="#A89B8C" />
                        <span>{session.ip} — {session.location}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#A89B8C', marginTop: '2px' }}>
                        Letzte Aktivität: {session.lastActive}
                      </p>
                    </div>

                    {/* Remove Session Button */}
                    <button
                      onClick={() => handleRemoveSession(session.id)}
                      style={{
                        marginTop: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid rgba(220, 38, 38, 0.15)',
                        background: 'rgba(220, 38, 38, 0.04)',
                        color: '#DC2626',
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.04)'
                      }}
                    >
                      <LogOut size={13} />
                      Abmelden
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}

          {/* Remove All Sessions */}
          <div style={{ marginTop: '16px' }}>
            {!showConfirm ? (
              <Button
                variant="secondary"
                onClick={() => setShowConfirm(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(220, 38, 38, 0.05)',
                  color: '#DC2626',
                  border: '1.5px solid rgba(220, 38, 38, 0.15)',
                }}
              >
                <Trash2 size={16} />
                Alle anderen Sitzungen beenden
              </Button>
            ) : (
              <Card hover={false} style={{
                padding: '16px',
                border: '1.5px solid rgba(220, 38, 38, 0.2)',
                background: 'rgba(220, 38, 38, 0.02)',
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2A2420',
                  marginBottom: '8px',
                }}>
                  Alle anderen Sitzungen beenden?
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#7A6F62',
                  marginBottom: '14px',
                  lineHeight: '1.5',
                }}>
                  Du wirst auf allen anderen Geräten abgemeldet. Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'rgba(42, 36, 32, 0.04)',
                      border: '1px solid #E8DFD3',
                      borderRadius: '12px',
                      color: '#7A6F62',
                      fontWeight: '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleRemoveAll}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#DC2626',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Alle beenden
                  </button>
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Info Card */}
      <Card
        hover={false}
        style={{
          marginTop: '24px',
          padding: '18px',
          background: 'rgba(245, 197, 99, 0.04)',
          border: '1px solid rgba(245, 197, 99, 0.15)',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '11px',
            background: 'rgba(245, 197, 99, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Shield size={18} color="#E8A940" />
          </div>
          <div>
            <p style={{
              fontWeight: '600',
              color: '#2A2420',
              fontSize: '14px',
              marginBottom: '6px',
            }}>
              Sitzungssicherheit
            </p>
            <p style={{
              fontSize: '13px',
              color: '#7A6F62',
              lineHeight: '1.6',
            }}>
              Hier siehst du alle Geräte, auf denen du aktuell angemeldet bist. Wenn du ein Gerät nicht erkennst, melde es sofort ab und ändere dein Passwort. Wir empfehlen, ungenutzte Sitzungen regelmäßig zu entfernen.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SessionsPage
