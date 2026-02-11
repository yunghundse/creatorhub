import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowLeft, Sparkles, BarChart3, Zap, Target, Star, Eye, ThumbsUp, Share2 } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const DEMO_RESULTS = [
  { label: 'Hook-Stärke', score: 82, color: '#6BC9A0', tip: 'Starker Einstieg — emotionaler Trigger erkannt' },
  { label: 'Trend-Match', score: 67, color: '#7EB5E6', tip: 'Trend "Get Ready With Me" erkannt — +34% potentielle Reichweite' },
  { label: 'Thumbnail-Appeal', score: 91, color: '#F5C563', tip: 'Kontrastreicher Titel + Gesicht = höhere CTR' },
  { label: 'Engagement-Potential', score: 74, color: '#9B8FE6', tip: 'CTA am Ende fehlt — könnte +15% Shares bringen' },
]

const ViralPredictorPage = ({ userData }) => {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [overallScore, setOverallScore] = useState(null)

  const runDemo = () => {
    if (!input.trim()) return
    setAnalyzing(true)
    setResults(null)
    setTimeout(() => {
      const jitter = () => Math.floor(Math.random() * 20) - 10
      const demoWithJitter = DEMO_RESULTS.map(r => ({
        ...r,
        score: Math.min(100, Math.max(10, r.score + jitter())),
      }))
      const avg = Math.round(demoWithJitter.reduce((s, r) => s + r.score, 0) / demoWithJitter.length)
      setResults(demoWithJitter)
      setOverallScore(avg)
      setAnalyzing(false)
    }, 2000)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#6BC9A0'
    if (score >= 60) return '#F5C563'
    if (score >= 40) return '#E8A940'
    return '#DC2626'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Viral-Potential!'
    if (score >= 60) return 'Gut'
    if (score >= 40) return 'Ausbaufähig'
    return 'Überarbeiten'
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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Viral Predictor</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>KI-gestützte Viralitäts-Analyse</p>
        </div>
        <span style={{
          marginLeft: 'auto', padding: '4px 10px', borderRadius: '8px',
          background: 'rgba(245,197,99,0.1)', color: '#F5C563', fontSize: '11px', fontWeight: '700',
        }}>PREVIEW</span>
      </div>

      {/* Info Banner */}
      <Card style={{
        marginBottom: '20px', padding: '16px',
        background: 'linear-gradient(135deg, rgba(155,143,230,0.08), rgba(155,143,230,0.04))',
        border: '1px solid rgba(155,143,230,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={20} color="#9B8FE6" />
          <div>
            <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Demo-Modus aktiv</p>
            <p style={{ fontSize: '12px', color: '#7A6F62' }}>Echtzeit-Trendanalyse wird mit Pro-Plan freigeschaltet</p>
          </div>
        </div>
      </Card>

      {/* Input Area */}
      <Card style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '10px' }}>
          Skript / Titel / Beschreibung eingeben
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="z.B. 'Get Ready With Me für mein erstes Date — komplett neues Outfit + Makeup Tutorial'"
          rows={4}
          style={{
            width: '100%', padding: '14px', background: 'rgba(42,36,32,0.03)',
            border: '1.5px solid #E8DFD3', borderRadius: '14px', color: '#2A2420',
            fontSize: '14px', fontFamily: 'inherit', resize: 'vertical',
            outline: 'none', boxSizing: 'border-box', lineHeight: '1.5',
          }}
        />
        <Button
          variant="primary"
          onClick={runDemo}
          disabled={analyzing || !input.trim()}
          style={{ width: '100%', marginTop: '12px', padding: '14px' }}
        >
          {analyzing ? (
            <><span className="animate-spin" style={{ display: 'inline-block' }}>⏳</span> Analysiere...</>
          ) : (
            <><TrendingUp size={16} /> Viralität analysieren</>
          )}
        </Button>
      </Card>

      {/* Results */}
      {results && (
        <div className="animate-fade-in">
          {/* Overall Score */}
          <Card style={{
            textAlign: 'center', marginBottom: '16px', padding: '28px',
            background: `linear-gradient(135deg, ${getScoreColor(overallScore)}08, ${getScoreColor(overallScore)}04)`,
            border: `1.5px solid ${getScoreColor(overallScore)}25`,
          }}>
            <p style={{ fontSize: '48px', fontWeight: '800', color: getScoreColor(overallScore), marginBottom: '4px' }}>
              {overallScore}
            </p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420', marginBottom: '4px' }}>
              {getScoreLabel(overallScore)}
            </p>
            <p style={{ fontSize: '12px', color: '#A89B8C' }}>Viralitäts-Score (1-100)</p>
          </Card>

          {/* Detail Scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {results.map((r, i) => (
              <Card key={i} style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{r.label}</span>
                  <span style={{ fontWeight: '700', color: r.color, fontSize: '18px' }}>{r.score}</span>
                </div>
                <div style={{
                  width: '100%', height: '6px', borderRadius: '3px',
                  background: 'rgba(42,36,32,0.06)', overflow: 'hidden', marginBottom: '8px',
                }}>
                  <div style={{
                    width: `${r.score}%`, height: '100%', borderRadius: '3px',
                    background: `linear-gradient(90deg, ${r.color}80, ${r.color})`,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                <p style={{ fontSize: '12px', color: '#7A6F62', lineHeight: '1.5' }}>{r.tip}</p>
              </Card>
            ))}
          </div>

          {/* Recommendations */}
          <Card style={{ padding: '16px', borderLeft: '3px solid #9B8FE6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Zap size={16} color="#9B8FE6" />
              <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>KI-Empfehlungen</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Target size={14} color="#6BC9A0" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#5C5349', lineHeight: '1.5' }}>Füge einen Call-to-Action am Ende hinzu (z.B. "Speichert dieses Video!")</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Target size={14} color="#7EB5E6" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#5C5349', lineHeight: '1.5' }}>Optimaler Post-Zeitpunkt: Heute um 19:00 Uhr (Engagement-Peak)</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Target size={14} color="#F5C563" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#5C5349', lineHeight: '1.5' }}>Nutze den Trend-Sound "XYZ" für +20% Discovery</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ViralPredictorPage
