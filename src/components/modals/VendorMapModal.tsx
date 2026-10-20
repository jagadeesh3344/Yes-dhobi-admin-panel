import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Search,
  Loader2,
  Navigation,
  Crosshair,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface VendorMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  address: string;
  zone?: string;
  phone?: string;
  initialLat?: number;
  initialLng?: number;
  onSaveCoordinates?: (lat: number, lng: number) => void;
}

const AWS_LOCATION_KEY =
  'v1.public.eyJqdGkiOiIzNDgzZTFjMC01N2ZjLTRkZTYtODM0OS0xYzE4ZTRiNTIwZDcifYygLYhkH3uJ1gQKmlS63fWlZqkzwuWBrKS09slqUhs-pQTyD6lY8hmpmVwlPi3WIInOUSs8oc7hGvd_NJwLf6SlKaBh1Ci7fHCtKVWlyGVCnQzg4gNF1oc-tWI_4UO2j9Ghu-TGuII60MboUZBMSCKijerOKdWx3Q05pVF8FrhND80Kjjxl80Ezd67P9sqvVLqyE3HvSc4bvT0AWwg7wo0NM0YB7YfnIoTxpR40Kl10Y4PquQ9BT1Nk1gGWfCAnEWdkqHGNEQqZdHzlewr6bQXyuLSzKfpdHINmUmY6vusKQ9YuDMVsar7EkPs-RszYKQz54G19scq83LHvBx2KfSc.Njg1MGZlZTUtYTI2ZS00MDdlLWJjNDktMDNmZDlkNzVmMjQ0';
const AWS_REGION = 'ap-south-1';

export const VendorMapModal: React.FC<VendorMapModalProps> = ({
  isOpen,
  onClose,
  vendorName,
  address,
  zone,
  phone,
  initialLat,
  initialLng,
  onSaveCoordinates,
}) => {
  // Determine starting coordinates
  const defaultLat = 17.3850; // Hyderabad
  const defaultLng = 78.4867;

  const [currentLat, setCurrentLat] = useState<number>(initialLat || defaultLat);
  const [currentLng, setCurrentLng] = useState<number>(initialLng || defaultLng);
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Sync state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const targetLat = initialLat && !isNaN(initialLat) ? initialLat : defaultLat;
      const targetLng = initialLng && !isNaN(initialLng) ? initialLng : defaultLng;
      setCurrentLat(targetLat);
      setCurrentLng(targetLng);
      setSearchQuery(address || '');

      // If no valid coordinates were provided, try to geocode the address
      if (!initialLat || !initialLng) {
        if (address && address.trim().length > 3) {
          geocodeAddress(address);
        }
      }
    }
  }, [isOpen, initialLat, initialLng, address]);

  // Geocode address via AWS Location Service + Nominatim fallback
  const geocodeAddress = async (query: string) => {
    try {
      setIsSearching(true);
      // 1. Try AWS Location Service
      const url = `https://places.geo.${AWS_REGION}.amazonaws.com/v2/search-text?key=${AWS_LOCATION_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          QueryText: query.trim(),
          BiasPosition: [currentLng, currentLat],
          MaxResults: 1,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const first = data.ResultItems?.[0];
        if (first && first.Position) {
          const lat = first.Position[1];
          const lng = first.Position[0];
          setCurrentLat(lat);
          setCurrentLng(lng);
          if (mapInstanceRef.current && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([lat, lng]);
            mapInstanceRef.current.setView([lat, lng], 15);
          }
          return;
        }
      }

      // 2. Fallback to Nominatim
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + (zone ? `, ${zone}` : '') + ', India'
        )}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (nomRes.ok) {
        const data = await nomRes.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            setCurrentLat(lat);
            setCurrentLng(lng);
            if (mapInstanceRef.current && markerInstanceRef.current) {
              markerInstanceRef.current.setLatLng([lat, lng]);
              mapInstanceRef.current.setView([lat, lng], 15);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Geocoding fallback failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Search function for the modal search input
  const handleSearch = async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setIsSearching(true);
    try {
      // 1. Try AWS Location Places Search
      const url = `https://places.geo.${AWS_REGION}.amazonaws.com/v2/search-text?key=${AWS_LOCATION_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          QueryText: q,
          BiasPosition: [currentLng, currentLat],
          MaxResults: 5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.ResultItems) && data.ResultItems.length > 0) {
          setSearchResults(
            data.ResultItems.map((item: any) => ({
              place_id: item.PlaceId,
              title: item.Title,
              display_name: item.Address?.Label || item.Title,
              lat: item.Position[1],
              lon: item.Position[0],
            }))
          );
          setShowSearchResults(true);
          return;
        }
      }

      // 2. Fallback to Nominatim
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q + ', India'
        )}&limit=4`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (nomRes.ok) {
        const data = await nomRes.json();
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (e) {
      console.warn('Map search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    if (!isNaN(lat) && !isNaN(lng)) {
      setCurrentLat(lat);
      setCurrentLng(lng);
      setShowSearchResults(false);
      setSearchQuery(item.title || item.display_name.split(',')[0]);

      if (mapInstanceRef.current && markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 16);
      }
    }
  };

  // Leaflet map initialization
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        try {
          const map = L.map(mapContainerRef.current, {
            center: [currentLat, currentLng],
            zoom: 15,
            zoomControl: true,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          // Custom pin icon
          const customIcon = L.divIcon({
            className: 'custom-admin-marker',
            html: `
              <div style="position: relative; transform: translate(-50%, -100%);">
                <div style="background-color: #0F172A; color: white; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); white-space: nowrap; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                  <span>📍 ${vendorName || 'Vendor Shop'}</span>
                </div>
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #2563EB; border: 3px solid white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                  <div style="width: 10px; height: 10px; border-radius: 50%; background: white;"></div>
                </div>
              </div>
            `,
            iconSize: [32, 42],
            iconAnchor: [16, 42],
          });

          const marker = L.marker([currentLat, currentLng], {
            icon: customIcon,
            draggable: true,
          }).addTo(map);

          marker.on('dragend', (e: any) => {
            const pos = e.target.getLatLng();
            setCurrentLat(pos.lat);
            setCurrentLng(pos.lng);
          });

          map.on('click', (e: any) => {
            marker.setLatLng(e.latlng);
            setCurrentLat(e.latlng.lat);
            setCurrentLng(e.latlng.lng);
          });

          mapInstanceRef.current = map;
          markerInstanceRef.current = marker;

          // Force correct rendering size inside modal dialog
          setTimeout(() => {
            map.invalidateSize();
          }, 200);
        } catch (err) {
          console.error('Failed to initialize Leaflet in admin modal:', err);
        }
      } else {
        mapInstanceRef.current.setView([currentLat, currentLng], 15);
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([currentLat, currentLng]);
        }
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, currentLat, currentLng, vendorName]);

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vendor Location: ${vendorName}`}
      subtitle="Accurate shop pin location, coordinates, and navigation route"
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Maps
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Close
            </Button>
            {onSaveCoordinates && (
              <Button
                type="button"
                onClick={() => {
                  onSaveCoordinates(currentLat, currentLng);
                  onClose();
                }}
              >
                Save Pin Location
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-3.5">
        {/* Vendor info header card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{vendorName}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Live Hub
              </span>
            </div>
            <p className="text-slate-600 line-clamp-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{address || 'Address not specified'}</span>
              {zone && <span className="text-slate-400">({zone})</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={copyCoordinates}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium text-xs shadow-2xs cursor-pointer"
              title="Copy Coordinates to Clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Coords</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search bar & quick repositioning */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(searchQuery);
                }
              }}
              placeholder="Search address or landmark on map..."
              className="w-full pl-9 pr-20 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin absolute right-16" />
            )}
            <button
              type="button"
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>

          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50/70 transition-colors flex items-start gap-2 text-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-slate-800 truncate">
                      {item.display_name.split(',')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{item.display_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative w-full h-80 rounded-xl border border-slate-200 overflow-hidden shadow-inner bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Overlay Badge with Coordinates */}
          <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-md text-[11px] font-mono text-slate-700 flex items-center gap-2 z-10">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              <strong>Lat:</strong> {currentLat.toFixed(5)} | <strong>Lng:</strong>{' '}
              {currentLng.toFixed(5)}
            </span>
          </div>

          {/* Hint Overlay */}
          <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] text-white font-medium shadow-md pointer-events-none z-10">
            💡 Drag marker or click map to adjust pin
          </div>
        </div>
      </div>
    </Modal>
  );
};
