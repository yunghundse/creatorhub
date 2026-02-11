import React from 'react'
import { Pencil } from 'lucide-react'
import MaintenanceBlock from '../../components/MaintenanceBlock'

const AnnotationsPage = () => (
  <MaintenanceBlock
    title="Annotations"
    description="Das Visual Annotation Tool befindet sich derzeit in Entwicklung."
    icon={Pencil}
    color="#7EB5E6"
  />
)

export default AnnotationsPage
