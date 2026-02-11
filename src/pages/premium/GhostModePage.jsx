import React from 'react'
import { UserCheck } from 'lucide-react'
import MaintenanceBlock from '../../components/MaintenanceBlock'

const GhostModePage = () => (
  <MaintenanceBlock
    title="Ghost-Mode"
    description="Der Ghost-Mode für Manager befindet sich derzeit in Entwicklung."
    icon={UserCheck}
    color="#7EB5E6"
  />
)

export default GhostModePage
