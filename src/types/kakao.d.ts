// 이 프로젝트에서 쓰는 Kakao Maps JS SDK 부분만 선언
declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng)
    getSouthWest(): LatLng
    getNorthEast(): LatLng
  }

  interface MapOptions {
    center: LatLng
    level?: number
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions)
    getCenter(): LatLng
    setCenter(latlng: LatLng): void
    panTo(latlng: LatLng): void
    setMinLevel(level: number): void
    setMaxLevel(level: number): void
    setCursor(style: string): void
    relayout(): void
  }

  interface PolygonOptions {
    map?: Map
    path: LatLng[] | LatLng[][]
    strokeWeight?: number
    strokeColor?: string
    strokeOpacity?: number
    fillColor?: string
    fillOpacity?: number
    zIndex?: number
  }

  class Polygon {
    constructor(options: PolygonOptions)
    setMap(map: Map | null): void
  }

  interface CustomOverlayOptions {
    map?: Map
    position: LatLng
    content: HTMLElement | string
    xAnchor?: number
    yAnchor?: number
    zIndex?: number
    clickable?: boolean
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions)
    setMap(map: Map | null): void
    setPosition(position: LatLng): void
  }

  function load(callback: () => void): void

  namespace event {
    interface MouseEvent {
      latLng: LatLng
    }
    function addListener(target: unknown, type: string, handler: (...args: never[]) => void): void
    function removeListener(target: unknown, type: string, handler: (...args: never[]) => void): void
  }
}

interface Window {
  kakao?: typeof kakao
}
