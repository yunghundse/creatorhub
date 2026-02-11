import React from 'react'
import { Stamp } from 'lucide-react'
import MaintenanceBlock from '../../components/MaintenanceBlock'

const WatermarkPage = () => (
  <MaintenanceBlock
    title="Watermark"
    description="Der Auto-Watermark Generator befindet sich derzeit in Entwicklung."
    icon={Stamp}
    color="#FF6B9D"
  />
)

export default WatermarkPage
