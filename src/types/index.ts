export interface WarehouseLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  utilization: number;
}

export interface Delivery {
  id: number;
  warehouse: string;
  destination: {
    lat: number;
    lng: number;
  };
  priority: 'high' | 'medium' | 'low';
  demand: number;
  cost: number;
  distance: number;
}

export interface RouteMetrics {
  averageMiles: number;
  splitShipments: number;
  pickTime: number;
  deliveryCost: number;
  transportationCost: number;
  warehouseUtilization: number;
}

export interface OptimizationMetric {
  name: string;
  value: number;
  color: string;
} 