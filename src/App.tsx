import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { CartProvider } from './presentation/cart/CartContext';
import VersionBadge from './presentation/common/VersionBadge';
import HomeSearch from './presentation/home/searchbar/HomeSearch';
import SearchAndMap from './presentation/home/searchbar/SearchAndMap';
import RoasterShop from './presentation/roaster/RoasterShop';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CartProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomeSearch />} />
            <Route path="/search" element={<SearchAndMap />} />
            <Route path="/roaster/:slug" element={<RoasterShop />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <VersionBadge />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
