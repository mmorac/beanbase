import {
  DUMMY_CLIENTS,
  ORIGIN_COUNTRIES,
  PROCESSING_TYPES,
  findClientBySlug,
  getClientSlug,
} from '../home/map/dummyClients';
import { distanceKm, resolveLocalSearchTarget, withDistance } from './searchUtils';

describe('search utilities', () => {
  test('assigns origin, processing, and organic data to every roaster', () => {
    expect(DUMMY_CLIENTS.length).toBeGreaterThan(0);

    DUMMY_CLIENTS.forEach(client => {
      expect(client.origins.length).toBeGreaterThan(0);
      expect(client.processingTypes.length).toBeGreaterThan(0);
      expect(client.origins.every(origin => ORIGIN_COUNTRIES.includes(origin))).toBe(true);
      expect(client.processingTypes.every(process => PROCESSING_TYPES.includes(process))).toBe(true);
      expect(typeof client.organic).toBe('boolean');
    });
  });

  test('resolves a city search to nearby dummy roasters', () => {
    const target = resolveLocalSearchTarget('Madrid');

    expect(target).not.toBeNull();
    expect(target?.label).toContain('Madrid');

    const nearby = withDistance(DUMMY_CLIENTS, target!.center).filter(client => client.distanceKm <= 25);
    expect(nearby.some(client => client.title === 'Sol Roasters')).toBe(true);
    expect(nearby.every(client => client.city === 'Madrid')).toBe(true);
  });

  test('calculates a short distance between nearby Madrid roasters', () => {
    const sol = DUMMY_CLIENTS.find(client => client.title === 'Sol Roasters');
    const malasana = DUMMY_CLIENTS.find(client => client.title === 'Malasaña Beans Co.');

    expect(sol).toBeDefined();
    expect(malasana).toBeDefined();
    expect(distanceKm(sol!, malasana!)).toBeLessThan(5);
  });

  test('a tight radius can exclude nearby roasters', () => {
    const sol = DUMMY_CLIENTS.find(client => client.title === 'Sol Roasters');
    expect(sol).toBeDefined();

    const nearby = withDistance(DUMMY_CLIENTS, sol!).filter(client => client.distanceKm <= 0.5);
    expect(nearby.some(client => client.title === 'Sol Roasters')).toBe(true);
    expect(nearby.some(client => client.title === 'Malasaña Beans Co.')).toBe(false);
  });

  test('keeps a zip code search as a location query', () => {
    const target = resolveLocalSearchTarget('28013');

    expect(target).not.toBeNull();
    expect(target?.label).toBe('28013');
    expect(target?.source).toBe('location');
    expect(target?.center).toEqual({ lat: 40.4168, lng: -3.7038 });
  });

  test('resolves accented roaster names to unique slugs', () => {
    const slugs = DUMMY_CLIENTS.map(client => getClientSlug(client));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(getClientSlug('Malasaña Beans Co.')).toBe('malasana-beans-co');
    expect(findClientBySlug('malasana-beans-co')?.title).toBe('Malasaña Beans Co.');
  });
});
