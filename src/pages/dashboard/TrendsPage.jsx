import React, { useState } from 'react'
import { TrendingUp, Sparkles, RefreshCw, ExternalLink } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', color: '#000000' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000' },
  { id: 'onlyfans', label: 'OnlyFans', color: '#00AFF0' },
]

const TREND_DATA = {
  tiktok: [
    { title: 'Behind the Scenes Content', desc: 'BTS-Content performt aktuell 3x besser als polierte Posts', score: 95 },
    { title: 'Story-Telling in 3 Parts', desc: 'Dreiteilige Story-Serien mit Cliffhanger erhöhen Watchtime um 60%', score: 88 },
    { title: 'GRWM mit Twist', desc: 'Get Ready With Me Videos mit unerwartetem Element im Trend', score: 82 },
  ],
  instagram: [
    { title: 'Carousel Education Posts', desc: 'Lehrreiche Karussells mit 7-10 Slides bekommen 2x mehr Saves', score: 91 },
    { title: 'Reels unter 15 Sekunden', desc: 'Kurze Reels mit Hook in den ersten 2 Sekunden performen am besten', score: 87 },
    { title: 'Collaborative Posts', desc: 'Collab-Posts mit anderen Creatorn bringen 40% mehr Reichweite', score: 79 },
  ],
  youtube: [
    { title: 'Shorts mit CTA', desc: 'YouTube Shorts mit Call-to-Action zum Langformat konvertieren Subscriber', score: 93 },
    { title: 'Thumbnail A/B Testing', desc: 'Thumbnails mit Gesicht + Text outperformen reine Text-Thumbnails', score: 85 },
    { title: 'Community Tab Polls', desc: 'Community-Umfragen steigern Algorithmus-Engagement signifikant', score: 76 },
  ],
  onlyfans: [
    { title: 'PPV-Bundles', desc: 'Gebündelte PPV-Nachrichten mit Rabatt erhöhen Conversion um 45%', score: 90 },
    { title: 'Personalisierte Nachrichten', desc: 'Individuelle Welcome-Messages verdoppeln die Retention-Rate', score: 86 },
    { title: 'Scheduled Content', desc: 'Regelmäßiger Content-Kalender hält Subscriber aktiv', score: 80 },
  ],
}

const TrendsPage = () => {
  const [activePlatform, setActivePlatform] = useState('tiktok')
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)

  const trends = TREND_DATA[activePlatform] || []

  const generateSuggestion = () => {
    setLoading(true)
    const suggestions = {
      tiktok: [
        'Erstelle eine 3-Part Story-Serie über deinen Alltag. Nutze einen Cliffhanger am Ende von Part 1 und 2.',
        'Filme ein GRWM-Video, aber mit einer überraschenden Wendung in der Mitte. Nutze einen Trend-Sound.',
        'Poste ein 7-Sekunden-BTS-Video mit dem Text "POV: ..." — maximale Relatable-Energy.',
      ],
      instagram: [
        'Erstelle ein 8-Slide Carousel mit Tipps aus deiner Nische. Erste Slide = provokante Frage.',
        'Nutze Collab-Posts mit 2-3 Creatorn aus deinem Bereich für maximale Cross-Promotion.',
        'Poste ein Reel unter 12 Sekunden mit starkem Hook. Beste Zeit: Di/Do 18-20 Uhr.',
      ],
      youtube: [
        'Erstelle 3 YouTube Shorts aus deinem letzten Langformat-Video als Teaser.',
        'Teste 2 verschiedene Thumbnails für dein nächstes Video. Gesicht + Emotion = Klicks.',
        'Starte eine Community-Umfrage über dein nächstes Video-Thema. Bindet die Audience.',
      ],
      onlyfans: [
        'Erstelle ein Bundle aus 3-5 Inhalten mit 20% Rabatt als PPV-Nachricht.',
        'Sende personalisierte Welcome-Messages an neue Subscriber innerhalb der ersten Stunde.',
        'Plane Content 2 Wochen im Voraus und teile den Kalender als Teaser-Post.',
      ],
    }
    const pool = suggestions[activePlatform] || suggestions.tiktok
    setTimeout(() => {
      setAiSuggestion(pool[Math.floor(Math.random() * pool.length)])
      setLoading(false)
    }, 1000)
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '4px' }}>Trend-Engine</h2>
        <p style={{ color: '#A89B8C', fontSize: '14px' }}>KI-gestützte Trend-Analyse & Content-Vorschläge</p>
      </div>

      {/* Platform Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => { setActivePlatform(p.id); setAiSuggestion(null) }} style={{
            padding: '10px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
            border: activePlatform === p.id ? 'none' : '1.5px solid #E8DFD3',
            background: activePlatform === p.id ? p.color : 'rgba(255,255,255,0.6)',
            color: activePlatform === p.id ? 'white' : '#7A6F62',
            boxShadow: activePlatform === p.id ? `0 4px 15px ${p.color}30` : 'none',
          }}>{p.label}</button>
        ))}
      </div>

      {/* AI Suggestion */}
      <Card style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(255,143,171,0.06), rgba(255,107,157,0.03))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Sparkles size={18} color="#FF6B9D" />
          <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>KI-Vorschlag</span>
        </div>
        {aiSuggestion ? (
          <p style={{ fontSize: '14px', color: '#5C5349', lineHeight: '1.6' }}>{aiSuggestion}</p>
        ) : (
          <Button variant="cream" onClick={generateSuggestion} disabled={loading} style={{ width: '100%' }}>
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Analysiere...</> : <><Sparkles size={16} /> Content-Vorschlag generieren</>}
          </Button>
        )}
        {aiSuggestion && (
          <button onClick={() => setAiSuggestion(null)} style={{ marginTop: '12px', fontSize: '13px', color: '#FF6B9D', background: 'none', border: 'none', fontWeight: '500', cursor: 'pointer' }}>
            Neuen Vorschlag generieren
          </button>
        )}
      </Card>

      {/* Trends List */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={18} color={PLATFORMS.find(p => p.id === activePlatform)?.color} />
        Aktuelle Trends
      </h3>
      {trends.map((trend, i) => (
        <Card key={i} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
            <h4 style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px', flex: 1 }}>{trend.title}</h4>
            <div style={{
              padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
              background: trend.score >= 90 ? 'rgba(107,201,160,0.1)' : trend.score >= 80 ? 'rgba(126,181,230,0.1)' : 'rgba(245,197,99,0.1)',
              color: trend.score >= 90 ? '#6BC9A0' : trend.score >= 80 ? '#7EB5E6' : '#F5C563',
            }}>{trend.score}%</div>
          </div>
          <p style={{ fontSize: '13px', color: '#7A6F62', lineHeight: '1.5' }}>{trend.desc}</p>
        </Card>
      ))}
    </div>
  )
}

export default TrendsPage
