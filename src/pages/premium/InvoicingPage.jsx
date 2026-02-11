import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, ArrowLeft, Plus, X, Send, Download, CheckCircle, Clock, Euro, Printer, FileText, User } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const DEMO_INVOICES = [
  { id: 'INV-2026-001', client: 'FashionNova DE', amount: 2500, date: '2026-01-15', due: '2026-02-15', status: 'paid', items: 'Instagram Kampagne (3 Posts + Story)' },
  { id: 'INV-2026-002', client: 'Max Mustermann (Model)', amount: 800, date: '2026-02-01', due: '2026-03-01', status: 'sent', items: 'Management Fee Februar' },
  { id: 'INV-2026-003', client: 'TechBrand GmbH', amount: 5000, date: '2026-02-10', due: '2026-03-10', status: 'draft', items: 'YouTube Video + TikTok Serie (5 Videos)' },
]

const STATUS_CFG = {
  draft: { label: 'Entwurf', color: '#A89B8C' },
  sent: { label: 'Versendet', color: '#7EB5E6' },
  paid: { label: 'Bezahlt', color: '#6BC9A0' },
  overdue: { label: 'Überfällig', color: '#DC2626' },
}

const InvoicingPage = ({ userData }) => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState(DEMO_INVOICES)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client: '', amount: '', items: '', due: '' })

  const totalSent = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.amount, 0)
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalDraft = invoices.filter(i => i.status === 'draft').reduce((s, i) => s + i.amount, 0)

  const createInvoice = () => {
    if (!form.client.trim() || !form.amount) return
    const newInv = {
      id: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      client: form.client.trim(),
      amount: parseFloat(form.amount),
      date: new Date().toISOString().slice(0, 10),
      due: form.due || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'draft',
      items: form.items.trim(),
    }
    setInvoices([newInv, ...invoices])
    setForm({ client: '', amount: '', items: '', due: '' })
    setShowForm(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(42,36,32,0.03)',
    border: '1.5px solid #E8DFD3', borderRadius: '12px', color: '#2A2420',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
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
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2A2420' }}>In-App Invoicing</h2>
          <p style={{ color: '#A89B8C', fontSize: '13px' }}>Rechnungen direkt erstellen & versenden</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)} style={{ marginLeft: 'auto', padding: '8px 14px', fontSize: '13px' }}>
          <Plus size={14} /> Neu
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <CheckCircle size={16} color="#6BC9A0" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#6BC9A0' }}>{totalPaid.toLocaleString('de-DE')} EUR</p>
          <p style={{ fontSize: '10px', color: '#A89B8C' }}>Bezahlt</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <Send size={16} color="#7EB5E6" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#7EB5E6' }}>{totalSent.toLocaleString('de-DE')} EUR</p>
          <p style={{ fontSize: '10px', color: '#A89B8C' }}>Offen</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px' }}>
          <FileText size={16} color="#A89B8C" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#A89B8C' }}>{totalDraft.toLocaleString('de-DE')} EUR</p>
          <p style={{ fontSize: '10px', color: '#A89B8C' }}>Entwurf</p>
        </Card>
      </div>

      {/* New Invoice Form */}
      {showForm && (
        <Card style={{ marginBottom: '16px', padding: '20px', border: '1.5px solid rgba(126,181,230,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2A2420' }}>Neue Rechnung</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#A89B8C', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Empfänger</label>
              <input type="text" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Name / Firma" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Betrag (EUR)</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Leistungsbeschreibung</label>
            <textarea value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} placeholder="z.B. Instagram Kampagne (3 Posts + Story)" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5C5349', display: 'block', marginBottom: '6px' }}>Fällig am</label>
            <input type="date" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} style={inputStyle} />
          </div>

          <Button variant="primary" onClick={createInvoice} style={{ width: '100%' }}>
            <Receipt size={16} /> Rechnung erstellen
          </Button>
        </Card>
      )}

      {/* Invoices List */}
      {invoices.map(inv => {
        const cfg = STATUS_CFG[inv.status] || STATUS_CFG.draft
        return (
          <Card key={inv.id} style={{ marginBottom: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#2A2420', fontSize: '14px' }}>{inv.id}</span>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                    background: `${cfg.color}12`, color: cfg.color, fontWeight: '600',
                  }}>{cfg.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <User size={12} color="#A89B8C" />
                  <span style={{ fontSize: '13px', color: '#5C5349' }}>{inv.client}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#A89B8C' }}>{inv.items}</p>
                <p style={{ fontSize: '11px', color: '#C4B8A8', marginTop: '4px' }}>
                  Erstellt: {inv.date} — Fällig: {inv.due}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#2A2420' }}>{inv.amount.toLocaleString('de-DE')}</p>
                <p style={{ fontSize: '11px', color: '#A89B8C' }}>EUR</p>
              </div>
            </div>
          </Card>
        )
      })}

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#A89B8C', marginTop: '16px' }}>
        PDF-Rechnungen und E-Mail-Versand werden mit dem Pro-Plan verfügbar.
      </p>
    </div>
  )
}

export default InvoicingPage
