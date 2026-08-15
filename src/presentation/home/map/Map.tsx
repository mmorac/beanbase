import React, { useRef, useEffect, useState } from 'react';
import './Map.css';
import { MarkerData } from './dummyClients';

interface MapProps {
  markers: MarkerData[];
  selectedTitle?: string;
}

const DEFAULT_POSITION = { lat: 40.4168, lng: -3.7038 }; // Madrid, Spain

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const createClientMarker = (
  maps: typeof google.maps,
  map: google.maps.Map,
  markerData: MarkerData,
  onSelect: (element: HTMLDivElement) => void,
  isSelected = false
) => {
  class ClientMarkerOverlay extends maps.OverlayView {
    private position: google.maps.LatLng;
    private container: HTMLDivElement;

    constructor() {
      super();
      const name = markerData.title || markerData.label || 'Client';
      this.position = new maps.LatLng(markerData.lat, markerData.lng);
      this.container = document.createElement('div');
      this.container.className = `client-marker${isSelected ? ' is-selected' : ''}`;
      this.container.title = name;
      this.container.innerHTML = `
        <div class="client-marker-pin">
          <svg class="client-marker-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M17 8h1a4 4 0 0 1 0 8h-1v1a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8h14Zm0 2v4h1a2 2 0 0 0 0-4h-1Z"/>
          </svg>
        </div>
        <div class="client-marker-name">${escapeHtml(name)}</div>
      `;
      this.container.addEventListener('click', () => onSelect(this.container));
      this.setMap(map);
    }

    onAdd() {
      this.getPanes()?.overlayMouseTarget.appendChild(this.container);
    }

    draw() {
      const point = this.getProjection()?.fromLatLngToDivPixel(this.position);
      if (!point) {
        return;
      }
      this.container.style.left = `${point.x}px`;
      this.container.style.top = `${point.y}px`;
    }

    onRemove() {
      this.container.remove();
    }
  }

  return new ClientMarkerOverlay();
};

const Map: React.FC<MapProps> = ({ markers, selectedTitle }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.OverlayView[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Load Google Maps script and initialize map
  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    function onScriptLoad() {
      if (window.google && mapRef.current) {
        if (mapInstance.current) {
          mapInstance.current = null;
        }
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: DEFAULT_POSITION,
          zoom: 13,
          zoomControl: true,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_RIGHT,
          },
          scaleControl: true,
          streetViewControl: true,
          streetViewControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP,
          },
          rotateControl: true,
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          gestureHandling: 'auto',
          draggable: true,
        });
        setIsMapReady(true);
      }
    }
    if (!window.google) {
      script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCkVU8OIaB6wmSlaT8GdVOWwwVI9E1nTPw&libraries=places`;
      script.async = true;
      script.onload = onScriptLoad;
      document.body.appendChild(script);
    } else {
      onScriptLoad();
    }
    return () => {
      if (script) {
        script.onload = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  // Update map markers when props change or the map becomes ready
  useEffect(() => {
    if (!isMapReady || !window.google || !mapInstance.current) {
      return;
    }

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    let selectedMarker: HTMLDivElement | null = null;
    const selectMarker = (element: HTMLDivElement) => {
      selectedMarker?.classList.remove('is-selected');
      selectedMarker = element;
      selectedMarker.classList.add('is-selected');
    };

    markers.forEach(markerData => {
      const name = markerData.title || markerData.label;
      const overlay = createClientMarker(
        window.google.maps,
        mapInstance.current!,
        markerData,
        selectMarker,
        Boolean(selectedTitle && name === selectedTitle)
      );
      markersRef.current.push(overlay);
    });

    const focusedMarker = selectedTitle
      ? markers.find(marker => (marker.title || marker.label) === selectedTitle)
      : undefined;

    if (focusedMarker) {
      mapInstance.current.panTo({ lat: focusedMarker.lat, lng: focusedMarker.lng });
      mapInstance.current.setZoom(15);
    } else if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
      mapInstance.current.fitBounds(bounds);
    }
  }, [markers, selectedTitle, isMapReady]);

  return <div ref={mapRef} style={{ width: '100%', height: '450px', borderRadius: '16px', boxShadow: '0 2px 8px #0001', marginTop: '40px' }} />;
};

export default Map;
