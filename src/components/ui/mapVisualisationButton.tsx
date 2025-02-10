// components/ui/MapVisualizationButton.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';

const MapVisualizationButton = () => {
  return (
    <Link href="/maps">
      <Button variant="outline" className="flex items-center gap-2">
        <Map className="h-6 w-6" />
        View Map Visualization
      </Button>
    </Link>
  );
};

export default MapVisualizationButton;
