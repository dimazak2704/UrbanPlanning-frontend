import L from 'leaflet'

export function createCityMarker(name: string, projectsCount: number): L.DivIcon {
  const safeCount = Number.isFinite(projectsCount) ? Math.max(0, projectsCount) : 0
  const size = Math.max(32, Math.min(56, 28 + safeCount * 2))

  return L.divIcon({
    html: `
      <div class="city-marker">
        <div class="city-marker__square" style="width:${size}px;height:${size}px">
          <span class="city-marker__count">${safeCount}</span>
        </div>
        <div class="city-marker__label">${name}</div>
      </div>
    `,
    className: 'city-marker-wrapper',
    iconSize: [size, size + 22],
    iconAnchor: [size / 2, size / 2],
  })
}
