import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SearchAndMap from './SearchAndMap';

jest.mock('../map/Map', () => ({
  __esModule: true,
  default: () => <div className="results-map" data-testid="results-map" />,
}));

const renderSearch = (path = '/search?q=Madrid') =>
  render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/search" element={<SearchAndMap />} />
      </Routes>
    </MemoryRouter>
  );

test('renders the results map and a mobile filter toggle', () => {
  renderSearch();

  expect(screen.getByTestId('results-map')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /show filters/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /roasters nearby/i })).toBeInTheDocument();
});
