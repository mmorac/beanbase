import { DUMMY_CLIENTS } from '../home/map/dummyClients';
import { getRoasterProducts } from './roasterCatalog';

describe('roaster catalog', () => {
  test('builds products from each roaster origin and processing type', () => {
    const roaster = DUMMY_CLIENTS.find(client => client.title === 'Sol Roasters');
    expect(roaster).toBeDefined();

    const products = getRoasterProducts(roaster!);
    expect(products.length).toBeGreaterThan(0);

    products.forEach(product => {
      expect(roaster!.origins).toContain(product.origin);
      expect(roaster!.processingTypes).toContain(product.processingType);
      expect(product.organic).toBe(roaster!.organic);
      expect(product.price).toBeGreaterThan(0);
      expect(product.name).toContain(product.origin);
      expect(product.name).toContain(product.processingType);
    });

    roaster!.origins.forEach(origin => {
      expect(products.some(product => product.origin === origin)).toBe(true);
    });
    roaster!.processingTypes.forEach(process => {
      expect(products.some(product => product.processingType === process)).toBe(true);
    });
  });
});
