import React, { useState } from 'react';
import Map from '../map/Map';
import './SearchBar.css';

const SearchAndMap: React.FC = () => {
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [placeName, setPlaceName] = useState<string | undefined>(undefined);

  const handleSearch = (value: string) => {
    setSearch(value);
    // If value is coordinates (e.g. "40.4168,-3.7038"), parse them
    const coordMatch = value.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
    if (coordMatch) {
      setCoords({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) });
      setPlaceName(undefined);
    } else {
      setCoords({});
      setPlaceName(value);
    }
  };

  return (
    <div className="searchbar-container">
      <input
        type="text"
        className="searchbar-input"
        placeholder="Let's get some good coffee..."
        value={search}
        onChange={e => handleSearch(e.target.value)}
      />
      <div className="map-wrapper">
        <Map lat={coords.lat} lng={coords.lng} placeName={placeName} />
      </div>
    </div>
  );
};

export default SearchAndMap;
