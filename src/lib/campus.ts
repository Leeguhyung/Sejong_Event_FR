import { CAMPUS_ALLOWED_BOUNDS, SEJONG_CAMPUS_BOUNDARY, type LatLng } from '../data/campusMap'

export function isInsideCampus({ lat, lng }: LatLng, boundary: LatLng[] = SEJONG_CAMPUS_BOUNDARY) {
  let inside = false
  for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
    const a = boundary[i]
    const b = boundary[j]
    const crosses = a.lat > lat !== b.lat > lat
    if (crosses && lng < ((b.lng - a.lng) * (lat - a.lat)) / (b.lat - a.lat) + a.lng) {
      inside = !inside
    }
  }
  return inside
}

export function clampToAllowedBounds({ lat, lng }: LatLng): LatLng {
  const { sw, ne } = CAMPUS_ALLOWED_BOUNDS
  return {
    lat: Math.min(Math.max(lat, sw.lat), ne.lat),
    lng: Math.min(Math.max(lng, sw.lng), ne.lng),
  }
}

export function hasCoordinates<T extends { latitude?: number | null; longitude?: number | null }>(
  item: T,
): item is T & { latitude: number; longitude: number } {
  return typeof item.latitude === 'number' && typeof item.longitude === 'number'
}
