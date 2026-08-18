/// <reference types="google.maps" />
import {
  DUMMY_CLIENTS,
  MarkerData,
  getClientName,
  matchesClientQuery,
} from '../home/map/dummyClients';
import { didGoogleMapsAuthFail, loadGoogleMaps } from './googleMaps';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SearchTarget {
  center: Coordinates;
  label: string;
  source: 'place' | 'location' | 'geocode';
}

const toRadians = (value: number) => (value * Math.PI) / 180;

export const distanceKm = (from: Coordinates, to: Coordinates) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const averageCoordinates = (points: Coordinates[]): Coordinates => {
  const total = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: total.lat / points.length,
    lng: total.lng / points.length,
  };
};

export const findClientByName = (name?: string | null) => {
  const normalized = name?.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return DUMMY_CLIENTS.find(client => getClientName(client).toLowerCase() === normalized);
};

const looksLikePostalCode = (query: string) => {
  const normalized = query.trim();
  return /^\d{4,10}(-\d{4})?$/.test(normalized) || /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(normalized);
};

export const resolveLocalSearchTarget = (query: string, place?: string | null): SearchTarget | null => {
  const selectedPlace = findClientByName(place) || (!looksLikePostalCode(query) ? findClientByName(query) : undefined);
  if (selectedPlace) {
    return {
      center: { lat: selectedPlace.lat, lng: selectedPlace.lng },
      label: getClientName(selectedPlace),
      source: 'place',
    };
  }

  const matches = DUMMY_CLIENTS.filter(client => matchesClientQuery(client, query));
  if (matches.length === 0) {
    return null;
  }

  return {
    center: averageCoordinates(matches),
    label: query.trim(),
    source: 'location',
  };
};

const geocodeWithNominatim = async (query: string): Promise<SearchTarget | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) {
      return null;
    }

    const results = (await response.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
    const first = results[0];
    if (!first?.lat || !first?.lon) {
      return null;
    }

    return {
      center: {
        lat: Number(first.lat),
        lng: Number(first.lon),
      },
      label: first.display_name || query,
      source: 'geocode',
    };
  } catch {
    return null;
  }
};

const geocodeWithGoogle = async (query: string): Promise<SearchTarget | null> => {
  try {
    await loadGoogleMaps();
    if (didGoogleMapsAuthFail() || !window.google?.maps?.Geocoder) {
      return null;
    }

    const geocoder = new window.google.maps.Geocoder();

    return await new Promise(resolve => {
      geocoder.geocode({ address: query }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        const first = results?.[0];
        if (status !== 'OK' || !first?.geometry?.location) {
          resolve(null);
          return;
        }

        resolve({
          center: {
            lat: first.geometry.location.lat(),
            lng: first.geometry.location.lng(),
          },
          label: first.formatted_address || query,
          source: 'geocode',
        });
      });
    });
  } catch {
    return null;
  }
};

export const geocodeQuery = async (query: string): Promise<SearchTarget | null> => {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  return (await geocodeWithGoogle(trimmed)) || geocodeWithNominatim(trimmed);
};

export const withDistance = (clients: MarkerData[], center: Coordinates) =>
  clients
    .map(client => ({
      ...client,
      distanceKm: distanceKm(center, client),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

export type RoasterWithDistance = MarkerData & { distanceKm: number };
