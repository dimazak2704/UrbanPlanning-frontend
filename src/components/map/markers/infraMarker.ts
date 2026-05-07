import L from 'leaflet'
import type { InfrastructureType, InfrastructureStatus } from '@/types/enums'

const INFRA_STATUS_COLORS: Record<InfrastructureStatus, string> = {
  PLANNED: '#6B6B6B',
  UNDER_CONSTRUCTION: '#B8533A',
  OPERATIONAL: '#3A6B3A',
}

const INFRA_TYPE_ICONS: Record<InfrastructureType, string> = {
  TRANSPORT: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M184,24H72A24,24,0,0,0,48,48V200a24,24,0,0,0,16,22.62V232a8,8,0,0,0,16,0v-8h96v8a8,8,0,0,0,16,0v-9.38A24,24,0,0,0,208,200V48A24,24,0,0,0,184,24ZM64,112h64v32H64Zm80,0h64v32H144ZM72,40H184a8,8,0,0,1,8,8V96H64V48A8,8,0,0,1,72,40ZM184,208H72a8,8,0,0,1-8-8V160H192v40A8,8,0,0,1,184,208ZM84,184a12,12,0,1,1-12-12A12,12,0,0,1,84,184Zm104,0a12,12,0,1,1-12-12A12,12,0,0,1,188,184Z"/></svg>',
  SOCIAL: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"/></svg>',
  UTILITY: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Z"/></svg>',
  RECREATIONAL: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M184,168a40,40,0,0,1-40-40,8,8,0,0,1,16,0,24,24,0,0,0,24,24,8,8,0,0,1,0,16Zm56-40a112,112,0,0,1-209.84,55.07A8.18,8.18,0,0,1,30,184a8,8,0,0,1,4-7,96,96,0,0,0,42.86-46H72A48,48,0,0,1,72,32a8,8,0,0,1,4,1.07,79.74,79.74,0,0,1,28,28V32a8,8,0,0,1,16,0V61.07a79.74,79.74,0,0,1,28-28,8,8,0,0,1,4-1.07,48,48,0,0,1,0,96h-4.86A96.06,96.06,0,0,0,194,184a8,8,0,0,1,4,7,8.18,8.18,0,0,1-.16,1.07A111.55,111.55,0,0,0,240,128Z"/></svg>',
  OTHER: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128ZM48,100a28,28,0,1,0,28,28A28,28,0,0,0,48,100Zm160,0a28,28,0,1,0,28,28A28,28,0,0,0,208,100Z"/></svg>',
}

export function createInfraMarker(type: InfrastructureType, status: InfrastructureStatus): L.DivIcon {
  const color = INFRA_STATUS_COLORS[status]
  const icon = INFRA_TYPE_ICONS[type]
  return L.divIcon({
    html: `<div class="infra-marker" style="background:${color}">${icon}</div>`,
    className: 'infra-marker-wrapper',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}
