export const ORIGIN_COUNTRIES = ['Costa Rica', 'Colombia', 'Brazil', 'Kenya', 'Guatemala'] as const;
export const PROCESSING_TYPES = ['Washed', 'Natural', 'Honey', 'Anaerobic', 'Wet-hulled'] as const;
export const MIN_RADIUS_KM = 0.5;
export const MAX_RADIUS_KM = 100;
export const RADIUS_STEP_KM = 0.5;
export const DEFAULT_RADIUS_KM = 25;

export type OriginCountry = (typeof ORIGIN_COUNTRIES)[number];
export type ProcessingType = (typeof PROCESSING_TYPES)[number];

export interface MarkerData {
  lat: number;
  lng: number;
  label?: string;
  title?: string;
  city?: string;
  town?: string;
  state?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  origins: OriginCountry[];
  processingTypes: ProcessingType[];
  organic: boolean;
}

export const getClientName = (client: MarkerData) => client.title || client.label || '';

export const getClientLocationLabel = (client: MarkerData) => {
  const locality = [client.town, client.city].filter(Boolean).join(', ');
  const stateOrRegion = client.state || client.region;
  const regionPostal = [stateOrRegion, client.postalCode].filter(Boolean).join(' ');
  return [locality, regionPostal].filter(Boolean).join(', ');
};

export const matchesClientQuery = (client: MarkerData, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const compactQuery = normalized.replace(/\s+/g, '');
  const fields = [
    getClientName(client),
    client.town,
    client.city,
    client.state,
    client.region,
    client.postalCode,
    client.country,
    getClientLocationLabel(client),
  ];

  return fields.some(field => {
    if (!field) {
      return false;
    }

    const value = field.toLowerCase();
    return value.includes(normalized) || value.replace(/\s+/g, '').includes(compactQuery);
  });
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const pickSubset = <T,>(items: readonly T[], seed: number, minCount: number, maxCount: number): T[] => {
  const count = minCount + (seed % (maxCount - minCount + 1));
  const picked: T[] = [];

  for (let i = 0; i < count; i += 1) {
    picked.push(items[(seed + i * 3) % items.length]);
  }

  return Array.from(new Set(picked));
};

const withRoasterCatalog = (
  client: Omit<MarkerData, 'origins' | 'processingTypes' | 'organic'>
): MarkerData => {
  const seed = hashString(client.title || client.label || `${client.lat},${client.lng}`);

  return {
    ...client,
    origins: pickSubset(ORIGIN_COUNTRIES, seed, 1, 3),
    processingTypes: pickSubset(PROCESSING_TYPES, seed >>> 3, 1, 3),
    organic: seed % 100 < 42,
  };
};

/** Placeholder client locations until real data is wired in. */
const RAW_CLIENTS: Omit<MarkerData, 'origins' | 'processingTypes' | 'organic'>[] = [
  { lat: 40.4168, lng: -3.7038, title: 'Sol Roasters', town: 'Sol', city: 'Madrid', state: 'Community of Madrid', region: 'MD', postalCode: '28013', country: 'Spain' },
  { lat: 40.4267, lng: -3.7035, title: 'Malasaña Beans Co.', town: 'Malasaña', city: 'Madrid', state: 'Community of Madrid', region: 'MD', postalCode: '28004', country: 'Spain' },
  { lat: 40.4153, lng: -3.6840, title: 'Retiro Coffee Lab', town: 'Retiro', city: 'Madrid', state: 'Community of Madrid', region: 'MD', postalCode: '28001', country: 'Spain' },
  { lat: 40.4089, lng: -3.7008, title: 'Lavapiés Brew House', town: 'Lavapiés', city: 'Madrid', state: 'Community of Madrid', region: 'MD', postalCode: '28012', country: 'Spain' },
  { lat: 40.4342, lng: -3.7039, title: 'Chamberí Espresso', town: 'Chamberí', city: 'Madrid', state: 'Community of Madrid', region: 'MD', postalCode: '28010', country: 'Spain' },
  { lat: 40.4300, lng: -3.6830, title: 'Salamanca Coffee Club', town: 'Salamanca', city: 'Madrid', state: 'Community of Madrid', region: 'MD', postalCode: '28006', country: 'Spain' },
  { lat: 40.4114, lng: -3.7086, title: 'La Latina Grounds', town: 'La Latina', city: 'Madrid', state: 'Community of Madrid', region: 'MD', postalCode: '28005', country: 'Spain' },
  { lat: 40.7306, lng: -73.9866, title: 'East Village Pour', town: 'East Village', city: 'New York', state: 'New York', region: 'NY', postalCode: '10003', country: 'USA' },
  { lat: 40.7580, lng: -73.9855, title: 'Times Square Roast', town: 'Times Square', city: 'New York', state: 'New York', region: 'NY', postalCode: '10036', country: 'USA' },
  { lat: 42.3601, lng: -71.0589, title: 'Beacon Hill Brew', town: 'Beacon Hill', city: 'Boston', state: 'Massachusetts', region: 'MA', postalCode: '02108', country: 'USA' },
  { lat: 39.9526, lng: -75.1652, title: 'Independence Coffee Co.', town: 'Center City', city: 'Philadelphia', state: 'Pennsylvania', region: 'PA', postalCode: '19107', country: 'USA' },
  { lat: 38.9072, lng: -77.0369, title: 'Capitol Grounds', town: 'Downtown', city: 'Washington', state: 'District of Columbia', region: 'DC', postalCode: '20001', country: 'USA' },
  { lat: 25.7617, lng: -80.1918, title: 'Little Havana Café', town: 'Little Havana', city: 'Miami', state: 'Florida', region: 'FL', postalCode: '33135', country: 'USA' },
  { lat: 33.7490, lng: -84.3880, title: 'Peachtree Espresso', town: 'Downtown', city: 'Atlanta', state: 'Georgia', region: 'GA', postalCode: '30303', country: 'USA' },
  { lat: 29.9511, lng: -90.0715, title: 'French Quarter Beans', town: 'French Quarter', city: 'New Orleans', state: 'Louisiana', region: 'LA', postalCode: '70116', country: 'USA' },
  { lat: 36.1627, lng: -86.7816, title: 'Music City Mocha', town: 'The Gulch', city: 'Nashville', state: 'Tennessee', region: 'TN', postalCode: '37203', country: 'USA' },
  { lat: 30.2672, lng: -97.7431, title: 'Barton Springs Brew', town: 'South Congress', city: 'Austin', state: 'Texas', region: 'TX', postalCode: '78704', country: 'USA' },
  { lat: 29.7604, lng: -95.3698, title: 'Bayou City Roasters', town: 'Downtown', city: 'Houston', state: 'Texas', region: 'TX', postalCode: '77002', country: 'USA' },
  { lat: 32.7767, lng: -96.7970, title: 'Deep Ellum Drip', town: 'Deep Ellum', city: 'Dallas', state: 'Texas', region: 'TX', postalCode: '75226', country: 'USA' },
  { lat: 41.8781, lng: -87.6298, title: 'Loop Latte Lab', town: 'The Loop', city: 'Chicago', state: 'Illinois', region: 'IL', postalCode: '60601', country: 'USA' },
  { lat: 42.3314, lng: -83.0458, title: 'Motor City Mocha', town: 'Downtown', city: 'Detroit', state: 'Michigan', region: 'MI', postalCode: '48226', country: 'USA' },
  { lat: 44.9778, lng: -93.2650, title: 'North Loop Coffeeworks', town: 'North Loop', city: 'Minneapolis', state: 'Minnesota', region: 'MN', postalCode: '55401', country: 'USA' },
  { lat: 39.0997, lng: -94.5783, title: 'Plaza Pour House', town: 'Country Club Plaza', city: 'Kansas City', state: 'Missouri', region: 'MO', postalCode: '64112', country: 'USA' },
  { lat: 38.6270, lng: -90.1994, title: 'Gateway Grounds', town: 'Downtown', city: 'St. Louis', state: 'Missouri', region: 'MO', postalCode: '63102', country: 'USA' },
  { lat: 39.7392, lng: -104.9903, title: 'Highlands Roast', town: 'LoDo', city: 'Denver', state: 'Colorado', region: 'CO', postalCode: '80202', country: 'USA' },
  { lat: 40.7608, lng: -111.8910, title: 'Wasatch Coffee Club', town: 'Downtown', city: 'Salt Lake City', state: 'Utah', region: 'UT', postalCode: '84101', country: 'USA' },
  { lat: 33.4484, lng: -112.0740, title: 'Desert Bloom Espresso', town: 'Downtown', city: 'Phoenix', state: 'Arizona', region: 'AZ', postalCode: '85004', country: 'USA' },
  { lat: 36.1699, lng: -115.1398, title: 'Neon Bean Café', town: 'Downtown', city: 'Las Vegas', state: 'Nevada', region: 'NV', postalCode: '89101', country: 'USA' },
  { lat: 47.6062, lng: -122.3321, title: 'Pike Place Pour Over', town: 'Pike Place', city: 'Seattle', state: 'Washington', region: 'WA', postalCode: '98101', country: 'USA' },
  { lat: 45.5152, lng: -122.6784, title: 'Rose City Roasters', town: 'Downtown', city: 'Portland', state: 'Oregon', region: 'OR', postalCode: '97204', country: 'USA' },
  { lat: 37.7749, lng: -122.4194, title: 'Fog City Coffee Lab', town: 'Civic Center', city: 'San Francisco', state: 'California', region: 'CA', postalCode: '94102', country: 'USA' },
  { lat: 34.0522, lng: -118.2437, title: 'Sunset Boulevard Brew', town: 'Hollywood', city: 'Los Angeles', state: 'California', region: 'CA', postalCode: '90028', country: 'USA' },
  { lat: 32.7157, lng: -117.1611, title: 'Harbor Roast San Diego', town: 'Gaslamp Quarter', city: 'San Diego', state: 'California', region: 'CA', postalCode: '92101', country: 'USA' },
  { lat: 21.3069, lng: -157.8583, title: 'Kona Street Café', town: 'Downtown', city: 'Honolulu', state: 'Hawaii', region: 'HI', postalCode: '96813', country: 'USA' },
  { lat: 61.2181, lng: -149.9003, title: 'Anchorage Arctic Brew', town: 'Downtown', city: 'Anchorage', state: 'Alaska', region: 'AK', postalCode: '99501', country: 'USA' },
];

export const DUMMY_CLIENTS: MarkerData[] = RAW_CLIENTS.map(withRoasterCatalog);
