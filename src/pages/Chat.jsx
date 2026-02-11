import React, { useState, useEffect, useRef } from 'react'
import { Send, Users, Plus, ArrowLeft, Search, Shield, Trash2 } from 'lucide-react'
import {
  collection, addDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, getDocs, doc, updateDoc, deleteDoc
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import Card from '../components/Card'
import Button from '../components/Button'

const ADMIN_EMAIL = 'yunghundse@gmail.com'

const Chat = () => {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState([])
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMsg, setSelectedMsg] = useState(null)
  const messagesEndRef = useRef(null)
  const longPressTimer = useRef(null)

  const currentUser = auth.currentUser

  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', currentUser.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [currentUser])

  useEffect(() => {
    if (!activeChat) return
    const q = query(
      collection(db, 'chatRooms', activeChat.id, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [activeChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, 'users'))
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.uid !== currentUser?.uid))
  }

  const startNewChat = async (otherUser) => {
    const existing = chats.find(c => c.participants.includes(otherUser.uid))
    if (existing) { setActiveChat(existing); setShowNewChat(false); return }

    const roomRef = await addDoc(collection(db, 'chatRooms'), {
      participants: [currentUser.uid, otherUser.uid],
      participantNames: {
        [currentUser.uid]: currentUser.displayName || currentUser.email,
        [otherUser.uid]: otherUser.displayName || otherUser.email,
      },
      participantPhotos: {
        [currentUser.uid]: currentUser.photoURL || '',
        [otherUser.uid]: otherUser.photoURL || '',
      },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })

    setActiveChat({
      id: roomRef.id,
      participants: [currentUser.uid, otherUser.uid],
      participantNames: {
        [currentUser.uid]: currentUser.displayName || currentUser.email,
        [otherUser.uid]: otherUser.displayName || otherUser.email,
      },
      participantPhotos: {
        [currentUser.uid]: currentUser.photoURL || '',
        [otherUser.uid]: otherUser.photoURL || '',
      },
    })
    setShowNewChat(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return
    await addDoc(collection(db, 'chatRooms', activeChat.id, 'messages'), {
      text: newMessage.trim(),
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      senderPhoto: currentUser.photoURL || '',
      createdAt: serverTimestamp(),
    })
    await updateDoc(doc(db, 'chatRooms', activeChat.id), {
      lastMessage: newMessage.trim(),
      lastMessageAt: serverTimestamp(),
    })
    setNewMessage('')
  }

  const deleteMessage = async (msgId) => {
    if (!activeChat) return
    try {
      await deleteDoc(doc(db, 'chatRooms', activeChat.id, 'messages', msgId))
      // Update last message if we deleted the latest
      const remaining = messages.filter(m => m.id !== msgId)
      const lastMsg = remaining[remaining.length - 1]
      await updateDoc(doc(db, 'chatRooms', activeChat.id), {
        lastMessage: lastMsg?.text || '',
      })
    } catch (err) {
      console.error('Delete error:', err)
    }
    setSelectedMsg(null)
  }

  const handleMsgTouchStart = (msg) => {
    if (msg.senderId !== currentUser?.uid) return
    longPressTimer.current = setTimeout(() => {
      setSelectedMsg(msg.id)
    }, 500)
  }

  const handleMsgTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  const getOther = (chat) => {
    if (!chat?.participants || !currentUser) return { name: '?', photo: '' }
    const otherId = chat.participants.find(p => p !== currentUser.uid)
    return {
      name: chat.participantNames?.[otherId] || 'User',
      photo: chat.participantPhotos?.[otherId] || '',
    }
  }

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ===== CHAT DETAIL =====
  if (activeChat) {
    const other = getOther(activeChat)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
        {/* Delete Confirm Overlay */}
        {selectedMsg && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }} onClick={() => setSelectedMsg(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#FFFDF7', borderRadius: '20px', padding: '24px',
              width: '100%', maxWidth: '320px', textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: 'rgba(220,38,38,0.08)', margin: '0 auto 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 size={24} color="#DC2626" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#2A2420', marginBottom: '6px' }}>Nachricht löschen?</h3>
              <p style={{ fontSize: '13px', color: '#A89B8C', marginBottom: '20px' }}>Diese Nachricht wird für alle gelöscht.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setSelectedMsg(null)} style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E8DFD3',
                  background: 'transparent', color: '#7A6F62', fontWeight: '600', fontSize: '14px',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Abbrechen</button>
                <button onClick={() => deleteMessage(selectedMsg)} style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: 'white',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
                }}>Löschen</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(232,223,211,0.4)', marginBottom: '16px' }}>
          <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px' }}>
            <ArrowLeft size={22} />
          </button>
          {other.photo ? (
            <img src={other.photo} alt="" style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#5C5349', fontSize: '16px' }}>
              {other.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{other.name}</p>
            <p style={{ fontSize: '12px', color: '#6BC9A0' }}>Online</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#A89B8C' }}>
              <p style={{ fontSize: '14px' }}>Noch keine Nachrichten. Schreib die erste!</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === currentUser?.uid
            const isSelected = selectedMsg === msg.id
            return (
              <div key={msg.id} style={{
                marginBottom: '10px', display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
                position: 'relative',
              }}>
                <div
                  onTouchStart={() => handleMsgTouchStart(msg)}
                  onTouchEnd={handleMsgTouchEnd}
                  onContextMenu={(e) => { if (isMe) { e.preventDefault(); setSelectedMsg(msg.id) } }}
                  style={{
                    maxWidth: '80%', padding: '12px 16px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isSelected ? 'rgba(220,38,38,0.12)' : isMe ? 'linear-gradient(135deg, #FF8FAB, #FF6B9D)' : 'rgba(255,255,255,0.7)',
                    border: isSelected ? '1px solid rgba(220,38,38,0.3)' : isMe ? 'none' : '1px solid rgba(232,223,211,0.5)',
                    boxShadow: isMe ? '0 3px 10px rgba(255,107,157,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}>
                  {/* Delete icon for own selected messages */}
                  {isMe && isSelected && (
                    <button onClick={() => deleteMessage(msg.id)} style={{
                      position: 'absolute', top: '-10px', right: '-10px',
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: '#DC2626', border: 'none', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(220,38,38,0.4)',
                    }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                  {!isMe && <p style={{ fontSize: '12px', fontWeight: '600', color: '#FF6B9D', marginBottom: '4px' }}>{msg.senderName}</p>}
                  <p style={{ color: isMe ? 'white' : '#3D362F', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
                  <p style={{ fontSize: '10px', color: isMe ? 'rgba(255,255,255,0.6)' : '#A89B8C', textAlign: 'right', marginTop: '4px' }}>
                    {msg.createdAt?.toDate?.()?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) || '...'}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Hint */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#C4B8A8', padding: '4px 0' }}>
          Eigene Nachricht lange drücken oder rechtsklicken zum Löschen
        </p>

        <div style={{ display: 'flex', gap: '10px', padding: '12px 0', borderTop: '1px solid rgba(232,223,211,0.4)' }}>
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Nachricht schreiben..."
            style={{ flex: 1, padding: '14px 18px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid #E8DFD3', borderRadius: '16px', color: '#2A2420', fontSize: '15px', fontFamily: 'inherit', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#FF6B9D'}
            onBlur={e => e.target.style.borderColor = '#E8DFD3'}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <Button variant="primary" onClick={sendMessage} style={{ padding: '14px 16px', borderRadius: '16px' }}>
            <Send size={18} />
          </Button>
        </div>
      </div>
    )
  }

  // ===== NEW CHAT =====
  if (showNewChat) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => setShowNewChat(false)} style={{ background: 'none', border: 'none', color: '#7A6F62', padding: '4px' }}><ArrowLeft size={22} /></button>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Neuer Chat</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(42,36,32,0.03)', border: '1.5px solid #E8DFD3', borderRadius: '14px', padding: '0 14px', marginBottom: '16px' }}>
          <Search size={18} color="#A89B8C" />
          <input type="text" placeholder="User suchen..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', color: '#2A2420', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        {filteredUsers.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '40px', color: '#A89B8C' }}>
            <Users size={32} color="#E8DFD3" style={{ marginBottom: '12px' }} />
            <p>Keine User gefunden</p>
          </Card>
        ) : (
          filteredUsers.map(u => (
            <Card key={u.id} onClick={() => startNewChat(u)} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', cursor: 'pointer' }}>
              {u.photoURL ? (
                <img src={u.photoURL} alt="" style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#5C5349', fontSize: '18px' }}>
                  {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>
                  {u.displayName || 'User'}
                  {u.email === ADMIN_EMAIL && <Shield size={12} color="#FF6B9D" style={{ marginLeft: '6px', verticalAlign: 'middle' }} />}
                </p>
                <p style={{ fontSize: '12px', color: '#A89B8C' }}>{u.email}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    )
  }

  // ===== CHAT LIST =====
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="animate-fade-in">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>Nachrichten</h2>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginTop: '2px' }}>{chats.length} Chats</p>
        </div>
        <Button variant="primary" onClick={() => { loadUsers(); setShowNewChat(true) }} style={{ padding: '10px 16px' }}>
          <Plus size={18} /> Neu
        </Button>
      </div>

      {chats.length === 0 ? (
        <Card className="animate-fade-in stagger-1" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(255,107,157,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={24} color="#FF6B9D" />
          </div>
          <p style={{ color: '#5C5349', fontWeight: '600', marginBottom: '6px' }}>Noch keine Chats</p>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginBottom: '20px' }}>Starte einen Chat mit einem anderen User oder dem Admin</p>
          <Button variant="cream" onClick={() => { loadUsers(); setShowNewChat(true) }}>
            <Plus size={16} /> Neuen Chat starten
          </Button>
        </Card>
      ) : (
        chats.sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0)).map((chat, i) => {
          const other = getOther(chat)
          return (
            <Card key={chat.id} onClick={() => setActiveChat(chat)}
              style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', cursor: 'pointer' }}
              className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}
            >
              {other.photo ? (
                <img src={other.photo} alt="" style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#5C5349', fontSize: '20px', flexShrink: 0 }}>
                  {other.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>{other.name}</p>
                <p style={{ fontSize: '13px', color: '#A89B8C', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat.lastMessage || 'Noch keine Nachrichten'}
                </p>
              </div>
              {chat.lastMessageAt && (
                <span style={{ fontSize: '11px', color: '#A89B8C', flexShrink: 0 }}>
                  {chat.lastMessageAt.toDate?.()?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) || ''}
                </span>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}

export default Chat
