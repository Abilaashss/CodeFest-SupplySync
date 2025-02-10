'use client'
import React, { useState } from 'react';
import { Search, Package, TrendingUp, Truck, X, Boxes } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import type { WarehouseLocation, Delivery, RouteMetrics, OptimizationMetric } from '../../types';
import dynamic from 'next/dynamic'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "../ui/dialog"
import { TransitHistory } from './TransitHistory'
import { RouteComparison } from './RouteComparison'
import Link from 'next/link'

// Import the map component dynamically to avoid SSR issues
const RouteMap = dynamic(
  () => import('../maps/RouteMap'),
  { ssr: false }
)

// Define types for our data structures
interface FutureDemand {
  month: string;
  demand: number;
}

interface Part {
  name: string;
  currentStock: number;
  zone: string;
  currentDemand: number;
  futureDemand: FutureDemand[];
}

interface Warehouse {
  name: string;
  id: string;
  parts: Part[];
}

interface TransitPart {
  partName: string;
  warehouseId: string;
  quantity: number;
  currentStock: number;
  demand: number;
}

const WarehouseDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [open, setOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [transitParts, setTransitParts] = useState<TransitPart[]>([]);
  const [selectedTransitPart, setSelectedTransitPart] = useState<string>('');
  const [transitQuantity, setTransitQuantity] = useState<number>(0);
  const [showRouteComparison, setShowRouteComparison] = useState(false);

  // Sample data
  const warehouseData = {
    locations: [
      { id: 'WH-1', name: 'Warehouse 1', lat: 40.7128, lng: -74.0060, utilization: 78 },
      { id: 'WH-2', name: 'Warehouse 2', lat: 34.0522, lng: -118.2437, utilization: 65 },
      { id: 'WH-3', name: 'Warehouse 3', lat: 41.8781, lng: -87.6298, utilization: 72 },
      { id: 'WH-4', name: 'Warehouse 4', lat: 29.7604, lng: -95.3698, utilization: 70 }
    ],
    deliveries: [
      {
        id: 1,
        warehouse: 'WH-1',
        destination: { lat: 40.7829, lng: -73.9654 },
        priority: 'high',
        demand: 150,
        cost: 420,
        distance: 12.5
      }
    ]
  };

  const routeMetrics = {
    averageMiles: 15.2,
    splitShipments: 12,
    pickTime: 18,
    deliveryCost: 3.25,
    transportationCost: 2800,
    warehouseUtilization: 72
  };

  const optimizationMetrics = [
    { name: 'Demand Fulfillment', value: 94, color: '#8884d8' },
    { name: 'Warehouse Utilization', value: 72, color: '#82ca9d' },
    { name: 'Pick Time Efficiency', value: 88, color: '#ffc658' }
  ];

  // Sample forecast data
  const forecastData = [
    { month: 'Jan', actual: 4000, forecast: 4400 },
    { month: 'Feb', actual: 4500, forecast: 4200 },
    { month: 'Mar', actual: 5100, forecast: 4800 },
    { month: 'Apr', actual: 4800, forecast: 5000 },
    { month: 'May', actual: 5300, forecast: 5200 },
    { month: 'Jun', actual: 5800, forecast: 5600 }
  ];

  // Sample inventory data
  const inventoryData = [
    { name: 'Product A', stock: 245, reorderPoint: 100 },
    { name: 'Product B', stock: 157, reorderPoint: 150 },
    { name: 'Product C', stock: 452, reorderPoint: 200 },
    { name: 'Product D', stock: 89, reorderPoint: 120 },
    { name: 'Product E', stock: 325, reorderPoint: 180 }
  ];

  // Sample delivery metrics
  const deliveryMetrics = [
    { route: 'Route 1', efficiency: 87, deliveries: 34 },
    { route: 'Route 2', efficiency: 92, deliveries: 28 },
    { route: 'Route 3', efficiency: 78, deliveries: 45 }
  ];

  // Warehouse and parts data
  const warehouseInventory = [
    {
      name: 'Warehouse 1',
      id: 'WH-1',
      parts: [
        {
          name: 'Brake Pads',
          currentStock: 150,
          zone: 'Zone 1',
          currentDemand: 80,
          futureDemand: [
            { month: 'Mar', demand: 85 },
            { month: 'Apr', demand: 90 },
            { month: 'May', demand: 95 },
            { month: 'Jun', demand: 100 }
          ]
        },
        {
          name: 'Engine Block',
          currentStock: 45,
          zone: 'Zone 2',
          currentDemand: 20,
          futureDemand: [
            { month: 'Mar', demand: 25 },
            { month: 'Apr', demand: 30 },
            { month: 'May', demand: 28 },
            { month: 'Jun', demand: 35 }
          ]
        },
        {
          name: 'Alternator',
          currentStock: 60,
          zone: 'Zone 3',
          currentDemand: 30,
          futureDemand: [
            { month: 'Mar', demand: 35 },
            { month: 'Apr', demand: 38 },
            { month: 'May', demand: 40 },
            { month: 'Jun', demand: 45 }
          ]
        },
        {
          name: 'Radiator',
          currentStock: 40,
          zone: 'Zone 4',
          currentDemand: 25,
          futureDemand: [
            { month: 'Mar', demand: 28 },
            { month: 'Apr', demand: 32 },
            { month: 'May', demand: 35 },
            { month: 'Jun', demand: 38 }
          ]
        },
        {
          name: 'Transmission',
          currentStock: 32,
          zone: 'Zone 5',
          currentDemand: 15,
          futureDemand: [
            { month: 'Mar', demand: 18 },
            { month: 'Apr', demand: 22 },
            { month: 'May', demand: 20 },
            { month: 'Jun', demand: 25 }
          ]
        }
      ]
    },
    {
      name: 'Warehouse 2',
      id: 'WH-2',
      parts: [
        {
          name: 'Fuel Pump',
          currentStock: 85,
          zone: 'Zone 1',
          currentDemand: 45,
          futureDemand: [
            { month: 'Mar', demand: 50 },
            { month: 'Apr', demand: 55 },
            { month: 'May', demand: 58 },
            { month: 'Jun', demand: 60 }
          ]
        },
        {
          name: 'Timing Belt',
          currentStock: 120,
          zone: 'Zone 2',
          currentDemand: 40,
          futureDemand: [
            { month: 'Mar', demand: 45 },
            { month: 'Apr', demand: 48 },
            { month: 'May', demand: 50 },
            { month: 'Jun', demand: 55 }
          ]
        },
        {
          name: 'Oil Filter',
          currentStock: 200,
          zone: 'Zone 3',
          currentDemand: 100,
          futureDemand: [
            { month: 'Mar', demand: 110 },
            { month: 'Apr', demand: 115 },
            { month: 'May', demand: 120 },
            { month: 'Jun', demand: 125 }
          ]
        },
        {
          name: 'Spark Plugs',
          currentStock: 300,
          zone: 'Zone 4',
          currentDemand: 150,
          futureDemand: [
            { month: 'Mar', demand: 160 },
            { month: 'Apr', demand: 165 },
            { month: 'May', demand: 170 },
            { month: 'Jun', demand: 175 }
          ]
        },
        {
          name: 'Air Filter',
          currentStock: 175,
          zone: 'Zone 5',
          currentDemand: 80,
          futureDemand: [
            { month: 'Mar', demand: 85 },
            { month: 'Apr', demand: 90 },
            { month: 'May', demand: 95 },
            { month: 'Jun', demand: 100 }
          ]
        }
      ]
    },
    {
      name: 'Warehouse 3',
      id: 'WH-3',
      parts: [
        {
          name: 'Battery',
          currentStock: 90,
          zone: 'Zone 1',
          currentDemand: 40,
          futureDemand: [
            { month: 'Mar', demand: 45 },
            { month: 'Apr', demand: 48 },
            { month: 'May', demand: 50 },
            { month: 'Jun', demand: 55 }
          ]
        },
        {
          name: 'Starter Motor',
          currentStock: 50,
          zone: 'Zone 2',
          currentDemand: 20,
          futureDemand: [
            { month: 'Mar', demand: 25 },
            { month: 'Apr', demand: 28 },
            { month: 'May', demand: 30 },
            { month: 'Jun', demand: 35 }
          ]
        },
        {
          name: 'Shock Absorbers',
          currentStock: 80,
          zone: 'Zone 3',
          currentDemand: 35,
          futureDemand: [
            { month: 'Mar', demand: 38 },
            { month: 'Apr', demand: 40 },
            { month: 'May', demand: 45 },
            { month: 'Jun', demand: 48 }
          ]
        },
        {
          name: 'Catalytic Converter',
          currentStock: 40,
          zone: 'Zone 4',
          currentDemand: 15,
          futureDemand: [
            { month: 'Mar', demand: 18 },
            { month: 'Apr', demand: 20 },
            { month: 'May', demand: 22 },
            { month: 'Jun', demand: 25 }
          ]
        },
        {
          name: 'Oxygen Sensor',
          currentStock: 65,
          zone: 'Zone 5',
          currentDemand: 25,
          futureDemand: [
            { month: 'Mar', demand: 28 },
            { month: 'Apr', demand: 30 },
            { month: 'May', demand: 32 },
            { month: 'Jun', demand: 35 }
          ]
        }
      ]
    },
    {
      name: 'Warehouse 4',
      id: 'WH-4',
      parts: [
        {
          name: 'Clutch Kit',
          currentStock: 70,
          zone: 'Zone 1',
          currentDemand: 30,
          futureDemand: [
            { month: 'Mar', demand: 35 },
            { month: 'Apr', demand: 38 },
            { month: 'May', demand: 40 },
            { month: 'Jun', demand: 45 }
          ]
        },
        {
          name: 'Water Pump',
          currentStock: 55,
          zone: 'Zone 2',
          currentDemand: 25,
          futureDemand: [
            { month: 'Mar', demand: 28 },
            { month: 'Apr', demand: 30 },
            { month: 'May', demand: 32 },
            { month: 'Jun', demand: 35 }
          ]
        },
        {
          name: 'Thermostat',
          currentStock: 95,
          zone: 'Zone 3',
          currentDemand: 40,
          futureDemand: [
            { month: 'Mar', demand: 45 },
            { month: 'Apr', demand: 48 },
            { month: 'May', demand: 50 },
            { month: 'Jun', demand: 55 }
          ]
        },
        {
          name: 'CV Joint',
          currentStock: 60,
          zone: 'Zone 4',
          currentDemand: 25,
          futureDemand: [
            { month: 'Mar', demand: 28 },
            { month: 'Apr', demand: 30 },
            { month: 'May', demand: 32 },
            { month: 'Jun', demand: 35 }
          ]
        },
        {
          name: 'Wheel Bearing',
          currentStock: 85,
          zone: 'Zone 5',
          currentDemand: 35,
          futureDemand: [
            { month: 'Mar', demand: 38 },
            { month: 'Apr', demand: 40 },
            { month: 'May', demand: 42 },
            { month: 'Jun', demand: 45 }
          ]
        }
      ]
    }
  ];

  // Calculate total stock from all warehouses
  const totalStock = warehouseInventory.reduce((sum, warehouse) => 
    sum + warehouse.parts.reduce((partSum, part) => partSum + part.currentStock, 0), 0
  );

  // Function to get demand forecast data for charts
  const getPartDemandData = (part: Part) => {
    return part.futureDemand.map(forecast => ({
      month: forecast.month,
      demand: forecast.demand,
      stock: part.currentStock
    }));
  };

  // Find selected part across all warehouses
  const findSelectedPart = (): Part | undefined => {
    for (const warehouse of warehouseInventory) {
      const part = warehouse.parts.find(p => p.name === selectedPart);
      if (part) return part;
    }
    return undefined;
  };

  const filteredInventory = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add this dynamic import
  const WarehouseVisualization = dynamic(
    () => import('../warehouse/WarehouseVisualization'),
    { ssr: false }
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Supply Sync</h1>
        <div className="flex items-center gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[300px] justify-between">
                <span>{selectedPart || "Search parts..."}</span>
                <Search className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search parts..." />
                <CommandEmpty>No parts found.</CommandEmpty>
                <div className="max-h-[300px] overflow-y-auto">
                  {warehouseInventory.map((warehouse) => (
                    <CommandGroup key={warehouse.id} heading={warehouse.name}>
                      {warehouse.parts.map((part) => (
                        <CommandItem
                          key={`${warehouse.id}-${part.name}`}
                          onSelect={() => {
                            setSelectedPart(part.name);
                            setOpen(false);
                          }}
                        >
                          <div className="flex flex-col w-full">
                            <span className="font-medium">{part.name}</span>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Stock: {part.currentStock}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Zone: {part.zone}
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </div>
              </Command>
            </PopoverContent>
          </Popover>
          <TransitHistory />
        </div>
      </div>

      {/* Part Details */}
      {selectedPart && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPart} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                <div className="space-y-4">
                  {(() => {
                    const part = findSelectedPart();
                    if (!part) return null;
                    return (
                      <>
                        <div className="space-y-2">
                          <p>Location: Zone {part.zone}</p>
                          <p>Current Stock: {part.currentStock}</p>
                          <p>Current Demand: {part.currentDemand}</p>
                        </div>
                        
                        {/* Add to Transit Button */}
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => {
                            // Show dialog for adding to transit
                            const dialog = document.getElementById('add-transit-dialog');
                            if (dialog instanceof HTMLDialogElement) {
                              dialog.showModal();
                            }
                          }}
                        >
                          Add to Transit
                        </Button>

                        {/* Add to Transit Dialog */}
                        <Dialog>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add {part.name} to Transit</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Quantity</label>
                                <Input
                                  type="number"
                                  value={transitQuantity}
                                  onChange={(e) => setTransitQuantity(Number(e.target.value))}
                                  min={1}
                                  max={part.currentStock}
                                  className="w-full"
                                />
                                <p className="text-sm text-gray-500">
                                  Available Stock: {part.currentStock}
                                </p>
                              </div>

                              {transitQuantity > 0 && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Remaining Stock:</span>
                                    <span className={part.currentStock - transitQuantity < part.currentDemand 
                                      ? "text-red-500" 
                                      : "text-green-500"
                                    }>
                                      {part.currentStock - transitQuantity}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Current Demand:</span>
                                    <span>{part.currentDemand}</span>
                                  </div>

                                  {part.currentStock - transitQuantity < part.currentDemand && (
                                    <Button
                                      variant="outline"
                                      className="w-full mt-2"
                                      onClick={() => {
                                        const restockAmount = Math.ceil(part.currentDemand * 1.5);
                                        alert(`Restocking warehouse with ${restockAmount} units`);
                                      }}
                                    >
                                      Restock Warehouse
                                    </Button>
                                  )}

                                  <DialogClose asChild>
                                    <Button
                                      className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white"
                                      onClick={() => {
                                        const newTransitPart: TransitPart = {
                                          partName: part.name,
                                          warehouseId: warehouseInventory.find(
                                            wh => wh.parts.some(p => p.name === part.name)
                                          )?.id || '',
                                          quantity: transitQuantity,
                                          currentStock: part.currentStock,
                                          demand: part.currentDemand
                                        };
                                        setTransitParts([...transitParts, newTransitPart]);
                                        setTransitQuantity(0);
                                      }}
                                    >
                                      Add to Transit List
                                    </Button>
                                  </DialogClose>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={getPartDemandData(findSelectedPart()!)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="demand" 
                      stroke="#8884d8" 
                      name="Projected Demand"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stock" 
                      stroke="#82ca9d" 
                      name="Current Stock"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transit List and Load Truck Button */}
      {transitParts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parts Ready for Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transitParts.map((tp, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{tp.partName}</p>
                    <p className="text-sm text-gray-500">
                      From: {warehouseInventory.find(wh => wh.id === tp.warehouseId)?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {tp.quantity}</p>
                    <p className="text-sm text-gray-500">Zone: {
                      warehouseInventory
                        .find(wh => wh.id === tp.warehouseId)
                        ?.parts.find(p => p.name === tp.partName)
                        ?.zone
                    }</p>
                  </div>
                </div>
              ))}

              <Button 
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
                size="lg"
                onClick={() => {
                  setShowRouteComparison(true);
                }}
              >
                Load Truck and Optimize Route
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Stock Items */}
        <Card className="rounded-2xl shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-xl">Total Stock Items</CardTitle>
              <div className="space-y-1">
                <div className="text-5xl font-bold">{totalStock}</div>
                <p className="text-gray-500">Total parts in inventory</p>
                <div className="text-sm text-muted-foreground">
                  {warehouseInventory.length} different part types
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Accuracy */}
        <Card className="rounded-2xl shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-xl">Forecast Accuracy</CardTitle>
              <div className="space-y-1">
                <div className="text-5xl font-bold">94.2%</div>
                <p className="text-gray-500">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Routes */}
        <Card className="rounded-2xl shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Truck className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle className="text-xl">Active Routes</CardTitle>
              <div className="space-y-1">
                <div className="text-5xl font-bold">12</div>
                <p className="text-gray-500">3 pending optimization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map">Route Map</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Route Optimization Button Card */}
              <Card className="rounded-2xl shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Truck className="h-8 w-8 text-purple-500" />
                    </div>
                    <CardTitle className="text-xl">Route Optimization</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                          Open Route Map
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] w-[1200px] h-[80vh]">
                        <DialogHeader>
                          <div className="flex justify-between items-center">
                            <DialogTitle>Route Optimization Map</DialogTitle>
                            <DialogClose asChild>
                              <Button variant="ghost" size="icon">
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogHeader>
                        <div className="h-full p-4">
                          <RouteMap
                            warehouses={warehouseData.locations}
                            deliveries={warehouseData.deliveries}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Transit Management and 3D View Buttons */}
              <Card className="rounded-2xl shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Package className="h-8 w-8 text-blue-500" />
                    </div>
                    <CardTitle className="text-xl">Transit Management</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                          Add Parts to Transit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Parts to Transit</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {/* Warehouse Selection */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Select Warehouse</label>
                            <Select
                              value={selectedWarehouse}
                              onValueChange={setSelectedWarehouse}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose warehouse" />
                              </SelectTrigger>
                              <SelectContent>
                                {warehouseInventory.map((wh) => (
                                  <SelectItem key={wh.id} value={wh.id}>
                                    {wh.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Part Selection */}
                          {selectedWarehouse && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Select Part</label>
                              <Select
                                value={selectedTransitPart}
                                onValueChange={setSelectedTransitPart}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose part" />
                                </SelectTrigger>
                                <SelectContent>
                                  {warehouseInventory
                                    .find(wh => wh.id === selectedWarehouse)
                                    ?.parts.map((part) => (
                                      <SelectItem key={part.name} value={part.name}>
                                        {part.name} (Stock: {part.currentStock})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Quantity Input */}
                          {selectedTransitPart && (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Quantity</label>
                                <Input
                                  type="number"
                                  value={transitQuantity}
                                  onChange={(e) => setTransitQuantity(Number(e.target.value))}
                                  min={1}
                                  className="w-full"
                                />
                              </div>

                              {transitQuantity > 0 && (
                                <div className="space-y-2">
                                  {/* Stock Information */}
                                  <div className="flex justify-between text-sm">
                                    <span>Remaining Stock:</span>
                                    <span className={
                                      warehouseInventory
                                        .find(wh => wh.id === selectedWarehouse)
                                        ?.parts.find(p => p.name === selectedTransitPart)
                                        ?.currentStock! - transitQuantity < 
                                      warehouseInventory
                                        .find(wh => wh.id === selectedWarehouse)
                                        ?.parts.find(p => p.name === selectedTransitPart)
                                        ?.currentDemand!
                                      ? "text-red-500"
                                      : "text-green-500"
                                    }>
                                      {warehouseInventory
                                        .find(wh => wh.id === selectedWarehouse)
                                        ?.parts.find(p => p.name === selectedTransitPart)
                                        ?.currentStock! - transitQuantity}
                                    </span>
                                  </div>

                                  {/* Restock Button */}
                                  {warehouseInventory
                                    .find(wh => wh.id === selectedWarehouse)
                                    ?.parts.find(p => p.name === selectedTransitPart)
                                    ?.currentStock! - transitQuantity < 
                                  warehouseInventory
                                    .find(wh => wh.id === selectedWarehouse)
                                    ?.parts.find(p => p.name === selectedTransitPart)
                                    ?.currentDemand! && (
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                      onClick={() => {
                                        const part = warehouseInventory
                                          .find(wh => wh.id === selectedWarehouse)
                                          ?.parts.find(p => p.name === selectedTransitPart);
                                        if (part) {
                                          const restockAmount = Math.ceil(part.currentDemand * 1.5);
                                          alert(`Restocking warehouse with ${restockAmount} units`);
                                        }
                                      }}
                                    >
                                      Load Warehouse
                                    </Button>
                                  )}

                                  {/* Load Truck Button */}
                                  <DialogClose asChild>
                                    <Button
                                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                                      onClick={() => {
                                        const newTransitPart: TransitPart = {
                                          partName: selectedTransitPart,
                                          warehouseId: selectedWarehouse,
                                          quantity: transitQuantity,
                                          currentStock: warehouseInventory
                                            .find(wh => wh.id === selectedWarehouse)
                                            ?.parts.find(p => p.name === selectedTransitPart)
                                            ?.currentStock || 0,
                                          demand: warehouseInventory
                                            .find(wh => wh.id === selectedWarehouse)
                                            ?.parts.find(p => p.name === selectedTransitPart)
                                            ?.currentDemand || 0
                                        };
                                        setTransitParts([...transitParts, newTransitPart]);
                                        setTransitQuantity(0);
                                        setSelectedWarehouse('');
                                        setSelectedTransitPart('');
                                      }}
                                    >
                                      Load Truck
                                    </Button>
                                  </DialogClose>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* 3D Warehouse View Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Warehouse View</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href="/warehouse-3d" passHref>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                      <Boxes className="h-4 w-4 mr-2" />
                      Open 3D View
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Display Transit Parts if any */}
            {transitParts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Parts in Transit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transitParts.map((tp, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{tp.partName}</p>
                          <p className="text-sm text-gray-500">
                            From: {warehouseInventory.find(wh => wh.id === tp.warehouseId)?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Qty: {tp.quantity}</p>
                        </div>
                      </div>
                    ))}
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => {
                        alert(`Optimizing routes for ${transitParts.length} parts from ${new Set(transitParts.map(tp => tp.warehouseId)).size} warehouses`);
                        setTransitParts([]);
                      }}
                    >
                      Optimize Routes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Utilization Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { date: '1/1', util: 65 },
                    { date: '1/2', util: 72 },
                    { date: '1/3', util: 78 },
                    { date: '1/4', util: 74 },
                    { date: '1/5', util: 82 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="util" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Metrics</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={optimizationMetrics}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {optimizationMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {optimizationMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{metric.name}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 rounded"
                        style={{
                          width: `${metric.value}%`,
                          backgroundColor: metric.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Demand Forecasting Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecast vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#8884d8" 
                  name="Actual"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#82ca9d" 
                  name="Forecast"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredInventory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#8884d8" name="Current Stock" />
                <Bar dataKey="reorderPoint" fill="#82ca9d" name="Reorder Point" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Route Comparison Dialog */}
      <RouteComparison 
        isOpen={showRouteComparison}
        onClose={() => {
          setShowRouteComparison(false);
          console.log('Dialog closed');
        }}
        onRouteSelect={(routeId) => {
          console.log('Selected route:', routeId);
          alert(`Selected route ${routeId}. Starting delivery...`);
          setShowRouteComparison(false);
          setTransitParts([]);
        }}
        transitParts={transitParts}
      />
    </div>
  );
};

export default WarehouseDashboard; 