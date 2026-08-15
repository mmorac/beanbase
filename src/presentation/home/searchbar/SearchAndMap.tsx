import React, { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import Map from '../map/Map';
import {
  DUMMY_CLIENTS,
  MarkerData,
  getClientLocationLabel,
  getClientName,
  matchesClientQuery,
} from '../map/dummyClients';
import './SearchBar.css';

const SearchAndMap: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [selectedTitle, setSelectedTitle] = useState<string | undefined>();
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return DUMMY_CLIENTS.filter(client => matchesClientQuery(client, query));
  }, [search]);

  const visibleMarkers = search.trim() ? suggestions : DUMMY_CLIENTS;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectClient = (client: MarkerData) => {
    const name = getClientName(client);
    setSearch(name);
    setSelectedTitle(name);
    setIsSuggestionsOpen(false);
    setActiveSuggestion(0);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSelectedTitle(undefined);
    setActiveSuggestion(0);
    setIsSuggestionsOpen(value.trim().length > 0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen || suggestions.length === 0) {
      if (event.key === 'Escape') {
        setIsSuggestionsOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestion(index => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestion(index => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      selectClient(suggestions[activeSuggestion]);
    } else if (event.key === 'Escape') {
      setIsSuggestionsOpen(false);
    }
  };

  return (
    <div className="searchbar-container">
      <div className="searchbar-panel">
      <img src="/img/BeanBaseLogo.jpg" alt="BeanBase logo" className="logo-image" style={{ display: 'block' }} />
      <p className="brand-subtitle">Find your next favorite cup</p>

      <div className="searchbar-wrap" ref={searchWrapRef}>
        <input
          type="text"
          className="searchbar-input"
          placeholder="Search by name, city, state, or postal code..."
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          onFocus={() => search.trim() && setIsSuggestionsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isSuggestionsOpen}
          aria-controls="client-suggestions"
          aria-autocomplete="list"
        />
        {isSuggestionsOpen && (
          <ul id="client-suggestions" className="searchbar-suggestions" role="listbox">
            {suggestions.length > 0 ? (
              suggestions.map((client, index) => {
                const name = getClientName(client);
                const location = getClientLocationLabel(client);
                return (
                  <li key={`${name}-${index}`}>
                    <button
                      type="button"
                      className={`searchbar-suggestion${index === activeSuggestion ? ' is-active' : ''}`}
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => selectClient(client)}
                      role="option"
                      aria-selected={index === activeSuggestion}
                    >
                      <span className="searchbar-suggestion-name">{name}</span>
                      {location && (
                        <span className="searchbar-suggestion-location">{location}</span>
                      )}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="searchbar-suggestion-empty">No matching clients</li>
            )}
          </ul>
        )}
      </div>
      <div className="map-wrapper">
        <Map markers={visibleMarkers} selectedTitle={selectedTitle} />
      </div>
      </div>
    </div>
  );
};

export default SearchAndMap;
