'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { Boxes } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

const WarehouseVisualization = () => {
  return (
    <Link href="/warehouse-3d" className="block">
      <Card className="rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Boxes className="h-8 w-8 text-indigo-500" />
            </div>
            <CardTitle className="text-xl">Warehouse View</CardTitle>
            <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
              Open 3D View
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default WarehouseVisualization 