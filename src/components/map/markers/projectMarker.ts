import L from 'leaflet'
import type { ProjectStatus } from '@/types/enums'

const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNED: '#6B6B6B',
  APPROVED: '#2D5F8B',
  UNDER_CONSTRUCTION: '#B8533A',
  COMPLETED: '#3A6B3A',
  SUSPENDED: '#8B2D2D',
}

export function createProjectMarker(status: ProjectStatus): L.DivIcon {
  const color = PROJECT_STATUS_COLORS[status]
  return L.divIcon({
    html: `<div class="project-marker" style="background:${color}"></div>`,
    className: 'project-marker-wrapper',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}
