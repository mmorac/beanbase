export interface MarkerData {
  lat: number;
  lng: number;
  label?: string;
  title?: string;
}

/** Placeholder client locations around Madrid until real data is wired in. */
export const DUMMY_CLIENTS: MarkerData[] = [
  { lat: 40.4168, lng: -3.7038, title: 'Sol Roasters' },
  { lat: 40.4267, lng: -3.7035, title: 'Malasaña Beans Co.' },
  { lat: 40.4153, lng: -3.6840, title: 'Retiro Coffee Lab' },
  { lat: 40.4089, lng: -3.7008, title: 'Lavapiés Brew House' },
  { lat: 40.4342, lng: -3.7039, title: 'Chamberí Espresso' },
  { lat: 40.4300, lng: -3.6830, title: 'Salamanca Coffee Club' },
  { lat: 40.4114, lng: -3.7086, title: 'La Latina Grounds' },
];
