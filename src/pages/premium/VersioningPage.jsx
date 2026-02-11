import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch, ArrowLeft, Plus, Check, X, Eye, Clock, User, Star, ChevronDown, ChevronUp } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const DEMO_ASSETS = [
  {
    id: 1,
    title: 'Instagram Reel — Produktplatzierung',
    versions: [
      { v: 'v1', date: '2026-02-05', by: 'Alex (Model)', status: 'rejected', notes: 'Erste Version — Farben zu dunkel', size: '24.5 MB' },
      { v: 'v2', date: '2026-02-08', by: 'Alex (Model)', status: 'review', notes: 'Farben korrigiert, neues Outro', size: '25.1 MB' },
    ],
  },
  {
    id: 2,
    title: 'YouTube Thumbnail — Gaming Setup',
    versions: [
      { v: 'v1', date: '2026-02-01', by: 'Lisa (Designer)', status: 'rejected', notes: 'Erster Entwurf', size: '3.2 MB' },
      { v: 'v2', date: '2026-02-04', by: 'Lisa (Designer)', status: 'rejected', notes: 'Text größer, mehr Kontrast', size: '3.4 MB' },
      { v: 'Final', date: '2026-02-07', by: 'Lisa (Designer)', status: 'approved', notes: 'Finaler Entwurf — genehmigt', size: '3.3 MB' },
    ],
  },
  {
    id: 3,
    title: 'TikTok Video — Outfit of the Day',
    versions: [
      { v: 'v1', date: '2026-02-10', by: 'Max (Model)', status: 'review', notes: 'Erster Schnitt, 45 Sekunden', size: '18.7 MB' },
    ],
  },
]

const VERSION_STATUS = {
  review: { label: 'In Review', color: '#F5C563' },
  approved: { label: 'Genehmigt', color: '#6BC9A0' },
  rejected: { label: 'Überarbeiten', color: '#DC2626' },
}

const VersioningPage = ({ userData }) => {
  const navigate = useNavigate()
  const [assets] = useState(DEMO_ASSETS)
  const [expandedAsset, setExpandedAsset] = useState(1)
  const [compareMode, setCompareMode] = useState(null)

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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Asset Versioning</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Versionen vergleichen & freigeben</p>
        </div>
        <span style={{
          marginLeft: 'auto', padding: '4px 10px', borderRadius: '8px',
          background: 'rgba(245,197,99,0.1)', color: '#F5C563', fontSize: '11px', fontWeight: '700',
        }}>PREVIEW</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <GitBranch size={16} color="#9B8FE6" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#2A2420' }}>{assets.reduce((s, a) => s + a.versions.length, 0)}</p>
          <p style={{ fontSize: '10px', color: '#A89B8C' }}>Versionen</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <Clock size={16} color="#F5C563" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#F5C563' }}>{assets.reduce((s, a) => s + a.versions.filter(v => v.status === 'review').length, 0)}</p>
          <p style={{ fontSize: '10px', color: '#A89B8C' }}>In Review</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <Check size={16} color="#6BC9A0" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#6BC9A0' }}>{assets.reduce((s, a) => s + a.versions.filter(v => v.status === 'approved').length, 0)}</p>
          <p style={{ fontSize: '10px', color: '#A89B8C' }}>Genehmigt</p>
        </Card>
      </div>

      {/* Asset List */}
      {assets.map(asset => {
        const isExpanded = expandedAsset === asset.id
        const latestVersion = asset.versions[asset.versions.length - 1]
        const latestStatus = VERSION_STATUS[latestVersion.status]

        return (
          <Card key={asset.id} style={{ marginBottom: '12px', padding: '0', overflow: 'hidden' }}>
            {/* Asset Header */}
            <div
              onClick={() => setExpandedAsset(isExpanded ? null : asset.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                cursor: 'pointer', borderBottom: isExpanded ? '1px solid rgba(232,223,211,0.3)' : 'none',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(155,143,230,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GitBranch size={18} color="#9B8FE6" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{asset.title}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#A89B8C' }}>{asset.versions.length} Versionen</span>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                    background: `${latestStatus.color}12`, color: latestStatus.color, fontWeight: '600',
                  }}>{latestStatus.label}</span>
                </div>
              </div>
              {isExpanded ? <ChevronUp size={18} color="#A89B8C" /> : <ChevronDown size={18} color="#A89B8C" />}
            </div>

            {/* Version Timeline */}
            {isExpanded && (
              <div style={{ padding: '12px 16px' }}>
                {asset.versions.map((ver, vIdx) => {
                  const vStatus = VERSION_STATUS[ver.status]
                  const isLast = vIdx === asset.versions.length - 1

                  return (
                    <div key={vIdx} style={{
                      display: 'flex', gap: '12px', position: 'relative',
                      paddingBottom: isLast ? '0' : '16px',
                    }}>
                      {/* Timeline line */}
                      {!isLast && (
                        <div style={{
                          position: 'absolute', left: '15px', top: '28px', bottom: '0',
                          width: '2px', background: 'rgba(232,223,211,0.4)',
                        }} />
                      )}

                      {/* Version dot */}
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: `${vStatus.color}15`, border: `2px solid ${vStatus.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {ver.status === 'approved' ? <Check size={14} color={vStatus.color} /> :
                         ver.status === 'rejected' ? <X size={14} color={vStatus.color} /> :
                         <Eye size={14} color={vStatus.color} />}
                      </div>

                      {/* Version details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', color: '#2A2420', fontSize: '14px' }}>{ver.v}</span>
                          <span style={{
                            fontSize: '10px', padding: '2px 6px', borderRadius: '6px',
                            background: `${vStatus.color}10`, color: vStatus.color, fontWeight: '500',
                          }}>{vStatus.label}</span>
                          {ver.v === 'Final' && <Star size={12} color="#F5C563" />}
                        </div>
                        <p style={{ fontSize: '12px', color: '#7A6F62', marginBottom: '4px' }}>{ver.notes}</p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#A89B8C' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={10} /> {ver.by}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> {ver.date}</span>
                          <span>{ver.size}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )
      })}

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#A89B8C', marginTop: '16px' }}>
        Datei-Upload und Side-by-Side Vergleich werden mit dem Pro-Plan verfügbar.
      </p>
    </div>
  )
}

export default VersioningPage
