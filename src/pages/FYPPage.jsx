import React, { useState, useEffect } from 'react'
import {
  Heart, MessageCircle, Send, Lightbulb, TrendingUp, Plus,
  Flame, Star, Trash2, X
} from 'lucide-react'
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, getDocs
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import Card from '../components/Card'
import Button from '../components/Button'

const CATEGORIES = [
  { id: 'all', label: 'Alle', icon: Flame },
  { id: 'tipp', label: 'Tipps', icon: Lightbulb },
  { id: 'trend', label: 'Trends', icon: TrendingUp },
  { id: 'frage', label: 'Fragen', icon: MessageCircle },
  { id: 'showcase', label: 'Showcase', icon: Star },
]

const CATEGORY_COLORS = {
  tipp: '#6BC9A0',
  trend: '#7EB5E6',
  frage: '#F5C563',
  showcase: '#FF6B9D',
}

const ROLE_COLORS = {
  manager: '#F5C563', model: '#FF6B9D', admin: '#FF6B9D'
}

const timeAgo = (timestamp) => {
  if (!timestamp?.toDate) return ''
  const diff = Date.now() - timestamp.toDate().getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'gerade eben'
  if (mins < 60) return `vor ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `vor ${hours}h`
  const days = Math.floor(hours / 24)
  return `vor ${days}d`
}

const FYPPage = ({ userData }) => {
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [newPost, setNewPost] = useState({ text: '', category: 'tipp' })
  const [commentText, setCommentText] = useState({})
  const [expandedComments, setExpandedComments] = useState({})
  const [postComments, setPostComments] = useState({})

  const currentUser = auth.currentUser

  // Load posts
  useEffect(() => {
    const q = query(collection(db, 'fyp'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  // Load comments for expanded posts
  const loadComments = async (postId) => {
    const q = query(collection(db, 'fyp', postId, 'comments'), orderBy('createdAt', 'asc'))
    const snap = await getDocs(q)
    setPostComments(prev => ({
      ...prev,
      [postId]: snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }))
  }

  const toggleComments = (postId) => {
    const isExpanded = expandedComments[postId]
    setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }))
    if (!isExpanded) loadComments(postId)
  }

  const createPost = async () => {
    if (!newPost.text.trim()) return
    await addDoc(collection(db, 'fyp'), {
      text: newPost.text.trim(),
      category: newPost.category,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      authorPhoto: currentUser.photoURL || '',
      authorRole: userData?.role || 'user',
      likes: [],
      commentCount: 0,
      createdAt: serverTimestamp(),
    })
    setNewPost({ text: '', category: 'tipp' })
    setShowCreate(false)
  }

  const toggleLike = async (post) => {
    const ref = doc(db, 'fyp', post.id)
    const isLiked = post.likes?.includes(currentUser.uid)
    await updateDoc(ref, {
      likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    })
  }

  const addComment = async (postId) => {
    const text = commentText[postId]?.trim()
    if (!text) return
    await addDoc(collection(db, 'fyp', postId, 'comments'), {
      text,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      authorPhoto: currentUser.photoURL || '',
      createdAt: serverTimestamp(),
    })
    await updateDoc(doc(db, 'fyp', postId), {
      commentCount: (posts.find(p => p.id === postId)?.commentCount || 0) + 1
    })
    setCommentText(prev => ({ ...prev, [postId]: '' }))
    loadComments(postId)
  }

  const deletePost = async (postId) => {
    await deleteDoc(doc(db, 'fyp', postId))
  }

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.category === filter)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="animate-fade-in">
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.3px' }}>
            For You
          </h2>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginTop: '2px' }}>Community Feed</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)} style={{ padding: '10px 16px' }}>
          <Plus size={18} /> Post
        </Button>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const isActive = filter === cat.id
          return (
            <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '12px', border: 'none',
              background: isActive ? 'linear-gradient(135deg, #FF8FAB, #FF6B9D)' : 'rgba(255,255,255,0.7)',
              color: isActive ? 'white' : '#7A6F62',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit', boxShadow: isActive ? '0 3px 10px rgba(255,107,157,0.25)' : 'none',
              transition: 'all 0.2s ease',
            }}>
              <Icon size={14} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => setShowCreate(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFDF7', borderRadius: '24px 24px 0 0', padding: '24px',
            width: '100%', maxWidth: '500px', maxHeight: '80vh',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420' }}>Neuer Post</h3>
              <button onClick={() => setShowCreate(false)} style={{
                background: 'rgba(42,36,32,0.06)', border: 'none', borderRadius: '10px',
                padding: '8px', color: '#7A6F62', cursor: 'pointer',
              }}><X size={18} /></button>
            </div>

            {/* Category Select */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <button key={cat.id} onClick={() => setNewPost(prev => ({ ...prev, category: cat.id }))} style={{
                  padding: '6px 12px', borderRadius: '10px', border: 'none',
                  background: newPost.category === cat.id ? `${CATEGORY_COLORS[cat.id]}20` : 'rgba(42,36,32,0.04)',
                  color: newPost.category === cat.id ? CATEGORY_COLORS[cat.id] : '#A89B8C',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {cat.label}
                </button>
              ))}
            </div>

            <textarea
              value={newPost.text}
              onChange={e => setNewPost(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Teile einen Tipp, eine Frage oder deinen Erfolg..."
              rows={4}
              style={{
                width: '100%', padding: '14px', background: 'rgba(42,36,32,0.03)',
                border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#2A2420',
                fontSize: '15px', fontFamily: 'inherit', outline: 'none', resize: 'none',
                boxSizing: 'border-box',
              }}
            />

            <Button variant="primary" onClick={createPost} disabled={!newPost.text.trim()}
              style={{ width: '100%', marginTop: '14px', padding: '14px' }}>
              <Send size={16} /> Posten
            </Button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      {filteredPosts.length === 0 ? (
        <Card className="animate-fade-in" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{
            width: '56px', height: '56px', background: 'rgba(255,107,157,0.08)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Flame size={24} color="#FF6B9D" />
          </div>
          <p style={{ color: '#5C5349', fontWeight: '600', marginBottom: '6px' }}>Noch keine Posts</p>
          <p style={{ color: '#A89B8C', fontSize: '14px', marginBottom: '20px' }}>Sei der Erste und teile etwas mit der Community!</p>
          <Button variant="cream" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Ersten Post erstellen
          </Button>
        </Card>
      ) : (
        filteredPosts.map((post, i) => {
          const isLiked = post.likes?.includes(currentUser?.uid)
          const isOwner = post.authorId === currentUser?.uid
          const catColor = CATEGORY_COLORS[post.category] || '#A89B8C'
          const roleColor = ROLE_COLORS[post.authorRole] || '#A89B8C'
          const comments = postComments[post.id] || []
          const isExpanded = expandedComments[post.id]

          return (
            <Card key={post.id} style={{ marginBottom: '14px', padding: '18px' }}
              className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}>
              {/* Post Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                {post.authorPhoto ? (
                  <img src={post.authorPhoto} alt="" style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', color: '#5C5349', fontSize: '16px',
                  }}>
                    {(post.authorName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{post.authorName}</span>
                    <span style={{
                      fontSize: '10px', padding: '2px 6px', borderRadius: '6px',
                      background: `${roleColor}15`, color: roleColor, fontWeight: '600',
                      textTransform: 'capitalize',
                    }}>{post.authorRole}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{
                      fontSize: '10px', padding: '2px 6px', borderRadius: '6px',
                      background: `${catColor}15`, color: catColor, fontWeight: '600',
                    }}>
                      {CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#C4B8A8' }}>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
                {isOwner && (
                  <button onClick={() => deletePost(post.id)} style={{
                    background: 'none', border: 'none', color: '#C4B8A8', padding: '4px', cursor: 'pointer',
                  }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Post Content */}
              <p style={{ color: '#3D362F', fontSize: '15px', lineHeight: 1.6, marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
                {post.text}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: '1px solid rgba(232,223,211,0.3)' }}>
                <button onClick={() => toggleLike(post)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', background: 'none',
                  border: 'none', color: isLiked ? '#FF6B9D' : '#A89B8C', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', padding: '4px 0', fontFamily: 'inherit',
                }}>
                  <Heart size={18} fill={isLiked ? '#FF6B9D' : 'none'} />
                  {post.likes?.length || 0}
                </button>
                <button onClick={() => toggleComments(post.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', background: 'none',
                  border: 'none', color: isExpanded ? '#7EB5E6' : '#A89B8C', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', padding: '4px 0', fontFamily: 'inherit',
                }}>
                  <MessageCircle size={18} />
                  {post.commentCount || 0}
                </button>
              </div>

              {/* Comments Section */}
              {isExpanded && (
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(232,223,211,0.3)' }}>
                  {comments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      {c.authorPhoto ? (
                        <img src={c.authorPhoto} alt="" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '8px',
                          background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '700', color: '#5C5349', fontSize: '11px', flexShrink: 0,
                        }}>
                          {(c.authorName || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{
                        flex: 1, padding: '8px 12px', borderRadius: '12px',
                        background: 'rgba(42,36,32,0.03)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#2A2420' }}>{c.authorName}</span>
                          <span style={{ fontSize: '10px', color: '#C4B8A8' }}>{timeAgo(c.createdAt)}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#5C5349', lineHeight: 1.4, margin: 0 }}>{c.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* Comment Input */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      value={commentText[post.id] || ''}
                      onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Kommentar..."
                      style={{
                        flex: 1, padding: '10px 14px', background: 'rgba(42,36,32,0.03)',
                        border: '1px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
                        fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                      }}
                      onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                    />
                    <button onClick={() => addComment(post.id)} style={{
                      padding: '10px 12px', borderRadius: '12px', border: 'none',
                      background: 'linear-gradient(135deg, #FF8FAB, #FF6B9D)',
                      color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    }}>
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}

export default FYPPage
