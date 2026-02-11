import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Repeat, ArrowLeft, Sparkles, Video, Instagram, Smartphone, Copy, Check, Zap } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const TIKTOK_HOOKS = [
  { hook: '"POV: Du probierst das zum ersten Mal..."', style: 'Relatable POV', engagement: 'Hoch' },
  { hook: '"Wartet bis zum Ende..."', style: 'Suspense', engagement: 'Sehr Hoch' },
  { hook: '"Ich hab\'s endlich gemacht und das ist passiert..."', style: 'Story', engagement: 'Hoch' },
  { hook: '"3 Dinge die ich gelernt hab..."', style: 'Listicle', engagement: 'Mittel' },
  { hook: '"Das hat ALLES verändert..."', style: 'Transformation', engagement: 'Sehr Hoch' },
]

const INSTA_CONCEPTS = [
  { title: 'Behind-the-Scenes Story', desc: 'Zeige den Prozess: Vorbereitung → Shooting → Ergebnis in 5 Story-Slides', format: '5 Slides' },
  { title: 'Karussell-Post', desc: 'Vorher/Nachher oder Step-by-Step mit swipeable Carousel', format: '7 Slides' },
  { title: 'Teaser-Reel', desc: '15-Sekunden Reel mit Best-Moments als Trailer für das YouTube-Video', format: '15s Reel' },
]

const RepurposingPage = ({ userData }) => {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState(null)
  const [copied, setCopied] = useState(null)

  const generate = () => {
    if (!topic.trim()) return
    setGenerating(true)
    setTimeout(() => {
      setResults({
        topic: topic.trim(),
        tiktok: TIKTOK_HOOKS.slice(0, 5),
        instagram: INSTA_CONCEPTS.slice(0, 3),
      })
      setGenerating(false)
    }, 1800)
  }

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Auto-Repurposing</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Ein Thema → Multi-Platform Content</p>
        </div>
        <span style={{
          marginLeft: 'auto', padding: '4px 10px', borderRadius: '8px',
          background: 'rgba(245,197,99,0.1)', color: '#F5C563', fontSize: '11px', fontWeight: '700',
        }}>PREVIEW</span>
      </div>

      {/* Input */}
      <Card style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '10px' }}>
          YouTube-Video Thema / Titel
        </label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="z.B. 'Morning Routine für Productivity'"
          style={{
            width: '100%', padding: '14px', background: 'rgba(42,36,32,0.03)',
            border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#2A2420',
            fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <Button
          variant="primary"
          onClick={generate}
          disabled={generating || !topic.trim()}
          style={{ width: '100%', marginTop: '12px', padding: '14px' }}
        >
          {generating ? (
            <><span className="animate-spin" style={{ display: 'inline-block' }}>⏳</span> Generiere Ideen...</>
          ) : (
            <><Repeat size={16} /> Content-Ideen generieren</>
          )}
        </Button>
      </Card>

      {/* Results */}
      {results && (
        <div className="animate-fade-in">
          {/* TikTok Hooks */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Smartphone size={18} color="#FF6B9D" />
              <h3 style={{ fontWeight: '700', color: '#2A2420', fontSize: '16px' }}>5 TikTok-Hooks</h3>
            </div>
            {results.tiktok.map((item, i) => (
              <Card key={i} style={{ marginBottom: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px', marginBottom: '6px', lineHeight: '1.4' }}>{item.hook}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,107,157,0.08)', color: '#FF6B9D' }}>{item.style}</span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(107,201,160,0.08)', color: '#6BC9A0' }}>{item.engagement}</span>
                    </div>
                  </div>
                  <button onClick={() => copyText(item.hook, `tt-${i}`)} style={{
                    padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: copied === `tt-${i}` ? 'rgba(107,201,160,0.1)' : 'rgba(42,36,32,0.04)',
                    color: copied === `tt-${i}` ? '#6BC9A0' : '#7A6F62',
                  }}>
                    {copied === `tt-${i}` ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Instagram Concepts */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Instagram size={18} color="#9B8FE6" />
              <h3 style={{ fontWeight: '700', color: '#2A2420', fontSize: '16px' }}>3 Instagram-Story-Konzepte</h3>
            </div>
            {results.instagram.map((item, i) => (
              <Card key={i} style={{ marginBottom: '8px', padding: '16px', borderLeft: '3px solid #9B8FE6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '700', color: '#2A2420', fontSize: '14px' }}>{item.title}</span>
                  <span style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                    background: 'rgba(155,143,230,0.1)', color: '#9B8FE6', fontWeight: '500',
                  }}>{item.format}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#7A6F62', lineHeight: '1.5' }}>{item.desc}</p>
              </Card>
            ))}
          </div>

          {/* Tip */}
          <Card style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(245,197,99,0.08), rgba(245,197,99,0.04))',
            border: '1px solid rgba(245,197,99,0.15)',
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Zap size={16} color="#F5C563" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#5C5349', lineHeight: '1.5' }}>
                <strong>Pro-Tipp:</strong> Poste TikTok-Hooks 24h vor dem YouTube-Release als Teaser. Die Instagram-Story am gleichen Tag wie das Video.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default RepurposingPage
