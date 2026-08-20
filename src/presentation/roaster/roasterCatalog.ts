import {
  MarkerData,
  OriginCountry,
  ProcessingType,
  getClientName,
  getClientSlug,
} from '../home/map/dummyClients';

export interface RoasterProduct {
  id: string;
  name: string;
  description: string;
  origin: OriginCountry;
  processingType: ProcessingType;
  organic: boolean;
  weightGrams: number;
  price: number;
}

const ORIGIN_NOTES: Record<OriginCountry, string> = {
  'Costa Rica': 'bright citrus, honeyed sweetness, and a clean finish',
  Colombia: 'red fruit, caramel, and a balanced cocoa body',
  Brazil: 'roasted nuts, chocolate, and a smooth low-acid cup',
  Kenya: 'blackcurrant, grapefruit, and sparkling acidity',
  Guatemala: 'brown sugar, cocoa, and gentle floral notes',
};

const PROCESS_NOTES: Record<ProcessingType, string> = {
  Washed: 'A washed process keeps the cup crisp and transparent.',
  Natural: 'A natural process adds ripe fruit and a juicier body.',
  Honey: 'A honey process sits between clean sweetness and round texture.',
  Anaerobic: 'An anaerobic fermentation brings layered, winey complexity.',
  'Wet-hulled': 'Wet-hulled processing yields an earthy, full-bodied cup.',
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const priceFor = (seed: number, organic: boolean, weightGrams: number) => {
  const base = 11.5 + (seed % 55) / 10;
  const organicPremium = organic ? 1.75 : 0;
  const sizeMultiplier = weightGrams === 1000 ? 3.6 : 1;
  return Math.round((base + organicPremium) * sizeMultiplier * 100) / 100;
};

const createProduct = (
  client: MarkerData,
  origin: OriginCountry,
  processingType: ProcessingType,
  weightGrams: number,
  seed: number
): RoasterProduct => {
  const organic = client.organic;
  const sizeLabel = weightGrams === 1000 ? '1kg' : '250g';
  const organicLabel = organic ? ' Organic' : '';

  return {
    id: `${getClientSlug(client)}-${origin}-${processingType}-${weightGrams}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'),
    name: `${origin} ${processingType}${organicLabel} · ${sizeLabel}`,
    description: `Single-origin ${origin} coffee with ${ORIGIN_NOTES[origin]}. ${PROCESS_NOTES[processingType]}`,
    origin,
    processingType,
    organic,
    weightGrams,
    price: priceFor(seed, organic, weightGrams),
  };
};

export const getRoasterProducts = (client: MarkerData): RoasterProduct[] => {
  const seed = hashString(getClientName(client));
  const products: RoasterProduct[] = [];

  client.origins.forEach((origin, originIndex) => {
    client.processingTypes.forEach((processingType, processIndex) => {
      products.push(
        createProduct(
          client,
          origin,
          processingType,
          250,
          seed + originIndex * 17 + processIndex * 29
        )
      );
    });
  });

  if (products.length < 3 && products[0]) {
    products.push(
      createProduct(client, products[0].origin, products[0].processingType, 1000, seed + 91)
    );
  }

  return products;
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(price);
