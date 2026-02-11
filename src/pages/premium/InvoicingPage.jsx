import React from 'react'
import { Receipt } from 'lucide-react'
import MaintenanceBlock from '../../components/MaintenanceBlock'

const InvoicingPage = () => (
  <MaintenanceBlock
    title="Invoicing"
    description="Das Rechnungssystem befindet sich derzeit in Entwicklung."
    icon={Receipt}
    color="#F5C563"
  />
)

export default InvoicingPage
