import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Plus, Phone } from 'lucide-react';
import { TransportRoute, Vehicle } from '@/types';
import { dbService } from '@/services/dbService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/utils/formatters';

export const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchTransport = async () => {
      const r = await dbService.getCollection<TransportRoute>('routes');
      const v = await dbService.getCollection<Vehicle>('vehicles');
      setRoutes(r);
      setVehicles(v);
    };
    fetchTransport();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transport Routes & Fleets</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage school bus lines, morning pickup stops, drop timings, and driver fleet tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routes.map((route) => (
          <Card
            key={route.id}
            title={route.routeName}
            subtitle={`Route Code: ${route.routeCode} • Monthly: ${formatCurrency(route.monthlyFee)}`}
            action={<Badge variant="success" size="sm" dot>Active Route</Badge>}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-brand-600" />
                  <span className="font-mono font-bold text-slate-900">{route.vehicleNumber}</span>
                </div>
                <span className="text-slate-500 font-medium">{route.stops.length} Designated Stops</span>
              </div>

              {/* Stops list */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Scheduled Stops & Timings</span>
                {route.stops.map((stop, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                        {stop.order}
                      </span>
                      <span className="font-medium text-slate-800">{stop.stopName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                      <span>↑ {stop.pickupTime}</span>
                      <span>•</span>
                      <span>↓ {stop.dropTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

