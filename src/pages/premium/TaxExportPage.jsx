import React from 'react'
import { FileText } from 'lucide-react'
import MaintenanceBlock from '../../components/MaintenanceBlock'

const TaxExportPage = () => (
  <MaintenanceBlock
    title="Tax Export"
    description="Der Steuer-Export befindet sich derzeit in Entwicklung."
    icon={FileText}
    color="#F5C563"
  />
)

export default TaxExportPage
