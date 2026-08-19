/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { didGoogleMapsAuthFail, loadGoogleMaps, onGoogleMapsAuthFailure } from '../../search/googleMaps';
import './Map.css';
import { MarkerData } from './dummyClients';

interface MapProps {
  markers: MarkerData[];
  selectedTitle?: string;
  height?: string;
  className?: string;
  center?: { lat: number; lng: number };
  onMarkerSelect?: (title: string) => void;
}

const DEFAULT_POSITION = { lat: 40.4168, lng: -3.7038 };

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const markerMarkup = (name: string) => `
  <div class="client-marker-pin">
    <svg class="client-marker-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M17 8h1a4 4 0 0 1 0 8h-1v1a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8h14Zm0 2v4h1a2 2 0 0 0 0-4h-1Z"/>
    </svg>
  </div>
  <div class="client-marker-name">${escapeHtml(name)}</div>
`;

const createLeafletIcon = (name: string, isSelected = false) =>
  L.divIcon({
    className: `client-marker${isSelected ? ' is-selected' : ''}`,
    html: markerMarkup(name),
    iconSize: [140, 58],
    iconAnchor: [70, 32],
  });

const createGoogleMarker = (
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
      const name = markerData.title || markerData.label || 'Roaster';
      this.position = new maps.LatLng(markerData.lat, markerData.lng);
      this.container = document.createElement('div');
      this.container.className = `client-marker is-google${isSelected ? ' is-selected' : ''}`;
      this.container.title = name;
      this.container.innerHTML = markerMarkup(name);
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

const Map: React.FC<MapProps> = ({
  markers,
  selectedTitle,
  height = '450px',
  className,
  center,
  onMarkerSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<google.maps.Map | null>(null);
  const googleOverlays = useRef<google.maps.OverlayView[]>([]);
  const leafletMap = useRef<L.Map | null>(null);
  const leafletLayer = useRef<L.LayerGroup | null>(null);
  const [engine, setEngine] = useState<'google' | 'leaflet' | null>(null);

  useEffect(() => {
    const mapNode = mapRef.current;
    let cancelled = false;
    let unsubscribeAuth: (() => void) | undefined;

    const containerHasGoogleTiles = () => Boolean(mapNode?.querySelector('.gm-style'));

    const startLeaflet = () => {
      if (cancelled || !mapNode || leafletMap.current) {
        return;
      }

      googleOverlays.current.forEach(overlay => overlay.setMap(null));
      googleOverlays.current = [];
      googleMap.current = null;
      mapNode.innerHTML = '';

      const map = L.map(mapNode, {
        center: [center?.lat ?? DEFAULT_POSITION.lat, center?.lng ?? DEFAULT_POSITION.lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      leafletLayer.current = L.layerGroup().addTo(map);
      leafletMap.current = map;
      setEngine('leaflet');

      const invalidate = () => map.invalidateSize();
      window.requestAnimationFrame(invalidate);
      window.setTimeout(invalidate, 150);
      window.setTimeout(invalidate, 400);
    };

    const startGoogle = () => {
      if (cancelled || !mapNode || !window.google?.maps?.Map || googleMap.current || didGoogleMapsAuthFail()) {
        return false;
      }

      try {
        googleMap.current = new window.google.maps.Map(mapNode, {
          center: center ?? DEFAULT_POSITION,
          zoom: 13,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
          ],
        });
        setEngine('google');
        window.google.maps.event.addListenerOnce(googleMap.current, 'idle', () => {
          if (googleMap.current && window.google?.maps) {
            window.google.maps.event.trigger(googleMap.current, 'resize');
          }
        });
        window.setTimeout(() => {
          if (!cancelled && !leafletMap.current && !containerHasGoogleTiles()) {
            startLeaflet();
          }
        }, 1800);
        return true;
      } catch {
        googleMap.current = null;
        return false;
      }
    };

    unsubscribeAuth = onGoogleMapsAuthFailure(() => {
      if (cancelled) {
        return;
      }
      startLeaflet();
    });

    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled && !leafletMap.current && !containerHasGoogleTiles()) {
        startLeaflet();
      }
    }, 2500);

    loadGoogleMaps()
      .then(() => {
        if (cancelled || didGoogleMapsAuthFail() || !startGoogle()) {
          startLeaflet();
        }
      })
      .catch(() => {
        startLeaflet();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      unsubscribeAuth?.();
      googleOverlays.current.forEach(overlay => overlay.setMap(null));
      googleOverlays.current = [];
      googleMap.current = null;
      leafletMap.current?.remove();
      leafletMap.current = null;
      leafletLayer.current = null;
      if (mapNode) {
        mapNode.innerHTML = '';
      }
    };
    // Initialize once; later center/marker updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (engine === 'google' && googleMap.current && window.google?.maps) {
      googleOverlays.current.forEach(overlay => overlay.setMap(null));
      googleOverlays.current = [];

      let selectedMarker: HTMLDivElement | null = null;
      const selectMarker = (element: HTMLDivElement, title?: string) => {
        selectedMarker?.classList.remove('is-selected');
        selectedMarker = element;
        selectedMarker.classList.add('is-selected');
        if (title) {
          onMarkerSelect?.(title);
        }
      };

      markers.forEach(markerData => {
        const name = markerData.title || markerData.label;
        const overlay = createGoogleMarker(
          window.google.maps,
          googleMap.current!,
          markerData,
          element => selectMarker(element, name),
          Boolean(selectedTitle && name === selectedTitle)
        );
        googleOverlays.current.push(overlay);
      });

      const focusedMarker = selectedTitle
        ? markers.find(marker => (marker.title || marker.label) === selectedTitle)
        : undefined;

      if (focusedMarker) {
        googleMap.current.panTo({ lat: focusedMarker.lat, lng: focusedMarker.lng });
        googleMap.current.setZoom(15);
        return;
      }

      if (markers.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
        googleMap.current.fitBounds(bounds, 28);
        return;
      }

      if (markers.length === 1) {
        googleMap.current.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
        googleMap.current.setZoom(14);
        return;
      }

      if (center) {
        googleMap.current.setCenter(center);
        googleMap.current.setZoom(13);
      }
      return;
    }

    const map = leafletMap.current;
    const layer = leafletLayer.current;
    if (engine !== 'leaflet' || !map || !layer) {
      return;
    }

    layer.clearLayers();

    markers.forEach(markerData => {
      const name = markerData.title || markerData.label || 'Roaster';
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: createLeafletIcon(name, Boolean(selectedTitle && name === selectedTitle)),
        title: name,
      });

      marker.on('click', () => onMarkerSelect?.(name));
      marker.addTo(layer);
    });

    const focusedMarker = selectedTitle
      ? markers.find(marker => (marker.title || marker.label) === selectedTitle)
      : undefined;

    if (focusedMarker) {
      map.setView([focusedMarker.lat, focusedMarker.lng], Math.max(map.getZoom(), 15), { animate: true });
      return;
    }

    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map(marker => [marker.lat, marker.lng] as L.LatLngTuple));
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
      return;
    }

    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 14);
      return;
    }

    if (center) {
      map.setView([center.lat, center.lng], 13);
    }

    map.invalidateSize();
  }, [center, engine, markers, onMarkerSelect, selectedTitle]);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) {
      return undefined;
    }

    const refreshSize = () => {
      if (googleMap.current && window.google?.maps) {
        window.google.maps.event.trigger(googleMap.current, 'resize');
        return;
      }

      leafletMap.current?.invalidateSize();
    };

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(refreshSize);
    observer?.observe(node);
    window.addEventListener('resize', refreshSize);
    window.setTimeout(refreshSize, 80);
    window.setTimeout(refreshSize, 320);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', refreshSize);
    };
  }, [engine]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{
        width: '100%',
        height: className ? undefined : height,
        borderRadius: '16px',
        boxShadow: className ? undefined : '0 2px 8px #0001',
      }}
    />
  );
};

export default Map;
