import React, { useState } from 'react';
import { Navigation, Compass, Layers, Maximize2, ShieldCheck, Bike } from 'lucide-react';
import { RiderDetails } from '../types';

interface LiveMapProps {
  progressPercent: number; // 0 to 100
  kitchenName: string;
  destinationAddress: string;
  rider: RiderDetails | null;
  status: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  progressPercent,
  kitchenName,
  destinationAddress,
  rider,
  status,
}) => {
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // SVG route path coordinates
  // Start: Kitchen at (120, 280)
  // Waypoint 1: (200, 240)
  // Waypoint 2: (320, 190)
  // Waypoint 3: (480, 210)
  // Waypoint 4: (620, 140)
  // End: Destination at (740, 110)
  const pathD = 'M 120,280 C 180,260 220,220 320,200 C 420,180 500,220 600,160 C 650,130 700,120 740,110';

  // Compute approximate rider position along the route
  // Map t (0..1) to polyline bezier coordinates
  const t = Math.max(0, Math.min(1, progressPercent / 100));

  // Cubic bezier approximation between start (120,280) and end (740,110)
  const riderX = 120 + (740 - 120) * t + Math.sin(t * Math.PI) * 45;
  const riderY = 280 + (110 - 280) * t - Math.sin(t * Math.PI) * 55;

  const distanceRemainingKm = Math.max(0, Number(((1 - t) * 6.8).toFixed(1)));
  const estimatedSpeedKmH = t >= 1 ? 0 : Math.round(32 + Math.sin(t * 10) * 8);

  return (
    <div className="relative w-full h-[340px] md:h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-stone-950 shadow-2xl select-none astro-glass">
      {/* Map Background Grid / Vectors */}
      <svg
        viewBox="0 0 860 380"
        className="w-full h-full transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={mapStyle === 'satellite' ? '#262626' : '#1e1e24'}
              strokeWidth="0.8"
            />
          </pattern>
        </defs>

        {/* Base Surface */}
        <rect
          width="860"
          height="380"
          fill={mapStyle === 'satellite' ? '#141416' : '#0c0c0e'}
        />
        <rect width="860" height="380" fill="url(#roadGrid)" />

        {/* Simulated Water Body / Coastline (Lagos Lagoon style) */}
        <path
          d="M 0,380 L 0,320 C 120,330 200,350 340,330 C 480,310 600,340 720,320 C 800,300 860,330 860,380 Z"
          fill={mapStyle === 'satellite' ? '#0a192f' : '#0d1520'}
          stroke="#1e293b"
          strokeWidth="1.2"
        />

        {/* City Secondary Arteries */}
        <path
          d="M 60,80 L 800,90 M 100,190 L 760,260 M 340,30 L 320,350 M 580,20 L 590,360"
          stroke={mapStyle === 'satellite' ? '#333333' : '#222228'}
          strokeWidth="3"
          strokeDasharray="4,6"
        />

        {/* Main Highway Route (Thick Underlay) */}
        <path
          d={pathD}
          fill="none"
          stroke="#262626"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#3f3f46"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Active Animated Polyline */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="8 6"
          className="animate-pulse"
        />

        {/* Traveled portion progress line */}
        <path
          d={pathD}
          fill="none"
          stroke="#10b981"
          strokeWidth="5"
          strokeDasharray="800"
          strokeDashoffset={800 * (1 - t)}
          strokeLinecap="round"
        />

        {/* 1. Origin: Onitawa's Kitchen Pin */}
        <g transform="translate(120, 280)">
          <circle r="18" fill="#f59e0b" fillOpacity="0.2" className="animate-ping" />
          <circle r="12" fill="#d97706" />
          <circle r="5" fill="#ffffff" />
          <text
            x="0"
            y="26"
            textAnchor="middle"
            fill="#fbbf24"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            Onitawa Kitchen
          </text>
        </g>

        {/* 2. Destination: Customer Doorstep Pin */}
        <g transform="translate(740, 110)">
          <circle r="18" fill="#06b6d4" fillOpacity="0.2" className="animate-ping" />
          <circle r="12" fill="#0891b2" />
          <circle r="5" fill="#ffffff" />
          <text
            x="0"
            y="-18"
            textAnchor="middle"
            fill="#67e8f9"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            Delivery Destination
          </text>
        </g>

        {/* 3. Moving Rider Bike Marker */}
        {t > 0 && (
          <g
            transform={`translate(${riderX}, ${riderY})`}
            className="transition-all duration-300"
          >
            <circle r="20" fill="#10b981" fillOpacity="0.3" className="animate-ping" />
            <circle r="14" fill="#059669" stroke="#ffffff" strokeWidth="2" />
            {/* Courier Mini Icon */}
            <path
              d="M -5,-3 L 5,-3 L 2,4 L -2,4 Z"
              fill="#ffffff"
            />
            {/* Live Tooltip above rider */}
            <g transform="translate(0, -22)">
              <rect
                x="-45"
                y="-18"
                width="90"
                height="18"
                rx="4"
                fill="#18181b"
                stroke="#3f3f46"
                strokeWidth="0.8"
              />
              <text
                x="0"
                y="-6"
                textAnchor="middle"
                fill="#34d399"
                fontSize="9"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {rider ? rider.courierName : 'Courier Rider'}
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* Top Floating Map Status Pill */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl px-3 py-2 text-xs flex items-center gap-3 shadow-md">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Bike className="w-3.5 h-3.5 animate-pulse" />
            <span>{status.toUpperCase().replace(/_/g, ' ')}</span>
          </div>
          <span className="text-stone-600">|</span>
          <div className="text-stone-300 flex items-center gap-1 font-mono">
            <span>{distanceRemainingKm} km remaining</span>
            <span className="text-stone-500">·</span>
            <span className="text-emerald-400">{estimatedSpeedKmH} km/h</span>
          </div>
        </div>

        {/* Map View Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-1 shadow-md">
          <button
            type="button"
            title="Toggle Map Grid"
            onClick={() => setMapStyle(prev => (prev === 'dark' ? 'satellite' : 'dark'))}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              mapStyle === 'satellite' ? 'bg-stone-800 text-amber-400' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Zoom In"
            onClick={() => setZoomLevel(prev => (prev === 1 ? 1.25 : 1))}
            className="p-1.5 rounded-lg text-xs text-stone-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Live Routing Details */}
      <div className="absolute bottom-3 left-3 right-3 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-stone-300 shadow-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="text-stone-500">To: </span>
            <span className="text-white font-medium">{destinationAddress || 'Customer Destination'}</span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>GPS Live Stream</span>
        </div>
      </div>
    </div>
  );
};
