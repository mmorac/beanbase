import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { CartProvider } from '../cart/CartContext';
import { DUMMY_CLIENTS, getClientAddress, getClientName, getClientSlug } from '../home/map/dummyClients';
import { formatPrice, getRoasterProducts } from './roasterCatalog';
import RoasterShop from './RoasterShop';

const renderShop = (path: string, fromSearch?: string) =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: path, state: fromSearch ? { fromSearch } : undefined }]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <CartProvider>
        <Routes>
          <Route path="/roaster/:slug" element={<RoasterShop />} />
          <Route path="/search" element={<div>Search page</div>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  window.localStorage.clear();
});

test('shows the roaster name, address, products, and add to cart', () => {
  const roaster = DUMMY_CLIENTS.find(client => client.title === 'Sol Roasters');
  expect(roaster).toBeDefined();

  const products = getRoasterProducts(roaster!);
  renderShop(`/roaster/${getClientSlug(roaster!)}`);

  expect(screen.getByRole('link', { name: /return to search/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: getClientName(roaster!) })).toBeInTheDocument();
  expect(screen.getByText(getClientAddress(roaster!))).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: products[0].name })).toBeInTheDocument();
  expect(screen.getByText(formatPrice(products[0].price))).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole('button', { name: /add to cart/i })[0]);
  expect(screen.getByText(/cart · 1 item/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /1 in cart/i })).toBeInTheDocument();
});

test('returns to the previous search results', () => {
  renderShop('/roaster/sol-roasters', '?q=Madrid');

  fireEvent.click(screen.getByRole('link', { name: /return to search/i }));
  expect(screen.getByText('Search page')).toBeInTheDocument();
});
