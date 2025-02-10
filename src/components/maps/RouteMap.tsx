'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default markers
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

interface RouteMapProps {
  warehouses: Array<{
    id: string
    name: string
    lat: number
    lng: number
    utilization: number
  }>
  deliveries: Array<{
    id: number
    warehouse: string
    destination: {
      lat: number
      lng: number
    }
    priority: string
    distance: number
  }>
}

export default function RouteMap({ warehouses, deliveries }: RouteMapProps) {
  useEffect(() => {
    // Fix for marker icons in production
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/marker-icon-2x.png',
      iconUrl: '/marker-icon.png',
      shadowUrl: '/marker-shadow.png',
    })
  }, [])

  // Calculate map bounds
  const points = [
    ...warehouses.map(w => [w.lat, w.lng]),
    ...deliveries.map(d => [d.destination.lat, d.destination.lng])
  ]
  const bounds = L.latLngBounds(points as [number, number][])

  return (
    <MapContainer
      bounds={bounds}
      className="h-[400px] w-full rounded-lg"
      zoom={13}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Warehouse Markers */}
      {warehouses.map((warehouse) => (
        <Marker
          key={warehouse.id}
          position={[warehouse.lat, warehouse.lng]}
          icon={icon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{warehouse.name}</h3>
              <p>Utilization: {warehouse.utilization}%</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Delivery Routes */}
      {deliveries.map((delivery) => {
        const warehouse = warehouses.find(w => w.id === delivery.warehouse)
        if (!warehouse) return null

        const routePoints: [number, number][] = [
          [warehouse.lat, warehouse.lng],
          [delivery.destination.lat, delivery.destination.lng]
        ]

        return (
          <div key={delivery.id}>
            <Marker
              position={[delivery.destination.lat, delivery.destination.lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">Delivery #{delivery.id}</h3>
                  <p>Priority: {delivery.priority}</p>
                  <p>Distance: {delivery.distance}km</p>
                </div>
              </Popup>
            </Marker>
            <Polyline
              positions={routePoints}
              color={delivery.priority === 'high' ? 'red' : 'blue'}
              weight={2}
              opacity={0.8}
            />
          </div>
        )
      })}
    </MapContainer>
  )
} 