import { DUMMY_CLIENTS, MarkerData, getClientName } from './map/dummyClients';

export interface Destination {
  city: string;
  country: string;
  roasterCount: number;
  sampleRoaster: string;
  accent: string;
  image: string;
  landmark: string;
}

const FEATURED_CITIES = [
  'Madrid',
  'New York',
  'San Francisco',
  'Seattle',
  'Chicago',
  'Los Angeles',
  'Miami',
  'Boston',
  'Austin',
  'Portland',
  'Denver',
  'Honolulu',
] as const;

const CITY_ACCENTS: Record<string, string> = {
  Madrid: '#c45c26',
  'New York': '#3d5a80',
  'San Francisco': '#7a431c',
  Seattle: '#2f6f4e',
  Chicago: '#5c3317',
  'Los Angeles': '#b4532a',
  Miami: '#c47a3a',
  Boston: '#8b5a2b',
  Austin: '#9a3412',
  Portland: '#3f6212',
  Denver: '#92400e',
  Honolulu: '#0f766e',
};

const CITY_LANDMARKS: Record<string, { image: string; landmark: string }> = {
  Madrid: { image: '/img/destinations/madrid.jpg', landmark: 'Royal Palace' },
  'New York': { image: '/img/destinations/new-york.jpg', landmark: 'Statue of Liberty' },
  'San Francisco': { image: '/img/destinations/san-francisco.jpg', landmark: 'Golden Gate Bridge' },
  Seattle: { image: '/img/destinations/seattle.jpg', landmark: 'Space Needle' },
  Chicago: { image: '/img/destinations/chicago.jpg', landmark: 'Willis Tower' },
  'Los Angeles': { image: '/img/destinations/los-angeles.jpg', landmark: 'Hollywood Sign' },
  Miami: { image: '/img/destinations/miami.jpg', landmark: 'South Beach' },
  Boston: { image: '/img/destinations/boston.jpg', landmark: 'Massachusetts State House' },
  Austin: { image: '/img/destinations/austin.jpg', landmark: 'Texas State Capitol' },
  Portland: { image: '/img/destinations/portland.jpg', landmark: 'St. Johns Bridge' },
  Denver: { image: '/img/destinations/denver.jpg', landmark: 'Rocky Mountains' },
  Honolulu: { image: '/img/destinations/honolulu.jpg', landmark: 'Diamond Head' },
};

const groupRoastersByCity = (clients: MarkerData[]) => {
  const grouped = new Map<string, MarkerData[]>();

  clients.forEach(client => {
    if (!client.city) {
      return;
    }

    const current = grouped.get(client.city) || [];
    current.push(client);
    grouped.set(client.city, current);
  });

  return grouped;
};

export const getPopularDestinations = (clients: MarkerData[] = DUMMY_CLIENTS): Destination[] => {
  const grouped = groupRoastersByCity(clients);

  return FEATURED_CITIES.flatMap(city => {
    const roasters = grouped.get(city);
    if (!roasters?.length) {
      return [];
    }

    const landmark = CITY_LANDMARKS[city];

    return [
      {
        city,
        country: roasters[0].country || '',
        roasterCount: roasters.length,
        sampleRoaster: getClientName(roasters[0]),
        accent: CITY_ACCENTS[city] || '#5c3317',
        image: landmark?.image || '',
        landmark: landmark?.landmark || city,
      },
    ];
  });
};
