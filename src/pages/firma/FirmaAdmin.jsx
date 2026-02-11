import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCompany } from '../../contexts/CompanyContext'
import {
  ArrowLeft, Users, UserPlus, Check, X, Copy, RefreshCw, Shield, Crown,
  CreditCard, BarChart3, Trash2, Clock, ChevronRight
} from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const FirmaAdmin = ({ userData }) => {
  const navigate = useNavigate()
  const { company, members, isOwner, approveMember, removeMember } = useCompany()
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('team') // team, billing

  if (!isOwner) {
    navigate('/firma/dashboard')
    return null
  }

  const approvedMembers = members.filter(m => m.status === 'approved')
  const pendingMembers = members.filter(m => m.status === 'pending')
  const limits = { free: 1, pro: 5, business: 10 }
  const maxSlots = limits[company?.abo || 'free'] || 1

  const copyCode = () => {
    if (company?.inviteCode) {
      navigator.clipboard?.writeText(company.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleApprove = async (membershipId) => {
    try { await approveMember(membershipId) } catch (err) { console.error(err) }
  }

  const handleRemove = async (membershipId, userId) => {
    if (!confirm('Mitglied wirklich entfernen?')) return
    try { await removeMember(membershipId, userId) } catch (err) { console.error(err) }
  }

  const roleLabels = { model: 'Model', cutter: 'Cutter', influencer: 'Influencer', manager: 'Manager' }
  const roleColors = { model: '#FF6B9D', cutter: '#6BC9A0', influencer: '#7EB5E6', manager: '#F5C563' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }} className="animate-fade-in">
        <button onClick={() => navigate('/firma/dashboard')} style={{ background: 'rgba(42,36,32,0.04)', border: '1px solid rgba(232,223,211,0.6)', borderRadius: '10px', padding: '8px', color: '#7A6F62', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Firma verwalten</h2>
          <p style={{ fontSize: '13px', color: '#A89B8C' }}>{company?.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }} className="animate-fade-in stagger-1">
        {[
          { id: 'team', icon: Users, label: 'Team' },
          { id: 'billing', icon: CreditCard, label: 'Abo & Plan' },
        ].map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              border: tab === t.id ? '1.5px solid rgba(126,181,230,0.3)' : '1px solid rgba(232,223,211,0.6)',
              background: tab === t.id ? 'rgba(126,181,230,0.06)' : 'transparent',
              color: tab === t.id ? '#7EB5E6' : '#7A6F62',
              fontWeight: tab === t.id ? '600' : '400', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <Icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'team' && (
        <>
          {/* Invite Code */}
          <Card style={{ marginBottom: '16px', padding: '18px' }} className="animate-fade-in stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <UserPlus size={16} color="#7EB5E6" />
              <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Einladungscode</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
              background: 'rgba(42,36,32,0.03)', borderRadius: '12px', border: '1.5px solid #E8DFD3',
            }}>
              <span style={{
                flex: 1, fontSize: '20px', fontWeight: '700', letterSpacing: '4px',
                fontFamily: 'monospace', color: '#2A2420', textAlign: 'center',
              }}>
                {company?.inviteCode || '------'}
              </span>
              <button onClick={copyCode} style={{
                padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: copied ? 'rgba(107,201,160,0.1)' : 'rgba(126,181,230,0.1)',
                color: copied ? '#6BC9A0' : '#7EB5E6',
              }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#A89B8C', marginTop: '8px', textAlign: 'center' }}>
              Teile diesen Code mit Models oder Cuttern, die deinem Team beitreten sollen.
            </p>
          </Card>

          {/* Slot Info */}
          <Card style={{ marginBottom: '16px', padding: '14px 18px' }} className="animate-fade-in stagger-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#7A6F62' }}>Team-Slots</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: approvedMembers.length >= maxSlots ? '#DC2626' : '#2A2420' }}>
                {approvedMembers.length} / {maxSlots}
              </span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(42,36,32,0.05)' }}>
              <div style={{
                height: '100%', borderRadius: '3px', transition: 'width 0.5s ease',
                width: `${Math.min((approvedMembers.length / maxSlots) * 100, 100)}%`,
                background: approvedMembers.length >= maxSlots
                  ? 'linear-gradient(90deg, #DC2626, #EF4444)'
                  : 'linear-gradient(90deg, #7EB5E6, #5A9BD4)',
              }} />
            </div>
            {approvedMembers.length >= maxSlots && (
              <Button variant="cream" onClick={() => navigate('/dashboard/pricing')} style={{ width: '100%', padding: '10px', marginTop: '10px', fontSize: '13px' }}>
                Upgrade für mehr Slots
              </Button>
            )}
          </Card>

          {/* Pending Members */}
          {pendingMembers.length > 0 && (
            <>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#F5C563', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }} className="animate-fade-in stagger-4">
                Ausstehende Anfragen ({pendingMembers.length})
              </p>
              {pendingMembers.map(m => (
                <Card key={m.id} style={{ marginBottom: '8px', padding: '14px 18px', border: '1.5px solid rgba(245,197,99,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '16px', color: '#5C5349',
                    }}>
                      {m.user?.displayName?.charAt(0) || m.user?.email?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{m.user?.displayName || m.user?.email}</p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                        <span style={{
                          fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600',
                          background: `${roleColors[m.role] || '#A89B8C'}10`, color: roleColors[m.role] || '#A89B8C',
                        }}>{roleLabels[m.role] || m.role}</span>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,197,99,0.1)', color: '#F5C563', fontWeight: '600' }}>
                          Ausstehend
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleApprove(m.id)} style={{
                        width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #6BC9A0, #4FA882)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check size={16} color="white" />
                      </button>
                      <button onClick={() => handleRemove(m.id, m.userId)} style={{
                        width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.2)', cursor: 'pointer',
                        background: 'rgba(220,38,38,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <X size={16} color="#DC2626" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}

          {/* Approved Members */}
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#A89B8C', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px', marginBottom: '10px' }}>
            Aktive Mitglieder ({approvedMembers.length})
          </p>
          {approvedMembers.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '30px 20px' }}>
              <Users size={28} color="#E8DFD3" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: '#A89B8C' }}>Noch keine Mitglieder freigeschaltet.</p>
            </Card>
          ) : (
            approvedMembers.map(m => (
              <Card key={m.id} style={{ marginBottom: '6px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #FFE8B8, #FFDDA0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '14px', color: '#5C5349',
                }}>
                  {m.user?.displayName?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>{m.user?.displayName || m.user?.email}</p>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600',
                    background: `${roleColors[m.role] || '#A89B8C'}10`, color: roleColors[m.role] || '#A89B8C',
                  }}>{roleLabels[m.role] || m.role}</span>
                </div>
                <button onClick={() => handleRemove(m.id, m.userId)} style={{
                  background: 'none', border: 'none', color: '#C9BFAF', cursor: 'pointer', padding: '6px',
                }}>
                  <Trash2 size={14} />
                </button>
              </Card>
            ))
          )}
        </>
      )}

      {tab === 'billing' && (
        <>
          {/* Current Plan */}
          <Card style={{ marginBottom: '16px', padding: '20px' }} className="animate-fade-in stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Crown size={18} color="#F5C563" />
              <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Aktueller Plan</span>
            </div>
            <div style={{
              padding: '16px', borderRadius: '14px', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(245,197,99,0.08), rgba(245,197,99,0.03))',
              border: '1px solid rgba(245,197,99,0.15)',
            }}>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#2A2420', textTransform: 'uppercase' }}>
                {company?.abo || 'free'}
              </p>
              <p style={{ fontSize: '13px', color: '#7A6F62', marginTop: '4px' }}>
                {maxSlots} Team-{maxSlots === 1 ? 'Slot' : 'Slots'} · {company?.abo === 'business' ? 'Full Premium' : company?.abo === 'pro' ? 'Premium Features' : 'Basis-Features'}
              </p>
            </div>
          </Card>

          {/* Upgrade Button */}
          <Button variant="primary" onClick={() => navigate('/dashboard/pricing')} style={{ width: '100%', padding: '14px', marginBottom: '16px' }}>
            Plan upgraden
          </Button>

          {/* Subscription Management */}
          <Card onClick={() => navigate('/dashboard/subscription')} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}>
            <CreditCard size={18} color="#7EB5E6" />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', color: '#2A2420', fontSize: '14px' }}>Abo-Verwaltung</p>
              <p style={{ fontSize: '12px', color: '#A89B8C' }}>Rechnungen, Zahlungsmethode, Kündigung</p>
            </div>
            <ChevronRight size={16} color="#C9BFAF" />
          </Card>
        </>
      )}
    </div>
  )
}

export default FirmaAdmin
