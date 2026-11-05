import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface SupplierLocation {
  id: number;
  name: string;
  category: string;
  location: string;
  products: string;
  latitude?: number;
  longitude?: number;
}

interface SupplierMapProps {
  suppliers: SupplierLocation[];
  selectedSupplier?: SupplierLocation | null;
  onSelectSupplier?: (s: SupplierLocation) => void;
}

// Default approximate coordinates for municipalities in South Cotabato & SOCCSKSARGEN
const municipalityCoords: Record<string, [number, number]> = {
  'koronadal': [6.5036, 124.8488],
  'city of koronadal': [6.5036, 124.8488],
  'polomolok': [6.2186, 125.0683],
  'tupi': [6.3314, 124.9519],
  'surallah': [6.3750, 124.7431],
  'lake sebu': [6.2239, 124.7072],
  'norala': [6.5208, 124.6736],
  'tboli': [6.2167, 124.8667],
  't\'boli': [6.2167, 124.8667],
  'banga': [6.4258, 124.7778],
  'tantangan': [6.5819, 124.8611],
  'sto. nino': [6.4528, 124.6972],
  'general santos': [6.1164, 125.1716],
  'alabel': [6.1028, 125.2894],
};

function getCoordsForLocation(loc: string): [number, number] {
  const clean = loc.toLowerCase().trim();
  for (const [key, coords] of Object.entries(municipalityCoords)) {
    if (clean.includes(key)) {
      // Add slight jitter so multiple pins in the same town don't perfectly stack
      const jitterLat = (Math.random() - 0.5) * 0.015;
      const jitterLng = (Math.random() - 0.5) * 0.015;
      return [coords[0] + jitterLat, coords[1] + jitterLng];
    }
  }
  // Default South Cotabato center
  return [6.38 + (Math.random() - 0.5) * 0.04, 124.98 + (Math.random() - 0.5) * 0.04];
}

export const SupplierMap: React.FC<SupplierMapProps> = ({
  suppliers,
  selectedSupplier,
  onSelectSupplier
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
      }).setView([6.38, 124.98], 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Custom icon for pins
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color: #4A1D8F; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; border: 2px solid #FF8A3D; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">📍</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add marker for each supplier
    suppliers.forEach((s) => {
      const coords = s.latitude && s.longitude
        ? [s.latitude, s.longitude] as [number, number]
        : getCoordsForLocation(s.location);

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; color: #2B1C33; padding: 4px;">
          <strong style="color: #4A1D8F; font-size: 14px; display: block; margin-bottom: 2px;">${s.name}</strong>
          <span style="background: #FFF0E4; color: #F26430; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${s.category}</span>
          <p style="margin: 6px 0 2px; font-weight: 600;">⌖ ${s.location}</p>
          <p style="margin: 0; color: #6F5B77; font-size: 11px;">${s.products}</p>
        </div>
      `);

      marker.on('click', () => {
        onSelectSupplier?.(s);
      });

      markersRef.current.set(s.id, marker);
    });

    return () => {
      // Clean up markers
    };
  }, [suppliers, onSelectSupplier]);

  // Focus map when selectedSupplier changes
  useEffect(() => {
    if (!selectedSupplier || !mapInstanceRef.current) return;
    const marker = markersRef.current.get(selectedSupplier.id);
    if (marker) {
      const latlng = marker.getLatLng();
      mapInstanceRef.current.setView(latlng, 12, { animate: true });
      marker.openPopup();
    }
  }, [selectedSupplier]);

  return (
    <div className="w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-[#E9D9EF] shadow-md relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '360px' }} />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#2B1C33] text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow border border-[#E9D9EF] z-[1000] pointer-events-none">
        South Cotabato & SOCCSKSARGEN
      </div>
    </div>
  );
};
