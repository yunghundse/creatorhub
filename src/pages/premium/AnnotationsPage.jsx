import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, ArrowLeft, Image, MessageCircle, Circle, Square, Type, Trash2, Undo2, MousePointer } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const DEMO_ANNOTATIONS = [
  { id: 1, x: 25, y: 30, text: 'Licht hier anpassen', color: '#FF6B9D', by: 'Manager' },
  { id: 2, x: 60, y: 50, text: 'Diesen Frame schneiden', color: '#7EB5E6', by: 'Influencer' },
  { id: 3, x: 40, y: 75, text: 'Text-Overlay einfügen', color: '#F5C563', by: 'Manager' },
]

const TOOLS = [
  { id: 'pointer', icon: MousePointer, label: 'Auswahl' },
  { id: 'circle', icon: Circle, label: 'Kreis' },
  { id: 'rect', icon: Square, label: 'Rechteck' },
  { id: 'text', icon: Type, label: 'Text' },
]

const AnnotationsPage = ({ userData }) => {
  const navigate = useNavigate()
  const [annotations, setAnnotations] = useState(DEMO_ANNOTATIONS)
  const [activeTool, setActiveTool] = useState('pointer')
  const [selectedAnnotation, setSelectedAnnotation] = useState(null)

  const removeAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id))
    if (selectedAnnotation === id) setSelectedAnnotation(null)
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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Visual Annotations</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Feedback direkt im Bild markieren</p>
        </div>
        <span style={{
          marginLeft: 'auto', padding: '4px 10px', borderRadius: '8px',
          background: 'rgba(245,197,99,0.1)', color: '#F5C563', fontSize: '11px', fontWeight: '700',
        }}>PREVIEW</span>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: '6px', marginBottom: '12px',
        padding: '8px', borderRadius: '14px',
        background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(232,223,211,0.4)',
      }}>
        {TOOLS.map(tool => {
          const Icon = tool.icon
          return (
            <button key={tool.id} onClick={() => setActiveTool(tool.id)} style={{
              flex: 1, padding: '10px 8px', borderRadius: '10px', border: 'none',
              background: activeTool === tool.id ? 'rgba(155,143,230,0.12)' : 'transparent',
              color: activeTool === tool.id ? '#9B8FE6' : '#7A6F62',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              fontSize: '10px', fontWeight: '500', fontFamily: 'inherit',
            }}>
              <Icon size={18} />
              {tool.label}
            </button>
          )
        })}
        <button onClick={() => { if (annotations.length > 0) setAnnotations(annotations.slice(0, -1)) }} style={{
          padding: '10px 14px', borderRadius: '10px', border: 'none',
          background: 'rgba(42,36,32,0.04)', color: '#7A6F62', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Undo2 size={18} />
        </button>
      </div>

      {/* Canvas Area */}
      <Card style={{
        padding: '0', overflow: 'hidden', marginBottom: '20px',
        position: 'relative', minHeight: '280px',
        background: 'linear-gradient(135deg, #3D362F, #2A2420)',
      }}>
        {/* Simulated image */}
        <div style={{
          width: '100%', height: '280px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <Image size={48} color="rgba(255,255,255,0.1)" />

          {/* Annotation markers */}
          {annotations.map(ann => (
            <div
              key={ann.id}
              onClick={() => setSelectedAnnotation(selectedAnnotation === ann.id ? null : ann.id)}
              style={{
                position: 'absolute', left: `${ann.x}%`, top: `${ann.y}%`,
                transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 10,
              }}
            >
              {/* Outer ring */}
              <div style={{
                width: selectedAnnotation === ann.id ? '44px' : '36px',
                height: selectedAnnotation === ann.id ? '44px' : '36px',
                borderRadius: '50%',
                background: `${ann.color}25`, border: `2px solid ${ann.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: selectedAnnotation === ann.id ? `0 0 20px ${ann.color}40` : 'none',
              }}>
                <MessageCircle size={16} color={ann.color} />
              </div>

              {/* Tooltip */}
              {selectedAnnotation === ann.id && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginTop: '8px', padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,253,247,0.95)', border: `1px solid ${ann.color}30`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
                  minWidth: '150px',
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#2A2420', marginBottom: '4px' }}>{ann.text}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#A89B8C' }}>von {ann.by}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id) }} style={{
                      padding: '4px', borderRadius: '6px', border: 'none',
                      background: 'rgba(220,38,38,0.08)', color: '#DC2626', cursor: 'pointer',
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Drop zone indicator */}
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px',
            padding: '6px 12px', borderRadius: '8px',
            background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)',
            fontSize: '11px',
          }}>
            {annotations.length} Markierungen
          </div>
        </div>
      </Card>

      {/* Annotations List */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#2A2420', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={16} color="#9B8FE6" /> Alle Markierungen
        </h3>
        {annotations.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ color: '#A89B8C', fontSize: '13px' }}>Keine Markierungen vorhanden</p>
          </Card>
        ) : (
          annotations.map(ann => (
            <Card key={ann.id} onClick={() => setSelectedAnnotation(ann.id)} style={{
              marginBottom: '8px', padding: '12px 14px', cursor: 'pointer',
              borderLeft: `3px solid ${ann.color}`,
              background: selectedAnnotation === ann.id ? `${ann.color}06` : 'transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '13px' }}>{ann.text}</p>
                  <p style={{ fontSize: '11px', color: '#A89B8C', marginTop: '2px' }}>von {ann.by}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id) }} style={{
                  padding: '6px', borderRadius: '8px', border: 'none',
                  background: 'rgba(220,38,38,0.06)', color: '#DC2626', cursor: 'pointer',
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#A89B8C' }}>
        Bild/Video-Upload und Echtzeit-Collaboration werden mit dem Pro-Plan verfügbar.
      </p>
    </div>
  )
}

export default AnnotationsPage
