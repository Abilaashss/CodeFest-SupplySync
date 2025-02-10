'use client'

import WarehouseDashboard from '@/components/dashboard/WarehouseDashboard'

import MapVisualizationButton from '@/components/ui/mapVisualisationButton';

// Then use it in your JSX


export default function Home() {
  return (
    <main>
      <WarehouseDashboard />
      <MapVisualizationButton />
    </main>
  )
} 