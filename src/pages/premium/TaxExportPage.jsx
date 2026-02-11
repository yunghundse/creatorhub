import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, Download, Calendar, Euro, TrendingUp, TrendingDown, Filter, CheckCircle, Printer } from 'lucide-react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import Card from '../../components/Card'
import Button from '../../components/Button'

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

const TaxExportPage = ({ userData }) => {
  const navigate = useNavigate()
  const [year, setYear] = useState(2026)
  const [finances, setFinances] = useState([])
  const [brandDeals, setBrandDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [exported, setExported] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const user = auth.currentUser
      if (!user) return

      try {
        const fSnap = await getDocs(query(collection(db, 'finances'), where('userId', '==', user.uid)))
        setFinances(fSnap.docs.map(d => d.data()))

        if (userData?.companyId) {
          const bSnap = await getDocs(query(collection(db, 'brandDeals'), where('companyId', '==', userData.companyId), where('status', '==', 'paid')))
          setBrandDeals(bSnap.docs.map(d => d.data()))
        }
      } catch (err) {
        console.error('Tax data load error:', err)
      }
      setLoading(false)
    }
    loadData()
  }, [userData, year])

  const totalBrutto = finances.reduce((s, f) => s + (f.brutto || 0), 0)
  const totalNetto = finances.reduce((s, f) => s + (f.netto || 0), 0)
  const totalDeals = brandDeals.reduce((s, d) => s + (d.value || 0), 0)
  const totalIncome = totalBrutto + totalDeals
  const taxEstimate = Math.round(totalIncome * 0.19)

  const exportCSV = () => {
    const rows = [['Datum', 'Quelle', 'Plattform', 'Brutto', 'Netto', 'Typ']]

    finances.forEach(f => {
      rows.push([f.month || '', 'Plattform-Einnahmen', f.platform || '', f.brutto || 0, f.netto || 0, 'Einnahme'])
    })

    brandDeals.forEach(d => {
      rows.push([d.deadline || '', `Brand Deal: ${d.brand}`, d.platform || '', d.value || 0, d.value || 0, 'Deal'])
    })

    rows.push([])
    rows.push(['', '', 'GESAMT Brutto:', totalBrutto, 'GESAMT Netto:', totalNetto])
    rows.push(['', '', 'GESAMT Deals:', totalDeals, 'Geschätzte USt:', taxEstimate])

    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CreatorHub_Steuer_${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>Tax-Ready Export</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Steuervorbereitung auf einen Klick</p>
        </div>
      </div>

      {/* Year Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[2025, 2026].map(y => (
          <button key={y} onClick={() => setYear(y)} style={{
            padding: '8px 18px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600',
            background: year === y ? 'rgba(245,197,99,0.15)' : 'rgba(42,36,32,0.04)',
            color: year === y ? '#E8A940' : '#7A6F62', cursor: 'pointer',
          }}>{y}</button>
        ))}
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <TrendingUp size={18} color="#6BC9A0" style={{ marginBottom: '6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Einnahmen (Brutto)</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>{totalBrutto.toLocaleString('de-DE')} EUR</p>
        </Card>
        <Card style={{ padding: '16px' }}>
          <Euro size={18} color="#7EB5E6" style={{ marginBottom: '6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Einnahmen (Netto)</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#7EB5E6' }}>{totalNetto.toLocaleString('de-DE')} EUR</p>
        </Card>
        <Card style={{ padding: '16px' }}>
          <TrendingUp size={18} color="#F5C563" style={{ marginBottom: '6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Brand Deals (bezahlt)</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#F5C563' }}>{totalDeals.toLocaleString('de-DE')} EUR</p>
        </Card>
        <Card style={{ padding: '16px' }}>
          <TrendingDown size={18} color="#FF6B9D" style={{ marginBottom: '6px' }} />
          <p style={{ fontSize: '11px', color: '#A89B8C' }}>Geschätzte USt (19%)</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#FF6B9D' }}>{taxEstimate.toLocaleString('de-DE')} EUR</p>
        </Card>
      </div>

      {/* Detail Breakdown */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Calendar size={16} color="#9B8FE6" />
          <span style={{ fontWeight: '600', color: '#2A2420', fontSize: '15px' }}>Aufschlüsselung</span>
        </div>

        {finances.length === 0 && brandDeals.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#A89B8C', fontSize: '14px', padding: '20px 0' }}>
            Keine Finanzdaten für {year} vorhanden.
          </p>
        ) : (
          <div>
            {finances.slice(0, 8).map((f, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid rgba(232,223,211,0.3)',
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#2A2420' }}>{f.platform || 'Plattform'}</p>
                  <p style={{ fontSize: '11px', color: '#A89B8C' }}>{f.month || 'k.A.'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#2A2420' }}>{(f.brutto || 0).toLocaleString('de-DE')} EUR</p>
                  <p style={{ fontSize: '11px', color: '#6BC9A0' }}>Netto: {(f.netto || 0).toLocaleString('de-DE')}</p>
                </div>
              </div>
            ))}
            {brandDeals.slice(0, 4).map((d, i) => (
              <div key={`d-${i}`} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid rgba(232,223,211,0.3)',
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#2A2420' }}>Deal: {d.brand}</p>
                  <p style={{ fontSize: '11px', color: '#A89B8C' }}>{d.platform || 'k.A.'}</p>
                </div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#F5C563' }}>{(d.value || 0).toLocaleString('de-DE')} EUR</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Export Button */}
      {exported && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px', marginBottom: '12px',
          background: 'rgba(107,201,160,0.1)', border: '1px solid rgba(107,201,160,0.25)',
          display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
        }}>
          <CheckCircle size={16} color="#6BC9A0" />
          <span style={{ fontSize: '14px', color: '#6BC9A0', fontWeight: '600' }}>CSV erfolgreich exportiert!</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <Button variant="primary" onClick={exportCSV} style={{ flex: 1, padding: '14px' }}>
          <Download size={16} /> CSV Export für Steuerberater
        </Button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#A89B8C', marginTop: '16px', lineHeight: '1.5' }}>
        Export enthält: Plattform-Einnahmen, Brand Deals, USt-Schätzung.
        Für die finale Steuererklärung bitte einen Steuerberater konsultieren.
      </p>
    </div>
  )
}

export default TaxExportPage
