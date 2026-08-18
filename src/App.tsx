import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import VersionBadge from './presentation/common/VersionBadge';
import HomeSearch from './presentation/home/searchbar/HomeSearch';
import SearchAndMap from './presentation/home/searchbar/SearchAndMap';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeSearch />} />
          <Route path="/search" element={<SearchAndMap />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <VersionBadge />
      </div>
    </BrowserRouter>
  );
}

export default App;
