'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Clock, DollarSign, Route, Truck, Leaf, Package } from 'lucide-react'

interface RouteOption {
  id: string
  truckId: string
  capacity: number
  currentLoad: number
  deliveryTime: string
  timeInMinutes: number
  cost: number
  distance: number
  efficiency: number
  dailyDeliveries: number
}

interface RouteComparisonProps {
  isOpen: boolean
  onClose: () => void
  onRouteSelect: (routeId: string) => void
  transitParts: any[]
}

export function RouteComparison({ isOpen, onClose, onRouteSelect, transitParts }: RouteComparisonProps) {
  const routeOptions: RouteOption[] = [
    {
      id: 'Route 1',
      truckId: 'Truck A',
      capacity: 1000,
      currentLoad: 0,
      deliveryTime: '2h 15m',
      timeInMinutes: 135,
      cost: 245.50,
      distance: 42.5,
      efficiency: 87,
      dailyDeliveries: 34
    },
    {
      id: 'Route 2',
      truckId: 'Truck B',
      capacity: 1050,
      currentLoad: 0,
      deliveryTime: '1h 45m',
      timeInMinutes: 105,
      cost: 312.75,
      distance: 38.2,
      efficiency: 92,
      dailyDeliveries: 28
    },
    {
      id: 'Route 3',
      truckId: 'Truck C',
      capacity: 1100,
      currentLoad: 0,
      deliveryTime: '2h 30m',
      timeInMinutes: 150,
      cost: 198.25,
      distance: 45.8,
      efficiency: 78,
      dailyDeliveries: 45
    }
  ];

  // Calculate the best routes based on different criteria
  const getBestRoutes = () => {
    const costEfficient = [...routeOptions].sort((a, b) => a.cost - b.cost)[0];
    const timeEfficient = [...routeOptions].sort((a, b) => a.timeInMinutes - b.timeInMinutes)[0];
    const ecoFriendly = [...routeOptions].sort((a, b) => a.distance - b.distance)[0];
    
    // Calculate an overall score for each route (lower is better)
    const getOverallScore = (route: RouteOption) => {
      const costWeight = 0.4;
      const timeWeight = 0.3;
      const ecoWeight = 0.2;
      const distanceWeight = 0.1;

      const normalizedCost = route.cost / Math.max(...routeOptions.map(r => r.cost));
      const normalizedTime = route.timeInMinutes / Math.max(...routeOptions.map(r => r.timeInMinutes));
      const normalizedEco = route.distance / Math.max(...routeOptions.map(r => r.distance));

      return (
        costWeight * normalizedCost +
        timeWeight * normalizedTime +
        ecoWeight * normalizedEco
      );
    };

    const recommended = [...routeOptions].sort((a, b) => getOverallScore(a) - getOverallScore(b))[0];

    return {
      costEfficient,
      timeEfficient,
      ecoFriendly,
      recommended
    };
  };

  const bestRoutes = getBestRoutes();

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Route Optimization Options</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Transit Summary</h3>
            <div className="text-sm text-gray-600">
              <p>Total Parts: {transitParts.length}</p>
              <p>Warehouses: {new Set(transitParts.map(tp => tp.warehouseId)).size}</p>
            </div>
          </div>

          {/* Route Classification Summary */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Route Classifications</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Recommended Route: {bestRoutes.recommended.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>Fastest Route: {bestRoutes.timeEfficient.id}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                  <span>Most Cost-Effective: {bestRoutes.costEfficient.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  <span>Most Eco-Friendly: {bestRoutes.ecoFriendly.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {routeOptions.map((route) => (
              <Card 
                key={route.id}
                className={`p-4 cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => onRouteSelect(route.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{route.id}</h3>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    <span className="font-medium">{route.truckId}</span>
                  </div>
                </div>

                {/* Truck Capacity */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Capacity</span>
                    <span>{route.capacity} units</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(route.currentLoad / route.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Efficiency</span>
                    <span className="text-green-600">{route.efficiency}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${route.efficiency}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Time
                    </div>
                    <div className="font-medium">{route.deliveryTime}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Cost
                    </div>
                    <div className="font-medium">${route.cost.toFixed(2)}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-1" />
                      Deliveries
                    </div>
                    <div className="font-medium">{route.dailyDeliveries}/day</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      Distance
                    </div>
                    <div className="font-medium">{route.distance} km</div>
                  </div>
                </div>

                <Button 
                  className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => onRouteSelect(route.id)}
                >
                  Select Route
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 