import React, { useRef, useEffect } from 'react';
import './Map.css';

interface MapProps {
  lat?: number;
  lng?: number;
  placeName?: string;
}

const DEFAULT_POSITION = { lat: 40.4168, lng: -3.7038 }; // Madrid, Spain

const Map: React.FC<MapProps> = ({ lat, lng, placeName }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

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
        // Add a default marker at the center
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        markerRef.current = new window.google.maps.Marker({
          map: mapInstance.current,
          position: DEFAULT_POSITION,
        });
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

  // Update map center and marker when props change
  useEffect(() => {
    if (window.google && mapInstance.current) {
      let center = DEFAULT_POSITION;
      if (placeName) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: placeName }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            center = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            };
            mapInstance.current!.setCenter(center);
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }
            markerRef.current = new window.google.maps.Marker({
              map: mapInstance.current!,
              position: center,
            });
          }
        });
      } else if (lat && lng) {
        center = { lat, lng };
        mapInstance.current.setCenter(center);
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        markerRef.current = new window.google.maps.Marker({
          map: mapInstance.current,
          position: center,
        });
      }
    }
  }, [lat, lng, placeName]);

  return <div ref={mapRef} style={{ width: '100%', height: '450px', borderRadius: '16px', boxShadow: '0 2px 8px #0001', marginTop: '40px' }} />;
};

export default Map;
