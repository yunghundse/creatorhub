import React from 'react'
import { GitBranch } from 'lucide-react'
import MaintenanceBlock from '../../components/MaintenanceBlock'

const VersioningPage = () => (
  <MaintenanceBlock
    title="Asset Versioning"
    description="Das Versioning-System befindet sich derzeit in Entwicklung."
    icon={GitBranch}
    color="#7EB5E6"
  />
)

export default VersioningPage
