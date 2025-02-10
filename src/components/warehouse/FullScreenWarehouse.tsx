'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { X } from 'lucide-react'
import { Button } from '../ui/button'

interface FullScreenWarehouseProps {
  onClose: () => void
}

function Warehouse() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={0x808080} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 5, -10]}>
        <boxGeometry args={[30, 10, 0.2]} />
        <meshStandardMaterial color={0xcccccc} />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-15, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[30, 10, 0.2]} />
        <meshStandardMaterial color={0xcccccc} />
      </mesh>

      <mesh position={[15, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[30, 10, 0.2]} />
        <meshStandardMaterial color={0xcccccc} />
      </mesh>
    </>
  )
}

export default function FullScreenWarehouse({ onClose }: FullScreenWarehouseProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="absolute top-4 right-4 z-50">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <Canvas camera={{ position: [15, 15, 15], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={0.5} />
        <Warehouse />
        <OrbitControls />
      </Canvas>
    </div>
  )
} 