import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Map, Circle } from 'lucide-react';
import Link from 'next/link';


const MapVisualization = () => {
  const mountRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;



    const ctx = canvas.getContext('2d');
    const drawMap = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize * zoom) {
        ctx.beginPath();
        ctx.moveTo(x + offset.x % (gridSize * zoom), 0);
        ctx.lineTo(x + offset.x % (gridSize * zoom), canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize * zoom) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset.y % (gridSize * zoom));
        ctx.lineTo(canvas.width, y + offset.y % (gridSize * zoom));
        ctx.stroke();
      }

      // Draw locations and routes
      locations.forEach((location, index) => {
        const x = (location.longitude / 180) * canvas.width * 0.4 * zoom + canvas.width / 2 + offset.x;
        const y = (-location.latitude / 90) * canvas.height * 0.4 * zoom + canvas.height / 2 + offset.y;

        // Draw location marker
        ctx.beginPath();
        ctx.arc(x, y, 5 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0000';
        ctx.fill();

        // Draw route line to previous location
        if (index > 0) {
          const prevLocation = locations[index - 1];
          const prevX = (prevLocation.longitude / 180) * canvas.width * 0.4 * zoom + canvas.width / 2 + offset.x;
          const prevY = (-prevLocation.latitude / 90) * canvas.height * 0.4 * zoom + canvas.height / 2 + offset.y;

          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = '#0000ff';
          ctx.lineWidth = 2 * zoom;
          ctx.stroke();
        }

        // Draw location label
        ctx.fillStyle = '#000';
        ctx.font = `${12 * zoom}px Arial`;
        ctx.fillText(location.name, x + 10 * zoom, y);
      });
    };

    // Set canvas size
    const resizeCanvas = () => {
      const container = mountRef.current;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawMap();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse event handlers
    const handleMouseDown = (e) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        setOffset({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
        drawMap();
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const newZoom = Math.max(0.5, Math.min(5, zoom + (e.deltaY > 0 ? -0.1 : 0.1)));
      setZoom(newZoom);
      drawMap();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [locations, zoom, offset, isDragging, dragStart]);

  // Fetch location data from PositionStack
  const fetchLocation = async (query) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `http://api.positionstack.com/v1/forward?access_key=${API_KEY}&query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch location');
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const newLoc = data.data[0];
        setLocations(prev => [...prev, {
          latitude: newLoc.latitude,
          longitude: newLoc.longitude,
          name: newLoc.name
        }]);
        setNewLocation('');
      } else {
        setError('Location not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Route Visualization</h3>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocations([])}
            disabled={locations.length === 0}
          >
            Clear All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter location..."
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchLocation(newLocation)}
            />
            <Button
              onClick={() => fetchLocation(newLocation)}
              disabled={!newLocation || loading}
            >
              {loading ? 'Loading...' : 'Add Location'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div 
            ref={mountRef}
            className="w-full h-[500px] bg-gray-100 rounded-lg relative"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />
          </div>
          {locations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Route Points:</h4>
              <ul className="space-y-1">
                {locations.map((loc, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Circle className="h-4 w-4" />
                    <span>{loc.name}</span>
                    <span className="text-sm text-gray-500">
                      ({loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const MapVisualizationButton = () => {
  return (
    <Link href="/maps" passHref>
      <Button variant="outline" className="flex items-center gap-2">
        <Map className="h-6 w-6" />
        View Map Visualization
      </Button>
    </Link>
  )
}

export default MapVisualizationButton;