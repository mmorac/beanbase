import { getPopularDestinations } from './destinations';
import { DUMMY_CLIENTS } from './map/dummyClients';

describe('popular destinations', () => {
  test('builds featured city cards from the roaster catalog', () => {
    const destinations = getPopularDestinations(DUMMY_CLIENTS);

    expect(destinations.length).toBeGreaterThan(0);
    expect(destinations.some(destination => destination.city === 'Madrid')).toBe(true);
    expect(destinations.find(destination => destination.city === 'Madrid')?.roasterCount).toBeGreaterThan(1);
    expect(destinations.every(destination => destination.image.startsWith('/img/destinations/') && destination.image.endsWith('.jpg'))).toBe(true);
    expect(destinations.find(destination => destination.city === 'Madrid')?.landmark).toBe('Royal Palace');
  });
});
