'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { History } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"

interface TransitHistoryItem {
  id: string
  date: string
  parts: {
    name: string
    quantity: number
    fromWarehouse: string
    toWarehouse: string
  }[]
  status: 'completed' | 'in-transit'
}

// Sample history data - replace with your actual data source
const transitHistory: TransitHistoryItem[] = [
  {
    id: 'TR-001',
    date: '2024-03-10',
    parts: [
      {
        name: 'Brake Pads',
        quantity: 50,
        fromWarehouse: 'Warehouse 1',
        toWarehouse: 'Warehouse 2'
      },
      {
        name: 'Engine Oil',
        quantity: 100,
        fromWarehouse: 'Warehouse 1',
        toWarehouse: 'Warehouse 3'
      }
    ],
    status: 'completed'
  },
  {
    id: 'TR-002',
    date: '2024-03-11',
    parts: [
      {
        name: 'Headlights',
        quantity: 30,
        fromWarehouse: 'Warehouse 2',
        toWarehouse: 'Warehouse 4'
      }
    ],
    status: 'in-transit'
  }
]

export function TransitHistory() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Transit History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {transitHistory.map((transit) => (
              <div
                key={transit.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Transit ID: {transit.id}</h3>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(transit.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      transit.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {transit.status === 'completed' ? 'Completed' : 'In Transit'}
                  </span>
                </div>
                <div className="divide-y">
                  {transit.parts.map((part, index) => (
                    <div key={index} className="py-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{part.name}</span>
                        <span className="text-sm">Qty: {part.quantity}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex justify-between mt-1">
                        <span>From: {part.fromWarehouse}</span>
                        <span>To: {part.toWarehouse}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 