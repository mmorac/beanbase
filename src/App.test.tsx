import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { APP_VERSION_LABEL } from './appVersion';

test('renders the home search experience', () => {
  render(<App />);
  expect(screen.getByText(/find your next favorite cup/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/search by location or roaster/i)).toBeInTheDocument();
  expect(screen.getByText(APP_VERSION_LABEL)).toBeInTheDocument();
});
