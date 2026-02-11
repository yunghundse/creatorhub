import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Kanban, DollarSign } from 'lucide-react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'

const AnalyticsPage = () => {
  const [contentStats, setContentStats] = useState({ total: 0, editing: 0, review: 0, ready: 0, earnings: 0 })
  const [financeStats, setFinanceStats] = useState({ brutto: 0, netto: 0, count: 0, platforms: {} })
  const [eventCount, setEventCount] = useState(0)
  const user = auth.currentUser

  useEffect(() => {
    if (!user) return
    const q1 = query(collection(db, 'content'), where('userId', '==', user.uid))
    const unsub1 = onSnapshot(q1, snap => {
      const items = snap.docs.map(d => d.data())
      setContentStats({
        total: items.length,
        editing: items.filter(i => i.status === 'Editing').length,
        review: items.filter(i => i.status === 'Review').length,
        ready: items.filter(i => i.status === 'Ready').length,
        earnings: items.reduce((s, i) => s + (i.earnings || 0), 0),
      })
    })
    const q2 = query(collection(db, 'finances'), where('userId', '==', user.uid))
    const unsub2 = onSnapshot(q2, snap => {
      const items = snap.docs.map(d => d.data())
      const platforms = {}
      items.forEach(i => {
        if (!platforms[i.platform]) platforms[i.platform] = 0
        platforms[i.platform] += (i.netto || 0)
      })
      setFinanceStats({
        brutto: items.reduce((s, i) => s + (i.brutto || 0), 0),
        netto: items.reduce((s, i) => s + (i.netto || 0), 0),
        count: items.length,
        platforms,
      })
    })
    const q3 = query(collection(db, 'events'), where('userId', '==', user.uid))
    const unsub3 = onSnapshot(q3, snap => setEventCount(snap.size))
    return () => { unsub1(); unsub2(); unsub3() }
  }, [user])

  const statCards = [
    { label: 'Content gesamt', value: contentStats.total, icon: Kanban, color: '#FF6B9D' },
    { label: 'Netto-Einnahmen', value: `€${financeStats.netto.toLocaleString('de-DE')}`, icon: DollarSign, color: '#6BC9A0' },
    { label: 'Brutto', value: `€${financeStats.brutto.toLocaleString('de-DE')}`, icon: TrendingUp, color: '#7EB5E6' },
    { label: 'Events', value: eventCount, icon: Users, color: '#F5C563' },
  ]

  const sortedPlatforms = Object.entries(financeStats.platforms).sort((a, b) => b[1] - a[1])
  const maxPlatformVal = sortedPlatforms.length > 0 ? sortedPlatforms[0][1] : 1

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420', marginBottom: '4px' }}>Analytics</h2>
        <p style={{ color: '#A89B8C', fontSize: '14px' }}>Dein Business auf einen Blick</p>
      </div>

      {/* Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', background: `${s.color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={s.color} />
                </div>
                <span style={{ fontSize: '12px', color: '#A89B8C', fontWeight: '500' }}>{s.label}</span>
              </div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#2A2420', letterSpacing: '-0.5px' }}>{s.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Content Pipeline */}
      <Card style={{ marginBottom: '16px' }}>
        <h3 style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Kanban size={16} color="#FF6B9D" /> Content Pipeline
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { label: 'Editing', count: contentStats.editing, color: '#FF6B9D' },
            { label: 'Review', count: contentStats.review, color: '#7EB5E6' },
            { label: 'Ready', count: contentStats.ready, color: '#6BC9A0' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '12px', background: `${s.color}08`, borderRadius: '12px' }}>
              <p style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.count}</p>
              <p style={{ fontSize: '11px', color: '#A89B8C', fontWeight: '500' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Platform Breakdown */}
      {sortedPlatforms.length > 0 && (
        <Card>
          <h3 style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} color="#7EB5E6" /> Plattform-Umsätze
          </h3>
          {sortedPlatforms.map(([platform, total]) => (
            <div key={platform} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#5C5349' }}>{platform}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#6BC9A0' }}>€{total.toLocaleString('de-DE')}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(42,36,32,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(total / maxPlatformVal) * 100}%`, background: 'linear-gradient(90deg, #7EB5E6, #6BC9A0)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

export default AnalyticsPage
