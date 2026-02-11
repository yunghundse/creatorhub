import React, { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle, MessageCircle, UserPlus, CreditCard, Shield, X } from 'lucide-react'

const TYPE_CONFIG = {
  approval: { icon: CheckCircle, color: '#6BC9A0', bg: 'rgba(107,201,160,0.12)' },
  chat: { icon: MessageCircle, color: '#7EB5E6', bg: 'rgba(126,181,230,0.12)' },
  invite: { icon: UserPlus, color: '#B48EE0', bg: 'rgba(180,142,224,0.12)' },
  payment: { icon: CreditCard, color: '#E8A940', bg: 'rgba(232,169,64,0.12)' },
  system: { icon: Shield, color: '#FF6B9D', bg: 'rgba(255,107,157,0.12)' },
}

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'approval',
    title: 'Content freigegeben',
    message: 'Dein Beitrag "Sommer Kollektion 2026" wurde vom Manager freigegeben.',
    time: 'vor 3 Min',
    read: false,
  },
  {
    id: 2,
    type: 'chat',
    title: 'Neue Nachricht',
    message: 'Luisa hat dir eine Nachricht im Team-Chat geschickt.',
    time: 'vor 12 Min',
    read: false,
  },
  {
    id: 3,
    type: 'invite',
    title: 'Team-Einladung',
    message: 'Du wurdest zum Team "Studio Berlin" eingeladen.',
    time: 'vor 45 Min',
    read: false,
  },
  {
    id: 4,
    type: 'payment',
    title: 'Zahlung eingegangen',
    message: 'Eine Zahlung von 1.250,00 EUR wurde deinem Konto gutgeschrieben.',
    time: 'vor 2 Std',
    read: true,
  },
  {
    id: 5,
    type: 'system',
    title: 'Sicherheitshinweis',
    message: 'Neuer Login von Chrome auf Windows erkannt. Warst du das?',
    time: 'vor 5 Std',
    read: true,
  },
  {
    id: 6,
    type: 'approval',
    title: 'Feedback erhalten',
    message: 'Max hat einen Kommentar zu deinem Entwurf hinterlassen.',
    time: 'vor 1 Tag',
    read: true,
  },
]

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const dropdownRef = useRef(null)
  const bellRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={() => setOpen(prev => !prev)}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.7)',
          borderRadius: '14px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(42,36,32,0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <Bell size={20} color="#5C5349" />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B9D, #E05585)',
            color: 'white',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #FFFDF7',
            lineHeight: 1,
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: '70px',
            right: '16px',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'rgba(255, 253, 247, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            boxShadow: '0 16px 50px rgba(42, 36, 32, 0.14), 0 0 0 1px rgba(232, 223, 211, 0.3)',
            zIndex: 9999,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {/* Dropdown Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px 14px',
            borderBottom: '1px solid rgba(232, 223, 211, 0.5)',
            position: 'sticky',
            top: 0,
            background: 'rgba(255, 253, 247, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px 20px 0 0',
            zIndex: 1,
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#2A2420',
              letterSpacing: '-0.2px',
            }}>
              Benachrichtigungen
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'rgba(255, 107, 157, 0.08)',
                    border: '1px solid rgba(255, 107, 157, 0.15)',
                    borderRadius: '10px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#FF6B9D',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 157, 0.14)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 157, 0.08)'
                  }}
                >
                  Alle lesen
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#A89B8C',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div style={{ padding: '8px 12px 12px' }}>
            {notifications.map((notif) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system
              const Icon = config.icon
              return (
                <div
                  key={notif.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '14px',
                    marginBottom: '4px',
                    borderLeft: !notif.read ? '3px solid rgba(126, 181, 230, 0.6)' : '3px solid transparent',
                    background: !notif.read ? 'rgba(126, 181, 230, 0.04)' : 'transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(42, 36, 32, 0.03)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = !notif.read ? 'rgba(126, 181, 230, 0.04)' : 'transparent'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    background: config.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={17} color={config.color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '2px',
                    }}>
                      <span style={{
                        fontWeight: !notif.read ? '700' : '600',
                        fontSize: '13px',
                        color: '#2A2420',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {notif.title}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: '#A89B8C',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {notif.time}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: '#7A6F62',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
