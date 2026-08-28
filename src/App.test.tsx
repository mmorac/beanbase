import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { APP_VERSION_LABEL } from './appVersion';
import { STORAGE_KEY } from './i18n/locales';

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/');
});

test('renders the home search experience', () => {
  render(<App />);
  expect(screen.getByText(/find your next favorite cup/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/search by location or roaster/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /popular destinations/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /explore coffee roasters in madrid/i })).toBeInTheDocument();
  expect(document.querySelector('img.destination-card-photo[src="/img/destinations/madrid.jpg"]')).toBeInTheDocument();
  expect(screen.getByText(APP_VERSION_LABEL)).toBeInTheDocument();
});

test('opens a destination search from the home suggestions', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /explore coffee roasters in madrid/i }));

  expect(screen.getByRole('heading', { name: /roasters nearby/i })).toBeInTheDocument();
  expect(screen.getByDisplayValue('Madrid')).toBeInTheDocument();
});

test('switches site copy from translation files', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/language/i), { target: { value: 'es' } });

  expect(screen.getByText(/encuentra tu próxima taza favorita/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /destinos populares/i })).toBeInTheDocument();
  expect(window.localStorage.getItem(STORAGE_KEY)).toBe('es');
});
