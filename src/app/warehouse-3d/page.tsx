'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { WarehouseVisualization } from '@/components/3d/WarehouseVisualization'

export default function Warehouse3DPage() {
  return (
    <div className="relative w-screen h-screen">
      <div className="header-container">
        <div id="info">Warehouse Optimization Simulator</div>
        <Link href="/" passHref>
          <Button 
            variant="outline"
            className="bg-white hover:bg-gray-100 w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <WarehouseVisualization />
    </div>
  )
} 